import json
import datetime
import os
import logging
from . import db, socketio

# Setup Logger
logger = logging.getLogger(__name__)
logging.basicConfig(level=logging.INFO)

def run_pipeline_job(app, pipeline_id):
    """
    This function is triggered by the Scheduler.
    It runs inside the Flask Application Context.
    """
    with app.app_context():
        # Import inside function to prevent circular imports
        from .models import Pipeline, PipelineRun, Notification, User
        from .pipeline_engine import PipelineEngine

        logger.info(f"⏰ Scheduler: Waking up for Pipeline #{pipeline_id} at {datetime.datetime.now()}")

        pipeline = Pipeline.query.get(pipeline_id)
        if not pipeline:
            logger.error(f"❌ Pipeline #{pipeline_id} not found (might have been deleted).")
            return

        # 1. Create Run Record
        run_record = PipelineRun(
            pipeline_id=pipeline_id,
            status='Running',
            start_time=datetime.datetime.utcnow(),
            logs=json.dumps(["Scheduled Run Started automatically."])
        )
        pipeline.status = 'Running'
        db.session.add(run_record)
        db.session.commit()

        try:
            # 2. Prepare Engine
            base_dir = os.path.abspath(os.path.dirname(__file__))
            
            # Parse Flow Data
            flow_data = json.loads(pipeline.structure)
            nodes = flow_data if isinstance(flow_data, list) else flow_data.get('nodes', [])
            edges = flow_data.get('edges', []) if isinstance(flow_data, dict) else []

            logger.info(f"🚀 Executing Pipeline: {pipeline.name} ({len(nodes)} nodes)")

            # 3. Run Engine
            engine = PipelineEngine(
                nodes=nodes,
                edges=edges,
                user=pipeline.owner,
                base_dir=base_dir,
                db_session=db.session,
                pipeline_id=pipeline_id
            )
            
            logs = engine.run()

            # --- AUTO-CLEANUP FOR ONE-OFF JOBS ---
            # If this was a specific date schedule, remove it from DB now that it's done.
            if pipeline.schedule and pipeline.schedule.startswith('date:'):
                pipeline.schedule = None
                logger.info(f"✅ One-time job for Pipeline #{pipeline_id} completed. Schedule cleared.")
            # -------------------------------------

            # 4. Success Handling
            run_record.status = 'Success'
            run_record.logs = json.dumps(logs)
            pipeline.status = 'Ready'
            
            # Notification
            if pipeline.owner.notify_on_success:
                msg = f"Scheduled Run: '{pipeline.name}' completed successfully."
                notif = Notification(user_id=pipeline.owner.id, message=msg, type='success')
                db.session.add(notif)
                try:
                    socketio.emit('notification', {'type': 'success', 'message': msg}, room=f"user_{pipeline.owner.id}")
                except: pass

        except Exception as e:
            # 5. Failure Handling
            logger.error(f"💥 Scheduler Failed: {str(e)}")
            run_record.status = 'Failed'
            run_record.logs = json.dumps([f"Critical Scheduler Error: {str(e)}"])
            pipeline.status = 'Ready'
            
            if pipeline.owner.notify_on_failure:
                msg = f"Scheduled Run: '{pipeline.name}' failed."
                notif = Notification(user_id=pipeline.owner.id, message=msg, type='error')
                db.session.add(notif)
                try:
                    socketio.emit('notification', {'type': 'error', 'message': msg}, room=f"user_{pipeline.owner.id}")
                except: pass

        # 6. Finish Up
        run_record.end_time = datetime.datetime.utcnow()
        db.session.commit()
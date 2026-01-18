from app import create_app, socketio, db
from flask_apscheduler import APScheduler
import sys

app = create_app()

# Initialize Scheduler
scheduler = APScheduler()
scheduler.init_app(app)
scheduler.start()

def run_scheduled_job(pipeline_id):
    """
    Function called by APScheduler.
    Needs to be outside routes.py to avoid circular imports, 
    or imported carefully.
    """
    with app.app_context():
        print(f"Executing scheduled pipeline: {pipeline_id}")
        # Logic to trigger pipeline execution would go here
        # For simplicity, we can just print for now or import the engine
        from app.models import Pipeline, User, PipelineRun
        from app.pipeline_engine import PipelineEngine
        import datetime
        import json
        import os

        pipeline = Pipeline.query.get(pipeline_id)
        if not pipeline: return

        # Create Run Record
        run_record = PipelineRun(pipeline_id=pipeline_id, status='Running', start_time=datetime.datetime.utcnow(), logs=json.dumps(["Scheduled Run Started"]))
        db.session.add(run_record)
        db.session.commit()

        try:
            base_dir = os.path.abspath(os.path.dirname(__file__))
            # Fake a user context or use pipeline owner
            engine = PipelineEngine(
                nodes=json.loads(pipeline.structure),
                edges=[], # Edges are inside structure usually, need to parse if separate
                user=pipeline.owner,
                base_dir=base_dir,
                db_session=db.session,
                pipeline_id=pipeline_id
            )
            logs = engine.run()
            run_record.status = 'Success'
            run_record.logs = json.dumps(logs)
        except Exception as e:
            run_record.status = 'Failed'
            run_record.logs = json.dumps([str(e)])
        
        run_record.end_time = datetime.datetime.utcnow()
        db.session.commit()

if __name__ == '__main__':
    # Use socketio.run instead of app.run for WebSocket support
    socketio.run(app, debug=True, port=5000)
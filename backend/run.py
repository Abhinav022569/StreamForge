import os
from app import create_app, db, socketio
from app.models import Pipeline, User, PipelineRun
from app.pipeline_engine import PipelineEngine
from flask_apscheduler import APScheduler
import json
import datetime

app = create_app()

# --- SCHEDULER SETUP ---
scheduler = APScheduler()
scheduler.init_app(app)
scheduler.start()

# THIS IS THE FUNCTION THAT RUNS IN THE BACKGROUND
def run_scheduled_job(pipeline_id):
    with app.app_context():
        print(f"⏰ Starting Scheduled Run for Pipeline ID: {pipeline_id}")
        
        try:
            # 1. Fetch Pipeline Logic
            pipeline = Pipeline.query.get(pipeline_id)
            if not pipeline or not pipeline.structure:
                print("Pipeline not found or empty.")
                return

            # 2. Prepare Data
            user = User.query.get(pipeline.user_id)
            flow_data = json.loads(pipeline.structure)
            
            # 3. Create Run Record
            run_record = PipelineRun(
                pipeline_id=pipeline.id,
                status='Running',
                start_time=datetime.datetime.utcnow(),
                logs=json.dumps(["Started by Scheduler"])
            )
            db.session.add(run_record)
            db.session.commit()

            # 4. Execute Engine
            base_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), 'app'))
            engine = PipelineEngine(
                nodes=flow_data.get('nodes', []),
                edges=flow_data.get('edges', []),
                user=user,
                base_dir=base_dir,
                db_session=db.session
            )
            
            logs = engine.run()

            # 5. Success
            run_record.status = 'Success'
            run_record.end_time = datetime.datetime.utcnow()
            run_record.logs = json.dumps(logs)
            db.session.commit()
            print(f"✅ Scheduled Job {pipeline_id} Finished.")

        except Exception as e:
            # 6. Failure
            print(f"❌ Scheduled Job Failed: {e}")
            if run_record:
                run_record.status = 'Failed'
                run_record.end_time = datetime.datetime.utcnow()
                run_record.logs = json.dumps([f"Scheduler Error: {str(e)}"])
                db.session.commit()

# --- END SCHEDULER SETUP ---

if __name__ == '__main__':
    # Ensure uploads/processed folders exist
    # ... your existing directory creation code ...
    socketio.run(app, debug=True, use_reloader=False) # use_reloader=False prevents double scheduler init
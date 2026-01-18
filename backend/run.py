from app import create_app, socketio

app = create_app()

if __name__ == '__main__':
    # REMOVED: scheduler.init_app(app)  <-- This line caused the crash
    # REMOVED: scheduler.start()        <-- Already started in create_app()
    
    # use_reloader=False prevents double execution of scheduled jobs
    socketio.run(app, debug=True, port=5000, use_reloader=False)
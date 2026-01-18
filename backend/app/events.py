from flask import request
from flask_socketio import emit, join_room, leave_room
from . import socketio, db
from .models import Pipeline

@socketio.on('connect')
def handle_connect():
    print(f"Client connected: {request.sid}")

@socketio.on('disconnect')
def handle_disconnect():
    print(f"Client disconnected: {request.sid}")

@socketio.on('join_pipeline')
def on_join(data):
    """
    Join a room specific to a pipeline ID for collaboration.
    """
    pipeline_id = data.get('pipeline_id')
    if pipeline_id:
        room = f"pipeline_{pipeline_id}"
        join_room(room)
        print(f"Client {request.sid} joined room: {room}")
        emit('user_joined', {'message': f"User joined pipeline {pipeline_id}"}, room=room)

@socketio.on('leave_pipeline')
def on_leave(data):
    pipeline_id = data.get('pipeline_id')
    if pipeline_id:
        room = f"pipeline_{pipeline_id}"
        leave_room(room)
        print(f"Client {request.sid} left room: {room}")

@socketio.on('pipeline_update')
def handle_pipeline_update(data):
    """
    Broadcast node/edge changes to everyone else in the pipeline room.
    """
    pipeline_id = data.get('pipelineId')
    if pipeline_id:
        room = f"pipeline_{pipeline_id}"
        # Broadcast to everyone in room EXCEPT sender
        emit('pipeline_updated', data, room=room, include_self=False)

@socketio.on('cursor_move')
def handle_cursor_move(data):
    """
    Broadcast mouse cursor positions for collaboration.
    """
    pipeline_id = data.get('pipelineId')
    if pipeline_id:
        room = f"pipeline_{pipeline_id}"
        emit('cursor_moved', data, room=room, include_self=False)

# --- NEW: Notification System Handlers ---

@socketio.on('join_notifications')
def on_join_notifications(data):
    """
    User joins their private notification room.
    Frontend sends: { userId: 1 }
    """
    user_id = data.get('userId')
    if user_id:
        room = f"user_{user_id}"
        join_room(room)
        print(f"User {user_id} joined notification room: {room}")
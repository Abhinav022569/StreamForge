from flask import request
from flask_socketio import emit, join_room, leave_room
from . import socketio

@socketio.on('join')
def on_join(data):
    """User joins a pipeline room"""
    room = data['pipeline_id']
    join_room(room)
    # print(f"User joined room: {room}")

@socketio.on('leave')
def on_leave(data):
    """User leaves a pipeline room"""
    room = data['pipeline_id']
    leave_room(room)

@socketio.on('pipeline_update')
def handle_pipeline_update(data):
    """
    Receive update from one client and broadcast it to others.
    """
    room = data['pipeline_id']
    emit('pipeline_updated', data, room=room, include_self=False)

# --- NEW: CURSOR EVENTS ---

@socketio.on('cursor_move')
def handle_cursor_move(data):
    """
    Broadcast mouse movement.
    data: { pipeline_id, userId, userName, x, y, color }
    """
    room = data['pipeline_id']
    emit('cursor_moved', data, room=room, include_self=False)

@socketio.on('disconnect')
def on_disconnect():
    """
    Optional: Notify others that a user disconnected so we can remove their cursor.
    Note: 'request.sid' is the socket ID.
    """
    # In a real app, you might map socket_id to user_id to clean up specific cursors.
    # For now, clients will handle cleanup if they stop receiving updates.
    pass
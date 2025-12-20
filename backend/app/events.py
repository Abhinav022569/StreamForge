from flask_socketio import emit, join_room, leave_room
from . import socketio

@socketio.on('join')
def on_join(data):
    """User joins a pipeline room"""
    room = data['pipeline_id']
    join_room(room)
    print(f"User joined room: {room}")

@socketio.on('leave')
def on_leave(data):
    """User leaves a pipeline room"""
    room = data['pipeline_id']
    leave_room(room)

@socketio.on('pipeline_update')
def handle_pipeline_update(data):
    """
    Receive update from one client and broadcast it to others in the room.
    data includes:
      - pipeline_id
      - type: 'node_change' | 'edge_change' | 'connection'
      - changes: The payload from ReactFlow
    """
    room = data['pipeline_id']
    # broadcast=True sends to everyone, include_self=False skips the sender
    emit('pipeline_updated', data, room=room, include_self=False)
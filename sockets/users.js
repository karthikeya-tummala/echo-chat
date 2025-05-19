import logger from "../logging.js";

const GLOBAL_ROOM = 'global_room';

export default function userHandlers(io, socket) {
  try {
    socket.join(GLOBAL_ROOM);
    
    socket.to(GLOBAL_ROOM).emit(
      'user:joined',
      `${socket.id} joined the room: ${GLOBAL_ROOM}`
    );
    
  } catch (err) {
    logger.error(`Error joining socket ${socket.id} to ${GLOBAL_ROOM}: ${err.message}`);
  }
  
  socket.on('disconnect', () => {
    socket.to(GLOBAL_ROOM).emit('user:left', `${socket.id} left the chat`);
  });
};
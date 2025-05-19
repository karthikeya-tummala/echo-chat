const GLOBAL_ROOM = 'global_room';

export default function chatHandlers(io, socket) {
  
  // Send message to global chat
  socket.on('chat:globalMessage', (message) => {
    const payload = {
      sender: socket.id,
      message: message,
      timeStamp: Date.now()
    }
    
    socket.to(GLOBAL_ROOM).emit('chat:newGlobalMessage', payload);
    
  });
  
}
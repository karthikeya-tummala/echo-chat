import roomCodeGenerator from '../utils/roomCodeGenerator.js';
import validateRoomName from "../validators/roomValidator.js";
import validateMessage from "../validators/messageValidator.js";
import Message from '../models/Message.js';
import logger from '../logging.js';

export default function roomHandler(io, socket) {
  
  const roomValidationHelper = (roomName) => {
    const validationError = validateRoomName({ roomName });
    if (validationError) {
      socket.emit('room:failed', validationError);
      return false;
    }
    return true;
  };
  
  socket.on('room:create', () => {
    const roomName = roomCodeGenerator(io);
    socket.join(roomName);
    socket.emit('room:created', `You joined a new room with the name ${roomName}`);
  });

  socket.on('room:join', async ({ roomName }) => {
    if (!roomName || typeof roomName !== 'string') {
      socket.emit('room:failed', 'Invalid payload');
      return;
    }
    roomName = roomName.toUpperCase();
    if (!roomValidationHelper(roomName)) return;

    const room = io.sockets.adapter.rooms.get(roomName);
    if (!room) {
      socket.emit('room:failed', 'Room doesn\'t exist');
      return;
    }

    if (socket.rooms.has(roomName)) {
      socket.emit('room:failed', 'You are already in the room');
      return;
    }

    try {
      socket.join(roomName);
      const recentMessages = (await Message.find({ room: roomName })
        .sort({ timestamp: -1 })
        .limit(50));

      socket.emit('room:joined', `You joined the room ${roomName}`);
      socket.emit('room:history', recentMessages);

      socket.to(roomName).emit('room:userJoined', `${socket.id} joined the room ${roomName}`);
    } catch (err) {
      logger.error('Failed during room join', { error: err, room: roomName, user: socket.id });
      socket.emit('room:failed', 'Failed to join room properly.');
    }

  });

  socket.on('room:message', async (data) => {
    if (!data || typeof data !== 'object') {
      socket.emit('room:failed', 'Invalid payload');
      return;
    }
    
    let { roomName, message } = data;
    
    if (!roomName || !message) {
      socket.emit('room:failed', 'Missing required fields: roomName or message');
      return;
    }

    roomName = roomName.toUpperCase();
    if (!roomValidationHelper(roomName)) return;

    if (!socket.rooms.has(roomName)) {
      socket.emit('room:failed', `You must join the room ${roomName} before sending messages.`);
      return;
    }

    message = message.trim();
    const messageError = validateMessage({ message });
    if (messageError) {
      socket.emit('room:messageError', messageError);
      return;
    }

    const payload = {
      room: roomName,
      message,
      sender: socket.id,
      timestamp: Date.now()
    };

    try {
      const newMessage = new Message({
        room: roomName,
        sender: socket.id,
        message
      });
      await newMessage.save();
      io.to(roomName).emit('room:newMessage', payload);
    } catch (err) {
      logger.error('Failed to save chat message', { error: err, room: roomName, user: socket.id });
      socket.emit('room:failed', 'Failed to send message. Try again.');
    }
  });

  socket.on('room:leave', ({ roomName }) => {
    if (!roomName || typeof roomName !== 'string') {
      socket.emit('room:failed', 'Invalid payload');
      return;
    }
    
    roomName = roomName.toUpperCase();
    if (!roomValidationHelper(roomName)) return;

    if (!socket.rooms.has(roomName)) {
      socket.emit('room:failed', `You aren’t in the room ${roomName}`);
      return;
    }

    socket.leave(roomName);
    socket.emit('room:left', `You left the room ${roomName}`);
    socket.to(roomName).emit('room:userLeft', `${socket.id} left the room`);
  });

}

import userHandlers from "./users.js";
import chatHandlers from './chat.js';
import roomHandler from "./rooms.js";

export default function setupSockets(io) {
  io.on('connection', (socket) => {
    userHandlers(io, socket);
    chatHandlers(io, socket);
    roomHandler(io, socket);
  });
}
export default function generateRoomCode(io, length = 6){
  const chars = 'QWERTYUIOPASDFGHJKLZXCVBNM';
  let code;
  do {
    code = Array.from({ length }, () =>
      chars.charAt(Math.floor(Math.random() * chars.length))
    ).join('');
  } while (io.sockets.adapter.rooms.has(code));
  
  return code;
}
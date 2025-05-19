import { createServer } from "http";
import { Server } from "socket.io";
import app from "./app.js";
import setupSockets from "./sockets/index.js";
import connectDB from "./db.js";

const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: ["http://localhost:3001"]
  }
});

await connectDB();
setupSockets(io);

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log('Chat server started on port:', PORT);
});
const http = require("http");
const { Server } = require("socket.io");
const app = require("./app");
const timetableSocket = require("./socket/timetable.socket");

const PORT = 4000;

const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: "*" }
});

io.on("connection", (socket) => {
  timetableSocket(io, socket);
});

server.listen(PORT, () => {
  console.log(`✅ Server running at http://localhost:${PORT}`);
});

const { Server } = require('socket.io');

let io;
const onlineUsers = {};

function initSocket(server) {
  io = new Server(server, {
    cors: { origin: '*' }
  });

  io.on('connection', (socket) => {
    // User joins with their userId
    socket.on('register', (userId) => {
      onlineUsers[userId] = socket.id;
    });
    socket.on('disconnect', () => {
      for (const [uid, sid] of Object.entries(onlineUsers)) {
        if (sid === socket.id) delete onlineUsers[uid];
      }
    });
  });
}

function notifyUser(userId, event, data) {
  if (io && onlineUsers[userId]) {
    io.to(onlineUsers[userId]).emit(event, data);
  }
}

module.exports = { initSocket, notifyUser };

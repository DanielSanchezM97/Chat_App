const path = require("path");
const http = require("http");
const express = require("express");
const socketio = require("socket.io");
const formatMessage = require("./utils/messages");
const {
  userJoin,
  getCurrentUser,
  userLeave,
  getRoomUsers,
} = require("./utils/users");

const app = express();
const server = http.createServer(app); // create a server
const io = socketio(server); // create a socket

// ! Set static folder
app.use(express.static(path.join(__dirname, "public")));

const admin = "Admin";

// ! Run when a client connects
io.on("connection", (socket) => {
  socket.on("joinRoom", ({ username, room }) => {
    const user = userJoin(socket.id, username, room);

    socket.join(user.room);

    // ? send a message to the client
    socket.emit("message", formatMessage(admin, "Welcome to the chat app"));

    // ? Broadcast when a user connects
    // ! Broadcast to all clients except the one that connected
    socket.broadcast
      .to(user.room)
      .emit(
        "message",
        formatMessage(admin, `${user.username} has joined the chat`)
      );

    // ! Send users and room info
    io.to(user.room).emit("roomUsers", {
      room: user.room,
      users: getRoomUsers(user.room),
    });
  });

  // ? all the clients in general
  // ? io.emit() -> sends to all clients

  // ! Listen for a chatMessage
  socket.on("chatMessage", (msg) => {
    const user = getCurrentUser(socket.id);

    io.to(user.room).emit("message", formatMessage(user.username, msg));
  });

  // ! Runs when a client disconnects
  socket.on("disconnect", () => {
    const user = userLeave(socket.id);

    if (user) {
      io.to(user.room).emit(
        "message",
        formatMessage(admin, `${user.username} has left the chat`)
      );

      // ! Send users and room info
      io.to(user.room).emit("roomUsers", {
        room: user.room,
        users: getRoomUsers(user.room),
      });
    }
  });
});

// ? path is the route __dirname is the current directory

const port = 3000 || process.env.PORT; // ? process.env.PORT is the port that the server is running on
// ? if is in production mode then use the port that heroku is using

server.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});

require("dotenv").config();
const express = require("express");
const app = express();
const server = require("http").createServer(app);
const io = require("socket.io")(server);
const ACTIONS = require("./socket/actions");
const cors = require("cors");
const allowedOrigins = require("./config/allowedOrigins");
const cookieParser = require("cookie-parser");

io.on("connection", (socket) => {
  socket.on("username", (username) => {
    socket.username = username;
  });
  const getClientRooms = () => {
    const { rooms } = io.sockets.adapter;

    return Array.from(rooms.keys()).filter((roomID) => roomID.length < 20);
  };

  const shareRoomsInfo = () => {
    io.emit(ACTIONS.SHARE_ROOMS, {
      rooms: getClientRooms(),
    });
  };

  const leaveRoom = () => {
    const { rooms } = socket;
    // get all rooms that this socket is in

    Array.from(rooms).forEach((room) => {
      const clients = Array.from(io.sockets.adapter.rooms.get(room) || []);
      // get clients that are in the room (rooms) where the client was

      clients.forEach((client) => {
        io.to(client).emit(ACTIONS.REMOVE_PEER, {
          peerID: socket.id,
          peerUsername: socket.username,
        });
        // other clients remove id of a client that wants to leave

        socket.emit(ACTIONS.REMOVE_PEER, {
          peerID: client,
          peerUsername: io.sockets.sockets.get(client).username,
        });
        // client that wants to leave removes ids of all other clients
      });
      socket.leave(room);
    });
    shareRoomsInfo();
  };

  function joinRoom(socket) {
    return (config) => {
      const { room: roomID, username } = config;
      const { rooms: joinedRooms } = socket;
      // new client (socket) tries to connect to a room (config)
      if (Array.from(joinedRooms).includes(roomID)) {
        return console.warn(`already joined to ${roomID}`);
      }

      const clients = Array.from(io.sockets.adapter.rooms.get(roomID) || []);

      // clients that are already in a room
      clients.forEach((clientID) => {
        console.log("joining");
        io.to(clientID).emit(ACTIONS.ADD_PEER, {
          peerID: socket.id,
          peerUsername: username,
          createOffer: false,
        });
        // server sends to all old clients the id of a new client (socket.id)
        // and that they do not have to create an offer
        socket.emit(ACTIONS.ADD_PEER, {
          peerID: clientID,
          peerUsername: io.sockets.sockets.get(clientID).username, // (other) client username
          createOffer: true,
        });
        // new client sends offer to all other old clients
      });
      socket.join(roomID);
      shareRoomsInfo();
    };
  }

  function sendIce(socket) {
    return ({ peerID, iceCandidate }) => {
      io.to(peerID).emit(ACTIONS.ICE_CANDIDATE, {
        peerID: socket.id,
        iceCandidate,
      });
    };
  }

  function sendSDP(socket) {
    return ({ peerID, sessionDescription }) => {
      io.to(peerID).emit(ACTIONS.SESSION_DESCRIPTION, {
        peerID: socket.id,
        peerUsername: socket.username,
        sessionDescription,
      });
    };
  }
  shareRoomsInfo();

  socket.on(ACTIONS.JOIN, joinRoom(socket));

  socket.on(ACTIONS.LEAVE, leaveRoom);
  socket.on("disconnecting", leaveRoom);

  socket.on(ACTIONS.OFFER_SDP, sendSDP(socket));

  socket.on(ACTIONS.OFFER_ICE, sendIce(socket));
});

app.use(
  cors({
    origin: allowedOrigins,
    credentials: true,
  })
);

app.use(express.urlencoded({ extended: true }));

app.use(express.json());

app.use(cookieParser());

app.use("/guest", require("./routes/guest"));
app.use("/client", require("./routes/client"));
app.use("/logout", require("./routes/logout"));
app.use("/refresh", require("./routes/refresh"));
app.use("/room", require("./routes/room"));
app.use("/message", require("./routes/message"));
app.use("/invitation", require("./routes/invitation"));
app.use("/event", require("./routes/event"));

server.listen(process.env.PORT || 3001, () => {
  console.log("server started");
});

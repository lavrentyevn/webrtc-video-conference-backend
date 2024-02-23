# WebRTC Video Conference

This is the backend part of a full-stack project - WebRTC Video Conference.

It is an **ExpressJS** server, that uses **Socket.IO** for connecting peers (users).

The server also includes **JWT authentication**, sending emails for verification and **PostgreSQL** database connectivity.

## WebRTC

WebRTC is a technology that allows you to connect two or more users without sending their data to the server. The server is needed for signaling at the start of a video conference. Once clients are connected **no data** gets sent to the server.

<img width="1792" alt="Screenshot 2024-02-23 at 16 32 58" src="https://github.com/lavrentyevn/webrtc-video-conference-backend/assets/111048277/0330471d-a638-4a12-a83a-7f16e44428a0">

WebRTC handshake consists of the following steps

- First user creates a Peer Connection with a list of ICE Servers (they are used to translate NAT into real IP address and vice versa), sets it as his local descriptor, Creates Offer and send his ICE data.
- Second user also creates a Peer Connection with a list of Ice Servers and sets it as his local descriptor. Then he sets Offer as his remote descriptor and adds ICE data as a canditate. Finally he creates an Answer and sends his ICE data.
- First user adds ICE data as a candidate and sets Answer as his remote descriptor.

## Socket io

Socket io is a library that enables real-time, bi-directional communication between clients and servers. In this project it helps to connect users via WebRTC handshake that was explained earlier. This are actions that socket io uses to emit data in this application.

```

const ACTIONS = {
  JOIN: "join",
  LEAVE: "leave",
  SHARE_ROOMS: "share-rooms",
  ADD_PEER: "add-peer",
  REMOVE_PEER: "remove-peer",
  OFFER_SDP: "offer-sdp",
  OFFER_ICE: "offer-ice",
  ICE_CANDIDATE: "ice-candidate",
  SESSION_DESCRIPTION: "session-descriptions",
};

```

For example, this a method that sends ICE data.

```

function sendIce(socket) {
    return ({ peerID, iceCandidate }) => {
      io.to(peerID).emit(ACTIONS.ICE_CANDIDATE, {
        peerID: socket.id,
        iceCandidate,
      });
    };
  }

socket.on(ACTIONS.OFFER_ICE, sendIce(socket));

```

## JWT authentication

In order to use a video conferencing site you have to create an account. It can be either a **client** (requires username and password) or a **guest** (requires only email verification, lasts for 30 minutes) account. 

You can send a JSON object consisting of a username and a password to a non-protected API, which will check if there is already a user with such a username in a database and, if not, save your data and send a 200 status message.

<img width="775" alt="Снимок экрана 2023-11-13 в 12 05 12" src="https://github.com/lavrentyevn/authbackend/assets/111048277/bb559b5b-98e3-4134-a1d6-03df035e64ff">

It is important to note that passwords are **not** stored in a decoded state. Any password is stored as a **hash**, which can be obtained by a password hashing algorithm, such as **bcrypt**.

<img width="543" alt="Снимок экрана 2023-11-13 в 12 47 03" src="https://github.com/lavrentyevn/authbackend/assets/111048277/f35767ed-8796-462b-9947-07dc757277e1">

List of API:
- POST ("/guest", {email}) creating guest
- PUT ("/guest/verify?token=") login guest

- POST ("/client", {email, username, password}) creating client
- POST ("/client/login", {username, password}) login client
- PUT ("/client/verify?token=") verify client

- PUT ("/logout") logout client || guest

- GET ("/refresh") refresh client || guest

- POST ("/room", {name, password, creator}) creating room
- POST ("/room/access", {name, password}) accessing room
- POST ("/room/check", {username}) check rooms

- POST ("/message", {roomname, email, message}) logging message

- POST ("/invitation", {email: [], room}) create invitation
- POST ("/invitation/check", {email, room}) check invitation

- POST ("/event", {room}) create event
- POST ("/event/log", {email, name, move}) log event

## Email verification

Clients and guests have to verify their accounts. Nodemailer is used to send messages with a verifying URL.

<img width="790" alt="Screenshot 2024-02-23 at 17 03 22" src="https://github.com/lavrentyevn/webrtc-video-conference-backend/assets/111048277/cb3b54db-873f-41ea-8631-621e2580cf68">

## PostgreSQL 

This is the diagram that represents all tables in the database.

<img width="803" alt="Screenshot 2024-02-23 at 17 05 09" src="https://github.com/lavrentyevn/webrtc-video-conference-backend/assets/111048277/351cbb6b-2e5a-4dc9-a4d9-5827620a1448">

As you can see messages that are send in rooms are stored in a database, as well as email verification. Users can be invited to rooms, which means that they don't have to insert a password when trying to access it. Rooms can also be *Event Rooms*; such rooms are accessible only through invitations.

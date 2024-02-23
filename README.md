list of api:
POST ("/guest", {email}) creating guest
PUT ("/guest/verify?token=") login guest

POST ("/client", {email, username, password}) creating client
POST ("/client/login", {username, password}) login client
PUT ("/client/verify?token=") verify client

PUT ("/logout") logout client || guest

GET ("/refresh") refresh client || guest

POST ("/room", {name, password, creator}) creating room
POST ("/room/access", {name, password}) accessing room
POST ("/room/check", {username}) check rooms

POST ("/message", {roomname, email, message}) logging message

POST ("/invitation", {email: [], room}) create invitation
POST ("/invitation/check", {email, room}) check invitation

POST ("/event", {room}) create event
POST ("/event/log", {email, name, move}) log event

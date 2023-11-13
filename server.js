require("dotenv").config();
const express = require("express");
const app = express();
const server = require("http").createServer(app);
const cors = require("cors");
const allowedOrigins = require("./config/allowedOrigins");
const verifyJwt = require("./middleware/verifyJWT");
const cookieParser = require("cookie-parser");
const mongoose = require("mongoose");
const connectDB = require("./config/dbConn");

connectDB();

app.use(
  cors({
    origin: allowedOrigins,
    credentials: true,
  })
);

app.use(express.json());

app.use(cookieParser());

app.use("/register", require("./routes/register"));
app.use("/login", require("./routes/login"));
app.use("/refresh", require("./routes/refresh"));
app.use("/logout", require("./routes/logout"));

app.use(verifyJwt);
app.use("/users", require("./routes/api/users"));

mongoose.connection.once("open", () => {
  console.log("connected to mongodb");
  server.listen(process.env.PORT || 3001, () => {
    console.log("server started");
  });
});

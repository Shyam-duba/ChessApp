const express = require("express");
const { Server } = require("socket.io");
const cors = require("cors");
require("dotenv").config();
const connectDB = require("./config/db");
const authRoutes = require("./routes/AuthRoutes");
const http = require("http");

const app = express();
const server = http.createServer(app);
connectDB();
const port = process.env.PORT || 8080;

// Initialize Socket.IO
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});

app.use(express.json());
app.use(cors());
app.use("/api/auth", authRoutes);

// Pass `io` to socketRoutes
require("./routes/SocketRoutes")(io);

server.listen(port, () => {
  console.log(`listening on *:${port}`);
});

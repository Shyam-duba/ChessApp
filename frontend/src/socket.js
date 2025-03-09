import { io } from "socket.io-client"; // import connection function

const socket = io('localhost:5000'); // initialize websocket connection

export default socket;
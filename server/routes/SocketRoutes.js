
// SocketRoutes.js
const { v4: uuidv4 } = require('uuid');

module.exports = function(io) {
  // Store for active users and their socket connections
  const users = {};
  
  // Queue for matchmaking
  let waitingPlayers = [];
  
  // Active game rooms
  const rooms = {};

  io.on('connection', (socket) => {
    console.log(`Socket connected: ${socket.id}`);
    
    // Set username
    socket.on('joinRoom', ({ roomId, username }, callback) => {
        const user = users[socket.id];
      
        if (!user) {
          callback({ success: false, message: 'Please set a username first' });
          return;
        }
      
        if (rooms[roomId]) {
          // Room exists, join it
          socket.join(roomId);
          rooms[roomId].players.push(socket.id);
      
          // Find opponent
          const opponentId = rooms[roomId].players.find(id => id !== socket.id);
          const opponent = users[opponentId] ? { id: opponentId, username: users[opponentId].username } : null;
      
          callback({ success: true, opponent, color: opponent ? "black" : "white" });
      
          console.log(`${username} joined existing room ${roomId}`);
        } else {
          // Room doesn't exist, create it
          rooms[roomId] = { roomId, players: [socket.id] };
          socket.join(roomId);
          callback({ success: true, opponent: null, color: "white" });
      
          console.log(`${username} created and joined room ${roomId}`);
        }
      });
      
    socket.on('username', (username) => {
      users[socket.id] = {
        id: socket.id,
        username: username,
        inGame: false,
        roomId: null
      };
      console.log(`User ${username} (${socket.id}) set their username`);
    });
    
    // Find match
    socket.on('findMatch', (callback) => {
      const user = users[socket.id];
      
      if (!user) {
        callback({ waiting: false, message: 'Please set a username first' });
        return;
      }
      
      if (user.inGame) {
        callback({ waiting: false, message: 'You are already in a game' });
        return;
      }
      
      // Add to waiting queue
      waitingPlayers.push(socket.id);
      callback({ waiting: true, message: 'Waiting for an opponent...' });
      
      // Check if we can match players
      if (waitingPlayers.length >= 2) {
        const player1Id = waitingPlayers.shift();
        const player2Id = waitingPlayers.shift();
        
        // Make sure both players are still connected
        if (!users[player1Id] || !users[player2Id]) {
          if (users[player1Id]) waitingPlayers.unshift(player1Id);
          if (users[player2Id]) waitingPlayers.unshift(player2Id);
          return;
        }
        
        const player1 = users[player1Id];
        const player2 = users[player2Id];
        
        // Create a new room
        const roomId = uuidv4();
        rooms[roomId] = {
          roomId: roomId,
          players: [player1Id, player2Id],
          gameState: 'playing'
        };
        
        // Update user status
        player1.inGame = true;
        player1.roomId = roomId;
        player2.inGame = true;
        player2.roomId = roomId;
        
        // Join socket room
        io.sockets.sockets.get(player1Id)?.join(roomId);
        io.sockets.sockets.get(player2Id)?.join(roomId);
        
        // Notify both players about the match
        io.to(player1Id).emit('matchFound', {
          opponent: player2,
          roomId: roomId,
          color: 'white'
        });
        
        io.to(player2Id).emit('matchFound', {
          opponent: player1,
          roomId: roomId,
          color: 'black'
        });
        
        console.log(`Match created: ${player1.username} vs ${player2.username} in room ${roomId}`);
      }
    });
    
    // Cancel matchmaking
    socket.on('cancelMatchmaking', () => {
      const index = waitingPlayers.indexOf(socket.id);
      if (index !== -1) {
        waitingPlayers.splice(index, 1);
        console.log(`User ${users[socket.id]?.username || socket.id} canceled matchmaking`);
      }
    });
    
    // Leave game
    socket.on('leaveGame', () => {
      const user = users[socket.id];
      if (!user || !user.inGame || !user.roomId) return;
      
      const roomId = user.roomId;
      const room = rooms[roomId];
      
      if (room) {
        // Notify other player
        const otherPlayerId = room.players.find(id => id !== socket.id);
        if (otherPlayerId && users[otherPlayerId]) {
          io.to(otherPlayerId).emit('opponentLeft', user);
          
          // Update other player status
          users[otherPlayerId].inGame = false;
          users[otherPlayerId].roomId = null;
        }
        
        // Clean up room
        delete rooms[roomId];
      }
      
      // Update user status
      user.inGame = false;
      user.roomId = null;
      
      socket.leave(roomId);
      console.log(`User ${user.username} left game in room ${roomId}`);
    });
    
    // Close room
    socket.on('closeRoom', ({ roomId }) => {
        console.log(rooms.players)
      if (!roomId || !rooms[roomId]) return;
      
      const room = rooms[roomId];
      
      // Update player statuses
      room.players.forEach(playerId => {
        if (users[playerId]) {
          users[playerId].inGame = false;
          users[playerId].roomId = null;
          io.sockets.sockets.get(playerId)?.leave(roomId);
        }
      });
      
      // Clean up room
      delete rooms[roomId];
      io.to(roomId).emit('closeRoom', { roomId });
      
      console.log(`Room ${roomId} closed`);
    });
    
    // Handle chess moves
    socket.on('move', ({ move, room }) => {
      console.log(rooms);
      if (!room || !rooms[room]) {
        console.log(`Invalid room for move: ${room}`);
        return;
      }
      
      console.log(`Broadcasting move to room ${room}: ${JSON.stringify(move)}`);
      console.log(`Room players: ${JSON.stringify(rooms[room].players)}`);
      socket.to(room).emit('move', { move });
      console.log(`Move broadcast complete`);
  });;
    
    // Disconnect
    socket.on('disconnect', () => {
      const user = users[socket.id];
      
      // Remove from waiting queue if present
      const waitingIndex = waitingPlayers.indexOf(socket.id);
      if (waitingIndex !== -1) {
        waitingPlayers.splice(waitingIndex, 1);
      }
      
      // Notify opponent if in game
      if (user && user.inGame && user.roomId) {
        const roomId = user.roomId;
        const room = rooms[roomId];
        
        if (room) {
          const otherPlayerId = room.players.find(id => id !== socket.id);
          if (otherPlayerId && users[otherPlayerId]) {
            io.to(otherPlayerId).emit('playerDisconnected', user);
            
            // Update other player status
            users[otherPlayerId].inGame = false;
            users[otherPlayerId].roomId = null;
          }
          
          // Clean up room
          delete rooms[roomId];
        }
      }
      
      // Remove user from users object
      delete users[socket.id];
      console.log(`Socket disconnected: ${socket.id}`);
    });
  });
};

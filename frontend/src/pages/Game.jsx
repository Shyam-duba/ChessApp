import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { useLocation,useParams ,useNavigate} from 'react-router-dom';
import { io } from 'socket.io-client';
import { Chessboard } from "react-chessboard";
import { Chess } from "chess.js";
import {
  Card,
  CardContent,
  List,
  ListItem,
  ListItemText,
  ListSubheader,
  Stack,
  Typography,
  Box,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Button
} from "@mui/material";

// Assuming your Socket.io server is running on the same host
const socket = io("wss://chessapp-rpmo.onrender.com", {
  autoConnect: true,
  transports: ['websocket']
});

// Custom Dialog Component


const Game = () => {
  // User and connection state
  const navigate = useNavigate();
  const user = localStorage.getItem('user');
  const userData = user ? JSON.parse(user) : {
    username: '',
    rating: 0,
    matches: 0,
    wins: 0,
    losses: 0,
    draws: 0
  };

  const { username, rating, matches, wins, losses, draws } = userData;

  const [isConnected, setIsConnected] = useState(false);
  const [gameState, setGameState] = useState({
    status: 'idle', // idle, waiting, playing
    opponent: null,
    roomId: null,
    message: ''
  });
  const usernameInputRef = useRef(null);
  const locate = useLocation();
  const roomId = useParams().roomId;
  const color = locate.state?.color
  // Chess game state
  const chess = useMemo(() => new Chess(), []);
  const [fen, setFen] = useState(chess.fen());
  const [over, setOver] = useState("");
  const [players, setPlayers] = useState([]);
  const [orientation, setOrientation] = useState("white");
  
  // Connect to socket
  useEffect(() => {
    socket.on('connect', () => {
      setIsConnected(true);
    });

    socket.on('disconnect', () => {
      setIsConnected(false);
      setGameState({
        status: 'idle',
        opponent: null,
        roomId: roomId,
        message: 'Disconnected from server'
      });
      setPlayers([]);
    });

    // Listen for opponent match
    socket.on('matchFound', (data) => {
      setGameState({
        status: 'playing',
        opponent: data.opponent,
        roomId: data.roomId,
        message: `Playing against ${data.opponent.username}`
      });
      
      // Reset the chess board
      chess.reset();
      setFen(chess.fen());
      setOver("");
      
      // Set players
      const playersList = [
        { id: socket.id, username: username },
        { id: data.opponent.id, username: data.opponent.username }
      ];
      setPlayers(playersList);
      
      // Set orientation (black or white) based on player's position
      setOrientation(data.color || "white");
    });

    // Listen for moves from opponent
    socket.on('move', (moveData) => {
      makeAMove(moveData.move);

      if (chess.isCheckmate()) {
        setOver(`${moveData.opponent} wins!`);
        alert("Game over!");
        navigate("/")
      }
      
      console.log(over)
    });

    // Listen for opponent disconnection
    socket.on('playerDisconnected', (player) => {
      setOver(`${player.username} has disconnected`);
      setGameState(prev => ({
        ...prev,
        status: 'idle',
        message: `${player.username} disconnected. Game ended.`
      }));
    });

    // Listen for opponent leaving
    socket.on('opponentLeft', (player) => {
      setOver(`${player.username} left the game`);
      setGameState(prev => ({
        ...prev, 
        status: 'idle',
        message: `${player.username} left the game.`
      }));
    });
    
    // Listen for room closure
    socket.on('closeRoom', ({ roomId }) => {
      if (roomId === gameState.roomId) {
        handleCleanup();
      }
    });

    // Cleanup on component unmount
    return () => {
      socket.off('connect');
      socket.off('disconnect');
      socket.off('matchFound');
      socket.off('move');
      socket.off('playerDisconnected');
      socket.off('opponentLeft');
      socket.off('closeRoom');
    };
  }, [chess, gameState.roomId, username]);

  // Handle game cleanup
  const handleCleanup = () => {
    chess.reset();
    setFen(chess.fen());
    setOver("");
    setPlayers([]);
    setGameState({
      status: 'idle',
      opponent: null,
      roomId: null,
      message: 'Game ended'
    });
  };

  // Chess move handling
  const makeAMove = useCallback(
    (move) => {
      try {
        const result = chess.move(move);
        setFen(chess.fen());

        if (chess.isGameOver()) {
          if (chess.isCheckmate()) {
            setOver(
              `Checkmate! ${chess.turn() === "w" ? "black" : "white"} wins!`
            );
          } else if (chess.isDraw()) {
            setOver("Draw");
          } else {
            setOver("Game over");
          }
        }

        return result;
      } catch (e) {
        return null;
      }
    },
    [chess]
  );

  // onDrop function for chess pieces
  function onDrop(sourceSquare, targetSquare) {
    if (chess.turn() !== orientation[0]) return false;
    if (players.length < 2) return false;
    if (gameState.status !== 'playing') return false;

    const moveData = {
      from: sourceSquare,
      to: targetSquare,
      color: chess.turn(),
      promotion: "q",
    };

    const move = makeAMove(moveData);

    if (move === null) return false;

    socket.emit("move", {
      move,
      room: gameState.roomId,
    });
    if (chess.isCheckmate()) {
      setOver(`you wins!`);
      alert("Game over! you win");
      navigate("/")
    }

    return true;
  }

  // Set username
  const handleSetUsername = () => {
    if (username.trim()) {
      socket.emit('username', username);
      if (usernameInputRef.current) {
        usernameInputRef.current.blur();
      }
    }
  };

  // Find match
  const handleFindMatch = () => {
    if (!username.trim()) {
      alert('Please set a username first');
      return;
    }
    
    setGameState({
      status: 'waiting',
      opponent: null,
      roomId: null,
      message: 'Looking for an opponent...'
    });
    
    socket.emit('findMatch', (response) => {
      if (response.waiting) {
        setGameState({
          status: 'waiting',
          opponent: null,
          roomId: null,
          message: response.message || 'Waiting for opponent...'
        });
      }
    });
  };

  // Cancel matchmaking
  const handleCancelMatchmaking = () => {
    socket.emit('cancelMatchmaking');
    setGameState({
      status: 'idle',
      opponent: null,
      roomId: null,
      message: 'Matchmaking cancelled'
    });
  };

  // Leave game
  const handleLeaveGame = () => {
    socket.emit('leaveGame');
    handleCleanup();
  };

  // Handle game over dialog continue button
  const handleGameOverContinue = () => {
    socket.emit("closeRoom", { roomId: gameState.roomId });
    handleCleanup();
  };

  return (
    <div className="game-container p-4 max-w-4xl mx-auto bg-gray-100 rounded-lg shadow-md">
      <h1 className="text-2xl font-bold mb-4">Chess Game</h1>
      
      {/* Connection Status */}
      <div className="mb-4">
        <span className={`inline-block w-3 h-3 rounded-full mr-2 ${isConnected ? 'bg-green-500' : 'bg-red-500'}`}></span>
        <span>{isConnected ? 'Connected' : 'Disconnected'}</span>
      </div>
      
      {/* Username Input */}
      <div className="mb-4 flex">
        <input
          type="text"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          placeholder="Enter username"
          className="flex-1 p-2 border rounded-l"
          disabled={gameState.status === 'playing'}
          ref={usernameInputRef}
        />
        <button 
          onClick={handleSetUsername}
          className="bg-blue-500 text-white px-4 py-2 rounded-r"
          disabled={gameState.status === 'playing' || !username.trim()}
        >
          Set
        </button>
      </div>
      
      {/* Game Status */}
      <div className="mb-4 p-3 bg-white rounded shadow-sm">
        <p className="font-semibold">Status: {gameState.status}</p>
        {gameState.opponent && (
          <p>Playing against: {gameState.opponent.username}</p>
        )}
        {gameState.roomId && (
          <p>Room ID: {gameState.roomId}</p>
        )}
        {gameState.message && (
          <p className="mt-2 text-sm text-gray-600">{gameState.message}</p>
        )}
      </div>
      
      {/* Game Controls */}
      <div className="mb-4 flex gap-2">
        {gameState.status === 'idle' && (
          <button 
            onClick={handleFindMatch}
            className="bg-green-500 text-white px-4 py-2 rounded flex-1"
            disabled={!username.trim()}
          >
            Find Match
          </button>
        )}
        
        {gameState.status === 'waiting' && (
          <button 
            onClick={handleCancelMatchmaking}
            className="bg-yellow-500 text-white px-4 py-2 rounded flex-1"
          >
            Cancel
          </button>
        )}
        
        {gameState.status === 'playing' && (
          <button 
            onClick={handleLeaveGame}
            className="bg-red-500 text-white px-4 py-2 rounded flex-1"
          >
            Leave Game
          </button>
        )}
      </div>
      
      {/* Chess Game */}
      {gameState.status === 'playing' && (
        <Stack>
          <Stack flexDirection="row" sx={{ pt: 2 }}>
            <div className="board" style={{
              maxWidth: 600,
              maxHeight: 600,
              flexGrow: 1,
            }}>
              <Chessboard
                position={fen}
                onPieceDrop={onDrop}
                boardOrientation={orientation}
              />
            </div>
            {players.length > 0 && (
              <Box>
                <List>
                  <ListSubheader>Players</ListSubheader>
                  {players.map((p) => (
                    <ListItem key={p.id}>
                      <ListItemText 
                        primary={p.username} 
                        secondary={p.id === socket.id ? "(You)" : ""}
                      />
                    </ListItem>
                  ))}
                </List>
              </Box>
            )}
          </Stack>
        </Stack>
      )}
      
      {/* Game Over Dialog */}
      
    </div>
  );
};
export default Game;

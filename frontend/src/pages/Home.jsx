import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Check as ChessKing, User, LogOut, Trophy, Settings } from 'lucide-react';
import { io } from 'socket.io-client';

const socket = io("ws://localhost:5000", {
  autoConnect: true,
  transports: ['websocket']
});

function Home() {
  const navigate = useNavigate();
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [isWaiting, setIsWaiting] = useState(false);
  const [roomId, setRoomId] = useState(null);
  const [error, setError] = useState(null);

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

  useEffect(() => {
    // Set username when component mounts
    if (username) {
      socket.emit('username', username);
    }

    // Clean up socket listeners on unmount
    return () => {
      socket.off('opponentJoined');
      socket.off('playerDisconnected');
      if (roomId) {
        socket.emit('closeRoom', { roomId });
      }
    };
  }, [username, roomId]);

  const handleLogout = () => {
    if (roomId) {
      socket.emit('closeRoom', { roomId });
    }
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  const handlePlayOnline = () => {
    setIsWaiting(true);
    setError(null);
    
    socket.emit('createRoom', (newRoomId) => {
      setRoomId(newRoomId);
    });

    socket.on('opponentJoined', (roomUpdate) => {
      setIsWaiting(false);
      navigate(`/game/${roomId}`);
    });

    socket.on('playerDisconnected', (player) => {
      setError(`${player.username} disconnected`);
      setIsWaiting(false);
      setRoomId(null);
    });
  };

  return (
    <div className="relative min-h-screen bg-[#1a1a1a] overflow-hidden">
      {/* Chess-themed background */}
      <div 
        className="absolute inset-0 opacity-20"
        style={{
          backgroundImage: "url('https://images.unsplash.com/photo-1586165368502-1bad197a6461?q=80&w=2958&auto=format&fit=crop')",
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundBlendMode: "overlay"
        }}
      />

      {/* User Profile Icon */}
      <div className="absolute top-4 right-4 z-50">
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="bg-white/10 p-2 rounded-full"
          onClick={() => setShowProfileMenu(!showProfileMenu)}
        >
          <User className="w-6 h-6 text-white" />
        </motion.button>

        {/* Profile Dropdown Menu */}
        {showProfileMenu && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="absolute right-0 mt-2 w-48 bg-black/80 backdrop-blur-lg rounded-lg shadow-lg py-2"
          >
            <div className="px-4 py-2 border-b border-white/10">
              <p className="text-white font-semibold">{username}</p>
            </div>
            <button className="w-full text-left px-4 py-2 text-white hover:bg-white/10 flex items-center gap-2">
              <Trophy className="w-4 h-4" /> Statistics
            </button>
            <button className="w-full text-left px-4 py-2 text-white hover:bg-white/10 flex items-center gap-2">
              <Settings className="w-4 h-4" /> Settings
            </button>
            <button 
              onClick={handleLogout}
              className="w-full text-left px-4 py-2 text-red-400 hover:bg-white/10 flex items-center gap-2"
            >
              <LogOut className="w-4 h-4" /> Logout
            </button>
          </motion.div>
        )}
      </div>

      {/* Main Content */}
      <div className="relative min-h-screen flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 200, damping: 20 }}
            className="w-20 h-20 bg-white rounded-full mx-auto mb-8 flex items-center justify-center"
          >
            <ChessKing className="w-12 h-12 text-black" />
          </motion.div>

          <h1 className="text-4xl md:text-6xl font-bold text-white mb-6">
            Welcome to ChessMaster
          </h1>
          <p className="text-gray-400 text-lg md:text-xl mb-12 max-w-2xl mx-auto">
            Challenge players worldwide or improve your skills against our advanced AI. 
            Your next chess adventure begins here.
          </p>

          <div className="flex flex-col md:flex-row gap-4 justify-center">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handlePlayOnline}
              disabled={isWaiting}
              className={`${
                isWaiting 
                  ? 'bg-gray-500 cursor-not-allowed'
                  : 'bg-white hover:bg-gray-100'
              } text-black px-8 py-4 rounded-lg font-semibold text-lg transition-colors`}
            >
              {isWaiting ? 'Waiting for opponent...' : 'Play Online'}
            </motion.button>
            
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate('/play/ai')}
              className="bg-transparent border-2 border-white text-white px-8 py-4 rounded-lg font-semibold text-lg hover:bg-white/10 transition-colors"
            >
              Play vs AI
            </motion.button>
          </div>

          {error && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="mt-4 text-red-500"
            >
              {error}
            </motion.div>
          )}

          {/* Quick Stats */}
          <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto">
            {[
              { label: 'Games Played', value: matches },
              { label: 'Wins', value: wins },
              { label: 'Rating', value: rating },
              { label: 'Win Rate', value: `${matches === 0 ? 0 : Math.round((wins / matches) * 100)}%` }
            ].map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 + index * 0.1 }}
                className="bg-white/10 backdrop-blur-lg rounded-lg p-4"
              >
                <h3 className="text-gray-400 text-sm">{stat.label}</h3>
                <p className="text-white text-2xl font-bold">{stat.value}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
}

export default Home;
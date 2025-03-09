import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Crown, ChevronRight as ChessKnight, Check as ChessKing, Parentheses as ChessQueen, BookCheck as ChessRook, CopyCheck as ChessBishop, Check as ChessPawn, Home as HomeIcon } from 'lucide-react';

function NotFound() {
  const navigate = useNavigate();

  const pieces = [
    { icon: ChessKing, delay: 0 },
    { icon: ChessQueen, delay: 0.1 },
    { icon: ChessBishop, delay: 0.2 },
    { icon: ChessKnight, delay: 0.3 },
    { icon: ChessRook, delay: 0.4 },
    { icon: ChessPawn, delay: 0.5 }
  ];

  return (
    <div className="min-h-screen bg-[#1a1a1a] flex items-center justify-center p-4 overflow-hidden">
      {/* Animated chess pieces background */}
      {[...Array(20)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute text-white/5"
          initial={{ 
            x: Math.random() * window.innerWidth, 
            y: -100,
            rotate: 0 
          }}
          animate={{ 
            y: window.innerHeight + 100,
            rotate: 360,
            x: Math.random() * window.innerWidth 
          }}
          transition={{ 
            duration: Math.random() * 10 + 10,
            repeat: Infinity,
            ease: "linear"
          }}
        >
          <Crown size={Math.random() * 40 + 20} />
        </motion.div>
      ))}

      <div className="relative z-10 text-center">
        <motion.div 
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", duration: 0.5 }}
          className="flex justify-center mb-8 space-x-4"
        >
          {pieces.map((Piece, index) => (
            <motion.div
              key={index}
              initial={{ y: -50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: Piece.delay, type: "spring" }}
            >
              <Piece.icon className="w-12 h-12 text-white" />
            </motion.div>
          ))}
        </motion.div>

        <motion.h1
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="text-8xl font-bold text-white mb-4"
        >
          404
        </motion.h1>

        <motion.h2
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="text-3xl font-semibold text-white mb-6"
        >
          Checkmate! Page Not Found
        </motion.h2>

        <motion.p
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="text-gray-400 text-lg mb-8 max-w-md mx-auto"
        >
          Looks like this move led to a dead end! Let's get you back to a winning position.
        </motion.p>

        <motion.button
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3 }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => navigate('/')}
          className="bg-white text-black px-8 py-4 rounded-lg font-semibold text-lg hover:bg-gray-100 transition-colors inline-flex items-center space-x-2"
        >
          <HomeIcon className="w-5 h-5" />
          <span>Back to Home</span>
        </motion.button>
      </div>
    </div>
  );
}

export default NotFound;
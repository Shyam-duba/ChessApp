import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import axios from "axios";
import { Check as ChessKing, Mail, Lock, Loader2 } from "lucide-react";

const fadeIn = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 }
};

const inputAnimation = {
  focus: { scale: 1.02, transition: { duration: 0.2 } },
  blur: { scale: 1, transition: { duration: 0.2 } }
};

function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const response = await axios.post("https://chessapp-rpmo.onrender.com/api/auth/login", {
        email,
        password,
      });

      if (response.status === 200) {
        localStorage.setItem("token", response.data.token);
        localStorage.setItem("user", JSON.stringify(response.data.user));
        navigate("/");
      }
    } catch (err) {
      setError("Invalid credentials. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div 
      className="min-h-screen bg-[#1a1a1a] flex items-center justify-center p-4 sm:p-6 md:p-8"
      style={{
        backgroundImage: "url('https://images.unsplash.com/photo-1586165368502-1bad197a6461?q=80&w=2958&auto=format&fit=crop')",
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundBlendMode: "overlay"
      }}
    >
      <motion.div
        initial="hidden"
        animate="visible"
        variants={fadeIn}
        className="w-full max-w-md"
      >
        <div className="bg-black/80 backdrop-blur-lg rounded-2xl p-8 shadow-2xl border border-white/10">
          <motion.div
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: "spring", stiffness: 200, damping: 20 }}
            className="w-20 h-20 bg-white rounded-full mx-auto mb-8 flex items-center justify-center shadow-lg"
          >
            <ChessKing className="w-12 h-12 text-black" />
          </motion.div>

          <h2 className="text-3xl font-bold text-center text-white mb-2">
            Welcome to ChessMaster
          </h2>
          <p className="text-gray-400 text-center mb-8">Sign in to start playing</p>

          <form onSubmit={handleLogin} className="space-y-6">
            <div className="relative">
              <motion.div
                whileFocus="focus"
                whileBlur="blur"
                variants={inputAnimation}
              >
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-3 bg-white/10 rounded-lg pl-12 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-white/30 transition-all border border-white/10"
                  placeholder="Email"
                  required
                />
                <Mail className="absolute left-4 top-3.5 w-5 h-5 text-gray-400" />
              </motion.div>
            </div>

            <div className="relative">
              <motion.div
                whileFocus="focus"
                whileBlur="blur"
                variants={inputAnimation}
              >
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-3 bg-white/10 rounded-lg pl-12 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-white/30 transition-all border border-white/10"
                  placeholder="Password"
                  required
                />
                <Lock className="absolute left-4 top-3.5 w-5 h-5 text-gray-400" />
              </motion.div>
            </div>

            {error && (
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-red-400 text-sm text-center"
              >
                {error}
              </motion.p>
            )}

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="submit"
              disabled={isLoading}
              className="w-full bg-white text-black py-3 rounded-lg font-semibold hover:bg-gray-100 transition-all disabled:opacity-70 flex items-center justify-center"
            >
              {isLoading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                "Sign In"
              )}
            </motion.button>

            <div className="flex items-center gap-4 my-6">
              <div className="flex-1 h-px bg-white/10"></div>
              <span className="text-gray-400 text-sm">or</span>
              <div className="flex-1 h-px bg-white/10"></div>
            </div>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="text-center text-gray-400 text-sm"
            >
              New to ChessMaster?{" "}
              <button
                onClick={() => navigate("/signup")}
                className="text-white font-semibold hover:text-gray-200 transition-colors"
              >
                Create an account
              </button>
            </motion.p>
          </form>
        </div>
      </motion.div>
    </div>
  );
}

export default Login;

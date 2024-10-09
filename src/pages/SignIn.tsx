import React, { useState } from "react";
import { signInWithEmailAndPassword, auth } from "../firebaseConfig";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { motion } from "framer-motion";

const SignIn: React.FC = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const { currentUser } = useAuth();

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await signInWithEmailAndPassword(auth, email, password);
      navigate("/profile"); // redirect to profile after login
    } catch (err) {
      setError("Failed to sign in. Please check your credentials.");
    }
  };

  return (
    <motion.div className="flex flex-row min-h-screen"
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    exit={{ opacity: 0 }}
    transition={{ duration: 0.5 }}>
      {/* Left Side - Image */}
      <div
        className="hidden lg:flex w-1/2 bg-cover bg-center"
        style={{
          backgroundImage:
            'url("https://images.unsplash.com/photo-1648326969967-ce89e67fb5b5?q=80&w=1887&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D,restaurant")',
        }}
      ></div>

      {/* Right Side - Sign In Form */}
      <div className="w-full lg:w-1/2 flex flex-col justify-center items-center bg-black text-white p-8 font-inter sm:mt-0 mt-10">
        {currentUser ? (
          <p className="text-lg text-center mb-4">
            You are already signed in as{" "}
            {currentUser.displayName || currentUser.email}.{" "}
            <button
              onClick={() => navigate("/profile")}
              className="text-blue-500 hover:underline"
            >
              Go to profile
            </button>
          </p>
        ) : (
          <form
            onSubmit={handleSignIn}
            className="w-full max-w-md p-8 rounded-lg shadow-lg"
          >
            <h2 className="text-3xl sm:text-4xl text-center mb-6">
              Welcome <span className="underline underline-offset-2"> Back</span>
            </h2>
            <div className="mb-4">
              <label className="block text-sm mb-2">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full p-3 rounded bg-gray-900 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="mb-4">
              <label className="block text-sm mb-2">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full p-3 rounded bg-gray-900 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <button
              type="submit"
              className="w-full bg-blue-500 hover:bg-blue-600 text-white font-bold py-3 px-4 rounded mt-4 transition duration-300"
            >
              Sign In
            </button>

            {/* Sign-up Option */}
            <p className="text-center text-gray-400 mt-4">
              Don't have an account?{" "}
              <button
                onClick={() => navigate("/signup")}
                className="text-blue-500 hover:underline"
              >
                Sign up
              </button>
            </p>

            {error && <p className="text-red-500 text-xs mt-4">{error}</p>}
          </form>
        )}
      </div>
    </motion.div>
  );
};

export default SignIn;

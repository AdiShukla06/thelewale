import React, { useState } from "react";
import { createUserWithEmailAndPassword, auth } from "../firebaseConfig";
import { updateProfile } from "firebase/auth"; // Add this to update user's display name
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { db } from "../firebaseConfig"; // Import Firestore
import { doc, setDoc } from "firebase/firestore"; // Import Firestore functions
import { motion } from "framer-motion";

const SignUp: React.FC = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const { currentUser } = useAuth();

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      // Create the user with email and password
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );
      const user = userCredential.user;

      // Update the user's display name
      await updateProfile(user, {
        displayName: name,
      });

      // Create a user document in Firestore with initial data
      const userRef = doc(db, "users", user.uid);
      await setDoc(userRef, {
        name: name,
        email: user.email,
        points: 0, // Initialize points to 0
        vendorsAdded: 0, // Array to store vendor IDs the user adds
        reviewsGiven: 0, // Array to store reviews given by the user
        role: "user", // Set the role to user
      });

      // Redirect to profile page after sign-up
      navigate("/profile");
    } catch (err) {
      setError("Failed to sign up. Please try again.");
    }
  };

  return (
    <motion.div className="flex flex-row min-h-screen"
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    exit={{ opacity: 0 }}
    transition={{ duration: 0.5 }}>
      {/* Left Side - Sign Up Form */}
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
            onSubmit={handleSignUp}
            className="w-full max-w-md p-8 rounded-lg shadow-lg"
          >
            <h2 className="text-3xl sm:text-4xl text-center mb-6 ">
              Create <span className="underline underline-offset-2"> Account</span>
            </h2>
            <div className="mb-4">
              <label className="block text-sm mb-2">Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="w-full p-3 rounded bg-gray-900 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
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
              Sign Up
            </button>

            {/* Sign In Option */}
            <p className="text-center text-gray-400 mt-4">
              Already have an account?{" "}
              <button
                onClick={() => navigate("/signin")}
                className="text-blue-500 hover:underline"
              >
                Sign In
              </button>
            </p>

            {error && <p className="text-red-500 text-xs mt-4">{error}</p>}
          </form>
        )}
      </div>

      {/* Right Side - Image */}
      <div className="hidden lg:flex w-1/2 bg-cover bg-center" style={{ backgroundImage: 'url("https://images.pexels.com/photos/16005658/pexels-photo-16005658/free-photo-of-merchant-at-his-food-cart.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2,restaurant")' }}>
      </div>
    </motion.div>
  );
};

export default SignUp;

import React, { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { Link, useNavigate } from "react-router-dom";
import { signOut, auth } from "../firebaseConfig";
import logo from "../assets/logowhitebg.png";
import ShimmerButton from "@/components/ui/shimmer-button";

export function ShimmerButtonDemo() {
  return (
    <div className="flex items-center justify-center">
      <ShimmerButton className="shadow-2xl">
        <span className="whitespace-pre-wrap text-center text-sm font-medium leading-none tracking-tight text-white dark:from-white dark:to-slate-900/10 lg:text-sm font-inter">
          Sign In
        </span>
      </ShimmerButton>
    </div>
  );
}

const Header: React.FC = () => {
  const { currentUser } = useAuth(); // Get currentUser from AuthContext
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);

  // Check user authentication state and stop loading once determined
  useEffect(() => {
    if (currentUser !== undefined) {
      setIsLoading(false); // Stop loading when user state is known
    }
  }, [currentUser]);

  const handleSignOut = async () => {
    await signOut(auth);
    navigate("/"); // Redirect to PreLanding after sign-out
  };

  const handleProfileClick = () => {
    navigate("/profile"); // Navigate to /profile when "Profile" is clicked
  };

  // Render the header only when the user authentication state is determined (i.e., after loading)
  if (isLoading) {
    return null; // Optionally return a loading spinner here
  }

  return (
    <header className="fixed top-0 left-0 w-full z-10 flex justify-between items-center px-4 bg-transparent">
      <Link to="/home">
        <img src={logo} alt="Thelewale Logo" className="w-20 h-20" />
      </Link>
      <div>
        {/* Check if currentUser exists to conditionally render buttons */}
        {currentUser ? (
          <div className="flex items-center space-x-4 font-inter text-white">
            {/* Profile Button */}
            <span
              onClick={handleProfileClick}
              className="cursor-pointer hover:underline"
            >
              Profile
            </span>
            {/* Sign Out Button */}
            <button
              onClick={handleSignOut}
              className="hover:bg-red-700 text-white py-2 px-4 rounded"
            >
              Sign Out
            </button>
          </div>
        ) : (
          <Link to="/signin">
            <ShimmerButtonDemo />
          </Link>
        )}
      </div>
    </header>
  );
};

export default Header;

import React from 'react';
import { useAuth } from '../context/AuthContext';
import { Link, useNavigate } from 'react-router-dom';
import { signOut, auth } from '../firebaseConfig';
import logo from '../assets/logowhitebg.png';
import ShimmerButton from "@/components/ui/shimmer-button";

export function ShimmerButtonDemo() {
  return (
    <div className=" flex items-center justify-center">
      <ShimmerButton className="shadow-2xl">
        <span className="whitespace-pre-wrap text-center text-sm font-medium leading-none tracking-tight text-white dark:from-white dark:to-slate-900/10 lg:text-sm font-inter">
          Sign In
        </span>
      </ShimmerButton>
    </div>
  );
}


const Header: React.FC = () => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut(auth);
    navigate('/');
  };

  return (
    <header className="fixed top-0 left-0 w-full z-10 flex justify-between items-center px-4 bg-transparent">
      <Link to="/home">
      <img src={logo} alt="Thelewale Logo" className="w-20 h-20" />
      </Link>
      <div>
        {currentUser ? (
          <div className="flex items-center space-x-4">
            {/* Display name or fallback to email */}
            <span>{currentUser.displayName || currentUser.email}</span>
            <button
              onClick={handleSignOut}
              className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded"
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

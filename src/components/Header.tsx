import React from 'react';
import { useAuth } from '../context/AuthContext';
import { Link, useNavigate } from 'react-router-dom';
import { signOut, auth } from '../firebaseConfig';

const Header: React.FC = () => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut(auth);
    navigate('/');
  };

  return (
    <header className="flex justify-between items-center p-4 bg-gray-100 shadow-md">
      <Link to="/">
        <h1 className="text-xl font-bold">Thelewale</h1>
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
          <Link to="/signin" className="text-blue-500 hover:underline">
            Sign In
          </Link>
        )}
      </div>
    </header>
  );
};

export default Header;

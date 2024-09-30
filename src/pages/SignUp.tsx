import React, { useState } from 'react';
import { createUserWithEmailAndPassword, auth } from '../firebaseConfig';
import { updateProfile } from 'firebase/auth'; // Add this to update user's display name
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';




const SignUp: React.FC = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { currentUser } = useAuth();

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      // Create the user with email and password
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // Update the user's display name
      await updateProfile(user, {
        displayName: name
      });

      // Redirect to profile page after sign-up
      navigate('/profile');
    } catch (err) {
      setError('Failed to sign up. Please try again.');
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      {currentUser ? (
        <p className="text-lg text-center mb-4">
          You are already signed in as {currentUser.displayName || currentUser.email}.{' '}
          <button
            onClick={() => navigate('/profile')}
            className="text-blue-500 hover:underline"
          >
            Go to profile
          </button>
        </p>
      ) : (
      <form onSubmit={handleSignUp} className="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4">
        <div>
          <label>Name</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            className="shadow appearance-none border rounded w-full py-2 px-3"
          />
        </div>
        <div>
          <label>Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="shadow appearance-none border rounded w-full py-2 px-3"
          />
        </div>
        <div>
          <label>Password</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="shadow appearance-none border rounded w-full py-2 px-3"
          />
        </div>
        <button type="submit" className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
          Sign Up
        </button>
        {error && <p className="text-red-500 text-xs mt-2">{error}</p>}
      </form>
      )}
    </div>
  );
};

export default SignUp;

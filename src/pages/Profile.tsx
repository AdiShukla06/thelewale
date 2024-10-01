import React, { useEffect, useState } from 'react';
import { db } from '../firebaseConfig';
import { doc, getDoc } from 'firebase/firestore';
import { useAuth } from '../context/AuthContext';

interface UserData {
  name: string;
  email: string;
  points: number;
  vendorsAdded: number;
  reviewsGiven: number;
}

const badges = [
  { name: 'Newbie', minPoints: 0 },
  { name: 'Contributor', minPoints: 100 },
  { name: 'Vendor Specialist', minPoints: 250 },
  { name: 'Food Guru', minPoints: 500 },
];

const Profile: React.FC = () => {
  const { currentUser } = useAuth();
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserData = async () => {
      if (currentUser?.uid) {
        const userDoc = doc(db, 'users', currentUser.uid);
        const userSnap = await getDoc(userDoc);
        if (userSnap.exists()) {
          setUserData(userSnap.data() as UserData);
        }
      }
      setLoading(false);
    };
    fetchUserData();
  }, [currentUser]);

  const getBadge = (points: number) => {
    const badge = badges.reduce((acc, curr) => (points >= curr.minPoints ? curr : acc), badges[0]);
    return badge.name;
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  if(!currentUser) {
    return <div>Sign in to view your profile</div>;
  }

  if (!userData) {
    return <div>No user data available</div>;
  }

  return (
    <div className="min-h-screen p-10">
      <h1 className="text-2xl mb-4">Profile</h1>

      {/* User Details */}
      <div className="mb-4 p-4 border rounded">
        <p><strong>Name:</strong> {userData.name}</p>
        <p><strong>Email:</strong> {userData.email}</p>
        <p><strong>Points:</strong> {userData.points}</p>
        <p><strong>Vendors Added:</strong> {userData.vendorsAdded}</p>
        <p><strong>Reviews Given:</strong> {userData.reviewsGiven}</p>
      </div>

      {/* Badge */}
      <div className="mb-4 p-4 border rounded">
        <h2 className="text-xl mb-2">Your Badge:</h2>
        <p className="text-lg font-bold">{getBadge(userData.points)}</p>
      </div>

      {/* Points and Badges Info */}
      <div className="p-4 border rounded">
        <h2 className="text-xl mb-2">Points and Badge System</h2>
        <p>Earn points and unlock badges:</p>
        <ul className="list-disc ml-5">
          <li>Add a vendor: <strong>+75 points</strong></li>
          <li>Give a review: <strong>+10 points</strong></li>
        </ul>

        <h3 className="mt-4">Badges:</h3>
        <ul className="list-disc ml-5">
          {badges.map((badge) => (
            <li key={badge.name}>
              <strong>{badge.name}</strong> - Earned at {badge.minPoints} points
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default Profile;

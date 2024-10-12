import React, { useEffect, useState } from "react";
import { db } from "../firebaseConfig";
import {
  collection,
  query,
  where,
  getDocs,
  getDoc,
  doc,
} from "firebase/firestore";
import { useAuth } from "../context/AuthContext";
import Modal from "@/components/ui/modal";
import { BsTrophyFill } from "react-icons/bs"; // Icon for badge
// import { FaMedal } from "react-icons/fa"; // Icon for points
import { motion } from "framer-motion";

interface UserData {
  name: string;
  email: string;
  points: number;
  vendorsAdded: number;
  reviewsGiven: number;
}

interface VendorData {
  id: string;
  name: string;
  status: string; // "pending", "approved", "rejected"
}

const badges = [
  { name: "Newbie", minPoints: 0, color: "bg-gray-500" },
  { name: "Contributor", minPoints: 100, color: "bg-blue-500" },
  { name: "Vendor Specialist", minPoints: 250, color: "bg-green-500" },
  { name: "Food Guru", minPoints: 500, color: "bg-yellow-500" },
];

const Profile: React.FC = () => {
  const { currentUser } = useAuth();
  const [userData, setUserData] = useState<UserData | null>(null);
  const [userVendors, setUserVendors] = useState<VendorData[]>([]);
  const [loading, setLoading] = useState(true);
  const [showBadgeInfo, setShowBadgeInfo] = useState(false);

  // Fetch user data
  useEffect(() => {
    const fetchUserData = async () => {
      if (currentUser?.uid) {
        const userDocRef = doc(db, "users", currentUser.uid);
        const userSnap = await getDoc(userDocRef);
        if (userSnap.exists()) {
          setUserData(userSnap.data() as UserData);
        }
      }
      setLoading(false);
    };
    fetchUserData();
  }, [currentUser]);

  // Fetch vendors added by the current user
  useEffect(() => {
    const fetchUserVendors = async () => {
      if (currentUser?.uid) {
        const vendorsQuery = query(
          collection(db, "vendors"),
          where("addedBy", "==", currentUser.uid)
        );
        const vendorSnap = await getDocs(vendorsQuery);
        const vendors = vendorSnap.docs.map((doc) => ({
          ...doc.data(), // Spread the rest of the data first
          id: doc.id, // Override or ensure 'id' from doc.id
        } as VendorData)); // Explicitly typecast the result
        setUserVendors(vendors);
      }
    };
  
    fetchUserVendors();
  }, [currentUser]);
  

  const getBadge = (points: number) => {
    const badge = badges.reduce(
      (acc, curr) => (points >= curr.minPoints ? curr : acc),
      badges[0]
    );
    return badge;
  };

  const BadgeInfoModal = () => (
    <Modal isOpen={showBadgeInfo} onClose={() => setShowBadgeInfo(false)}>
      <h2 className="text-2xl mb-4">Points and Badge System</h2>
      <p>Earn points and unlock badges:</p>
      <ul className="list-disc ml-5">
        <li>
          Add a vendor: <strong>+75 points</strong>
        </li>
        <li>
          Give a review: <strong>+10 points</strong>
        </li>
      </ul>
      <h3 className="mt-4">Badges:</h3>
      <ul className="list-disc ml-5">
        {badges.map((badge) => (
          <li key={badge.name} className="mb-2">
            <strong>{badge.name}</strong> - Earned at {badge.minPoints} points
          </li>
        ))}
      </ul>
    </Modal>
  );

  if (loading) {
    <div className="min-h-screen bg-black flex justify-center items-center">
      <div className="text-white font-inter">Loading...</div>
    </div>;
  }

  if (!currentUser) {
    return (
      <div className="min-h-screen bg-black flex justify-center items-center">
        <div className="text-white font-inter">Sign in to view your profile</div>
      </div>
    );
  }
  
  if (!userData) {
    return (
      <div className="min-h-screen bg-black flex justify-center items-center">
        <div className="text-white font-inter">No user data available</div>
      </div>
    );
  }
  

  const badge = getBadge(userData.points);

  return (
    <motion.div className="min-h-screen bg-black text-white p-10 font-inter"
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    exit={{ opacity: 0 }}
    transition={{ duration: 0.5 }}>
      <h1 className="text-3xl sm:text-4xl mb-10 text-center mt-14 sm:mt-10">Namaste {currentUser.displayName}🙏</h1>


      {/* Badge Section */}
      <div className="mb-10 p-6 rounded-lg shadow-md flex items-center">
        <div
          className={`p-4 rounded-full text-xl ${badge.color} flex items-center justify-center`}
        >
          <BsTrophyFill />
        </div>
        <div className="ml-4">
          <h2 className="text-2xl font-semibold">Your Badge:</h2>
          <p className="text-lg font-bold">{badge.name}</p>
        </div>
      </div>


      {/* User Details Section */}
      <div className=" mb-10 p-6 rounded-lg shadow-md">
        <p className="mb-2 ">
          <strong className="text-3xl sm:text-5xl">WHAT IS YOUR NAME</strong> <span className="text-red-400">{userData.name} </span>
        </p>
        <p className="mb-2">
          <strong className="text-3xl sm:text-5xl">WHAT IS YOUR EMAIL</strong>  <span className="text-red-400">{userData.email} </span>
        </p>
        <p className="mb-2">
          <strong className="text-3xl sm:text-5xl">HOW MANY POINTS DO YOU HAVE</strong>  <span className="text-red-400">{userData.points} </span>
        </p>
        <p className="mb-2">
          <strong className="text-3xl sm:text-5xl">HOW MANY VENDORS HAVE YOU ADDED</strong>  <span className="text-red-400">{userData.vendorsAdded} </span>
        </p>
        <p className="mb-2">
          <strong className="text-3xl sm:text-5xl">HOW MANY REVIEWS HAVE YOU GIVEN</strong> <span className="text-red-400"> {userData.reviewsGiven}</span>
        </p>
      </div>

      

      {/* Show Badge Info */}
      <div className="mb-10 p-6 rounded-lg shadow-md">
        <button
          onClick={() => setShowBadgeInfo(true)}
          className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg"
        >
          View Points & Badge Info
        </button>
      </div>

      {/* User's Vendors Section */}
      <div className="p-6  rounded-lg shadow-md">
        <h2 className="text-xl mb-4 font-semibold">Your Vendors</h2>
        {userVendors.length > 0 ? (
          <ul className="list-disc ml-5">
            {userVendors.map((vendor) => (
              <li key={vendor.id} className="mb-2">
                <strong>{vendor.name}</strong> - Status:{" "}
                <span
                  className={
                    vendor.status === "approved"
                      ? "text-green-500"
                      : vendor.status === "rejected"
                      ? "text-red-500"
                      : "text-yellow-500"
                  }
                >
                  {vendor.status}
                </span>
              </li>
            ))}
          </ul>
        ) : (
          <p>No vendors added yet.</p>
        )}
      </div>

      {/* Badge Info Modal */}
      {showBadgeInfo && <BadgeInfoModal />}
    </motion.div>
  );
};

export default Profile;

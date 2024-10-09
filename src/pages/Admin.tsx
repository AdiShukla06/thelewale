import { collection, query, where, getDocs, updateDoc } from "firebase/firestore";
import { doc, getDoc } from "firebase/firestore";
import { useAuth } from "../context/AuthContext";
import { db } from "../firebaseConfig";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const Admin: React.FC = () => {
  const { currentUser } = useAuth();
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [pendingVendors, setPendingVendors] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchPendingVendors = async () => {
      if (currentUser) {
        try {
          const userRef = doc(db, "users", currentUser.uid);
          const userDoc = await getDoc(userRef);

          if (userDoc.exists()) {
            const userData = userDoc.data();
            setIsAdmin(userData.role === "admin");

            if (userData.role === "admin") {
              const vendorsQuery = query(
                collection(db, "vendors"),
                where("status", "==", "pending")
              );
              const vendorSnapshot = await getDocs(vendorsQuery);
              const vendorsList = vendorSnapshot.docs.map((doc) => ({
                id: doc.id,
                ...doc.data(),
              }));
              setPendingVendors(vendorsList);
            }
          } else {
            setIsAdmin(false);
          }
        } catch (error) {
          console.error("Error fetching user data: ", error);
          setIsAdmin(false);
        }
      } else {
        setIsAdmin(false);
      }
      setLoading(false);
    };

    fetchPendingVendors();
  }, [currentUser]);

  const approveVendor = async (vendorId: string) => {
    try {
      const vendorRef = doc(db, "vendors", vendorId);
      await updateDoc(vendorRef, {
        status: "approved",
      });
      alert("Vendor approved!");
      setPendingVendors(pendingVendors.filter((vendor) => vendor.id !== vendorId));
    } catch (error) {
      console.error("Error approving vendor: ", error);
      alert("Failed to approve vendor.");
    }
  };

  const rejectVendor = async (vendorId: string) => {
    try {
      const vendorRef = doc(db, "vendors", vendorId);
      await updateDoc(vendorRef, {
        status: "rejected",
      });
      alert("Vendor rejected.");
      setPendingVendors(pendingVendors.filter((vendor) => vendor.id !== vendorId));
    } catch (error) {
      console.error("Error rejecting vendor: ", error);
      alert("Failed to reject vendor.");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex justify-center items-center">
    <div className="text-white text-center mt-10">Loading...</div>
    </div>
    )
  }

  if (!currentUser) {
    return (
    <div className="min-h-screen bg-black flex justify-center items-center">
    <div className="text-white text-center mt-10">Please Sign In as Admin to access the page.</div>
    </div>
    )
  }

  if (!isAdmin) {
    return (
      <div className=" bg-black text-white min-h-screen flex justify-center items-center flex-col">
        <h1 className="text-4xl font-bold mb-4">Access Denied</h1>
        <p className="mb-6">You do not have the necessary permissions to view this page.</p>
        <button
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          onClick={() => navigate("/")}
        >
          Return to Homepage
        </button>
      </div>
    );
  }

  return (
    <div className="p-10 bg-black text-white min-h-screen">
      <h1 className="text-4xl font-bold mb-8 mt-10">Admin Dashboard</h1>
      <div>
        <h2 className="text-2xl font-semibold mb-6">Pending Vendor Approvals</h2>
        {pendingVendors.length === 0 ? (
          <p className="text-lg">No pending vendors for approval.</p>
        ) : (
          <ul>
            {pendingVendors.map((vendor) => (
              <li key={vendor.id} className="mb-6 p-6 border border-gray-700 rounded-lg bg-gray-900">
                <h3 className="text-xl font-bold mb-2">{vendor.name}</h3>
                <p><strong>Description:</strong> {vendor.description}</p>
              <p><strong>Payment Methods:</strong> {vendor.paymentMethods}</p>
              <p><strong>Working Hours:</strong> {vendor.workingHours}</p>
              <p><strong>Cuisine:</strong> {vendor.cuisine}</p>
              <p><strong>Location:</strong> {vendor.location?.lat}, {vendor.location?.lng}</p>
                <div className="flex space-x-4">
                  <button
                    className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
                    onClick={() => approveVendor(vendor.id)}
                  >
                    Approve
                  </button>
                  <button
                    className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
                    onClick={() => rejectVendor(vendor.id)}
                  >
                    Reject
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default Admin;

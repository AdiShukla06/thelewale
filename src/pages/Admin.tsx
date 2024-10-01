import { collection, query, where, getDocs, updateDoc } from 'firebase/firestore';
import { doc, getDoc } from 'firebase/firestore';
import { useAuth } from '../context/AuthContext';
import { db } from '../firebaseConfig';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

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
          const userRef = doc(db, 'users', currentUser.uid);  
          const userDoc = await getDoc(userRef);

          if (userDoc.exists()) {
            const userData = userDoc.data();
            setIsAdmin(userData.role === 'admin');  

            if (userData.role === 'admin') {
              const vendorsQuery = query(collection(db, 'vendors'), where('status', '==', 'pending'));
              const vendorSnapshot = await getDocs(vendorsQuery);
              const vendorsList = vendorSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
              setPendingVendors(vendorsList);
            }
          } else {
            setIsAdmin(false);
          }
        } catch (error) {
          console.error('Error fetching user data: ', error);
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
      const vendorRef = doc(db, 'vendors', vendorId);
      await updateDoc(vendorRef, {
        status: 'approved'
      });
      alert('Vendor approved!');
      setPendingVendors(pendingVendors.filter(vendor => vendor.id !== vendorId));
    } catch (error) {
      console.error('Error approving vendor: ', error);
      alert('Failed to approve vendor.');
    }
  };

  const rejectVendor = async (vendorId: string) => {
    try {
      const vendorRef = doc(db, 'vendors', vendorId);
      await updateDoc(vendorRef, {
        status: 'rejected'
      });
      alert('Vendor rejected.');
      setPendingVendors(pendingVendors.filter(vendor => vendor.id !== vendorId));
    } catch (error) {
      console.error('Error rejecting vendor: ', error);
      alert('Failed to reject vendor.');
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!currentUser) {
    return <div>Please <a href="/login">log in</a> to access the admin page.</div>;
  }

  if (!isAdmin) {
    return (
      <div className="p-4">
        <h1 className="text-2xl font-bold">Access Denied</h1>
        <p>You do not have the necessary permissions to view this page.</p>
        <button
          className="mt-4 bg-blue-500 text-white p-2 rounded"
          onClick={() => navigate('/')}
        >
          Return to Homepage
        </button>
      </div>
    );
  }

  return (
    <div className="p-10">
      <h1 className="text-3xl font-bold">Admin Dashboard</h1>
      <div className="mt-6">
        <h2 className="text-2xl font-semibold">Pending Vendor Approvals</h2>
        {pendingVendors.length === 0 ? (
          <p>No pending vendors for approval.</p>
        ) : (
          <ul>
            {pendingVendors.map(vendor => (
              <li key={vendor.id} className="mb-4 p-4 border border-gray-300 rounded">
                <h3 className="text-xl font-semibold">{vendor.name}</h3>
                <p>{vendor.description}</p>
                <button
                  className="mr-2 bg-green-500 text-white px-4 py-2 rounded"
                  onClick={() => approveVendor(vendor.id)}
                >
                  Approve
                </button>
                <button
                  className="bg-red-500 text-white px-4 py-2 rounded"
                  onClick={() => rejectVendor(vendor.id)}
                >
                  Reject
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default Admin;

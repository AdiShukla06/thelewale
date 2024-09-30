// src/pages/VendorDetails.tsx

import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { db } from '../firebaseConfig';
import { doc, getDoc, collection, addDoc, query, orderBy, onSnapshot } from 'firebase/firestore';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { useAuth } from '../context/AuthContext';

const VendorDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [vendor, setVendor] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [reviews, setReviews] = useState<any[]>([]);
  const [newReview, setNewReview] = useState<string>('');
  const { currentUser } = useAuth();

  useEffect(() => {
    const fetchVendorDetails = async () => {
      try {
        const vendorDoc = doc(db, 'vendors', id);
        const vendorData = await getDoc(vendorDoc);
        
        if (vendorData.exists()) {
          setVendor(vendorData.data());
        } else {
          console.log('No such vendor!');
        }
      } catch (error) {
        console.error('Error fetching vendor details:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchVendorDetails();
  }, [id]);

  useEffect(() => {
    const fetchReviews = () => {
      const reviewsCollection = collection(db, 'vendors', id, 'reviews');
      const q = query(reviewsCollection, orderBy('createdAt', 'desc'));

      const unsubscribe = onSnapshot(q, (snapshot) => {
        const reviewsList = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setReviews(reviewsList);
      });

      return () => unsubscribe();
    };

    fetchReviews();
  }, [id]);

  const handleReviewSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (newReview.trim() === '') return;

    try {
      const reviewsCollection = collection(db, 'vendors', id, 'reviews');
      await addDoc(reviewsCollection, {
        content: newReview,
        createdAt: new Date(),
        name: currentUser?.displayName || "Anonymous"
      });
      setNewReview('');
    } catch (error) {
      console.error('Error adding review:', error);
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!vendor) {
    return <div>No vendor details available</div>;
  }

  return (
    <div className="p-10">
      <h1 className="text-2xl mb-4">{vendor.name}</h1>
      <p className="mb-2">{vendor.description}</p>
      <p className="mb-2">Payment Methods: {vendor.paymentMethods}</p>
      <p className="mb-2">Working Hours: {vendor.workingHours}</p>
      
      <h2 className="mt-6 mb-2">Dishes:</h2>
      <ul>
        {vendor.dishes && vendor.dishes.length > 0 ? (
          vendor.dishes.map((dish: any, index: number) => (
            <li key={index}>
              {dish.name} - ${dish.price}
            </li>
          ))
        ) : (
          <p>No dishes available.</p>
        )}
      </ul>

      <h2 className="mt-6 mb-2">Images:</h2>
      <div className="flex space-x-2">
        {vendor.images && vendor.images.length > 0 ? (
          vendor.images.map((image: string, index: number) => (
            <img key={index} src={image} alt={`Dish ${index + 1}`} className="w-1/4 h-auto" />
          ))
        ) : (
          <p>No images available.</p>
        )}
      </div>

      <h2 className="mt-6 mb-2">Location:</h2>
      {vendor.location && vendor.location.lat && vendor.location.lng ? (
        <MapContainer
          center={[vendor.location.lat, vendor.location.lng]}
          zoom={13}
          style={{ height: '400px', width: '100%' }}
        >
          <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
          <Marker 
            position={[vendor.location.lat, vendor.location.lng]} 
            
          >
            <Popup>{vendor.name}</Popup>
          </Marker>
        </MapContainer>
      ) : (
        <p>Location not available.</p>
      )}

      <h2 className="mt-6 mb-2">Reviews:</h2>
      <form onSubmit={handleReviewSubmit} className="mb-4">
        <textarea
          value={newReview}
          onChange={(e) => setNewReview(e.target.value)}
          placeholder="Write a review..."
          className="border border-gray-300 rounded p-2 w-full"
          required
        />
        <button type="submit" className="bg-blue-500 text-white px-4 py-2 mt-2 rounded">Submit Review</button>
      </form>
      <ul>
        {reviews.map((review) => (
          <li key={review.id} className="mb-2">
            <strong>{review.name}</strong>: {review.content}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default VendorDetails;

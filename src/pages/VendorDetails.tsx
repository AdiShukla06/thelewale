// src/pages/VendorDetails.tsx

import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { db } from '../firebaseConfig';
import { doc, getDoc, collection, addDoc, query, orderBy, onSnapshot, updateDoc, arrayUnion, increment } from 'firebase/firestore';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { useAuth } from '../context/AuthContext';
import { FaStar } from 'react-icons/fa';

const VendorDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [vendor, setVendor] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [reviews, setReviews] = useState<any[]>([]);
  const [newReview, setNewReview] = useState<string>('');
  const [newRating, setNewRating] = useState<number>(0); // New state for star rating
  const [averageRating, setAverageRating] = useState<number | null>(null); // State for average rating
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

        // Calculate the average rating
        const totalRating = reviewsList.reduce((acc, review) => acc + (review.rating || 0), 0);
        const avgRating = totalRating / reviewsList.length;
        setAverageRating(isNaN(avgRating) ? null : avgRating); // Update average rating
      });

      return () => unsubscribe();
    };

    fetchReviews();
  }, [id]);

  const handleReviewSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (newReview.trim() === '' || newRating === 0) return;

    try {
      const reviewsCollection = collection(db, 'vendors', id, 'reviews');
      await addDoc(reviewsCollection, {
        content: newReview,
        createdAt: new Date(),
        name: currentUser?.displayName || "Anonymous",
        rating: newRating // Add rating to the review
      });

      // Update the user's points and reviewsGiven in Firestore
    const userRef = doc(db, 'users', currentUser?.uid);
    await updateDoc(userRef, {
      points: increment(10), // Add 10 points for submitting a review
      reviewsGiven: increment(1) // Increment reviewsGiven by 1
    });


      setNewReview('');
      setNewRating(0); // Reset rating after submitting
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

  const googleMapsDirectionsUrl = `https://www.google.com/maps/dir/?api=1&destination=${vendor.location?.lat},${vendor.location?.lng}`;

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
        <div>
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

          <a
            href={googleMapsDirectionsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="bg-green-500 text-white px-4 py-2 mt-4 inline-block rounded"
          >
            Get Directions
          </a>
        </div>
      ) : (
        <p>Location not available.</p>
      )}

      {/* Average Rating */}
      <h2 className="mt-6 mb-2">Average Rating: </h2>
      {averageRating ? (
        <div className="flex items-center">
          <p className="text-lg font-bold">{averageRating.toFixed(1)} / 5</p>
          <div className="flex ml-2">
            {[...Array(5)].map((star, index) => (
              <FaStar
                key={index}
                color={index < Math.round(averageRating) ? 'gold' : 'gray'}
              />
            ))}
          </div>
        </div>
      ) : (
        <p>No ratings yet.</p>
      )}

      {/* Reviews Section */}
      <h2 className="mt-6 mb-2">Reviews:</h2>
      <form onSubmit={handleReviewSubmit} className="mb-4">
        <textarea
          value={newReview}
          onChange={(e) => setNewReview(e.target.value)}
          placeholder="Write a review..."
          className="border border-gray-300 rounded p-2 w-full"
          required
        />

        {/* Star Rating Input */}
        <div className="flex items-center mt-2">
          <p className="mr-2">Rating:</p>
          {[...Array(5)].map((star, index) => (
            <FaStar
              key={index}
              className="cursor-pointer"
              color={index < newRating ? 'gold' : 'gray'}
              onClick={() => setNewRating(index + 1)} // Update star rating on click
            />
          ))}
        </div>

        <button type="submit" className="bg-blue-500 text-white px-4 py-2 mt-2 rounded">Submit Review</button>
      </form>

      <ul>
        {reviews.map((review) => (
          <li key={review.id} className="mb-2">
            <strong>{review.name}</strong>: {review.content}
            <div className="flex">
              {[...Array(5)].map((star, index) => (
                <FaStar
                  key={index}
                  color={index < review.rating ? 'gold' : 'gray'}
                />
              ))}
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default VendorDetails;

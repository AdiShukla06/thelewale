import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { db } from "../firebaseConfig";
import {
  doc,
  getDoc,
  collection,
  addDoc,
  query,
  orderBy,
  onSnapshot,
  updateDoc,
  increment,
} from "firebase/firestore";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import { useAuth } from "../context/AuthContext";
import { FaStar } from "react-icons/fa";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import L from 'leaflet';
import markerIcon from '../assets/marker.png'; 

const customIcon = L.icon({
  iconUrl: markerIcon, // Path to your custom marker image
  iconSize: [32, 32], // Adjust the size to fit your design
  iconAnchor: [16, 32], // Adjust the anchor point to position it correctly on the map
  popupAnchor: [0, -32], // Where the popup should appear relative to the icon
});

const VendorDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [vendor, setVendor] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");
  const [reviews, setReviews] = useState<any[]>([]);
  const [newReview, setNewReview] = useState<string>("");
  const [newRating, setNewRating] = useState<number>(0);
  const [averageRating, setAverageRating] = useState<number | null>(null);
  const { currentUser } = useAuth();

  useEffect(() => {
    const fetchVendorDetails = async () => {
      try {
        if (!id) {
          console.error("Vendor ID is missing");
          return;
        }
        
        const vendorDoc = doc(db, "vendors", id as string);
        const vendorData = await getDoc(vendorDoc);

        if (vendorData.exists()) {
          setVendor(vendorData.data());
        } else {
          console.log("No such vendor!");
        }
      } catch (error) {
        console.error("Error fetching vendor details:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchVendorDetails();
  }, [id]);

  useEffect(() => {
    const fetchReviews = () => {
      if (!id) {
        console.error("Vendor ID is missing");
        return;
      }
      
      const reviewsCollection = collection(db, "vendors", id as string, "reviews");
      const q = query(reviewsCollection, orderBy("createdAt", "desc"));

      const unsubscribe = onSnapshot(q, (snapshot) => {
        const reviewsList = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setReviews(reviewsList);

        const totalRating = reviewsList.reduce(
          (acc, review) => acc + ((review as any).rating || 0),
          0
        );
        const avgRating = totalRating / reviewsList.length;
        setAverageRating(isNaN(avgRating) ? null : avgRating);
      });

      return () => unsubscribe();
    };

    fetchReviews();
  }, [id]);

  const handleReviewSubmit = async (
    event: React.FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();
    if (newReview.trim() === "" || newRating === 0) return;

    try {
      const reviewsCollection = collection(db, "vendors", id as string, "reviews");
      await addDoc(reviewsCollection, {
        content: newReview,
        createdAt: new Date(),
        name: currentUser?.displayName || "Anonymous",
        rating: newRating,
      });

      if (currentUser?.uid) {
        const userRef = doc(db, "users", currentUser.uid);
        await updateDoc(userRef, {
          points: increment(10),
          reviewsGiven: increment(1),
        });
      } else {
        console.error("User is not logged in, cannot update points and reviews.");
      }

      setNewReview("");
      setNewRating(0);
    } catch (error) {
      console.error("Error adding review:", error);
    }
  };

  if (loading) {
    
    return (
    <div className="min-h-screen flex justify-center items-center">
    <div className="text-white text-center mt-10">Loading...</div>;
    </div>
    )
  }

  if (!vendor) {
    return (
      <div className="min-h-screen flex justify-center items-center">
      <div className="text-white text-center mt-10">
        No vendor details available
      </div>
      </div>
    );
  }

  const googleMapsDirectionsUrl = `https://www.google.com/maps/dir/?api=1&destination=${vendor.location?.lat},${vendor.location?.lng}`;

  return (
    <motion.div
  className="bg-black text-white min-h-screen font-inter"
  initial={{ opacity: 0 }}
  animate={{ opacity: 1 }}
  exit={{ opacity: 0 }}
  transition={{ duration: 0.5 }}
>
  {/* Images */}
  {vendor.images && vendor.images.length > 0 && (
    <div className="flex justify-center space-x-2 overflow-x-auto mb-6 flex-wrap mt-20 sm:mt-24">
      {vendor.images.map((image: string, index: number) => (
        <img
          key={index}
          src={image}
          alt={`Vendor Image ${index + 1}`}
          className="w-40 h-40 object-cover rounded sm:w-64 sm:h-64 mt-4" // Adjust size for mobile
        />
      ))}
    </div>
  )}

  {/* name and info of vendor */}
  <div className="ml-4 sm:ml-10">
    <h1 className="text-2xl sm:text-5xl font-bold mb-2">{vendor.name}</h1>
    <p className="mb-6 sm:mb-10 text-sm sm:text-base">{vendor.description}</p>
  </div>

  {/* Horizontal Navbar */}
  <div className="flex flex-row justify-center sm:space-x-4 mb-6 pb-4">
    {["overview", "photos", "menu", "location", "reviews"].map((tab) => (
      <button
        key={tab}
        onClick={() => setActiveTab(tab)}
        className={cn(
          "relative inline-flex items-center justify-center p-2 mb-2 sm:mb-0 text-sm font-medium",
          activeTab === tab ? "border-b-2 border-gray-700" : ""
        )}
      >
        {tab.charAt(0).toUpperCase() + tab.slice(1)}
      </button>
    ))}
  </div>

  {/* Tab Content */}
  <div className="p-4 sm:p-6 ml-2 sm:ml-4">
    {activeTab === "overview" && (
      <>
        <p className="mb-2 sm:mb-4 text-sm sm:text-base">
          Payment Methods: The vendor accepts {vendor.paymentMethods.toUpperCase()}
        </p>
        <p className="mb-2 sm:mb-4 text-sm sm:text-base">
          Working Hours: {vendor.workingHours}
        </p>
        <div className="mt-6 sm:mt-10">
        {vendor.location && (
  <MapContainer
    center={[vendor.location.lat, vendor.location.lng]}
    zoom={13}
    style={{ height: "200px", width: "80%", maxWidth: "400px" }}
  >
    <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
    <Marker position={[vendor.location.lat, vendor.location.lng]}
    icon={customIcon} >
      <Popup>{vendor.name}</Popup>
    </Marker>
  </MapContainer>
)}

          <a
            href={googleMapsDirectionsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="underline text-white mt-3 inline-block rounded hover:text-blue-400 text-sm"
          >
            Get Directions
          </a>
        </div>
        <div>
          <h2 className="text-base sm:text-xl mb-2 sm:mt-10 mt-10 ">
            Average Rating: {averageRating ? averageRating.toFixed(1) : "No ratings yet"}
          </h2>
          <form onSubmit={handleReviewSubmit} className="mb-4">
            <textarea
              value={newReview}
              onChange={(e) => setNewReview(e.target.value)}
              placeholder="Write a review..."
              className="border border-gray-700 rounded p-2 w-full bg-gray-800 text-white text-sm sm:text-base"
            />
            <div className="flex items-center mt-2">
              <p className="mr-2 text-sm sm:text-base">Rating:</p>
              {[...Array(5)].map((_, index) => (
                <FaStar
                  key={index}
                  className="cursor-pointer"
                  color={index < newRating ? "gold" : "gray"}
                  onClick={() => setNewRating(index + 1)}
                />
              ))}
            </div>
            <button
              type="submit"
              className="bg-blue-500 text-white px-4 py-2 mt-4 rounded text-sm sm:text-base"
            >
              Submit Review
            </button>
          </form>
          <ul>
                {reviews.map((review) => (
                  <li
                    key={review.id}
                    className="mb-2 border-b border-gray-700 pb-2 sm:text-base text-sm"
                  >
                    <strong>{review.name}</strong>: {review.content}
                    <div className="flex">
                      {[...Array(5)].map((_, index) => (
                        <FaStar
                          key={index}
                          color={index < review.rating ? "gold" : "gray"}
                        />
                      ))}
                    </div>
                  </li>
                ))}
              </ul>
        </div>
      </>
    )}

    {activeTab === "photos" && (
      <div className="flex space-x-2 flex-wrap justify-center">
        {vendor.images.map((image: string, index: number) => (
          <img
            key={index}
            src={image}
            alt={`Dish ${index + 1}`}
            className="w-32 h-32 sm:w-48 sm:h-48 object-cover rounded mt-2"
          />
        ))}
      </div>
    )}

    {activeTab === "menu" && (
      <ul className="text-sm sm:text-base">
        {vendor.dishes.map((dish: any, index: number) => (
          <li key={index} className="mb-2">
            {dish.name} - ₹{dish.price}
          </li>
        ))}
      </ul>
    )}

    {activeTab === "location" && vendor.location && (
      <div className="flex flex-col justify-center items-center">
        <MapContainer
          center={[vendor.location.lat, vendor.location.lng]}
          zoom={13}
          style={{ height: "300px", width: "100%", maxWidth: "400px" }}
        >
          <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
          <Marker position={[vendor.location.lat, vendor.location.lng]}
          icon={customIcon} >
            <Popup>{vendor.name}</Popup>
          </Marker>
        </MapContainer>
        <a
          href={googleMapsDirectionsUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="underline text-white mt-3 inline-block rounded hover:text-blue-400 text-sm sm:text-base"
        >
          Get Directions
        </a>
      </div>
    )}

    {activeTab === "reviews" && (
      <div>
        <h2 className="text-base sm:text-xl mb-2">
          Average Rating: {averageRating ? averageRating.toFixed(1) : "No ratings yet"}
        </h2>
        <form onSubmit={handleReviewSubmit} className="mb-4">
          <textarea
            value={newReview}
            onChange={(e) => setNewReview(e.target.value)}
            placeholder="Write a review..."
            className="border border-gray-700 rounded p-2 w-full bg-gray-800 text-white text-sm sm:text-base"
          />
          <div className="flex items-center mt-2">
            <p className="mr-2 text-sm sm:text-base">Rating:</p>
            {[...Array(5)].map((_, index) => (
              <FaStar
                key={index}
                className="cursor-pointer"
                color={index < newRating ? "gold" : "gray"}
                onClick={() => setNewRating(index + 1)}
              />
            ))}
          </div>
          <button
            type="submit"
            className="bg-blue-500 text-white px-4 py-2 mt-4 rounded text-sm sm:text-base"
          >
            Submit Review
          </button>
        </form>
        <ul>
                {reviews.map((review) => (
                  <li
                    key={review.id}
                    className="mb-2 border-b border-gray-700 pb-2 sm:text-base text-sm"
                  >
                    <strong>{review.name}</strong>: {review.content}
                    <div className="flex">
                      {[...Array(5)].map((_, index) => (
                        <FaStar
                          key={index}
                          color={index < review.rating ? "gold" : "gray"}
                        />
                      ))}
                    </div>
                  </li>
                ))}
              </ul>
      </div>
    )}
  </div>
</motion.div>

  );
};

export default VendorDetails;

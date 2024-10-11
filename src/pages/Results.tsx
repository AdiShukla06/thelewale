import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { db } from "../firebaseConfig";
import { collection, getDocs } from "firebase/firestore";
import Fuse from "fuse.js";
import { motion } from "framer-motion";
import { RainbowButton } from "@/components/ui/rainbow-button";
import ShinyButton from "@/components/ui/shiny-button";


const Results: React.FC = () => {
  const [vendors, setVendors] = useState<any[]>([]);
  const [filteredVendors, setFilteredVendors] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const navigate = useNavigate();
  const location = useLocation();

  // State to store user's location coordinates
  const [userLocation, setUserLocation] = useState<{
    lat: number;
    lng: number;
  } | null>(null);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const dish = params.get("dish");
    const place = params.get("place");

    if (dish) {
      setSearchQuery(dish);
      fetchVendors(dish, "dish");
    } else if (place) {
      setSearchQuery(place);
      fetchVendors(place, "place");
    }

    // Get user's location on initial render
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setUserLocation({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        });
      },
      (error) => console.error("Error getting user location:", error)
    );
  }, [location]);

  const fetchVendors = async (search: string, searchType: string) => {
    const vendorsCollection = collection(db, "vendors");

    try {
      const vendorSnapshot = await getDocs(vendorsCollection);
      const vendorList = vendorSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      // Filter only vendors with approved status
      const approvedVendors = vendorList.filter(
        (vendor) => vendor.status === "approved"
      );
      console.log("Approved vendors:", approvedVendors);

      setVendors(approvedVendors);
      filterVendors(search, approvedVendors, searchType);
    } catch (error) {
      console.error("Error fetching vendors: ", error);
    }
  };

  const calculateDistance = (
    lat1: number,
    lng1: number,
    lat2: number,
    lng2: number
  ) => {
    const R = 6371; // Radius of Earth in km
    const dLat = (lat2 - lat1) * (Math.PI / 180);
    const dLng = (lng2 - lng1) * (Math.PI / 180);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * (Math.PI / 180)) *
        Math.cos(lat2 * (Math.PI / 180)) *
        Math.sin(dLng / 2) *
        Math.sin(dLng / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  const filterVendors = (
    query: string,
    vendorList: any[],
    searchType: string
  ) => {
    console.log("Search query:", query, "Search type:", searchType);

    if (query.trim() === "") {
      setFilteredVendors(vendorList);
      return;
    }

    if (searchType === "dish") {
      const fuse = new Fuse(vendorList, {
        keys: ["name", "description ", "cuisine", "dishes.name"  ],
        threshold: 0.3,
      });
      const results = fuse.search(query);
      setFilteredVendors(results.map((result) => result.item));
    } else if (searchType === "place") {
      if (query.includes("Lat:") && query.includes("Lng:")) {
        const [latStr, lngStr] = query
          .split(",")
          .map((part) => part.split(":")[1].trim());
        const userLat = parseFloat(latStr);
        const userLng = parseFloat(lngStr);

        const nearbyVendors = vendorList.filter((vendor) => {
          const vendorLat = vendor.location?.lat;
          const vendorLng = vendor.location?.lng;
          if (vendorLat && vendorLng) {
            const distance = calculateDistance(
              userLat,
              userLng,
              vendorLat,
              vendorLng
            );
            return distance <= 30; // Distance threshold in km
          }
          return false;
        });
        setFilteredVendors(nearbyVendors);
      } else {
        const fuse = new Fuse(vendorList, {
          keys: ["location.name"],
          threshold: 0.3,
        });
        const results = fuse.search(query);
        setFilteredVendors(results.map((result) => result.item));
      }
    }
  };

  const handleSearch = () => {
    if (searchQuery.includes("Lat:")) {
      // If it's a location search
      filterVendors(searchQuery, vendors, "place");
    } else {
      // If it's a dish search
      filterVendors(searchQuery, vendors, "dish");
    }
  };

  return (
    <motion.div
      className="min-h-screen bg-black"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
    >
      {/* Search Bar */}
      <div className="flex justify-center mb-4">
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search for more dishes or places..."
          className="border border-gray-300 rounded p-2 w-1/2 mt-20 focus:outline-none focus:ring focus:border-blue-500"
        />
        <button
          onClick={handleSearch}
          className="bg-gradient-to-r from-blue-400 to-indigo-600 text-white px-6 py-3 ml-2 mt-20 rounded-sm shadow-lg transition-transform transform hover:scale-105 hover:shadow-xl duration-300 ease-in-out"
        >
          Search
        </button>
      </div>

      {/* Vendor Cards */}
      <h2 className="text-xl text-center mb-6 text-white">
        Search Results for "{searchQuery}"
      </h2>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 text-white mx-10 mt-10">
        {filteredVendors.length > 0 ? (
          filteredVendors.map((vendor) => (
            <div
              key={vendor.id}
              className="rounded-lg shadow-lg p-4 transition-transform transform hover:scale-105 hover:shadow-2xl duration-300 ease-in-out  hover:bg-gray-950"
            >
              {/* Vendor Image */}
              {vendor.images && vendor.images.length > 0 ? (
                <img
                  src={vendor.images[0]}
                  alt={vendor.name}
                  className="w-full h-48 object-cover rounded-lg mb-4 transition-opacity duration-300 ease-in-out"
                />
              ) : (
                <div className="w-full h-48 bg-gray-700 rounded-lg mb-4 flex items-center justify-center">
                  <p>No image available</p>
                </div>
              )}

              {/* Vendor Info */}
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="font-bold text-xl mb-1">{vendor.name}</h3>
                  <p className="text-gray-400">
                    Distance:{" "}
                    {userLocation && vendor.location
                      ? calculateDistance(
                          userLocation.lat,
                          userLocation.lng,
                          vendor.location.lat,
                          vendor.location.lng
                        ).toFixed(2) + " km"
                      : "Location unavailable"}
                  </p>
                </div>

                {/* View Details Button */}
                <div onClick={() => navigate(`/vendor/${vendor.id}`)}>
                  <ShinyButton>View Details</ShinyButton>
                </div>
              </div>
            </div>
          ))
        ) : (
          <p>Oops! No results found for "{searchQuery}".</p>
        )}
      </div>
    </motion.div>
  );
};

export default Results;

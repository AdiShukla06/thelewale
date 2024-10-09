import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { collection, getDocs } from "firebase/firestore"; // Firebase imports
import { db } from "../firebaseConfig"; // Firebase config
import Fuse from "fuse.js";
import NumberTicker from "@/components/ui/number-ticker";
import Marquee from "@/components/ui/marquee"; // Updated import for Marquee
import Hero from "@/components/Hero";
import ShinyButton from "@/components/ui/shiny-button";
import TextReveal from "@/components/ui/text-reveal";
import { motion } from "framer-motion";

const DEFAULT_LOCATION = { lat: 28.6139, lng: 77.209 }; // Delhi coordinates
const OPENWEATHER_API_KEY = "f4261c8d6a89220dd425fa02df5780f4"; // Replace with your OpenWeather API key

const Landing: React.FC = () => {
  const [userLocation, setUserLocation] = useState<{
    lat: number;
    lng: number;
  } | null>(null);
  const [weatherData, setWeatherData] = useState<any>(null);
  const [nearbyVendors, setNearbyVendors] = useState<any[]>([]); // To store nearby vendors
  const navigate = useNavigate();

  // Fetch weather data based on location
  const fetchWeatherData = async (lat: number, lng: number) => {
    try {
      const response = await axios.get(
        `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lng}&units=metric&appid=${OPENWEATHER_API_KEY}`
      );
      setWeatherData(response.data);
    } catch (error) {
      console.error("Error fetching weather data:", error);
    }
  };

  // Fetch vendors from Firebase
  const fetchVendors = async () => {
    const vendorsCollection = collection(db, "vendors");
    try {
      const vendorSnapshot = await getDocs(vendorsCollection);
      const vendorList = vendorSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      const approvedVendors = vendorList.filter(
        (vendor) => vendor.status === "approved"
      );
      filterNearbyVendors(approvedVendors);
    } catch (error) {
      console.error("Error fetching vendors: ", error);
    }
  };

  // Calculate distance between two coordinates
  const calculateDistance = (
    lat1: number,
    lng1: number,
    lat2: number,
    lng2: number
  ) => {
    const R = 6371; // Radius of the Earth in km
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

  // Filter vendors based on proximity to user's location
  const filterNearbyVendors = (vendorList: any[]) => {
    if (userLocation) {
      const nearbyVendors = vendorList.filter((vendor) => {
        const vendorLat = vendor.location?.lat;
        const vendorLng = vendor.location?.lng;
        if (vendorLat && vendorLng) {
          const distance = calculateDistance(
            userLocation.lat,
            userLocation.lng,
            vendorLat,
            vendorLng
          );
          return distance <= 30; // Show vendors within 30 km
        }
        return false;
      });
      setNearbyVendors(nearbyVendors);
    }
  };

  // Request user location permission
  const requestLocationPermission = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          });
        },
        () => {
          setUserLocation(DEFAULT_LOCATION); // Fallback to Delhi
        }
      );
    } else {
      setUserLocation(DEFAULT_LOCATION); // Fallback to Delhi if geolocation is unsupported
    }
  };

  // Fetch weather and vendors when the component mounts or user location changes
  useEffect(() => {
    if (userLocation) {
      fetchWeatherData(userLocation.lat, userLocation.lng);
      fetchVendors();
    }
  }, [userLocation]);

  // Request location on initial render
  useEffect(() => {
    requestLocationPermission();
  }, []);

  // Vendor card component for displaying vendor details
  const VendorCard = ({
    id,
    name,
    description,

    location,
  }: {
    id: string;
    name: string;
    description: string;
    location: { lat: number; lng: number };
  }) => {
    const distance =
      userLocation && location
        ? calculateDistance(
            userLocation.lat,
            userLocation.lng,
            location.lat,
            location.lng
          ).toFixed(2) + " km"
        : "Location unavailable";

    return (
      <div className="w-80 bg-gray-950 rounded-xl p-4 shadow-lg hover:bg-gray-900">
        <div className="flex items-center mb-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 mr-3 "></div>
          <div>
            <h3 className="text-white font-semibold">{name}</h3>
            <p className="text-gray-400 text-sm text-left">{distance}</p>
          </div>
        </div>
        <p className="text-white mb-3 text-left">{description}</p>

        <div className="" onClick={() => navigate(`/vendor/${id}`)}>
          <ShinyButton>View Details</ShinyButton>
        </div>
      </div>
    );
  };

  return (
    <motion.div className="min-h-screen flex flex-col items-center justify-center bg-black"
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    exit={{ opacity: 0 }}
    transition={{ duration: 0.5 }}>
      {/* Hero Section */}
      <Hero />

      {/* Weather-based Suggestions */}
      <section className="w-full p-10 text-center text-white font-inter mt-20">
        {weatherData ? (
          <>
            <h2 className="text-2xl mb-6">
              It is{" "}
              <NumberTicker
                className="text-white"
                value={weatherData.main.temp}
              />
              °C and{" "}
              <NumberTicker
                className="text-white"
                value={weatherData.main.humidity}
              />
              % humid in {weatherData.name || "Delhi"}
            </h2>
            {weatherData.main.temp < 20 && (
              <p className="text-lg mb-4">
                It's quite cold, perfect weather to enjoy some hot soups!
              </p>
            )}
            {weatherData.main.temp >= 20 && weatherData.main.temp <= 30 && (
              <p className="text-lg mb-4">
                The weather is mild, how about some fresh snacks and beverages?
              </p>
            )}
            {weatherData.main.temp > 30 && (
              <p className="text-lg mb-4">
                It's hot outside! Cool down with some refreshing cold drinks and
                light food.
              </p>
            )}
          </>
        ) : (
          <p>Loading weather data...</p>
        )}
      </section>

      {/* Nearby Vendors Section */}
      <section className="relative flex h-[500px] w-full flex-col items-center justify-center overflow-hidden rounded-lg p-10 text-center text-white font-inter mt-24">
        <h2 className="text-2xl mb-6">Vendors Near You</h2>

        <Marquee pauseOnHover className="[--duration:20s]">
          {nearbyVendors.slice(0, nearbyVendors.length / 2).map((vendor) => (
            <VendorCard
              key={vendor.id}
              {...vendor}
              userLocation={userLocation}
            />
          ))}
        </Marquee>

        <Marquee reverse pauseOnHover className="[--duration:20s]">
          {nearbyVendors.slice(nearbyVendors.length / 2).map((vendor) => (
            <VendorCard key={vendor.id} {...vendor} />
          ))}
        </Marquee>
      </section>

      {/* Add Vendor Section */}
      <section className="w-full p-10 text-center">
  {/* Magic UI TextReveal for the heading */}
  <div>
    <TextReveal text="Do you know a momo wali aunty? Add her now!" />
  </div>
  
  {/* ShinyButton for adding a new vendor */}
  {/* <div className="text-white" onClick={() => navigate(`/add-vendor`)}>
          <ShinyButton>Add Vendor</ShinyButton>
        </div> */}
</section>
    </motion.div>
  );
};

export default Landing;

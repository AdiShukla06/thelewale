import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { collection, getDocs } from 'firebase/firestore'; // Firebase imports
import { db } from '../firebaseConfig'; // Firebase config
import Fuse from 'fuse.js';

const DEFAULT_LOCATION = { lat: 28.6139, lng: 77.209 }; // Delhi coordinates
const OPENWEATHER_API_KEY = 'f4261c8d6a89220dd425fa02df5780f4'; // Replace with your OpenWeather API key

const Landing: React.FC = () => {
  const [dishSearchTerm, setDishSearchTerm] = useState('');
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
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
      console.error('Error fetching weather data:', error);
    }
  };

  // Fetch vendors from Firebase
  const fetchVendors = async () => {
    const vendorsCollection = collection(db, 'vendors');
    try {
      const vendorSnapshot = await getDocs(vendorsCollection);
      const vendorList = vendorSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      const approvedVendors = vendorList.filter((vendor) => vendor.status === 'approved');
      filterNearbyVendors(approvedVendors);
    } catch (error) {
      console.error('Error fetching vendors: ', error);
    }
  };

  // Calculate distance between two coordinates
  const calculateDistance = (lat1: number, lng1: number, lat2: number, lng2: number) => {
    const R = 6371; // Radius of the Earth in km
    const dLat = (lat2 - lat1) * (Math.PI / 180);
    const dLng = (lng2 - lng1) * (Math.PI / 180);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) *
      Math.sin(dLng / 2) * Math.sin(dLng / 2);
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
          const distance = calculateDistance(userLocation.lat, userLocation.lng, vendorLat, vendorLng);
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

  // Handle dish search
  const handleDishSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (dishSearchTerm) {
      navigate(`/results?dish=${dishSearchTerm}`);
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

  return (
    <div className="min-h-screen flex flex-col items-center justify-center">
      {/* Hero Section */}
      <section className="w-full h-screen flex flex-col items-center justify-center bg-blue-100">
        <h1 className="text-5xl font-bold mb-4">Thelewale</h1>

        {/* Dish Search */}
        <form onSubmit={handleDishSearch} className="w-1/2 flex justify-center space-x-2 mb-4">
          <input
            type="text"
            value={dishSearchTerm}
            onChange={(e) => setDishSearchTerm(e.target.value)}
            placeholder="Search for dishes..."
            className="w-full p-2 border border-gray-300 rounded"
          />
          <button
            type="submit"
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            Search Dishes
          </button>
        </form>
      </section>

      {/* Weather-based Suggestions */}
      <section className="w-full p-10 bg-gray-100 text-center">
        {weatherData ? (
          <>
            <h2 className="text-2xl mb-6">
              It is {weatherData.main.temp}°C and {weatherData.main.humidity}% humid in{' '}
              {weatherData.name || 'Delhi'}
            </h2>

            {/* Conditional message based on temperature */}
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
                It's hot outside! Cool down with some refreshing cold drinks and light food.
              </p>
            )}
          </>
        ) : (
          <p>Loading weather data...</p>
        )}
      </section>

      {/* Nearby Vendors Section */}
      <section className="w-full p-10 bg-white text-center">
        <h2 className="text-2xl mb-6">Vendors Near You</h2>
        <div className="grid grid-cols-3 gap-4">
          {nearbyVendors.length > 0 ? (
            nearbyVendors.map((vendor) => (
              <div key={vendor.id} className="bg-white p-4 rounded shadow">
                <h3 className="font-bold text-xl">{vendor.name}</h3>
                <p>{vendor.description}</p>
                <p>Rating: {vendor.rating}</p>
                <p>
                  Distance: {userLocation && vendor.location ? (
                    calculateDistance(userLocation.lat, userLocation.lng, vendor.location.lat, vendor.location.lng).toFixed(2) + ' km'
                  ) : (
                    'Location unavailable'
                  )}
                </p>
                <button
                  onClick={() => navigate(`/vendor/${vendor.id}`)}
                  className="bg-green-500 text-white px-4 py-2 rounded mt-2"
                >
                  View Details
                </button>
              </div>
            ))
          ) : (
            <p>No nearby vendors found.</p>
          )}
        </div>
      </section>

      {/* Add Vendor Section */}
      <section className="w-full p-10 bg-white text-center">
        <button
          onClick={() => navigate('/add-vendor')}
          className="bg-green-500 text-white px-4 py-2 rounded-md hover:bg-green-700"
        >
          Add New Vendor
        </button>
      </section>
    </div>
  );
};

export default Landing;

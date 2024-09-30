// src/pages/Landing.tsx

import React, { useState} from 'react';
import { useNavigate } from 'react-router-dom';

const Landing: React.FC = () => {
  const [location, setLocation] = useState('');
  const navigate = useNavigate();

  // Handling search input and navigating to results page
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (location) {
      navigate(`/results?search=${location}`);
    }
  };

  // Ask for location permission and get user location
  const requestLocationPermission = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition((position) => {
        setLocation(`Lat: ${position.coords.latitude}, Lng: ${position.coords.longitude}`);
      });
    } else {
      alert("Geolocation is not supported by this browser.");
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center">
      {/* Hero Section */}
      <section className="w-full h-screen flex flex-col items-center justify-center bg-blue-100">
        <h1 className="text-5xl font-bold mb-4">Thelewale</h1>
        <form onSubmit={handleSearch} className="w-1/2 flex justify-center space-x-2">
          <button
            type="button"
            onClick={requestLocationPermission}
            className="bg-gray-200 p-2 rounded-l-md"
          >
            📍
          </button>
          <input
            type="text"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            placeholder="Search for dishes or vendors..."
            className="w-full p-2 border border-gray-300 rounded-r-md"
          />
          <button
            type="submit"
            className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-700"
          >
            Search
          </button>
        </form>
      </section>

      {/* Weather-based Suggestions Section */}
      <section className="w-full p-10 bg-gray-100 text-center">
        <h2 className="text-2xl mb-6">Order hot soups in cold winters of Delhi</h2>
        <div className="flex flex-wrap justify-center">
          <div className="w-1/3 p-4">
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h3 className="font-bold text-xl mb-2">Vendor 1</h3>
              <p>Famous hot soups</p>
            </div>
          </div>
          <div className="w-1/3 p-4">
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h3 className="font-bold text-xl mb-2">Vendor 2</h3>
              <p>Delicious noodle soups</p>
            </div>
          </div>
          <div className="w-1/3 p-4">
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h3 className="font-bold text-xl mb-2">Vendor 3</h3>
              <p>Spicy ramen bowls</p>
            </div>
          </div>
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

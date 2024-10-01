// src/pages/Landing.tsx

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const Landing: React.FC = () => {
  const [dishSearchTerm, setDishSearchTerm] = useState('');
  const [placeSearchTerm, setPlaceSearchTerm] = useState('');
  const [placeSuggestions, setPlaceSuggestions] = useState<string[]>([]);
  const navigate = useNavigate();

  // Handle dish search
  const handleDishSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (dishSearchTerm) {
      navigate(`/results?dish=${dishSearchTerm}`);
    }
  };

  // Handle place search
  const handlePlaceSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (placeSearchTerm) {
      navigate(`/results?place=${placeSearchTerm}`);
    }
  };

  // Fetch place suggestions using Nominatim API for autocomplete
  const fetchPlaceSuggestions = async (query: string) => {
    try {
      const response = await axios.get(
        `https://nominatim.openstreetmap.org/search?q=${query}&format=json&limit=5`
      );
      setPlaceSuggestions(response.data.map((place: any) => place.display_name));
    } catch (error) {
      console.error('Error fetching place suggestions:', error);
    }
  };

  // Request location permission and get user location for place search
  const requestLocationPermission = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition((position) => {
        setPlaceSearchTerm(`Lat: ${position.coords.latitude}, Lng: ${position.coords.longitude}`);
      });
    } else {
      alert('Geolocation is not supported by this browser.');
    }
  };

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

        {/* Place Search */}
        <form onSubmit={handlePlaceSearch} className="w-1/2 flex justify-center space-x-2">
          <button
            type="button"
            onClick={requestLocationPermission}
            className="bg-gray-200 p-2 rounded-l-md"
          >
            📍
          </button>
          <input
            type="text"
            value={placeSearchTerm}
            onChange={(e) => {
              setPlaceSearchTerm(e.target.value);
              fetchPlaceSuggestions(e.target.value);
            }}
            placeholder="Search for places..."
            className="w-full p-2 border border-gray-300 rounded-r-md"
          />
          <button
            type="submit"
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            Search Places
          </button>
        </form>

        {/* Autocomplete Suggestions for Places */}
        {placeSuggestions.length > 0 && (
          <div className="bg-white border border-gray-300 mt-2 w-1/2 rounded">
            <ul>
              {placeSuggestions.map((suggestion, index) => (
                <li
                  key={index}
                  onClick={() => {
                    setPlaceSearchTerm(suggestion);
                    setPlaceSuggestions([]);
                  }}
                  className="p-2 cursor-pointer hover:bg-gray-200"
                >
                  {suggestion}
                </li>
              ))}
            </ul>
          </div>
        )}
      </section>

      {/* Weather-based Suggestions */}
      <section className="w-full p-10 bg-gray-100 text-center">
        <h2 className="text-2xl mb-6">Order hot soups in cold winters of Delhi</h2>
        <div className="flex flex-wrap justify-center">
          <div className="w-1/3 p-4">
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h3 className="font-bold text-xl mb-2">Vendor 1</h3>
              <p>Famous hot soups</p>
            </div>
          </div>
          {/* Other vendor cards */}
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

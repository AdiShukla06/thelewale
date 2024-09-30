// src/pages/Results.tsx

import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { db } from '../firebaseConfig'; // Import Firestore database
import { collection, getDocs } from 'firebase/firestore';
import Fuse from 'fuse.js';

const Results: React.FC = () => {
  const [vendors, setVendors] = useState<any[]>([]);
  const [filteredVendors, setFilteredVendors] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const search = params.get('search');
    if (search) {
      setSearchQuery(search);
      fetchVendors(search);
    }
  }, [location]);

  // Fetch vendors from Firestore
  const fetchVendors = async (search: string) => {
    const vendorsCollection = collection(db, 'vendors');
    
    try {
      const vendorSnapshot = await getDocs(vendorsCollection);
      const vendorList = vendorSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setVendors(vendorList);
      filterVendors(search, vendorList); // Filter vendors based on the initial search query
    } catch (error) {
      console.error("Error fetching vendors: ", error);
    }
  };

  // Filter vendors using Fuse.js for fuzzy search
  const filterVendors = (query: string, vendorList: any[]) => {
    if (query.trim() === '') {
      setFilteredVendors(vendorList);
      return;
    }

    const fuse = new Fuse(vendorList, {
      keys: ['name', 'description'], // Adjust based on your data structure
      includeScore: true,
      threshold: 0.3, // Adjust for fuzziness
    });

    const results = fuse.search(query);
    setFilteredVendors(results.map(result => result.item));
  };

  const handleSearch = () => {
    filterVendors(searchQuery, vendors);
  };

  return (
    <div className="min-h-screen p-10">
      {/* Search Bar */}
      <div className="flex justify-center mb-4">
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search for more dishes..."
          className="border border-gray-300 rounded p-2 w-1/2"
        />
        <button
          onClick={handleSearch}
          className="bg-blue-500 text-white px-4 py-2 rounded ml-2"
        >
          Search
        </button>
      </div>

      {/* Vendor Cards */}
      <h2 className="text-2xl text-center mb-6">Search Results</h2>
      <div className="grid grid-cols-3 gap-4">
        {filteredVendors.length > 0 ? (
          filteredVendors.map((vendor) => (
            <div key={vendor.id} className="bg-white p-4 rounded shadow">
              <h3 className="font-bold text-xl">{vendor.name}</h3>
              <p>{vendor.description}</p>
              <p>Rating: {vendor.rating}</p>
              <button
                onClick={() => navigate(`/vendor/${vendor.id}`)}
                className="bg-green-500 text-white px-4 py-2 rounded mt-2"
              >
                View Details
              </button>
            </div>
          ))
        ) : (
          <p>No results found for "{searchQuery}".</p>
        )}
      </div>
    </div>
  );
};

export default Results;


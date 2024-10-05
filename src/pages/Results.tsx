import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { db } from '../firebaseConfig';
import { collection, getDocs } from 'firebase/firestore';
import Fuse from 'fuse.js';

const Results: React.FC = () => {
  const [vendors, setVendors] = useState<any[]>([]);
  const [filteredVendors, setFilteredVendors] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();
  const location = useLocation();

  // State to store user's location coordinates
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const dish = params.get('dish');
    const place = params.get('place');

    if (dish) {
      setSearchQuery(dish);
      fetchVendors(dish, 'dish');
    } else if (place) {
      setSearchQuery(place);
      fetchVendors(place, 'place');
    }

    // Get user's location on initial render
    navigator.geolocation.getCurrentPosition((position) => {
      setUserLocation({ lat: position.coords.latitude, lng: position.coords.longitude });
    }, (error) => console.error('Error getting user location:', error));
  }, [location]);

  const fetchVendors = async (search: string, searchType: string) => {
    const vendorsCollection = collection(db, 'vendors');

    try {
      const vendorSnapshot = await getDocs(vendorsCollection);
      const vendorList = vendorSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      // Filter only vendors with approved status
      const approvedVendors = vendorList.filter((vendor) => vendor.status === 'approved');
      console.log('Approved vendors:', approvedVendors);

      setVendors(approvedVendors);
      filterVendors(search, approvedVendors, searchType);
    } catch (error) {
      console.error('Error fetching vendors: ', error);
    }
  };

  const calculateDistance = (lat1: number, lng1: number, lat2: number, lng2: number) => {
    const R = 6371; // Radius of Earth in km
    const dLat = (lat2 - lat1) * (Math.PI / 180);
    const dLng = (lng2 - lng1) * (Math.PI / 180);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) *
        Math.sin(dLng / 2) * Math.sin(dLng / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  const filterVendors = (query: string, vendorList: any[], searchType: string) => {
    console.log('Search query:', query, 'Search type:', searchType);

    if (query.trim() === '') {
      setFilteredVendors(vendorList);
      return;
    }

    if (searchType === 'dish') {
      const fuse = new Fuse(vendorList, {
        keys: ['name', 'description'],
        threshold: 0.3,
      });
      const results = fuse.search(query);
      setFilteredVendors(results.map((result) => result.item));
    } else if (searchType === 'place') {
      if (query.includes('Lat:') && query.includes('Lng:')) {
        const [latStr, lngStr] = query.split(',').map((part) => part.split(':')[1].trim());
        const userLat = parseFloat(latStr);
        const userLng = parseFloat(lngStr);

        const nearbyVendors = vendorList.filter((vendor) => {
          const vendorLat = vendor.location?.lat;
          const vendorLng = vendor.location?.lng;
          if (vendorLat && vendorLng) {
            const distance = calculateDistance(userLat, userLng, vendorLat, vendorLng);
            return distance <= 30; // Distance threshold in km
          }
          return false;
        });
        setFilteredVendors(nearbyVendors);
      } else {
        const fuse = new Fuse(vendorList, {
          keys: ['location.name'],
          threshold: 0.3,
        });
        const results = fuse.search(query);
        setFilteredVendors(results.map((result) => result.item));
      }
    }
  };

  const handleSearch = () => {
    if (searchQuery.includes('Lat:')) {
      // If it's a location search
      filterVendors(searchQuery, vendors, 'place');
    } else {
      // If it's a dish search
      filterVendors(searchQuery, vendors, 'dish');
    }
  };

  return (
    <div className="min-h-screen p-10 m-10">
      {/* Search Bar */}
      <div className="flex justify-center mb-4">
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search for more dishes or places..."
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
          <p>No results found for "{searchQuery}".</p>
        )}
      </div>
    </div>
  );
};

export default Results;

import React, { useState } from "react";
import { db } from "../firebaseConfig"; // Import Firestore database
import { collection, addDoc } from "firebase/firestore";
import { doc, updateDoc, arrayUnion, increment } from 'firebase/firestore'; 
import { storage } from "../firebaseConfig"; // Import Firebase Storage
import { ref, uploadBytes, getDownloadURL } from "firebase/storage"; // Import storage functions
import { useNavigate } from "react-router-dom";
import { MapContainer, TileLayer, Marker, useMapEvents } from "react-leaflet";
import 'leaflet/dist/leaflet.css';
import { useAuth } from '../context/AuthContext';

const AddVendor: React.FC = () => {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [dishes, setDishes] = useState([{ name: "", price: "" }]);
  const [images, setImages] = useState<File[]>([]);
  const [paymentMethods, setPaymentMethods] = useState<string>("");
  const [workingHours, setWorkingHours] = useState<string>("");
  const [rating, setRating] = useState<number>(3); // Default rating is 3
  const [cuisine, setCuisine] = useState<string>(""); // For cuisine type
  const navigate = useNavigate();
  const { currentUser } = useAuth();

  const handleDishChange = (index: number, field: string, value: string) => {
    const newDishes = [...dishes];
    newDishes[index][field] = value;
    setDishes(newDishes);
  };

  const addDish = () => {
    setDishes([...dishes, { name: "", price: "" }]);
  };

  const removeDish = (index: number) => {
    const newDishes = dishes.filter((_, i) => i !== index);
    setDishes(newDishes);
  };

  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    setImages(files);
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    console.log('Form submitted');
    try {
      // Upload images to Firebase Storage and get their URLs
      const imageUrls: string[] = await Promise.all(images.map(async (image) => {
        const storageRef = ref(storage, `vendorImages/${image.name}`);
        await uploadBytes(storageRef, image);
        const url = await getDownloadURL(storageRef);
        return url;
      }));

      // Prepare vendor data with image URLs and location
      const vendorData = {
        name,
        description,
        location,
        dishes,
        images: imageUrls,
        paymentMethods,
        workingHours,
        cuisine,
        createdAt: new Date(),
      };

      // Add vendor data to Firestore
      const vendorsCollection = collection(db, 'vendors');
      const vendorDoc = await addDoc(vendorsCollection, vendorData);

      // Update the user's points and vendorsAdded in Firestore
    const userRef = doc(db, 'users', currentUser?.uid);
    await updateDoc(userRef, {
      points: increment(75), // Add 75 points for adding a vendor
      vendorsAdded: increment(1) // Increment vendorsAdded by 1
    });
      console.log('Vendor added:', vendorData);
      alert('Vendor added successfully!');
      navigate('/');
    } catch (error) {
      console.error('Error adding vendor:', error);
      alert('Failed to add vendor. Please try again.');
    }
  };

  const MapClickHandler: React.FC<{ setLocation: (loc: { lat: number; lng: number }) => void }> = ({ setLocation }) => {
    useMapEvents({
      click: (event) => {
        const { lat, lng } = event.latlng;
        setLocation({ lat, lng });
      },
    });

    return null;
  };

  if(!currentUser) {
    return <div>Sign in to add a vendor</div>;
  }

  return (
    <div className="min-h-screen p-10">
      <h1 className="text-2xl mb-4">Add Vendor</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block mb-1">Vendor Name:</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="border border-gray-300 rounded p-2 w-full"
            required
          />
        </div>
        <div>
          <label className="block mb-1">Description:</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="border border-gray-300 rounded p-2 w-full"
            required
          />
        </div>
        <div>
          <label className="block mb-1">Payment Methods:</label>
          <input
            type="text"
            value={paymentMethods}
            onChange={(e) => setPaymentMethods(e.target.value)}
            placeholder="e.g., Cash, Card, UPI"
            className="border border-gray-300 rounded p-2 w-full"
            required
          />
        </div>
        <div>
          <label className="block mb-1">Working Hours:</label>
          <input
            type="text"
            value={workingHours}
            onChange={(e) => setWorkingHours(e.target.value)}
            placeholder="e.g., 10:00 AM - 8:00 PM"
            className="border border-gray-300 rounded p-2 w-full"
            required
          />
        </div>
        

        {/* Cuisine Type */}
        <div>
          <label className="block mb-1">Cuisine Type:</label>
          <select
            value={cuisine}
            onChange={(e) => setCuisine(e.target.value)}
            className="border border-gray-300 rounded p-2 w-full"
            required
          >
            <option value="">Select a cuisine</option>
            <option value="Indian">Indian</option>
            <option value="Chinese">Chinese</option>
            <option value="Italian">Italian</option>
            <option value="Mexican">Mexican</option>
            <option value="Other">Other</option>
          </select>
        </div>
        <div>
          <h3 className="mb-2">Select Location:</h3>
          <MapContainer center={[20.5937, 78.9629]} zoom={5} style={{ height: '300px', width: '100%' }}>
            <TileLayer
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              attribution='&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
            />
            {location && <Marker position={[location.lat, location.lng]} />}
            <MapClickHandler setLocation={setLocation} />
          </MapContainer>
        </div>
        <div>
          <h3 className="mb-2">Dishes:</h3>
          {dishes.map((dish, index) => (
            <div key={index} className="flex space-x-2 mb-2">
              <input
                type="text"
                value={dish.name}
                onChange={(e) => handleDishChange(index, "name", e.target.value)}
                placeholder="Dish Name"
                className="border border-gray-300 rounded p-2 flex-1"
                required
              />
              <input
                type="number"
                value={dish.price}
                onChange={(e) => handleDishChange(index, "price", e.target.value)}
                placeholder="Price"
                className="border border-gray-300 rounded p-2 flex-1"
                required
              />
              <button
                type="button"
                onClick={() => removeDish(index)}
                className="bg-red-500 text-white px-2 rounded"
              >
                Remove
              </button>
            </div>
          ))}
          <button
            type="button"
            onClick={addDish}
            className="bg-blue-500 text-white px-4 py-2 rounded"
          >
            Add Dish
          </button>
        </div>
        <div>
          <label className="block mb-1">Images:</label>
          <input
            type="file"
            accept="image/*"
            multiple
            onChange={handleImageChange}
            className="border border-gray-300 rounded p-2 w-full"
          />
        </div>
        <button
          type="submit"
          className="bg-green-500 text-white px-4 py-2 rounded"
        >
          Submit Vendor
        </button>
      </form>
    </div>
  );
};

export default AddVendor;

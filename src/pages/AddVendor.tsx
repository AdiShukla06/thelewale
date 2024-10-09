import React, { useState } from "react";
import { db } from "../firebaseConfig";
import { collection, addDoc } from "firebase/firestore";
import { doc, updateDoc, arrayUnion, increment } from 'firebase/firestore'; 
import { storage } from "../firebaseConfig"; // Import Firebase Storage
import { ref, uploadBytes, getDownloadURL } from "firebase/storage"; 
import { useNavigate } from "react-router-dom";
import { MapContainer, TileLayer, Marker, useMapEvents } from "react-leaflet";
import 'leaflet/dist/leaflet.css';
import { useAuth } from '../context/AuthContext';
import ShinyButton from "@/components/ui/shiny-button";
import { motion } from "framer-motion";


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
  const [loading, setLoading] = useState(false); // Loading state


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
    setLoading(true)
    console.log('Form submitted');
    try {
      // Upload images to Firebase Storage and get their URLs
      const imageUrls: string[] = await Promise.all(images.map(async (image) => {
        const storageRef = ref(storage, `vendorImages/${image.name}`);
        await uploadBytes(storageRef, image);
        const url = await getDownloadURL(storageRef);
        return url;
      }));
  
      // Prepare vendor data with image URLs, location, and default "pending" status
      const vendorData = {
        name,
        description,
        location,
        dishes,
        images: imageUrls,
        paymentMethods,
        workingHours,
        cuisine,
        status: 'pending', // Vendor status is set to pending initially
        addedBy: currentUser?.uid,
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
      alert('Vendor added successfully! Waiting for admin approval.');
      navigate('/');
    } catch (error) {
      console.error('Error adding vendor:', error);
      alert('Failed to add vendor. Please try again.');
    }
    finally {
      setLoading(false); // Stop loading animation
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

  if (!currentUser) {
    return (
      <div className="min-h-screen bg-black text-white flex justify-center items-center">
        <span>Sign in to add a vendor</span>
      </div>
    );
  }

  if (loading) {
    return (
      
        <div className="min-h-screen flex justify-center items-center bg-black">
          

<ul className="max-w-md space-y-2 text-gray-500 list-inside dark:text-gray-400">
    <li className="flex items-center">
        <svg className="w-4 h-4 me-2 text-green-500 dark:text-green-400 flex-shrink-0" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 20 20">
            <path d="M10 .5a9.5 9.5 0 1 0 9.5 9.5A9.51 9.51 0 0 0 10 .5Zm3.707 8.207-4 4a1 1 0 0 1-1.414 0l-2-2a1 1 0 0 1 1.414-1.414L9 10.586l3.293-3.293a1 1 0 0 1 1.414 1.414Z"/>
        </svg>
        Analysing your Data
    </li>
    <li className="flex items-center">
        <svg className="w-4 h-4 me-2 text-green-500 dark:text-green-400 flex-shrink-0" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 20 20">
            <path d="M10 .5a9.5 9.5 0 1 0 9.5 9.5A9.51 9.51 0 0 0 10 .5Zm3.707 8.207-4 4a1 1 0 0 1-1.414 0l-2-2a1 1 0 0 1 1.414-1.414L9 10.586l3.293-3.293a1 1 0 0 1 1.414 1.414Z"/>
        </svg>
        Updating Location
    </li>
    <li className="flex items-center">
        <div role="status">
            <svg aria-hidden="true" className="w-4 h-4 me-2 text-gray-200 animate-spin dark:text-gray-600 fill-blue-600" viewBox="0 0 100 101" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z" fill="currentColor"/><path d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z" fill="currentFill"/></svg>
            <span className="sr-only">Loading...</span>
        </div>
        Uploading Vendor
    </li>
</ul>

        </div>
      
    )
  }

  return (
    <motion.div className="min-h-screen bg-black text-white px-10 py-20 font-inter"
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    exit={{ opacity: 0 }}
    transition={{ duration: 0.5 }}>
      <h1 className="text-4xl mb-10 text-center font-semibold text-white font-sans">
        Add Vendor
      </h1>

      

      {/* Disable form if loading */}
      <form onSubmit={handleSubmit} className="space-y-8 max-w-4xl mx-auto" disabled={loading}>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm mb-2">Vendor Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full p-3 bg-black border border-white text-white rounded-lg shadow-sm focus:outline-none focus:ring-2  focus:ring-blue-500"
              required
              placeholder="is it momo wali aunty or chaap wale bhaiya?"
              disabled={loading} // Disable when loading
            />
          </div>
          <div>
            <label className="block text-sm mb-2">Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full p-3  text-white rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-black border border-white "
              required
              placeholder="Tell us about the vendor or the food they serve or anything else you'd like to share."
              disabled={loading} // Disable when loading
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm mb-2">Payment Methods</label>
            <input
              type="text"
              value={paymentMethods}
              onChange={(e) => setPaymentMethods(e.target.value)}
              placeholder="e.g., Cash, Card, UPI"
              className="w-full p-3 bg-black border border-white  text-white rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
              disabled={loading} // Disable when loading
            />
          </div>
          <div>
            <label className="block text-sm mb-2">Working Hours</label>
            <input
              type="text"
              value={workingHours}
              onChange={(e) => setWorkingHours(e.target.value)}
              placeholder="e.g., 10:00 AM - 8:00 PM"
              className="w-full p-3 bg-black border border-white  text-white rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
              disabled={loading} // Disable when loading
            />
          </div>
        </div>

        <div>
          <label className="block text-sm mb-2">Cuisine Type</label>
          <select
            value={cuisine}
            onChange={(e) => setCuisine(e.target.value)}
            className="w-full p-3 bg-black border border-white  text-white rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
            disabled={loading} // Disable when loading
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
          <h3 className="text-xl mb-4">Select Location</h3>
          <MapContainer
            center={[20.5937, 78.9629]}
            zoom={5}
            style={{ height: "300px", width: "100%" }}
            className="rounded-lg overflow-hidden shadow-lg"
          >
            <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
            {location && <Marker position={[location.lat, location.lng]} />}
            <MapClickHandler setLocation={setLocation} />
          </MapContainer>
        </div>

        <div>
          <h3 className="text-xl mb-4">Dishes</h3>
          {dishes.map((dish, index) => (
            <div key={index} className="flex space-x-4 items-center mb-2">
              <input
                type="text"
                value={dish.name}
                onChange={(e) =>
                  handleDishChange(index, "name", e.target.value)
                }
                placeholder="Dish Name"
                className="p-3 w-full bg-black border border-white  text-white rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 "
                required
                disabled={loading} // Disable when loading
              />
              <input
                type="number"
                value={dish.price}
                onChange={(e) =>
                  handleDishChange(index, "price", e.target.value)
                }
                placeholder="Price"
                className="p-3 w-full bg-black border border-white  text-white rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
                disabled={loading} // Disable when loading
              />
              <button
                type="button"
                onClick={() => removeDish(index)}
                className="p-3 bg-red-600 text-white rounded-lg shadow-sm hover:bg-red-700 transition"
                disabled={loading} // Disable when loading
              >
                Remove
              </button>
            </div>
          ))}
          <button
            type="button"
            onClick={addDish}
            className="w-full mt-4 p-3 bg-black border border-white  text-white rounded-lg shadow-lg hover:bg-blue-500 transition"
            disabled={loading} // Disable when loading
          >
            Add Dish
          </button>
        </div>

        <div>
          <label className="block text-sm mb-2">Images</label>
          <input
            type="file"
            accept="image/*"
            multiple
            onChange={handleImageChange}
            className="w-full p-3 bg-black border border-white  text-white rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            disabled={loading} // Disable when loading
          />
        </div>

        <ShinyButton className="text-center w-full bg-green-600" >
          Submit Vendor
        </ShinyButton>
      </form>
    </motion.div>
  );
};

export default AddVendor;

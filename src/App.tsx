import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Landing from './pages/Landing';
import Results from './pages/Results';
import VendorDetails from './pages/VendorDetails';
import Profile from './pages/Profile';
import AddVendor from './pages/AddVendor';
import SignIn from './pages/SignIn';
import SignUp from './pages/SignUp';
import Header from './components/Header';
import Admin from './pages/Admin';

function App() {
  return (
    <Router>
      <Header />
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/results" element={<Results />} />
        <Route path="/vendor/:id" element={<VendorDetails />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/add-vendor" element={<AddVendor />} />
        <Route path="/signin" element={<SignIn />} />
        <Route path="/signup" element={<SignUp />} />
        <Route path="/admin" element={<Admin />} />
      </Routes>
    </Router>
  );
}

export default App;

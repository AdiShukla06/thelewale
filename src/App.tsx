import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import Landing from './pages/Landing';
import Results from './pages/Results';
import VendorDetails from './pages/VendorDetails';
import Profile from './pages/Profile';
import AddVendor from './pages/AddVendor';
import SignIn from './pages/SignIn';
import SignUp from './pages/SignUp';
import Header from './components/Header';
import Admin from './pages/Admin';
import Footer from './components/Footer';
import PreLanding from './pages/PreLanding';
import { AnimatePresence } from 'framer-motion';
import ScrollToTop from './components/ScrollToTop';
import About from './pages/About';

const App: React.FC = () => {
  const location = useLocation();

  // Determine if the current route is the PreLanding page
  const isPreLandingPage = location.pathname === '/';

  return (
    <>
      <ScrollToTop/>
      {/* Conditionally render Header if not on PreLanding page */}
      {!isPreLandingPage && <Header />}

      {/* Animate only the pages */}
      <AnimatePresence mode='wait'> 
        <Routes location={location} key={location.pathname}>
          <Route path="/" element={<PreLanding />} />
          <Route path="/home" element={<Landing />} />
          <Route path="/results" element={<Results />} />
          <Route path="/vendor/:id" element={<VendorDetails />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/add-vendor" element={<AddVendor />} />
          <Route path="/signin" element={<SignIn />} />
          <Route path="/signup" element={<SignUp />} />
          <Route path="/admin" element={<Admin />} />
          <Route path="/about" element={<About/>} />
        </Routes>
      </AnimatePresence>

      {/* Conditionally render Footer if not on PreLanding page */}
      {!isPreLandingPage && <Footer />}
    </>
  );
};

const AppWrapper: React.FC = () => (
  <Router>
    <App />
  </Router>
);

export default AppWrapper;

import bgImage from '../assets/bg4.jpg';
import '../index.css';  
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom'; 
import { ArrowRightIcon } from "@radix-ui/react-icons";
import { cn } from "@/lib/utils";
import AnimatedShinyText from "@/components/ui/animated-shiny-text";
import { useState } from 'react'; 

export function AnimatedShinyTextDemo() {
  return (
    <div className="z-10 flex items-center justify-center">
      <div
        className={cn(
          "group rounded-full border bg-neutral-200 border-black/5 text-lg transition-all ease-in hover:cursor-pointer hover:bg-neutral-200"
        )}
      >
        <AnimatedShinyText className="inline-flex items-center justify-center px-4 py-1 transition ease-out hover:text-neutral-600 hover:duration-300">
          <span>✨ Thelewale</span>
          <ArrowRightIcon className="ml-1 size-3 transition-transform duration-300 ease-in-out group-hover:translate-x-0.5" />
        </AnimatedShinyText>
      </div>
    </div>
  );
}

function PreLanding() {
  const navigate = useNavigate(); 
  const [isTransitioning, setIsTransitioning] = useState(false); 

  const handleClick = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    setIsTransitioning(true);
    setTimeout(() => {
      navigate("/home");
    }, 1000); 
  };

  return (
    <>
      <motion.div
        className="w-full h-screen bg-cover bg-center flex items-center justify-center"
        style={{
          backgroundImage: `url(${bgImage})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
        }}
        initial={{ opacity: 1 }} 
        animate={{ opacity: isTransitioning ? 0 : 1 }} 
        transition={{ duration: 0.5 }}
      >
        {/* Clickable motion div for scaling effect */}
        <motion.div
          whileTap={{ scale: 1 }}
          whileHover={{ scale: 1.2 }}
          onClick={handleClick} 
          className="cursor-pointer"
        >
          <AnimatedShinyTextDemo />
        </motion.div>
      </motion.div>

      <AnimatePresence>
        {isTransitioning && (
          <motion.div
            className="black-transition"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
          />
        )}
      </AnimatePresence>
    </>
  );
}

export default PreLanding;
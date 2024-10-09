import React, { useState } from "react";
import OrbitingCircles from "@/components/ui/orbiting-circles";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { RainbowButton } from "@/components/ui/rainbow-button";
import { Search } from "lucide-react";
import { ArrowDown } from "lucide-react";

const Icons = {
  fries: () => (
    <img
      width="48"
      height="48"
      src="https://img.icons8.com/fluency/48/kawaii-french-fries.png"
      alt="kawaii-french-fries"
    />
  ),
  naan: () => (
    <img
      width="48"
      height="48"
      src="https://img.icons8.com/fluency/48/naan.png"
      alt="naan"
    />
  ),
  noodles: () => (
    <img
      width="48"
      height="48"
      src="https://img.icons8.com/fluency/48/noodles.png"
      alt="noodles"
    />
  ),
  burger: () => (
    <img
      width="48"
      height="48"
      src="https://img.icons8.com/fluency/48/hamburger.png"
      alt="hamburger"
    />
  ),
  cola: () => (
    <img
      width="48"
      height="48"
      src="https://img.icons8.com/fluency/48/cola.png"
      alt="cola"
    />
  ),
};

function Hero() {
  const [dishSearchTerm, setDishSearchTerm] = useState("");
  const navigate = useNavigate();

  // Handle dish search
  const handleDishSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (dishSearchTerm) {
      navigate(`/results?dish=${dishSearchTerm}`);
    }
  };

  return (
    <section className="w-full h-screen flex flex-col items-center justify-center relative">
  {/* Inner Circles */}
  <OrbitingCircles
    className="size-[30px] border-none bg-transparent"
    duration={20}
    delay={20}
    radius={80}
  >
    <motion.a whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }}>
      <Icons.cola />
    </motion.a>
  </OrbitingCircles>
  <OrbitingCircles
    className="size-[30px] border-none bg-transparent"
    duration={20}
    delay={10}
    radius={80}
  >
    <motion.a whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }}>
      <Icons.naan />
    </motion.a>
  </OrbitingCircles>

  {/* Outer Circles (reverse) */}
  <OrbitingCircles
    className="size-[50px] border-none bg-transparent"
    radius={190}
    duration={20}
    reverse
  >
    <motion.a whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }}>
      <Icons.burger />
    </motion.a>
  </OrbitingCircles>
  <OrbitingCircles
    className="size-[50px] border-none bg-transparent"
    radius={190}
    duration={20}
    delay={20}
    reverse
  >
    <motion.a whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }}>
      <Icons.fries />
    </motion.a>
  </OrbitingCircles>
  <OrbitingCircles
    className="size-[50px] border-none bg-transparent"
    radius={190}
    duration={20}
    delay={15}
    reverse
  >
    <motion.a whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }}>
      <Icons.noodles />
    </motion.a>
  </OrbitingCircles>

  {/* Dish Search */}
  <form
    onSubmit={handleDishSearch}
    className="w-full max-w-lg md:max-w-2xl flex flex-col md:flex-row justify-center space-x-2 z-10 px-4 md:px-0 items-center"
  >
    <input
      type="text"
      value={dishSearchTerm}
      onChange={(e) => setDishSearchTerm(e.target.value)}
      placeholder="Search for momos, pizza, biryani, or anything else..."
      className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-400 text-sm md:text-base"
    />
    
    <RainbowButton >
      <Search className="w-5 h-5 md:w-6 md:h-6" />
    </RainbowButton>
    
  </form>

  {/* Scroll Down Animation */}
  <motion.div
    className="absolute bottom-10 right-10 flex items-center space-x-2 cursor-pointer text-xs md:text-sm"
    initial={{ y: 0 }}
    animate={{ y: [0, 10, 0] }}
    transition={{
      duration: 1.5,
      repeat: Infinity,
      ease: "easeInOut",
    }}
    onClick={() => {
      window.scrollTo({
        top: window.innerHeight,
        behavior: "smooth",
      });
    }}
  >
    <span className="text-white">Scroll down</span>
    <ArrowDown className="text-white w-4 h-4 md:w-5 md:h-5" />
  </motion.div>
</section>

  );
}

export default Hero;

import React from 'react';
import bgImage from '../assets/bg4.jpg'; 
import '../index.css';  // Ensure your CSS file is imported

import { ArrowRightIcon } from "@radix-ui/react-icons";

import { cn } from "@/lib/utils";
import AnimatedShinyText from "@/components/ui/animated-shiny-text";

export function AnimatedShinyTextDemo() {
  return (
    <div className="z-10 flex min-h-64 items-center justify-center">
      <div
        className={cn(
          "group rounded-full border border-black/5 text-lg  transition-all ease-in hover:cursor-pointer hover:bg-neutral-200 "
        )}
      >
        <AnimatedShinyText className="text-gray-300 inline-flex items-center justify-center px-4 py-1 transition ease-out hover:text-neutral-600 hover:duration-300 ">
          <span>✨ Thelewale</span>
          <ArrowRightIcon className="ml-1 size-3 transition-transform duration-300 ease-in-out group-hover:translate-x-0.5" />
        </AnimatedShinyText>
      </div>
    </div>
  );
}



function PreLanding() {
  return (
    <div
      className="w-full h-screen bg-cover bg-center flex items-center justify-center"
      style={{
        backgroundImage: `url(${bgImage})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
      }}
    >
      {/* <h1 className="text-white font-inter">Get Started</h1> */}
      <AnimatedShinyTextDemo/>
    </div>
  );
}

export default PreLanding;

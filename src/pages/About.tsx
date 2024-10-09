import React from 'react';
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
  } from "@/components/ui/accordion"
const About: React.FC = () => {
  return (
    <div className="min-h-screen bg-black text-white flex flex-col items-center p-8">
      <h1 className="text-4xl font-bold mb-8 text-center mt-10">About Thelewale</h1>
      <Accordion  type="single" collapsible className="w-full max-w-2xl space-y-4">
        <AccordionItem value="faq1">
          <AccordionTrigger>What is Thelewale?</AccordionTrigger>
          <AccordionContent>
            Thelewale is a platform that allows users to discover and connect with food vendors based on their location and preferences. It simplifies the process of finding delicious street food or local eateries near you.
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="faq2">
          <AccordionTrigger>How does Thelewale work?</AccordionTrigger>
          <AccordionContent>
            Thelewale uses a location-based system powered by Google Maps, where users can search for vendors based on their favorite dishes or discover popular vendors nearby. The admin can accept or reject new vendor additions, ensuring quality control.
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="faq3">
          <AccordionTrigger>Key Features</AccordionTrigger>
          <AccordionContent>
            - Location-based vendor search
            <br />
            - Weather-based suggestions for places to visit
            <br />
            - Admin controls to manage vendor approvals
            <br />
            - Vendor details including images and maps
            <br />
            - User profile with badge and point system
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="faq4">
          <AccordionTrigger>How can I add a vendor?</AccordionTrigger>
          <AccordionContent>
            Users can submit new vendors by filling out a form in the "Add Vendor" section. Once submitted, an admin will review the submission and approve or reject it. Approved vendors become visible on the platform.
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="faq5">
          <AccordionTrigger>Who is behind Thelewale?</AccordionTrigger>
          <AccordionContent>
            Thelewale is developed with a vision to support local food vendors and provide food lovers an easy way to discover great street food. It combines modern technologies like React, Firebase, and Google Maps to create a smooth and enjoyable user experience.
          </AccordionContent>
        </AccordionItem>

        
      </Accordion>
    </div>
  );
};

export default About;

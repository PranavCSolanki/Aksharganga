"use client"
import React from "react";
import NavbarComponent from "@/_Components/WebsiteContent/NavbarComponent";


const AboutPageWithCarousel = () => {

  return (
    <>
      <NavbarComponent />
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-r from-indigo-100 via-purple-100 to-pink-200">
        <h1 className="text-5xl font-extrabold mb-6 text-center text-black animate-bounce">
          About Us
        </h1>

        <div className="flex flex-col md:flex-row items-center justify-around">
          <div className="w-full md:w-1/2 bg-white p-6 rounded-lg shadow-lg transform hover:scale-105 transition duration-300 ease-in-out">
            <p className="text-lg text-gray-700 mb-4">
              Welcome to our company! We are dedicated to providing the best
              services to our customers. Our team is passionate about delivering
              high-quality products and ensuring customer satisfaction.
            </p>
            <p className="text-lg text-gray-700 mb-4">
              If you have any questions or need further information, feel free
              to contact us. We are here to help you!
            </p>
            <div className="flex items-center justify-center mt-4">
              <button className="bg-gradient-to-r from-blue-500 to-green-500 hover:from-green-500 hover:to-blue-500 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline transition duration-300 ease-in-out transform hover:scale-110">
                Contact Us
              </button>
            </div>
          </div>
        </div>

       
      </div>
    </>
  );
};

export default AboutPageWithCarousel;

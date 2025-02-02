"use client";
import NavbarComponent from '@/_Components/WebsiteContent/NavbarComponent';
import React, { useState } from 'react';

function ContactPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
  });

  const [errors, setErrors] = useState({});

  const validate = () => {
    const errors = {};
    if (!formData.name) {
      errors.name = 'Name is required';
    }
    if (!formData.email) {
      errors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      errors.email = 'Email address is invalid';
    }
    if (!formData.phone) {
      errors.phone = 'Phone number is required';
    }
    if (!formData.address) {
      errors.address = 'Address is required';
    }
    return errors;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const validationErrors = validate();
    if (Object.keys(validationErrors).length === 0) {
      console.log('Form submitted', formData);
    } else {
      setErrors(validationErrors);
    }
  };

  return (
    <>
      <NavbarComponent />
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-r from-green-100 to-blue-200">
        <div className="container mx-auto px-4 flex flex-col md:flex-row items-center p-5 justify-around">
          <div className="bg-white p-8 rounded-lg shadow-2xl w-full max-w-lg mb-8 md:mb-0">
            <h2 className="text-4xl font-extrabold mb-6 text-center text-gray-900">Contact Us</h2>
            <form onSubmit={handleSubmit}>
              {['name', 'email', 'phone', 'address'].map((field) => (
                <div className="mb-4" key={field}>
                  <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor={field}>
                    {field.charAt(0).toUpperCase() + field.slice(1)}
                  </label>
                  <input
                    type={field === 'email' ? 'email' : 'text'}
                    id={field}
                    name={field}
                    value={formData[field]}
                    onChange={handleChange}
                    className={`shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline ${
                      errors[field] ? 'border-red-500' : ''
                    }`}
                    placeholder={`Enter your ${field}`}
                  />
                  {errors[field] && <p className="text-red-500 text-xs italic">{errors[field]}</p>}
                </div>
              ))}
              <div className="flex items-center justify-between">
                <button
                  type="submit"
                  className="bg-blue-600 hover:bg-blue-800 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline transition duration-300 ease-in-out transform hover:scale-105"
                >
                  Submit
                </button>
              </div>
            </form>
          </div>
          <div className="w-full h-full max-w-lg">
            <h3 className="text-2xl font-bold mb-4 text-center text-gray-900">Our Location</h3>
            <div className="w-full h-64 bg-gray-300 rounded-lg shadow-lg overflow-hidden">
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d927.5906499759667!2d74.5756079923617!3d16.849361999054665!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3bc118662a2449f9%3A0x2abad52da491a606!2sAksharGanga%20Publication!5e1!3m2!1sen!2sau!4v1738498687382!5m2!1sen!2sau"
                width="100%"
                height="100%"
                style={{ border: 0 }}
                allowFullScreen=""
                aria-hidden="false"
                title="Our Location"
              />
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default ContactPage;

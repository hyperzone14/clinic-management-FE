import React from "react";
import {
  FaFacebookF,
  FaInstagram,
  FaTwitter,
  FaYoutube,
  FaWordpress,
} from "react-icons/fa";
import { Link } from "react-router-dom";

export const Footer = () => {
  return (
    <>
      <footer className="bg-white py-8 px-4 ">
        <div className="container mx-auto flex flex-col md:flex-row justify-between items-start">
          <div className="flex items-center">
            <Link to="/" className="inline-block">
              <img
                src="/assets/images/medpal.png"
                alt="MedPal"
                className="w-24 md:w-32" // Adjust the width as needed
              />
            </Link>
          </div>

          <div className="mb-6 md:mb-0">
            <h3 className="font-semibold mb-2">Contributors</h3>
            <ul className="text-sm prose">
              <li>21110798 - Bui Chien Thang</li>
              <li>21110098 - Vo Dang Trinh</li>
              <li>21110116 - Nguyen Van Anh Dong</li>
            </ul>
          </div>

          <div className="mb-6 md:mb-0">
            <h3 className="font-semibold mb-2">Used technologies</h3>
            <ul className="text-sm prose">
              <li>
                <b>Frontend</b>: React, Typescript
              </li>
              <li>
                <b>Backend</b>: Spring Boot, Spring Security
              </li>
            </ul>
          </div>

          <div className="mb-6 md:mb-0">
            <h3 className="font-semibold mb-2">Contact Us</h3>
            <ul className="prose text-sm ">
              <li>
                <b>
                  <i>Email</i>
                </b>
                : 21110798@student.hcmute.edu.vn
              </li>
              <li>
                <b>
                  <i>Ticket Office</i>
                </b>
                : 123-456-7890
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold mb-2">Social</h3>
            <div className="flex space-x-4">
              <FaFacebookF className="text-gray-600 hover:text-blue-600 transition duration-50 ease-in-out" />
              <FaInstagram className="text-gray-600 hover:text-pink-600 transition duration-50 ease-in-out" />
              <FaTwitter className="text-gray-600 hover:text-blue-400 transition duration-50 ease-in-out" />
              <FaYoutube className="text-gray-600 hover:text-red-600 transition duration-50 ease-in-out" />
              <FaWordpress className="text-gray-600 hover:text-blue-800 transition duration-50 ease-in-out" />
            </div>
          </div>
        </div>

        <div className="flex justify-center mt-10">
          <hr className="w-9/12 border-gray-300" />
        </div>
        <div className="text-center mt-5 text-sm text-gray-500">
          © 2024 MedPal team | All Rights Reserved
        </div>
      </footer>
    </>
  );
};

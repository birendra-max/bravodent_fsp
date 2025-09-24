import React, { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEye, faEyeSlash } from "@fortawesome/free-solid-svg-icons";

export default function Login() {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <section className="min-h-screen flex items-center justify-center bg-gradient-to-r from-blue-500 to-indigo-600">
      <div className="bg-white rounded-3xl shadow-lg flex flex-col md:flex-row w-full max-w-4xl overflow-hidden">
        
        {/* Left Side - Image & Branding */}
        <div className="md:w-1/2 bg-gradient-to-tr from-yellow-600 to-indigo-500 p-8 flex flex-col justify-center relative">
          <img
            src="/img/logo.png"
            alt="Admin Logo"
            className="h-20 w-60 object-contain mb-6"
          />
          <h2 className="text-3xl font-bold text-white mb-4">
            Welcome Back, Admin!
          </h2>
          <p className="text-white text-sm">
            Manage your dashboard, control the site, and analyze data seamlessly.
          </p>
          <div className="absolute bottom-6 left-6">
            <p className="text-white text-xs">© 2025 Bravodent Admin Panel</p>
          </div>
        </div>

        {/* Right Side - Login Form */}
        <div className="md:w-1/2 p-10 flex flex-col justify-center">
          <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">
            Admin Login
          </h2>
          <form className="space-y-6">
            <div>
              <label className="block text-sm font-semibold text-gray-600 mb-2">
                Username
              </label>
              <input
                type="text"
                name="username"
                required
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                placeholder="Enter your username"
              />
            </div>

            <div className="relative">
              <label className="block text-sm font-semibold text-gray-600 mb-2">
                Password
              </label>
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                required
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none pr-10"
                placeholder="Enter your password"
              />
              <button
                type="button"
                className="absolute right-3 top-9 text-gray-500"
                onClick={() => setShowPassword(!showPassword)}
              >
                <FontAwesomeIcon icon={showPassword ? faEyeSlash : faEye} />
              </button>
            </div>

            <div className="flex items-center justify-between">
              <label className="flex items-center text-sm text-gray-600">
                <input type="checkbox" className="mr-2" /> Remember Me
              </label>
              <a href="#" className="text-sm text-blue-500 hover:underline">
                Forgot Password?
              </a>
            </div>

            <button
              type="submit"
              className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition font-semibold"
            >
              Login
            </button>
          </form>

          <p className="text-xs text-gray-500 mt-8 text-center">
            © 2025 Bravodent Admin. All rights reserved.
          </p>
        </div>
      </div>
    </section>
  );
}

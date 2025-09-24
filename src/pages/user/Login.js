import React, { useState, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEye, faEyeSlash } from "@fortawesome/free-solid-svg-icons";

export default function Login() {

    const [form, setForm] = useState({
        email: "",
        password: "",
        rememberme: ""
    });

    const [resp, setResp] = useState(null);

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            const formData = new URLSearchParams();
            for (const key in form) {
                formData.append(key, form[key]);
            }

            const res = await fetch("http://localhost/bravodent_ci/Validate_User", {
                method: "POST",
                headers: {
                    "Content-Type": "application/x-www-form-urlencoded",
                },
                body: formData.toString(),
            });

            if (!res.ok) {
                console.error("HTTP error:", res.status, res.statusText);
                return;
            }

            const data = await res.json();
            console.log(data['status']);
            console.log(data['message']);
            console.log(data['user']);
        } catch (err) {
            console.error("Fetch error:", err);
        }
    };


    const [activeIndex, setActiveIndex] = useState(0);
    const [showPassword, setShowPassword] = useState(false);

    const images = [
        "/img/bg0.png",
        "/img/bg1.png",
        "/img/bg2.jpg",
    ];

    const nextSlide = () => {
        setActiveIndex((prev) => (prev + 1) % images.length);
    };

    const prevSlide = () => {
        setActiveIndex((prev) => (prev - 1 + images.length) % images.length);
    };

    // Auto-scroll effect
    useEffect(() => {
        const interval = setInterval(() => {
            nextSlide();
        }, 4000);

        return () => clearInterval(interval);
    }, []);

    return (
        <section className="min-h-screen flex flex-col items-center justify-center bg-[#FFB88C] px-4 py-10">
            <div className="w-full max-w-6xl">
                {/* Logo */}
                <img
                    src="/img/logo.png"
                    alt="BravoDent Logo"
                    className="h-20 w-40 object-contain mb-6"
                />
            </div>

            <div className="w-full max-w-6xl bg-white shadow-2xl rounded-2xl overflow-hidden grid grid-cols-1 md:grid-cols-3">
                {/* Left: Login Form */}
                <div className="p-8 md:col-span-1 flex flex-col justify-center bg-gradient-to-b from-gray-50 to-gray-100">
                    <h2 className="text-2xl font-bold text-center mb-6 text-gray-800">
                        Client Login
                    </h2>
                    <form className="space-y-5">
                        <div>
                            <label className="block text-sm font-semibold uppercase text-gray-700 mb-2">
                                Username
                            </label>
                            <input
                                type="text"
                                name="email"
                                required
                                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                value={form.email}
                                onChange={(e) => handleChange(e)}
                            />
                        </div>
                        <div className="relative">
                            <label className="block text-sm font-semibold uppercase text-gray-700 mb-2">
                                Password
                            </label>
                            <input
                                type={showPassword ? "text" : "password"}
                                name="password"
                                required
                                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none pr-10"
                                value={form.password}
                                onChange={(e) => handleChange(e)}

                            />
                            {/* Eye toggle button */}
                            <button
                                type="button"
                                className="absolute right-3 top-9 text-gray-500 hover:text-gray-800"
                                onClick={() => setShowPassword(!showPassword)}
                            >
                                <FontAwesomeIcon
                                    icon={showPassword ? faEyeSlash : faEye}
                                    size="lg"
                                />
                            </button>
                        </div>
                        <div className="flex items-center justify-between">
                            <label className="flex items-center text-sm text-gray-600">
                                <input type="checkbox" name="rememberme" value={form.remember} onChange={(e) => handleChange(e)} className="mr-2" /> Remember Me
                            </label>
                            <button
                                type="button"
                                className="bg-blue-600 text-white px-5 py-2 rounded-lg hover:bg-blue-700 transition cursor-pointer"
                                onClick={handleSubmit}
                            >
                                Submit
                            </button>
                        </div>
                    </form>
                    <p className="text-xs text-gray-500 mt-8 text-center">
                        Created with <span className="text-red-500">♥</span> Bravodent
                    </p>
                </div>

                {/* Right: Carousel */}
                <div className="md:col-span-2 relative">
                    <div className="relative w-full h-96 md:h-full overflow-hidden">
                        {images.map((img, idx) => (
                            <img
                                key={idx}
                                src={img}
                                alt={`slide-${idx}`}
                                className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-700 ${idx === activeIndex ? "opacity-100" : "opacity-0"
                                    }`}
                            />
                        ))}
                    </div>

                    {/* Carousel Controls */}
                    <button
                        onClick={prevSlide}
                        className="absolute top-1/2 left-4 -translate-y-1/2 bg-black bg-opacity-40 text-white px-3 py-2 rounded-full hover:bg-opacity-70"
                    >
                        ❮
                    </button>
                    <button
                        onClick={nextSlide}
                        className="absolute top-1/2 right-4 -translate-y-1/2 bg-black bg-opacity-40 text-white px-3 py-2 rounded-full hover:bg-opacity-70"
                    >
                        ❯
                    </button>

                    {/* Indicators */}
                    <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-3">
                        {images.map((_, idx) => (
                            <button
                                key={idx}
                                onClick={() => setActiveIndex(idx)}
                                className={`w-3 h-3 rounded-full ${idx === activeIndex ? "bg-blue-600" : "bg-gray-400"
                                    }`}
                            />
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
}

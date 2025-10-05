import React, { useContext, useEffect } from "react";
import Hd from './Hd';
import Foot from './Foot';
import { UserContext } from "../../Context/UserContext";
import { useNavigate } from 'react-router-dom';
import { ThemeContext } from "../../Context/ThemeContext";

export default function MultiSearch() {
    const { theme, setTheme } = useContext(ThemeContext);
    const { user } = useContext(UserContext);
    const navigate = useNavigate();

    useEffect(() => {
        const checkSession = async () => {
            try {
                const resp = await fetch('http://localhost/bravodent_ci/session-check', {
                    method: "GET",
                    credentials: "include",
                });

                const data = await resp.json();

                if (data.status !== "success") {
                    navigate("/", { replace: true });
                }
            } catch (error) {
                console.error("Error checking session:", error);
                navigate("/", { replace: true });
            }
        };

        checkSession();
    }, [navigate]);

    // Theme-based background and text classes
    const getMainClass = () => {
        return theme === 'light' 
            ? 'bg-gray-50 text-gray-900' 
            : 'bg-black text-white';
    };

    return (
        <>
            <Hd />
            <main 
                id="main" 
                className={`min-h-screen transition-colors duration-300 ${getMainClass()}`}
            >
                <div className="container mx-auto py-8 px-4">
                    {/* You can add your MultiSearch content here */}
                    <div className="text-center">
                        <h1 className="text-3xl font-bold mb-4">MultiSearch</h1>
                        <p className="text-lg">
                            {theme === 'light' ? 'Light theme content' : 'Dark theme content'}
                        </p>
                    </div>
                </div>
            </main>
            <Foot />
        </>
    )
}
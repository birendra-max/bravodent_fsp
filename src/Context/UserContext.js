import React, { createContext, useState, useEffect } from "react";

export const UserContext = createContext();

export function UserProvider({ children }) {
    const [user, setUser] = useState(null);

    // Load user data from localStorage on first render
    useEffect(() => {
        const storedUser = localStorage.getItem("user");
        if (storedUser) {
            setUser(JSON.parse(storedUser));
        }
    }, []);

    return (
        <UserContext.Provider value={{ user, setUser }}>
            {children}
        </UserContext.Provider>
    );
}

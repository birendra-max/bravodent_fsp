import React, { createContext, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

export const DesignerContext = createContext();

export const DesignerProvider = ({ children }) => {
    const [designer, setDesigner] = useState(() => {
        const storedUser = localStorage.getItem('designer');
        return storedUser ? JSON.parse(storedUser) : null;
    });

    const navigate = useNavigate();

    useEffect(() => {
        if (designer) {
            localStorage.setItem('designer', JSON.stringify(designer));
        } else {
            localStorage.removeItem('designer');
        }
    }, [designer]);

    const logout = async () => {
        // const resp = fetch('http://localhost/easycrm_ci/logout')
        setDesigner(null);
        localStorage.removeItem('designer');
        localStorage.removeItem('token');
        localStorage.removeItem('theme');
        navigate('/desinger/login', { replace: true });
    }


    return (
        <DesignerContext.Provider value={{ designer, setDesigner, logout }} >
            {children}
        </DesignerContext.Provider>
    )
}
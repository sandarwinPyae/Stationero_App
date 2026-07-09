// src/AuthContext.jsx
import React, { createContext, useState } from 'react';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    // 🌟 ဒီနေရာမှာ true ထားရင် အကုန်လုံး Login User Navbar ဖြစ်သွားမယ်
    // false ထားရင် အကုန်လုံး Guest Navbar ဖြစ်သွားမယ်
    const [isLoggedIn, setIsLoggedIn] = useState(false); 

    return (
        <AuthContext.Provider value={{ isLoggedIn, setIsLoggedIn }}>
            {children}
        </AuthContext.Provider>
    );
};
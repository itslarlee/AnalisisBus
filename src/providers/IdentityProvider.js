import React, { useState, createContext, useContext, useEffect } from 'react';

export const IdentityContext = createContext();

export function IdentityProvider({ children }) {
    const [user, setUser] = useState(null);

    useEffect(() => {
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
            setUser(JSON.parse(storedUser));
        }
    }, []);

    const updateIdentity = (newUser) => {
        setUser(newUser);
        localStorage.setItem('user', JSON.stringify(newUser));
    };

    return (
        <IdentityContext.Provider value={{ user, updateIdentity }}>
            {children}
        </IdentityContext.Provider>
    );
}

export function useIdentity() {
    return useContext(IdentityContext);
}

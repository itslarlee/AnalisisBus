import { useState, useEffect } from 'react';
import { getAuth, onAuthStateChanged } from 'firebase/auth';

export default function useAuth() {
    const [isAuthenticated, setIsAuthenticated] = useState(false);

    useEffect(() => {
        const auth = getAuth();
        const unsubscribe = onAuthStateChanged(auth, user => {
            setIsAuthenticated(!!user);
        });

        // Clean up subscription
        return () => {
            unsubscribe();
        };
    }, []);

    return { isAuthenticated };
}
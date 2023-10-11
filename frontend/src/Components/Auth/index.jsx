import { createContext, useEffect, useState, useContext } from "react";
import jwt_decode from "jwt-decode";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [authTokens, setAuthTokens] = useState(
        () => localStorage.getItem('authTokens') ? JSON.parse(localStorage.getItem('authTokens')) : null
    );
    const [user, setUser] = useState(
        () => authTokens ? jwt_decode(authTokens.access) : null
    );
    const [loading, setLoading] = useState(true);

    const updateToken = async () => {
        try {
        if (authTokens && authTokens.refresh) {
            const response = await fetch('http://127.0.0.1:8000/api/token/refresh/', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ 'refresh': authTokens.refresh }),
            });
            if (response.status === 200) {
            const data = await response.json();
            setAuthTokens(data);
            setUser(jwt_decode(data.access));
            localStorage.setItem('authTokens', JSON.stringify(data));
            }
        }
        } catch (error) {
        console.error(error);
        } finally {
        setLoading(false);
        }
    };

    const contextData = {
        user: user,
        authTokens: authTokens,
    };

    useEffect(() => {
        if (loading) {
        updateToken();
        }

        const fourMinutes = 4 * 60 * 1000;
        const interval = setInterval(() => {
        if (authTokens) {
            updateToken();
        }
        }, fourMinutes);

        return () => clearInterval(interval);
    }, [authTokens, loading]);

    return (
        <AuthContext.Provider value={contextData}>
        {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);

export default AuthContext;

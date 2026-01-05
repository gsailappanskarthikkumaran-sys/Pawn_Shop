import { createContext, useState, useEffect, useContext } from 'react';
import api from '../api/axios';
const AuthContext = createContext();
export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    useEffect(() => {
        const storedUser = localStorage.getItem('user');
        if (storedUser && storedUser !== 'undefined') {
            try {
                setUser(JSON.parse(storedUser));
            } catch (error) {
                console.error("Failed to parse user from local storage", error);
                localStorage.removeItem('user');
            }
        }
        setLoading(false);
    }, []);

    const login = async (username, password) => {
        try {
            console.log("AuthContext: Sending login request");
            const response = await api.post('/auth/login', { username, password });
            console.log("AuthContext: Login Response received:", response);
            const { data } = response;

            if (!data) {
                console.error("AuthContext: No data received from login API");
                throw new Error("No data received from login API");
            }
            console.log("AuthContext: User data received:", data);
            localStorage.setItem('user', JSON.stringify(data));
            setUser(data);
            console.log("AuthContext: User state updated");
            return data;
        } catch (error) {
            console.error("AuthContext: Login API Error:", error);
            throw error;
        }
    };

    const logout = () => {
        localStorage.removeItem('user');
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ user, login, logout, loading }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);

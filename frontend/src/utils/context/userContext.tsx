import { createContext, useState, ReactNode } from "react";

const AuthContext = createContext(null);


function AuthProvider({ children }: { children: ReactNode }) {
    const [authData, setAuthData] = useState(null); 
    
    return (
        <AuthContext.Provider value={{ authData, setAuthData }}>
            {children}
        </AuthContext.Provider>
    );
}
export {AuthContext,AuthProvider}
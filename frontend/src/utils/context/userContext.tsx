import { createContext, useState, ReactNode } from "react";

// Define the user data interface
interface UserData {
  id: string;
  email?: string;
  name?: string;
  [key: string]: any;
}

// Define the context type
interface AuthContextType {
  authData: UserData | null;
  setAuthData: (data: UserData | null) => void;
}

// Create context with undefined as default (not null)
const AuthContext = createContext<AuthContextType | undefined>(undefined);

function AuthProvider({ children }: { children: ReactNode }) {
  const [authData, setAuthData] = useState<UserData | null>(null);
  
  return (
    <AuthContext.Provider value={{ authData, setAuthData }}>
      {children}
    </AuthContext.Provider>
  );
}

export { AuthContext, AuthProvider };
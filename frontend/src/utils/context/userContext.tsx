import { createContext, useState, ReactNode } from "react";


interface UserData {
  id: string;
  email?: string;
  name?: string;
  [key: string]: any;
}


interface AuthContextType {
  authData: UserData | null;
  setAuthData: (data: UserData | null) => void;
}

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
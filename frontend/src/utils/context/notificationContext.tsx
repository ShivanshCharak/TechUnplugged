import { createContext, useState, ReactNode } from "react";

// Define your notification type
export type TnotifData = {
  title: string;
  slug: string;
  user: {
    email: string;
    firstname: string;
    lastname: string;
  };
};

// Define context type
interface NotificationContextType {
  notifData: TnotifData[];
  setNotifData: React.Dispatch<React.SetStateAction<TnotifData[]>>;
}

// Create context with proper default value
const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

function NotificationProvider({ children }: { children: ReactNode }) {
  const [notifData, setNotifData] = useState<TnotifData[]>([]);

  return (
    <NotificationContext.Provider value={{ notifData, setNotifData }}>
      {children}
    </NotificationContext.Provider>
  );
}

export { NotificationContext, NotificationProvider };

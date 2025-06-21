import React, { createContext, useState, ReactNode } from 'react';

// Define the context type
interface UserDetailsType {
  token?: string;
  user?: any;
  favourites?: string[];
  bookings?: any[];
}

interface UserDetailContextType {
  userDetails: UserDetailsType;
  setUserDetails: React.Dispatch<React.SetStateAction<UserDetailsType>>;
}

// Create the context with a default value
const UserDetailContext = createContext<UserDetailContextType>({
  userDetails: {},
  setUserDetails: () => {}
});

// Create a provider component
export const UserDetailProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [userDetails, setUserDetails] = useState<UserDetailsType>({});

  return (
    <UserDetailContext.Provider value={{ userDetails, setUserDetails }}>
      {children}
    </UserDetailContext.Provider>
  );
};

export default UserDetailContext; 
import React, { useContext, useEffect, useState } from 'react'
import useLocalStorage from '../hooks/useLocalStorage';

const UserContext = React.createContext()

export function useUser() {
    return useContext(UserContext)
}

export function UserProvider({ children }) {
    const [user, setUser] = useState({});
    const [chatList, setChatList] = useState([])
    useEffect(() => {
        console.log(user, chatList);
    }, [chatList, user]);
    return (
        <UserContext.Provider value={{ user, setUser, chatList, setChatList }}>
          {children}
        </UserContext.Provider>
    )
}

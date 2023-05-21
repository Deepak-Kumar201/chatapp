import React, { useContext, useEffect, useState } from 'react'
import io from 'socket.io-client'
import { useUser } from './UserProvider'
import useLocalStorage from '../hooks/useLocalStorage'
import { isEmpty } from 'lodash'

const SocketContext = React.createContext()

export function useSocket() {
    return useContext(SocketContext)
}

export function SocketProvider({ children }) {
    const [chatSocket, setChatSocket] = useState()
    const [userSocket, setUserSocket] = useState();
    const { setUser, setChatList } = useUser();
    const [token, setToken] = useLocalStorage("token", "")
    useEffect(() => {
        // userSocket is used for auth and login 
        // chatSocket is used for chat events
        let userSocket, chatSocket;
        userSocket = io('http://localhost:5000/user');
        userSocket.on("connect", () => {
            if (!isEmpty(token)) {
                userSocket.emit("auth", token);
                userSocket.on("auth-success", (user) => {
                    chatSocket = io("http://localhost:5000/chat", { query: { token } });
                    chatSocket.on("connect", () => {
                        if (isEmpty(user)) return;
                        chatSocket.emit("join-room", user._id);
                        chatSocket.emit("get-chats");
                        chatSocket.on("chat-list", (chats) => {
                            console.log("chats", chats);
                            setChatList(chats);
                        })
                        chatSocket.on("new-chat", ()=>{
                            chatSocket.emit("get-chats");
                        })
                    })
                    setChatSocket(chatSocket)
                    setUser(user);
                })
                userSocket.on("auth-error", (err) => {
                    console.log(err);
                    window.localStorage.removeItem("token");
                })
            }
        })
        setUserSocket(userSocket);
        return () => {
            chatSocket.close()
            userSocket.close();
        }
    }, [])

    return (
        <SocketContext.Provider value={{ chatSocket, userSocket }}>
            {children}
        </SocketContext.Provider>
    )
}

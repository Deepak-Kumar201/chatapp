import React, { useContext, useEffect, useState } from 'react'
import useLocalStorage from '../hooks/useLocalStorage';
import { useSocket } from './SocketProvider';
import { isEmpty, set } from 'lodash';

const ChatContext = React.createContext()

export function useChat() {
    return useContext(ChatContext)
}

export function ChatProvider({ children }) {
    const [activeChat, setActiveChat] = useState({});
    const [messageQueue, setMessageQueue] = useState({})
    const [activeChatMessage, setActiveChatMessage] = useState([]);
    const { chatSocket } = useSocket();

    useEffect(() => {
        if (isEmpty(activeChat) || isEmpty(chatSocket)) return;
        chatSocket.emit("get-message", activeChat._id)
        chatSocket.on("requested-message", (messages) => {
            setActiveChatMessage(messages);
        })
        setMessageQueue({ ...messageQueue, [activeChat._id]: 0 })
        return ()=>{
            chatSocket.removeAllListeners("requested-message");
        }
    }, [activeChat])

    useEffect(() => {
        if (isEmpty(chatSocket)) return;
        chatSocket.on("new-message", (id, message) => {
            console.log(activeChat._id);
            console.log(id)
            if (id !== activeChat._id) {
                setMessageQueue({ ...messageQueue, [id]: (messageQueue[id] || 0) + 1 })
            } else {
                setActiveChatMessage([...activeChatMessage, message]);
            }
        })
        return ()=>{
            chatSocket.removeAllListeners("new-message");
        }
    }, [chatSocket, activeChat, activeChatMessage, messageQueue])

    return (
        <ChatContext.Provider value={{ activeChat, activeChatMessage, messageQueue, setActiveChat, setMessageQueue, setActiveChatMessage }}>
            {children}
        </ChatContext.Provider>
    )
}

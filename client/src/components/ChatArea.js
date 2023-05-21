import React, { useEffect, useState } from 'react'
import { useChat } from '../contexts/ChatProvider'
import { isEmpty } from 'lodash';
import { useUser } from '../contexts/UserProvider';
import { Badge } from 'reactstrap';
import { useSocket } from '../contexts/SocketProvider';
import moment from 'moment';

export default function ChatArea() {
    const [message, setMessage] = useState("")

    const { activeChat, setActiveChat, activeChatMessage, setActiveChatMessage } = useChat();
    const { user } = useUser();
    const { chatSocket } = useSocket();

    const sendMessage = () => {
        if (message.trim().length == 0) return;
        const userIds = activeChat.users.map((u) => u._id);
        const formattedMessage = {
            text: message,
            sentBy: user.name,
            sentAt: new Date(),
            sentById: user._id
        }
        chatSocket.emit("send-message", activeChat._id, userIds, formattedMessage);
        setActiveChatMessage([...activeChatMessage, formattedMessage]);
        setMessage("");
    }

    const copyID = () => {
        window.navigator.clipboard.writeText(activeChat._id);
    }

    const leaveGroup = () => {
        chatSocket.emit("delete-chat", activeChat._id);
        setActiveChat({});
        setActiveChatMessage([]);
    }

    useEffect(() => {
        const messageCont = document.getElementById("message-container");
        const messageBox = document.getElementById("message-box");
        if (messageCont) {
            messageCont.scrollTop = messageCont.scrollHeight;
            messageBox.focus();
        }
    }, [activeChat, activeChatMessage])

    if (isEmpty(activeChat)) {
        return (
            <div className='w-full h-[100vh] bg-gray-700 flex flex-col'>
            </div>
        )
    }

    return (
        <div className='w-full h-[100vh] bg-gray-700 flex flex-col text-white'>
            <div key={activeChat._id} className={`flex justify-between px-3 py-2 items-center bg-gray-950 h-[65px]`}>
                <div>
                    <div className='font-bold'>{activeChat.label}</div>
                    <div>
                        <span className='font-bold'>{activeChat.chatType === 'group' ? "Participants : " : "With : "}</span>
                        <span className='text-gray-200'>
                            {
                                activeChat.users.filter((u) => u._id !== user._id).length == 0 ?
                                    "Yourself" : activeChat.users.filter((u) => u._id !== user._id).map((u) => u.name).join(", ")
                            }
                        </span>
                    </div>
                </div>
                <div>
                    {activeChat.chatType === 'group' ? <Badge className='w-[50px]' color='primary'>Group</Badge> : <Badge className='w-[60px]' color='primary'>Personal</Badge>}
                    {activeChat.chatType === 'group' ? <Badge className='w-[70px] ml-2 cursor-pointer ' color='success' onClick={copyID}>Copy ID</Badge> : null}
                    {activeChat.chatType === 'group' ? <Badge className='w-[70px] ml-2 cursor-pointer ' color='danger' onClick={leaveGroup}>Leave</Badge> : null}

                </div>
            </div>
            <div className='h-full max-h-full overflow-y-scroll' id='message-container'>
                {
                    activeChatMessage.map((message) => {
                        return (
                            <div className={`w-[100%] flex ${message.sentById == user._id ? "justify-end" : "justify-start"}`}>
                                <div className="max-w-[60%] px-2 py-2 bg-gray-300 text-gray-900 rounded mx-2 my-1">
                                    <div>{message.text}</div>
                                    <div className="text-right text-[10px]">{moment(message.sentAt).format("hh:mm A")}</div>
                                </div>
                            </div>
                        )
                    })
                }
            </div>
            <div className='flex justify-between px-3 py-2 items-center bg-gray-950 h-[65px]'>
                <input type='text' value={message} onChange={(e) => setMessage(e.target.value)} className='w-[85%] h-[35px] text-black px-2 rounded focus:outline-none text-[14px]' placeholder='Type Message...' id="message-box" onKeyDown={e => {
                    e.key === 'Enter' && sendMessage();
                }} />
                <div onClick={() => sendMessage()} className='w-[10%] text-white bg-gray-700 h-[35px] flex justify-center items-center cursor-pointer rounded'>Send</div>
            </div>
        </div>
    )
}

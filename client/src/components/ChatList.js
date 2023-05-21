import React, { useState } from 'react'
import { useSocket } from '../contexts/SocketProvider';
import { useUser } from '../contexts/UserProvider';
import { isEmpty } from 'lodash';
import { Badge } from 'reactstrap';
import { useChat } from '../contexts/ChatProvider';
import CreateGroup from './CreateGroup';

export default function ChatList() {
    const { chatSocket } = useSocket();
    const [search, setSearch] = useState([]);
    const [searchEmail, setSearchEmail] = useState("")
    const [showCreateGroup, setShowCreateGroup] = useState(false)

    const { activeChat, messageQueue, setActiveChat } = useChat();
    const { user, chatList } = useUser();

    const searchUsers = (email) => {
        setSearchEmail(email);
        if (email.length < 3) {
            setSearch([]);
            return;
        }
        chatSocket.emit("search-user", email);
        chatSocket.on("search-user-result", (data) => {
            setSearch(data);
        })
    }

    const addToChat = (user) => {
        const label = window.prompt("Enter chat label.");
        if (isEmpty(label)) return;
        chatSocket.emit("start-chat", user, label);
        setSearch([]);
        setSearchEmail("");
    }

    const joinGroup = () => {
        const label = window.prompt("Enter group ID.");
        if (isEmpty(label)) return;
        chatSocket.emit("join-group", label);
    }

    const alreadyChatPresent = (id) => {
        let isPresent = false;
        const chat = chatList.forEach((chat) => {
            if(chat.chatType === 'group') return;
            chat.users.forEach((user) => {
                if(user._id === id) isPresent = true;
            })
        });
        return isPresent;
    }
    const logOut = ()=>{
        localStorage.removeItem('token');
        window.location.reload();
    }
    return (
        <div className="bg-gray-900 p-4 text-white h-[100vh] max-h-[100vh] overflow-y-scroll">
            <div className='relative'>
                <div className="flex flex-col">
                    <div className='relative flex justify-between'>
                        <input type='text' placeholder='Search users by email' value={searchEmail} onChange={(e) => searchUsers(e.target.value)} className='w-[70%] h-[35px] px-2 rounded focus:outline-none text-black' />
                        <button className='w-[25%] px-3 text-gray-900 bg-gray-100 rounded cursor-pointer' onClick={logOut}>Log Out</button>
                        <div className="absolute bg-purple-600 w-full top-[110%]">
                            {
                                !showCreateGroup && search.map((user, index) => {
                                    if(alreadyChatPresent(user._id)) return <></>;
                                    return (
                                        <div key={index} onClick={() => addToChat(user)} className='flex items-center py-2 px-4 border-b border-white w-full cursor-pointer hover:bg-purple-700 transition-all duration-200'>
                                            <img src={user.profilePic} className='h-10 rounded' />
                                            <div className='ml-5'>
                                                <div className='font-bold'>{user.email}</div>
                                                <div className='text-gray-200'>{user.name}</div>
                                            </div>
                                        </div>
                                    )
                                })
                            }
                        </div>
                    </div>
                    <div className="flex justify-between mt-2">
                        <div className="bg-red-600 py-2 text-center px-3 w-[47%] rounded cursor-pointer shadow shadow-black" onClick={() => setShowCreateGroup(true)}><i class="fa-sharp fa-solid fa-plus mr-2"></i>Create Group</div>
                        <div className="bg-green-600 py-2 text-center px-3 w-[47%] rounded cursor-pointer shadow shadow-black" onClick={() => joinGroup()}><i class="fa-solid fa-right-to-bracket mr-2"></i>Join Group</div>
                    </div>
                </div>
            </div>
            <div className='mt-4'>
                {
                    chatList.map((chat) => {
                        return (
                            <div key={chat._id} className={`flex justify-between px-3 py-2 items-center cursor-pointer border-b border-white ${activeChat._id === chat._id ? "bg-gray-950" : "hover:bg-gray-950"}`} onClick={() => setActiveChat(chat)}>
                                <div>
                                    <div className='font-bold'>{chat.label}</div>
                                    <div>
                                        <span className='font-bold'>{chat.chatType === 'group' ? "Participants : " : "With : "}</span>
                                        <span className='text-gray-200'>
                                            {
                                                chat.users.filter((u) => u._id !== user._id).length == 0 ?
                                                    "Yourself" : chat.users.filter((u) => u._id !== user._id).map((u) => u.name).join(", ")
                                            }
                                        </span>
                                    </div>
                                </div>
                                <div className='flex items-center'>
                                    {messageQueue[chat._id] ? <div className='w-[20px] h-[20px] flex justify-center items-center text-[10px] text-gray-800 rounded-full bg-white mr-2'>{messageQueue[chat._id]}</div> : null}
                                    {chat.chatType === 'group' ? <Badge className='w-[50px]' color='primary'>Group</Badge> : <Badge className='w-[60px]' color='primary'>Personal</Badge>}
                                </div>
                            </div>
                        )
                    })
                }
            </div>
            {showCreateGroup && <CreateGroup setShowCreateGroup={setShowCreateGroup} />}
        </div>
    )
}

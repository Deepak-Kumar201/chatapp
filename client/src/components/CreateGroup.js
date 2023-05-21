import React, { useState } from 'react'
import { Button, Modal, ModalBody, ModalFooter } from 'reactstrap'
import { useSocket } from '../contexts/SocketProvider';
import { useUser } from '../contexts/UserProvider';
import { isEmpty } from 'lodash';
import { Badge } from 'reactstrap';
import { useChat } from '../contexts/ChatProvider';

export default function CreateGroup(props) {
    const { setShowCreateGroup } = props;
    const { chatSocket } = useSocket();
    const [search, setSearch] = useState([]);
    const [searchEmail, setSearchEmail] = useState("")
    const [selectedUsers, setSelectedUsers] = useState([])
    const [groupName, setGroupName] = useState("")
    const [loading, setloading] = useState(false)
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

    const createGroup = () => {
        setloading(true)
        chatSocket.emit("create-group", selectedUsers, groupName);
        chatSocket.on("group-created", () => {
            setShowCreateGroup(false)
            setloading(false)
        });
    }

    return (
        <Modal isOpen={true} size='lg'>
            <ModalBody className='bg-gray-300'>
                <div className='relative'>
                    <div className='flex flex-col justify-center'>
                        <input type='text' placeholder='Group Name' value={groupName} onChange={(e) => setGroupName(e.target.value)} className='w-[80%] px-2 rounded focus:outline-none text-black mx-auto h-[40px] max-w-[80%] mb-2' disabled={loading} />
                        <input type='text' placeholder='Search users by email' value={searchEmail} onChange={(e) => searchUsers(e.target.value)} className='w-[80%] px-2 rounded focus:outline-none text-black mx-auto h-[40px] max-w-[80%] mb-2' disabled={loading} />
                    </div>
                    <div className="absolute bg-purple-600 left-[10%] w-[80%]">
                        {
                            search.map((searchUser, index) => {
                                if (searchUser._id == user._id) return null;
                                if (selectedUsers.find(e => e._id == searchUser._id)) return null;
                                return (
                                    <div key={index} onClick={() => { setSelectedUsers([...selectedUsers, searchUser]); setSearch([]); setSearchEmail("") }} className='flex items-center py-2 px-4 border-b border-white w-full cursor-pointer hover:bg-purple-700 transition-all duration-200'>
                                        <img src={searchUser.profilePic} className='h-10 rounded' />
                                        <div className='ml-5'>
                                            <div className='font-bold'>{searchUser.email}</div>
                                            <div className='text-gray-200'>{searchUser.name}</div>
                                        </div>
                                    </div>
                                )
                            })
                        }
                    </div>
                </div>
                <div>
                    {
                        selectedUsers.map((user, index) => {
                            return (
                                <div className='flex justify-between items-center py-2 px-4 border-b border-white w-[80%] cursor-pointer text-white bg-gray-700 ml-[10%]'>
                                    <div key={index} className='flex items-center'>
                                        <img src={user.profilePic} className='h-10 rounded' />
                                        <div className='ml-5'>
                                            <div className='font-bold'>{user.email}</div>
                                            <div className='text-gray-200'>{user.name}</div>
                                        </div>
                                    </div>
                                    <div>
                                        <i className='fas fa-times mr-4' onClick={() => setSelectedUsers(selectedUsers.filter(e => e._id != user._id))}></i>
                                    </div>
                                </div>
                            )
                        })
                    }
                </div>
            </ModalBody>
            <ModalFooter>
                <Button color='danger' onClick={() => setShowCreateGroup(false)} disabled={loading}>Close</Button>
                <Button color='success' onClick={() => createGroup()} disabled={loading}>Create</Button>
            </ModalFooter>
        </Modal>
    )
}

import React from 'react'
import signinwithGoogle from '../contexts/FirebaseProvider'
import { useSocket } from '../contexts/SocketProvider';

export default function Login() {
    const { userSocket } = useSocket();
    const signIn = async () => {
        const user = await signinwithGoogle();
        console.log(user);
        userSocket.emit("login", user);
        userSocket.on("login-success", (token) => {
            window.localStorage.setItem("token", token);
            window.location.reload();
        })
    }
    return (
        <div className='flex h-screen w-screen justify-center items-center bg-gray-200'>
            <div className='flex justify-center items-center flex-col bg-gray-900 text-white px-10 py-5 rounded-md'>
                <h3>Welcome to your Chatroom</h3>
                <button onClick={signIn} className='bg-green-600 text-white px-4 py-2 rounded mt-4'>
                    Continue with Google
                </button>
            </div>
        </div>
    )
}

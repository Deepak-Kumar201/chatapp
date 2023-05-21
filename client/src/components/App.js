import React, { useEffect } from 'react'
import { isEmpty } from "lodash"
import useLocalStorage from '../hooks/useLocalStorage';
import { UserProvider, use, useUser } from '../contexts/UserProvider'
import { SocketProvider, useSocket } from '../contexts/SocketProvider';
import Login from './Login';
import Dashboard from './Dashboard';

function App() {
    const { user, setUser } = useUser();
    const { socket } = useSocket();
    useEffect(() => {

    }, []);

    return (
        <div>
            {
                isEmpty(user) ? <Login /> : <Dashboard />
            }
        </div>
    )
}

export default App;

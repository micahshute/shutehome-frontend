import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useLazyRest } from '../hooks/useLazyRest'
import { useUser } from '../hooks/useUser'

export default function Login(){
    const [username, setUsername] = useState("")
    const [password, setPassword] = useState("")

    const { login } = useUser()

    const {
        data,
        error,
        loading,
        call
    } = useLazyRest()

    const handleLogin = () => {
        const body = {
            username,
            password
        }
        setUsername('')
        setPassword('')
        call('/login', 'post', body)
    }

    useEffect(() => {
        if(!loading && !error && data && Object.keys(data).length > 0){
            login({ user: data })
        }
    }, [loading, data, error, login])

    const renderError = () => (
        <p>There was a problem logging you in</p>
    )

    const renderSignupLink = () => (
        <div>
            <Link to="/signup">No Account? Sign up</Link>    
        </div>
    )


    if(!data){
        return (
            <div>
                <input 
                    type="text" 
                    onChange={e => setUsername(e.target.value)}
                    value={username}
                />
                <input 
                    type="password"
                    onChange={e => setPassword(e.target.value)}
                    value={password}
                />
                <button onClick={handleLogin} disabled={loading}>Log in</button>
                { error && renderError() }
                { renderSignupLink() }
            </div>
        )
    }

    return <p>Success!</p>
}
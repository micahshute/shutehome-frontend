import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useLazyRest } from '../hooks/useLazyRest'
import { useUser } from '../hooks/useUser'
import iconHome from '../assets/icon_home.png';

export default function Login(){
    const [username, setUsername] = useState("")
    const [password, setPassword] = useState("")
    const [rememberMe, setRememberMe] = useState(false)

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
            password,
            rememberMe
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
        <p className="danger-dark">There was a problem logging you in</p>
    )

    const renderSignupLink = () => (
        <div className="mt-10">
            <Link to="/signup" className="dark-link">No Account? Sign up</Link>    
        </div>
    )


    if(!data) {
        return (
            <div className="dark-landing page flex align-center flex-col">
                <div>
                    <img src={iconHome} />
                </div>
                <h1>ShuteHome</h1>
                <div className="mt-10">
                    <label for="username">Username</label>
                    <input
                        className="input-dark"
                        id="username"
                        type="text" 
                        onChange={e => setUsername(e.target.value)}
                        value={username}
                    />
                </div>
                <div className="mt-5">
                    <label for="password">Password</label>
                    <input 
                        className="input-dark"
                        id="password"
                        type="password"
                        onChange={e => setPassword(e.target.value)}
                        value={password}
                    />
                </div>
                <div className="m-15">
                    <button className="btn-dark" onClick={handleLogin} disabled={loading}>Log in</button>
                </div>
                <div className="text-sm">
                    <label className="checkmark-container-sm text-sm">
                        <span className="text-sm">Remember Me</span>
                        <input type="checkbox" checked={rememberMe} onChange={e => setRememberMe(e.target.checked)} />
                        <span class="checkmark-sm"></span>
                    </label>
                </div>
                { error && renderError() }
                { renderSignupLink() }
            </div>
        )
    }

    return <p>Success!</p>
}
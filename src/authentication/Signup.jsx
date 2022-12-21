import { useEffect, useState } from "react"
import { Link } from "react-router-dom"
import { useLazyRest } from "../hooks/useLazyRest"
import { useUser } from "../hooks/useUser"
import iconHome from '../assets/icon_home.png';

export default function Signup(){
    const [name, setName] = useState("")
    const [username, setUsername] = useState("")
    const [password, setPassword] = useState("")
    const [shutehomeSecret, setShutehomeSecret] = useState("")
    const { login } = useUser()

    const {
        data,
        error,
        loading,
        call
    } = useLazyRest()

    const handleSignup = async () => {
        const body = {
            name,
            username,
            password,
            secret: shutehomeSecret
        }
        setName('')
        setUsername('')
        setPassword('')
        call('/signup', 'post', body)
    }

    useEffect(() => {
        if(!loading && !error && data && Object.keys(data).length > 0){
            login({ user: data })
        }
    }, [loading, error, data, login])

    const renderError = () => (
        <p>There was a problem creating your account</p>
    )

    const renderLoginLink = () => (
        <p>Already have an account?{` `}<Link to='/' className="dark-link bold">Login</Link></p>
    )


    return (
        <div className="dark-landing page flex align-center flex-col">
            <div>
                <img src={iconHome}/>
            </div>
            <h1>ShuteHome</h1>
            <div className="mt-10">
                <label htmlFor="name">Name</label>
                <input 
                    className="input-dark"
                    type="text" 
                    id="name"
                    onChange={e => setName(e.target.value)}
                    value={name}
                />
            </div>
            <div className="mt-5">
                <label htmlFor="username">Username</label>
                <input 
                    className="input-dark"
                    type="text" 
                    id="username"
                    onChange={e => setUsername(e.target.value)}
                    value={username}
                />
            </div>
            <div className="mt-5">
                <label htmlFor="password">Password</label>
                <input 
                    className="input-dark"
                    id="password"
                    type="password"
                    onChange={e => setPassword(e.target.value)}
                    value={password}
                />
            </div>
            <div className="mt-5">
                <label htmlFor="secret">ShuteHome Secret</label>
                <input 
                    className="input-dark"
                    id="secret"
                    type="password"
                    onChange={e => setShutehomeSecret(e.target.value)}
                    value={shutehomeSecret}
                />
            </div>
            <div className="mt-30">
                <button className="btn-dark" onClick={handleSignup} disabled={loading}>Create Account</button>
            </div>
            { error && renderError() }
            { renderLoginLink() }
        </div>
    )

}
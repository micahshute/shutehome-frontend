import { useEffect, useState } from "react"
import { Link } from "react-router-dom"
import { useLazyRest } from "../hooks/useLazyRest"
import { useUser } from "../hooks/useUser"


export default function Signup(){
    const [name, setName] = useState("")
    const [username, setUsername] = useState("")
    const [password, setPassword] = useState("")
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
            password
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
        <p>Already have an account?<Link to='/'>Login</Link></p>
    )


    return (
        <div>
            <label htmlFor="name">Name</label>
            <input 
                type="text" 
                id="name"
                onChange={e => setName(e.target.value)}
                value={name}
            />
            <label htmlFor="username">Username</label>
            <input 
                type="text" 
                id="username"
                onChange={e => setUsername(e.target.value)}
                value={username}
            />
            <label htmlFor="password">Password</label>
            <input 
                id="password"
                type="password"
                onChange={e => setPassword(e.target.value)}
                value={password}
            />
            <button onClick={handleSignup} disabled={loading}>Create Account</button>
            { error && renderError() }
            { renderLoginLink() }
        </div>
    )

}
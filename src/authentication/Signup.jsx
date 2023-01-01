import { useEffect, useState } from "react"
import { Link } from "react-router-dom"
import { useLazyRest } from "../hooks/useLazyRest"
import { useUser } from "../hooks/useUser"
import iconHome from '../assets/icon_home.png';

export default function Signup(){
    const [name, setName] = useState("")
    const [username, setUsername] = useState("")
    const [password, setPassword] = useState("")
    const [passwordConfirmation, setPasswordConfirmation] = useState("")
    const [passwordsMatch, setPasswordsMatch] = useState(false)
    const [displayPasswordMismatch, setDisplayPasswordMismatch] = useState(false)
    const [shutehomeSecret, setShutehomeSecret] = useState("")
    const [usernameIsNotUnique, setUsernameIsNotUnique] = useState(false)
    const { login } = useUser()

    const {
        data,
        error,
        loading,
        call
    } = useLazyRest()

    const handleSignup = async () => {
        if(!passwordsMatch){
            setDisplayPasswordMismatch(true)
            return
        }
        const body = {
            name,
            username,
            password,
            secret: shutehomeSecret
        }
        call('/signup', 'post', body)
    }

    useEffect(() => {
        if(!loading && !error && data && Object.keys(data).length > 0){
            login({ user: data })
            setName('')
            setUsername('')
            setPassword('')
            setPasswordConfirmation('')
        } else if(error){
            if(error.json){
                error.clone().json().then(res => {
                    if(res.error.includes("Username has already been taken")){
                        setUsernameIsNotUnique(true)
                    }
                })
            }
        }
    }, [loading, error, data, login])

    useEffect(() => {
        if(password === passwordConfirmation && password.length > 0){
            setPasswordsMatch(true)
        }else{
            setPasswordsMatch(false)
        }
    }, [password, passwordConfirmation])

    const passwordsDoNotMatch = displayPasswordMismatch && !passwordsMatch

    const renderError = () => (
        <p className='danger-dark'>There was a problem creating your account</p>
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
                    required
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
                    required
                />
                { usernameIsNotUnique && <label className='danger-dark'>Username not available</label>}
            </div>
            <div className="mt-5">
                <label htmlFor="password">Password</label>
                <input 
                    className="input-dark"
                    id="password"
                    type="password"
                    onChange={e => setPassword(e.target.value)}
                    value={password}
                    required
                />
            </div>
            <div className="mt-5">
                <label htmlFor="password">Password Confirmation</label>
                <input 
                    className="input-dark"
                    id="password-confirmation"
                    type="password"
                    onChange={e => setPasswordConfirmation(e.target.value)}
                    value={passwordConfirmation}
                    required
                />
                { passwordsDoNotMatch && <label className='danger-dark'>Your passwords do not match</label>}
            </div>
            <div className="mt-5">
                <label htmlFor="secret">ShuteHome Secret</label>
                <input 
                    className="input-dark"
                    id="secret"
                    type="password"
                    onChange={e => setShutehomeSecret(e.target.value)}
                    value={shutehomeSecret}
                    required
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
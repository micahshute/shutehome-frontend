import { useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { useLazyRest } from "./hooks/useLazyRest"
import { useUser } from "./hooks/useUser"
import { useLocation } from "react-router-dom"

export default function Navbar({appLinks=[]}){
    const { data, error, loading, call } = useLazyRest()
    const navigate = useNavigate()
    const { logout } = useUser()
    const location = useLocation()

    useEffect(() => {
        if(!error && !loading && data){
            logout()
            navigate("/")
        }
    }, [error, loading, data])

    const handleLogout = async () => {
        call('/logout', 'post')
        logout()
    }

    const handleSwitchApps = () => {
        navigate('/')
    }

    const handleGoHome = () => {
        const basePath = location.pathname.split('/')[1]
        navigate(`/${basePath}`)
    }

    const gotoAppLink = path => {
        const basePath = location.pathname.split('/')[1]
        navigate(`/${basePath}${path}`)
    }

    const renderAppLinks = () => (
        appLinks.map(appLink => (
            <button onClick={() => gotoAppLink(appLink.path)} className="navbar-button" key={appLink.text}>{appLink.text}</button>
        ))
    )

    return (
        <nav className="navbar">
            <button onClick={ handleSwitchApps } className="navbar-button">Switch Apps</button>
            <button onClick={ handleGoHome } className="navbar-button">Home</button>
            { renderAppLinks() }
            <button onClick={ handleLogout } className="navbar-button" id="logout" disabled={loading}>Logout</button> 
        </nav>
    )
}
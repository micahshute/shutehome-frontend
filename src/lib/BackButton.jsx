import { FaArrowLeft } from "react-icons/fa"
import { useNavigate } from "react-router-dom"
export default function BackButton({pathUrl}){
    const navigate = useNavigate()
    return (
        <button 
            onClick={() => navigate(pathUrl)}
            className="btn btn-primary btn-small pullup"     
        ><FaArrowLeft /></button>
    )
}
import {
  BrowserRouter as Router,
  Routes,
  Route,
  useNavigate
} from "react-router-dom";
import Navbar from "./Navbar";
import Card from "./lib/Card";
import { FaBaby } from 'react-icons/fa'
import { GiClassicalKnowledge, GiDefenseSatellite } from 'react-icons/gi'
import { isMobile } from 'react-device-detect'

export default function AdminAppChooser(){

    const navigate = useNavigate()

    return (
        <>
            <Navbar />
            <div className="page">
                <div className="grid-container">
                    <div className="m-10p">
                        <Card 
                            header={isMobile ? '' : 'Baby Tracker'}
                            onClick={() => { navigate('/baby-tracker') }} 
                        >
                            <div className="w-full text-center">
                                <FaBaby size={70} /> 
                                <p>&nbsp;</p>
                            </div>
                        </Card>
                    </div>
                    <div className="m-10p">
                        <Card 
                            header={isMobile ? '' : 'Knowledge Tracker'}
                            onClick={() => { navigate('/knowledge-tracker')}} 
                        >
                            <div className="w-full text-center">
                                <GiClassicalKnowledge size={70} /> 
                                <p>&nbsp;</p>
                            </div>
                        </Card>
                    </div>
                    <div className="m-10p">
                        <Card 
                            header={isMobile ? '' : 'Home Security'}
                            onClick={() => { alert("App not setup")}} 
                        >
                            <div className="w-full text-center">
                                <GiDefenseSatellite size={70} /> 
                                <p>Coming soon</p>
                            </div>
                        </Card>
                    </div>
                </div>
            </div>
        </>
    )
}
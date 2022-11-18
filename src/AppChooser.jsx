import NonAdminApp from "./apps/NonAdminApp/NonAdminApp"
import { useUser } from "./hooks/useUser"
import {
  BrowserRouter as Router,
  Routes,
  Route,
} from "react-router-dom";
import BabyTrackerApp from "./apps/AdminApp/BabyApp/BabyTrackerApp";
import KnowledgeApp from "./apps/AdminApp/KnowledgeApp/KnowledgeApp";
import AdminAppChooser from "./AdminAppChooser";

export default function AppChooser(){

    const { user } = useUser()

    if(!user.isAdmin){
        return ( <NonAdminApp />)
    }

    return(
        <Router>
            <Routes>
                <Route path="/" element={ <AdminAppChooser /> } />
                <Route path="/baby-tracker/*" element={ <BabyTrackerApp />} />
                <Route path="/knowledge-tracker/*" element={ <KnowledgeApp /> } />
            </Routes>
        </Router>
    )
}
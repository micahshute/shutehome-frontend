import {
  BrowserRouter as Router,
  Routes,
  Route,
} from "react-router-dom";
import Login from "./Login";
import Signup from './Signup'

export default function LoginApp(){

    return (
        <Router>
            <Routes>
                <Route path="/" element={<Login/>}/>
                <Route path="/signup" element={<Signup/>}/>
            </Routes>
        </Router>
    )

}
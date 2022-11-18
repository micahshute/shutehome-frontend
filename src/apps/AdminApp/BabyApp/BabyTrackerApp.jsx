import {
  Routes,
  Route,
} from "react-router-dom";
import Navbar from "../../../Navbar";
import BabyOvervirew from "./components/BabyOverview";
import Home from "./components/Home";
import ShowFeed from "./components/ShowFeed";

export default function BabyTrackerApp(){
    return  (
      <>
        <Navbar />
        <Routes>
          <Route path="/" element={ <Home />} />
          <Route path="/babies/:id/feedings" element={ <ShowFeed />} />
          <Route path="/babies/:id" element={ <BabyOvervirew /> } />
        </Routes>
      </>
    )
}
import {
  Routes,
  Route,
} from "react-router-dom";
import Navbar from "../../../Navbar";
import BabyOvervirew from "./components/BabyOverview";
import Home from "./components/Home";
import ShowFeed from "./components/stat_pages/ShowFeed";
import ShowSleep from "./components/stat_pages/ShowSleep";

export default function BabyTrackerApp(){
    return  (
      <>
        <Navbar />
        <Routes>
          <Route path="/" element={ <Home />} />
          <Route path="/babies/:id/feedings" element={ <ShowFeed />} />
          <Route path="/babies/:id/sleeps" element={ <ShowSleep />} />
          <Route path="/babies/:id" element={ <BabyOvervirew /> } />
        </Routes>
      </>
    )
}
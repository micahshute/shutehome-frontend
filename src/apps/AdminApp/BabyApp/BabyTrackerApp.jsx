import {
  Routes,
  Route,
} from "react-router-dom";
import Navbar from "../../../Navbar";
import BabyOvervirew from "./components/BabyOverview";
import Home from "./components/Home";
import ShowDiaper from "./components/stat_pages/ShowDiaper";
import ShowEvent from "./components/stat_pages/ShowEvent";
import ShowFeed from "./components/stat_pages/ShowFeed";
import ShowMeasurement from "./components/stat_pages/ShowMeasurement";
import ShowPump from "./components/stat_pages/ShowPump";
import ShowSleep from "./components/stat_pages/ShowSleep";
import ShowTummyTime from "./components/stat_pages/ShowTummyTime";

export default function BabyTrackerApp(){
    return  (
      <>
        <Navbar />
        <Routes>
          <Route path="/" element={ <Home />} />
          <Route path="/babies/:id/feedings" element={ <ShowFeed />} />
          <Route path="/babies/:id/sleeps" element={ <ShowSleep />} />
          <Route path="/babies/:id/diapers" element={ <ShowDiaper />} />
          <Route path="/babies/:id/events" element={ <ShowEvent />} />
          <Route path="/babies/:id/measurements" element={ <ShowMeasurement /> } />
          <Route path="/babies/:id/pumps" element={ <ShowPump /> } />
          <Route path="/babies/:id/tummy-times" element={ <ShowTummyTime /> } />
          <Route path="/babies/:id" element={ <BabyOvervirew /> } />
        </Routes>
      </>
    )
}
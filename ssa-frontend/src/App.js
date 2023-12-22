import "./App.css";
import Sidebar from "./components/Sidebar";
import SupervisorProfiles from "./components/SupervisorProfiles";
import Dashboard from "./components/Dashboard";
import UserProfile from "./components/UserProfile";
import { BrowserRouter, Route, Routes, Link } from "react-router-dom";


function App() {
  return (
    <BrowserRouter>
      <div className="App">
          <Sidebar/>
        <Routes>
          <Route path="/" element={<Dashboard/>} />
          <Route path="/supervisor-profiles" element={<SupervisorProfiles/>} />
          <Route path="/your-profile" element={<UserProfile/>} />
        </Routes>
      </div>
    </BrowserRouter>
  );
 }

export default App;

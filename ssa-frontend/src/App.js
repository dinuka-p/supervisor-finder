import "./App.css";
import Sidebar from "./components/Sidebar";
import SupervisorProfiles from "./components/SupervisorProfiles";
import Dashboard from "./components/Dashboard";
import UserProfile from "./components/UserProfile";
import Login from "./components/Login";
import SignUp from "./components/SignUp";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import SupervisorDetails from "./components/SupervisorDetails";


function App() {
  return (
    <BrowserRouter>
      <div className="App">
          <Sidebar/>
        <Routes>
          <Route path="/" element={<SupervisorProfiles/>} />
          <Route path="/dashboard" element={<Dashboard/>} />
          <Route path="/supervisor/:id" element={<SupervisorDetails/>} />
          <Route path="/your-profile" element={<UserProfile/>} />
          <Route path="/login" element={<Login/>} />
          <Route path="/signup" element={<SignUp/>} />
        </Routes>
      </div>
    </BrowserRouter>
  );
 }

export default App;

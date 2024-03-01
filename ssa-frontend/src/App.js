import "./App.css";
import Sidebar from "./components/Sidebar";
import SupervisorProfiles from "./components/SupervisorProfiles";
import Dashboard from "./components/Dashboard";
import UserProfile from "./components/UserProfile";
import Login from "./components/Login";
import SignUp from "./components/SignUp";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import SupervisorDetails from "./components/SupervisorDetails";
import { useAuth } from "./context/AuthProvider";
import StudentProfiles from "./components/StudentProfiles";
import StudentDetails from "./components/StudentDetails";

function App() {
  
  const { auth } = useAuth();

  return (
    <BrowserRouter>
      
        {auth.role !== "Supervisor"?
        (<div className="App"> 
          <Sidebar />
          <Routes>
            <Route path="/login" element={<Login/>} />
            <Route path="/signup" element={<SignUp/>} />
            <Route path="/" element={<SupervisorProfiles/>} />
            <Route path="/supervisor/:id" element={<SupervisorDetails/>} />
            <Route path="/dashboard" element={<Dashboard/>} />
            <Route path="/your-profile" element={<UserProfile/>} />
          </Routes>
        </div>)
        :(
          <>
          <div className="App"> 
            <Sidebar />
            <Routes>
              <Route path="/login" element={<Login/>} />
              <Route path="/signup" element={<SignUp/>} />
              <Route path="/" element={<SupervisorProfiles/>} />
              <Route path="/supervisor/:id" element={<SupervisorDetails/>} />
              <Route path="/dashboard" element={<Dashboard/>} />
              <Route path="/your-profile" element={<UserProfile/>} />
              <Route path="/students" element={<StudentProfiles/>} />
              <Route path="/student/:id" element={<StudentDetails/>} />
            </Routes>
          </div>
          </>
        )}
        
      
    </BrowserRouter>
  );
 }

export default App;

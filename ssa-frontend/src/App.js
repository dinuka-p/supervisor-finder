import "./App.css";
import Sidebar from "./components/Sidebar";
import SupervisorProfiles from "./components/SupervisorProfiles";
import Dashboard from "./components/Dashboard";
import UserProfile from "./components/UserProfile";
import Login from "./components/Login";
import SignUp from "./components/SignUp";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import SupervisorDetails from "./components/SupervisorDetails";
import useToken from "./components/UseToken";

function App() {
  
  const {token, removeToken, setToken} = useToken();

  return (
    <BrowserRouter>
      
        {!token && token!=="" && token!==undefined?
        (<div className="App"> 
          <Sidebar />
          <Routes>
            <Route path="/login" element={<Login setToken={setToken}/>} />
            <Route path="/signup" element={<SignUp/>} />
            <Route path="/" element={<SupervisorProfiles/>} />
            <Route path="/supervisor/:id" element={<SupervisorDetails/>} />
          </Routes>
        </div>)
        :(
          <>
          <div className="App"> 
            <Sidebar />
            <Routes>
              <Route path="/login" element={<Login setToken={setToken}/>} />
              <Route path="/signup" element={<SignUp/>} />
              <Route path="/" element={<SupervisorProfiles/>} />
              <Route path="/supervisor/:id" element={<SupervisorDetails/>} />
              <Route path="/dashboard" element={<Dashboard/>} />
              <Route path="/your-profile" element={<UserProfile token={token} setToken={setToken}/>} />
            </Routes>
          </div>
          </>
        )}
        
      
    </BrowserRouter>
  );
 }

export default App;

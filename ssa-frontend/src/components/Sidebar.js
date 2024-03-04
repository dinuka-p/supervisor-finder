import React from "react"
import { Link, useLocation } from "react-router-dom";
import "../App.css"
import DashboardRoundedIcon from '@mui/icons-material/DashboardRounded';
import SchoolRoundedIcon from '@mui/icons-material/SchoolRounded';
import AssignmentIndRoundedIcon from '@mui/icons-material/AssignmentIndRounded';
import GroupsRoundedIcon from '@mui/icons-material/GroupsRounded';
import FavoriteRoundedIcon from '@mui/icons-material/FavoriteRounded';
import { useAuth } from  '../context/AuthProvider'

const SidebarData = [
    {
        title: "Supervisors",
        icon: <SchoolRoundedIcon fontSize="large"/>, 
        link: "/",
    },
    {
        title: "Dashboard",
        icon: <DashboardRoundedIcon fontSize="large"/>, 
        link: "/dashboard",
    },
    {
        title: "Profile",
        icon: <AssignmentIndRoundedIcon fontSize="large"/>, 
        link: "/your-profile",
    },
];

function Sidebar() {
    const location = useLocation();
    const { auth, setAuth } = useAuth();

    let extraTabs = [];

    if (auth.role === "Supervisor") {
        //extra tabs for supervisors
        extraTabs = [
            {
                title: "Students",
                icon: <GroupsRoundedIcon fontSize="large" />,
                link: "/students",
            },
            {
                title: "Preferences",
                icon: <FavoriteRoundedIcon fontSize="large" />,
                link: "/preferences",
            },
        ];
    } else if (auth.role === "Student") {
        //extra tab for students
        extraTabs = [
            {
                title: "Preferences",
                icon: <FavoriteRoundedIcon fontSize="large" />,
                link: "/preferences",
            },
        ];
    }

    const updatedSidebar = [...SidebarData, ...extraTabs];

    const handleLogout = () => {
        localStorage.removeItem("preferred");
        setAuth({});
      }

    return (
        <div className = "sidebar">
            <div>
                <div className="sidebar-heading">
                    <img className="sidebar-logo" src={require("../images/uob-logo.png")} alt="University of Birmingham logo" />
                    <h3 className="sidebar-title">UoB Supervisor Finder</h3>
                </div>
                <div>
                    <ul className="sidebar-items">
                        {updatedSidebar.map((val,key) => {
                            return (
                                <li key = {key} 
                                className="sidebar-row"
                                    id = {location.pathname == val.link ? "active" : ""}>
                                    <Link className="sidebar-nav" id = {location.pathname == val.link ? "active" : ""} to={val.link}>
                                        <div className="sidebar-nav-div">{val.icon}</div>
                                        <div className="sidebar-nav-div">{val.title}</div>
                                    </Link>
                                </li>
                            ) 
                        })}
                    </ul>
                </div>
            </div>
            
            {!auth.accessToken && (
                <div className="sidebar-links">
                    <Link to="/login" className="auth-button">Log In</Link>
                    <Link to="/signup" className="auth-button">Sign Up</Link>
                </div>)}
              {auth.accessToken && (
                <div className="sidebar-authenticated">
                    <div className="sidebar-profile-container">
                        <img className="sidebar-profile-image" src={require("../images/default-profile.jpg")} alt="" />
                        <div className="sidebar-profile-details">
                            <p id="name">{auth.name}</p>
                            <div className="sidebar-profile-role-logout">
                                <p id="role">{auth.role} •</p>
                                <Link to="/" className="logout-button" onClick={handleLogout}>Log Out</Link>
                            </div>
                        </div>
                    </div>
                </div>
                )}
        </div>
    )
}

export default Sidebar
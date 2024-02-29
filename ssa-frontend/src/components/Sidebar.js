import React from "react"
import { Link, useLocation } from "react-router-dom";
import "../App.css"
import DashboardRoundedIcon from '@mui/icons-material/DashboardRounded';
import SchoolRoundedIcon from '@mui/icons-material/SchoolRounded';
import AssignmentIndRoundedIcon from '@mui/icons-material/AssignmentIndRounded';

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

    return (
        <div className = "sidebar">
            <div>
                <div className="sidebar-heading">
                    <img className="sidebar-logo" src={require("../images/uob-logo.png")} alt="University of Birmingham logo" />
                    <h3 className="sidebar-title">UoB Supervisor Finder</h3>
                </div>
                <div>
                    <ul className="sidebar-items">
                        {SidebarData.map((val,key) => {
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
            <div className="sidebar-links">
                <Link to="/login" className="auth-button">Log In</Link>
                <Link to="/signup" className="auth-button">Sign Up</Link>
            </div>
        </div>
    )
}

export default Sidebar
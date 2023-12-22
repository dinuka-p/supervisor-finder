import React from "react"
import "../App.css"
import DashboardRoundedIcon from '@mui/icons-material/DashboardRounded';
import SchoolRoundedIcon from '@mui/icons-material/SchoolRounded';
import AssignmentIndRoundedIcon from '@mui/icons-material/AssignmentIndRounded';

const SidebarData = [
    {
        title: "Dashboard",
        icon: <DashboardRoundedIcon fontSize="large"/>, 
        link: "/",
    },
    {
        title: "Supervisors",
        icon: <SchoolRoundedIcon fontSize="large"/>, 
        link: "/supervisor-profiles",
    },
    {
        title: "Profile",
        icon: <AssignmentIndRoundedIcon fontSize="large"/>, 
        link: "/your-profile",
    },
];

function Sidebar() {
    return (
        <div className = "sidebar">
            <div className="sidebar-heading">
                <img className="sidebar-logo" src={require("../images/uob-logo.png")} alt="University of Birmingham logo" />
                <h3 className="sidebar-title">UoB Supervisor Allocation</h3>
            </div>
            <div>
                <ul className="sidebar-items">
                    {SidebarData.map((val,key) => {
                        return (
                            <li key = {key} 
                                className="sidebar-row"
                                id = {window.location.pathname == val.link ? "active" : ""}
                                onClick={()=>{window.location.pathname = val.link}}>
                                <div id="icon">{val.icon}</div>
                                <div id="title">{val.title}</div>
                            </li>
                        ) 
                    })}
                </ul>
            </div>
        </div>
    )
}

export default Sidebar
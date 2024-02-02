import React, { useState, useEffect } from "react"
import { useParams } from "react-router-dom"
import "../App.css"
import MailOutlineRoundedIcon from '@mui/icons-material/MailOutlineRounded';
import PlaceOutlinedIcon from '@mui/icons-material/PlaceOutlined';
import SpeakerNotesOutlinedIcon from '@mui/icons-material/SpeakerNotesOutlined';
import CalendarMonthOutlinedIcon from '@mui/icons-material/CalendarMonthOutlined';
import AddLinkRoundedIcon from '@mui/icons-material/AddLinkRounded';
import PeopleAltOutlinedIcon from '@mui/icons-material/PeopleAltOutlined';
import ForumOutlinedIcon from '@mui/icons-material/ForumOutlined';
import WorkHistoryOutlinedIcon from '@mui/icons-material/WorkHistoryOutlined';
import WestRoundedIcon from '@mui/icons-material/WestRounded';



//TODO - ADD STYLING TO BACK BUTTON
function SupervisorDetails() {
    const { id } = useParams();
    const [supervisorData, setSupervisorData] = useState(null)

    useEffect(() => {
        fetch(`/api/supervisor-details/${id}`).then(
        res => res.json()
        ).then(
        data => {
            setSupervisorData(data.supervisor_info)
            console.log(supervisorData)
        }
        )
    }, [id])

    //TODO - if nothing is returned, display an error page
    if (!supervisorData) {
        return <div>Loading...</div>
    }

    return (
        <div className="page-content">
            <div className="page-heading-container">
                <h1 className="page-title">Supervisor Details</h1>
                <button className="back-button" onClick={()=>{window.location.pathname = "/supervisor-profiles"}}> 
                    <WestRoundedIcon/>
                    <p className="back-button-text">Back to Supervisors</p>
                </button>
            </div>

            <div className="profile-card">
                <div className="profile-image-container">
                    <img className="profile-image" src={require("../images/default-profile.jpg")} alt={supervisorData.name} />
                </div>
                <div className="profile-card-details">
                    <h2 className="profile-card-name">{supervisorData.name}</h2>
                    <div className="profile-card-data">
                        <MailOutlineRoundedIcon/>
                        <p className="profile-card-text">{supervisorData.email}</p>
                    </div>
                    <div className="profile-card-data">
                        <PlaceOutlinedIcon/>
                        <p className="profile-card-text">Location: {supervisorData.location}</p>
                    </div>
                    <div className="profile-card-data">
                        <SpeakerNotesOutlinedIcon/>
                        <p className="profile-card-text">Preferred contact: {supervisorData.contact}</p>
                    </div>
                    <div className="profile-card-data">
                        <CalendarMonthOutlinedIcon/>
                        <p className="profile-card-text">Office hours:</p>
                    </div>
                    <div className="profile-card-data">
                        <AddLinkRoundedIcon/>
                        <p className="profile-card-text">Booking link:</p>
                    </div>
                </div>
            </div>

            <div className="profile-info">
                <div className="profile-projects">
                    <div className="profile-card-data">
                        <div className="profile-card-text">
                            <h4 className="profile-data-no-margin">Projects:</h4>
                            <p className="profile-data-no-margin">{supervisorData.projects}</p>
                        </div>
                    </div>
                    <div className="profile-card-data">
                        <div className="profile-card-text">
                            <h4 className="profile-data-no-margin">Project Examples:</h4>
                            <p className="profile-data-no-margin">Link to project examples folder</p>
                        </div>
                    </div>

                </div>
                <div className="profile-info-divider"> </div>
                <div className="profile-supervision">
                    <div className="profile-card-data">
                        <PeopleAltOutlinedIcon/>
                        <div className="profile-card-text">
                            <h4 className="profile-data-no-margin">Student Capacity:</h4>
                            <p className="profile-data-no-margin">X students</p>
                        </div>
                    </div>
                    <div className="profile-card-data">
                        <ForumOutlinedIcon/>
                        <div className="profile-card-text">
                            <h4 className="profile-data-no-margin">Supervision Style:</h4>
                            <p className="profile-data-no-margin">Face-to-face/online</p>
                        </div>
                        <h4 className="profile-card-text"></h4>
                    </div>
                    <div className="profile-card-data">
                        <WorkHistoryOutlinedIcon/>
                        <div className="profile-card-text">
                            <h4 className="profile-data-no-margin">Supervision Experience:</h4>
                            <p className="profile-data-no-margin">X years</p>
                        </div>
                        <h4 className="profile-card-text"></h4>
                    </div>
                </div>
            </div>

        </div>
    )
}

export default SupervisorDetails
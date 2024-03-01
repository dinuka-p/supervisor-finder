import React, { useState, useEffect } from "react"
import { Link, useParams } from "react-router-dom"
import "../App.css"
import MailOutlineRoundedIcon from '@mui/icons-material/MailOutlineRounded';
import SentimentSatisfiedAltRoundedIcon from '@mui/icons-material/SentimentSatisfiedAltRounded';
import WestRoundedIcon from '@mui/icons-material/WestRounded';


function StudentDetails() {
    const { id } = useParams();
    const [studentData, setStudentData] = useState(null)

    useEffect(() => {
        fetch(`/api/student-details/${id}`).then(
        res => res.json()
        ).then(
        data => {
            setStudentData(data.student_info)
            console.log(studentData)
        }
        )
    }, [id])

    if (!studentData) {
        return <div>Loading...</div>
    }

    return (
        <div className="page-content">
            <div className="page-heading-container">
                <h1 className="page-title">Student Details</h1>
                <Link className="back-button" to="/"> 
                    <WestRoundedIcon/>
                    <p className="back-button-text">Back to Students</p>
                </Link>
            </div>

            <div className="profile-card">
                <div className="profile-image-container">
                    <img className="profile-image" src={require("../images/default-profile.jpg")} alt={studentData.name} />
                </div>
                <div className="profile-card-details">
                    <h2 className="profile-card-name">{studentData.name}</h2>
                    <div className="profile-card-data">
                        <MailOutlineRoundedIcon/>
                        <p className="profile-card-text">{studentData.email}</p>
                    </div>
                    <div className="profile-card-data">
                        <SentimentSatisfiedAltRoundedIcon/>
                        <p className="profile-card-text">About me: {studentData.bio}</p>
                    </div>
                </div>
            </div>

            <div className="profile-info">
                <div className="profile-projects">

                </div>
                <div className="profile-info-divider"> </div>
                <div className="profile-supervision">
                    
                </div>
            </div>

        </div>
    )
}

export default StudentDetails
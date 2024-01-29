import React, { useState, useEffect } from "react"
import { useParams } from "react-router-dom"
import "../App.css"

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
        
          <h1 className="page-title">{supervisorData.name}</h1>
            <div className="profile-card">
                <div className="profile-image-container">
                    <img className="profile-image" src="https://isobarscience-1bfd8.kxcdn.com/wp-content/uploads/2020/09/default-profile-picture1.jpg" alt={supervisorData.name} />
                </div>
                <div className="profile-card-details">
                    <h2>{supervisorData.name}</h2>
                    <p>{supervisorData.email}</p>
                    <p>Booking link:</p>
                </div>
            </div>

            <div className="profile-info">
                <p>Projects: {supervisorData.projects}</p>
                <p>Preferred contact: {supervisorData.contact}</p>
            </div>

        </div>
    )
}

export default SupervisorDetails
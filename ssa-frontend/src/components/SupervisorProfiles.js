import React, { useState, useEffect } from "react"
import "../App.css"
import Sidebar from "./Sidebar"

function SupervisorProfiles() {
    const [supervisors, setSupervisors] = useState([{}])

  useEffect(() => {
    fetch("/supervisor-profiles").then(
      res => res.json()
    ).then(
      data => {
        setSupervisors(data.supervisors)
        console.log(data)
      }
    )
  }, [])

    return (
        <div className="page-content">
        
          <h1 className="page-title">Supervisor Profiles</h1>
          <div className="supervisor-boxes">
            {supervisors.map((supervisor) => (
              <div key={supervisor.name} className="supervisor-summary">
                <h4 className="supervisor-name">{supervisor.name}</h4>
                <p className="supervisor-email">{supervisor.email}</p>
                <p className="supervisor-projects">{supervisor.projects}</p>
              </div>
            ))}
          </div>
        </div>
    )
}

export default SupervisorProfiles
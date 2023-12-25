import React, { useState, useEffect } from "react"
import "../App.css"
import SearchBar from "./SearchBar"
import {FaSearch} from "react-icons/fa"

function SupervisorProfiles() {
    const [supervisors, setSupervisors] = useState([{}]);

    const [searchTerm, setSearchTerm] = useState("");

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

          <div className="search-bar-container">
            <div className="search-bar-div">
                <FaSearch id="search-icon" />
                <input  className="search-bar-input" 
                        placeholder="Type to search..."
                        value={searchTerm}
                        onChange={(e) => {setSearchTerm(e.target.value);}}/>
            </div>
          </div>

          <div className="supervisor-boxes">
            {supervisors.filter((supervisor) => {
                if (searchTerm == "") {
                    console.log(supervisor)
                    return supervisor
                } else if (
                    supervisor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    supervisor.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    supervisor.projects.toLowerCase().includes(searchTerm.toLowerCase())
                  ) {
                    return supervisor
                }
            }
            ).map((supervisor) => (
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
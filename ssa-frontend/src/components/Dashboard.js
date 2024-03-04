import React from "react"
import "../App.css"
import { useAuth } from  '../context/AuthProvider'

function Dashboard() {

  const { auth } = useAuth();

    return (
        <div className="page-content">
            <h1 className="page-title">Dashboard</h1>
              {!auth.accessToken && (
                <h2>Please log in to view your dashboard</h2>)}
              {auth.accessToken && (
                <div className="dashboard-container">
                  <div className="dashboard-summary">
                    <div className="dashboard-item">
                      <h3>Next task:</h3>
                      <p className="dashboard-text">Submit your preferences</p>
                    </div>
                    <div className="dashboard-info-divider"> </div>
                    <div className="dashboard-item">
                      <h3>Deadline:</h3>
                      <p className="dashboard-text">28th March</p>
                    </div>
                    <div className="dashboard-info-divider"> </div>
                    <div className="dashboard-item">
                      <h3>Countdown:</h3>
                      <p className="dashboard-text">22 days to go</p>
                    </div>
                  </div>
                  <img className="timeline" src={require("../images/timeline.png")} alt="Supervisor Allocation Timeline" />
                </div>
                )}
        </div>
    )
}

export default Dashboard
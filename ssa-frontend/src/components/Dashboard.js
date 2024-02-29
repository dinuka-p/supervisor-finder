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
                <h2>Welcome {auth.name}</h2>)}
        </div>
    )
}

export default Dashboard
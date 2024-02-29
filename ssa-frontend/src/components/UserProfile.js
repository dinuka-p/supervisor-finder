import React, { useEffect, useState } from "react"
import "../App.css"
import { useAuth } from  '../context/AuthProvider'

function UserProfile() {

  const { auth, setAuth } = useAuth();
  const [profileData, setProfileData] = useState(null);

  useEffect(() => {
    fetch(`/api/user-profile/${auth.email}`, {
      method: "GET",
      headers: {
          "Authorization": "Bearer " + auth.accessToken,
      },
    }).then(
      res => res.json()
      ).then(
      data => {
          setProfileData(({
            profileName: data.name,
            profileEmail: data.email}))
      }
      )
  }, [])

  const handleLogout = () => {
    setAuth({});
  }

    return (
        <div className="page-content">
          <div className="page-heading-container">
                <h1 className="page-title">Your Profile</h1>
                <button onClick={handleLogout} className="logout-button">Log Out</button>
            </div>
          {profileData && (
            <>
              <p>{profileData.profileName}</p>
              <p>{profileData.profileEmail}</p>
            </>
          )}
        </div>
    )
}

export default UserProfile
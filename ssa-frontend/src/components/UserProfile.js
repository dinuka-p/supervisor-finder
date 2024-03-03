import React, { useEffect, useState } from "react"
import "../App.css"
import { useAuth } from  '../context/AuthProvider'

function UserProfile() {

  const { auth, setAuth } = useAuth();
  const [profileData, setProfileData] = useState(null);

  useEffect(() => {
    if (auth.accessToken) {
      console.log(auth);
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
    }
  }, [auth.accessToken])

    return (
      <div className="page-content">
        <div className="page-heading-container">
            <h1 className="page-title">Your Profile</h1>
        </div>
        {!auth.accessToken && (
            <h2>Please log in to view your profile</h2>)}
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
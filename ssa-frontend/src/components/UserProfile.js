import React, { useEffect, useState } from "react"
import "../App.css"

function UserProfile(props) {

  const [profileData, setProfileData] = useState(null);
  const email = localStorage.getItem('email');

  useEffect(() => {
    fetch(`/api/user-profile/${email}`, {
      method: "GET",
      headers: {
          "Authorization": "Bearer " + props.token,
      },
    }).then(
      res => res.json()
      ).then(
      data => {
        data.accessToken && props.setToken(data.accessToken)
        console.log();
          setProfileData(({
            profileName: data.name,
            profileEmail: data.email}))
      }
      )
  }, [])

    return (
        <div>
          <h1 className="page-title">Your Profile</h1>
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
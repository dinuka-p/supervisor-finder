import React, { useEffect, useState } from "react"
import "../App.css"
import { useAuth } from  '../context/AuthProvider'

function UserProfile() {

  const { auth } = useAuth();
  const [profileData, setProfileData] = useState(null);

  const [bio, setBio] = useState("");
  const [location, setLocation] = useState("");
  const [contact, setContact] = useState("");
  const [officeHours, setOfficeHours] = useState("");
  const [booking, setBooking] = useState("");
  const [examples, setExamples] = useState("");
  const [capacity, setCapacity] = useState(0);

  const [allFilters, setAllFilters] = useState([]);
  const [selectedFilters, setSelectedFilters] = useState([]);
  const [submitStatus, setSubmitStatus] = useState("Submit");


  useEffect(() => {
    if (auth.role == "Student") {
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
              profileEmail: data.email}));
            if (auth.role == "Student") {
              setBio(data.bio);
            }
        }
        )
    }

    if (auth.role == "Supervisor") {
      fetch(`/api/supervisor-profile/${auth.email}`, {
        method: "GET",
        headers: {
            "Authorization": "Bearer " + auth.accessToken,
        },
      }).then(
        res => res.json()
        ).then(
        data => {
            setBio(data.bio);
            setLocation(data.location);
            setContact(data.contact);
            setOfficeHours(data.officeHours);
            setBooking(data.booking);
            setExamples(data.examples);
            setCapacity(data.capacity);
            setSelectedFilters(data.selectedFilters);
            console.log(data);

        }
        )

    }
  }, [auth.accessToken])

  useEffect(() => {
    fetch("/api/supervisor-filters").then(
    res => res.json()
    ).then(
    data => {
        setAllFilters(data.allFilters)
    }
    )
  }, [])

  const handleFilterClick = (e, selectedCategory) => {
    e.preventDefault();
    selectedCategory = selectedCategory.trim();
    console.log(allFilters, selectedFilters);
    if (selectedFilters.includes(selectedCategory)) {
      setSelectedFilters(selectedFilters.filter((term) => term !== selectedCategory));
      console.log("Result1:", selectedFilters);
    } else {
      setSelectedFilters([...selectedFilters, selectedCategory]);
      console.log("Result2:", selectedFilters);
    }
  };

  const handleFormUpdate = () => {
    setSubmitStatus("Submit");
  }

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
        const email = auth.email;
        console.log(JSON.stringify({ email, bio, location, contact, officeHours, booking, examples, capacity, selectedFilters }))
        const response = await fetch("/api/edit-profile", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ email, bio, location, contact, officeHours, booking, examples, capacity, selectedFilters }),
            credentials: "include",
        });

        const data = await response.json();
        if (data.response == 200) {
            setSubmitStatus("Submitted!");
        }
        
    } catch (err) {

    }
  }

    return (
      <div className="page-content">
        <div className="page-heading-container">
            <h1 className="page-title">Your Profile</h1>
        </div>
        {!auth.accessToken && (
            <h2>Please log in to view your profile</h2>)}
        {profileData && (
          <>
            <div className="edit-profile-container">
              <h3>Edit Profile:</h3>
              <div className="edit-profile-uneditable">
                <p>Name: {profileData.profileName}</p>
                <p>Email: {profileData.profileEmail}</p>
              </div>

              <form className="edit-profile-form">
                <div className="edit-profile-flex">
                  <label className="edit-profile-label" htmlFor="bio">
                        About me:
                    </label>
                    <textarea
                        className="profile-bio-input" 
                        type="text"
                        id = "bio"
                        autoComplete="off"
                        value={bio}
                        onChange={(e) => {setBio(e.target.value);
                          handleFormUpdate();
                        }}
                    />
                </div>

                {auth.role === "Supervisor" && (
                  <>
                  <div className="edit-profile-flex">
                    <label className="edit-profile-label" htmlFor="location">
                          Location:
                      </label>
                      <input 
                          className="profile-column-input" 
                          type="text"
                          id = "location"
                          autoComplete="off"
                          value={location}
                          onChange={(e) => {setLocation(e.target.value);
                            handleFormUpdate();
                          }}
                      />

                    <label className="edit-profile-label" id="second" htmlFor="contact">
                          Preferred contact:
                      </label>
                      <input 
                          className="profile-column-input" 
                          type="text"
                          id = "contact"
                          autoComplete="off"
                          value={contact}
                          onChange={(e) => {
                            setContact(e.target.value);
                            handleFormUpdate();
                          }}
                      />
                  </div>

                  <div className="edit-profile-flex">
                    <label className="edit-profile-label" htmlFor="office">
                          Office hours:
                      </label>
                      <input 
                          className="profile-column-input" 
                          type="text"
                          id = "office"
                          autoComplete="off"
                          value={officeHours}
                          onChange={(e) => {
                            setOfficeHours(e.target.value);
                            handleFormUpdate();
                          }}
                      />

                    <label className="edit-profile-label" id="second" htmlFor="link">
                          Booking link:
                      </label>
                      <input 
                          className="profile-column-input" 
                          type="text"
                          id = "link"
                          autoComplete="off"
                          value={booking}
                          onChange={(e) => {
                            setBooking(e.target.value);
                            handleFormUpdate();
                          }}
                      />
                  </div>

                  <div className="edit-profile-flex">
                    <label className="edit-profile-label" htmlFor="examples">
                          Project examples:
                      </label>
                      <textarea 
                          className="profile-bio-input" 
                          type="text"
                          id = "examples"
                          autoComplete="off"
                          value={examples}
                          onChange={(e) => {
                            setExamples(e.target.value);
                            handleFormUpdate();
                          }}
                      />
                  </div>

                  <div className="edit-profile-flex-tags">
                    <label className="edit-profile-label" htmlFor="capacity">
                          Capacity:
                      </label>
                      <input 
                          className="profile-capacity-input" 
                          type="number"
                          id = "capacity"
                          min="1"
                          max="100"
                          step="1"
                          autoComplete="off"
                          value={capacity}
                          onChange={(e) => {
                            setCapacity(e.target.value);
                            handleFormUpdate();
                          }}
                      />
                      <label className="edit-profile-label-tags" htmlFor="link">
                          Tags:
                      </label>
                      <div className="edit-profile-tags">
                        {allFilters.map((filterCategory, idx) => (
                          <button
                            key={`filters-${idx}`}
                            className={`tag-button ${selectedFilters?.includes(filterCategory) ? "active" : "" }`}
                            onClick={(e) => {
                              handleFilterClick(e, filterCategory);
                              handleFormUpdate();
                            }}>
                            {filterCategory} 
                          </button>
                        ))}
                      </div>
                  </div>
                  </>
                )}
                <div className="edit-profile-submit">
                  <button className="preferences-submit-button" onClick={handleSubmit}>{submitStatus}</button>
                </div>
              </form>
              
            </div>
            
          </>
        )}
      </div>
    )
}

export default UserProfile
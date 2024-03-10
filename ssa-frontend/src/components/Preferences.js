import React, { useEffect, useState } from "react"
import "../App.css"
import { useAuth } from  '../context/AuthProvider'
import AddRoundedIcon from '@mui/icons-material/AddRounded';
import RemoveRoundedIcon from '@mui/icons-material/RemoveRounded';

function Preferences() {
    
    const { auth } = useAuth();
    const [group, setGroup] = useState("supervisors");
    const [favourites, setFavourites] = useState([]);

    const [preferred, setPreferred] = useState([{}]);
    const [submitStatus, setSubmitStatus] = useState("Submit");

    useEffect(() => {
        const userEmail = auth.email;
        fetch(`/api/get-favourites/${userEmail}`).then(
            res => res.json()
        ).then(
            data => {
                setFavourites(data.favourites);
            }
        )
        if (auth.role == "Supervisor") {
            setGroup("students");
        }
    }, [])

    //load existing preferred list
    useEffect(() => {
        const userEmail = auth.email;
        fetch(`/api/get-preferences/${userEmail}`).then(
            res => res.json()
            ).then(
            data => {
                setPreferred(data.preferences);
                localStorage.setItem("preferred", JSON.stringify(data.preferences));
                console.log("set preferred",data.preferences);
            }
            )
    
    }, [])

    const handlePreference = (preference) => {
        console.log("pref",preferred,"clicked",preference)
        setPreferred((prevPreferred) => {
            const existingPreference = prevPreferred.find(
                (pref) => pref.email === preference.email
            );
    
            if (existingPreference) {
                //if preference is already in the list, remove them
                return prevPreferred.filter(
                    (pref) => pref.email !== preference.email
                );
            } else {
                //otherwise, add them 
                if (prevPreferred.length < 5) {
                    return [...prevPreferred, preference];
                } else {
                    return [...prevPreferred];
                }
            }
        });
        localStorage.setItem("preferred", JSON.stringify(preferred));
        setSubmitStatus("Submit");
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            const userEmail = auth.email;
            const preferredEmails = preferred.map(choice => choice.email);
            const response = await fetch("/api/submit-preferences", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ userEmail, preferred: preferredEmails }),
                credentials: "include",
            });
    
            const data = await response.json();
            console.log(data);
            
            if (data.response == 200) {
                setSubmitStatus("Submitted!");
            }
            
        } catch (err) {
            if (!err?.response) {
            } else {
            }
        }
    };

    return (
        <div className="page-content">
            <h1 className="page-title">Preferences</h1>
            <p className="page-instructions">Mark {group} as a favourite by clicking the 'Favourite' button on their profiles. Favourited {group} will be displayed in the 'Your Favourites' list. 
            When you're ready, add up to 5 {group} to the 'Submit Preferences' list in the order of your preference before submitting!</p>
            <div className="student-card-container">
                <div className="preferences-card">
                    <div className="preferences-info">
                        <h3 className="profile-data-no-margin">Your Favourites:</h3>
                        <ul className="favourites-list">
                            {favourites.map((favourite, index) => (
                                <li className="favourites-list-option" key={index} onClick={() => handlePreference(favourite)}>
                                    {preferred.includes(favourite.email) ? <RemoveRoundedIcon fontSize="small" /> : <AddRoundedIcon fontSize="small" />}
                                    <p className="favourites-list-option-name">{favourite.name}</p>
                                </li>
                            ))}
                        </ul>
                    </div>
                    
                
                    <div className="profile-info-divider"> </div>
                    <div className="preferences-info">
                        <h3 className="profile-data-no-margin">Submit Preferences:</h3>
                        <div className="preference-choices-container">
                            <div className="preference-choices">
                                <div className="preference-numbers">
                                    <h3 className="preference-number-option">1.</h3>
                                    <h3 className="preference-number-option">2.</h3>
                                    <h3 className="preference-number-option">3.</h3>
                                    <h3 className="preference-number-option">4.</h3>
                                    <h3 className="preference-number-option">5.</h3>
                                </div>
                                <ul className="preferred-list">
                                    {preferred.map((choice, index) => (
                                        <li className="preferred-list-option" key={index}>{choice.name}</li>
                                    ))}
                                </ul>
                            </div>
                            <button className="preferences-submit-button" onClick={handleSubmit}>{submitStatus}</button>
                            
                        </div>
                        
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Preferences
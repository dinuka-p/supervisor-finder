import React, { useEffect, useState } from "react"
import "../App.css"
import { useAuth } from  '../context/AuthProvider'
import AddRoundedIcon from '@mui/icons-material/AddRounded';
import RemoveRoundedIcon from '@mui/icons-material/RemoveRounded';

function Preferences() {
    
    const { auth } = useAuth();
    const [favourites, setFavourites] = useState([]);
    const storedPreferred = localStorage.getItem("preferred");
    const initialPreferred = storedPreferred ? JSON.parse(storedPreferred) : [];

    const [preferred, setPreferred] = useState(initialPreferred);

    useEffect(() => {
        const userEmail = auth.email;
        fetch(`/api/get-favourites/${userEmail}`).then(
            res => res.json()
            ).then(
            data => {
                setFavourites(data.favourites);
            }
            )
    
    }, [])

    //load existing preferred list from local storage
    useEffect(() => {
        const storedPreferred = localStorage.getItem("preferred");
        if (storedPreferred) {
            setPreferred(JSON.parse(storedPreferred));
        }
    }, []);

    //save preferred list to local storage on change
    useEffect(() => {
        localStorage.setItem("preferred", JSON.stringify(preferred));
    }, [preferred]);

    const handlePreference = (preference) => {
        console.log(favourites, preferred)
        setPreferred(prevPreferred => {
            if (prevPreferred.includes(preference)) {
                //if preference is already in list, remove them
                return prevPreferred.filter(pref => pref !== preference);
            } else {
                //otherwise, add them
                if (preferred.length < 5) {
                    return [...prevPreferred, preference];
                } else {
                    return [...prevPreferred];
                }
            }
        });
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
            
            if (data.response == 401) {
            }
            else {
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
                        <h3 className="profile-data-no-margin">Preferred Supervisors:</h3>
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
                            <button className="preferences-submit-button" onClick={handleSubmit}>Submit Preferences</button>
                            
                        </div>
                        
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Preferences
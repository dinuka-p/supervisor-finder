import { useRef, useState, useEffect } from "react";
import { NavLink } from "react-router-dom";
import "../App.css"

const Login = () => {

    const userRef = useRef();
    const errorRef = useRef();

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [errorMessage, setErrorMessage] = useState("");
    const [success, setSuccess] = useState(false);

    useEffect(() => {
        userRef.current.focus();
    }, [])

    useEffect(() => {
        setErrorMessage("");
    }, [email, password])

    const handleSubmit = async (e) => {
        e.preventDefault();
        console.log(email, password);
        setSuccess(true);
    }

    return (
        <div className="page-content">
        <>
        <div className="auth-container">
            {success ? (
                <section className="auth-form">
                    <h1>You're logged in!</h1>
                    <p>
                        <a className="auth-form-link" href="/dashboard">Go to dashboard</a>
                    </p>
                </section>
            ) : (
            <section className="signin-form">
                <p ref={errorRef} className={errorMessage ? "errormessage" : "offscreen"}>{errorMessage}</p>
                <h1 style={{marginBottom: '0px'}}>Log In</h1>
                <form onSubmit={handleSubmit}>
                    <div className="auth-label-input">
                        <label className="auth-label" htmlFor="email">
                            Email:
                        </label>
                        <input 
                            className="auth-input" 
                            type="text"
                            id = "email"
                            autoComplete="off"
                            ref={userRef}
                            onChange={(e) => setEmail(e.target.value)}
                            value={email}
                            required
                        />
                    </div>
                    <div className="auth-label-input">
                        <label className="auth-label" htmlFor="password">
                            Password:
                        </label>
                        <input 
                            className="auth-input" 
                            type="password"
                            id = "password"
                            onChange={(e) => setPassword(e.target.value)}
                            value={password}
                            required
                        />
                    </div>
                    <button className="auth-submit" >
                        Sign In
                    </button>
                </form>
                <p style={{marginTop: '0px'}}>
                    Not registered yet?  
                    <NavLink className="auth-form-link" to="/signup" style={{marginLeft: '5px'}}>Sign up here</NavLink>
                </p>
            </section>
            )}
        </div>
        </>
    </div>
    )
}

export default Login
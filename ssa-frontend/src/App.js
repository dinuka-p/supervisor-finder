import React, { useState, useEffect } from 'react'
import './App.css';

function App() {
  const [supervisors, setSupervisors] = useState([{}])

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
    <div className="App">
      <header className="App-header">
        <h1>Supervisor Profiles</h1>
        <ul>
          {supervisors.map((supervisor) => (
            <li key={supervisor.name}>
              {supervisor.name} - {supervisor.email}
            </li>
          ))}
        </ul>
        
      </header>
    </div>
  );
}

export default App;

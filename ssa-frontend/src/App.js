import React, { useState, useEffect } from 'react'
import './App.css';

function App() {
  const [data, setData] = useState([{}])

  useEffect(() => {
    fetch("/supervisor-profiles").then(
      res => res.json()
    ).then(
      data => {
        setData(data)
        console.log(data)
      }
    )
  }, [])

  return (
    <div className="App">
      <header className="App-header">
        <div>
          {(typeof data.supervisors === "undefined") ? (
              <p>loading...</p>
          ) : (
            data.supervisors.map((supervisor, i) => (
              <p key={i}>{supervisor}</p>
            ))
          )}
        </div>
        
      </header>
    </div>
  );
}

export default App;

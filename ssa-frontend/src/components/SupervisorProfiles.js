import React, { useState, useEffect } from "react"
import "../App.css"
import {FaSearch} from "react-icons/fa"
import {motion} from "framer-motion"

function SupervisorProfiles() {
  const [supervisors, setSupervisors] = useState([{}]);

  const [searchTerm, setSearchTerm] = useState("");

  const [allFilters, setAllFilters] = useState([]);
  const [selectedFilters, setSelectedFilters] = useState([]);
  const [filteredSupervisors, setFilteredSupervisors] = useState([{}]);

  useEffect(() => {
      fetch("/supervisor-profiles").then(
      res => res.json()
      ).then(
      data => {
          setSupervisors(data.supervisors)
          setFilteredSupervisors(data.supervisors.sort((a, b) => a.name.localeCompare(b.name)))
      }
      )
  }, [])

  useEffect(() => {
    fetch("/supervisor-filters").then(
    res => res.json()
    ).then(
    data => {
        setAllFilters(data.allFilters)
    }
    )
  }, [])

  useEffect(() => {
    filterSupervisors();
  }, [selectedFilters])

  //filter buttons handling
  const filterSupervisors = () => {
    if (selectedFilters.length > 0) {
      let tempSupervisors = selectedFilters.map((selectedCategory) => {
        let temp = supervisors.filter((supervisor) => supervisor.filter_words.includes(selectedCategory))
        return temp.map((supervisor) => ({ ...supervisor, id: supervisor.id }));
      });
      let flattenedSupervisors = tempSupervisors.flat();
      let uniqueSupervisors = Array.from(new Set(flattenedSupervisors.map((supervisor) => supervisor.id))).map((id) => {
        return flattenedSupervisors.find((supervisor) => supervisor.id === id);
      });
      setFilteredSupervisors(uniqueSupervisors.sort((a, b) => a.name.localeCompare(b.name)))
    } else {
      setFilteredSupervisors([...supervisors])
    }
  }

  const handleFilterClick = (selectedCategory) => {
    if (selectedFilters.includes(selectedCategory)) {
      setSelectedFilters(selectedFilters.filter((term) => term !== selectedCategory));
    } else {
      setSelectedFilters([...selectedFilters, selectedCategory]);
    }
  };

  const handleSupervisorClick = (selectedSupervisor) => {
    
  };

  return (
      <div className="page-content">
      
        <h1 className="page-title">Supervisor Profiles</h1>

        <div className="search-bar-container">
          <div className="search-bar-div">
            <FaSearch id="search-icon" />
            <input  className="search-bar-input" 
                    placeholder="Type to search..."
                    value={searchTerm}
                    onChange={(e) => {setSearchTerm(e.target.value);}}/>
          </div>
        </div>

        <div className="filter-container">
          <p className="filter-by-text">Filter by:</p>
          <div className="filter-buttons-div">
            {allFilters.map((filterCategory, idx) => (
                <button
                  key={`filters-${idx}`}
                  className={`filter-button ${selectedFilters?.includes(filterCategory) ? "active" : "" }`}
                  onClick={() => handleFilterClick(filterCategory)}>
                  {filterCategory} 
                </button>
              ))}
          </div>
        </div>

        <motion.div layout className="supervisor-boxes">
          {filteredSupervisors.filter((supervisor) => {
                //search bar handling
                if (searchTerm == "") {
                    return supervisor
                } else if (
                    supervisor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    supervisor.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    supervisor.projects.toLowerCase().includes(searchTerm.toLowerCase())
                  ) {
                    return supervisor
                }
            }
          ).map((supervisor) => (
            <motion.div layout key={supervisor.id} className="supervisor-summary" onClick={() => handleSupervisorClick(supervisor)}>
              <h4 className="supervisor-name">{supervisor.name}</h4>
              <p className="supervisor-email">{supervisor.email}</p>
              <p className="supervisor-projects">{supervisor.projects}</p>
            </motion.div>
          ))}
        </motion.div>
      </div>
  )
}

export default SupervisorProfiles
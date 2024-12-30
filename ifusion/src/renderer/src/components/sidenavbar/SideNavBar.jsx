import React, { useState } from 'react'
import { FaSun, FaCog, FaUserCircle } from 'react-icons/fa'
import { MdOutlineSearch } from 'react-icons/md'
import betaLight from '../../assets/beta-light.png' // Adjust to your logo path
import betaDark from '../../assets/beta-dark.png' // Adjust to your logo path
import '../styles/SideNavBar.css'

function SideNavBar({ isDarkMode, toggleTheme, plugins }) {
  const [searchTerm, setSearchTerm] = useState('')

  const filteredPlugins = plugins.filter((plugin) =>
    plugin.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className={`sidenav ${isDarkMode ? 'dark' : 'light'}`}>
      {/* Logo */}
      <div className="sidenav-logo">
        <img
          src={isDarkMode ? betaDark : betaLight}
          alt="iFusion Logo"
          className="sidenav-logo-image"
        />
        <h2 className="sidenav-title">iFusion</h2>
      </div>

      {/* Search Bar */}
      <div className="sidenav-search">
        <MdOutlineSearch className="search-icon" />
        <input
          type="text"
          className="search-input"
          placeholder="Search Plugins..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* Plugins List */}
      <div className="sidenav-plugins">
        {filteredPlugins.length > 0 ? (
          filteredPlugins.map((plugin, index) => (
            <div key={index} className="plugin-item">
              {plugin}
            </div>
          ))
        ) : (
          <div className="no-plugins">No plugins found</div>
        )}
      </div>

      {/* Bottom Icons */}
      <div className="sidenav-bottom">
        <FaUserCircle className="bottom-icon" title="Profile" />
        <FaCog className="bottom-icon" title="Settings" />
        <FaSun className="bottom-icon" title="Toggle Theme" onClick={toggleTheme} />
      </div>
    </div>
  )
}

export default SideNavBar

'use client'

import React, { useState } from 'react';
import Link from 'next/link';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faArrowLeft, 
  faQuestionCircle, 
  faUsers, 
  faUserShield,
  faClock,
  faBars,
  faTimes
} from '@fortawesome/free-solid-svg-icons';

export const NavigationSidebar = ({ activeSection, onSectionChange, courseInfo }) => {
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  
  const sections = [
    { id: 'timeline', label: 'Timeline Overview', icon: faClock },
    { id: 'questions', label: 'Survey Questions', icon: faQuestionCircle },
    { id: 'roster', label: 'Manage Roster', icon: faUsers },
    { id: 'admins', label: 'Course Admins', icon: faUserShield },
  ];

  const handleSectionClick = (sectionId) => {
    onSectionChange(sectionId);
    setIsMobileOpen(false);
  };

  return (
    <>
      {/* Mobile Menu Toggle */}
      <button 
        className="mobile-menu-toggle"
        onClick={() => setIsMobileOpen(!isMobileOpen)}
      >
        <FontAwesomeIcon icon={isMobileOpen ? faTimes : faBars} />
      </button>

      {/* Sidebar */}
      <nav className={`nav-sidebar ${isMobileOpen ? 'open' : ''}`}>
        <div className="nav-sidebar-header">
          <h3 className="nav-sidebar-title">Course Settings</h3>
          <p className="nav-sidebar-subtitle">{courseInfo?.className}</p>
        </div>
        
        <Link 
          href="/dashboard" 
          className="nav-sidebar-item nav-back-button"
        >
          <FontAwesomeIcon icon={faArrowLeft} />
          Back to Dashboard
        </Link>
        
        <div className="nav-sidebar-divider"></div>
        
        {sections.map(section => (
          <button
            key={section.id}
            className={`nav-sidebar-item ${activeSection === section.id ? 'active' : ''}`}
            onClick={() => handleSectionClick(section.id)}
          >
            <FontAwesomeIcon icon={section.icon} className="nav-icon" />
            {section.label}
          </button>
        ))}
      </nav>

      {/* Mobile Overlay */}
      {isMobileOpen && (
        <div 
          className="nav-overlay"
          onClick={() => setIsMobileOpen(false)}
        />
      )}
    </>
  );
};
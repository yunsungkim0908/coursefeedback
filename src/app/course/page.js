'use client';

// Import CSS first to prevent FOUC
import "../globals.css"
import "../main.css"

import Link from 'next/link'
import { useSearchParams, useRouter } from 'next/navigation'
import React, { useState, useEffect } from 'react';
import 'firebase/compat/auth';
import Swal from "sweetalert2"
import { doc, getDoc } from "firebase/firestore";
import { AddQuestions } from './addQuestions.js'
import { ManageAdmins } from "./admins.js"
import { ManageRoster } from './uploadRoster.js'
import { db, auth } from '../../components/firebase'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { 
  faClock, 
  faCalendar, 
  faEnvelope, 
  faFileAlt, 
  faArrowLeft,
  faQuestionCircle,
  faUsers,
  faUserShield,
  faBars,
  faTimes
} from '@fortawesome/free-solid-svg-icons'
import NavBar from '../../components/NavBar'

const TimelineSection = () => (
  <div className="settings-section-clean">
    <div className="section-content">
      <div className="section-header-clean">
        <h2>
          <FontAwesomeIcon icon={faClock} className="section-icon" />
          Weekly Timeline
        </h2>
        <p className="section-description">
          Here's what a typical week of surveys looks like for your course. 
          All times are shown in Pacific Time (PT).
        </p>
      </div>
      
      <div className="timeline-clean">
        <div className="timeline-event">
          <div className="timeline-badge monday">
            <FontAwesomeIcon icon={faFileAlt} />
          </div>
          <div className="timeline-panel">
            <div className="timeline-heading">
              <h4>Monday at Noon</h4>
              <span className="timeline-date">Survey Opens</span>
            </div>
            <p>Students receive notification to provide feedback on their weekly experience</p>
          </div>
        </div>
        
        <div className="timeline-event">
          <div className="timeline-badge thursday">
            <FontAwesomeIcon icon={faEnvelope} />
          </div>
          <div className="timeline-panel">
            <div className="timeline-heading">
              <h4>Thursday at Noon</h4>
              <span className="timeline-date">Reminder Sent</span>
            </div>
            <p>Gentle reminder email sent to students who haven't completed the survey</p>
          </div>
        </div>
        
        <div className="timeline-event">
          <div className="timeline-badge sunday">
            <FontAwesomeIcon icon={faCalendar} />
          </div>
          <div className="timeline-panel">
            <div className="timeline-heading">
              <h4>Sunday at 4pm</h4>
              <span className="timeline-date">Survey Closes</span>
            </div>
            <p>You receive a comprehensive weekly digest with all feedback and insights</p>
          </div>
        </div>
      </div>
    </div>
  </div>
);

export default function Page () {
  const [signedIn, setSignedIn] = useState(false);
  const [activeSection, setActiveSection] = useState('timeline');
  const [courseData, setCourseData] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const search = useSearchParams();
  const className = search.get("callNumber");
  const instructorHash = search.get("classHash");
  
  const router = useRouter();


  useEffect(() => {
    const unregisterAuthObserver = auth.onAuthStateChanged(user => {
      setSignedIn(!!user);
      if (!user){
        router.push('/login')
      }
    });
    return () => unregisterAuthObserver();
  }, []);

  useEffect(() => {
    if (instructorHash) {
      loadCourseData();
    }
  }, [instructorHash]);

  const loadCourseData = async () => {
    try {
      const courseRef = doc(db, 'courses', instructorHash);
      const courseSnap = await getDoc(courseRef);
      if (courseSnap.exists()) {
        setCourseData(courseSnap.data());
      }
    } catch (error) {
      console.error("Error loading course data:", error);
    }
  };

  const renderSection = () => {
    switch (activeSection) {
      case 'timeline':
        return <TimelineSection />;
      case 'questions':
        return (
          <div className="settings-section">
            <AddQuestions classCode={className} classHash={instructorHash} db={db} />
          </div>
        );
      case 'roster':
        return (
          <div className="settings-section">
            <ManageRoster classHash={instructorHash} db={db} />
          </div>
        );
      case 'admins':
        return (
          <div className="settings-section">
            <ManageAdmins classHash={instructorHash} db={db} userEmail={auth.currentUser?.email} />
          </div>
        );
      default:
        return <TimelineSection />;
    }
  };

  const sections = [
    { id: 'timeline', label: 'Timeline Overview', icon: faClock },
    { id: 'questions', label: 'Survey Questions', icon: faQuestionCircle },
    { id: 'roster', label: 'Manage Roster', icon: faUsers },
    { id: 'admins', label: 'Course Admins', icon: faUserShield },
  ];

  // Create breadcrumbs for course settings
  const breadcrumbs = [
    {
      label: courseData?.courseName || className?.toUpperCase() || 'Course Settings',
      href: null // Current page, so no href
    }
  ];

  return (
    <div className="page-wrapper">
      <NavBar breadcrumbs={breadcrumbs} />
      <div className="settings-page">
        {/* Mobile Menu Button */}
        <button 
          className="mobile-menu-btn"
          onClick={() => setSidebarOpen(!sidebarOpen)}
        >
          <FontAwesomeIcon icon={sidebarOpen ? faTimes : faBars} />
        </button>

      {/* Sidebar */}
      <div className={`settings-sidebar ${sidebarOpen ? 'open' : ''}`}>
        <div className="sidebar-header">
          <h3>Course Settings</h3>
          <p className="text-muted text-sm">{className?.toUpperCase()}</p>
        </div>
        
        <Link 
          href="/dashboard" 
          className="sidebar-back-link"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem',
            padding: '1rem 1.5rem',
            color: '#3b82f6',
            textDecoration: 'none',
            fontWeight: '500',
            transition: 'background 0.2s ease'
          }}
        >
          <FontAwesomeIcon icon={faArrowLeft} />
          <span>Back to Dashboard</span>
        </Link>
        
        <div className="sidebar-divider"></div>
        
        <div className="sidebar-nav">
          {sections.map(section => (
            <button
              key={section.id}
              className={`sidebar-nav-item ${activeSection === section.id ? 'active' : ''}`}
              onClick={() => {
                setActiveSection(section.id);
                setSidebarOpen(false);
              }}
            >
              <FontAwesomeIcon icon={section.icon} className="nav-icon" />
              <span>{section.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div 
          className="mobile-overlay"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main Content */}
      <div className="settings-content">
        <div className="container">
          <div className="content-wrapper">
            {/* Page Header */}
            <div className="page-header-clean">
              <h1>{courseData?.courseName || 'Course Settings'}</h1>
              <p className="page-subtitle">{className?.toUpperCase()}</p>
            </div>

            {/* Dynamic Content */}
            {renderSection()}
          </div>
        </div>
      </div>
      </div>
    </div>
  );
}
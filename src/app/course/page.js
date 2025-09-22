'use client';

import Link from 'next/link'
import { useSearchParams, useRouter } from 'next/navigation'
import React, { useState, useEffect } from 'react';
import 'firebase/compat/auth';
import "bootstrap/dist/css/bootstrap.min.css";
import Swal from "sweetalert2"
import { doc, getDoc } from "firebase/firestore";
import { AddQuestions } from './addQuestions.js'
import { ManageAdmins } from "./admins.js"
import { ManageRoster } from './uploadRoster.js'
import { db, auth } from '../../components/firebase'
import "../main.css"
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

const TimelineSection = () => (
  <div className="card settings-section">
    <h2 className="mb-3">
      <FontAwesomeIcon icon={faClock} className="text-primary mr-2" />
      Weekly Timeline
    </h2>
    <p className="text-muted mb-4">
      Here's what a typical week of surveys looks like for your course. 
      All times are shown in Pacific Time (PT).
    </p>
    
    <div className="timeline-container">
      <div className="timeline-item">
        <div className="timeline-icon">
          <FontAwesomeIcon icon={faFileAlt} />
        </div>
        <div className="timeline-content">
          <h5>Monday at Noon</h5>
          <p className="text-muted">Survey opens - Students receive notification to provide feedback</p>
        </div>
      </div>
      
      <div className="timeline-item">
        <div className="timeline-icon">
          <FontAwesomeIcon icon={faEnvelope} />
        </div>
        <div className="timeline-content">
          <h5>Thursday at Noon</h5>
          <p className="text-muted">Reminder email sent to students who haven't completed the survey</p>
        </div>
      </div>
      
      <div className="timeline-item">
        <div className="timeline-icon">
          <FontAwesomeIcon icon={faCalendar} />
        </div>
        <div className="timeline-content">
          <h5>Sunday at 4pm</h5>
          <p className="text-muted">Survey closes - You receive a weekly digest with all feedback</p>
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

  return (
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
        
        <Link href="/dashboard" className="sidebar-back-link">
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
            <div className="card mb-4">
              <h1>{courseData?.courseName || 'Course Settings'}</h1>
              <p className="text-muted mb-0">{className?.toUpperCase()}</p>
            </div>

            {/* Dynamic Content */}
            {signedIn && renderSection()}
          </div>
        </div>
      </div>

      <style jsx>{`
        .settings-page {
          display: flex;
          min-height: 100vh;
          position: relative;
        }

        .mobile-menu-btn {
          display: none;
          position: fixed;
          top: 1rem;
          left: 1rem;
          z-index: 1001;
          background: var(--card);
          border: 1px solid var(--border);
          border-radius: 0.5rem;
          padding: 0.75rem;
          width: 48px;
          height: 48px;
          font-size: 1.25rem;
          color: var(--foreground);
          cursor: pointer;
          box-shadow: var(--shadow-md);
        }

        .settings-sidebar {
          width: 280px;
          background: var(--card);
          border-right: 1px solid var(--border);
          height: 100vh;
          position: sticky;
          top: 0;
          overflow-y: auto;
          flex-shrink: 0;
        }

        .sidebar-header {
          padding: 2rem 1.5rem 1rem;
          border-bottom: 1px solid var(--border);
        }

        .sidebar-header h3 {
          font-size: 1.25rem;
          margin-bottom: 0.25rem;
        }

        .sidebar-back-link {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          padding: 1rem 1.5rem;
          color: var(--primary);
          text-decoration: none;
          font-weight: 500;
          transition: background 0.2s ease;
        }

        .sidebar-back-link:hover {
          background: rgba(59, 130, 246, 0.05);
        }

        .sidebar-divider {
          height: 1px;
          background: var(--border);
          margin: 0;
        }

        .sidebar-nav {
          padding: 1rem 0;
        }

        .sidebar-nav-item {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          width: 100%;
          padding: 0.75rem 1.5rem;
          border: none;
          background: none;
          color: var(--muted);
          font-size: 0.875rem;
          font-weight: 500;
          text-align: left;
          cursor: pointer;
          transition: all 0.2s ease;
          border-left: 3px solid transparent;
        }

        .sidebar-nav-item:hover {
          color: var(--foreground);
          background: rgba(0, 0, 0, 0.02);
        }

        .sidebar-nav-item.active {
          color: var(--primary);
          background: rgba(59, 130, 246, 0.08);
          border-left-color: var(--primary);
        }

        .nav-icon {
          width: 20px;
          flex-shrink: 0;
        }

        .settings-content {
          flex: 1;
          background: var(--background);
          overflow-y: auto;
        }

        .mobile-overlay {
          display: none;
          position: fixed;
          inset: 0;
          background: rgba(0, 0, 0, 0.5);
          z-index: 999;
        }

        @media (max-width: 768px) {
          .mobile-menu-btn {
            display: flex;
            align-items: center;
            justify-content: center;
          }

          .settings-sidebar {
            position: fixed;
            left: 0;
            top: 0;
            z-index: 1000;
            transform: translateX(-100%);
            transition: transform 0.3s ease;
          }

          .settings-sidebar.open {
            transform: translateX(0);
          }

          .mobile-overlay {
            display: block;
          }

          .settings-content {
            margin-left: 0;
          }
        }

        .timeline-container {
          position: relative;
          padding-left: 2rem;
        }
        
        .timeline-container::before {
          content: '';
          position: absolute;
          left: 0;
          top: 0;
          bottom: 0;
          width: 2px;
          background: var(--border);
        }
        
        .timeline-item {
          position: relative;
          padding-bottom: 2rem;
          padding-left: 2rem;
        }
        
        .timeline-item:last-child {
          padding-bottom: 0;
        }
        
        .timeline-icon {
          position: absolute;
          left: -2rem;
          top: 0;
          width: 2rem;
          height: 2rem;
          background: var(--primary);
          color: white;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 0.875rem;
        }
        
        .timeline-content h5 {
          margin-bottom: 0.5rem;
          color: var(--foreground);
        }
        
        .timeline-content p {
          margin: 0;
        }
        
        .mr-2 {
          margin-right: 0.5rem;
        }

        .text-sm {
          font-size: 0.875rem;
        }
      `}</style>
    </div>
  );
}
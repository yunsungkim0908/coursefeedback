'use client'

import { useRouter } from 'next/navigation'
import React, { useEffect, useState } from 'react';
import 'firebase/compat/auth';
import "../main.css"
import { CourseCard, CourseCardSkeleton } from "./courseCard.js"
import { AddCourse } from "./addCourse.js"
import { db, auth } from '../../components/firebase'
import { collection, query, getDocs, where, doc, getDoc } from "firebase/firestore";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { 
  faPlus, 
  faChartLine, 
  faUsers, 
  faClock,
  faGraduationCap
} from '@fortawesome/free-solid-svg-icons'
import NavBar from '../../components/NavBar'

const QuickStats = ({ userCourses, coursesLoading }) => {
  const totalCourses = userCourses.length;
  const activeCourses = userCourses.filter(course => course.approvalStatus).length;
  
  if (coursesLoading) {
    return (
      <div className="inline-stats">
        <div className="inline-stat">
          <span className="stat-label">Total:</span>
          <span className="stat-value">...</span>
        </div>
        <div className="inline-stat">
          <span className="stat-label">Active:</span>
          <span className="stat-value">...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="inline-stats">
      <div className="inline-stat">
        <FontAwesomeIcon icon={faGraduationCap} className="stat-icon" />
        <span className="stat-label">Total:</span>
        <span className="stat-value">{totalCourses}</span>
      </div>
      <div className="inline-stat">
        <FontAwesomeIcon icon={faChartLine} className="stat-icon" />
        <span className="stat-label">Active:</span>
        <span className="stat-value">{activeCourses}</span>
      </div>
    </div>
  );
};


const EmptyState = () => (
  <div className="empty-state">
    <div className="empty-icon">
      <FontAwesomeIcon icon={faGraduationCap} />
    </div>
    <h3>No courses yet</h3>
    <p>Create your first course survey to start collecting valuable feedback from your students.</p>
    <div className="empty-features">
      <div className="empty-feature">
        <FontAwesomeIcon icon={faClock} />
        <span>Weekly insights</span>
      </div>
      <div className="empty-feature">
        <FontAwesomeIcon icon={faUsers} />
        <span>Anonymous feedback</span>
      </div>
      <div className="empty-feature">
        <FontAwesomeIcon icon={faChartLine} />
        <span>Mood tracking</span>
      </div>
    </div>
  </div>
);

export default function Page() {
  const [signedIn, setSignedIn] = useState(false);
  const [userCourses, setUserCourses] = useState([]);
  const [courseIds, setCourseIds] = useState([]);
  const [coursesLoading, setCoursesLoading] = useState(true);
  const [showAddCourse, setShowAddCourse] = useState(false);

  const router = useRouter();

  useEffect(() => {
    const unregisterAuthObserver = auth.onAuthStateChanged(
      user => {
        setSignedIn(!!user);
        if (!user){
          router.push('/')
        } else {
          loadCourses(user);
        }
      })
    return unregisterAuthObserver;
  }, []);

  const loadCourses = async (user) => {
    setCoursesLoading(true);
    try {
      const coursesRef = collection(db, "courses");
      const q = query(coursesRef, where("admins", "array-contains", user.email));
      const qSnap = await getDocs(q);
      
      // Get courses and check approval status for each
      const coursesWithApproval = await Promise.all(
        qSnap.docs.map(async (snap) => {
          const data = snap.data();
          
          // Check if course exists in approvedCourses collection
          const approvedDoc = doc(db, 'approvedCourses', data.hash);
          const approvalSnap = await getDoc(approvedDoc);
          
          return {
            ...data,
            approvalStatus: approvalSnap.exists()
          };
        })
      );
      
      setUserCourses(coursesWithApproval);
      setCourseIds(coursesWithApproval.map(c => c.hash));
    } catch (error) {
      console.error("Error loading courses:", error);
    } finally {
      setCoursesLoading(false);
    }
  };

  const handleDeleteCourse = (courseId) => {
    setUserCourses(prev => prev.filter(course => course.hash !== courseId));
    setCourseIds(prev => prev.filter(id => id !== courseId));
  };

  if (signedIn){
    return (
      <div className="dashboard-page">
        <NavBar />

        <div className="dashboard-container">
          {/* Welcome Section */}
          <div className="welcome-section">
            <div className="welcome-content">
              <h1>Welcome back, {auth.currentUser?.displayName?.split(' ')[0] || 'User'}!</h1>
            </div>
          </div>


          {/* Main Content */}
          <div className="courses-section">
            {/* Getting Started Section */}
            <div className="getting-started-section">
              <div className="form-instructions">
                <h4>Creating a New Survey</h4>
                <div className="instruction-steps">
                  <div className="instruction-step">
                    <span className="step-number">1</span>
                    <div className="step-content">
                      <p><strong>Fill out the course form</strong> by clicking "Add New Course" below</p>
                    </div>
                  </div>
                  <div className="instruction-step">
                    <span className="step-number">2</span>
                    <div className="step-content">
                      <p><strong>Send us these items</strong> to <a href="mailto:hrcf@cs.stanford.edu">hrcf@cs.stanford.edu</a>:</p>
                      <ul>
                        <li>Your school profile page (to verify your email and affiliation)</li>
                        <li>The unique course ID generated after form submission</li>
                      </ul>
                    </div>
                  </div>
                  <div className="instruction-step">
                    <span className="step-number">3</span>
                    <div className="step-content">
                      <p><strong>We'll review and approve</strong> your course survey!</p>
                      <p className="text-muted">While we review, you can set up your course roster, custom questions, and admin list.</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="section-header">
              <div className="header-title-row">
                <div className="header-left">
                  <h2>Your Courses</h2>
                  <button 
                    onClick={() => setShowAddCourse(!showAddCourse)}
                    className="btn-primary"
                  >
                    <FontAwesomeIcon icon={faPlus} />
                    Add New Course
                  </button>
                </div>
                <QuickStats userCourses={userCourses} coursesLoading={coursesLoading} />
              </div>
            </div>

            {/* Add Course Form */}
            {showAddCourse && (
              <div className="add-course-modal">
                <div className="add-course-header">
                  <h3>Create New Course Survey</h3>
                  <button 
                    onClick={() => setShowAddCourse(false)}
                    className="close-btn"
                    aria-label="Close"
                  >
                    ×
                  </button>
                </div>
                <div className="add-course-content">
                  <AddCourse 
                    db={db} 
                    coursesState={[userCourses, setUserCourses]}
                    courseIdState={[courseIds, setCourseIds]}
                    user={auth.currentUser}
                    onSuccess={() => setShowAddCourse(false)}
                  />
                </div>
              </div>
            )}

            {/* Courses Grid */}
            {coursesLoading ? (
              <div className="course-grid">
                <CourseCardSkeleton />
                <CourseCardSkeleton />
                <CourseCardSkeleton />
              </div>
            ) : userCourses.length === 0 ? (
              <EmptyState />
            ) : (
              <div className="course-grid">
                {userCourses.map((course) => (
                  <CourseCard 
                    key={course.hash} 
                    course={course} 
                    user={auth.currentUser}
                    db={db}
                    onDelete={handleDeleteCourse}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    )
  } else {
    return <></>;
  }
}
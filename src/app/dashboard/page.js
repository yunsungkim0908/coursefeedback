'use client'

import { useRouter } from 'next/navigation'
import React, { useEffect, useState } from 'react';
import 'firebase/compat/auth';
import "../main.css"
import { CourseCard, CourseCardSkeleton } from "./courseCard.js"
import { AddCourse } from "./addCourse.js"
import { db, auth } from '../../components/firebase'
import { collection, query, getDocs, where } from "firebase/firestore";
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
          router.push('/login')
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
      const courses = qSnap.docs.map((snap) => {
        const data = snap.data();
        return {
          ...data,
          approvalStatus: true
        };
      });
      setUserCourses(courses);
      setCourseIds(courses.map(c => c.hash));
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
              <p>Monitor your course feedback and track student engagement with real-time insights.</p>
            </div>
          </div>


          {/* Main Content */}
          <div className="courses-section">
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
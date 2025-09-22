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
import { faSignOutAlt, faPlus } from '@fortawesome/free-solid-svg-icons'

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
          approvalStatus: true // This should be fetched from approvedCourses collection
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
      <div className="page-wrapper">
        <div className="container">
          <div className="content-wrapper">
            {/* Header Section */}
            <div className="card mb-4">
              <div className="flex justify-between items-center">
                <div>
                  <h1>High-Resolution Course Feedback</h1>
                  <p className="text-muted mb-0">
                    Welcome back, {auth.currentUser?.displayName || 'User'}!
                  </p>
                  <p className="text-muted text-sm">
                    {auth.currentUser?.email}
                  </p>
                </div>
                <button 
                  onClick={() => auth.signOut()}
                  className="btn btn-secondary"
                >
                  <FontAwesomeIcon icon={faSignOutAlt} />
                  Sign Out
                </button>
              </div>
            </div>

            {/* Add Course Section */}
            <div className="mb-4">
              <button 
                onClick={() => setShowAddCourse(!showAddCourse)}
                className="btn btn-primary"
              >
                <FontAwesomeIcon icon={faPlus} />
                Add New Course
              </button>
              
              {showAddCourse && (
                <div className="mt-3">
                  <AddCourse 
                    db={db} 
                    coursesState={[userCourses, setUserCourses]}
                    courseIdState={[courseIds, setCourseIds]}
                    user={auth.currentUser}
                    onSuccess={() => setShowAddCourse(false)}
                  />
                </div>
              )}
            </div>

            {/* Courses Section */}
            <div className="card">
              <h2 className="mb-3">Your Courses</h2>
              <p className="text-muted mb-4">
                Click on any course card to access the settings page where you can manage rosters, 
                survey questions, and course administrators.
              </p>

              {coursesLoading ? (
                <div className="course-grid">
                  <CourseCardSkeleton />
                  <CourseCardSkeleton />
                  <CourseCardSkeleton />
                </div>
              ) : userCourses.length === 0 ? (
                <div className="text-center py-5">
                  <p className="text-muted">No courses found. Add your first course to get started!</p>
                </div>
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
      </div>
    )
  } else {
    return <></>;
  }
}
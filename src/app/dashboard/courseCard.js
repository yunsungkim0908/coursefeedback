import Link from 'next/link'
import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faClock, faCalendar, faChartLine, faArrowRight, faTrashAlt, faPencilAlt } from '@fortawesome/free-solid-svg-icons'
import { writeBatch, doc } from "firebase/firestore";
import Swal from "sweetalert2";

export const CourseCard = ({ course, user, db, onDelete }) => {
  const { hash, courseName, callNumber, firstWeek, lastWeek, completed, numWeeks, approvalStatus } = course;
  
  const truncateString = (str, num) => {
    if (str.length <= num) return str;
    return str.slice(0, num) + '...';
  };

  const progress = completed && numWeeks ? (completed / numWeeks) * 100 : 0;

  const SuccessMessage = (succMsg) => {
    Swal.fire({
      icon: "success",
      title: succMsg
    })
  }

  const deleteCourse = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    const batch = writeBatch(db);
    const courseId = course.hash;

    const courseRef = doc(db, "courses", courseId);
    const rosterRef = doc(db, "rosters", courseId);
    const questionRef = doc(db, "questions", courseId);

    const write = async () => {
      batch.delete(rosterRef);
      batch.delete(questionRef);
      batch.delete(courseRef);
      return batch.commit();
    }

    Swal.fire({
      title: (
        '<span style="color: red"><u>Warning</u>: </span>You are about to <u>permanently delete</u> a course. '+
        "This action cannot be undone. Are you sure?"), 
      showCancelButton: true,
      confirmButtonText: "Yes, delete permanently",
      cancelButtonText: "No, cancel"
    }).then((result) => {
      if (result.isConfirmed) {
        write()
          .then(() => {
            onDelete(courseId);
            SuccessMessage("Course deleted successfully!");
          })
          .catch((error) => {console.log(error)})
      } else {
        Swal.fire("Changes are not saved")
      }
    })
  }

  return (
    <div className="course-card-wrapper">
      <Link href={{
        pathname: "course",
        query: {
          callNumber: callNumber,
          classHash: hash
        }
      }} style={{textDecoration: 'none'}}>
        <div className="course-card">
        <div className="course-card-title">
          {courseName}
        </div>
        <div className="course-card-subtitle">
          {truncateString(callNumber, 50)}
        </div>
        
        <div className="flex flex-col gap-2 mb-3">
          <div className="flex items-center gap-2 text-muted">
            <FontAwesomeIcon icon={faCalendar} size="sm" />
            <span className="text-sm">{firstWeek} - {lastWeek}</span>
          </div>
          
          {approvalStatus && (
            <div className="flex items-center gap-2">
              <FontAwesomeIcon icon={faChartLine} size="sm" className="text-muted" />
              <div className="flex-1">
                <div className="progress-bar">
                  <div 
                    className="progress-bar-fill" 
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </div>
              <span className="text-sm text-muted">{completed}/{numWeeks}</span>
            </div>
          )}
        </div>
        
        <div className="course-card-meta">
          <span className={`status-badge ${approvalStatus ? 'approved' : 'pending'}`}>
            <FontAwesomeIcon icon={faClock} size="sm" />
            {approvalStatus ? 'Approved' : 'Pending'}
          </span>
          
          <span className="text-primary flex items-center gap-1">
            Settings
            <FontAwesomeIcon icon={faArrowRight} size="sm" />
          </span>
        </div>
        </div>
      </Link>
      
      {/* Delete button outside the link */}
      {user && user.uid === course.createdBy && (
        <button 
          onClick={deleteCourse}
          className="course-card-delete-btn"
          title="Delete course"
        >
          <FontAwesomeIcon icon={faTrashAlt} size="sm" />
        </button>
      )}
    </div>
  );
};

export const CourseCardSkeleton = () => (
  <div className="course-card">
    <div className="skeleton skeleton-title mb-2"></div>
    <div className="skeleton skeleton-subtitle mb-3"></div>
    <div className="skeleton skeleton-text mb-2"></div>
    <div className="skeleton skeleton-text mb-3"></div>
    <div className="flex justify-between">
      <div className="skeleton skeleton-badge"></div>
      <div className="skeleton skeleton-badge"></div>
    </div>
  </div>
);
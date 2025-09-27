import Link from 'next/link'
import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faClock, faCalendar, faChartLine, faArrowRight, faTrashAlt, faCopy } from '@fortawesome/free-solid-svg-icons'
import { writeBatch, doc } from "firebase/firestore";
import Swal from "sweetalert2";

export const CourseCard = ({ course, user, db, onDelete }) => {
  const { hash, courseName, callNumber, firstWeek, lastWeek, completed, numWeeks, approvalStatus } = course;
  
  const truncateString = (str, num) => {
    if (str.length <= num) return str;
    return str.slice(0, num) + '...';
  };

  const progress = completed && numWeeks ? (completed / numWeeks) * 100 : 0;
  
  // Convert Firestore Timestamps or Date objects to readable dates
  const formatDate = (dateValue) => {
    if (!dateValue) return '';
    
    // If it's already a formatted string (mm/dd/yyyy), return as is
    if (typeof dateValue === 'string' && dateValue.match(/^\d{1,2}\/\d{1,2}\/\d{4}$/)) {
      return dateValue;
    }
    
    // Firestore Timestamp object
    if (dateValue.toDate) {
      return dateValue.toDate().toLocaleDateString('en-US');
    }
    
    // JavaScript Date object
    if (dateValue instanceof Date) {
      return dateValue.toLocaleDateString('en-US');
    }
    
    // Fallback: convert to string
    return dateValue.toString();
  };

  const copyCourseId = (e) => {
    e.preventDefault();
    e.stopPropagation();
    navigator.clipboard.writeText(hash);
    Swal.fire({
      icon: "success",
      title: "Copied!",
      text: `Course ID: ${hash}`,
      timer: 1500,
      showConfirmButton: false,
      position: "top-end",
      toast: true
    });
  };

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
      title: 'Delete Course?',
      html: `
        <div style="text-align: center;">
          <p style="margin-bottom: 16px;"><strong style="color: #ef4444;">⚠️ Course data will be permanently deleted</strong></p>
          <p style="margin-bottom: 12px;">You are about to permanently delete:</p>
          <div style="background: #f3f4f6; padding: 12px; border-radius: 8px; margin-bottom: 16px;">
            <p style="margin: 0; font-weight: 600; color: #1f2937;">${courseName}</p>
            <p style="margin: 4px 0 0; color: #6b7280; font-size: 14px;">${callNumber}</p>
          </div>
        </div>
      `,
      icon: 'warning',
      iconColor: '#ef4444',
      showCancelButton: true,
      confirmButtonText: 'Delete Course',
      cancelButtonText: 'Cancel',
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#6b7280',
      reverseButtons: true,
      focusCancel: true,
      customClass: {
        popup: 'swal-wide'
      }
    }).then((result) => {
      if (result.isConfirmed) {
        write()
          .then(() => {
            onDelete(courseId);
            Swal.fire({
              icon: "success",
              title: "Course deleted successfully!",
              confirmButtonColor: "#3b82f6"
            });
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
            <span className="text-sm">{formatDate(firstWeek)} - {formatDate(lastWeek)}</span>
          </div>
          
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <FontAwesomeIcon icon={faChartLine} size="sm" className="text-muted" />
              {approvalStatus ? (
                <>
                  <div className="flex-1">
                    <div className="progress-bar">
                      <div 
                        className="progress-bar-fill" 
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                  </div>
                  <span className="text-sm text-muted">{completed}/{numWeeks}</span>
                </>
              ) : (
                <span className="text-sm text-muted">--</span>
              )}
            </div>
            
            <div className="course-card-id" onClick={copyCourseId}>
              <FontAwesomeIcon icon={faCopy} size="sm" />
              <span>ID: {hash}</span>
            </div>
          </div>
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
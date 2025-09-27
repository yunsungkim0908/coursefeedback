'use client';

import React, { useEffect, useState } from 'react';
import 'firebase/compat/auth';
import Swal from "sweetalert2";
import * as formik from 'formik'
import * as Yup from "yup";
import { truncateString } from "../../components/utils.js"
import { doc, collection, writeBatch, setDoc } from "firebase/firestore";
import DatePicker from 'react-datepicker'
import "react-datepicker/dist/react-datepicker.css";
import "../main.css"
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faCalendar, faInfo } from '@fortawesome/free-solid-svg-icons';
import { getDay, startOfWeek, differenceInWeeks, max } from 'date-fns'

const addDays = function(date, days) {
  var newDate = new Date(date.valueOf());
  newDate.setDate(date.getDate() + days);
  return newDate;
}

const FormField = ({ label, tooltip, children, error, required = false }) => (
  <div className="form-field">
    <label className="form-label">
      {label}
      {required && <span className="required">*</span>}
      {tooltip && (
        <div className="tooltip-wrapper">
          <FontAwesomeIcon icon={faInfo} className="info-icon" />
          <div className="tooltip-content">{tooltip}</div>
        </div>
      )}
    </label>
    {children}
    {error && <div className="field-error">{error}</div>}
  </div>
);

const CustomDateInput = React.forwardRef(({ value, onClick, placeholder, error }, ref) => (
  <button
    className={`date-input ${error ? 'error' : ''}`}
    onClick={onClick}
    ref={ref}
    type="button"
  >
    <FontAwesomeIcon icon={faCalendar} className="calendar-icon" />
    <span>{value || placeholder}</span>
  </button>
));

const schema = Yup.object().shape({
  courseName: Yup.string().required('Course name is required'),
  callNumber: Yup.string().required('Call number is required'),
  classBegins: Yup.date().required('Class start date is required'),
  firstWeek: Yup.date().required('First survey date is required'),
  lastWeek: Yup.date().required('Last survey date is required'),
  surveysPerStudent: Yup.number()
    .min(1, 'Must be at least 1')
    .max(10, 'Must be 10 or less')
    .required('Required'),
});

export const AddCourse = ({ db, coursesState, courseIdState, user, onSuccess }) => {
  const [courses, setCourses] = coursesState;
  const [courseIds, setCourseIds] = courseIdState;
  const [minFirstWeek, setMinFirstWeek] = useState(new Date());
  const [minLastWeek, setMinLastWeek] = useState(new Date());
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { Formik } = formik;

  const tooltips = {
    courseName: "Name of your course",
    callNumber: "Course call number that will show up in survey emails",
    surveysPerStudent: "How many times to request feedback from each student",
    classBegins: "Used to track weeks throughout the survey",
    firstWeek: "Survey should begin in or after the 2nd week of the course",
    lastWeek: "The last survey will be sent out on the Monday of the chosen week",
  };

  const generateHash = () => {
    return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
  };

  const handleSubmit = async (values, { setSubmitting, resetForm }) => {
    setIsSubmitting(true);
    try {
      const hash = generateHash();
      const batch = writeBatch(db);

      // Convert dates to mm/dd/yyyy format strings
      const formatDate = (date) => {
        if (!date) return null;
        return date.toLocaleDateString('en-US');
      };

      const courseData = {
        ...values,
        classBegins: formatDate(values.classBegins),
        firstWeek: formatDate(values.firstWeek),
        lastWeek: formatDate(values.lastWeek),
        hash,
        createdBy: user.uid,
        admins: [user.email],
        createdAt: new Date(),
      };

      const courseRef = doc(db, "courses", hash);
      const rosterRef = doc(db, "rosters", hash);
      const questionRef = doc(db, "questions", hash);

      batch.set(courseRef, courseData);
      batch.set(rosterRef, { "id": [], "name": [] });
      batch.set(questionRef, { "previous-questions": [], "questions": [] });

      await batch.commit();

      setCourses([...courses, { ...courseData, approvalStatus: false }]);
      setCourseIds([...courseIds, hash]);
      
      Swal.fire({
        icon: "success",
        title: "Almost Done!",
        html: `<p>Your Course ID is: <strong>${hash}</strong></p><p>Please complete the next steps to finish setting up your survey.</p>`,
        confirmButtonColor: "#3b82f6"
      });
      resetForm();
      if (onSuccess) onSuccess();
      
    } catch (error) {
      console.error("Error creating course:", error);
      Swal.fire({
        icon: "error",
        title: "Failed to create course",
        text: "Please try again.",
        confirmButtonColor: "#3b82f6"
      });
    } finally {
      setIsSubmitting(false);
      setSubmitting(false);
    }
  };

  return (
    <Formik
      validationSchema={schema}
      onSubmit={handleSubmit}
      initialValues={{
        courseName: '',
        callNumber: '',
        classBegins: null,
        firstWeek: null,
        lastWeek: null,
        surveysPerStudent: 2,
        numWeeks: null,
      }}
    >
      {({ handleSubmit, handleChange, values, errors, setFieldValue }) => {
        
        useEffect(() => {
          if (!values.classBegins) return;
          const minDate = startOfWeek(addDays(values.classBegins, 7));
          setMinFirstWeek(max([new Date(), minDate]));
        }, [values.classBegins]);

        useEffect(() => {
          if (!values.firstWeek) return;
          const minDate = startOfWeek(addDays(values.firstWeek, 7));
          setMinLastWeek(max([new Date(), minDate]));
        }, [values.firstWeek]);

        useEffect(() => {
          const end = values.lastWeek;
          const start = values.firstWeek;
          if (!end || !start) {
            setFieldValue('numWeeks', null);
            return;
          }
          const weeksApart = differenceInWeeks(end, start) + 1;
          setFieldValue('numWeeks', weeksApart);
        }, [values.firstWeek, values.lastWeek]);

        return (
          <form onSubmit={handleSubmit} className="add-course-form">
            <div className="form-grid">
              <FormField
                label="Course Name"
                tooltip={tooltips.courseName}
                error={errors.courseName}
                required
              >
                <input
                  type="text"
                  name="courseName"
                  placeholder="e.g., Introduction to Computer Science"
                  value={values.courseName}
                  onChange={handleChange}
                  className={`form-input ${errors.courseName ? 'error' : ''}`}
                />
              </FormField>

              <FormField
                label="Call Number"
                tooltip={tooltips.callNumber}
                error={errors.callNumber}
                required
              >
                <input
                  type="text"
                  name="callNumber"
                  placeholder="e.g., CS109"
                  value={values.callNumber}
                  onChange={handleChange}
                  className={`form-input ${errors.callNumber ? 'error' : ''}`}
                />
              </FormField>

              <FormField
                label="Surveys per Student"
                tooltip={tooltips.surveysPerStudent}
                error={errors.surveysPerStudent}
                required
              >
                <input
                  type="number"
                  name="surveysPerStudent"
                  min="1"
                  max="10"
                  value={values.surveysPerStudent}
                  onChange={handleChange}
                  className={`form-input ${errors.surveysPerStudent ? 'error' : ''}`}
                />
              </FormField>

              <FormField
                label="Class Begins"
                tooltip={tooltips.classBegins}
                error={errors.classBegins}
                required
              >
                <DatePicker
                  selected={values.classBegins}
                  onChange={(date) => setFieldValue('classBegins', date)}
                  customInput={
                    <CustomDateInput 
                      placeholder="Select start date"
                      error={errors.classBegins}
                    />
                  }
                  filterDate={(date) => (getDay(date) !== 0 && getDay(date) !== 6)}
                  dateFormat="yyyy-MM-dd"
                />
              </FormField>

              <FormField
                label="First Survey"
                tooltip={tooltips.firstWeek}
                error={errors.firstWeek}
                required
              >
                <DatePicker
                  selected={values.firstWeek}
                  onChange={(date) => setFieldValue('firstWeek', date)}
                  customInput={
                    <CustomDateInput 
                      placeholder="Select first survey date"
                      error={errors.firstWeek}
                    />
                  }
                  minDate={minFirstWeek}
                  filterDate={(date) => getDay(date) === 1} // Only Mondays
                  dateFormat="yyyy-MM-dd"
                />
              </FormField>

              <FormField
                label="Last Survey"
                tooltip={tooltips.lastWeek}
                error={errors.lastWeek}
                required
              >
                <DatePicker
                  selected={values.lastWeek}
                  onChange={(date) => setFieldValue('lastWeek', date)}
                  customInput={
                    <CustomDateInput 
                      placeholder="Select last survey date"
                      error={errors.lastWeek}
                    />
                  }
                  minDate={minLastWeek}
                  filterDate={(date) => getDay(date) === 1} // Only Mondays
                  dateFormat="yyyy-MM-dd"
                />
              </FormField>
            </div>

            {values.numWeeks && (
              <div className="survey-summary">
                <h4>Survey Summary</h4>
                <p>Your course will run surveys for <strong>{values.numWeeks} weeks</strong></p>
                <p>Each student will receive <strong>{values.surveysPerStudent} surveys</strong> throughout the term</p>
              </div>
            )}

            <div className="form-actions">
              <button
                type="submit"
                disabled={isSubmitting}
                className="btn-primary"
              >
                {isSubmitting ? 'Creating...' : 'Create Course Survey'}
              </button>
            </div>
          </form>
        );
      }}
    </Formik>
  );
};
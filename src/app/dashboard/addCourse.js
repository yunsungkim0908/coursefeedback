'use client';

import Link from 'next/link'
import React, { useEffect, useState, useRef, forwardRef } from 'react';
import { Table, Dropdown, Tooltip, OverlayTrigger } from 'react-bootstrap'
import Button from 'react-bootstrap/Button';
import Feedback from 'react-bootstrap/Feedback'
import Col from 'react-bootstrap/Col';
import Form from 'react-bootstrap/Form';
import InputGroup from 'react-bootstrap/InputGroup';
import Row from 'react-bootstrap/Row';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'firebase/compat/auth';
import Swal from "sweetalert2";
import * as formik from 'formik'
import * as Yup from "yup";
import { TextInputCell } from "../../components/Forms/form.js"
import { ErrorMessage, SuccessMessage } from "../../components/utils.js"
import { doc, collection, writeBatch, deleteDoc, updateDoc, addDoc, setDoc, getDoc } from "firebase/firestore";
import style from "./page.module.css"
import DatePicker from 'react-datepicker'
import "react-datepicker/dist/react-datepicker.css";

import "../main.css"
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faCircleInfo } from '@fortawesome/free-solid-svg-icons';
import { getDay, startOfWeek, differenceInWeeks, max } from 'date-fns'
import { utcToZonedTime, format } from 'date-fns-tz'

const addDays = function(date, days) {
  var newDate = new Date(date.valueOf());
  newDate.setDate(date.getDate() + days);
  return newDate;
}

const timeZone = 'America/Los_Angeles'
const formatDate = (date) => format(date, "yyyy/MM/dd", {timeZone: timeZone})
const utcToPT = (utcDate) => utcToZonedTime(utcDate, timeZone)

const tooltipText = {
  "Call Number": "Course call number that will show up in the survey emails sent to students",
  "Course Name": "Name of your course",
  "Surveys per Student": "How many times to request feedback from each student throughout the quarter",
  "Class Begins": "Used to track weeks throughout the survey",
  "First Survey": "Survey should begin in or after the *2nd week* of the course.",
"Last Week of Survey": "The last survey will be sent out on the Monday of the chosen week.",
  "Number of Weeks": "Total number of weeks to survey"
}

const TooltipLabel = (props) => {
  const text = tooltipText[props.label]
  const tooltip = (
    <Tooltip id="tooltip" style={{margin: "6px 0"}}>
      {text}
    </Tooltip>
  );

  return (
      <Form.Label {...props} style={{padding: "0 0rem"}}>
        {props.label}
        <OverlayTrigger placement="top" overlay={tooltip}>
          <FontAwesomeIcon
            style={{padding: "0 5px"}}
            color="grey" icon={faCircleInfo}
            hidden={tooltipText === undefined}
          />
        </OverlayTrigger>
      </Form.Label>
  )
}

const CourseForm = ({
  handleSubmit, handleChange, handleReset,
  setFieldValue, setFieldError, values, touched, errors
}) => {

  const [minFirstWeek, setMinFirstWeek] = useState(null)
  const [minLastWeek, setMinLastWeek] = useState(null)
  const [numWeeks, setNumWeeks] = useState(null)

  const CustomDatePicker = forwardRef(({
      onChange, value, isSecure, id, onClick,
      fieldError, disabled, onClickDisabled
    }, ref) => (
    <>
      <span style={{position: "relative"}}>
      <Form.Control
        type="date"
        onChange={onChange}
        value={value}
        onClick={onClick}
        ref={ref}
        isInvalid={!!fieldError}
        disabled={disabled}
      />
      {disabled
        ? <div style={{position: "absolute", left:0, right:0, top:0, bottom:0}}
            onClick={onClickDisabled}
          />
        : <></>
      }
      <Form.Control.Feedback type="invalid">
        {fieldError}
      </Form.Control.Feedback>
      </span>
    </>
  ))

  useEffect(() => {
    if (!values.classBegins)
      return
    const minDate = startOfWeek(addDays(values.classBegins, 7))
    setMinFirstWeek(max([new Date(), minDate]))
    if (errors.firstWeek == "Select Class Begins")
      setFieldError("firstWeek", null)
    if (errors.lastWeek == "Select Class Begins")
      setFieldError("lastWeek", null)
  }, [values.classBegins])

  useEffect(() => {
    if (!values.firstWeek)
      return
    const minDate = startOfWeek(addDays(values.firstWeek, 7))
    setMinLastWeek(max([new Date(), minDate]))
    if (errors.lastWeek == "Select First Survey")
      setFieldError("lastWeek", null)
  }, [values.firstWeek])

  useEffect(() => {
    const end = values.lastWeek
    const start = values.firstWeek
    if (!end || !start)
      setFieldValue('numWeeks', null)
    const weeksApart = differenceInWeeks(end, start) + 1
    setFieldValue('numWeeks', weeksApart)
  }, [values.firstWeek, values.lastWeek])

  return (
  <Form onSubmit={handleSubmit}
    style={{background: '#E2E2E2', width: "80%", padding: "2% 5%", borderRadius: "5%"}}>
    <Row className="mb-3">
      <Form.Group
        controlId="validationFormik101"
        className="position-relative"
      >
        <TooltipLabel label={"Course Name"}/>
        <Form.Control
          type="text"
          name="courseName"
          value={values.courseName}
          onChange={handleChange}
          isInvalid={!!errors.courseName}
        />
        <Form.Control.Feedback type="invalid">
          {errors.courseName}
        </Form.Control.Feedback>
      </Form.Group>
    </Row>
    <Row className="mb-3">
      <Form.Group
        as={Col}
        md="6"
        controlId="validationFormik102"
        className="position-relative"
      >
        <TooltipLabel label={"Call Number"}/>
        <Form.Control
          type="text"
          name="callNumber"
          placeholder="e.g., CS109"
          value={values.callNumber}
          onChange={handleChange}
          isInvalid={!!errors.callNumber}
        />
        <Form.Control.Feedback type="invalid">
          {errors.callNumber}
        </Form.Control.Feedback>
      </Form.Group>
      <Form.Group
        as={Col}
        md="6"
        controlId="validationFormik103"
        className="position-relative"
      >
        <TooltipLabel label={"Class Begins"}/>
        <DatePicker
          showIcon
          name="classBegins"
          dateFormat="yyyy-MM-dd"
          selected={values.classBegins}
          onChange={(date) => {setFieldValue('classBegins', date)}}
          customInput={
            <CustomDatePicker fieldError={errors.classBegins}/>
          }
          filterDate={(date) => (getDay(date) !== 0 && getDay(date) !== 6)}
        />
      </Form.Group>
    </Row>
    <Row className="mb-3">
      <Form.Group
        as={Col}
        md="6"
        controlId="validationFormik104"
        className="position-relative"
      >
        <TooltipLabel label={"First Survey"}/>
        <DatePicker
          showIcon
          name="firstWeek"
          dateFormat="yyyy-MM-dd"
          selected={values.firstWeek}
          onChange={(date) => {setFieldValue('firstWeek', date)}}
          customInput={
            <CustomDatePicker fieldError={errors.firstWeek}
              onClickDisabled={()=>{
                if (!errors.firstWeek)
                  setFieldError('firstWeek', 'Select Class Begins')
                else
                  setFieldError('firstWeek', null)
              }}
            />
          }
          filterDate={(date) => (getDay(date) === 1)}
          minDate={minFirstWeek}
          disabled={!values.classBegins}
        />
      </Form.Group>
      <Form.Group
        as={Col}
        md="6"
        controlId="validationFormik105"
        className="position-relative"
      >
        <TooltipLabel label={"Last Survey"}/>
        <DatePicker
          showIcon
          name="lastWeek"
          dateFormat="yyyy-MM-dd"
          selected={values.lastWeek}
          onChange={(date) => {setFieldValue('lastWeek', date)}}
          customInput={
            <CustomDatePicker fieldError={errors.lastWeek}
              onClickDisabled={()=>{
                if (!!errors.lastWeek)
                  setFieldError('lastWeek', null)
                else if (!values.classBegins)
                  setFieldError('lastWeek', 'Select Class Begins')
                else if (!values.firstWeek)
                  setFieldError('lastWeek', 'Select First Survey')
              }}
            />
          }
          filterDate={(date) => (getDay(date) === 1)}
          minDate={minLastWeek}
          disabled={!values.firstWeek}
        />
      </Form.Group>
    </Row>
    <Form.Group
      as={Row}
      controlId="validationFormik106"
      className="justify-content-center"
    >
      <TooltipLabel label={"Surveys per Student"} column md={5}/>
      <Col md={2}>
        <Form.Control
          type="text"
          name="numQuery"
          value={values.numQuery}
          onChange={handleChange}
          isInvalid={!!errors.numQuery}
        />
        <Form.Control.Feedback type="invalid">
          {errors.numQuery}
        </Form.Control.Feedback>
      </Col>
    </Form.Group>
    <Form.Group
      as={Row}
      controlId="validationFormik107"
      className="justify-content-center"
    >
      <TooltipLabel label={"Number of Weeks"} column md={5}/>
      <Col md={2}>
        <Form.Control
          type="text"
          name="numWeeks"
          value={(!values.numWeeks)?"":values.numWeeks}
          isInvalid={!!errors.numWeeks}
          disabled
        />
      </Col>
    </Form.Group>
    <div className={style.center}>
      <Button type="submit" variant="primary">
        Create
      </Button>
      <Button type="reset" variant="secondary" className=""
        onClick={handleReset}
      >
        Reset
      </Button>
    </div>
  </Form>
  )
}

export const AddCourse = (props) => {
  const [userCourses, setUserCourses] = props.coursesState

  const { Formik } = formik;

  const createCourse = (db, newValues) => {
    const batch = writeBatch(db)

    const courseId = doc(collection(db, "courses")).id

    const newCourses = [...userCourses, newValues]

    newValues["hash"] = courseId

    const courseRef = doc(db, "courses", courseId)
    const rosterRef = doc(db, "rosters", courseId)
    const questionRef = doc(db, "questions", courseId)

    const write = async () => {
      batch.set(courseRef, newValues)
      batch.set(questionRef, {"previous-questions": [], "questions": []})
      batch.set(rosterRef, {"id": [], "name": []})
      return batch.commit()
    }

    write()
      .then(() => {
        setUserCourses(newCourses)
        SuccessMessage(`Submitted! Please email the HRCE admin with the following course ID for approval:\n${courseId}`)
      })
      .catch((error) => {console.log(error)})
  }

  const initialValues = {
    courseName: "",
    callNumber: "",
    numQuery: 2,
    numWeeks: null,
    firstWeek: null,
    lastWeek: null,
    classBegins: null
  }

  const validationSchema = Yup.object().shape({
    courseName: Yup.string().required("Required"),
    callNumber: Yup.string().required("Required"),
    numQuery: Yup.number().integer("Integer only")
      .positive("Invalid count").required("Required"),
    firstWeek: Yup.date().required("Required"),
    lastWeek: Yup.date().required("Required"),
    classBegins: Yup.date().required("Required")
  });

  const onSubmit = (newValues, { resetForm }) => {
    // const courseExists = (e) => {
    //   return (e.callNumber === newValues.callNumber)
    // }

    // if (userCourses.some(courseExists)){
    //   ErrorMessage("A course with the same call number already exists.")
    //   return
    // }

    const options = {
      year: "numeric",
      month: "2-digit",
      day: "2-digit"
    };

    newValues["completed"] = 0
    newValues["admins"] = [props.user.email]
    newValues["createdBy"] = props.user.uid
    newValues["createdByEmail"] = props.user.email
    newValues["numQuery"] = parseInt(newValues.numQuery)
    newValues["classBegins"] = newValues["classBegins"].toLocaleDateString("en-US", options)
    newValues["firstWeek"] = newValues["firstWeek"].toLocaleDateString("en-US", options)
    newValues["lastWeek"] = newValues["lastWeek"].toLocaleDateString("en-US", options)

    createCourse(props.db, newValues)
    resetForm()
  }

  return (
    <div>
    <div className="card my-3 mx-auto" style={{maxWidth: 800}}>
    <div className="card-body">
      <h2> Create a course survey</h2>
      <hr/>
      <h4>Instructions</h4>
      <ol>
        <li>Create a course survey by filling in the form below and clicking "Create."</li>
        <li><b style={{color: 'blue'}}>Email the following items to the HRCF admin (hrcf@cs.stanford.edu)</b> to get the survey approved. (For Stanford courses, your course ID and call number will suffice.)
          <ol>
            <li>The Course ID</li>
            <li>Name of your institution and department</li>
            <li>Your course syllabus</li>
          </ol>
        </li>
        <li>While we review your survey request, go to the course settings link in "Your Courses" to finish setting up the survey.</li>
      </ol>

      <div className={style.center}>
        <Formik
          validateOnChange={false}
          validateOnBlur={false}
          initialValues={initialValues}
          validationSchema={validationSchema}
          enableReinitialize={true}
          onSubmit={onSubmit}
        >
          {CourseForm}
        </Formik>
      </div>

      <p><b>NOTE:</b> Once created, the survey info <span style={{color: "blue"}}><b>cannot be edited</b></span>. If you made a mistake, please remove the survey and create a new one.</p>
    </div>
    </div>
    </div>
  )
}



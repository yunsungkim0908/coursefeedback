'use client'

import React, { useState, useEffect } from 'react';
import { Field, useField } from "formik";
import { Formik, Form } from 'formik';
import style from '../dashboard/page.module.css'
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import moment from 'moment';
import { differenceInWeeks, startOfWeek } from 'date-fns';


export const WeekPicker = () => {
  const [classBegins, classBeginsMeta, classBeginsHelpers] = useField("classBegins");
  const [error, setError] = useState("error")

  const firstWeek = new Date()

  useEffect(() => {
    console.log(startOfWeek(new Date(firstWeek)))
    if (classBegins.value === undefined){
      console.log('UNDEFINED')
    }else{
      console.log('not undefined', startOfWeek(new Date(classBegins.value)))
    }
    var newNumWeek = differenceInWeeks(
      startOfWeek(new Date(firstWeek)),
      startOfWeek(new Date(classBegins.value))
    )
    console.log('num weeks', newNumWeek)
    if (isNaN(newNumWeek))
      newNumWeek = 1
    const datesInvalid = (
      (newNumWeek <= 0)
      && (firstWeek !== undefined)
      && (classBegins.value !== undefined)
    )

    if (datesInvalid){
      classBeginsHelpers.setError(
        'Survey should begin after the 2nd week of classes.'
      )
      setError("ERROR")
      console.log('running')
    } else {
      classBeginsHelpers.setError(undefined)
      setError(null)
    }
    console.log(classBeginsMeta)
    classBeginsMeta.error = "ERROR"
    console.log(classBeginsMeta.error)
    console.log(classBeginsMeta.touched)
    console.log('state', error)
  },[classBegins.value, classBeginsMeta.error])

    console.log('out', classBeginsMeta.error)
    console.log('out', classBeginsMeta.touched)
  return (
    <div>
      <div>
        <label style={{width: "100%", margin: "0 5px"}}>
          Week of 
        </label>
        <DatePicker
          showIcon
          selected={classBegins.value}
          onChange={classBeginsHelpers.setValue}
        />
      </div>

      {error &&
        <div className={style.errorSpace}>
          <span className={style.error}>{classBeginsMeta.error}</span>
        </div>
      }
    </div>
  )
}

{/*const Picker = (props) => {
  return (
    <div>
      <div>
        <label style={{width: "100%", margin: "0 5px"}}>
          Week of 
        </label>
        <DatePicker
          showIcon
          selected={classBegins.value}
          onChange={classBeginsHelpers.setValue}
        />
      </div>

      {error &&
        <div classNAme={style.errorSpace}>
          <span className={style.error}>{classBeginsMeta.error}</span>
        </div>
      }
    </div>
  )
}*/}

export default function Page() {
  const initialValues = {
    courseName: "",
    callNumber: "",
    numQuery: 2,
    numWeeks: 0,
    firstWeek: undefined,
    lastWeek: undefined,
    classBegins: undefined
  }

  return (
    <Formik
      validateOnChange={false}
      validateOnBlur={false}
      initialValues={{field: new Date()}}
      enableReinitialize={true}
      onSubmit={() => {}}
    >
      <Form>
        <WeekPicker deselectToggle={true}/>
      </Form>
    </Formik>
  )
}

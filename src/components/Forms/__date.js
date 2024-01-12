import React, { useState, useEffect } from 'react';
import { Field, useField } from "formik";

import 'bootstrap/dist/css/bootstrap.min.css';
import DatePicker from "react-datepicker";

import "react-datepicker/dist/react-datepicker.css";
import { differenceInWeeks, startOfWeek, getDay, addDays } from 'date-fns'

import moment from 'moment';
import style from './form.css'

const isMonday = (date) => {
  const day = getDay(date);
  return day == 1;
};

export const ClassBeginsPicker = (props) => {
  const [classBegins, classBeginsMeta, classBeginsHelpers] = useField("classBegins");
  const [firstWeek, firstWeekMeta, firstWeekHelpers] = useField("firstWeek")

  useEffect(() => {
    if (firstWeek.value === undefined || classBegins.value === undefined)
      return
    console.log('class', classBegins.value)
    var newNumWeek = differenceInWeeks(
      startOfWeek(new Date(firstWeek.value)),
      startOfWeek(new Date(classBegins.value))
    )
    if (isNaN(newNumWeek))
      newNumWeek = 1
    const datesInvalid = (
      (newNumWeek <= 0)
      && (firstWeek.value !== undefined)
      && (classBegins.value !== undefined)
    )
    classBeginsHelpers.setError(datesInvalid 
      ? 'Survey should begin after the 2nd week of classes.'
      : undefined)
  }, [firstWeek.value,  classBegins.value])

  return (
    <div>
      <DatePicker
        mode="single"
        selected={classBegins.value}
        onChange={(date) => {classBeginsHelpers.setValue(date)}}
      />
      {(classBeginsMeta.error) &&
        <div className={style.errorSpace}>
          <span className={style.error}>{classBeginsMeta.error}</span>
        </div>
      }
    </div>
  )
}

export const FirstWeekPicker = (props) => {
  const [classBegins, classBeginsMeta, classBeginsHelpers] = useField("classBegins");
  const [firstWeek, firstWeekMeta, firstWeekHelpers] = useField("firstWeek")
  const [lastWeek, lastWeekMeta, lastWeekHelpers] = useField("lastWeek");
  const [numWeeks, numWeeksMeta, numWeeksHelpers] = useField("numWeeks")

  const [minDate, setMinDate] = useState(null)

  useEffect(() => {
    if (firstWeek.value === undefined || lastWeek.value === undefined)
      return
    setMinDate(addDays(startOfWeek(new Date(classBegins.value)), 8))
    console.log(classBegins.value)
    console.log(minDate)

    var newNumWeek = differenceInWeeks(
      startOfWeek(new Date(lastWeek.value)),
      startOfWeek(new Date(firstWeek.value))
    )
    if (isNaN(newNumWeek))
      newNumWeek = 0

    const datesInvalid = (
      (newNumWeek <= 0)
      && (firstWeek.value !== undefined)
      && (lastWeek.value !== undefined)
    )
    numWeeksHelpers.setValue((!datesInvalid) ? newNumWeek : 0)
  }, [firstWeek.value, lastWeek.value])

  useEffect(() => {
    if (firstWeek.value === undefined || classBegins.value === undefined)
      return
    var newNumWeek = differenceInWeeks(
      startOfWeek(new Date(firstWeek.value)),
      startOfWeek(new Date(classBegins.value))
    )
    if (isNaN(newNumWeek))
      newNumWeek = 1
    const datesInvalid = (
      (newNumWeek <= 0)
      && (firstWeek.value !== undefined)
      && (classBegins.value !== undefined)
    )
    classBeginsHelpers.setError(datesInvalid 
      ? 'Survey should begin after the 2nd week of classes.'
      : undefined)
  }, [firstWeek.value,  classBegins.value])

  return (
    <div>
      <DatePicker
        mode="single"
        selected={firstWeek.value}
        onChange={firstWeekHelpers.setValue}
        filterDate={isMonday}
        minDate={minDate}
      />
      {(firstWeekMeta.error) &&
        <div className={style.errorSpace}>
          <span className={style.error}>{firstWeekMeta.error}</span>
        </div>
      }
    </div>
  )
}

export const LastWeekPicker = (props) => {
  const [firstWeek, firstWeekMeta, firstWeekHelpers] = useField("firstWeek")
  const [lastWeek, lastWeekMeta, lastWeekHelpers] = useField("lastWeek");
  const [numWeeks, numWeeksMeta, numWeeksHelpers] = useField("numWeeks")

  useEffect(() => {
    if (firstWeek.value === undefined || lastWeek.value === undefined)
      return
    var newNumWeek = differenceInWeeks(
      startOfWeek(new Date(lastWeek.value)),
      startOfWeek(new Date(firstWeek.value))
    )
    if (isNaN(newNumWeek))
      newNumWeek = 0

    const datesInvalid = (
      (newNumWeek <= 0)
      && (firstWeek.value !== undefined)
      && (lastWeek.value !== undefined)
    )
    console.log(newNumWeek)
    numWeeksHelpers.setValue((!datesInvalid) ? newNumWeek : 0)
  }, [firstWeek.value, lastWeek.value])

  return (
    <div>
      <DatePicker
        mode="single"
        selected={lastWeek.value}
        onChange={lastWeekHelpers.setValue}
        filterDate={isMonday}
      />
      {(lastWeekMeta.error) &&
        <div className={style.errorSpace}>
          <span className={style.error}>{lastWeekMeta.error}</span>
        </div>
      }
    </div>
  )
}

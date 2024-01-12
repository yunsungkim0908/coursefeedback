'use client';

import { Button, ButtonGroup, Dropdown, Table } from "react-bootstrap";
import Tab from "react-bootstrap/Tab"
import Tabs from "react-bootstrap/Tabs"
import React, { createContext, useContext, useState, useEffect } from 'react';
import 'firebase/compat/auth';
import "bootstrap/dist/css/bootstrap.min.css";
import * as formik from 'formik'
import * as Yup from "yup";
import { CSVReader } from 'react-papaparse';
import Swal from "sweetalert2"
import Form from 'react-bootstrap/Form';
import InputGroup from 'react-bootstrap/InputGroup';
import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs } from 'firebase/firestore';
import { doc, deleteDoc, setDoc, getDoc } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import { firebase_app, db, auth } from '../../components/firebase'
import { ErrorMessage, SectionCard } from '../../components/utils.js'

import styles from '../page.module.css' 

const RosterContext = createContext()

const RosterTable = ({rosterState}) => {

  return (
    <Table>
      <thead>
        <tr>
          <th> No. </th>
          <th> Student Email </th>
          <th> Name </th>
        </tr>
      </thead>
      <tbody>
      </tbody>
    </Table>
  )
}

export const ManageRoster = (props) => {
  const rosterState = useState([])

  return (
    <SectionCard>
      <h2>Update Roster</h2>
    </SectionCard>
  )
}

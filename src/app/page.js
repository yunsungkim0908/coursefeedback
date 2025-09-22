'use client';

import React from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Container, Button, Alert } from 'react-bootstrap';
import Accordion from 'react-bootstrap/Accordion'
import "bootstrap/dist/css/bootstrap.min.css";
import cx from 'classnames';
import { NavBarContainer } from '../components/container.js'
import styles from './page.module.css'
import './main.css'

const Faq = () => {
  return (
    <div>
      <h3 style={{textAlign: "center"}}>Frequently Asked Questions</h3>

      <Accordion alwaysOpen>
      <Accordion.Item eventKey="4">
        <Accordion.Header><b>How do I get started?</b></Accordion.Header>
        <Accordion.Body>
          If you don't have an account, click on the "Sign In" button to create an account using your <b>institutional email</b>. Log in and follow the instructions on completing the "Create a Course Survey" form, then send us (hrcf@cs.stanford.edu) the following items:
          <ol>
            <li>Your school profile page (e.g., a link to your faculty page) to verify your email and affiliation.</li>
            <li>The unique course ID generated upon completing the form.</li>
          </ol>
          We will then review these information and approve your course survey!
          <br/><br/>
          While we review your course survey request, you can go to your survey settings page to update the (1) course roster, (2) custom questions of the week (optional), and (3) the list of admins who get to receive digest emails.
        </Accordion.Body>
      </Accordion.Item>
      <Accordion.Item eventKey="0">
        <Accordion.Header>What does a week of survey look like?</Accordion.Header>
        <Accordion.Body>
          Here is what a week of survey looks like (All times are indicated in Pacific Time (PT)):
          <ul>
            <li>Around <b>Monday at Noon,</b> we send out survey requests to students in the roster who were chosen to be requested to provide feedback that week.</li>
            <li>Around <b>Thursday at Noon,</b> students who haven't yet filled out the feedback form will receive a reminder email.</li>
            <li>Around <b>Sunday at 4pm,</b> the feedback forms will close and you will receive a weekly digest from us reporting the feedback received from your students.</li>
          </ul>
        </Accordion.Body>
      </Accordion.Item>
      <Accordion.Item eventKey="1">
        <Accordion.Header>What questions do you ask students?</Accordion.Header>
        <Accordion.Body>
          All surveys include the following 4 default questions:
          <ul>
            <li><b>Q1:</b> What did you like about the course so far? (Text Response)</li>
            <li><b>Q2:</b> Is anything from class still confusing to you? (Text Response)</li>
            <li><b>Q3:</b> Is there anything the teaching team should know? (Text Response)</li>
            <li><b>Q4:</b> How would you rate your course experience this week? (Qualitative 5-way Rating)</li>
          </ul>
          In addition to these 4 questions we ask all students in every survey, you have the option to add <b>custom questions</b> to the survey each week.
        </Accordion.Body>
      </Accordion.Item>
      <Accordion.Item eventKey="2">
        <Accordion.Header>What do instructors get in a weekly digest email?</Accordion.Header>
        <Accordion.Body>
        The digest email sent to instructors every Sunday has the following 4 pieces of information.
        <ul>
          <li><b>Weekly Participation Rate:</b>The total number of students surveyed and the number of students who responded are reported, along with their ratio.</li>
          <li><b>Collection of Responses:</b> For each question, the responses are collected and listed in a single file. Responses to rating questions are additionally visualized as a histogram.</li>
          <li><b>Weekly "Class Mood" Graph:</b> In HRCF, the average student rating for the question "How would you rate your course experience so far? (Q4)" is referred to as the weekly "class mood." The estimated weekly class mood is plotted (the right plot in the HRCF schematics figure above) for all weeks as a violin plot, along with the standard error of the mean (SEoM).</li>
        </ul>
        </Accordion.Body>
      </Accordion.Item>
      <Accordion.Item eventKey="3">
        <Accordion.Header>How do you maintain privacy and anonymity of feedback?</Accordion.Header>
        <Accordion.Body>
          We send each student a unique link to a webpage where they can submit their response anonymously.
        </Accordion.Body>
      </Accordion.Item>
    </Accordion>

    </div>
  )
}

let bibtex = `\@inproceedings{kim2023high,
  title={High-Resolution Course Feedback: Timely Feedback Mechanism for Instructors},
  author={Kim, Yunsung and Piech, Chris},
  booktitle={Proceedings of the Tenth ACM Conference on Learning@ Scale},
  pages={81--91},
  year={2023}
}`;

export default function Home() {
  return (
    <NavBarContainer>
    <main className={styles.main}>
      <div className={styles.right}>
        <Button className={styles.top_right} href="/login">
          Sign In
        </Button>
      </div>
      <div className="col" style={{
        backgroundColor: "white",
        padding: "0 10px"
      }}>
        <div className={styles.card}>
          <h1 className={styles.center}>
            High-Resolution Course Feedback
          </h1>
          <h5 className={styles.center}>
            Timely Feedback mechanism for Course Instructors
          </h5>
          <hr/>
          <p>
            {/*Welcome to High-Resolution Course Feedback (HRCF)! 
            <br/><br/>*/}
            HRCF is an <b>anonymous course feedback tool</b> that can help instructors understand their students better on a <b>weekly basis</b>. It works by requesting feedback from each student a <b>fixed number of times</b> (typically twice) throughout the term, but on <b>randomly chosen</b> weeks. This helps instructors obtain <b style={{color: "crimson"}}>timely and actionable feedback</b> that well captures meaningful mood changes. For more detail, checkout our <b><a href="https://yunsungkim.com/pdfs/hrcf.pdf" target="_blank" rel="noopener noreferrer">&#x1F4CE;paper</a></b> (presented at L@S'23).
          </p>
          <p>
            <b style={{color: "darkolivegreen"}}>Curious to know what your students are experiencing this week?</b> Create an account by clicking "Sign In" and we'll get you started with HRCF!
          </p>
          <div className={styles.cardCenter}>
            <Image
              src="overview.png"
              alt="hrcf"
              width="337"
              height="133"
              layout="responsive"
              style={{maxWidth: "800px"}}
            />
            <figcaption className={styles.figcaption}>
              Schematic of the HRCF surveys. The trend graph on the right is the average "course mood" graph sent to instructors each week.
            </figcaption>
          </div>
        </div>
        <hr/>
        <Faq/>
        <hr/>
        <h3 style={{textAlign: "center"}}>Reference</h3>
          <div className={styles.bibtex_box}>
            <pre className={styles.pre}>{bibtex}</pre>
          </div>
      </div>
    </main>
    </NavBarContainer>
  )
}

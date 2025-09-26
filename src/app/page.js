'use client';

import React from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { 
  faArrowRight, 
  faChartLine, 
  faClock, 
  faUsers, 
  faShieldAlt,
  faQuestionCircle,
  faEnvelope,
  faCalendarAlt,
  faBookOpen
} from '@fortawesome/free-solid-svg-icons'
import './main.css'

const FeatureCard = ({ icon, title, description }) => (
  <div className="feature-card">
    <div className="feature-icon">
      <FontAwesomeIcon icon={icon} />
    </div>
    <h3>{title}</h3>
    <p>{description}</p>
  </div>
)

const TimelineStep = ({ number, title, description, time }) => (
  <div className="timeline-step">
    <div className="timeline-number">{number}</div>
    <div className="timeline-content">
      <h4>{title}</h4>
      <p className="timeline-time">{time}</p>
      <p>{description}</p>
    </div>
  </div>
)

const FaqItem = ({ question, answer }) => (
  <details className="faq-item">
    <summary className="faq-question">{question}</summary>
    <div className="faq-answer">{answer}</div>
  </details>
)

export default function Home() {
  return (
    <div className="landing-page">
      {/* Navigation */}
      <nav className="landing-nav">
        <div className="nav-container">
          <div className="nav-logo">
            <FontAwesomeIcon icon={faChartLine} />
            <span>HRCF</span>
          </div>
          <Link href="/login" className="nav-cta">
            Sign In
            <FontAwesomeIcon icon={faArrowRight} />
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="hero">
        <div className="hero-container">
          <div className="hero-content">
            <div className="hero-badge">
              <FontAwesomeIcon icon={faBookOpen} />
              <span>Published at ACM Learning@Scale</span>
            </div>
            <h1 className="hero-title">
              High-Resolution Course Feedback
            </h1>
            <p className="hero-subtitle">
              Get timely, actionable feedback from a small sample of your students every week. 
              Anonymous surveys that help you understand your class mood and adjust your teaching.
            </p>
            <div className="hero-buttons">
              <Link href="/login" className="btn-primary">
                Get Started Free
                <FontAwesomeIcon icon={faArrowRight} />
              </Link>
              <a 
                href="https://yunsungkim.com/pdfs/hrcf.pdf" 
                target="_blank" 
                rel="noopener noreferrer"
                className="btn-secondary"
              >
                Read Research Paper
              </a>
            </div>
          </div>
          <div className="hero-visual">
            <div className="hero-image-container">
              <Image
                src="/overview.png"
                alt="HRCF Overview"
                width={800}
                height={320}
                className="hero-image"
                priority
              />
              {/* <div className="image-caption">
                Schematic of HRCF surveys showing weekly mood trends
              </div> */}
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="features">
        <div className="container">
          <div className="section-header">
            <h2>Why Use HRCF?</h2>
            {/* <p>Powerful features designed for modern educators</p> */}
          </div>
          <div className="features-grid">
            <FeatureCard
              icon={faUsers}
              title="Smart Sampling"
              description="Students are randomly selected for surveys each week, enabling representative feedback without survey fatigue."
            />
            <FeatureCard
              icon={faClock}
              title="Timely Feedback"
              description="Get feedback when it matters most - weekly insights help you adjust your teaching in real-time."
            />
            <FeatureCard
              icon={faShieldAlt}
              title="Anonymous & Safe"
              description="Students provide honest feedback through anonymous surveys."
            />
            <FeatureCard
              icon={faChartLine}
              title="Data-Driven Insights"
              description="Weekly mood graphs and participation rates help you track class sentiment over time."
            />
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="how-it-works">
        <div className="container">
          <div className="section-header">
            <h2>Weekly Survey Timeline</h2>
            {/* <p>Simple three-step process for weekly feedback</p> */}
          </div>
          <div className="timeline">
            <TimelineStep
              number="1"
              title="Survey Opens"
              time="Monday at Noon PT"
              description="Selected students receive anonymous survey links to provide weekly feedback on their course experience."
            />
            <TimelineStep
              number="2"
              title="Reminder Sent"
              time="Thursday at Noon PT"
              description="Gentle reminder emails are sent to students who haven't yet completed their feedback."
            />
            <TimelineStep
              number="3"
              title="Digest Delivered"
              time="Sunday at 4pm PT"
              description="You receive a comprehensive weekly digest with all feedback, mood graphs, and actionable insights."
            />
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="faq">
        <div className="container">
          <div className="section-header">
            <h2>Frequently Asked Questions</h2>
          </div>
          <div className="faq-list">
            <FaqItem
              question="How do I get started?"
              answer={
                <div>
                  <p>Getting started is easy:</p>
                  <ol>
                    <li>Click "Sign In" and create an account with your institutional email</li>
                    <li>Complete the "Create a Course Survey" form</li>
                    <li>Send us your school profile page and the generated course ID</li>
                    <li>We'll review and approve your course survey!</li>
                  </ol>
                  <p>While we review your request, you can set up your course roster, custom questions, and admin list.</p>
                </div>
              }
            />
            <FaqItem
              question="What questions do you ask students?"
              answer={
                <div>
                  <p>All surveys include these 4 default questions:</p>
                  <ul>
                    <li><strong>Q1:</strong> What did you like about the course so far?</li>
                    <li><strong>Q2:</strong> Is anything from class still confusing to you?</li>
                    <li><strong>Q3:</strong> Is there anything the teaching team should know?</li>
                    <li><strong>Q4:</strong> How would you rate your course experience this week? (5-point scale)</li>
                  </ul>
                  <p>You can also add custom questions each week for specific topics.</p>
                </div>
              }
            />
            <FaqItem
              question="What's included in the weekly digest?"
              answer={
                <div>
                  <ul>
                    <li><strong>Participation Rate:</strong> Number of students surveyed vs. responses received</li>
                    <li><strong>Response Collection:</strong> All feedback organized by question with visualizations</li>
                    <li><strong>Class Mood Graph:</strong> Weekly trend analysis showing student sentiment over time</li>
                  </ul>
                </div>
              }
            />
            <FaqItem
              question="How do you maintain privacy and anonymity?"
              answer={
                <p>Each student receives a unique, secure link to submit their responses completely anonymously. We never track which student provided which feedback.</p>
              }
            />
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="cta">
        <div className="container">
          <div className="cta-content">
            <h2>Ready to understand your students better?</h2>
            <p>Sign up to get timely, actionable feedback every week.</p>
            <Link href="/login" className="btn-primary large">
              Start Your Free Course Survey
              <FontAwesomeIcon icon={faArrowRight} />
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="footer">
        <div className="container">
          <div className="footer-content">
            <div className="footer-left">
              <div className="footer-logo">
                <FontAwesomeIcon icon={faChartLine} />
                <span>HRCF</span>
              </div>
              {/* <p>High-Resolution Course Feedback for modern educators</p> */}
            </div>
            <div className="footer-right">
              <div className="footer-links">
                <a href="https://yunsungkim.com/pdfs/hrcf.pdf" target="_blank" rel="noopener noreferrer">
                  Research Paper
                </a>
                <Link href="/login">Sign In</Link>
              </div>
            </div>
          </div>
          <div className="footer-bottom">
            <p>&copy; 2024 High-Resolution Course Feedback. Built for educators, by educators.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
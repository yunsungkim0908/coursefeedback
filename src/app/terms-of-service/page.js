'use client';

import React from 'react'
import Link from 'next/link'
import Image from 'next/image'
import styles from '../page.module.css'
import { Container, Button, Alert } from 'react-bootstrap';
import "bootstrap/dist/css/bootstrap.min.css";
import cx from 'classnames';
import '../main.css'
import { NavBarContainer } from '../../components/container.js'

const TermsOfService = () => (
  <>
    <h3> Welcome to High-Resolution Course Feedback </h3>
    <p> [HRCF] pursues the science of teaching and learning. Feedback to course instructors provided by students is important in that pursuit. The information we gather from your engagement, both as a provider of feedback and as a consumer of feedback, makes it possible for faculty, researchers, designers, and engineers to continuously improve their work and, in that process, build learning science. By registering your course to participate in [HRCF] and by providing feedback, you are also participating in research intended to enhance the understanding of student-teacher communication and improve course feedback mechanisms. In the interest of research, you may be exposed to some variations in the service. [HRCF_] does not use student and instructor data for any purpose beyond the [Stanford]'s stated missions of education and research. For purposes of research, we may share information we collect from the student feedback, including Personally Identifiable Information, with researchers beyond [Stanford]. However, your Personally Identifiable Information will only be shared as permitted by applicable law, will be limited to what is necessary to perform the research, and will be subject to an agreement to protect the data. We may also share with the public or third parties aggregated information that does not personally identify you. Similarly, any research findings will be reported at the aggregate level and will not expose your perseonal identity. Please read our Privacy Policy (below) for more information regarding the processing, transmission and use of data collected through the High-Resolution Course Feedback website.  </p>
    <h3> Terms of Service for High-Resolution Course Feedback </h3>
    <p> These Terms of Service govern the High-Resolution Course Feedback website, mycoursefeedback.com ("Site") which is owned by [HRCF] ("[HRCF_]") and operated by [HRCF_]. You should not access or use this Site until you have carefully read and agreed to the following Terms of Service.  </p>
    <h4> Modification to Site and Service </h4>
    <p> The service, including the Site and the Digest service, may contain errors and omissions. We reserve the right to correct errors or omissions without prior notice. We also reserver the right to cancel, discontinue, reschedule, delay, or modify any service. [HRCF] also reserves the right, for any reason or no reason, in our sole discretion and without notice, to terminate, change, suspend, or discontinue any aspect of the Site, including without limitation, information, data, text, features, and/or hours of availability, and we will not be liable to you or to any third party for doing so. We may also impose rules and limits on the use of the Site or restrict your access to part, or the entire, Site without notice or penalty.  </p>
    <h4> Security Rules </h4>
    <p> Violations of system or network security may result in civil or criminal liability. [HRCF_] will investigate occurrences and may involve, and cooperate with, law enforcement authorities in prosecuting the use or users who are involved in such violations. You agree that you will not violate or attempt to violate the securityu of the Site, including without limitation: attacking, probing, scanning or testing the vulnerability of, breaching security of, disrupting, disabling, or harming the Site, or servers or networks connected to the Site using the Site via any automated means, such as a screen-scraper or robot, sending any unsolitcited emails to other Site Users or forging any TCP/IP packet header or any part of the header information in any email displaying the Site within a frame on another website without consent, or place pop-up windows or other disruptive technologies over it accessing data not intended for you or logging into a server or account you are not authorized to access attempting to interfere with service to any user, host or network, including without limitation, via means of submitting a virus to the Site, overloading, "flooding", "Mailbombing" or Crashing impersonating another person or improperly allowing another to use your registration information to access the Site. This is not intended to exclude the use of assistive technology for your own use, such as screen-readers.  </p>
    <h3> Privacy Policy </h3>
    <p> [Stanford] respects your privacy, will use reasonable efforts to keep your Personally Identifiable Information (i.e., information that can be used to identify you) private, and will not share it with third parties, except as otherwise provided in this Privacy Policy, or unless Stanford has a good faith belief that such disclosure is necessary in special cases, such as a physical threat to you or others.  </p>
    <h4> What Information This Privacy Policy Covers </h4>
    <p> In order to access certain features and benefits on our Site, you may need to submit "Personally Identifiable Information". Personally Identifiable Information can include information such as your name and email adress, among other things. You are responsible for ensuring the accuracy of the Personally Identifiable Information you submit to [Stanford]. Inaccurate information may affect your ability to use the Site, the information you receive when using the Site, and our ability to contact you. For example, your email address should be kept current because that is one of the primary means by which we communicate with you.  </p>
    <p> Please note that this Privacyu Policy only applies to information that we collect through the Site and does not apply to information that we may collect from you through other means such as by mail or over the phone.  </p>
    <h4> What You Consent to by Using Our Site </h4>
    <p> Please understand that by submitting any Personally Identifiable Information to us, you consent and agree that Stanford may collect, use and disclose such Personally Identifiable Information in accordance with this Privacy Policy and our Terms of Use, and as permitted or required by law. If you do not agree with these terms, then please do not provide any Personally Identifiable Information to us. If you refuse or withdraw your consent, or if you choose not to provide us with any required Personally Identifiable Information, [Stanford] may not be able to provide you with the services and courses that can be offered on our site.  </p>
    <h4> The Information We Collect </h4>
    <p> We gather the following types of information about users through the Site: </p>
    <p> Cookies. [stanford] </p>
    <p> Personally Identifiable Information. This Privacy Policy serves as notice that [Stanford] collects Personally Identifiable Information in the manner described herein. Such information may include but is not limited to: name, email address, institution, city, country, and IP address. [Stanford] collects Personally Identifiable Information that you provide to us when you sign-up for our service, register your courses and creating course surveys, and respond to surveys through our service, send us email messeages, and/or otherwise contact us. You may also be asked to provide demographic information such as date of birth, gender and vocational information. [Stanford] may also receive Personally Identifiable Information when you access or log-in to a third-party site, e.g., Google, from our Site. This may include the text and/or images of your Personally Identifiable Information available from the third party site. Personally Identifiable Information shall not include any information posted or sent by or to you via any public forum.  </p>
    <h4> Do Not Track </h4>
    <p> We do not use technology that recognizes a "do-not-track" signal from your web browser. </p>
    <h4> How We Use and Share the Information </h4>
    <h3>How We Use and Share the Information</h3>
    <p>Please take some time to familiarize yourself with the different ways Stanford uses and may disclose the information that we gather. We do not share your Personally Identifiable Information with third parties for their direct marketing use.</p>
    <p>Non-Personal Information. Stanford uses Non-Personal Information in aggregate form to build higher quality, more useful services by performing statistical analyses of the collective characteristics and behavior of our users, and by measuring demographics and interests regarding specific areas of our Site. Such aggregate information may include but is not limited to video player interactions, views of posts, views and actions on pages, assessment results and completion rates and assignments. We may share Non-Personal Information with service providers and others to assist us in operating and enhancing our programs and site.</p>
    <p>Personally Identifiable Information. Among other things, Stanford may use the Personally Identifiable Information that you provide to respond to your questions, provide you the specific course and/or services you select, send you updates about online courses offered by Stanford or other Stanford events, and send you email messages about Site maintenance or updates. Except as set forth in this Privacy Policy or as specifically agreed to by you, Stanford will not disclose any Personally Identifiable Information we gather from you on the Site. In addition to the other uses set forth in this Privacy Policy, Stanford may disclose and otherwise use Personally Identifiable Information as described below.</p>
    <p>Updates. We use Personally Identifiable Information collected when you sign-up for our various email or update services to send you the messages in connection with the Site or an online course. Stanford may also archive this information and/or use it for future communications with you.</p>
    <p>Participation in surveys. We use the Personally Identifiable Information, including but not limited to username and email address, that we collect from you when you participate in surveys through the Site for processing purposes, including but not limited to tracking participation. Also, Stanford may archive this information and/or use it for future communications with you. This information may be shared with the content providers or contractors.</p>
    <p>Communications with Stanford. When you send us an email message or otherwise contact us, we may use the information provided by you to respond to your communication and/or as described in this Privacy Policy. We may also archive this information and/or use it for future communications with you.</p>
    <p><strong><span style={{color: 'blue'}}>HERE</span></strong></p>
    <p>Research. We will study course participation to learn how to enhance both our course offerings and the online learning experience. Records of your participation may be used by Stanford for these research studies. Such records may include but will not be limited to: username, email address, home address, IP address, postal code, gender, year of birth and your interactions with the platform such as video player usage, forum posts, actions on class pages, assignments, and assessment results. For purposes of research, we may share information we collect from online learning activities, including Personally Identifiable Information ("PII"), with researchers beyond Stanford. However, your PII will only be shared as permitted by applicable law, will be limited to what is necessary to perform the research and will be subject to an agreement to protect the data. We may also share with the public or third parties aggregated information that does not personally identify you. Similarly, any research findings will be reported at the aggregate level and will not expose your personal identity.</p>
    <p>Third Party Sites. We use the Personally Identifiable Information collected from third party sites for research and teaching purposes. To the extent such Personally Identifiable Information contains images of you; you grant Stanford a limited, non-exclusive right to use, reproduce, distribute, prepare derivative works of or publicly display such images and/or your likeness for educational purposes.</p>
<p>Disclosure to Complete Transactions. We may disclose your Personally Identifiable Information in order to help complete a transaction that you have requested. This may include, for example, disclosure of credit card information to a payment processor.</p>
<p>Disclosure to Stanford Contractors. Our contractors may have limited access to your Personally Identifiable Information in the course of providing products or services to us. These contractors may include vendors and suppliers that provide us with technology, services, marketing assistance, and/or content related to the operation and maintenance of the Site or the online course. Access to your Personally Identifiable Information by these contractors is limited to the information reasonably necessary for the contractor to perform its limited function for us.</p>
<p>Government Authorities, Legal Rights and Actions. Stanford may share your Personally Identifiable Information with various government authorities in response to subpoenas, court orders, or other legal process; to establish or exercise our legal rights or to protect our property, rights or safety or the property, rights or safety of others; to prosecute or to defend against legal claims; or as otherwise required by law or applicable regulations. In such cases Stanford reserves the right to raise or waive any legal objection or right available to us. We also may share your Personally Identifiable Information when Stanford believes it is appropriate to investigate, prevent, or take action regarding illegal or suspected illegal activities; to protect and defend the rights, property, or safety of Stanford, the Site, our users or others; and in connection with our Terms of Use and other agreements.</p>
  </>
)

export default function Terms() {
  return (
    <NavBarContainer>
    <main className={styles.main}>
      <div className="col" style={{
        backgroundColor: "white",
        padding: "0 10px"
      }}>
        <div className={styles.card}>
          <h1 className={styles.center}>
            High-Resolution Course Feedback
          </h1>
          <h3 className={styles.center}>
            Terms of Service
          </h3>
          <hr/>
            <TermsOfService/>
        </div>
      </div>
    </main>
    </NavBarContainer>
  )
}

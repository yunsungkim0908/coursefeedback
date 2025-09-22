'use client'

import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { 
  faCalendarWeek,
  faUsers,
  faBell
} from '@fortawesome/free-solid-svg-icons'

// This component is not currently used but saved for future implementation
export const ActivityOverview = () => {
  return (
    <div className="activity-overview">
      <div className="activity-header">
        <h3>System Status</h3>
        <span className="status-badge live">Live</span>
      </div>
      <div className="activity-grid">
        <div className="activity-card digest">
          <div className="activity-card-icon">
            <FontAwesomeIcon icon={faCalendarWeek} />
          </div>
          <div className="activity-card-content">
            <h4>Weekly Digest</h4>
            <p>Last sent 2 hours ago</p>
            <div className="activity-status success">Active</div>
          </div>
        </div>
        
        <div className="activity-card responses">
          <div className="activity-card-icon">
            <FontAwesomeIcon icon={faUsers} />
          </div>
          <div className="activity-card-content">
            <h4>Survey Responses</h4>
            <p>24 new responses today</p>
            <div className="activity-status info">Collecting</div>
          </div>
        </div>
        
        <div className="activity-card reminders">
          <div className="activity-card-icon">
            <FontAwesomeIcon icon={faBell} />
          </div>
          <div className="activity-card-content">
            <h4>Reminders</h4>
            <p>Next reminder in 2 days</p>
            <div className="activity-status scheduled">Scheduled</div>
          </div>
        </div>
      </div>
    </div>
  );
};
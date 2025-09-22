'use client';

import React from 'react';
import Link from 'next/link';
import { auth } from './firebase';
import Icon from './Icon';
import { faChartLine, faSignOutAlt } from '@fortawesome/free-solid-svg-icons';

const NavBar = ({ breadcrumbs = [] }) => {
  return (
    <nav className="dashboard-nav">
      <div className="nav-container">
        <div className="nav-left">
          <Link href="/dashboard" className="nav-logo">
            <Icon icon={faChartLine} />
            <span>HRCF</span>
          </Link>
          {breadcrumbs.length > 0 && (
            <div className="nav-breadcrumbs">
              {breadcrumbs.map((crumb, index) => (
                <React.Fragment key={index}>
                  <span className="breadcrumb-separator">&gt;</span>
                  {crumb.href ? (
                    <Link href={crumb.href} className="breadcrumb-link">
                      {crumb.label}
                    </Link>
                  ) : (
                    <span className="breadcrumb-current">{crumb.label}</span>
                  )}
                </React.Fragment>
              ))}
            </div>
          )}
        </div>
        <div className="nav-right">
          <div className="user-info">
            <div className="user-details">
              <span className="user-name">{auth.currentUser?.displayName || 'User'}</span>
              <span className="user-email">{auth.currentUser?.email}</span>
            </div>
            <button 
              onClick={() => auth.signOut()}
              className="sign-out-btn"
              title="Sign Out"
            >
              <Icon icon={faSignOutAlt} />
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default NavBar;
'use client';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Suspense } from 'react';

// Icon placeholder that reserves space
const IconPlaceholder = ({ className = '', style = {} }) => (
  <span 
    className={`icon-placeholder ${className}`}
    style={{
      display: 'inline-block',
      width: '1em',
      height: '1em',
      ...style
    }}
  />
);

// Wrapper component that prevents FOUC
const Icon = ({ icon, className = '', style = {}, ...props }) => {
  return (
    <Suspense fallback={<IconPlaceholder className={className} style={style} />}>
      <FontAwesomeIcon 
        icon={icon} 
        className={className}
        style={{
          display: 'inline-block',
          width: '1em',
          height: '1em',
          ...style
        }}
        {...props}
      />
    </Suspense>
  );
};

export default Icon;
import React from 'react';
import { Inbox } from 'lucide-react';

const EmptyState = ({ message = 'No items found', icon }) => {
  return (
    <div className="empty-state">
      <div className="empty-state-icon">
        {icon || (
          <svg
            width="48"
            height="48"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <circle cx="12" cy="12" r="10" />
            <path d="M8 12h8" />
          </svg>
        )}
      </div>
      <p className="empty-state-message">{message}</p>
    </div>
  );
};

export default EmptyState;

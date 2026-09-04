import React from 'react';

const NotificationStack = ({ notifications = [], onDismiss }) => {
  if (!notifications || notifications.length === 0) {
    return null;
  }

  return (
    <div className="notification-stack" aria-live="polite">
      {notifications.map((notification) => {
        const id = notification.id ?? notification._id ?? '1';
        const type = notification.type || 'info';
        const message = notification.message || notification.text || '';

        return (
          <div
            key={id}
            data-testid={`alert-${id}`}
            className={`notification ${type}`}
          >
            <span className="notification-text">{message}</span>
            {onDismiss && (
              <button
                type="button"
                className="notification-close"
                onClick={() => onDismiss(id)}
                aria-label="Dismiss notification"
              >
                &times;
              </button>
            )}
          </div>
        );
      })}
    </div>
  );
};

export default NotificationStack;

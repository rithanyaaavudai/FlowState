import React, { useEffect } from 'react';

const NotificationStack = ({ notifications = [], onDismiss }) => {
  useEffect(() => {
    if (notifications.length === 0) return;

    const timers = notifications.map((notification) => {
      if (notification.duration !== 0) {
        return setTimeout(() => {
          if (onDismiss) {
            onDismiss(notification.id);
          }
        }, notification.duration || 4000);
      }
      return null;
    });

    return () => {
      timers.forEach((t) => t && clearTimeout(t));
    };
  }, [notifications, onDismiss]);

  if (!notifications || notifications.length === 0) {
    return null;
  }

  return (
    <div className="notification-stack">
      {notifications.map((notification) => (
        <div
          key={notification.id}
          className={`notification-toast alert ${notification.type || 'info'}`}
        >
          <span className="notification-message">{notification.message}</span>
          <button
            type="button"
            className="notification-dismiss"
            onClick={() => onDismiss && onDismiss(notification.id)}
          >
            &times;
          </button>
        </div>
      ))}
    </div>
  );
};

export default NotificationStack;

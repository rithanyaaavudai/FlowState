import React, { useEffect, useState } from 'react';

const NotificationStack = ({ notifications = [], onDismiss }) => {
  const [activeList, setActiveList] = useState(notifications);

  useEffect(() => {
    setActiveList(notifications);
  }, [notifications]);

  const handleDismiss = (id) => {
    if (onDismiss) {
      onDismiss(id);
    } else {
      setActiveList((prev) => prev.filter((n) => (n.id ?? n._id) !== id));
    }
  };

  useEffect(() => {
    if (activeList.length === 0) return;

    const timer = setTimeout(() => {
      setActiveList((prev) => {
        if (prev.length > 0) {
          const dismissedId = prev[0].id ?? prev[0]._id;
          if (onDismiss) onDismiss(dismissedId);
          return prev.slice(1);
        }
        return prev;
      });
    }, 4000);

    return () => clearTimeout(timer);
  }, [activeList, onDismiss]);

  if (!activeList || activeList.length === 0) {
    return null;
  }

  return (
    <div className="notification-stack" aria-live="polite">
      {activeList.map((notification) => {
        const id = notification.id ?? notification._id ?? Math.random().toString();
        const type = notification.type || 'info';
        const message = notification.message || notification.text || '';

        return (
          <div
            key={id}
            data-testid={`alert-${id}`}
            className={`notification ${type}`}
          >
            <span className="notification-text">{message}</span>
            <button
              type="button"
              className="notification-close"
              onClick={() => handleDismiss(id)}
              aria-label="Dismiss notification"
            >
              &times;
            </button>
          </div>
        );
      })}
    </div>
  );
};

export default NotificationStack;

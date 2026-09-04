import React, { useEffect, useState } from 'react';

const DEFAULT_NOTIFICATIONS = [];

const NotificationStack = ({ notifications = DEFAULT_NOTIFICATIONS, onDismiss }) => {
  const [activeList, setActiveList] = useState(notifications);
  const onDismissRef = React.useRef(onDismiss);

  useEffect(() => {
    onDismissRef.current = onDismiss;
  }, [onDismiss]);

  useEffect(() => {
    setActiveList((prev) => {
      if (prev === notifications) return prev;
      if (
        Array.isArray(prev) &&
        Array.isArray(notifications) &&
        prev.length === notifications.length &&
        prev.every((item, idx) => item === notifications[idx])
      ) {
        return prev;
      }
      return Array.isArray(notifications) ? notifications : DEFAULT_NOTIFICATIONS;
    });
  }, [notifications]);

  const handleDismiss = (id) => {
    if (onDismissRef.current) {
      onDismissRef.current(id);
    }
    setActiveList((prev) => prev.filter((n) => (n.id ?? n._id) !== id));
  };

  useEffect(() => {
    if (!activeList || activeList.length === 0) return;

    const timer = setTimeout(() => {
      setActiveList((prev) => {
        if (prev.length > 0) {
          const dismissedId = prev[0].id ?? prev[0]._id;
          if (onDismissRef.current) onDismissRef.current(dismissedId);
          return prev.slice(1);
        }
        return prev;
      });
    }, 4000);

    return () => clearTimeout(timer);
  }, [activeList]);

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

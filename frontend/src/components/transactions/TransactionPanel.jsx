import React, { useState, useRef } from 'react';
import TransactionForm from './TransactionForm';

const TransactionPanel = ({ onTransactionCreated }) => {
  const [isOpen, setIsOpen] = useState(false);
  const panelRef = useRef(null);

  const togglePanel = () => {
    const nextState = !isOpen;
    setIsOpen(nextState);

    if (nextState) {
      setTimeout(() => {
        if (panelRef.current) {
          panelRef.current.scrollIntoView({
            behavior: 'smooth',
            block: 'start',
          });
        }
      }, 50);
    }
  };

  const handleCreated = (data) => {
    if (onTransactionCreated) {
      onTransactionCreated(data);
    }
  };

  return (
    <div className="transaction-panel-container">
      <div className="panel-toggle-wrapper">
        <button
          type="button"
          className="primary-btn initiate-btn action-cta-btn"
          onClick={togglePanel}
        >
          {isOpen ? 'Close Transaction Panel' : 'Initiate Transaction'}
        </button>
      </div>

      {isOpen && (
        <div ref={panelRef} className="transaction-panel-body">
          <TransactionForm onTransactionCreated={handleCreated} />
        </div>
      )}
    </div>
  );
};

export default TransactionPanel;

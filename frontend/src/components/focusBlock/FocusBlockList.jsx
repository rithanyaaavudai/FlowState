import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import {
  fetchMineBlocks,
  protectBlock,
  unprotectBlock,
  deleteBlock,
} from '../../store/slices/focusBlockSlice';
import FocusBlockForm from './FocusBlockForm';

const DAYS = [
  { name: 'Monday', key: 'MONDAY' },
  { name: 'Tuesday', key: 'TUESDAY' },
  { name: 'Wednesday', key: 'WEDNESDAY' },
  { name: 'Thursday', key: 'THURSDAY' },
  { name: 'Friday', key: 'FRIDAY' },
  { name: 'Saturday', key: 'SATURDAY' },
  { name: 'Sunday', key: 'SUNDAY' },
];

const FocusBlockList = () => {
  const dispatch = useDispatch();
  const { items, loading, error } = useSelector((state) => state.focusBlocks);
  const [isFormOpen, setIsFormOpen] = useState(false);

  useEffect(() => {
    dispatch(fetchMineBlocks());
  }, [dispatch]);

  const handleProtect = (id) => {
    dispatch(protectBlock(id));
  };

  const handleUnprotect = (id) => {
    dispatch(unprotectBlock(id));
  };

  const handleDelete = (id) => {
    const confirmed = window.confirm('Are you sure you want to delete this block?');
    if (confirmed) {
      dispatch(deleteBlock(id));
    }
  };

  const getBlocksForDay = (dayKey) => {
    return (items || []).filter(
      (b) => b.dayOfWeek === dayKey || b.day === dayKey
    );
  };

  return (
    <div className="page-container focus-block-page">
      <div className="page-header">
        <h2>Weekly Focus Blocks</h2>
        <button
          className="btn primary-btn"
          onClick={() => setIsFormOpen(true)}
        >
          + Add Block
        </button>
      </div>

      {error && <div className="error-banner">{error}</div>}

      {loading ? (
        <div className="loading-spinner">Loading focus blocks...</div>
      ) : (
        <div className="weekly-blocks-grid">
          {DAYS.map((day) => {
            const dayBlocks = getBlocksForDay(day.key);
            return (
              <div key={day.key} className="day-block-card">
                <div className="day-header">
                  <h3>{day.name}</h3>
                </div>

                <div className="day-content">
                  {dayBlocks.length === 0 ? (
                    <div className="empty-day">No blocks</div>
                  ) : (
                    dayBlocks.map((block) => (
                      <div
                        key={block.id}
                        className={`block-item ${block.protected ? 'is-protected' : ''}`}
                      >
                        <div className="block-time">
                          {block.startTime} - {block.endTime}
                        </div>
                        {block.preferredSessionType && (
                          <div className="block-type">
                            {block.preferredSessionType.replace('_', ' ')}
                          </div>
                        )}
                        <div className="block-status">
                          {block.protected ? 'Protected' : 'Standard'}
                        </div>
                        <div className="block-actions">
                          {block.protected ? (
                            <button
                              className="btn action-btn unprotect-btn"
                              onClick={() => handleUnprotect(block.id)}
                            >
                              Unprotect
                            </button>
                          ) : (
                            <button
                              className="btn action-btn protect-btn"
                              onClick={() => handleProtect(block.id)}
                            >
                              Protect
                            </button>
                          )}
                          <button
                            className="btn action-btn delete-btn"
                            onClick={() => handleDelete(block.id)}
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {isFormOpen && (
        <FocusBlockForm
          onClose={() => {
            setIsFormOpen(false);
            dispatch(fetchMineBlocks());
          }}
        />
      )}
    </div>
  );
};

export default FocusBlockList;

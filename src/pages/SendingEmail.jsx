// SendingEmail.jsx
import React, { useState, useEffect, useRef } from 'react';
import api from '../services/api';
import { 
  FaEnvelope, 
  FaUser, 
  FaHeading, 
  FaUsers, 
  FaChevronDown, 
  FaSearch, 
  FaCheckSquare, 
  FaSquare, 
  FaTimes, 
  FaPen, 
  FaEye, 
  FaPaperPlane, 
  FaSpinner, 
  FaCheckCircle, 
  FaExclamationCircle 
} from 'react-icons/fa';
import '../css/SendingEmail.css';

// ========== SEARCHABLE MULTI-SELECT COMPONENT ==========
const UserMultiSelect = ({ users, selectedEmails, onChange, disabled }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const dropdownRef = useRef(null);

  const filteredUsers = users.filter(user =>
    (user.displayName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (user.email || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  const selectedUsers = users.filter(u => selectedEmails.includes(u.email));

  const toggleUser = (email) => {
    if (disabled) return;
    const newSelected = selectedEmails.includes(email)
      ? selectedEmails.filter(e => e !== email)
      : [...selectedEmails, email];
    onChange(newSelected);
  };

  const selectAllFiltered = () => {
    if (disabled) return;
    const filteredEmails = filteredUsers.map(u => u.email);
    const otherSelected = selectedEmails.filter(email => !filteredUsers.find(u => u.email === email));
    onChange([...otherSelected, ...filteredEmails]);
  };

  const clearAllFiltered = () => {
    if (disabled) return;
    const filteredEmails = new Set(filteredUsers.map(u => u.email));
    onChange(selectedEmails.filter(email => !filteredEmails.has(email)));
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="f2m-multiselect" ref={dropdownRef} data-disabled={disabled}>
      <div 
        className="f2m-multiselect__trigger"
        onClick={() => !disabled && setIsOpen(!isOpen)}
      >
        <div className="f2m-multiselect__selected">
          {selectedUsers.length === 0 ? (
            <span className="f2m-multiselect__placeholder">Select recipients...</span>
          ) : (
            <div className="f2m-multiselect__tags">
              {selectedUsers.slice(0, 3).map(u => (
                <span key={u._id} className="f2m-multiselect__tag">
                  {u.displayName || u.email.split('@')[0]}
                  <button
                    className="f2m-multiselect__tag-remove"
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleUser(u.email);
                    }}
                  >
                    <FaTimes />
                  </button>
                </span>
              ))}
              {selectedUsers.length > 3 && (
                <span className="f2m-multiselect__more">
                  +{selectedUsers.length - 3} more
                </span>
              )}
            </div>
          )}
        </div>
        <FaChevronDown className={`f2m-multiselect__arrow ${isOpen ? 'f2m-rotate' : ''}`} />
      </div>

      {isOpen && !disabled && (
        <div className="f2m-multiselect__dropdown">
          <div className="f2m-multiselect__search">
            <FaSearch />
            <input
              type="text"
              placeholder="Search users..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              autoFocus
            />
          </div>
          
          <div className="f2m-multiselect__actions">
            <button type="button" onClick={selectAllFiltered} className="f2m-multiselect__action-btn">
              Select all
            </button>
            <button type="button" onClick={clearAllFiltered} className="f2m-multiselect__action-btn">
              Clear
            </button>
          </div>

          <div className="f2m-multiselect__list">
            {filteredUsers.length === 0 ? (
              <div className="f2m-multiselect__empty">No users found</div>
            ) : (
              filteredUsers.map(user => (
                <div
                  key={user._id}
                  className={`f2m-multiselect__option ${selectedEmails.includes(user.email) ? 'f2m-selected' : ''}`}
                  onClick={() => toggleUser(user.email)}
                >
                  <div className="f2m-multiselect__checkbox">
                    {selectedEmails.includes(user.email) ? <FaCheckSquare /> : <FaSquare />}
                  </div>
                  <div className="f2m-multiselect__user-info">
                    <span className="f2m-multiselect__user-name">{user.displayName || user.email.split('@')[0]}</span>
                    <span className="f2m-multiselect__user-email">{user.email}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};

// ========== PREVIEW MODAL COMPONENT ==========
const PreviewModal = ({ isOpen, onClose, emailData }) => {
  if (!isOpen) return null;

  return (
    <div className="f2m-modal-overlay" onClick={onClose}>
      <div className="f2m-modal" onClick={(e) => e.stopPropagation()}>
        <div className="f2m-modal__header">
          <h3>Email Preview</h3>
          <button className="f2m-modal__close" onClick={onClose}>
            <FaTimes />
          </button>
        </div>
        <div className="f2m-modal__content">
          <div className="f2m-preview-item">
            <span className="f2m-preview-label">From:</span>
            <span className="f2m-preview-value">{emailData.senderName}</span>
          </div>
          <div className="f2m-preview-item">
            <span className="f2m-preview-label">Subject:</span>
            <span className="f2m-preview-value">{emailData.subject}</span>
          </div>
          <div className="f2m-preview-item">
            <span className="f2m-preview-label">To:</span>
            <span className="f2m-preview-value">{emailData.recipientSummary}</span>
          </div>
          <div className="f2m-preview-divider"></div>
          <div className="f2m-preview-body" style={{ whiteSpace: 'pre-wrap' }}>
            {emailData.body}
          </div>
        </div>
        <div className="f2m-modal__footer">
          <button className="f2m-btn f2m-btn-secondary" onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

// ========== MAIN COMPONENT ==========
const SendingEmail = () => {
  // Users list from backend
  const [users, setUsers] = useState([]);
  
  // Form state
  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('');
  const [senderName, setSenderName] = useState('Farm2Meat');
  
  // Recipient state
  const [sendToAll, setSendToAll] = useState(false);
  const [selectedEmails, setSelectedEmails] = useState([]);
  
  // UI state
  const [isLoading, setIsLoading] = useState(false);
  const [isFetchingUsers, setIsFetchingUsers] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [showError, setShowError] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [showPreview, setShowPreview] = useState(false);
  const [touchedFields, setTouchedFields] = useState({ subject: false, body: false });

  // Fetch users on mount
  useEffect(() => {
    const fetchUsers = async () => {
      setIsFetchingUsers(true);
      try {
        const res = await api.get('/api/users?limit=1000');
        if (res.data?.success) {
          setUsers(res.data.data || []);
        }
      } catch (err) {
        console.error('Failed to fetch users:', err);
        setErrorMessage('Failed to load user list');
        setShowError(true);
      } finally {
        setIsFetchingUsers(false);
      }
    };
    fetchUsers();
  }, []);

  // Validation
  const isFormValid = subject.trim() !== '' && body.trim() !== '' && 
    (sendToAll || selectedEmails.length > 0);

  // Clear success/error messages after timeout
  useEffect(() => {
    if (showSuccess) {
      const timer = setTimeout(() => setShowSuccess(false), 5000);
      return () => clearTimeout(timer);
    }
  }, [showSuccess]);

  useEffect(() => {
    if (showError) {
      const timer = setTimeout(() => setShowError(false), 5000);
      return () => clearTimeout(timer);
    }
  }, [showError]);

  // Handle field blur for validation highlighting
  const handleFieldBlur = (field) => {
    setTouchedFields(prev => ({ ...prev, [field]: true }));
  };

  // Get recipient summary for preview
  const getRecipientSummary = () => {
    if (sendToAll) return 'All Verified Users';
    if (selectedEmails.length === 0) return 'No recipients selected';
    
    const selected = users.filter(u => selectedEmails.includes(u.email));
    if (selected.length === 0) return selectedEmails.join(', '); // Fallback
    
    if (selected.length <= 3) {
      return selected.map(u => u.displayName || u.email.split('@')[0]).join(', ');
    }
    return `${selected.slice(0, 3).map(u => u.displayName || u.email.split('@')[0]).join(', ')} and ${selected.length - 3} more`;
  };

  // Handle send email
  const handleSendEmail = async () => {
    // Validation
    if (!subject.trim()) {
      setErrorMessage('Please enter an email subject');
      setShowError(true);
      setTouchedFields(prev => ({ ...prev, subject: true }));
      return;
    }
    if (!body.trim()) {
      setErrorMessage('Please enter an email message');
      setShowError(true);
      setTouchedFields(prev => ({ ...prev, body: true }));
      return;
    }
    if (!sendToAll && selectedEmails.length === 0) {
      setErrorMessage('Please select at least one recipient');
      setShowError(true);
      return;
    }

    setIsLoading(true);
    setShowError(false);
    
    try {
      const res = await api.post('/api/users/send-email', {
        subject,
        message: body,
        sendToAll,
        selectedUsers: sendToAll ? [] : selectedEmails
      });
      
      if (res.data?.success) {
        setShowSuccess(true);
        // Reset form
        setSubject('');
        setBody('');
        setSelectedEmails([]);
        setSendToAll(false);
        setTouchedFields({ subject: false, body: false });
      } else {
        throw new Error(res.data?.message || 'Failed to send emails');
      }
    } catch (err) {
      console.error('Send email error:', err);
      setErrorMessage(err.response?.data?.message || err.message || 'Failed to send emails');
      setShowError(true);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle preview
  const handlePreview = () => {
    if (!isFormValid) {
      setErrorMessage('Please fill in all required fields to preview');
      setShowError(true);
      return;
    }
    setShowPreview(true);
  };

  // Handle send to all toggle
  const handleSendToAllChange = (e) => {
    setSendToAll(e.target.checked);
    if (e.target.checked) {
      setSelectedEmails([]);
    }
  };

  return (
    <div className="f2m-admin-email-panel">
      {/* Success Message */}
      {showSuccess && (
        <div className="f2m-alert f2m-alert-success">
          <FaCheckCircle />
          <span>Emails are being sent successfully!</span>
          <button className="f2m-alert-close" onClick={() => setShowSuccess(false)}>
            <FaTimes />
          </button>
        </div>
      )}

      {/* Error Message */}
      {showError && (
        <div className="f2m-alert f2m-alert-error">
          <FaExclamationCircle />
          <span>{errorMessage}</span>
          <button className="f2m-alert-close" onClick={() => setShowError(false)}>
            <FaTimes />
          </button>
        </div>
      )}

      {/* Main Card */}
      <div className="f2m-card">
        <div className="f2m-card__header">
          <div className="f2m-card__header-icon">
            <FaEnvelope />
          </div>
          <h2 className="f2m-card__title">Compose Email</h2>
          <p className="f2m-card__subtitle">Send messages to your users</p>
        </div>

        <div className="f2m-card__body">
          {/* Sender Name Field */}
          <div className="f2m-form-group">
            <label className="f2m-form-label" htmlFor="senderName">
              <FaUser />
              Sender Name
            </label>
            <input
              id="senderName"
              type="text"
              className="f2m-form-control"
              value={senderName}
              onChange={(e) => setSenderName(e.target.value)}
              placeholder="Farm2Meat"
              disabled
            />
          </div>

          {/* Subject Field */}
          <div className="f2m-form-group">
            <label className="f2m-form-label f2m-required" htmlFor="subject">
              <FaHeading />
              Email Subject
            </label>
            <input
              id="subject"
              type="text"
              className={`f2m-form-control ${touchedFields.subject && !subject.trim() ? 'f2m-error' : ''}`}
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              onBlur={() => handleFieldBlur('subject')}
              placeholder="Enter email subject..."
            />
            {touchedFields.subject && !subject.trim() && (
              <span className="f2m-form-error">Subject is required</span>
            )}
          </div>

          {/* Recipient Selection */}
          <div className="f2m-form-group">
            <label className="f2m-form-label">
              <FaUsers />
              Recipients
            </label>
            
            {/* Send to All Toggle */}
            <div className="f2m-checkbox-wrapper">
              <label className="f2m-checkbox">
                <input
                  type="checkbox"
                  checked={sendToAll}
                  onChange={handleSendToAllChange}
                />
                <span className="f2m-checkbox__custom"></span>
                <span className="f2m-checkbox__label">Send to All Verified Users</span>
              </label>
            </div>

            {/* Multi-select for specific users */}
            {!sendToAll && (
              <div className="f2m-multiselect-wrapper">
                {isFetchingUsers ? (
                  <div className="f2m-loading-users">
                    <FaSpinner className="fa-spin" /> Loading users...
                  </div>
                ) : (
                  <UserMultiSelect
                    users={users}
                    selectedEmails={selectedEmails}
                    onChange={setSelectedEmails}
                    disabled={sendToAll}
                  />
                )}
              </div>
            )}
          </div>

          {/* Message Body */}
          <div className="f2m-form-group">
            <label className="f2m-form-label f2m-required" htmlFor="body">
              <FaPen />
              Message
            </label>
            <textarea
              id="body"
              className={`f2m-form-control f2m-textarea ${touchedFields.body && !body.trim() ? 'f2m-error' : ''}`}
              value={body}
              onChange={(e) => setBody(e.target.value)}
              onBlur={() => handleFieldBlur('body')}
              placeholder="Write your message here..."
              rows="8"
            />
            {touchedFields.body && !body.trim() && (
              <span className="f2m-form-error">Message is required</span>
            )}
          </div>
        </div>

        {/* Card Footer with Actions */}
        <div className="f2m-card__footer">
          <button
            className="f2m-btn f2m-btn-secondary"
            onClick={handlePreview}
            disabled={!isFormValid}
          >
            <FaEye />
            Preview
          </button>
          <button
            className="f2m-btn f2m-btn-primary"
            onClick={handleSendEmail}
            disabled={!isFormValid || isLoading}
          >
            {isLoading ? (
              <>
                <FaSpinner className="fa-spin" />
                Sending...
              </>
            ) : (
              <>
                <FaPaperPlane />
                Send Email
              </>
            )}
          </button>
        </div>
      </div>

      {/* Preview Modal */}
      <PreviewModal
        isOpen={showPreview}
        onClose={() => setShowPreview(false)}
        emailData={{
          senderName,
          subject,
          body,
          recipientSummary: getRecipientSummary()
        }}
      />
    </div>
  );
};

export default SendingEmail;


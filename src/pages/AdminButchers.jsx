import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus, faTrash, faCheckCircle, faSpinner, faExclamationTriangle } from '@fortawesome/free-solid-svg-icons';
import { butcherService } from '../services/butcherService';
import { useAuth } from '../contexts/authContextCore';
import '../css/AdminButchers.css';
import { useAdminLiveRefresh } from '../hooks/useAdminLiveRefresh'

const AdminButchers = () => {
  const { token } = useAuth();
  const [butchers, setButchers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isAdding, setIsAdding] = useState(false);
  const [butcherImageFile, setButcherImageFile] = useState(null);
  const [newButcher, setNewButcher] = useState({
    name: '',
    phone: '',
    location: 'Rahim Yar Khan',
    isVerified: false
  });

  const fetchButchers = React.useCallback(async () => {
    setLoading(true);
    const response = await butcherService.getAllButchers();
    if (response.success && Array.isArray(response.data)) {
      setButchers(response.data);
    } else {
      setError(response.message || 'Failed to load butchers');
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    const t = setTimeout(() => {
      fetchButchers();
    }, 0);
    return () => clearTimeout(t);
  }, [fetchButchers]);

  useAdminLiveRefresh(fetchButchers, { intervalMs: 10000, enabled: true })

  const handleAddButcher = async (e) => {
    e.preventDefault();
    if (!newButcher.name || !newButcher.phone) {
      alert('Name and Phone are required');
      return;
    }

    const formData = new FormData();
    formData.append('name', newButcher.name);
    formData.append('phone', newButcher.phone);
    formData.append('location', newButcher.location || '');
    formData.append('isVerified', String(newButcher.isVerified));
    if (butcherImageFile) {
      formData.append('image', butcherImageFile);
    }

    const response = await butcherService.createButcher(formData, token);
    if (response.success && response.data) {
      setButchers([response.data, ...butchers]);
      setNewButcher({
        name: '',
        phone: '',
        location: 'Rahim Yar Khan',
        isVerified: false
      });
      setButcherImageFile(null);
      setIsAdding(false);
    } else {
      alert(response.message || 'Failed to add butcher');
    }
  };

  const handleDeleteButcher = async (id) => {
    if (!window.confirm('Are you sure you want to delete this butcher?')) return;

    const response = await butcherService.deleteButcher(id, token);
    if (response.success) {
      setButchers(butchers.filter(b => b._id !== id));
    } else {
      alert(response.message || 'Failed to delete butcher');
    }
  };

  return (
    <div className="admin-butchers">
      <div className="admin-header">
        <h1 className="admin-title">Manage Butchers</h1>
        <button className="btn-add" onClick={() => setIsAdding(!isAdding)}>
          <FontAwesomeIcon icon={isAdding ? faSpinner : faPlus} spin={isAdding && loading} />
          {isAdding ? 'Cancel' : 'Add New Butcher'}
        </button>
      </div>

      {isAdding && (
        <form className="add-butcher-form" onSubmit={handleAddButcher}>
          <div className="form-group">
            <label>Name*</label>
            <input 
              type="text" 
              placeholder="Butcher Name" 
              value={newButcher.name}
              onChange={(e) => setNewButcher({...newButcher, name: e.target.value})}
              required
            />
          </div>
          <div className="form-group">
            <label>Phone*</label>
            <input 
              type="text" 
              placeholder="03XXXXXXXXX" 
              value={newButcher.phone}
              onChange={(e) => setNewButcher({...newButcher, phone: e.target.value})}
              required
            />
          </div>
          <div className="form-group">
            <label>Location</label>
            <input 
              type="text" 
              placeholder="e.g. Rahim Yar Khan" 
              value={newButcher.location}
              onChange={(e) => setNewButcher({...newButcher, location: e.target.value})}
            />
          </div>
          <div className="form-group">
            <label>Butcher Image (Optional)</label>
            <input
              type="file"
              accept=".jpg,.jpeg,.png,.webp,image/jpeg,image/png,image/webp"
              onChange={(e) => setButcherImageFile(e.target.files && e.target.files[0] ? e.target.files[0] : null)}
            />
          </div>
          <div className="form-group-checkbox">
            <label>
              <input 
                type="checkbox" 
                checked={newButcher.isVerified}
                onChange={(e) => setNewButcher({...newButcher, isVerified: e.target.checked})}
              />
              Verified Professional
            </label>
          </div>
          <button type="submit" className="btn-submit">Save Butcher</button>
        </form>
      )}

      {loading ? (
        <div className="loading-state">
          <FontAwesomeIcon icon={faSpinner} spin className="spinner-icon" />
          <p>Loading butchers...</p>
        </div>
      ) : error ? (
        <div className="error-state">
          <FontAwesomeIcon icon={faExclamationTriangle} className="error-icon" />
          <p>{error}</p>
          <button onClick={fetchButchers} className="btn-retry">Retry</button>
        </div>
      ) : butchers.length === 0 ? (
        <div className="empty-state">
          <p>No butchers found. Add your first butcher to display them on the website.</p>
        </div>
      ) : (
        <div className="butchers-table-wrapper">
          <table className="butchers-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Phone</th>
                <th>Location</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {butchers.map((butcher) => (
                <tr key={butcher._id}>
                  <td>
                    <div className="butcher-name-cell">
                      <div className="butcher-avatar-small">
                        {butcher.name.charAt(0).toUpperCase()}
                      </div>
                      {butcher.name}
                    </div>
                  </td>
                  <td>{butcher.phone}</td>
                  <td>{butcher.location}</td>
                  <td>
                    {butcher.isVerified ? (
                      <span className="badge-verified">
                        <FontAwesomeIcon icon={faCheckCircle} /> Verified
                      </span>
                    ) : (
                      <span className="badge-unverified">Unverified</span>
                    )}
                  </td>
                  <td>
                    <button className="btn-delete" onClick={() => handleDeleteButcher(butcher._id)}>
                      <FontAwesomeIcon icon={faTrash} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default AdminButchers;

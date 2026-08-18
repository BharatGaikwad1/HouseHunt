import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth, API_URL } from '../context/AuthContext';
import DashboardStats from '../components/DashboardStats';

const Dashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  // Active Tab state
  // If admin, default to 'moderation'. If user, default to 'customer'.
  const [activeTab, setActiveTab] = useState(user?.role === 'admin' ? 'moderation' : 'customer');

  // Customer states
  const [customerBookings, setCustomerBookings] = useState([]);
  const [loadingCustomer, setLoadingCustomer] = useState(false);

  // Landlord states
  const [landlordProperties, setLandlordProperties] = useState([]);
  const [landlordBookings, setLandlordBookings] = useState([]);
  const [loadingLandlord, setLoadingLandlord] = useState(false);

  // Create Listing form state
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState('');
  const [price, setPrice] = useState('');
  const [type, setType] = useState('apartment');
  const [amenitiesInput, setAmenitiesInput] = useState('');
  const [image, setImage] = useState('');
  const [formSuccess, setFormSuccess] = useState('');
  const [formError, setFormError] = useState('');
  const [formLoading, setFormLoading] = useState(false);

  // Edit mode states
  const [isEditMode, setIsEditMode] = useState(false);
  const [editingProperty, setEditingProperty] = useState(null);
  
  // Dashboard global error state
  const [dashboardError, setDashboardError] = useState('');

  // Admin states
  const [pendingProperties, setPendingProperties] = useState([]);
  const [allProperties, setAllProperties] = useState([]);
  const [adminPropertiesFilter, setAdminPropertiesFilter] = useState('pending'); // 'pending' or 'all'
  const [loadingAdmin, setLoadingAdmin] = useState(false);

  // Fetch functions
  const fetchCustomerData = async () => {
    if (!user || user.role === 'admin') return;
    setLoadingCustomer(true);
    try {
      const res = await axios.get(`${API_URL}/bookings/my`, {
        headers: { Authorization: `Bearer ${user.token}` },
      });
      setCustomerBookings(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingCustomer(false);
    }
  };

  const fetchLandlordData = async () => {
    if (!user || user.role === 'admin') return;
    setLoadingLandlord(true);
    try {
      // 1. Fetch properties owned by user (passing owner filter)
      const resProp = await axios.get(`${API_URL}/properties?owner=${user._id}`, {
        headers: { Authorization: `Bearer ${user.token}` },
      });
      setLandlordProperties(resProp.data);

      // 2. Fetch bookings for landlord's properties
      const resBook = await axios.get(`${API_URL}/bookings/landlord`, {
        headers: { Authorization: `Bearer ${user.token}` },
      });
      setLandlordBookings(resBook.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingLandlord(false);
    }
  };

  const fetchAdminData = async () => {
    if (!user || user.role !== 'admin') return;
    setLoadingAdmin(true);
    try {
      // Fetch based on filter
      let url = `${API_URL}/properties`;
      if (adminPropertiesFilter === 'pending') {
        url += '?status=pending';
      } else {
        // Fetch all (pending, approved, rejected)
        url += '?status=all';
      }
      
      const res = await axios.get(url, {
        headers: { Authorization: `Bearer ${user.token}` },
      });
      setPendingProperties(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingAdmin(false);
    }
  };

  // Run initial fetch on mount and when tab/filter changes
  useEffect(() => {
    if (!user) return;
    if (activeTab === 'customer') {
      fetchCustomerData();
    } else if (activeTab === 'landlord') {
      fetchLandlordData();
    } else if (activeTab === 'moderation') {
      fetchAdminData();
    }
  }, [activeTab, adminPropertiesFilter, user]);

  // Handle Cancel Booking (Customer or Landlord)
  const handleCancelBooking = async (bookingId) => {
    if (!window.confirm('Are you sure you want to cancel this booking?')) return;
    try {
      await axios.patch(
        `${API_URL}/bookings/${bookingId}/status`,
        { status: 'cancelled' },
        { headers: { Authorization: `Bearer ${user.token}` } }
      );
      // Re-fetch active view data
      if (activeTab === 'customer') fetchCustomerData();
      if (activeTab === 'landlord') fetchLandlordData();
    } catch (err) {
      setDashboardError(err.response?.data?.message || 'Failed to cancel booking');
    }
  };

  // Handle Delete Property (Landlord)
  const handleDeleteProperty = async (propertyId) => {
    if (!window.confirm('Are you sure you want to remove this property listing permanently?')) return;
    try {
      await axios.delete(`${API_URL}/properties/${propertyId}`, {
        headers: { Authorization: `Bearer ${user.token}` },
      });
      fetchLandlordData();
    } catch (err) {
      setDashboardError(err.response?.data?.message || 'Failed to delete listing');
    }
  };

  const handleEditClick = (property) => {
    setIsEditMode(true);
    setEditingProperty(property);
    
    // Fill fields
    setTitle(property.title);
    setDescription(property.description);
    setLocation(property.location);
    setPrice(property.price);
    setType(property.type);
    setAmenitiesInput(property.amenities.join(', '));
    setImage(property.image || '');
    
    // Scroll to form
    const formElement = document.getElementById('listingFormCard');
    if (formElement) {
      formElement.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleCancelEdit = () => {
    setIsEditMode(false);
    setEditingProperty(null);
    
    // Clear fields
    setTitle('');
    setDescription('');
    setLocation('');
    setPrice('');
    setType('apartment');
    setAmenitiesInput('');
    setImage('');
    setFormError('');
    setFormSuccess('');
  };

  // Handle Create/Update Property Submit
  const handleCreateProperty = async (e) => {
    e.preventDefault();
    setFormError('');
    setFormSuccess('');

    if (!title || !description || !location || !price) {
      setFormError('Please fill in all required fields.');
      return;
    }

    setFormLoading(true);

    // Split amenities by comma and clean whitespace
    const amenities = amenitiesInput
      ? amenitiesInput.split(',').map((item) => item.trim()).filter((item) => item !== '')
      : [];

    const defaultImg = 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&w=800&q=80';

    try {
      if (isEditMode) {
        await axios.put(
          `${API_URL}/properties/${editingProperty._id}`,
          {
            title,
            description,
            location,
            price: Number(price),
            type,
            amenities,
            image: image || defaultImg,
          },
          {
            headers: { Authorization: `Bearer ${user.token}` },
          }
        );
        setFormSuccess('Property listing updated successfully! It has been returned to the queue for admin review.');
        handleCancelEdit();
      } else {
        await axios.post(
          `${API_URL}/properties`,
          {
            title,
            description,
            location,
            price: Number(price),
            type,
            amenities,
            image: image || defaultImg,
          },
          {
            headers: { Authorization: `Bearer ${user.token}` },
          }
        );
        setFormSuccess('Property listing created successfully! An administrator will review it shortly.');
        
        // Reset form fields
        setTitle('');
        setDescription('');
        setLocation('');
        setPrice('');
        setType('apartment');
        setAmenitiesInput('');
        setImage('');
      }

      // Refresh landlord properties
      fetchLandlordData();
    } catch (err) {
      console.error(err);
      setFormError(err.response?.data?.message || 'Failed to process listing.');
    } finally {
      setFormLoading(false);
    }
  };

  // Handle Admin Moderation (Approve/Reject)
  const handleModerateProperty = async (propertyId, status) => {
    try {
      await axios.patch(
        `${API_URL}/properties/${propertyId}/approve`,
        { status },
        { headers: { Authorization: `Bearer ${user.token}` } }
      );
      fetchAdminData();
    } catch (err) {
      setDashboardError(err.response?.data?.message || 'Failed to update property status');
    }
  };

  return (
    <div className="container py-5 animate-fade-in">
      {dashboardError && (
        <div className="alert alert-danger alert-dismissible fade show border-0 small mb-4" role="alert">
          {dashboardError}
          <button type="button" className="btn-close" onClick={() => setDashboardError('')}></button>
        </div>
      )}
      <div className="row mb-5">
        <div className="col-12">
          <div className="card glass-card p-4 d-flex flex-md-row justify-content-between align-items-center gap-3">
            <div>
              <h2 className="fw-bold mb-1">Welcome, {user?.name}!</h2>
              <p className="text-muted mb-0">Manage your rental bookings, properties, and listings from this panel.</p>
            </div>
            <div className="d-flex align-items-center gap-2">
              <span className="badge bg-primary text-white text-uppercase py-2 px-3 fs-7">
                Role: {user?.role}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <ul className="nav nav-pills mb-4 gap-2 border-bottom pb-3" id="dashboardTabs">
        {user?.role === 'user' && (
          <>
            <li className="nav-item">
              <button
                className={`btn rounded-pill px-4 py-2 fw-bold ${activeTab === 'customer' ? 'btn-premium-primary' : 'btn-light text-muted'}`}
                onClick={() => setActiveTab('customer')}
              >
                <i className="bi bi-calendar-check me-2"></i> My Bookings
              </button>
            </li>
            <li className="nav-item">
              <button
                className={`btn rounded-pill px-4 py-2 fw-bold ${activeTab === 'landlord' ? 'btn-premium-primary' : 'btn-light text-muted'}`}
                onClick={() => setActiveTab('landlord')}
              >
                <i className="bi bi-house-door me-2"></i> My Listed Properties
              </button>
            </li>
          </>
        )}
        {user?.role === 'admin' && (
          <li className="nav-item">
            <button
              className={`btn rounded-pill px-4 py-2 fw-bold ${activeTab === 'moderation' ? 'btn-premium-primary' : 'btn-light text-muted'}`}
              onClick={() => setActiveTab('moderation')}
            >
              <i className="bi bi-shield-check me-2"></i> Moderation Queue
            </button>
          </li>
        )}
      </ul>

      {/* Tab Panels */}
      <div className="tab-content">
        {/* CUSTOMER VIEW */}
        {activeTab === 'customer' && (
          <div className="animate-fade-in">
            <h4 className="fw-bold mb-4">Properties You Booked</h4>
            {loadingCustomer ? (
              <div className="text-center py-5">
                <div className="spinner-border text-primary" role="status"></div>
              </div>
            ) : customerBookings.length === 0 ? (
              <div className="card glass-card text-center p-5">
                <i className="bi bi-journal-x fs-1 text-muted mb-2"></i>
                <h5 className="fw-bold text-muted">No Bookings Found</h5>
                <p className="text-muted mb-3">You haven't reserved any properties yet.</p>
                <button className="btn btn-premium-primary rounded-pill d-inline-flex mx-auto" onClick={() => navigate('/')}>
                  Find a Property
                </button>
              </div>
            ) : (
              <div className="table-responsive card glass-card p-3 border-0">
                <table className="table align-middle mb-0">
                  <thead className="table-light">
                    <tr>
                      <th>Property</th>
                      <th>Location</th>
                      <th>Dates</th>
                      <th>Total Cost</th>
                      <th>Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {customerBookings.map((booking) => (
                      <tr key={booking._id}>
                        <td>
                          <div className="d-flex align-items-center gap-3">
                            <img
                              src={booking.property?.image}
                              alt="Property"
                              className="rounded"
                              style={{ width: '60px', height: '45px', objectFit: 'cover' }}
                            />
                            <span className="fw-bold">{booking.property?.title}</span>
                          </div>
                        </td>
                        <td>{booking.property?.location}</td>
                        <td className="small">
                          {new Date(booking.startDate).toLocaleDateString()} -{' '}
                          {new Date(booking.endDate).toLocaleDateString()}
                        </td>
                        <td className="fw-bold text-primary">₹{booking.totalPrice.toLocaleString('en-IN')}</td>
                        <td>
                          <span
                            className={`badge-status badge-status-${
                              booking.status === 'confirmed'
                                ? 'approved'
                                : booking.status === 'cancelled'
                                ? 'rejected'
                                : 'pending'
                            }`}
                          >
                            {booking.status}
                          </span>
                        </td>
                        <td>
                          {booking.status === 'confirmed' && (
                            <button
                              className="btn btn-sm btn-outline-danger rounded"
                              onClick={() => handleCancelBooking(booking._id)}
                            >
                              Cancel Booking
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* LANDLORD VIEW */}
        {activeTab === 'landlord' && (
          <div className="row g-4 animate-fade-in">
            {/* Landlord Statistics Cards */}
            <div className="col-12 mb-2">
              <DashboardStats
                landlordProperties={landlordProperties}
                landlordBookings={landlordBookings}
              />
            </div>

            {/* Properties List */}
            <div className="col-lg-7">
              <div className="d-flex justify-content-between align-items-center mb-4 mt-2">
                <h4 className="fw-bold mb-0">Your Rental Listings</h4>
              </div>

              {loadingLandlord ? (
                <div className="text-center py-5">
                  <div className="spinner-border text-primary" role="status"></div>
                </div>
              ) : landlordProperties.length === 0 ? (
                <div className="card glass-card text-center p-5 mb-4">
                  <i className="bi bi-house-dash fs-1 text-muted mb-2"></i>
                  <h5 className="fw-bold text-muted">No Properties Listed</h5>
                  <p className="text-muted">Fill out the listing form to post your first rental property.</p>
                </div>
              ) : (
                <div className="d-flex flex-column gap-3 mb-4">
                  {landlordProperties.map((property) => (
                    <div className="card glass-card p-3" key={property._id}>
                      <div className="d-flex flex-column flex-sm-row gap-3">
                        <img
                          src={property.image}
                          alt="Listing"
                          className="rounded"
                          style={{ width: '120px', height: '90px', objectFit: 'cover' }}
                        />
                        <div className="flex-grow-1">
                          <div className="d-flex justify-content-between align-items-start">
                            <h5 className="fw-bold mb-1">{property.title}</h5>
                            <span className={`badge-status badge-status-${property.status}`}>
                              {property.status}
                            </span>
                          </div>
                          <p className="text-muted small mb-2">{property.location}</p>
                          <div className="d-flex justify-content-between align-items-center mt-2">
                            <span className="fw-bold text-primary">₹{property.price.toLocaleString('en-IN')}/month</span>
                            <div className="d-flex gap-3">
                              <button
                                className="btn btn-sm btn-link text-primary p-0 text-decoration-none"
                                onClick={() => handleEditClick(property)}
                              >
                                <i className="bi bi-pencil-square me-1"></i> Edit
                              </button>
                              <button
                                className="btn btn-sm btn-link text-danger p-0 text-decoration-none"
                                onClick={() => handleDeleteProperty(property._id)}
                              >
                                <i className="bi bi-trash3 me-1"></i> Delete
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Landlord Booking Requests */}
              <h4 className="fw-bold mb-4 mt-5">Incoming Rent Requests</h4>
              {loadingLandlord ? (
                <div className="text-center py-4">
                  <div className="spinner-border text-primary" role="status"></div>
                </div>
              ) : landlordBookings.length === 0 ? (
                <div className="card glass-card text-center p-4">
                  <i className="bi bi-calendar-x fs-2 text-muted mb-2"></i>
                  <h6 className="fw-bold text-muted">No Incoming Requests</h6>
                  <p className="small text-muted mb-0">Bookings made by other customers will appear here.</p>
                </div>
              ) : (
                <div className="table-responsive card glass-card p-3 border-0">
                  <table className="table align-middle mb-0">
                    <thead className="table-light">
                      <tr>
                        <th>Property</th>
                        <th>Customer</th>
                        <th>Dates</th>
                        <th>Total Price</th>
                        <th>Status</th>
                        <th>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {landlordBookings.map((booking) => (
                        <tr key={booking._id}>
                          <td className="fw-semibold small">{booking.property?.title}</td>
                          <td className="small">
                            <div className="fw-bold">{booking.user?.name}</div>
                            <div className="text-muted fs-8">{booking.user?.email}</div>
                          </td>
                          <td className="small">
                            {new Date(booking.startDate).toLocaleDateString()} -{' '}
                            {new Date(booking.endDate).toLocaleDateString()}
                          </td>
                          <td className="fw-bold text-primary">₹{booking.totalPrice.toLocaleString('en-IN')}</td>
                          <td>
                            <span
                              className={`badge-status badge-status-${
                                booking.status === 'confirmed'
                                  ? 'approved'
                                  : booking.status === 'cancelled'
                                  ? 'rejected'
                                  : 'pending'
                              }`}
                            >
                              {booking.status}
                            </span>
                          </td>
                          <td>
                            {booking.status === 'confirmed' && (
                              <button
                                className="btn btn-sm btn-outline-danger"
                                onClick={() => handleCancelBooking(booking._id)}
                              >
                                Cancel
                              </button>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* List Property Form */}
            <div className="col-lg-5" id="listingFormCard">
              <div className="card glass-card p-4 position-sticky" style={{ top: '100px' }}>
                <div className="d-flex justify-content-between align-items-center mb-3">
                  <h4 className="fw-bold mb-0">{isEditMode ? 'Edit Property Listing' : 'List a New Property'}</h4>
                  {isEditMode && (
                    <button
                      type="button"
                      className="btn btn-sm btn-outline-secondary rounded-pill px-3"
                      onClick={handleCancelEdit}
                    >
                      Cancel
                    </button>
                  )}
                </div>
                <p className="text-muted small mb-4">Complete the details below. Postings are pending until admin approval.</p>

                {formSuccess && (
                  <div className="alert alert-success border-0 small mb-3">{formSuccess}</div>
                )}
                {formError && (
                  <div className="alert alert-danger border-0 small mb-3">{formError}</div>
                )}

                <form onSubmit={handleCreateProperty}>
                  <div className="mb-3">
                    <label className="form-label fw-semibold small">PROPERTY TITLE *</label>
                    <input
                      type="text"
                      className="form-control form-premium-control"
                      placeholder="e.g. Modern Studio near Metro"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      required
                    />
                  </div>

                  <div className="mb-3">
                    <label className="form-label fw-semibold small">DESCRIPTION *</label>
                    <textarea
                      className="form-control form-premium-control"
                      rows="3"
                      placeholder="Detail features, nearby transport, pet policies..."
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      required
                    ></textarea>
                  </div>

                  <div className="row g-3 mb-3">
                    <div className="col-md-7">
                      <label className="form-label fw-semibold small">LOCATION *</label>
                      <input
                        type="text"
                        className="form-control form-premium-control"
                        placeholder="City, Country"
                        value={location}
                        onChange={(e) => setLocation(e.target.value)}
                        required
                      />
                    </div>
                    <div className="col-md-5">
                      <label className="form-label fw-semibold small">PRICE / MONTH *</label>
                      <input
                        type="number"
                        className="form-control form-premium-control"
                        placeholder="Budget (₹)"
                        value={price}
                        onChange={(e) => setPrice(e.target.value)}
                        required
                      />
                    </div>
                  </div>

                  <div className="mb-3">
                    <label className="form-label fw-semibold small">PROPERTY TYPE</label>
                    <select
                      className="form-select form-premium-control"
                      value={type}
                      onChange={(e) => setType(e.target.value)}
                    >
                      <option value="apartment">Apartment</option>
                      <option value="house">House</option>
                      <option value="villa">Villa</option>
                      <option value="studio">Studio</option>
                      <option value="room">Room</option>
                    </select>
                  </div>

                  <div className="mb-3">
                    <label className="form-label fw-semibold small">AMENITIES (comma-separated)</label>
                    <input
                      type="text"
                      className="form-control form-premium-control"
                      placeholder="WiFi, Gym, Air Conditioning, Parking"
                      value={amenitiesInput}
                      onChange={(e) => setAmenitiesInput(e.target.value)}
                    />
                  </div>

                  <div className="mb-4">
                    <label className="form-label fw-semibold small">IMAGE URL</label>
                    <input
                      type="url"
                      className="form-control form-premium-control"
                      placeholder="https://example.com/property-image.jpg"
                      value={image}
                      onChange={(e) => setImage(e.target.value)}
                    />
                  </div>

                  <button
                    type="submit"
                    className="btn btn-premium-primary w-100 py-2.5"
                    disabled={formLoading}
                  >
                    {formLoading ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                        Processing...
                      </>
                    ) : (
                      isEditMode ? 'Save Changes' : 'Publish Listing'
                    )}
                  </button>
                </form>
              </div>
            </div>
          </div>
        )}

        {/* ADMIN MODERATION VIEW */}
        {activeTab === 'moderation' && (
          <div className="animate-fade-in">
            <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3 mb-4">
              <h4 className="fw-bold mb-0">Moderation Directory</h4>
              <div className="d-flex align-items-center gap-2">
                <span className="text-muted small">Show listings:</span>
                <select
                  className="form-select form-select-sm rounded-pill px-3"
                  style={{ width: '160px' }}
                  value={adminPropertiesFilter}
                  onChange={(e) => setAdminPropertiesFilter(e.target.value)}
                >
                  <option value="pending">Pending Review</option>
                  <option value="all">All Properties</option>
                </select>
              </div>
            </div>

            {loadingAdmin ? (
              <div className="text-center py-5">
                <div className="spinner-border text-primary" role="status"></div>
              </div>
            ) : pendingProperties.length === 0 ? (
              <div className="card glass-card text-center p-5">
                <i className="bi bi-check-all fs-1 text-success mb-2"></i>
                <h5 className="fw-bold text-muted">All Caught Up!</h5>
                <p className="text-muted mb-0">No properties are currently pending review.</p>
              </div>
            ) : (
              <div className="row g-4">
                {pendingProperties.map((property) => (
                  <div className="col-12" key={property._id}>
                    <div className="card glass-card p-3">
                      <div className="d-flex flex-column flex-md-row gap-4">
                        <img
                          src={property.image}
                          alt="Pending property"
                          className="rounded"
                          style={{ width: '180px', height: '135px', objectFit: 'cover' }}
                        />
                        <div className="flex-grow-1">
                          <div className="d-flex justify-content-between align-items-start">
                            <div>
                              <h5 className="fw-bold mb-1">{property.title}</h5>
                              <span className="badge bg-secondary text-uppercase fs-8 text-white px-2 py-1 mb-2">
                                {property.type}
                              </span>
                            </div>
                            <span className={`badge-status badge-status-${property.status}`}>
                              {property.status}
                            </span>
                          </div>
                          <p className="text-muted small mb-2">
                            <i className="bi bi-geo-alt me-1"></i> {property.location}
                          </p>
                          <p className="text-gray-600 small text-truncate-3 mb-2" style={{ maxWidth: '700px' }}>
                            {property.description}
                          </p>
                          <div className="text-muted small mb-3">
                            Listed by: <strong>{property.owner?.name}</strong> ({property.owner?.email})
                          </div>

                          <div className="d-flex align-items-center justify-content-between border-top pt-3">
                            <span className="fw-bold text-primary fs-5">₹{property.price.toLocaleString('en-IN')}/month</span>
                            <div className="d-flex gap-2">
                              {property.status !== 'approved' && (
                                <button
                                  className="btn btn-sm btn-success rounded-pill px-3"
                                  onClick={() => handleModerateProperty(property._id, 'approved')}
                                >
                                  <i className="bi bi-check-circle me-1"></i> Approve
                                </button>
                              )}
                              {property.status !== 'rejected' && (
                                <button
                                  className="btn btn-sm btn-danger rounded-pill px-3"
                                  onClick={() => handleModerateProperty(property._id, 'rejected')}
                                >
                                  <i className="bi bi-x-circle me-1"></i> Reject
                                </button>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;

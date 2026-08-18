import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { useAuth, API_URL } from '../context/AuthContext';

const PropertyDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [property, setProperty] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Booking states
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [bookingSuccess, setBookingSuccess] = useState(false);
  const [bookingError, setBookingError] = useState('');
  const [bookingLoading, setBookingLoading] = useState(false);
  const [bookedDates, setBookedDates] = useState([]);

  useEffect(() => {
    const fetchPropertyDetails = async () => {
      try {
        const res = await axios.get(`${API_URL}/properties/${id}`);
        setProperty(res.data);
      } catch (err) {
        console.error(err);
        setError('Failed to fetch property details. Verify backend connection.');
      } finally {
        setLoading(false);
      }
    };

    const fetchBookedDates = async () => {
      try {
        const res = await axios.get(`${API_URL}/properties/${id}/bookings`);
        setBookedDates(res.data);
      } catch (err) {
        console.error('Failed to fetch booked dates:', err);
      }
    };

    fetchPropertyDetails();
    fetchBookedDates();
  }, [id]);

  // Compute total price based on dates
  const calculateTotalPrice = () => {
    if (!startDate || !endDate || !property) return 0;
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    if (end <= start) return 0;
    
    const diffTime = Math.abs(end - start);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    // Monthly rate divided by 30 times days booked
    const dailyRate = property.price / 30;
    return Math.round(diffDays * dailyRate);
  };

  const handleBookingSubmit = async (e) => {
    e.preventDefault();
    setBookingError('');
    setBookingSuccess(false);

    if (!user) {
      navigate('/login');
      return;
    }

    const priceCalculated = calculateTotalPrice();
    if (priceCalculated <= 0) {
      setBookingError('Please enter valid booking dates where the end date is after start date.');
      return;
    }

    // Check for date overlaps with existing confirmed bookings
    const selectedStart = new Date(startDate);
    const selectedEnd = new Date(endDate);
    const hasCollision = bookedDates.some((booking) => {
      const bStart = new Date(booking.startDate);
      const bEnd = new Date(booking.endDate);
      return selectedStart < bEnd && selectedEnd > bStart;
    });

    if (hasCollision) {
      setBookingError('The selected dates overlap with an existing confirmed booking. Please choose different dates.');
      return;
    }

    setBookingLoading(true);

    try {
      await axios.post(
        `${API_URL}/bookings`,
        {
          propertyId: property._id,
          startDate,
          endDate,
          totalPrice: priceCalculated,
        },
        {
          headers: { Authorization: `Bearer ${user.token}` },
        }
      );
      setBookingSuccess(true);
      setTimeout(() => {
        navigate('/dashboard');
      }, 2500);
    } catch (err) {
      console.error(err);
      setBookingError(err.response?.data?.message || 'Failed to complete booking.');
    } finally {
      setBookingLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="container py-5 text-center" style={{ minHeight: '80vh' }}>
        <div className="spinner-border text-primary" role="status" style={{ width: '3rem', height: '3rem' }}>
          <span className="visually-hidden">Loading...</span>
        </div>
        <p className="mt-3 text-muted">Retrieving property details...</p>
      </div>
    );
  }

  if (error || !property) {
    return (
      <div className="container py-5">
        <div className="alert alert-danger border-0 p-4 rounded-3 text-center" role="alert">
          <i className="bi bi-x-octagon-fill fs-1 text-danger d-block mb-3"></i>
          <h4 className="fw-bold">Property Not Found</h4>
          <p className="text-muted">{error || 'The requested property could not be loaded.'}</p>
          <Link to="/" className="btn btn-premium-primary rounded-pill mt-2">
            Back to Home
          </Link>
        </div>
      </div>
    );
  }

  const totalPrice = calculateTotalPrice();

  return (
    <div className="container py-5 animate-fade-in">
      <div className="row g-5">
        {/* Main Details */}
        <div className="col-lg-8">
          <div className="card glass-card border-0 overflow-hidden mb-4 shadow-sm">
            <div style={{ height: '420px', position: 'relative' }}>
              <img
                src={property.image}
                alt={property.title}
                className="w-100 h-100"
                style={{ objectFit: 'cover' }}
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&w=800&q=80';
                }}
              />
              <div className="position-absolute top-3 start-3">
                <span className="badge bg-dark py-2 px-3 fw-bold text-uppercase shadow-sm">
                  {property.type}
                </span>
              </div>
            </div>

            <div className="card-body p-4 p-md-5">
              <h1 className="fw-bold mb-3">{property.title}</h1>
              <p className="text-muted d-flex align-items-center gap-2 mb-4 fs-5">
                <i className="bi bi-geo-alt-fill text-primary"></i>
                <span>{property.location}</span>
              </p>

              <hr className="my-4 text-muted" />

              <h4 className="fw-bold mb-3">Description</h4>
              <p className="text-gray-600 mb-4" style={{ lineHeight: '1.7', whiteSpace: 'pre-line' }}>
                {property.description}
              </p>

              <hr className="my-4 text-muted" />

              <h4 className="fw-bold mb-3">Amenities Included</h4>
              <div className="d-flex flex-wrap gap-2 mb-4">
                {property.amenities.length > 0 ? (
                  property.amenities.map((amenity, index) => (
                    <span key={index} className="badge bg-primary-light text-primary border border-primary px-3 py-2 fs-6 rounded-pill">
                      <i className="bi bi-patch-check-fill me-2"></i>
                      {amenity}
                    </span>
                  ))
                ) : (
                  <span className="text-muted italic">No specific amenities declared.</span>
                )}
              </div>

              <hr className="my-4 text-muted" />

              <h4 className="fw-bold mb-3">Hosted By</h4>
              <div className="d-flex align-items-center gap-3 bg-light p-3 rounded-3">
                <div className="bg-primary text-white rounded-circle d-flex align-items-center justify-content-center fw-bold fs-4" style={{ width: '50px', height: '50px' }}>
                  {property.owner?.name?.charAt(0).toUpperCase() || 'H'}
                </div>
                <div>
                  <h6 className="fw-bold mb-1">{property.owner?.name || 'Independent Owner'}</h6>
                  <p className="mb-0 text-muted fs-7">{property.owner?.email || 'contact@househunt.com'}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Booking Card */}
        <div className="col-lg-4">
          <div className="card glass-card p-4 sticky-top" style={{ top: '100px', zIndex: 10 }}>
            <h4 className="fw-bold mb-3 text-primary">₹{property.price.toLocaleString('en-IN')} <span className="fs-6 text-muted font-normal">/ month</span></h4>
            <p className="text-muted small mb-4">Book online. No broker fees. Cancel anytime.</p>

            {bookingSuccess && (
              <div className="alert alert-success border-0 py-3 mb-4 text-center rounded-3 animate-fade-in" role="alert">
                <i className="bi bi-check-circle-fill fs-2 text-success d-block mb-1"></i>
                <h6 className="fw-bold">Booking Confirmed!</h6>
                <p className="small mb-0 text-muted">Redirecting to your dashboard...</p>
              </div>
            )}

            {bookingError && (
              <div className="alert alert-danger border-0 py-3 mb-4 rounded-3 text-center" role="alert">
                <i className="bi bi-exclamation-octagon-fill fs-3 text-danger d-block mb-1"></i>
                <div className="small">{bookingError}</div>
              </div>
            )}

            <form onSubmit={handleBookingSubmit}>
              <div className="mb-3">
                <label className="form-label fw-bold text-muted small">START DATE</label>
                <input
                  type="date"
                  className="form-control form-premium-control"
                  value={startDate}
                  min={new Date().toISOString().split('T')[0]}
                  onChange={(e) => setStartDate(e.target.value)}
                  required
                />
              </div>

              <div className="mb-4">
                <label className="form-label fw-bold text-muted small">END DATE</label>
                <input
                  type="date"
                  className="form-control form-premium-control"
                  value={endDate}
                  min={startDate || new Date().toISOString().split('T')[0]}
                  onChange={(e) => setEndDate(e.target.value)}
                  required
                />
              </div>

              {totalPrice > 0 && (
                <div className="p-3 bg-light rounded-3 mb-4 animate-fade-in border border-dashed">
                  <div className="d-flex justify-content-between mb-2">
                    <span className="text-muted">Total Days:</span>
                    <span className="fw-bold">
                      {Math.ceil(Math.abs(new Date(endDate) - new Date(startDate)) / (1000 * 60 * 60 * 24))} Days
                    </span>
                  </div>
                  <div className="d-flex justify-content-between pt-2 border-top">
                    <span className="text-muted fw-bold">Est. Total Cost:</span>
                    <span className="fw-extrabold text-primary fs-5">₹{totalPrice.toLocaleString('en-IN')}</span>
                  </div>
                </div>
              )}

              {user?.role === 'admin' ? (
                <div className="alert alert-info border-0 text-center py-2 rounded-3 small">
                  Administrators cannot book properties.
                </div>
              ) : user && property.owner?._id === user._id ? (
                <div className="alert alert-info border-0 text-center py-2 rounded-3 small">
                  You are the owner of this property.
                </div>
              ) : (
                <button
                  type="submit"
                  className="btn btn-premium-primary w-100 py-3"
                  disabled={bookingLoading || bookingSuccess}
                >
                  {bookingLoading ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                      Confirming booking...
                    </>
                  ) : (
                    user ? 'Reserve Now' : 'Sign In to Reserve'
                  )}
                </button>
              )}
            </form>

            {/* Display list of unavailable booked dates */}
            {bookedDates.length > 0 && (
              <div className="mt-4 pt-3 border-top">
                <h6 className="fw-bold text-muted small mb-2">UNAVAILABLE DATES (ALREADY BOOKED)</h6>
                <div className="d-flex flex-column gap-2" style={{ maxHeight: '140px', overflowY: 'auto' }}>
                  {bookedDates.map((booking, idx) => (
                    <div key={idx} className="d-flex align-items-center gap-2 text-danger small bg-danger-subtle p-2 rounded">
                      <i className="bi bi-calendar-x-fill"></i>
                      <span>
                        {new Date(booking.startDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })} -{' '}
                        {new Date(booking.endDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PropertyDetails;

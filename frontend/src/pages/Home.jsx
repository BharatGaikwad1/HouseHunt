import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { API_URL } from '../context/AuthContext';

const Home = () => {
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Search & Filter state
  const [location, setLocation] = useState('');
  const [type, setType] = useState('all');
  const [maxPrice, setMaxPrice] = useState('');
  const [sort, setSort] = useState('newest');
  const [selectedAmenities, setSelectedAmenities] = useState([]);

  // Fetch properties from backend
  const fetchProperties = async () => {
    setLoading(true);
    setError('');
    try {
      let url = `${API_URL}/properties?status=approved`;
      
      const params = [];
      if (location) params.push(`location=${encodeURIComponent(location)}`);
      if (type && type !== 'all') params.push(`type=${type}`);
      if (maxPrice) params.push(`maxPrice=${maxPrice}`);
      if (sort && sort !== 'newest') params.push(`sort=${sort}`);
      if (selectedAmenities && selectedAmenities.length > 0) {
        params.push(`amenities=${encodeURIComponent(selectedAmenities.join(','))}`);
      }
      
      if (params.length > 0) {
        url += `&${params.join('&')}`;
      }

      const res = await axios.get(url);
      setProperties(res.data);
    } catch (err) {
      console.error(err);
      setError('Could not retrieve listings. Ensure backend is running.');
    } finally {
      setLoading(false);
    }
  };

  // Re-run search automatically when sort or amenities change
  useEffect(() => {
    fetchProperties();
  }, [sort, selectedAmenities]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchProperties();
  };

  const handleReset = () => {
    setLocation('');
    setType('all');
    setMaxPrice('');
    setSort('newest');
    setSelectedAmenities([]);
    // Trigger reset fetch
    const queryDefault = async () => {
      setLoading(true);
      try {
        const res = await axios.get(`${API_URL}/properties?status=approved`);
        setProperties(res.data);
      } catch (err) {
        setError('Error fetching listings');
      } finally {
        setLoading(false);
      }
    };
    queryDefault();
  };

  return (
    <div className="container py-4">
      {/* Hero Section */}
      <div className="hero-gradient p-5 mb-5 text-center text-md-start d-flex flex-column justify-content-center animate-fade-in" style={{ minHeight: '320px' }}>
        <div className="position-relative z-index-2">
          <span className="badge bg-secondary text-uppercase fw-bold mb-2 px-3 py-2" style={{ letterSpacing: '1px' }}>
            Find Your Dream Rental in India
          </span>
          <h1 className="display-4 fw-extrabold mb-3" style={{ lineHeight: '1.2' }}>
            Discover Spaces <br className="d-none d-md-inline"/>
            That Inspire Your Living
          </h1>
          <p className="lead text-gray-300 max-w-600 mb-4">
            HouseHunt brings you thousands of validated apartments, luxury villas, and cozy rooms from verified landlords across India.
          </p>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="card glass-card p-4 mb-5 animate-fade-in" style={{ animationDelay: '0.1s' }}>
        <h5 className="fw-bold mb-3">
          <i className="bi bi-search me-2 text-primary"></i> Search Properties
        </h5>
        <form onSubmit={handleSearchSubmit} className="row g-3">
          <div className="col-md-4">
            <label className="form-label fw-semibold text-muted">Location</label>
            <div className="input-group">
              <span className="input-group-text bg-white border-end-0 rounded-start-pill ps-3 text-muted">
                <i className="bi bi-geo-alt"></i>
              </span>
              <input
                type="text"
                className="form-control form-premium-control border-start-0 rounded-end-pill ps-2"
                placeholder="City, neighborhood (e.g. Bandra, Indiranagar)..."
                value={location}
                onChange={(e) => setLocation(e.target.value)}
              />
            </div>
          </div>

          <div className="col-md-3">
            <label className="form-label fw-semibold text-muted">Property Type</label>
            <select
              className="form-select form-premium-control rounded-pill"
              value={type}
              onChange={(e) => setType(e.target.value)}
            >
              <option value="all">All Types</option>
              <option value="apartment">Apartment</option>
              <option value="house">House</option>
              <option value="villa">Villa</option>
              <option value="studio">Studio</option>
              <option value="room">Room</option>
            </select>
          </div>

          <div className="col-md-3">
            <label className="form-label fw-semibold text-muted">Max Budget (₹/mo)</label>
            <div className="input-group">
              <span className="input-group-text bg-white border-end-0 rounded-start-pill ps-3 text-muted">
                <i className="bi bi-currency-rupee"></i>
              </span>
              <input
                type="number"
                className="form-control form-premium-control border-start-0 rounded-end-pill ps-2"
                placeholder="e.g. 25000"
                value={maxPrice}
                onChange={(e) => setMaxPrice(e.target.value)}
              />
            </div>
          </div>

          <div className="col-md-2 d-flex align-items-end gap-2">
            <button type="submit" className="btn btn-premium-primary w-100 rounded-pill py-2">
              Search
            </button>
            <button type="button" onClick={handleReset} className="btn btn-light border rounded-pill py-2 text-muted px-3" title="Reset Filters">
              <i className="bi bi-arrow-counterclockwise"></i>
            </button>
          </div>

          {/* Additional Filter: Sorting and Amenities */}
          <div className="col-md-3 mt-3">
            <label className="form-label fw-semibold text-muted">Sort By</label>
            <select
              className="form-select form-premium-control rounded-pill"
              value={sort}
              onChange={(e) => setSort(e.target.value)}
            >
              <option value="newest">Newest Listings</option>
              <option value="priceAsc">Price: Low to High</option>
              <option value="priceDesc">Price: High to Low</option>
            </select>
          </div>

          <div className="col-md-9 mt-3">
            <label className="form-label fw-semibold text-muted d-block">Amenities Filter</label>
            <div className="d-flex flex-wrap gap-3 pt-2">
              {['WiFi', 'Gym', 'Pool', 'Parking', 'Backyard', 'Furnished', 'Pet Friendly', 'Waterfront'].map((amenity) => (
                <div className="form-check" key={amenity}>
                  <input
                    className="form-check-input"
                    type="checkbox"
                    id={`amenity-${amenity}`}
                    checked={selectedAmenities.includes(amenity)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedAmenities([...selectedAmenities, amenity]);
                      } else {
                        setSelectedAmenities(selectedAmenities.filter((a) => a !== amenity));
                      }
                    }}
                  />
                  <label className="form-check-label text-muted small" htmlFor={`amenity-${amenity}`}>
                    {amenity}
                  </label>
                </div>
              ))}
            </div>
          </div>
        </form>
      </div>

      {/* Property Section */}
      <h3 className="fw-bold mb-4">Available Rentals</h3>

      {loading ? (
        <div className="text-center py-5">
          <div className="spinner-border text-primary" role="status" style={{ width: '3rem', height: '3rem' }}>
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="mt-3 text-muted">Searching for awesome properties...</p>
        </div>
      ) : error ? (
        <div className="alert alert-warning border-0 p-4 rounded-3 text-center" role="alert">
          <i className="bi bi-database-exclamation fs-1 mb-2 text-warning d-block"></i>
          <h5 className="fw-bold">{error}</h5>
          <p className="mb-0 text-muted">Please check that the local API server and MongoDB are online, then refresh.</p>
        </div>
      ) : properties.length === 0 ? (
        <div className="text-center py-5 card glass-card">
          <i className="bi bi-building-exclamation fs-1 text-muted mb-2"></i>
          <h4 className="fw-bold text-muted">No Listings Found</h4>
          <p className="text-muted mb-0">Try adjusting your filters or search keywords to locate active properties.</p>
        </div>
      ) : (
        <div className="row g-4 animate-fade-in">
          {properties.map((property) => (
            <div className="col-md-6 col-lg-4" key={property._id}>
              <div className="card glass-card h-100 overflow-hidden">
                <div style={{ position: 'relative', height: '220px', overflow: 'hidden' }}>
                  <img
                    src={property.image}
                    alt={property.title}
                    className="w-100 h-100"
                    style={{ objectFit: 'cover', transition: 'all 0.5s ease' }}
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&w=800&q=80';
                    }}
                  />
                  <div className="position-absolute top-3 start-3">
                    <span className="badge bg-dark text-white text-capitalize py-2 px-3 fw-bold shadow">
                      {property.type}
                    </span>
                  </div>
                  <div className="position-absolute bottom-3 end-3 bg-white px-3 py-1 rounded-pill shadow-sm fw-bold text-primary">
                    ₹{property.price.toLocaleString('en-IN')}/mo
                  </div>
                </div>

                <div className="card-body p-4 d-flex flex-column">
                  <h5 className="card-title fw-bold text-truncate mb-2">{property.title}</h5>
                  <p className="text-muted d-flex align-items-center gap-1 mb-3" style={{ fontSize: '0.9rem' }}>
                    <i className="bi bi-geo-alt text-primary"></i>
                    <span className="text-truncate">{property.location}</span>
                  </p>

                  <div className="d-flex flex-wrap gap-1 mb-4">
                    {property.amenities.slice(0, 3).map((amenity, idx) => (
                      <span key={idx} className="badge bg-light text-muted border py-1.5 px-2">
                        {amenity}
                      </span>
                    ))}
                    {property.amenities.length > 3 && (
                      <span className="badge bg-light text-muted border py-1.5 px-2">
                        +{property.amenities.length - 3} more
                      </span>
                    )}
                  </div>

                  <div className="mt-auto">
                    <Link to={`/property/${property._id}`} className="btn btn-premium-primary w-100 rounded-pill">
                      View Details
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Home;

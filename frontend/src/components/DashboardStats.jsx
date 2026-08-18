import React from 'react';

const DashboardStats = ({ landlordProperties, landlordBookings }) => {
  const confirmedBookings = landlordBookings.filter(b => b.status === 'confirmed');
  const totalRevenue = confirmedBookings.reduce((sum, b) => sum + b.totalPrice, 0);

  return (
    <div className="row g-3">
      <div className="col-md-4">
        <div className="card glass-card p-3 d-flex flex-row align-items-center gap-3">
          <div className="bg-primary-light text-primary rounded-3 p-3">
            <i className="bi bi-building fs-3"></i>
          </div>
          <div>
            <h4 className="fw-bold mb-0">{landlordProperties.length}</h4>
            <span className="text-muted small">Total Properties Listed</span>
          </div>
        </div>
      </div>
      <div className="col-md-4">
        <div className="card glass-card p-3 d-flex flex-row align-items-center gap-3">
          <div className="bg-success-subtle text-success rounded-3 p-3">
            <i className="bi bi-calendar-check fs-3"></i>
          </div>
          <div>
            <h4 className="fw-bold mb-0">{confirmedBookings.length}</h4>
            <span className="text-muted small">Confirmed Bookings</span>
          </div>
        </div>
      </div>
      <div className="col-md-4">
        <div className="card glass-card p-3 d-flex flex-row align-items-center gap-3">
          <div className="bg-info-subtle text-info rounded-3 p-3">
            <i className="bi bi-currency-rupee fs-3"></i>
          </div>
          <div>
            <h4 className="fw-bold mb-0">₹{totalRevenue.toLocaleString('en-IN')}</h4>
            <span className="text-muted small">Total Revenue</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardStats;

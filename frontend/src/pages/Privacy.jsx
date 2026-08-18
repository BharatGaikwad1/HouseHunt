import React from 'react';

const Privacy = () => {
  return (
    <div className="container py-5 mt-4" style={{ maxWidth: '800px', minHeight: '75vh' }}>
      <div className="card glass-card p-5 border-0">
        <h2 className="fw-bold mb-4">Privacy Policy</h2>
        <p className="text-muted small">Last updated: {new Date().toLocaleDateString('en-IN')}</p>
        <hr className="my-4" />

        <section className="mb-4">
          <h5 className="fw-bold text-primary">1. Information We Collect</h5>
          <p>We collect information you provide directly to us when registering an account, posting properties, or reserving bookings. This includes:</p>
          <ul>
            <li>Personal identification details (Name, email address).</li>
            <li>Property listing preferences and rental rates.</li>
            <li>Booking schedules and transactional history.</li>
          </ul>
        </section>

        <section className="mb-4">
          <h5 className="fw-bold text-primary">2. Third-Party Services</h5>
          <p>To render assets and run our service, client browsers may load content directly from the following third parties, who process visitor IP addresses and browser metadata:</p>
          <ul>
            <li><strong>Google Fonts</strong> (for premium typography).</li>
            <li><strong>Unsplash</strong> (for default property listing images).</li>
          </ul>
        </section>

        <section className="mb-4">
          <h5 className="fw-bold text-primary">3. Data Retention & Deletion</h5>
          <p>User profile information is stored until you request account deletion. You can invoke your right to deletion by sending a request via our profile deletion endpoint.</p>
        </section>

        <section className="mb-4">
          <h5 className="fw-bold text-primary">4. Cookies</h5>
          <p>We use session-bound cookies/sessionStorage strictly to maintain authentication state. No tracking or marketing cookies are utilized.</p>
        </section>

        <section className="mb-0 mt-5">
          <p className="small text-muted">This document constitutes the minimal security policy for HouseHunt development builds.</p>
        </section>
      </div>
    </div>
  );
};

export default Privacy;

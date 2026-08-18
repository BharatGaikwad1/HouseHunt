import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Register = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('user');
  const [loadingLocal, setLoadingLocal] = useState(false);
  const [errorLocal, setErrorLocal] = useState('');

  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorLocal('');
    setLoadingLocal(true);

    try {
      await register(name, email, password, role);
      navigate('/dashboard');
    } catch (err) {
      setErrorLocal(err.message || 'Registration failed. Try a different email.');
    } finally {
      setLoadingLocal(false);
    }
  };

  return (
    <div className="container py-5 d-flex justify-content-center align-items-center" style={{ minHeight: '80vh' }}>
      <div className="card glass-card p-4 p-md-5 w-100" style={{ maxWidth: '520px' }}>
        <div className="text-center mb-4">
          <div className="d-inline-flex align-items-center justify-content-center bg-primary-light text-primary rounded-circle mb-3" style={{ width: '60px', height: '60px' }}>
            <i className="bi bi-person-plus-fill fs-2"></i>
          </div>
          <h2 className="fw-bold">Create Account</h2>
          <p className="text-muted">Start finding or listing rental homes today</p>
        </div>

        {errorLocal && (
          <div className="alert alert-danger border-0 d-flex align-items-center gap-2" role="alert">
            <i className="bi bi-exclamation-triangle-fill"></i>
            <div>{errorLocal}</div>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label className="form-label fw-semibold" htmlFor="name">Full Name</label>
            <input
              type="text"
              className="form-control form-premium-control"
              id="name"
              placeholder="John Doe"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

          <div className="mb-3">
            <label className="form-label fw-semibold" htmlFor="email">Email Address</label>
            <input
              type="email"
              className="form-control form-premium-control"
              id="email"
              placeholder="john@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="mb-3">
            <label className="form-label fw-semibold" htmlFor="password">Password</label>
            <input
              type="password"
              className="form-control form-premium-control"
              id="password"
              placeholder="Min. 6 characters"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              minLength={6}
              required
            />
          </div>

          <div className="mb-4">
            <label className="form-label fw-semibold" htmlFor="role">I want to register as a</label>
            <select
              className="form-select form-premium-control"
              id="role"
              value={role}
              onChange={(e) => setRole(e.target.value)}
            >
              <option value="user">Regular User (Browse, Rent, List properties)</option>
              <option value="admin">System Administrator (Approve/Reject listings)</option>
            </select>
          </div>

          <button
            type="submit"
            className="btn btn-premium-primary w-100 py-2 d-flex align-items-center justify-content-center gap-2"
            disabled={loadingLocal}
          >
            {loadingLocal ? (
              <>
                <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                <span>Creating Account...</span>
              </>
            ) : (
              <>
                <span>Sign Up</span>
                <i className="bi bi-arrow-right"></i>
              </>
            )}
          </button>
        </form>

        <div className="text-center mt-4">
          <p className="mb-0 text-muted">
            Already have an account?{' '}
            <Link to="/login" className="text-primary fw-semibold text-decoration-none">
              Sign In
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;

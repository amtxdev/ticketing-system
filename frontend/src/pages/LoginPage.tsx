// Login Page
// Handles user authentication
// Demonstrates login flow, token storage, and redirect after successful login

import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const { login, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Redirect if already authenticated
  React.useEffect(() => {
    if (isAuthenticated) {
      const from = (location.state as any)?.from?.pathname || '/events';
      navigate(from, { replace: true });
    }
  }, [isAuthenticated, navigate, location]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      // Call auth service to login
      // This will store the token via the auth context
      await login({ email, password });

      // Redirect to intended page or events list
      const from = (location.state as any)?.from?.pathname || '/events';
      navigate(from, { replace: true });
    } catch (err: any) {
      setError(err.message || 'Login failed. Please check your credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={{ 
      maxWidth: '400px', 
      margin: '2rem auto', 
      padding: '2.5rem',
      background: 'rgba(255, 255, 255, 0.95)',
      border: 'none',
      borderRadius: '20px',
      boxShadow: '0 10px 40px rgba(99, 102, 241, 0.2)',
      backdropFilter: 'blur(10px)'
    }}>
      <h1 style={{
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
        backgroundClip: 'text',
        marginBottom: '1.5rem',
        fontSize: '2.5rem'
      }}>Login</h1>
      
      {error && (
        <div style={{ 
          padding: '0.75rem', 
          marginBottom: '1rem', 
          background: 'linear-gradient(135deg, #fee2e2 0%, #fecaca 100%)',
          color: '#dc2626',
          borderRadius: '12px',
          border: '2px solid #fca5a5',
          fontWeight: '500'
        }}>
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: '1.5rem' }}>
          <label htmlFor="email" style={{ 
            display: 'block', 
            marginBottom: '0.5rem',
            fontWeight: '600',
            color: '#4b5563'
          }}>
            Email
          </label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            style={{ 
              width: '100%', 
              padding: '0.75rem',
              fontSize: '1rem',
              border: '2px solid #e5e7eb',
              borderRadius: '12px',
              transition: 'all 0.3s ease',
              boxSizing: 'border-box'
            }}
            onFocus={(e) => {
              e.target.style.borderColor = '#6366f1';
              e.target.style.boxShadow = '0 0 0 3px rgba(99, 102, 241, 0.1)';
            }}
            onBlur={(e) => {
              e.target.style.borderColor = '#e5e7eb';
              e.target.style.boxShadow = 'none';
            }}
          />
        </div>

        <div style={{ marginBottom: '1.5rem' }}>
          <label htmlFor="password" style={{ 
            display: 'block', 
            marginBottom: '0.5rem',
            fontWeight: '600',
            color: '#4b5563'
          }}>
            Password
          </label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            style={{ 
              width: '100%', 
              padding: '0.75rem',
              fontSize: '1rem',
              border: '2px solid #e5e7eb',
              borderRadius: '12px',
              transition: 'all 0.3s ease',
              boxSizing: 'border-box'
            }}
            onFocus={(e) => {
              e.target.style.borderColor = '#6366f1';
              e.target.style.boxShadow = '0 0 0 3px rgba(99, 102, 241, 0.1)';
            }}
            onBlur={(e) => {
              e.target.style.borderColor = '#e5e7eb';
              e.target.style.boxShadow = 'none';
            }}
          />
        </div>

        <button
          type="submit"
          disabled={isLoading}
          style={{
            width: '100%',
            padding: '0.875rem',
            fontSize: '1rem',
            background: isLoading 
              ? 'linear-gradient(135deg, #9ca3af 0%, #6b7280 100%)'
              : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            color: 'white',
            border: 'none',
            borderRadius: '12px',
            cursor: isLoading ? 'not-allowed' : 'pointer',
            opacity: isLoading ? 0.7 : 1,
            fontWeight: '600',
            boxShadow: isLoading 
              ? 'none'
              : '0 4px 15px rgba(99, 102, 241, 0.4)',
            transition: 'all 0.3s ease'
          }}
          onMouseEnter={(e) => {
            if (!isLoading) {
              e.currentTarget.style.transform = 'translateY(-2px)';
              e.currentTarget.style.boxShadow = '0 6px 20px rgba(99, 102, 241, 0.6)';
            }
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = isLoading 
              ? 'none'
              : '0 4px 15px rgba(99, 102, 241, 0.4)';
          }}
        >
          {isLoading ? 'Logging in...' : 'Login'}
        </button>
      </form>

      <div style={{ marginTop: '1.5rem', fontSize: '0.9rem', color: '#6b7280' }}>
        <p>
          Don't have an account? <a href="#register" onClick={(e) => {
            e.preventDefault();
            alert('Registration page not implemented in this scaffold');
          }} style={{
            color: '#6366f1',
            fontWeight: '600',
            textDecoration: 'none'
          }}>Register</a>
        </p>
      </div>
    </div>
  );
};

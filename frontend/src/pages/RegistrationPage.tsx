// Registration Page
// Handles user registration
// Allows users to create a new account

import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { validateEmail } from '../utils/validation';
import { authService } from '../services/authService';

export const RegistrationPage: React.FC = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    first_name: '',
    last_name: '',
  });
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [emailError, setEmailError] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
    
    // Clear errors when user starts typing
    if (name === 'email') setEmailError(null);
    if (name === 'password' || name === 'confirmPassword') setPasswordError(null);
    if (fieldErrors[name]) {
      setFieldErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};
    
    // Email validation
    const emailValidation = validateEmail(formData.email);
    if (!emailValidation.valid) {
      setEmailError(emailValidation.message || 'Invalid email');
      errors.email = emailValidation.message || 'Invalid email';
    }

    // Password validation
    if (!formData.password || formData.password.length < 6) {
      setPasswordError('Password must be at least 6 characters');
      errors.password = 'Password must be at least 6 characters';
    }

    // Confirm password validation
    if (formData.password !== formData.confirmPassword) {
      setPasswordError('Passwords do not match');
      errors.confirmPassword = 'Passwords do not match';
    }

    // First name validation
    if (!formData.first_name || formData.first_name.trim().length === 0) {
      errors.first_name = 'First name is required';
    }

    // Last name validation
    if (!formData.last_name || formData.last_name.trim().length === 0) {
      errors.last_name = 'Last name is required';
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setEmailError(null);
    setPasswordError(null);
    setFieldErrors({});

    if (!validateForm()) {
      return;
    }

    setIsLoading(true);

    try {
      // Register user
      const response = await authService.register({
        email: formData.email.toLowerCase().trim(),
        password: formData.password,
        first_name: formData.first_name.trim(),
        last_name: formData.last_name.trim(),
      });

      // Auto-login after successful registration
      if (response.token) {
        await login({
          email: formData.email.toLowerCase().trim(),
          password: formData.password,
        });

        // Redirect to events page
        navigate('/events', { replace: true });
      }
    } catch (err: any) {
      const errorMessage = err.message || 'Registration failed. Please try again.';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={{ 
      maxWidth: '500px', 
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
      }}>Register</h1>
      
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
            Email *
          </label>
          <input
            id="email"
            name="email"
            type="email"
            value={formData.email}
            onChange={handleInputChange}
            onBlur={(e) => {
              const validation = validateEmail(e.target.value);
              if (!validation.valid && e.target.value.trim().length > 0) {
                setEmailError(validation.message || 'Invalid email');
              } else {
                setEmailError(null);
              }
            }}
            required
            style={{ 
              width: '100%', 
              padding: '0.75rem',
              fontSize: '1rem',
              border: emailError || fieldErrors.email ? '2px solid #dc2626' : '2px solid #e5e7eb',
              borderRadius: '12px',
              transition: 'all 0.3s ease',
              boxSizing: 'border-box'
            }}
            onFocus={(e) => {
              e.target.style.borderColor = emailError || fieldErrors.email ? '#dc2626' : '#6366f1';
              e.target.style.boxShadow = emailError || fieldErrors.email
                ? '0 0 0 3px rgba(220, 38, 38, 0.1)' 
                : '0 0 0 3px rgba(99, 102, 241, 0.1)';
            }}
            autoComplete="email"
          />
          {(emailError || fieldErrors.email) && (
            <div style={{ 
              marginTop: '0.5rem', 
              color: '#dc2626', 
              fontSize: '0.875rem' 
            }}>
              {emailError || fieldErrors.email}
            </div>
          )}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
          <div>
            <label htmlFor="first_name" style={{ 
              display: 'block', 
              marginBottom: '0.5rem',
              fontWeight: '600',
              color: '#4b5563'
            }}>
              First Name *
            </label>
            <input
              id="first_name"
              name="first_name"
              type="text"
              value={formData.first_name}
              onChange={handleInputChange}
              required
              style={{ 
                width: '100%', 
                padding: '0.75rem',
                fontSize: '1rem',
                border: fieldErrors.first_name ? '2px solid #dc2626' : '2px solid #e5e7eb',
                borderRadius: '12px',
                transition: 'all 0.3s ease',
                boxSizing: 'border-box'
              }}
              onFocus={(e) => {
                e.target.style.borderColor = fieldErrors.first_name ? '#dc2626' : '#6366f1';
                e.target.style.boxShadow = fieldErrors.first_name
                  ? '0 0 0 3px rgba(220, 38, 38, 0.1)' 
                  : '0 0 0 3px rgba(99, 102, 241, 0.1)';
              }}
              autoComplete="given-name"
            />
            {fieldErrors.first_name && (
              <div style={{ 
                marginTop: '0.5rem', 
                color: '#dc2626', 
                fontSize: '0.875rem' 
              }}>
                {fieldErrors.first_name}
              </div>
            )}
          </div>

          <div>
            <label htmlFor="last_name" style={{ 
              display: 'block', 
              marginBottom: '0.5rem',
              fontWeight: '600',
              color: '#4b5563'
            }}>
              Last Name *
            </label>
            <input
              id="last_name"
              name="last_name"
              type="text"
              value={formData.last_name}
              onChange={handleInputChange}
              required
              style={{ 
                width: '100%', 
                padding: '0.75rem',
                fontSize: '1rem',
                border: fieldErrors.last_name ? '2px solid #dc2626' : '2px solid #e5e7eb',
                borderRadius: '12px',
                transition: 'all 0.3s ease',
                boxSizing: 'border-box'
              }}
              onFocus={(e) => {
                e.target.style.borderColor = fieldErrors.last_name ? '#dc2626' : '#6366f1';
                e.target.style.boxShadow = fieldErrors.last_name
                  ? '0 0 0 3px rgba(220, 38, 38, 0.1)' 
                  : '0 0 0 3px rgba(99, 102, 241, 0.1)';
              }}
              autoComplete="family-name"
            />
            {fieldErrors.last_name && (
              <div style={{ 
                marginTop: '0.5rem', 
                color: '#dc2626', 
                fontSize: '0.875rem' 
              }}>
                {fieldErrors.last_name}
              </div>
            )}
          </div>
        </div>

        <div style={{ marginBottom: '1.5rem' }}>
          <label htmlFor="password" style={{ 
            display: 'block', 
            marginBottom: '0.5rem',
            fontWeight: '600',
            color: '#4b5563'
          }}>
            Password *
          </label>
          <input
            id="password"
            name="password"
            type="password"
            value={formData.password}
            onChange={handleInputChange}
            required
            style={{ 
              width: '100%', 
              padding: '0.75rem',
              fontSize: '1rem',
              border: passwordError || fieldErrors.password ? '2px solid #dc2626' : '2px solid #e5e7eb',
              borderRadius: '12px',
              transition: 'all 0.3s ease',
              boxSizing: 'border-box'
            }}
            onFocus={(e) => {
              e.target.style.borderColor = passwordError || fieldErrors.password ? '#dc2626' : '#6366f1';
              e.target.style.boxShadow = passwordError || fieldErrors.password
                ? '0 0 0 3px rgba(220, 38, 38, 0.1)' 
                : '0 0 0 3px rgba(99, 102, 241, 0.1)';
            }}
            autoComplete="new-password"
          />
          {(passwordError || fieldErrors.password) && (
            <div style={{ 
              marginTop: '0.5rem', 
              color: '#dc2626', 
              fontSize: '0.875rem' 
            }}>
              {passwordError || fieldErrors.password}
            </div>
          )}
        </div>

        <div style={{ marginBottom: '1.5rem' }}>
          <label htmlFor="confirmPassword" style={{ 
            display: 'block', 
            marginBottom: '0.5rem',
            fontWeight: '600',
            color: '#4b5563'
          }}>
            Confirm Password *
          </label>
          <input
            id="confirmPassword"
            name="confirmPassword"
            type="password"
            value={formData.confirmPassword}
            onChange={handleInputChange}
            required
            style={{ 
              width: '100%', 
              padding: '0.75rem',
              fontSize: '1rem',
              border: passwordError || fieldErrors.confirmPassword ? '2px solid #dc2626' : '2px solid #e5e7eb',
              borderRadius: '12px',
              transition: 'all 0.3s ease',
              boxSizing: 'border-box'
            }}
            onFocus={(e) => {
              e.target.style.borderColor = passwordError || fieldErrors.confirmPassword ? '#dc2626' : '#6366f1';
              e.target.style.boxShadow = passwordError || fieldErrors.confirmPassword
                ? '0 0 0 3px rgba(220, 38, 38, 0.1)' 
                : '0 0 0 3px rgba(99, 102, 241, 0.1)';
            }}
            autoComplete="new-password"
          />
          {fieldErrors.confirmPassword && (
            <div style={{ 
              marginTop: '0.5rem', 
              color: '#dc2626', 
              fontSize: '0.875rem' 
            }}>
              {fieldErrors.confirmPassword}
            </div>
          )}
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
          {isLoading ? 'Registering...' : 'Register'}
        </button>
      </form>

      <div style={{ marginTop: '1.5rem', fontSize: '0.9rem', color: '#6b7280', textAlign: 'center' }}>
        <p>
          Already have an account?{' '}
          <Link 
            to="/login" 
            style={{
              color: '#6366f1',
              fontWeight: '600',
              textDecoration: 'none'
            }}
          >
            Login
          </Link>
        </p>
      </div>
    </div>
  );
};


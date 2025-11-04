// Events Listing Page (Public)
// Displays all available events
// Shows authentication status and role-based actions
// Demonstrates API integration and access control UI

import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { eventService } from '../services/eventService';
import { Event, ApiError } from '../types';

export const EventsPage: React.FC = () => {
  const [events, setEvents] = useState<Event[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const navigate = useNavigate();
  const { isAuthenticated, user, logout, isAdmin } = useAuth();

  useEffect(() => {
    loadEvents();
  }, []);

  const loadEvents = async () => {
    setIsLoading(true);
    setError(null);
    try {
      // Call event service to fetch events
      // This is a public endpoint - no auth required
      const data = await eventService.listEvents();
      setEvents(data);
    } catch (err: any) {
      const apiError = err as ApiError;
      setError(apiError.message || 'Failed to load events');
      console.error('Error loading events:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto', textAlign: 'left' }}>
      {/* Header with auth status */}
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        marginBottom: '2rem',
        padding: '1.5rem',
        background: 'rgba(255, 255, 255, 0.9)',
        borderRadius: '20px',
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
        backdropFilter: 'blur(10px)'
      }}>
        <h1 style={{
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text',
          margin: 0,
          fontSize: '2.5rem'
        }}>Events</h1>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          {isAuthenticated ? (
            <>
              <span style={{ 
                color: '#4b5563',
                fontWeight: '500'
              }}>Welcome, {user?.first_name} {user?.last_name}</span>
              {isAdmin() && (
                <>
                  <span style={{ 
                    padding: '0.5rem 1rem', 
                    background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)', 
                    color: 'white',
                    borderRadius: '12px',
                    fontSize: '0.85rem',
                    fontWeight: '600',
                    boxShadow: '0 4px 15px rgba(245, 158, 11, 0.4)'
                  }}>
                    Admin
                  </span>
                  <button 
                    onClick={() => navigate('/admin/events')}
                    style={{
                      padding: '0.5rem 1rem',
                      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                      color: 'white',
                      border: 'none',
                      borderRadius: '12px',
                      cursor: 'pointer',
                      fontWeight: '600',
                      fontSize: '0.85rem',
                      boxShadow: '0 4px 15px rgba(102, 126, 234, 0.4)',
                      transition: 'all 0.3s ease'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = 'translateY(-2px)';
                      e.currentTarget.style.boxShadow = '0 6px 20px rgba(102, 126, 234, 0.6)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = 'translateY(0)';
                      e.currentTarget.style.boxShadow = '0 4px 15px rgba(102, 126, 234, 0.4)';
                    }}
                  >
                    Manage Events
                  </button>
                </>
              )}
              <button onClick={logout} style={{
                padding: '0.5rem 1rem',
                background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
                color: 'white',
                border: 'none',
                borderRadius: '12px',
                cursor: 'pointer',
                fontWeight: '600',
                boxShadow: '0 4px 15px rgba(239, 68, 68, 0.4)',
                transition: 'all 0.3s ease'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = '0 6px 20px rgba(239, 68, 68, 0.6)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 4px 15px rgba(239, 68, 68, 0.4)';
              }}>
                Logout
              </button>
            </>
          ) : (
            <Link 
              to="/login" 
              style={{
                padding: '0.5rem 1.5rem',
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                color: 'white',
                textDecoration: 'none',
                borderRadius: '12px',
                fontWeight: '600',
                boxShadow: '0 4px 15px rgba(99, 102, 241, 0.4)',
                transition: 'all 0.3s ease',
                display: 'inline-block'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = '0 6px 20px rgba(99, 102, 241, 0.6)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 4px 15px rgba(99, 102, 241, 0.4)';
              }}
            >
              Login
            </Link>
          )}
        </div>
      </div>

      {/* Loading state */}
      {isLoading && (
        <div style={{ 
          textAlign: 'center', 
          padding: '3rem',
          background: 'rgba(255, 255, 255, 0.9)',
          borderRadius: '20px',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)'
        }}>
          <p style={{ 
            fontSize: '1.2rem',
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
            fontWeight: '600'
          }}>Loading events...</p>
        </div>
      )}

      {/* Error state */}
      {error && (
        <div style={{ 
          padding: '1.5rem', 
          marginBottom: '1.5rem', 
          background: 'linear-gradient(135deg, #fee2e2 0%, #fecaca 100%)',
          color: '#dc2626',
          borderRadius: '16px',
          border: '2px solid #fca5a5',
          boxShadow: '0 4px 15px rgba(239, 68, 68, 0.2)'
        }}>
          <p style={{ margin: '0 0 1rem 0', fontWeight: '500' }}>{error}</p>
          <button onClick={loadEvents} style={{
            padding: '0.75rem 1.5rem',
            background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
            color: 'white',
            border: 'none',
            borderRadius: '12px',
            cursor: 'pointer',
            fontWeight: '600',
            boxShadow: '0 4px 15px rgba(59, 130, 246, 0.4)',
            transition: 'all 0.3s ease'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(-2px)';
            e.currentTarget.style.boxShadow = '0 6px 20px rgba(59, 130, 246, 0.6)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = '0 4px 15px rgba(59, 130, 246, 0.4)';
          }}>
            Retry
          </button>
        </div>
      )}

      {/* Events list */}
      {!isLoading && !error && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.5rem' }}>
          {events.length === 0 ? (
            <div style={{ 
              gridColumn: '1 / -1', 
              textAlign: 'center', 
              padding: '3rem',
              background: 'rgba(255, 255, 255, 0.9)',
              borderRadius: '20px',
              boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)'
            }}>
              <p style={{ 
                color: '#6b7280',
                fontSize: '1.1rem',
                fontWeight: '500'
              }}>No events available at this time.</p>
            </div>
          ) : (
            events.map((event, index) => {
              const gradients = [
                'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
                'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
                'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
                'linear-gradient(135deg, #fa709a 0%, #fee140 100%)'
              ];
              const gradient = gradients[index % gradients.length];
              
              return (
                <div 
                  key={event.id}
                  style={{
                    background: 'rgba(255, 255, 255, 0.95)',
                    border: 'none',
                    borderRadius: '20px',
                    padding: '1.5rem',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '1rem',
                    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
                    transition: 'all 0.3s ease',
                    backdropFilter: 'blur(10px)'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-8px)';
                    e.currentTarget.style.boxShadow = '0 12px 40px rgba(0, 0, 0, 0.15)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = '0 8px 32px rgba(0, 0, 0, 0.1)';
                  }}
                >
                  <h3 style={{ 
                    margin: 0,
                    background: gradient,
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    backgroundClip: 'text',
                    fontSize: '1.5rem',
                    fontWeight: '700'
                  }}>{event.title}</h3>
                  {event.description && (
                    <p style={{ 
                      color: '#6b7280', 
                      fontSize: '0.9rem', 
                      margin: 0,
                      lineHeight: '1.6'
                    }}>
                      {event.description}
                    </p>
                  )}
                  <div style={{ 
                    fontSize: '0.9rem', 
                    color: '#4b5563',
                    background: 'rgba(99, 102, 241, 0.05)',
                    padding: '1rem',
                    borderRadius: '12px'
                  }}>
                    <p style={{ margin: '0.5rem 0' }}>
                      <strong style={{ color: '#1f2937' }}>Date:</strong> {new Date(event.event_date).toLocaleDateString()}
                    </p>
                    {event.location && (
                      <p style={{ margin: '0.5rem 0' }}>
                        <strong style={{ color: '#1f2937' }}>Location:</strong> {event.location}
                      </p>
                    )}
                    <p style={{ margin: '0.5rem 0' }}>
                      <strong style={{ color: '#1f2937' }}>Price:</strong> <span style={{ 
                        background: gradient,
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                        backgroundClip: 'text',
                        fontWeight: '700'
                      }}>Rp.{(typeof event.price === 'number' ? event.price : Number(event.price) || 0).toFixed(2)}</span>
                    </p>
                    <p style={{ margin: '0.5rem 0' }}>
                      <strong style={{ color: '#1f2937' }}>Available:</strong> {event.available_tickets} / {event.total_capacity}
                    </p>
                  </div>

                  {/* Access control: Show purchase button only if authenticated */}
                  {isAuthenticated ? (
                    <Link
                      to={`/purchase/${event.id}`}
                      style={{
                        marginTop: 'auto',
                        padding: '0.875rem',
                        background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                        color: 'white',
                        textDecoration: 'none',
                        textAlign: 'center',
                        borderRadius: '12px',
                        display: 'block',
                        fontWeight: '600',
                        boxShadow: '0 4px 15px rgba(16, 185, 129, 0.4)',
                        transition: 'all 0.3s ease'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.transform = 'translateY(-2px)';
                        e.currentTarget.style.boxShadow = '0 6px 20px rgba(16, 185, 129, 0.6)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.transform = 'translateY(0)';
                        e.currentTarget.style.boxShadow = '0 4px 15px rgba(16, 185, 129, 0.4)';
                      }}
                    >
                      Purchase Tickets
                    </Link>
                  ) : (
                    <div style={{
                      marginTop: 'auto',
                      padding: '0.875rem',
                      background: 'rgba(99, 102, 241, 0.1)',
                      borderRadius: '12px',
                      fontSize: '0.9rem',
                      textAlign: 'center'
                    }}>
                      <Link to="/login" style={{ 
                        color: '#6366f1', 
                        textDecoration: 'none',
                        fontWeight: '600'
                      }}>
                        Login to purchase
                      </Link>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      )}
    </div>
  );
};

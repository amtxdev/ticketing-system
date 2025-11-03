// Events Listing Page (Public)
// Displays all available events
// Shows authentication status and role-based actions
// Demonstrates API integration and access control UI

import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { eventService } from '../services/eventService';
import { Event, ApiError } from '../types';

export const EventsPage: React.FC = () => {
  const [events, setEvents] = useState<Event[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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
    <div style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto' }}>
      {/* Header with auth status */}
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        marginBottom: '2rem',
        paddingBottom: '1rem',
        borderBottom: '1px solid #eee'
      }}>
        <h1>Events</h1>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          {isAuthenticated ? (
            <>
              <span>Welcome, {user?.first_name} ({user?.role})</span>
              {isAdmin() && (
                <span style={{ 
                  padding: '0.25rem 0.5rem', 
                  backgroundColor: '#ffc107', 
                  borderRadius: '4px',
                  fontSize: '0.85rem'
                }}>
                  Admin
                </span>
              )}
              <button onClick={logout} style={{
                padding: '0.5rem 1rem',
                backgroundColor: '#dc3545',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer'
              }}>
                Logout
              </button>
            </>
          ) : (
            <Link 
              to="/login" 
              style={{
                padding: '0.5rem 1rem',
                backgroundColor: '#007bff',
                color: 'white',
                textDecoration: 'none',
                borderRadius: '4px'
              }}
            >
              Login
            </Link>
          )}
        </div>
      </div>

      {/* Loading state */}
      {isLoading && (
        <div style={{ textAlign: 'center', padding: '2rem' }}>
          <p>Loading events...</p>
        </div>
      )}

      {/* Error state */}
      {error && (
        <div style={{ 
          padding: '1rem', 
          marginBottom: '1rem', 
          backgroundColor: '#fee',
          color: '#c00',
          borderRadius: '4px'
        }}>
          <p>{error}</p>
          <button onClick={loadEvents} style={{
            marginTop: '0.5rem',
            padding: '0.5rem 1rem',
            backgroundColor: '#007bff',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer'
          }}>
            Retry
          </button>
        </div>
      )}

      {/* Events list */}
      {!isLoading && !error && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.5rem' }}>
          {events.length === 0 ? (
            <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '2rem', color: '#666' }}>
              <p>No events available at this time.</p>
            </div>
          ) : (
            events.map((event) => (
              <div 
                key={event.id}
                style={{
                  border: '1px solid #ddd',
                  borderRadius: '8px',
                  padding: '1.5rem',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.75rem'
                }}
              >
                <h3 style={{ margin: 0 }}>{event.title}</h3>
                {event.description && (
                  <p style={{ color: '#666', fontSize: '0.9rem', margin: 0 }}>
                    {event.description}
                  </p>
                )}
                <div style={{ fontSize: '0.9rem', color: '#666' }}>
                  <p style={{ margin: '0.25rem 0' }}>
                    <strong>Date:</strong> {new Date(event.event_date).toLocaleDateString()}
                  </p>
                  {event.location && (
                    <p style={{ margin: '0.25rem 0' }}>
                      <strong>Location:</strong> {event.location}
                    </p>
                  )}
                  <p style={{ margin: '0.25rem 0' }}>
                    <strong>Price:</strong> ${(typeof event.price === 'number' ? event.price : Number(event.price) || 0).toFixed(2)}
                  </p>
                  <p style={{ margin: '0.25rem 0' }}>
                    <strong>Available:</strong> {event.available_tickets} / {event.total_capacity}
                  </p>
                </div>

                {/* Access control: Show purchase button only if authenticated */}
                {isAuthenticated ? (
                  <Link
                    to={`/purchase/${event.id}`}
                    style={{
                      marginTop: 'auto',
                      padding: '0.75rem',
                      backgroundColor: '#28a745',
                      color: 'white',
                      textDecoration: 'none',
                      textAlign: 'center',
                      borderRadius: '4px',
                      display: 'block'
                    }}
                  >
                    Purchase Tickets
                  </Link>
                ) : (
                  <div style={{
                    marginTop: 'auto',
                    padding: '0.75rem',
                    backgroundColor: '#f8f9fa',
                    color: '#666',
                    textAlign: 'center',
                    borderRadius: '4px',
                    fontSize: '0.9rem'
                  }}>
                    <Link to="/login" style={{ color: '#007bff', textDecoration: 'none' }}>
                      Login to purchase
                    </Link>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};

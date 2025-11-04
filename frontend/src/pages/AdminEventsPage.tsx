// Admin Events Management Page
// Allows admin users to create, update, and delete events
// Requires admin authentication

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { eventService } from '../services/eventService';
import { Event, ApiError } from '../types';

interface EventFormData {
  title: string;
  description: string;
  venue: string;
  event_date: string;
  total_tickets: string;
  price: string;
  image_url: string;
  status: 'upcoming' | 'live' | 'completed' | 'cancelled';
}

export const AdminEventsPage: React.FC = () => {
  const [events, setEvents] = useState<Event[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editingEvent, setEditingEvent] = useState<Event | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const navigate = useNavigate();
  const { isAuthenticated, user, logout, isAdmin } = useAuth();

  const [formData, setFormData] = useState<EventFormData>({
    title: '',
    description: '',
    venue: '',
    event_date: '',
    total_tickets: '',
    price: '',
    image_url: '',
    status: 'upcoming',
  });

  useEffect(() => {
    if (!isAuthenticated || !isAdmin()) {
      navigate('/events');
      return;
    }
    loadEvents();
  }, [isAuthenticated, isAdmin, navigate]);

  const loadEvents = async () => {
    setIsLoading(true);
    setError(null);
    try {
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

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      venue: '',
      event_date: '',
      total_tickets: '',
      price: '',
      image_url: '',
      status: 'upcoming',
    });
    setEditingEvent(null);
    setShowForm(false);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleEdit = (event: Event) => {
    setEditingEvent(event);
    setFormData({
      title: event.title,
      description: event.description || '',
      venue: event.location || '',
      event_date: event.event_date ? new Date(event.event_date).toISOString().slice(0, 16) : '',
      total_tickets: event.total_capacity.toString(),
      price: event.price.toString(),
      image_url: '',
      status: 'upcoming',
    });
    setShowForm(true);
    setError(null);
    setSuccessMessage(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);
    setSuccessMessage(null);

    try {
      // Validation
      if (!formData.title.trim()) {
        setError('Title is required');
        setIsSubmitting(false);
        return;
      }

      if (!formData.event_date) {
        setError('Event date is required');
        setIsSubmitting(false);
        return;
      }

      if (!formData.total_tickets || parseInt(formData.total_tickets) < 1) {
        setError('Total tickets must be at least 1');
        setIsSubmitting(false);
        return;
      }

      if (!formData.price || parseFloat(formData.price) < 0) {
        setError('Price must be 0 or greater');
        setIsSubmitting(false);
        return;
      }

      // Backend expects venue and total_tickets, not location and total_capacity
      const eventPayload: any = {
        title: formData.title.trim(),
        description: formData.description.trim() || undefined,
        venue: formData.venue.trim() || undefined,
        event_date: new Date(formData.event_date).toISOString(),
        total_tickets: parseInt(formData.total_tickets),
        price: parseFloat(formData.price),
        image_url: formData.image_url.trim() || undefined,
      };

      if (editingEvent) {
        // Update existing event
        await eventService.updateEvent(editingEvent.id, eventPayload);
        setSuccessMessage('Event updated successfully!');
      } else {
        // Create new event
        await eventService.createEvent(eventPayload);
        setSuccessMessage('Event created successfully!');
      }

      resetForm();
      await loadEvents();
    } catch (err: any) {
      const apiError = err as ApiError;
      setError(apiError.message || 'Failed to save event');
      console.error('Error saving event:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('Are you sure you want to delete this event? This action cannot be undone.')) {
      return;
    }

    try {
      await eventService.deleteEvent(id);
      setSuccessMessage('Event deleted successfully!');
      await loadEvents();
    } catch (err: any) {
      const apiError = err as ApiError;
      setError(apiError.message || 'Failed to delete event');
      console.error('Error deleting event:', err);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (!isAuthenticated || !isAdmin()) {
    return null;
  }

  return (
    <div style={{ padding: '2rem', maxWidth: '1400px', margin: '0 auto', textAlign: 'left' }}>
      {/* Header */}
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
        <div>
          <h1 style={{
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
            margin: 0,
            fontSize: '2.5rem'
          }}>Admin - Events Management</h1>
          <p style={{ color: '#6b7280', marginTop: '0.5rem', margin: 0 }}>
            Manage events: create, update, and delete
          </p>
        </div>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <span style={{ 
            color: '#4b5563',
            fontWeight: '500'
          }}>Welcome, {user?.first_name} {user?.last_name}</span>
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
            onClick={() => navigate('/events')}
            style={{
              padding: '0.5rem 1rem',
              background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
              color: 'white',
              border: 'none',
              borderRadius: '12px',
              cursor: 'pointer',
              fontWeight: '600',
              boxShadow: '0 4px 15px rgba(59, 130, 246, 0.4)',
              transition: 'all 0.3s ease'
            }}
          >
            View Events
          </button>
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
          }}>
            Logout
          </button>
        </div>
      </div>

      {/* Messages */}
      {error && (
        <div style={{
          padding: '1rem',
          marginBottom: '1rem',
          background: '#fee2e2',
          color: '#991b1b',
          borderRadius: '12px',
          border: '1px solid #fecaca'
        }}>
          {error}
        </div>
      )}

      {successMessage && (
        <div style={{
          padding: '1rem',
          marginBottom: '1rem',
          background: '#d1fae5',
          color: '#065f46',
          borderRadius: '12px',
          border: '1px solid #a7f3d0'
        }}>
          {successMessage}
        </div>
      )}

      {/* Create/Edit Form */}
      {showForm && (
        <div style={{
          marginBottom: '2rem',
          padding: '2rem',
          background: 'rgba(255, 255, 255, 0.9)',
          borderRadius: '20px',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
          backdropFilter: 'blur(10px)'
        }}>
          <h2 style={{ marginTop: 0, marginBottom: '1.5rem', color: '#1f2937' }}>
            {editingEvent ? 'Edit Event' : 'Create New Event'}
          </h2>
          
          <form onSubmit={handleSubmit}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500', color: '#374151' }}>
                  Title *
                </label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  required
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    border: '2px solid #e5e7eb',
                    borderRadius: '8px',
                    fontSize: '1rem',
                    transition: 'border-color 0.3s'
                  }}
                  onFocus={(e) => e.currentTarget.style.borderColor = '#667eea'}
                  onBlur={(e) => e.currentTarget.style.borderColor = '#e5e7eb'}
                />
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500', color: '#374151' }}>
                  Venue
                </label>
                <input
                  type="text"
                  name="venue"
                  value={formData.venue}
                  onChange={handleInputChange}
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    border: '2px solid #e5e7eb',
                    borderRadius: '8px',
                    fontSize: '1rem',
                    transition: 'border-color 0.3s'
                  }}
                  onFocus={(e) => e.currentTarget.style.borderColor = '#667eea'}
                  onBlur={(e) => e.currentTarget.style.borderColor = '#e5e7eb'}
                />
              </div>
            </div>

            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500', color: '#374151' }}>
                Description
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                rows={4}
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  border: '2px solid #e5e7eb',
                  borderRadius: '8px',
                  fontSize: '1rem',
                  fontFamily: 'inherit',
                  resize: 'vertical',
                  transition: 'border-color 0.3s'
                }}
                onFocus={(e) => e.currentTarget.style.borderColor = '#667eea'}
                onBlur={(e) => e.currentTarget.style.borderColor = '#e5e7eb'}
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500', color: '#374151' }}>
                  Event Date & Time *
                </label>
                <input
                  type="datetime-local"
                  name="event_date"
                  value={formData.event_date}
                  onChange={handleInputChange}
                  required
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    border: '2px solid #e5e7eb',
                    borderRadius: '8px',
                    fontSize: '1rem',
                    transition: 'border-color 0.3s'
                  }}
                  onFocus={(e) => e.currentTarget.style.borderColor = '#667eea'}
                  onBlur={(e) => e.currentTarget.style.borderColor = '#e5e7eb'}
                />
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500', color: '#374151' }}>
                  Total Tickets *
                </label>
                <input
                  type="number"
                  name="total_tickets"
                  value={formData.total_tickets}
                  onChange={handleInputChange}
                  required
                  min="1"
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    border: '2px solid #e5e7eb',
                    borderRadius: '8px',
                    fontSize: '1rem',
                    transition: 'border-color 0.3s'
                  }}
                  onFocus={(e) => e.currentTarget.style.borderColor = '#667eea'}
                  onBlur={(e) => e.currentTarget.style.borderColor = '#e5e7eb'}
                />
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500', color: '#374151' }}>
                  Price *
                </label>
                <input
                  type="number"
                  name="price"
                  value={formData.price}
                  onChange={handleInputChange}
                  required
                  min="0"
                  step="0.01"
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    border: '2px solid #e5e7eb',
                    borderRadius: '8px',
                    fontSize: '1rem',
                    transition: 'border-color 0.3s'
                  }}
                  onFocus={(e) => e.currentTarget.style.borderColor = '#667eea'}
                  onBlur={(e) => e.currentTarget.style.borderColor = '#e5e7eb'}
                />
              </div>
            </div>

            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500', color: '#374151' }}>
                Image URL
              </label>
              <input
                type="url"
                name="image_url"
                value={formData.image_url}
                onChange={handleInputChange}
                placeholder="https://example.com/image.jpg"
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  border: '2px solid #e5e7eb',
                  borderRadius: '8px',
                  fontSize: '1rem',
                  transition: 'border-color 0.3s'
                }}
                onFocus={(e) => e.currentTarget.style.borderColor = '#667eea'}
                onBlur={(e) => e.currentTarget.style.borderColor = '#e5e7eb'}
              />
            </div>

            <div style={{ display: 'flex', gap: '1rem' }}>
              <button
                type="submit"
                disabled={isSubmitting}
                style={{
                  padding: '0.75rem 2rem',
                  background: isSubmitting 
                    ? '#9ca3af' 
                    : 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '12px',
                  cursor: isSubmitting ? 'not-allowed' : 'pointer',
                  fontWeight: '600',
                  fontSize: '1rem',
                  boxShadow: isSubmitting 
                    ? 'none' 
                    : '0 4px 15px rgba(16, 185, 129, 0.4)',
                  transition: 'all 0.3s ease'
                }}
              >
                {isSubmitting ? 'Saving...' : (editingEvent ? 'Update Event' : 'Create Event')}
              </button>
              <button
                type="button"
                onClick={resetForm}
                disabled={isSubmitting}
                style={{
                  padding: '0.75rem 2rem',
                  background: 'white',
                  color: '#374151',
                  border: '2px solid #e5e7eb',
                  borderRadius: '12px',
                  cursor: isSubmitting ? 'not-allowed' : 'pointer',
                  fontWeight: '600',
                  fontSize: '1rem',
                  transition: 'all 0.3s ease'
                }}
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Events List */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
        <h2 style={{ margin: 0, color: '#1f2937' }}>All Events ({events.length})</h2>
        {!showForm && (
          <button
            onClick={() => {
              resetForm();
              setShowForm(true);
            }}
            style={{
              padding: '0.75rem 1.5rem',
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              color: 'white',
              border: 'none',
              borderRadius: '12px',
              cursor: 'pointer',
              fontWeight: '600',
              fontSize: '1rem',
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
            + Create New Event
          </button>
        )}
      </div>

      {isLoading ? (
        <div style={{ padding: '3rem', textAlign: 'center', color: '#6b7280' }}>
          Loading events...
        </div>
      ) : events.length === 0 ? (
        <div style={{ padding: '3rem', textAlign: 'center', color: '#6b7280' }}>
          No events found. Create your first event!
        </div>
      ) : (
        <div style={{ display: 'grid', gap: '1.5rem' }}>
          {events.map((event) => (
            <div
              key={event.id}
              style={{
                padding: '1.5rem',
                background: 'rgba(255, 255, 255, 0.9)',
                borderRadius: '20px',
                boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
                backdropFilter: 'blur(10px)',
                transition: 'transform 0.3s ease, box-shadow 0.3s ease'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-4px)';
                e.currentTarget.style.boxShadow = '0 12px 40px rgba(0, 0, 0, 0.15)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 8px 32px rgba(0, 0, 0, 0.1)';
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                <div style={{ flex: 1 }}>
                  <h3 style={{ marginTop: 0, marginBottom: '0.5rem', color: '#1f2937', fontSize: '1.5rem' }}>
                    {event.title}
                  </h3>
                  {event.description && (
                    <p style={{ color: '#6b7280', marginBottom: '1rem', lineHeight: '1.6' }}>
                      {event.description}
                    </p>
                  )}
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '1rem' }}>
                    {event.location && (
                      <div>
                        <strong style={{ color: '#374151' }}>Venue:</strong>{' '}
                        <span style={{ color: '#6b7280' }}>{event.location}</span>
                      </div>
                    )}
                    <div>
                      <strong style={{ color: '#374151' }}>Date:</strong>{' '}
                      <span style={{ color: '#6b7280' }}>{formatDate(event.event_date)}</span>
                    </div>
                    <div>
                      <strong style={{ color: '#374151' }}>Price:</strong>{' '}
                      <span style={{ color: '#6b7280' }}>${event.price.toFixed(2)}</span>
                    </div>
                    <div>
                      <strong style={{ color: '#374151' }}>Available:</strong>{' '}
                      <span style={{ color: '#6b7280' }}>
                        {event.available_tickets} / {event.total_capacity}
                      </span>
                    </div>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '0.5rem', marginLeft: '1rem' }}>
                  <button
                    onClick={() => handleEdit(event)}
                    style={{
                      padding: '0.5rem 1rem',
                      background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
                      color: 'white',
                      border: 'none',
                      borderRadius: '8px',
                      cursor: 'pointer',
                      fontWeight: '500',
                      fontSize: '0.875rem',
                      boxShadow: '0 2px 8px rgba(59, 130, 246, 0.3)',
                      transition: 'all 0.3s ease'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = 'translateY(-2px)';
                      e.currentTarget.style.boxShadow = '0 4px 12px rgba(59, 130, 246, 0.5)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = 'translateY(0)';
                      e.currentTarget.style.boxShadow = '0 2px 8px rgba(59, 130, 246, 0.3)';
                    }}
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(event.id)}
                    style={{
                      padding: '0.5rem 1rem',
                      background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
                      color: 'white',
                      border: 'none',
                      borderRadius: '8px',
                      cursor: 'pointer',
                      fontWeight: '500',
                      fontSize: '0.875rem',
                      boxShadow: '0 2px 8px rgba(239, 68, 68, 0.3)',
                      transition: 'all 0.3s ease'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = 'translateY(-2px)';
                      e.currentTarget.style.boxShadow = '0 4px 12px rgba(239, 68, 68, 0.5)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = 'translateY(0)';
                      e.currentTarget.style.boxShadow = '0 2px 8px rgba(239, 68, 68, 0.3)';
                    }}
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};


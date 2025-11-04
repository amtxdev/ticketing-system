// Ticket Purchase Page (Protected)
// Handles ticket purchase for a specific event
// Requires authentication - demonstrates protected routes and API calls with auth

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { eventService } from '../services/eventService';
import { Event, Ticket, ApiError } from '../types';

export const PurchasePage: React.FC = () => {
  const { eventId } = useParams<{ eventId: string }>();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();

  const [event, setEvent] = useState<Event | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [isPurchasing, setIsPurchasing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [purchaseSuccess, setPurchaseSuccess] = useState<Ticket | null>(null);

  useEffect(() => {
    // This page is protected, so user should be authenticated
    // But we check anyway for safety
    if (!isAuthenticated) {
      navigate('/login', { state: { from: { pathname: `/purchase/${eventId}` } } });
      return;
    }

    loadEvent();
  }, [eventId, isAuthenticated, navigate]);

  const loadEvent = async () => {
    if (!eventId) {
      setError('Invalid event ID');
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);
    try {
      const data = await eventService.getEventById(Number(eventId));
      setEvent(data);
    } catch (err: any) {
      const apiError = err as ApiError;
      setError(apiError.message || 'Failed to load event details');
      console.error('Error loading event:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePurchase = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!event || !eventId) return;

    // Validation
    if (quantity < 1) {
      setError('Quantity must be at least 1');
      return;
    }

    if (quantity > event.available_tickets) {
      setError(`Only ${event.available_tickets} tickets available`);
      return;
    }

    setIsPurchasing(true);
    setError(null);

    try {
      // Call event service to purchase tickets
      // This requires authentication token (handled by apiClient)
      const ticket = await eventService.purchaseTickets({
        eventId: Number(eventId),
        quantity,
      });

      setPurchaseSuccess(ticket);
      
      // Optionally redirect after a delay
      // setTimeout(() => {
      //   navigate('/events');
      // }, 3000);
    } catch (err: any) {
      const apiError = err as ApiError;
      setError(apiError.message || 'Failed to purchase tickets');
      console.error('Purchase error:', err);
    } finally {
      setIsPurchasing(false);
    }
  };

  if (isLoading) {
    return (
      <div style={{ 
        padding: '3rem', 
        textAlign: 'center',
        background: 'rgba(255, 255, 255, 0.9)',
        borderRadius: '20px',
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
        maxWidth: '600px',
        margin: '2rem auto'
      }}>
        <p style={{ 
          fontSize: '1.2rem',
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text',
          fontWeight: '600'
        }}>Loading event details...</p>
      </div>
    );
  }

  if (error && !event) {
    return (
      <div style={{ padding: '2rem', maxWidth: '600px', margin: '0 auto' }}>
        <div style={{ 
          padding: '1.5rem', 
          background: 'linear-gradient(135deg, #fee2e2 0%, #fecaca 100%)',
          color: '#dc2626',
          borderRadius: '16px',
          marginBottom: '1.5rem',
          border: '2px solid #fca5a5',
          boxShadow: '0 4px 15px rgba(239, 68, 68, 0.2)'
        }}>
          <p style={{ margin: 0, fontWeight: '500' }}>{error}</p>
        </div>
        <Link to="/events" style={{
          padding: '0.75rem 1.5rem',
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          color: 'white',
          textDecoration: 'none',
          borderRadius: '12px',
          display: 'inline-block',
          fontWeight: '600',
          boxShadow: '0 4px 15px rgba(99, 102, 241, 0.4)',
          transition: 'all 0.3s ease'
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = 'translateY(-2px)';
          e.currentTarget.style.boxShadow = '0 6px 20px rgba(99, 102, 241, 0.6)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = 'translateY(0)';
          e.currentTarget.style.boxShadow = '0 4px 15px rgba(99, 102, 241, 0.4)';
        }}>
          Back to Events
        </Link>
      </div>
    );
  }

  if (purchaseSuccess) {
    return (
      <div style={{ padding: '2rem', maxWidth: '600px', margin: '0 auto' }}>
        <div style={{ 
          padding: '2rem', 
          background: 'linear-gradient(135deg, #d1fae5 0%, #a7f3d0 100%)',
          border: '2px solid #10b981',
          borderRadius: '20px',
          marginBottom: '1.5rem',
          boxShadow: '0 8px 32px rgba(16, 185, 129, 0.2)'
        }}>
          <h2 style={{ 
            background: 'linear-gradient(135deg, #059669 0%, #047857 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
            marginTop: 0,
            fontSize: '2rem',
            fontWeight: '700'
          }}>🎉 Purchase Successful!</h2>
          <p style={{ color: '#065f46', marginBottom: '0.5rem', fontWeight: '500' }}>
            Your tickets have been confirmed. Order ID: {purchaseSuccess.id}
          </p>
          <p style={{ color: '#065f46', fontSize: '0.9rem', margin: 0 }}>
            Quantity: {purchaseSuccess.quantity} | Total: <strong>${(typeof purchaseSuccess.total_price === 'number' ? purchaseSuccess.total_price : Number(purchaseSuccess.total_price) || 0).toFixed(2)}</strong>
          </p>
        </div>
        <Link to="/events" style={{
          padding: '0.75rem 1.5rem',
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          color: 'white',
          textDecoration: 'none',
          borderRadius: '12px',
          display: 'inline-block',
          fontWeight: '600',
          boxShadow: '0 4px 15px rgba(99, 102, 241, 0.4)',
          transition: 'all 0.3s ease'
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = 'translateY(-2px)';
          e.currentTarget.style.boxShadow = '0 6px 20px rgba(99, 102, 241, 0.6)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = 'translateY(0)';
          e.currentTarget.style.boxShadow = '0 4px 15px rgba(99, 102, 241, 0.4)';
        }}>
          Back to Events
        </Link>
      </div>
    );
  }

  if (!event) {
    return null;
  }

  const price = typeof event.price === 'number' ? event.price : Number(event.price) || 0;
  const totalPrice = price * quantity;
  const maxQuantity = Math.min(event.available_tickets, 10); // Limit purchase to 10 tickets

  return (
    <div style={{ 
      padding: '2rem', 
      maxWidth: '600px', 
      margin: '0 auto',
      background: 'rgba(255, 255, 255, 0.95)',
      borderRadius: '20px',
      boxShadow: '0 10px 40px rgba(0, 0, 0, 0.1)',
      backdropFilter: 'blur(10px)'
    }}>
      <Link to="/events" style={{
        marginBottom: '1.5rem',
        display: 'inline-block',
        color: '#6366f1',
        textDecoration: 'none',
        fontWeight: '600',
        transition: 'all 0.3s ease'
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.color = '#4f46e5';
        e.currentTarget.style.transform = 'translateX(-4px)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.color = '#6366f1';
        e.currentTarget.style.transform = 'translateX(0)';
      }}>
        ← Back to Events
      </Link>

      <h1 style={{
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
        backgroundClip: 'text',
        marginBottom: '1rem',
        fontSize: '2.5rem',
        fontWeight: '700'
      }}>{event.title}</h1>
      
      {event.description && (
        <p style={{ 
          color: '#6b7280', 
          marginBottom: '1.5rem',
          lineHeight: '1.6'
        }}>{event.description}</p>
      )}

      <div style={{ 
        background: 'rgba(99, 102, 241, 0.05)',
        border: '2px solid rgba(99, 102, 241, 0.1)', 
        borderRadius: '16px', 
        padding: '1.5rem',
        marginBottom: '1.5rem'
      }}>
        <div style={{ marginBottom: '1rem', color: '#4b5563' }}>
          <strong style={{ color: '#1f2937' }}>Event Date:</strong> {new Date(event.event_date).toLocaleString()}
        </div>
        {event.location && (
          <div style={{ marginBottom: '1rem', color: '#4b5563' }}>
            <strong style={{ color: '#1f2937' }}>Location:</strong> {event.location}
          </div>
        )}
        <div style={{ marginBottom: '1rem', color: '#4b5563' }}>
          <strong style={{ color: '#1f2937' }}>Available Tickets:</strong> {event.available_tickets} / {event.total_capacity}
        </div>
        <div style={{ marginBottom: 0, color: '#4b5563' }}>
          <strong style={{ 
            color: '#1f2937',
            background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text'
          }}>Price per Ticket:</strong> <span style={{
            background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
            fontWeight: '700',
            fontSize: '1.1rem'
          }}>Rp.{(typeof event.price === 'number' ? event.price : Number(event.price) || 0).toFixed(2)}</span>
        </div>
      </div>

      {error && (
        <div style={{ 
          padding: '1rem', 
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

      <form onSubmit={handlePurchase}>
        <div style={{ marginBottom: '1.5rem' }}>
          <label htmlFor="quantity" style={{ 
            display: 'block', 
            marginBottom: '0.5rem', 
            fontWeight: '600',
            color: '#1f2937'
          }}>
            Quantity
          </label>
          <input
            id="quantity"
            type="number"
            min="1"
            max={maxQuantity}
            value={quantity}
            onChange={(e) => setQuantity(Number(e.target.value))}
            required
            style={{ 
              width: '100px', 
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
          <span style={{ marginLeft: '0.5rem', color: '#6b7280', fontWeight: '500' }}>
            (Max: {maxQuantity} tickets)
          </span>
        </div>

        <div style={{ 
          padding: '1.5rem', 
          background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.1) 0%, rgba(236, 72, 153, 0.1) 100%)', 
          borderRadius: '16px',
          marginBottom: '1.5rem',
          border: '2px solid rgba(99, 102, 241, 0.2)'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ color: '#4b5563', fontWeight: '500' }}>Subtotal ({quantity} tickets):</span>
            <strong style={{
              background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
              fontSize: '1.5rem',
              fontWeight: '700'
            }}>Rp.{totalPrice.toFixed(2)}</strong>
          </div>
        </div>

        <button
          type="submit"
          disabled={isPurchasing || event.available_tickets === 0 || quantity < 1}
          style={{
            width: '100%',
            padding: '1rem',
            fontSize: '1.1rem',
            background: (isPurchasing || event.available_tickets === 0 || quantity < 1)
              ? 'linear-gradient(135deg, #9ca3af 0%, #6b7280 100%)'
              : 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
            color: 'white',
            border: 'none',
            borderRadius: '12px',
            cursor: (isPurchasing || event.available_tickets === 0 || quantity < 1) ? 'not-allowed' : 'pointer',
            opacity: (isPurchasing || event.available_tickets === 0 || quantity < 1) ? 0.7 : 1,
            fontWeight: '600',
            boxShadow: (isPurchasing || event.available_tickets === 0 || quantity < 1)
              ? 'none'
              : '0 4px 15px rgba(16, 185, 129, 0.4)',
            transition: 'all 0.3s ease'
          }}
          onMouseEnter={(e) => {
            if (!isPurchasing && event.available_tickets > 0 && quantity >= 1) {
              e.currentTarget.style.transform = 'translateY(-2px)';
              e.currentTarget.style.boxShadow = '0 6px 20px rgba(16, 185, 129, 0.6)';
            }
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = (isPurchasing || event.available_tickets === 0 || quantity < 1)
              ? 'none'
              : '0 4px 15px rgba(16, 185, 129, 0.4)';
          }}
        >
          {isPurchasing ? 'Processing...' : event.available_tickets === 0 ? 'Sold Out' : `Purchase ${quantity} Ticket${quantity > 1 ? 's' : ''}`}
        </button>
      </form>

      <div style={{ marginTop: '1.5rem', fontSize: '0.9rem', color: '#6b7280', textAlign: 'center' }}>
        <p>Purchasing as: <strong style={{ color: '#6366f1' }}>{user?.email}</strong></p>
      </div>
    </div>
  );
};

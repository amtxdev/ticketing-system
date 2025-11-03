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
      <div style={{ padding: '2rem', textAlign: 'center' }}>
        <p>Loading event details...</p>
      </div>
    );
  }

  if (error && !event) {
    return (
      <div style={{ padding: '2rem', maxWidth: '600px', margin: '0 auto' }}>
        <div style={{ 
          padding: '1rem', 
          backgroundColor: '#fee',
          color: '#c00',
          borderRadius: '4px',
          marginBottom: '1rem'
        }}>
          <p>{error}</p>
        </div>
        <Link to="/events" style={{
          padding: '0.5rem 1rem',
          backgroundColor: '#007bff',
          color: 'white',
          textDecoration: 'none',
          borderRadius: '4px',
          display: 'inline-block'
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
          padding: '1.5rem', 
          backgroundColor: '#d4edda',
          border: '1px solid #c3e6cb',
          borderRadius: '8px',
          marginBottom: '1rem'
        }}>
          <h2 style={{ color: '#155724', marginTop: 0 }}>Purchase Successful!</h2>
          <p style={{ color: '#155724' }}>
            Your tickets have been confirmed. Order ID: {purchaseSuccess.id}
          </p>
          <p style={{ color: '#155724', fontSize: '0.9rem' }}>
            Quantity: {purchaseSuccess.quantity} | Total: ${(typeof purchaseSuccess.total_price === 'number' ? purchaseSuccess.total_price : Number(purchaseSuccess.total_price) || 0).toFixed(2)}
          </p>
        </div>
        <Link to="/events" style={{
          padding: '0.75rem 1.5rem',
          backgroundColor: '#007bff',
          color: 'white',
          textDecoration: 'none',
          borderRadius: '4px',
          display: 'inline-block'
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
    <div style={{ padding: '2rem', maxWidth: '600px', margin: '0 auto' }}>
      <Link to="/events" style={{
        marginBottom: '1rem',
        display: 'inline-block',
        color: '#007bff',
        textDecoration: 'none'
      }}>
        ← Back to Events
      </Link>

      <h1>{event.title}</h1>
      
      {event.description && (
        <p style={{ color: '#666', marginBottom: '1.5rem' }}>{event.description}</p>
      )}

      <div style={{ 
        border: '1px solid #ddd', 
        borderRadius: '8px', 
        padding: '1.5rem',
        marginBottom: '1.5rem'
      }}>
        <div style={{ marginBottom: '1rem' }}>
          <strong>Event Date:</strong> {new Date(event.event_date).toLocaleString()}
        </div>
        {event.location && (
          <div style={{ marginBottom: '1rem' }}>
            <strong>Location:</strong> {event.location}
          </div>
        )}
        <div style={{ marginBottom: '1rem' }}>
          <strong>Available Tickets:</strong> {event.available_tickets} / {event.total_capacity}
        </div>
        <div style={{ marginBottom: '1rem' }}>
          <strong>Price per Ticket:</strong> ${(typeof event.price === 'number' ? event.price : Number(event.price) || 0).toFixed(2)}
        </div>
      </div>

      {error && (
        <div style={{ 
          padding: '1rem', 
          marginBottom: '1rem', 
          backgroundColor: '#fee',
          color: '#c00',
          borderRadius: '4px'
        }}>
          {error}
        </div>
      )}

      <form onSubmit={handlePurchase}>
        <div style={{ marginBottom: '1.5rem' }}>
          <label htmlFor="quantity" style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
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
              padding: '0.5rem',
              fontSize: '1rem',
              border: '1px solid #ccc',
              borderRadius: '4px'
            }}
          />
          <span style={{ marginLeft: '0.5rem', color: '#666' }}>
            (Max: {maxQuantity} tickets)
          </span>
        </div>

        <div style={{ 
          padding: '1rem', 
          backgroundColor: '#f8f9fa', 
          borderRadius: '4px',
          marginBottom: '1.5rem'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
            <span>Subtotal ({quantity} tickets):</span>
            <strong>${totalPrice.toFixed(2)}</strong>
          </div>
          {/* Stub: Additional fees could be calculated here */}
        </div>

        <button
          type="submit"
          disabled={isPurchasing || event.available_tickets === 0 || quantity < 1}
          style={{
            width: '100%',
            padding: '1rem',
            fontSize: '1.1rem',
            backgroundColor: event.available_tickets === 0 ? '#ccc' : '#28a745',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: (isPurchasing || event.available_tickets === 0 || quantity < 1) ? 'not-allowed' : 'pointer',
            opacity: (isPurchasing || event.available_tickets === 0 || quantity < 1) ? 0.6 : 1
          }}
        >
          {isPurchasing ? 'Processing...' : event.available_tickets === 0 ? 'Sold Out' : `Purchase ${quantity} Ticket${quantity > 1 ? 's' : ''}`}
        </button>
      </form>

      <div style={{ marginTop: '1rem', fontSize: '0.9rem', color: '#666' }}>
        <p>Purchasing as: <strong>{user?.email}</strong></p>
      </div>
    </div>
  );
};

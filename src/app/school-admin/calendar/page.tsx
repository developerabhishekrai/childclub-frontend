'use client';

import React, { useState, useEffect } from 'react';
import { Calendar as CalendarIcon, Plus, Edit, Trash2, X, MapPin, Clock, AlertCircle } from 'lucide-react';
import 'bootstrap/dist/css/bootstrap.min.css';
import Swal from 'sweetalert2';
import { API_BASE_URL } from '@/lib/api';

interface CalendarEvent {
  id: number;
  title: string;
  description: string;
  eventType: string;
  startDate: string;
  endDate: string;
  allDay: number;
  location: string;
  color: string;
  priority: string;
  status: string;
}

const eventTypes = [
  { value: 'academic', label: 'Academic', color: '#007bff' },
  { value: 'event', label: 'Event', color: '#17a2b8' },
  { value: 'activity', label: 'Activity', color: '#28a745' },
  { value: 'exam', label: 'Exam', color: '#dc3545' },
  { value: 'holiday', label: 'Holiday', color: '#6c757d' },
  { value: 'meeting', label: 'Meeting', color: '#ffc107' }
];

const priorities = [
  { value: 'low', label: 'Low', badge: 'secondary' },
  { value: 'medium', label: 'Medium', badge: 'primary' },
  { value: 'high', label: 'High', badge: 'danger' }
];

export default function SchoolAdminCalendar() {
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [currentEvent, setCurrentEvent] = useState<CalendarEvent | null>(null);
  const [filter, setFilter] = useState('all');

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    eventType: 'event',
    startDate: '',
    endDate: '',
    allDay: false,
    location: '',
    color: '#007bff',
    priority: 'medium'
  });

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      if (!token) {
        Swal.fire('Error', 'Please login again', 'error');
        return;
      }

      const response = await fetch(`${API_BASE_URL}/calendar`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setEvents(data);
      } else {
        console.error('Failed to fetch events');
      }
    } catch (error) {
      console.error('Error fetching events:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const token = localStorage.getItem('token');
      
      const url = editMode && currentEvent 
        ? `${API_BASE_URL}/calendar/${currentEvent.id}`
        : `${API_BASE_URL}/calendar`;
      
      const method = editMode ? 'PATCH' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        Swal.fire({
          icon: 'success',
          title: editMode ? 'Event Updated!' : 'Event Created!',
          text: `Calendar event has been ${editMode ? 'updated' : 'created'} successfully`,
          confirmButtonColor: '#28a745'
        });
        
        fetchEvents();
        handleCloseModal();
      } else {
        const error = await response.json();
        Swal.fire('Error', error.message || 'Failed to save event', 'error');
      }
    } catch (error) {
      console.error('Error saving event:', error);
      Swal.fire('Error', 'Failed to save event', 'error');
    }
  };

  const handleEdit = (event: CalendarEvent) => {
    setEditMode(true);
    setCurrentEvent(event);
    setFormData({
      title: event.title,
      description: event.description || '',
      eventType: event.eventType,
      startDate: event.startDate ? new Date(event.startDate).toISOString().slice(0, 16) : '',
      endDate: event.endDate ? new Date(event.endDate).toISOString().slice(0, 16) : '',
      allDay: event.allDay === 1,
      location: event.location || '',
      color: event.color || '#007bff',
      priority: event.priority
    });
    setShowModal(true);
  };

  const handleDelete = async (id: number) => {
    const result = await Swal.fire({
      title: 'Are you sure?',
      text: 'Do you want to delete this event?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#dc3545',
      cancelButtonColor: '#6c757d',
      confirmButtonText: 'Yes, delete it!'
    });

    if (result.isConfirmed) {
      try {
        const token = localStorage.getItem('token');
        
        const response = await fetch(`${API_BASE_URL}/calendar/${id}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });

        if (response.ok) {
          Swal.fire('Deleted!', 'Event has been deleted.', 'success');
          fetchEvents();
        } else {
          Swal.fire('Error', 'Failed to delete event', 'error');
        }
      } catch (error) {
        console.error('Error deleting event:', error);
        Swal.fire('Error', 'Failed to delete event', 'error');
      }
    }
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditMode(false);
    setCurrentEvent(null);
    setFormData({
      title: '',
      description: '',
      eventType: 'event',
      startDate: '',
      endDate: '',
      allDay: false,
      location: '',
      color: '#007bff',
      priority: 'medium'
    });
  };

  const handleAddNew = () => {
    setEditMode(false);
    setCurrentEvent(null);
    setShowModal(true);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const filteredEvents = filter === 'all' 
    ? events 
    : events.filter(event => event.eventType === filter);

  return (
    <div className="container-fluid py-4">
      <style jsx>{`
        .event-card {
          transition: all 0.3s ease;
          border-left: 4px solid;
          border-radius: 0.5rem;
        }
        .event-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        }
        .filter-btn {
          transition: all 0.3s ease;
          border-radius: 2rem;
          padding: 0.5rem 1.5rem;
        }
        .filter-btn:hover {
          transform: translateY(-2px);
        }
        .modal-content {
          border-radius: 1rem;
        }
        .priority-badge {
          font-size: 0.75rem;
          padding: 0.25rem 0.75rem;
          border-radius: 1rem;
        }
      `}</style>

      {/* Header */}
      <div className="row mb-4">
        <div className="col-12">
          <div className="d-flex justify-content-between align-items-center">
            <div>
              <h2 className="mb-1">
                <CalendarIcon className="me-2" size={32} style={{ display: 'inline' }} />
                School Calendar
              </h2>
              <p className="text-muted">Manage school events and activities</p>
            </div>
            <button 
              className="btn btn-primary d-flex align-items-center"
              onClick={handleAddNew}
            >
              <Plus size={20} className="me-2" />
              Add Event
            </button>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="row mb-4">
        <div className="col-md-3">
          <div className="card border-0 shadow-sm">
            <div className="card-body text-center">
              <h3 className="mb-0">{events.length}</h3>
              <small className="text-muted">Total Events</small>
            </div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card border-0 shadow-sm">
            <div className="card-body text-center">
              <h3 className="mb-0">{events.filter(e => e.eventType === 'exam').length}</h3>
              <small className="text-muted">Exams</small>
            </div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card border-0 shadow-sm">
            <div className="card-body text-center">
              <h3 className="mb-0">{events.filter(e => e.eventType === 'activity').length}</h3>
              <small className="text-muted">Activities</small>
            </div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card border-0 shadow-sm">
            <div className="card-body text-center">
              <h3 className="mb-0">{events.filter(e => e.eventType === 'holiday').length}</h3>
              <small className="text-muted">Holidays</small>
            </div>
          </div>
        </div>
      </div>

      {/* Filter Buttons */}
      <div className="row mb-4">
        <div className="col-12">
          <div className="d-flex gap-2 flex-wrap">
            <button 
              className={`filter-btn btn ${filter === 'all' ? 'btn-primary' : 'btn-outline-primary'}`}
              onClick={() => setFilter('all')}
            >
              All Events
            </button>
            {eventTypes.map(type => (
              <button 
                key={type.value}
                className={`filter-btn btn ${filter === type.value ? 'btn-primary' : 'btn-outline-primary'}`}
                onClick={() => setFilter(type.value)}
              >
                {type.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Events List */}
      <div className="row">
        <div className="col-12">
          {loading ? (
            <div className="text-center py-5">
              <div className="spinner-border text-primary" role="status">
                <span className="visually-hidden">Loading...</span>
              </div>
            </div>
          ) : filteredEvents.length === 0 ? (
            <div className="alert alert-info">
              <AlertCircle className="me-2" size={20} style={{ display: 'inline' }} />
              No events found. Click "Add Event" to create your first event.
            </div>
          ) : (
            <div className="row">
              {filteredEvents.map(event => (
                <div key={event.id} className="col-md-6 col-lg-4 mb-3">
                  <div 
                    className="card event-card border-0 shadow-sm h-100" 
                    style={{ borderLeftColor: event.color }}
                  >
                    <div className="card-body">
                      <div className="d-flex justify-content-between align-items-start mb-2">
                        <h5 className="card-title mb-0">{event.title}</h5>
                        <div className="d-flex gap-1">
                          <button 
                            className="btn btn-sm btn-outline-primary"
                            onClick={() => handleEdit(event)}
                          >
                            <Edit size={16} />
                          </button>
                          <button 
                            className="btn btn-sm btn-outline-danger"
                            onClick={() => handleDelete(event.id)}
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </div>
                      
                      <div className="mb-2">
                        <span className={`badge bg-${priorities.find(p => p.value === event.priority)?.badge} priority-badge me-2`}>
                          {event.priority.toUpperCase()}
                        </span>
                        <span className="badge bg-secondary priority-badge">
                          {event.eventType.toUpperCase()}
                        </span>
                      </div>

                      {event.description && (
                        <p className="card-text text-muted small mb-2">{event.description}</p>
                      )}

                      <div className="mt-3">
                        <div className="d-flex align-items-start mb-2">
                          <Clock size={16} className="me-2 text-muted mt-1" />
                          <div className="flex-grow-1">
                            <small className="text-muted d-block">
                              <strong>Start:</strong> {formatDate(event.startDate)}
                            </small>
                            {event.endDate && (
                              <small className="text-muted d-block">
                                <strong>End:</strong> {formatDate(event.endDate)}
                              </small>
                            )}
                          </div>
                        </div>
                        
                        {event.location && (
                          <div className="d-flex align-items-center">
                            <MapPin size={16} className="me-2 text-muted" />
                            <small className="text-muted">{event.location}</small>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-lg modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">
                  {editMode ? 'Edit Event' : 'Add New Event'}
                </h5>
                <button type="button" className="btn-close" onClick={handleCloseModal}></button>
              </div>
              <form onSubmit={handleSubmit}>
                <div className="modal-body">
                  <div className="row">
                    <div className="col-md-6 mb-3">
                      <label className="form-label">Event Title *</label>
                      <input
                        type="text"
                        className="form-control"
                        value={formData.title}
                        onChange={(e) => setFormData({...formData, title: e.target.value})}
                        required
                      />
                    </div>
                    <div className="col-md-6 mb-3">
                      <label className="form-label">Event Type *</label>
                      <select
                        className="form-select"
                        value={formData.eventType}
                        onChange={(e) => {
                          const selectedType = eventTypes.find(t => t.value === e.target.value);
                          setFormData({
                            ...formData, 
                            eventType: e.target.value,
                            color: selectedType?.color || '#007bff'
                          });
                        }}
                        required
                      >
                        {eventTypes.map(type => (
                          <option key={type.value} value={type.value}>{type.label}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="mb-3">
                    <label className="form-label">Description</label>
                    <textarea
                      className="form-control"
                      rows={3}
                      value={formData.description}
                      onChange={(e) => setFormData({...formData, description: e.target.value})}
                    />
                  </div>

                  <div className="row">
                    <div className="col-md-6 mb-3">
                      <label className="form-label">Start Date & Time *</label>
                      <input
                        type="datetime-local"
                        className="form-control"
                        value={formData.startDate}
                        onChange={(e) => setFormData({...formData, startDate: e.target.value})}
                        required
                      />
                    </div>
                    <div className="col-md-6 mb-3">
                      <label className="form-label">End Date & Time</label>
                      <input
                        type="datetime-local"
                        className="form-control"
                        value={formData.endDate}
                        onChange={(e) => setFormData({...formData, endDate: e.target.value})}
                      />
                    </div>
                  </div>

                  <div className="row">
                    <div className="col-md-6 mb-3">
                      <label className="form-label">Location</label>
                      <input
                        type="text"
                        className="form-control"
                        value={formData.location}
                        onChange={(e) => setFormData({...formData, location: e.target.value})}
                        placeholder="e.g., School Hall"
                      />
                    </div>
                    <div className="col-md-6 mb-3">
                      <label className="form-label">Priority *</label>
                      <select
                        className="form-select"
                        value={formData.priority}
                        onChange={(e) => setFormData({...formData, priority: e.target.value})}
                        required
                      >
                        {priorities.map(p => (
                          <option key={p.value} value={p.value}>{p.label}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="form-check mb-3">
                    <input
                      type="checkbox"
                      className="form-check-input"
                      id="allDay"
                      checked={formData.allDay}
                      onChange={(e) => setFormData({...formData, allDay: e.target.checked})}
                    />
                    <label className="form-check-label" htmlFor="allDay">
                      All Day Event
                    </label>
                  </div>
                </div>
                <div className="modal-footer">
                  <button type="button" className="btn btn-secondary" onClick={handleCloseModal}>
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-primary">
                    {editMode ? 'Update Event' : 'Create Event'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

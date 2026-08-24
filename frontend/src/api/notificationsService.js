/**
 * VSB SmartCampus — Notifications Service
 */
import api from './apiClient';

// Get all notifications (role-filtered by backend)
export const getNotifications = (role) =>
  api.get('/notifications', { role });

// Create a notification (Admin/Principal only)
export const createNotification = (data) =>
  api.post('/notifications', data);

// Get unread count
export const getUnreadCount = (role) =>
  api.get('/notifications/unread-count', { role });

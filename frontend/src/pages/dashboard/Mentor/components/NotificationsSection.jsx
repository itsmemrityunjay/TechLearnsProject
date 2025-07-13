import React, { useState } from 'react';
import { FaCheckCircle, FaExclamationCircle, FaInfoCircle, FaBell, FaTrash } from 'react-icons/fa';

const NotificationsSection = ({ notifications = [], onMarkAsRead, onDeleteAll }) => {
    const [filter, setFilter] = useState('all');

    // Ensure notifications is always an array
    const notificationsArray = Array.isArray(notifications) ? notifications : [];

    const getFilteredNotifications = () => {
        if (filter === 'all') return notificationsArray;
        if (filter === 'unread') return notificationsArray.filter(n => !n.read);
        if (filter === 'read') return notificationsArray.filter(n => n.read);
        return notificationsArray;
    };

    const getNotificationIcon = (type) => {
        switch (type?.toLowerCase()) {
            case 'success':
                return <FaCheckCircle className="text-green-500" />;
            case 'alert':
                return <FaExclamationCircle className="text-red-500" />;
            case 'info':
            default:
                return <FaInfoCircle className="text-blue-500" />;
        }
    };

    const formatDate = (dateString) => {
        const now = new Date();
        const notificationDate = new Date(dateString);

        const diffMs = now - notificationDate;
        const diffSecs = Math.floor(diffMs / 1000);
        const diffMins = Math.floor(diffSecs / 60);
        const diffHours = Math.floor(diffMins / 60);
        const diffDays = Math.floor(diffHours / 24);

        if (diffSecs < 60) {
            return 'Just now';
        } else if (diffMins < 60) {
            return `${diffMins} minute${diffMins !== 1 ? 's' : ''} ago`;
        } else if (diffHours < 24) {
            return `${diffHours} hour${diffHours !== 1 ? 's' : ''} ago`;
        } else if (diffDays < 7) {
            return `${diffDays} day${diffDays !== 1 ? 's' : ''} ago`;
        } else {
            return notificationDate.toLocaleDateString(undefined, {
                year: 'numeric',
                month: 'short',
                day: 'numeric'
            });
        }
    };

    const filteredNotifications = getFilteredNotifications();
    const unreadCount = notificationsArray.filter(n => !n.read).length;

    return (
        <div className="bg-white shadow rounded-lg overflow-hidden">
            <div className="bg-gradient-to-r from-indigo-600 to-purple-600 px-6 py-4">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                    <div className="flex items-center">
                        <h2 className="text-2xl font-bold text-white">Notifications</h2>
                        {unreadCount > 0 && (
                            <span className="ml-2 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-red-100 bg-red-600 rounded-full">
                                {unreadCount} unread
                            </span>
                        )}
                    </div>
                    {notificationsArray.length > 0 && (
                        <button
                            onClick={onDeleteAll}
                            className="mt-4 md:mt-0 px-4 py-2 bg-white text-indigo-600 rounded-md hover:bg-gray-100 transition-colors"
                        >
                            <FaTrash className="inline mr-1" /> Clear All
                        </button>
                    )}
                </div>
            </div>

            <div className="p-6">
                {/* Filter Tabs */}
                <div className="border-b border-gray-200 mb-6">
                    <nav className="-mb-px flex" aria-label="Tabs">
                        <button
                            className={`${filter === 'all'
                                ? 'border-indigo-500 text-indigo-600'
                                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm mr-8`}
                            onClick={() => setFilter('all')}
                        >
                            All Notifications
                        </button>
                        <button
                            className={`${filter === 'unread'
                                ? 'border-indigo-500 text-indigo-600'
                                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm mr-8`}
                            onClick={() => setFilter('unread')}
                        >
                            Unread
                        </button>
                        <button
                            className={`${filter === 'read'
                                ? 'border-indigo-500 text-indigo-600'
                                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
                            onClick={() => setFilter('read')}
                        >
                            Read
                        </button>
                    </nav>
                </div>

                {filteredNotifications.length > 0 ? (
                    <div className="space-y-4">
                        {filteredNotifications.map((notification) => (
                            <div
                                key={notification._id}
                                className={`p-4 rounded-lg border ${notification.read
                                    ? 'bg-white border-gray-200'
                                    : 'bg-indigo-50 border-indigo-200'
                                    }`}
                                onClick={() => !notification.read && onMarkAsRead(notification._id)}
                            >
                                <div className="flex">
                                    <div className="flex-shrink-0 mt-0.5">
                                        {getNotificationIcon(notification.type)}
                                    </div>
                                    <div className="ml-3 flex-1">
                                        <div className="flex items-center justify-between">
                                            <p className={`text-sm font-medium ${notification.read ? 'text-gray-900' : 'text-indigo-900'}`}>
                                                {notification.title || 'Notification'}
                                            </p>
                                            <p className="text-xs text-gray-500">
                                                {formatDate(notification.createdAt)}
                                            </p>
                                        </div>
                                        <p className={`mt-1 text-sm ${notification.read ? 'text-gray-600' : 'text-indigo-700'}`}>
                                            {notification.message}
                                        </p>
                                        {notification.actionUrl && (
                                            <a
                                                href={notification.actionUrl}
                                                className="mt-2 inline-flex items-center px-2.5 py-1.5 border border-transparent text-xs font-medium rounded text-indigo-700 bg-indigo-100 hover:bg-indigo-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                                            >
                                                View Details
                                            </a>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-10">
                        <FaBell className="mx-auto h-12 w-12 text-gray-400" />
                        <h3 className="mt-2 text-sm font-medium text-gray-900">No notifications</h3>
                        <p className="mt-1 text-sm text-gray-500">
                            {filter === 'all'
                                ? "You don't have any notifications yet."
                                : filter === 'unread'
                                    ? "You don't have any unread notifications."
                                    : "You don't have any read notifications."}
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default NotificationsSection;
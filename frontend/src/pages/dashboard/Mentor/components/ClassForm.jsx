import React, { useState, useEffect } from 'react';
import { FaSave, FaTimes, FaLink } from 'react-icons/fa';

const ClassForm = ({ classData = null, onSubmit, onCancel, courses }) => {
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        courseId: '',
        startTime: '',
        endTime: '',
        meetingLink: '',
        meetingPassword: '',
        maxStudents: 50,
        isPublic: true,
        topics: []
    });
    const [newTopic, setNewTopic] = useState('');
    const [error, setError] = useState('');

    useEffect(() => {
        if (classData) {
            // Format dates for datetime-local input
            const formatDateTimeForInput = (dateString) => {
                const date = new Date(dateString);
                return date.toISOString().slice(0, 16);
            };

            setFormData({
                title: classData.title || '',
                description: classData.description || '',
                courseId: classData.courseId || '',
                startTime: classData.startTime ? formatDateTimeForInput(classData.startTime) : '',
                endTime: classData.endTime ? formatDateTimeForInput(classData.endTime) : '',
                meetingLink: classData.meetingLink || '',
                meetingPassword: classData.meetingPassword || '',
                maxStudents: classData.maxStudents || 50,
                isPublic: classData.isPublic !== undefined ? classData.isPublic : true,
                topics: classData.topics || []
            });
        } else {
            // Set default start/end times for new class (1 hour from now, 2 hours from now)
            const now = new Date();
            const startTime = new Date(now.getTime() + 60 * 60 * 1000); // 1 hour from now
            const endTime = new Date(now.getTime() + 2 * 60 * 60 * 1000); // 2 hours from now

            const formatDateTimeForInput = (date) => {
                return date.toISOString().slice(0, 16);
            };

            setFormData(prev => ({
                ...prev,
                startTime: formatDateTimeForInput(startTime),
                endTime: formatDateTimeForInput(endTime)
            }));
        }
    }, [classData]);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData({
            ...formData,
            [name]: type === 'checkbox' ? checked : value
        });
    };

    const handleAddTopic = () => {
        if (newTopic.trim() !== '' && !formData.topics.includes(newTopic.trim())) {
            setFormData({
                ...formData,
                topics: [...formData.topics, newTopic.trim()]
            });
            setNewTopic('');
        }
    };

    const handleRemoveTopic = (topicToRemove) => {
        setFormData({
            ...formData,
            topics: formData.topics.filter(topic => topic !== topicToRemove)
        });
    };

    const generateMeetingLink = () => {
        // This would typically integrate with Zoom/Google Meet/etc. API
        // For now, we'll just generate a placeholder link
        const baseUrl = 'https://meet.example.com/';
        const randomId = Math.random().toString(36).substring(2, 10);
        setFormData({
            ...formData,
            meetingLink: `${baseUrl}${randomId}`
        });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        setError('');

        // Validation
        if (!formData.title.trim()) {
            setError('Class title is required');
            return;
        }

        if (!formData.startTime) {
            setError('Start time is required');
            return;
        }

        if (!formData.endTime) {
            setError('End time is required');
            return;
        }

        if (new Date(formData.startTime) >= new Date(formData.endTime)) {
            setError('End time must be after start time');
            return;
        }

        if (new Date(formData.startTime) < new Date()) {
            setError('Start time cannot be in the past');
            return;
        }

        if (!formData.meetingLink.trim()) {
            setError('Meeting link is required');
            return;
        }

        onSubmit(formData);
    };

    return (
        <div className="bg-white shadow rounded-lg overflow-hidden">
            <div className="bg-gradient-to-r from-indigo-600 to-purple-600 px-6 py-4">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                    <h2 className="text-2xl font-bold text-white">
                        {classData ? 'Edit Class' : 'Schedule New Class'}
                    </h2>
                    <button
                        type="button"
                        onClick={onCancel}
                        className="mt-4 md:mt-0 px-4 py-2 bg-white text-indigo-600 rounded-md hover:bg-gray-100 transition-colors"
                    >
                        <FaTimes className="inline mr-1" /> Cancel
                    </button>
                </div>
            </div>

            {error && (
                <div className="bg-red-50 border-l-4 border-red-500 p-4 m-6">
                    <div className="flex items-center">
                        <div className="flex-shrink-0">
                            <svg
                                className="h-5 w-5 text-red-400"
                                xmlns="http://www.w3.org/2000/svg"
                                viewBox="0 0 20 20"
                                fill="currentColor"
                            >
                                <path
                                    fillRule="evenodd"
                                    d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                                    clipRule="evenodd"
                                />
                            </svg>
                        </div>
                        <div className="ml-3">
                            <p className="text-sm text-red-700">{error}</p>
                        </div>
                    </div>
                </div>
            )}

            <div className="p-6">
                <form onSubmit={handleSubmit}>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Class Title
                            </label>
                            <input
                                type="text"
                                name="title"
                                value={formData.title}
                                onChange={handleChange}
                                className="block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                placeholder="e.g., Introduction to JavaScript ES6 Features"
                                required
                            />
                        </div>

                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Description
                            </label>
                            <textarea
                                name="description"
                                value={formData.description}
                                onChange={handleChange}
                                rows={3}
                                className="block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                placeholder="Brief description about this class"
                            ></textarea>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Associated Course
                            </label>
                            <select
                                name="courseId"
                                value={formData.courseId}
                                onChange={handleChange}
                                className="block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                            >
                                <option value="">None (General Session)</option>
                                {courses.map((course) => (
                                    <option key={course._id} value={course._id}>
                                        {course.title}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Maximum Students
                            </label>
                            <input
                                type="number"
                                name="maxStudents"
                                value={formData.maxStudents}
                                onChange={handleChange}
                                min="1"
                                className="block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Start Time
                            </label>
                            <input
                                type="datetime-local"
                                name="startTime"
                                value={formData.startTime}
                                onChange={handleChange}
                                className="block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                End Time
                            </label>
                            <input
                                type="datetime-local"
                                name="endTime"
                                value={formData.endTime}
                                onChange={handleChange}
                                className="block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                required
                            />
                        </div>

                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Meeting Link
                            </label>
                            <div className="flex">
                                <input
                                    type="text"
                                    name="meetingLink"
                                    value={formData.meetingLink}
                                    onChange={handleChange}
                                    placeholder="https://zoom.us/j/123456789"
                                    className="block flex-1 border border-gray-300 rounded-l-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                    required
                                />
                                <button
                                    type="button"
                                    onClick={generateMeetingLink}
                                    className="inline-flex items-center px-3 py-2 border border-l-0 border-gray-300 bg-gray-50 text-gray-700 rounded-r-md hover:bg-gray-100"
                                >
                                    <FaLink className="mr-1" /> Generate
                                </button>
                            </div>
                            <p className="mt-1 text-xs text-gray-500">
                                Paste your Zoom/Google Meet/Microsoft Teams link here, or click "Generate" to create a placeholder
                            </p>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Meeting Password (Optional)
                            </label>
                            <input
                                type="text"
                                name="meetingPassword"
                                value={formData.meetingPassword}
                                onChange={handleChange}
                                placeholder="Password for the meeting (if any)"
                                className="block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                            />
                        </div>

                        <div className="flex items-center">
                            <input
                                id="isPublic"
                                name="isPublic"
                                type="checkbox"
                                checked={formData.isPublic}
                                onChange={handleChange}
                                className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                            />
                            <label htmlFor="isPublic" className="ml-2 block text-sm text-gray-900">
                                Make this class visible to all students
                            </label>
                        </div>
                    </div>

                    {/* Topics Section */}
                    <div className="border-t border-gray-200 pt-6 mb-6">
                        <h3 className="text-lg font-medium text-gray-900 mb-4">Topics To Cover</h3>
                        <div className="flex flex-wrap gap-2 mb-4">
                            {formData.topics.map((topic, index) => (
                                <div
                                    key={index}
                                    className="bg-indigo-100 text-indigo-800 px-3 py-1 rounded-full flex items-center"
                                >
                                    <span>{topic}</span>
                                    <button
                                        type="button"
                                        onClick={() => handleRemoveTopic(topic)}
                                        className="ml-2 text-indigo-600 hover:text-indigo-800 focus:outline-none"
                                    >
                                        <svg
                                            xmlns="http://www.w3.org/2000/svg"
                                            className="h-4 w-4"
                                            fill="none"
                                            viewBox="0 0 24 24"
                                            stroke="currentColor"
                                        >
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                strokeWidth="2"
                                                d="M6 18L18 6M6 6l12 12"
                                            />
                                        </svg>
                                    </button>
                                </div>
                            ))}
                        </div>
                        <div className="flex gap-2">
                            <input
                                type="text"
                                value={newTopic}
                                onChange={(e) => setNewTopic(e.target.value)}
                                placeholder="Add a topic to cover"
                                className="flex-1 border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter') {
                                        e.preventDefault();
                                        handleAddTopic();
                                    }
                                }}
                            />
                            <button
                                type="button"
                                onClick={handleAddTopic}
                                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                            >
                                Add
                            </button>
                        </div>
                    </div>

                    {/* Submit Buttons */}
                    <div className="flex justify-end space-x-3">
                        <button
                            type="button"
                            onClick={onCancel}
                            className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                        >
                            <FaSave className="mr-2" /> {classData ? 'Update Class' : 'Schedule Class'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ClassForm;
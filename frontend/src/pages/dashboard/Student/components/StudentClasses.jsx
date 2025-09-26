import React, { useState, useEffect } from 'react';
import { FaCalendarCheck, FaClock, FaVideo, FaUsers, FaExternalLinkAlt } from 'react-icons/fa';
import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

const StudentClasses = () => {
    const [classes, setClasses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [enrollingClassId, setEnrollingClassId] = useState(null);

    useEffect(() => {
        fetchStudentClasses();
    }, []);

    const fetchStudentClasses = async () => {
        try {
            const token = localStorage.getItem('token');
            const config = {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            };

            const { data } = await axios.get(`${API_BASE_URL}/api/classes/student/my-classes`, config);
            setClasses(data);
        } catch (error) {
            console.error('Error fetching classes:', error);
            setError('Failed to fetch classes');
        } finally {
            setLoading(false);
        }
    };

    const enrollInClass = async (classId) => {
        try {
            setEnrollingClassId(classId);
            const token = localStorage.getItem('token');
            const config = {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            };

            await axios.post(`${API_BASE_URL}/api/classes/${classId}/enroll`, {}, config);

            // Refresh classes list
            await fetchStudentClasses();

            alert('Successfully enrolled in class!');
        } catch (error) {
            console.error('Error enrolling in class:', error);
            alert('Failed to enroll in class');
        } finally {
            setEnrollingClassId(null);
        }
    };

    const formatDateTime = (dateString) => {
        const options = {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        };
        return new Date(dateString).toLocaleDateString(undefined, options);
    };

    const getClassStatus = (classItem) => {
        const now = new Date();
        const startTime = new Date(classItem.startTime);
        const endTime = new Date(classItem.endTime);

        if (now < startTime) {
            return {
                label: 'Upcoming',
                color: 'bg-blue-100 text-blue-800',
                canJoin: false
            };
        } else if (now >= startTime && now <= endTime) {
            return {
                label: 'Live Now',
                color: 'bg-green-100 text-green-800 animate-pulse',
                canJoin: true
            };
        } else {
            return {
                label: 'Completed',
                color: 'bg-gray-100 text-gray-800',
                canJoin: false
            };
        }
    };

    if (loading) {
        return (
            <div className="min-h-96 flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="bg-red-50 border-l-4 border-red-500 p-4">
                <div className="flex">
                    <div className="ml-3">
                        <p className="text-sm text-red-700">{error}</p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-white shadow rounded-lg overflow-hidden">
            <div className="bg-gradient-to-r from-indigo-600 to-purple-600 px-6 py-4">
                <h2 className="text-2xl font-bold text-white">My Classes</h2>
                <p className="text-indigo-100">Live sessions and scheduled classes</p>
            </div>

            <div className="p-6">
                {classes.length === 0 ? (
                    <div className="text-center py-12">
                        <FaCalendarCheck className="mx-auto h-16 w-16 text-gray-400" />
                        <h3 className="mt-4 text-lg font-medium text-gray-900">No classes enrolled</h3>
                        <p className="mt-2 text-gray-500">You haven't enrolled in any classes yet.</p>
                    </div>
                ) : (
                    <div className="space-y-6">
                        {classes.map((classItem) => {
                            const status = getClassStatus(classItem);
                            return (
                                <div key={classItem._id} className="border rounded-lg p-6 hover:shadow-md transition-shadow">
                                    <div className="flex flex-col md:flex-row md:justify-between md:items-start">
                                        <div className="flex-1">
                                            <div className="flex items-center justify-between mb-3">
                                                <h3 className="text-xl font-semibold text-gray-900">
                                                    {classItem.title}
                                                </h3>
                                                <span className={`px-3 py-1 rounded-full text-sm font-medium ${status.color}`}>
                                                    {status.label}
                                                </span>
                                            </div>

                                            <p className="text-gray-600 mb-4">{classItem.description}</p>

                                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                                                <div className="flex items-center text-sm text-gray-500">
                                                    <FaClock className="mr-2" />
                                                    <span>{formatDateTime(classItem.startTime)}</span>
                                                </div>

                                                <div className="flex items-center text-sm text-gray-500">
                                                    <FaUsers className="mr-2" />
                                                    <span>{classItem.enrolledStudents?.length || 0} students</span>
                                                </div>

                                                {classItem.course && (
                                                    <div className="text-sm text-gray-500">
                                                        Course: <span className="font-medium">{classItem.course.title}</span>
                                                    </div>
                                                )}

                                                {classItem.mentor && (
                                                    <div className="text-sm text-gray-500">
                                                        Mentor: <span className="font-medium">
                                                            {classItem.mentor.firstName} {classItem.mentor.lastName}
                                                        </span>
                                                    </div>
                                                )}
                                            </div>

                                            {classItem.materials && classItem.materials.length > 0 && (
                                                <div className="mb-4">
                                                    <h4 className="text-sm font-medium text-gray-700 mb-2">Class Materials:</h4>
                                                    <div className="space-y-1">
                                                        {classItem.materials.map((material, index) => (
                                                            <a
                                                                key={index}
                                                                href={material.fileUrl}
                                                                target="_blank"
                                                                rel="noopener noreferrer"
                                                                className="text-sm text-indigo-600 hover:text-indigo-800 block"
                                                            >
                                                                {material.title}
                                                            </a>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {classItem.meetingLink && (
                                        <div className="mt-4 flex flex-wrap gap-2">
                                            {status.canJoin ? (
                                                <a
                                                    href={classItem.meetingLink}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                                                >
                                                    <FaVideo className="mr-2" />
                                                    Join Live Class
                                                </a>
                                            ) : (
                                                <a
                                                    href={classItem.meetingLink}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="inline-flex items-center px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
                                                >
                                                    <FaExternalLinkAlt className="mr-2" />
                                                    Meeting Link
                                                </a>
                                            )}
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
};

export default StudentClasses;
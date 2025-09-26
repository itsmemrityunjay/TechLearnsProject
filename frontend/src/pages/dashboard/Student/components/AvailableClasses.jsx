import React, { useState, useEffect } from 'react';
import { FaCalendarPlus, FaClock, FaVideo, FaUsers, FaExternalLinkAlt, FaGraduationCap } from 'react-icons/fa';
import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

const AvailableClasses = () => {
    const [allClasses, setAllClasses] = useState([]);
    const [courses, setCourses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [enrollingClassId, setEnrollingClassId] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCourseFilter, setSelectedCourseFilter] = useState('');

    useEffect(() => {
        fetchAvailableClasses();
        fetchCourses();
    }, []);

    const fetchAvailableClasses = async () => {
        try {
            const token = localStorage.getItem('token');
            const config = {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            };

            // Note: We need to create a public endpoint or student endpoint for browsing classes
            // For now, we'll assume we have access to all classes
            const { data } = await axios.get(`${API_BASE_URL}/api/classes/public`, config);
            setAllClasses(data);
        } catch (error) {
            console.error('Error fetching classes:', error);
            setError('Failed to fetch available classes');
        } finally {
            setLoading(false);
        }
    };

    const fetchCourses = async () => {
        try {
            const { data } = await axios.get(`${API_BASE_URL}/api/courses`);
            setCourses(data);
        } catch (error) {
            console.error('Error fetching courses:', error);
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
            await fetchAvailableClasses();

            alert('Successfully enrolled in class!');
        } catch (error) {
            console.error('Error enrolling in class:', error);
            const message = error.response?.data?.message || 'Failed to enroll in class';
            alert(message);
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

        if (classItem.isCancelled || classItem.status === 'cancelled') {
            return {
                label: 'Cancelled',
                color: 'bg-red-100 text-red-800',
                canEnroll: false
            };
        } else if (now > endTime) {
            return {
                label: 'Completed',
                color: 'bg-gray-100 text-gray-800',
                canEnroll: false
            };
        } else if (now >= startTime && now <= endTime) {
            return {
                label: 'Live Now',
                color: 'bg-green-100 text-green-800',
                canEnroll: false
            };
        } else {
            return {
                label: 'Upcoming',
                color: 'bg-blue-100 text-blue-800',
                canEnroll: true
            };
        }
    };

    const filteredClasses = allClasses.filter(classItem => {
        const matchesSearch = classItem.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            classItem.description?.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesCourse = !selectedCourseFilter || classItem.course?._id === selectedCourseFilter;

        return matchesSearch && matchesCourse;
    });

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
                <h2 className="text-2xl font-bold text-white">Available Classes</h2>
                <p className="text-indigo-100">Browse and enroll in upcoming live sessions</p>
            </div>

            <div className="p-6">
                {/* Search and Filter Controls */}
                <div className="mb-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <input
                            type="text"
                            placeholder="Search classes..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                        />
                    </div>
                    <div>
                        <select
                            value={selectedCourseFilter}
                            onChange={(e) => setSelectedCourseFilter(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                        >
                            <option value="">All Courses</option>
                            {courses.map(course => (
                                <option key={course._id} value={course._id}>
                                    {course.title}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>

                {filteredClasses.length === 0 ? (
                    <div className="text-center py-12">
                        <FaCalendarPlus className="mx-auto h-16 w-16 text-gray-400" />
                        <h3 className="mt-4 text-lg font-medium text-gray-900">No classes available</h3>
                        <p className="mt-2 text-gray-500">
                            {searchTerm || selectedCourseFilter
                                ? 'No classes match your search criteria.'
                                : 'There are no upcoming classes available for enrollment.'
                            }
                        </p>
                    </div>
                ) : (
                    <div className="space-y-6">
                        {filteredClasses.map((classItem) => {
                            const status = getClassStatus(classItem);
                            return (
                                <div key={classItem._id} className="border rounded-lg p-6 hover:shadow-md transition-shadow">
                                    <div className="flex flex-col lg:flex-row lg:justify-between lg:items-start">
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

                                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
                                                <div className="flex items-center text-sm text-gray-500">
                                                    <FaClock className="mr-2" />
                                                    <span>{formatDateTime(classItem.startTime)}</span>
                                                </div>

                                                <div className="flex items-center text-sm text-gray-500">
                                                    <FaUsers className="mr-2" />
                                                    <span>{classItem.enrolledStudents?.length || 0} students enrolled</span>
                                                </div>

                                                {classItem.course && (
                                                    <div className="flex items-center text-sm text-gray-500">
                                                        <FaGraduationCap className="mr-2" />
                                                        <span>{classItem.course.title}</span>
                                                    </div>
                                                )}
                                            </div>

                                            {classItem.mentor && (
                                                <div className="mb-4">
                                                    <div className="flex items-center">
                                                        <img
                                                            src={classItem.mentor.profileImage || "https://avatar.iran.liara.run/public"}
                                                            alt={`${classItem.mentor.firstName} ${classItem.mentor.lastName}`}
                                                            className="h-8 w-8 rounded-full mr-3"
                                                        />
                                                        <div>
                                                            <p className="text-sm font-medium text-gray-900">
                                                                {classItem.mentor.firstName} {classItem.mentor.lastName}
                                                            </p>
                                                            <p className="text-xs text-gray-500">Mentor</p>
                                                        </div>
                                                    </div>
                                                </div>
                                            )}
                                        </div>

                                        <div className="mt-4 lg:mt-0 lg:ml-6">
                                            {status.canEnroll && (
                                                <button
                                                    onClick={() => enrollInClass(classItem._id)}
                                                    disabled={enrollingClassId === classItem._id}
                                                    className="inline-flex items-center px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
                                                >
                                                    {enrollingClassId === classItem._id ? (
                                                        <>
                                                            <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white mr-2"></div>
                                                            Enrolling...
                                                        </>
                                                    ) : (
                                                        <>
                                                            <FaCalendarPlus className="mr-2" />
                                                            Enroll
                                                        </>
                                                    )}
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
};

export default AvailableClasses;
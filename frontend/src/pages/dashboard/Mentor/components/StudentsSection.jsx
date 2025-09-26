import React, { useState, useEffect } from 'react';
import { FaSearch, FaFilter, FaEnvelope, FaEye, FaTimes } from 'react-icons/fa';

const StudentsSection = ({ students = [], onGetStudentDetails, onSendMessage }) => {
    // Ensure students is always an array
    const studentsArray = Array.isArray(students) ? students : [];

    const [filteredStudents, setFilteredStudents] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterCriteria, setFilterCriteria] = useState('all');
    const [showFilters, setShowFilters] = useState(false);
    const [selectedStudent, setSelectedStudent] = useState(null);
    const [showMessageModal, setShowMessageModal] = useState(false);
    const [messageContent, setMessageContent] = useState('');
    const [messageSubject, setMessageSubject] = useState('');

    useEffect(() => {
        applyFilters();
    }, [studentsArray, searchTerm, filterCriteria]); // Changed from students to studentsArray

    const applyFilters = () => {
        let result = [...studentsArray]; // Changed from students to studentsArray

        // Apply search term filter
        if (searchTerm) {
            result = result.filter(student =>
                student.firstName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                student.lastName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                student.email?.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }

        // Apply category filter
        if (filterCriteria !== 'all') {
            if (filterCriteria === 'premium') {
                result = result.filter(student => student.isPremium);
            } else if (filterCriteria === 'active') {
                result = result.filter(student => student.lastActive &&
                    new Date(student.lastActive) >= new Date(Date.now() - 7 * 24 * 60 * 60 * 1000));
            } else if (filterCriteria === 'inactive') {
                result = result.filter(student => !student.lastActive ||
                    new Date(student.lastActive) < new Date(Date.now() - 30 * 24 * 60 * 60 * 1000));
            }
        }

        setFilteredStudents(result);
    };

    const handleViewStudent = async (student) => {
        if (onGetStudentDetails) {
            const details = await onGetStudentDetails(student._id);
            setSelectedStudent({ ...student, ...details });
        } else {
            setSelectedStudent(student);
        }
    };

    const handleSendMessage = (student) => {
        setSelectedStudent(student);
        setShowMessageModal(true);
        setMessageSubject(`Message from your mentor`);
        setMessageContent('');
    };

    const handleSubmitMessage = async () => {
        if (onSendMessage && selectedStudent && messageContent.trim()) {
            await onSendMessage(selectedStudent._id, messageSubject, messageContent);
            setShowMessageModal(false);
            setMessageContent('');
            setMessageSubject('');
            setSelectedStudent(null);
        }
    };

    return (
        <div className="bg-white shadow rounded-lg overflow-hidden">
            <div className="bg-gradient-to-r from-indigo-600 to-purple-600 px-6 py-4">
                <h2 className="text-2xl font-bold text-white">Enrolled Students</h2>
            </div>

            <div className="p-6">
                <div className="mb-6">
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                        {/* Search Bar */}
                        <div className="w-full md:w-auto flex-1 relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <FaSearch className="text-gray-400" />
                            </div>
                            <input
                                type="text"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                placeholder="Search students..."
                                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                            />
                        </div>

                        {/* Filter Dropdown */}
                        <div className="w-full md:w-auto">
                            <button
                                onClick={() => setShowFilters(!showFilters)}
                                className="flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                            >
                                <FaFilter className="mr-2" />
                                Filter
                            </button>

                            {showFilters && (
                                <div className="absolute z-10 mt-1 w-56 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5">
                                    <div className="py-1" role="menu" aria-orientation="vertical">
                                        <button
                                            className={`block px-4 py-2 text-sm w-full text-left ${filterCriteria === 'all' ? 'bg-gray-100 text-gray-900' : 'text-gray-700'}`}
                                            onClick={() => setFilterCriteria('all')}
                                        >
                                            All Students
                                        </button>
                                        <button
                                            className={`block px-4 py-2 text-sm w-full text-left ${filterCriteria === 'premium' ? 'bg-gray-100 text-gray-900' : 'text-gray-700'}`}
                                            onClick={() => setFilterCriteria('premium')}
                                        >
                                            Premium Students
                                        </button>
                                        <button
                                            className={`block px-4 py-2 text-sm w-full text-left ${filterCriteria === 'active' ? 'bg-gray-100 text-gray-900' : 'text-gray-700'}`}
                                            onClick={() => setFilterCriteria('active')}
                                        >
                                            Active (Last 7 days)
                                        </button>
                                        <button
                                            className={`block px-4 py-2 text-sm w-full text-left ${filterCriteria === 'inactive' ? 'bg-gray-100 text-gray-900' : 'text-gray-700'}`}
                                            onClick={() => setFilterCriteria('inactive')}
                                        >
                                            Inactive (30+ days)
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Active Filter Indicators */}
                    {(searchTerm || filterCriteria !== 'all') && (
                        <div className="mt-3 flex flex-wrap gap-2">
                            {searchTerm && (
                                <span className="inline-flex items-center px-3 py-0.5 rounded-full text-sm font-medium bg-indigo-100 text-indigo-800">
                                    Search: {searchTerm}
                                    <button
                                        type="button"
                                        className="flex-shrink-0 ml-1.5 inline-flex text-indigo-500 focus:outline-none focus:text-indigo-700"
                                        onClick={() => setSearchTerm('')}
                                    >
                                        <span className="sr-only">Remove filter</span>
                                        <svg className="h-2 w-2" stroke="currentColor" fill="none" viewBox="0 0 8 8">
                                            <path strokeLinecap="round" strokeWidth="1.5" d="M1 1l6 6m0-6L1 7" />
                                        </svg>
                                    </button>
                                </span>
                            )}

                            {filterCriteria !== 'all' && (
                                <span className="inline-flex items-center px-3 py-0.5 rounded-full text-sm font-medium bg-indigo-100 text-indigo-800">
                                    Filter: {filterCriteria.charAt(0).toUpperCase() + filterCriteria.slice(1)}
                                    <button
                                        type="button"
                                        className="flex-shrink-0 ml-1.5 inline-flex text-indigo-500 focus:outline-none focus:text-indigo-700"
                                        onClick={() => setFilterCriteria('all')}
                                    >
                                        <span className="sr-only">Remove filter</span>
                                        <svg className="h-2 w-2" stroke="currentColor" fill="none" viewBox="0 0 8 8">
                                            <path strokeLinecap="round" strokeWidth="1.5" d="M1 1l6 6m0-6L1 7" />
                                        </svg>
                                    </button>
                                </span>
                            )}
                        </div>
                    )}
                </div>

                {/* Students List */}
                {filteredStudents.length > 0 ? (
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Student
                                    </th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Enrolled Courses
                                    </th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Last Active
                                    </th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Status
                                    </th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Action
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {filteredStudents.map((student) => (
                                    <tr key={student._id}>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center">
                                                <div className="flex-shrink-0 h-10 w-10">
                                                    <img
                                                        className="h-10 w-10 rounded-full object-cover"
                                                        src={student.profileImage || "https://avatar.iran.liara.run/public"}
                                                        alt=""
                                                    />
                                                </div>
                                                <div className="ml-4">
                                                    <div className="text-sm font-medium text-gray-900">
                                                        {student.firstName} {student.lastName}
                                                    </div>
                                                    <div className="text-sm text-gray-500">{student.email}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm text-gray-900">
                                                {student.enrolledCourses?.length || 0} courses
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm text-gray-900">
                                                {student.lastActive
                                                    ? new Date(student.lastActive).toLocaleDateString()
                                                    : 'Never'}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            {student.isPremium ? (
                                                <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-purple-100 text-purple-800">
                                                    Premium
                                                </span>
                                            ) : (
                                                <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-gray-100 text-gray-800">
                                                    Regular
                                                </span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            <div className="flex space-x-2">
                                                <button
                                                    onClick={() => handleViewStudent(student)}
                                                    className="text-indigo-600 hover:text-indigo-900"
                                                    title="View details"
                                                >
                                                    <FaEye />
                                                </button>
                                                <button
                                                    onClick={() => handleSendMessage(student)}
                                                    className="text-green-600 hover:text-green-900"
                                                    title="Send message"
                                                >
                                                    <FaEnvelope />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <div className="text-center py-10">
                        <svg
                            className="mx-auto h-12 w-12 text-gray-400"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                            xmlns="http://www.w3.org/2000/svg"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
                            />
                        </svg>
                        <p className="mt-2 text-sm text-gray-500">No students found matching your criteria.</p>
                    </div>
                )}

                {/* Summary Stats */}
                <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-gray-50 rounded-lg p-4 shadow-sm">
                        <h3 className="text-sm font-medium text-gray-500">Total Students</h3>
                        <p className="mt-2 text-3xl font-semibold text-gray-900">{studentsArray.length}</p>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-4 shadow-sm">
                        <h3 className="text-sm font-medium text-gray-500">Premium Students</h3>
                        <p className="mt-2 text-3xl font-semibold text-gray-900">
                            {studentsArray.filter(s => s.isPremium).length}
                        </p>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-4 shadow-sm">
                        <h3 className="text-sm font-medium text-gray-500">Active This Week</h3>
                        <p className="mt-2 text-3xl font-semibold text-gray-900">
                            {studentsArray.filter(s => s.lastActive && new Date(s.lastActive) >= new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)).length}
                        </p>
                    </div>
                </div>
            </div>

            {/* Message Modal */}
            {showMessageModal && (
                <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
                    <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-lg font-medium text-gray-900">
                                Send Message to {selectedStudent?.firstName} {selectedStudent?.lastName}
                            </h3>
                            <button
                                onClick={() => {
                                    setShowMessageModal(false);
                                    setSelectedStudent(null);
                                    setMessageContent('');
                                    setMessageSubject('');
                                }}
                                className="text-gray-400 hover:text-gray-600"
                            >
                                <FaTimes />
                            </button>
                        </div>
                        <form onSubmit={(e) => { e.preventDefault(); handleSubmitMessage(); }}>
                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Subject
                                </label>
                                <input
                                    type="text"
                                    value={messageSubject}
                                    onChange={(e) => setMessageSubject(e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                    required
                                />
                            </div>
                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Message
                                </label>
                                <textarea
                                    value={messageContent}
                                    onChange={(e) => setMessageContent(e.target.value)}
                                    rows={4}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                    placeholder="Type your message here..."
                                    required
                                />
                            </div>
                            <div className="flex space-x-3">
                                <button
                                    type="submit"
                                    className="flex-1 bg-indigo-600 text-white py-2 px-4 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                >
                                    Send Message
                                </button>
                                <button
                                    type="button"
                                    onClick={() => {
                                        setShowMessageModal(false);
                                        setSelectedStudent(null);
                                        setMessageContent('');
                                        setMessageSubject('');
                                    }}
                                    className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-500"
                                >
                                    Cancel
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default StudentsSection;
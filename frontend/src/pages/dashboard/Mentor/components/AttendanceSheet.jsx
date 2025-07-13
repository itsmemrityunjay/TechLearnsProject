import React, { useState, useEffect } from 'react';
import { FaSave, FaTimes, FaSearch, FaCheck, FaTimes as FaTimesIcon } from 'react-icons/fa';

const AttendanceSheet = ({ classInfo, onSubmit, onCancel }) => {
    const [attendanceData, setAttendanceData] = useState({});
    const [searchTerm, setSearchTerm] = useState('');
    const [students, setStudents] = useState([]);
    const [filteredStudents, setFilteredStudents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        // In a real app, you'd get the enrolled students from the class info
        // or fetch them from an API
        if (classInfo && classInfo.enrolledStudents) {
            const initialAttendance = {};

            // Initialize with existing attendance if available
            if (classInfo.attendance) {
                setAttendanceData(classInfo.attendance);
            } else {
                // Initialize all students as absent by default
                classInfo.enrolledStudents.forEach(student => {
                    initialAttendance[student._id] = false;
                });
                setAttendanceData(initialAttendance);
            }

            setStudents(classInfo.enrolledStudents);
            setFilteredStudents(classInfo.enrolledStudents);
            setLoading(false);
        } else {
            setError('No enrolled students found for this class');
            setLoading(false);
        }
    }, [classInfo]);

    useEffect(() => {
        if (students.length > 0) {
            const filtered = students.filter(student => {
                const fullName = `${student.firstName} ${student.lastName}`.toLowerCase();
                return fullName.includes(searchTerm.toLowerCase()) ||
                    (student.email && student.email.toLowerCase().includes(searchTerm.toLowerCase()));
            });
            setFilteredStudents(filtered);
        }
    }, [searchTerm, students]);

    const handleToggleAttendance = (studentId) => {
        setAttendanceData(prev => ({
            ...prev,
            [studentId]: !prev[studentId]
        }));
    };

    const markAllPresent = () => {
        const updatedAttendance = {};
        students.forEach(student => {
            updatedAttendance[student._id] = true;
        });
        setAttendanceData(updatedAttendance);
    };

    const markAllAbsent = () => {
        const updatedAttendance = {};
        students.forEach(student => {
            updatedAttendance[student._id] = false;
        });
        setAttendanceData(updatedAttendance);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        onSubmit(attendanceData);
    };

    if (loading) {
        return (
            <div className="min-h-64 flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="bg-white shadow rounded-lg overflow-hidden">
                <div className="bg-gradient-to-r from-indigo-600 to-purple-600 px-6 py-4">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                        <h2 className="text-2xl font-bold text-white">Attendance</h2>
                        <button
                            onClick={onCancel}
                            className="mt-4 md:mt-0 px-4 py-2 bg-white text-indigo-600 rounded-md hover:bg-gray-100 transition-colors"
                        >
                            <FaTimes className="inline mr-1" /> Back
                        </button>
                    </div>
                </div>
                <div className="p-6">
                    <div className="bg-red-50 border-l-4 border-red-500 p-4">
                        <div className="flex">
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
                </div>
            </div>
        );
    }

    return (
        <div className="bg-white shadow rounded-lg overflow-hidden">
            <div className="bg-gradient-to-r from-indigo-600 to-purple-600 px-6 py-4">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                    <div>
                        <h2 className="text-2xl font-bold text-white">Attendance</h2>
                        <p className="text-indigo-100 text-sm mt-1">{classInfo.title}</p>
                    </div>
                    <button
                        onClick={onCancel}
                        className="mt-4 md:mt-0 px-4 py-2 bg-white text-indigo-600 rounded-md hover:bg-gray-100 transition-colors"
                    >
                        <FaTimes className="inline mr-1" /> Cancel
                    </button>
                </div>
            </div>

            <div className="p-6">
                <div className="mb-6">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                        <div className="w-full md:w-1/2 relative">
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
                        <div className="flex space-x-2">
                            <button
                                onClick={markAllPresent}
                                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                            >
                                <FaCheck className="mr-1.5" /> Mark All Present
                            </button>
                            <button
                                onClick={markAllAbsent}
                                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                            >
                                <FaTimesIcon className="mr-1.5" /> Mark All Absent
                            </button>
                        </div>
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <form onSubmit={handleSubmit}>
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Student
                                    </th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Email
                                    </th>
                                    <th scope="col" className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Present
                                    </th>
                                    <th scope="col" className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Absent
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {filteredStudents.length > 0 ? (
                                    filteredStudents.map((student) => (
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
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm text-gray-900">{student.email}</div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-center">
                                                <input
                                                    type="radio"
                                                    className="h-5 w-5 text-green-600 border-gray-300 focus:ring-green-500"
                                                    checked={attendanceData[student._id] === true}
                                                    onChange={() => handleToggleAttendance(student._id)}
                                                />
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-center">
                                                <input
                                                    type="radio"
                                                    className="h-5 w-5 text-red-600 border-gray-300 focus:ring-red-500"
                                                    checked={attendanceData[student._id] === false}
                                                    onChange={() => handleToggleAttendance(student._id)}
                                                />
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="4" className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-center">
                                            No students found matching your search criteria
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>

                        <div className="mt-6 flex justify-between">
                            <div className="text-sm text-gray-700">
                                {Object.values(attendanceData).filter(Boolean).length} of {students.length} students marked present
                            </div>
                            <div className="flex space-x-3">
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
                                    <FaSave className="mr-1.5" /> Save Attendance
                                </button>
                            </div>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default AttendanceSheet;
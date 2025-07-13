import React, { useState } from 'react';
import { FaCalendarPlus, FaUserCheck, FaPlayCircle, FaExternalLinkAlt } from 'react-icons/fa';

const ClassesSection = ({ classes = [], onNewClass, onSelectClass }) => {
    const [selectedTab, setSelectedTab] = useState('upcoming');

    // Ensure classes is always an array
    const classesArray = Array.isArray(classes) ? classes : [];

    const getCurrentDate = () => new Date();

    const upcomingClasses = classesArray.filter(cls => new Date(cls.startTime) > getCurrentDate());
    const pastClasses = classesArray.filter(cls => new Date(cls.startTime) <= getCurrentDate());

    // Sort classes by date (upcoming in ascending order, past in descending order)
    upcomingClasses.sort((a, b) => new Date(a.startTime) - new Date(b.startTime));
    pastClasses.sort((a, b) => new Date(b.startTime) - new Date(a.startTime));

    const displayClasses = selectedTab === 'upcoming' ? upcomingClasses : pastClasses;

    const formatDate = (dateString) => {
        const options = {
            weekday: 'short',
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        };
        return new Date(dateString).toLocaleDateString(undefined, options);
    };

    const getStatusBadge = (classItem) => {
        const now = getCurrentDate();
        const startTime = new Date(classItem.startTime);
        const endTime = new Date(classItem.endTime);

        if (now < startTime) {
            return (
                <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-100 text-yellow-800">
                    Upcoming
                </span>
            );
        } else if (now >= startTime && now <= endTime) {
            return (
                <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800 animate-pulse">
                    Live Now
                </span>
            );
        } else {
            return (
                <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-gray-100 text-gray-800">
                    Completed
                </span>
            );
        }
    };

    return (
        <div className="bg-white shadow rounded-lg overflow-hidden">
            <div className="bg-gradient-to-r from-indigo-600 to-purple-600 px-6 py-4 flex justify-between items-center">
                <h2 className="text-2xl font-bold text-white">Classes & Live Sessions</h2>
                <button
                    onClick={onNewClass}
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-indigo-600 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                    <FaCalendarPlus className="mr-2" /> Schedule Class
                </button>
            </div>

            <div className="p-6">
                {/* Tabs */}
                <div className="border-b border-gray-200 mb-6">
                    <nav className="-mb-px flex" aria-label="Tabs">
                        <button
                            className={`${selectedTab === 'upcoming'
                                ? 'border-indigo-500 text-indigo-600'
                                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm mr-8`}
                            onClick={() => setSelectedTab('upcoming')}
                        >
                            Upcoming Classes
                        </button>
                        <button
                            className={`${selectedTab === 'past'
                                ? 'border-indigo-500 text-indigo-600'
                                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
                            onClick={() => setSelectedTab('past')}
                        >
                            Past Classes
                        </button>
                    </nav>
                </div>

                {displayClasses.length > 0 ? (
                    <div className="space-y-6">
                        {displayClasses.map((classItem) => (
                            <div key={classItem._id} className="bg-gray-50 rounded-lg p-5 shadow-sm">
                                <div className="flex flex-col md:flex-row md:justify-between md:items-center">
                                    <div>
                                        <h3 className="text-lg font-medium text-gray-900">
                                            {classItem.title}
                                        </h3>
                                        <p className="text-sm text-gray-500 mt-1">
                                            {classItem.course ? `Course: ${classItem.course.title}` : 'General Session'}
                                        </p>
                                    </div>
                                    <div className="mt-2 md:mt-0">
                                        {getStatusBadge(classItem)}
                                    </div>
                                </div>

                                <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <div>
                                        <p className="text-sm font-medium text-gray-500">Date & Time</p>
                                        <p className="mt-1 text-sm text-gray-900">{formatDate(classItem.startTime)}</p>
                                        <p className="text-xs text-gray-500">
                                            Duration: {Math.round((new Date(classItem.endTime) - new Date(classItem.startTime)) / (1000 * 60))} minutes
                                        </p>
                                    </div>

                                    <div>
                                        <p className="text-sm font-medium text-gray-500">Students Enrolled</p>
                                        <p className="mt-1 text-sm text-gray-900">
                                            {classItem.enrolledStudents?.length || 0} students
                                        </p>
                                    </div>

                                    <div>
                                        <p className="text-sm font-medium text-gray-500">Attendance</p>
                                        <p className="mt-1 text-sm text-gray-900">
                                            {classItem.attendance
                                                ? `${Object.keys(classItem.attendance).filter(id => classItem.attendance[id]).length} present`
                                                : 'Not taken'}
                                        </p>
                                    </div>
                                </div>

                                <div className="mt-5 flex flex-wrap gap-2">
                                    {new Date(classItem.startTime) <= getCurrentDate() && (
                                        <button
                                            onClick={() => onSelectClass(classItem)}
                                            className="inline-flex items-center px-3 py-1.5 border border-gray-300 shadow-sm text-sm font-medium rounded text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                                        >
                                            <FaUserCheck className="mr-1.5" /> Take Attendance
                                        </button>
                                    )}

                                    {classItem.meetingLink && (
                                        <a
                                            href={classItem.meetingLink}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="inline-flex items-center px-3 py-1.5 border border-transparent shadow-sm text-sm font-medium rounded text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                                        >
                                            {new Date(classItem.startTime) <= getCurrentDate() &&
                                                new Date(classItem.endTime) >= getCurrentDate()
                                                ? <><FaPlayCircle className="mr-1.5" /> Join Now</>
                                                : <><FaExternalLinkAlt className="mr-1.5" /> Meeting Link</>
                                            }
                                        </a>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-10">
                        <svg
                            className="mx-auto h-12 w-12 text-gray-400"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                            aria-hidden="true"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                            />
                        </svg>
                        <h3 className="mt-2 text-sm font-medium text-gray-900">No classes found</h3>
                        <p className="mt-1 text-sm text-gray-500">
                            {selectedTab === 'upcoming'
                                ? "You don't have any upcoming classes scheduled."
                                : "You don't have any past classes."}
                        </p>
                        {selectedTab === 'upcoming' && (
                            <div className="mt-6">
                                <button
                                    type="button"
                                    onClick={onNewClass}
                                    className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                                >
                                    <FaCalendarPlus className="mr-2" /> Schedule a class
                                </button>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default ClassesSection;
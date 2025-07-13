import React from 'react';
import { FaEdit, FaTrash, FaEye, FaUser, FaChalkboardTeacher } from 'react-icons/fa';

const CoursesSection = ({ courses = [], onNewCourse, onEditCourse, onDeleteCourse }) => {
    // Ensure courses is always an array
    const coursesArray = Array.isArray(courses) ? courses : [];

    return (
        <div className="bg-white shadow rounded-lg overflow-hidden">
            <div className="bg-gradient-to-r from-indigo-600 to-purple-600 px-6 py-4">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                    <h2 className="text-2xl font-bold text-white">Your Courses</h2>
                    <button
                        onClick={onNewCourse}
                        className="mt-4 md:mt-0 px-4 py-2 bg-white text-indigo-600 rounded-md hover:bg-gray-100 transition-colors"
                    >
                        Create New Course
                    </button>
                </div>
            </div>

            <div className="p-6">
                {coursesArray.length === 0 ? (
                    <div className="text-center py-8">
                        <svg
                            className="mx-auto h-16 w-16 text-gray-400"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                            xmlns="http://www.w3.org/2000/svg"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="2"
                                d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                            />
                        </svg>
                        <h3 className="mt-2 text-lg font-medium text-gray-900">No courses created yet</h3>
                        <p className="mt-1 text-gray-500">Get started by creating your first course.</p>
                        <div className="mt-6">
                            <button
                                onClick={onNewCourse}
                                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                            >
                                Create a Course
                            </button>
                        </div>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {coursesArray.map((course) => (
                            <div
                                key={course._id}
                                className="border rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow"
                            >
                                <div className="relative">
                                    <img
                                        src={course.thumbnail || "https://via.placeholder.com/400x200?text=Course+Thumbnail"}
                                        alt={course.title}
                                        className="w-full h-48 object-cover"
                                    />
                                    <div className="absolute top-0 left-0 bg-indigo-600 text-white px-3 py-1 rounded-br-lg">
                                        {course.category}
                                    </div>
                                    {course.isPremium && (
                                        <div className="absolute top-0 right-0 bg-yellow-500 text-white px-3 py-1 rounded-bl-lg">
                                            Premium
                                        </div>
                                    )}
                                </div>
                                <div className="p-4">
                                    <h3 className="text-lg font-bold text-gray-900 mb-1">{course.title}</h3>
                                    <p className="text-sm text-gray-500 mb-3">{course.description.substring(0, 100)}...</p>

                                    <div className="flex items-center justify-between mb-4">
                                        <div className="flex items-center">
                                            <FaUser className="text-gray-500 mr-1" />
                                            <span className="text-sm text-gray-600">{course.enrolledStudents?.length || 0} students</span>
                                        </div>
                                        <div className="flex items-center">
                                            <FaChalkboardTeacher className="text-gray-500 mr-1" />
                                            <span className="text-sm text-gray-600">
                                                {course.content?.length || 0} {course.content?.length === 1 ? 'module' : 'modules'}
                                            </span>
                                        </div>
                                    </div>

                                    <div className="border-t pt-3 flex justify-between">
                                        <button
                                            onClick={() => onEditCourse(course)}
                                            className="flex items-center text-indigo-600 hover:text-indigo-800"
                                        >
                                            <FaEdit className="mr-1" /> Edit
                                        </button>
                                        <button
                                            onClick={() => window.open(`/courses/${course._id}`, '_blank')}
                                            className="flex items-center text-gray-600 hover:text-gray-800"
                                        >
                                            <FaEye className="mr-1" /> Preview
                                        </button>
                                        <button
                                            onClick={() => onDeleteCourse(course._id)}
                                            className="flex items-center text-red-600 hover:text-red-800"
                                        >
                                            <FaTrash className="mr-1" /> Delete
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default CoursesSection;
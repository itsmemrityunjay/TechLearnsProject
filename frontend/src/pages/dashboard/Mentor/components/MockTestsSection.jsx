
import React from 'react';
import { FaEdit, FaChartBar, FaClipboardList } from 'react-icons/fa';

const MockTestsSection = ({ tests, onNewTest, onEditTest, onViewResults }) => {
    return (
        <div className="bg-white shadow rounded-lg overflow-hidden">
            <div className="bg-gradient-to-r from-indigo-600 to-purple-600 px-6 py-4">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                    <h2 className="text-2xl font-bold text-white">Mock Tests</h2>
                    <button
                        onClick={onNewTest}
                        className="mt-4 md:mt-0 px-4 py-2 bg-white text-indigo-600 rounded-md hover:bg-gray-100 transition-colors"
                    >
                        Create New Test
                    </button>
                </div>
            </div>

            <div className="p-6">
                {tests.length === 0 ? (
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
                                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                            />
                        </svg>
                        <h3 className="mt-2 text-lg font-medium text-gray-900">No mock tests created yet</h3>
                        <p className="mt-1 text-gray-500">Create tests to assess your students' knowledge.</p>
                        <div className="mt-6">
                            <button
                                onClick={onNewTest}
                                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                            >
                                Create a Mock Test
                            </button>
                        </div>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {tests.map((test) => (
                            <div
                                key={test._id}
                                className="border rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow"
                            >
                                <div className="border-b bg-gray-50 px-4 py-3 flex justify-between items-center">
                                    <div className="flex items-center">
                                        <FaClipboardList className="text-indigo-600 mr-2" />
                                        <h3 className="font-medium text-gray-900">{test.title}</h3>
                                    </div>
                                    <div className="flex items-center">
                                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${test.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                                            }`}>
                                            {test.isActive ? 'Active' : 'Draft'}
                                        </span>
                                    </div>
                                </div>
                                <div className="p-4">
                                    <div className="mb-4">
                                        <p className="text-sm text-gray-600">{test.description}</p>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
                                        <div>
                                            <span className="text-gray-500">Associated Course:</span>
                                            <p className="font-medium text-gray-900">{test.courseName || 'Not specified'}</p>
                                        </div>
                                        <div>
                                            <span className="text-gray-500">Time Limit:</span>
                                            <p className="font-medium text-gray-900">{test.timeLimit} minutes</p>
                                        </div>
                                        <div>
                                            <span className="text-gray-500">Questions:</span>
                                            <p className="font-medium text-gray-900">{test.questions?.length || 0}</p>
                                        </div>
                                        <div>
                                            <span className="text-gray-500">Passing Score:</span>
                                            <p className="font-medium text-gray-900">{test.passingScore}%</p>
                                        </div>
                                    </div>

                                    <div className="flex space-x-2 pt-3 border-t">
                                        <button
                                            onClick={() => onEditTest(test)}
                                            className="flex-1 inline-flex justify-center items-center px-3 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                                        >
                                            <FaEdit className="mr-2" /> Edit
                                        </button>
                                        <button
                                            onClick={() => onViewResults(test._id)}
                                            className="flex-1 inline-flex justify-center items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                                        >
                                            <FaChartBar className="mr-2" /> Results
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

export default MockTestsSection;
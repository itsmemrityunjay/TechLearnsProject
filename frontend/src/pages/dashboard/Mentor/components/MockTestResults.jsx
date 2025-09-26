import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FaArrowLeft, FaUser, FaClock, FaTrophy, FaCheckCircle, FaTimesCircle } from 'react-icons/fa';
import api from '../../../../utils/axiosConfig.js';
import { toast } from 'react-toastify';

const MockTestResults = () => {
    const { testId } = useParams();
    const navigate = useNavigate();
    const [results, setResults] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

    useEffect(() => {
        fetchResults();
    }, [testId]);

    const fetchResults = async () => {
        try {
            const token = localStorage.getItem("token");
            const config = {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            };

            const { data } = await api.get(
                `${API_BASE_URL}/api/mocktests/${testId}/results`,
                config
            );

            setResults(data);
        } catch (error) {
            console.error("Error fetching results:", error);
            setError(error.response?.data?.message || "Failed to fetch results");
            toast.error("Failed to fetch test results");
        } finally {
            setLoading(false);
        }
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    const formatTime = (minutes) => {
        const hrs = Math.floor(minutes / 60);
        const mins = minutes % 60;
        return hrs > 0 ? `${hrs}h ${mins}m` : `${mins}m`;
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            </div>
        );
    }

    if (error || !results) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-md">
                    <p className="text-red-700">{error || "No results found"}</p>
                    <button
                        onClick={() => navigate("/mentor")}
                        className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                    >
                        Back to Dashboard
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="container mx-auto py-8 px-4">
            <div className="mb-6">
                <button
                    onClick={() => navigate("/mentor")}
                    className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                    <FaArrowLeft className="mr-2" />
                    Back to Dashboard
                </button>
            </div>

            <div className="bg-white shadow-lg rounded-lg overflow-hidden">
                {/* Header */}
                <div className="bg-gradient-to-r from-indigo-600 to-purple-600 px-6 py-6">
                    <h1 className="text-2xl font-bold text-white">{results.testInfo.title}</h1>
                    <p className="text-indigo-100 mt-2">{results.testInfo.description}</p>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
                        <div className="text-center">
                            <p className="text-indigo-100 text-sm">Questions</p>
                            <p className="text-white text-lg font-bold">{results.testInfo.totalQuestions}</p>
                        </div>
                        <div className="text-center">
                            <p className="text-indigo-100 text-sm">Time Limit</p>
                            <p className="text-white text-lg font-bold">{formatTime(results.testInfo.timeLimit)}</p>
                        </div>
                        <div className="text-center">
                            <p className="text-indigo-100 text-sm">Passing Score</p>
                            <p className="text-white text-lg font-bold">{results.testInfo.passingScore}%</p>
                        </div>
                        <div className="text-center">
                            <p className="text-indigo-100 text-sm">Course</p>
                            <p className="text-white text-lg font-bold">{results.testInfo.courseId?.title || 'N/A'}</p>
                        </div>
                    </div>
                </div>

                {/* Statistics */}
                <div className="p-6 border-b">
                    <h2 className="text-xl font-semibold text-gray-900 mb-4">Test Statistics</h2>
                    <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                        <div className="bg-blue-50 p-4 rounded-lg text-center">
                            <FaUser className="mx-auto text-blue-500 text-2xl mb-2" />
                            <p className="text-gray-600 text-sm">Total Attempts</p>
                            <p className="text-blue-600 text-xl font-bold">{results.statistics.totalAttempts}</p>
                        </div>
                        <div className="bg-green-50 p-4 rounded-lg text-center">
                            <FaTrophy className="mx-auto text-green-500 text-2xl mb-2" />
                            <p className="text-gray-600 text-sm">Average Score</p>
                            <p className="text-green-600 text-xl font-bold">{results.statistics.averageScore}%</p>
                        </div>
                        <div className="bg-purple-50 p-4 rounded-lg text-center">
                            <FaCheckCircle className="mx-auto text-purple-500 text-2xl mb-2" />
                            <p className="text-gray-600 text-sm">Pass Rate</p>
                            <p className="text-purple-600 text-xl font-bold">{results.statistics.passRate}%</p>
                        </div>
                        <div className="bg-yellow-50 p-4 rounded-lg text-center">
                            <FaTrophy className="mx-auto text-yellow-500 text-2xl mb-2" />
                            <p className="text-gray-600 text-sm">Highest Score</p>
                            <p className="text-yellow-600 text-xl font-bold">{results.statistics.highestScore}%</p>
                        </div>
                        <div className="bg-red-50 p-4 rounded-lg text-center">
                            <FaTimesCircle className="mx-auto text-red-500 text-2xl mb-2" />
                            <p className="text-gray-600 text-sm">Lowest Score</p>
                            <p className="text-red-600 text-xl font-bold">{results.statistics.lowestScore}%</p>
                        </div>
                    </div>
                </div>

                {/* Student Results */}
                <div className="p-6">
                    <h2 className="text-xl font-semibold text-gray-900 mb-4">Student Results</h2>
                    {results.attempts.length === 0 ? (
                        <div className="text-center py-8">
                            <p className="text-gray-500">No attempts yet</p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Student
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Score
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Percentage
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Status
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Time Spent
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Submitted At
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {results.attempts.map((attempt) => (
                                        <tr key={attempt._id} className="hover:bg-gray-50">
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex items-center">
                                                    <div>
                                                        <div className="text-sm font-medium text-gray-900">
                                                            {attempt.student.firstName} {attempt.student.lastName}
                                                        </div>
                                                        <div className="text-sm text-gray-500">
                                                            {attempt.student.email}
                                                        </div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                {attempt.score}/{attempt.maxScore}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm font-medium text-gray-900">
                                                    {attempt.percentage}%
                                                </div>
                                                <div className="w-full bg-gray-200 rounded-full h-1 mt-1">
                                                    <div
                                                        className={`h-1 rounded-full ${attempt.passed ? 'bg-green-600' : 'bg-red-600'
                                                            }`}
                                                        style={{ width: `${attempt.percentage}%` }}
                                                    ></div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${attempt.passed
                                                    ? 'bg-green-100 text-green-800'
                                                    : 'bg-red-100 text-red-800'
                                                    }`}>
                                                    {attempt.passed ? (
                                                        <>
                                                            <FaCheckCircle className="mr-1" />
                                                            Passed
                                                        </>
                                                    ) : (
                                                        <>
                                                            <FaTimesCircle className="mr-1" />
                                                            Failed
                                                        </>
                                                    )}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                <div className="flex items-center">
                                                    <FaClock className="mr-2 text-gray-400" />
                                                    {formatTime(attempt.timeSpent || 0)}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                {formatDate(attempt.submittedAt)}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default MockTestResults;
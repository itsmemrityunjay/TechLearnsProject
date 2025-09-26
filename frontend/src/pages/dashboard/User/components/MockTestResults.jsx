import React, { useState, useEffect } from 'react';
import { FaTrophy, FaClock, FaCheckCircle, FaTimesCircle, FaBook, FaPlay } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import api from '../../../utils/axiosConfig';
import { toast } from 'react-toastify';

const MockTestResults = () => {
    const [results, setResults] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

    useEffect(() => {
        fetchResults();
    }, []);

    const fetchResults = async () => {
        try {
            const token = localStorage.getItem("token");
            const config = {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            };

            const { data } = await api.get(
                `${API_BASE_URL}/api/mock-tests/my-results`,
                config
            );

            if (data.success) {
                setResults(data.results);
            }
        } catch (error) {
            console.error("Error fetching results:", error);
            setError("Failed to load your test results");
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

    if (loading) {
        return (
            <div className="bg-white rounded-lg shadow-sm p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">My Mock Test Results</h3>
                <div className="flex justify-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="bg-white rounded-lg shadow-sm p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">My Mock Test Results</h3>
                <div className="text-center py-4">
                    <p className="text-red-600">{error}</p>
                    <button
                        onClick={fetchResults}
                        className="mt-2 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                    >
                        Retry
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-gray-900">My Mock Test Results</h3>
                <button
                    onClick={() => navigate('/mock-tests')}
                    className="inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
                >
                    <FaPlay className="mr-2" />
                    Take a Test
                </button>
            </div>

            {results.length === 0 ? (
                <div className="text-center py-8">
                    <FaTrophy className="mx-auto text-gray-400 text-4xl mb-4" />
                    <h4 className="text-lg font-medium text-gray-900 mb-2">No Test Results Yet</h4>
                    <p className="text-gray-600 mb-4">Take your first mock test to see your results here.</p>
                    <button
                        onClick={() => navigate('/mock-tests')}
                        className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
                    >
                        <FaPlay className="mr-2" />
                        Browse Tests
                    </button>
                </div>
            ) : (
                <div className="space-y-4">
                    {results.slice(0, 5).map((result) => (
                        <div key={result._id} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                            <div className="flex justify-between items-start">
                                <div className="flex-1">
                                    <h4 className="font-medium text-gray-900 mb-1">
                                        {result.testTitle}
                                    </h4>
                                    <div className="flex items-center text-sm text-gray-600 mb-2">
                                        <FaBook className="mr-1" />
                                        <span>{result.courseTitle}</span>
                                    </div>
                                    <div className="flex items-center text-sm text-gray-500">
                                        <FaClock className="mr-1" />
                                        <span>{formatDate(result.takenAt)}</span>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium mb-2 ${result.passed
                                            ? 'bg-green-100 text-green-800'
                                            : 'bg-red-100 text-red-800'
                                        }`}>
                                        {result.passed ? (
                                            <FaCheckCircle className="mr-1" />
                                        ) : (
                                            <FaTimesCircle className="mr-1" />
                                        )}
                                        {result.passed ? 'Passed' : 'Failed'}
                                    </div>
                                    <div className="text-lg font-bold text-gray-900">
                                        {result.percentage}%
                                    </div>
                                    <div className="text-sm text-gray-600">
                                        {result.score}/{result.maxScore} points
                                    </div>
                                </div>
                            </div>
                            <div className="mt-3">
                                <div className="w-full bg-gray-200 rounded-full h-2">
                                    <div
                                        className={`h-2 rounded-full ${result.passed ? 'bg-green-600' : 'bg-red-600'
                                            }`}
                                        style={{ width: `${result.percentage}%` }}
                                    ></div>
                                </div>
                            </div>
                        </div>
                    ))}

                    {results.length > 5 && (
                        <div className="text-center pt-4">
                            <button
                                onClick={() => navigate('/dashboard/mock-test-results')} // You can create a detailed results page
                                className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                            >
                                View All Results ({results.length})
                            </button>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default MockTestResults;
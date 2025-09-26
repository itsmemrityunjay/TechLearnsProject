import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaClock, FaQuestionCircle, FaTrophy, FaPlay, FaUser, FaBook } from 'react-icons/fa';
import api from '../../utils/axiosConfig.js';
import { toast } from 'react-toastify';

const MockTestList = () => {
    const [tests, setTests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [categoryFilter, setCategoryFilter] = useState('');
    const navigate = useNavigate();

    const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

    useEffect(() => {
        fetchTests();
    }, []);

    const fetchTests = async () => {
        try {
            const { data } = await api.get(`${API_BASE_URL}/api/mock-tests`);
            setTests(data);
        } catch (error) {
            console.error("Error fetching tests:", error);
            setError("Failed to load tests");
            toast.error("Failed to load mock tests");
        } finally {
            setLoading(false);
        }
    };

    const handleStartTest = (testId) => {
        const token = localStorage.getItem("token");
        if (!token) {
            toast.error("Please login to take the test");
            navigate("/login");
            return;
        }
        navigate(`/take-test/${testId}`);
    };

    const formatTime = (minutes) => {
        const hrs = Math.floor(minutes / 60);
        const mins = minutes % 60;
        return hrs > 0 ? `${hrs}h ${mins}m` : `${mins}m`;
    };

    const filteredTests = tests.filter(test => {
        const matchesSearch = test.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            test.description?.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesCategory = !categoryFilter || test.courseId?.category === categoryFilter;
        return matchesSearch && matchesCategory;
    });

    // Get unique categories for filter
    const categories = [...new Set(tests.map(test => test.courseId?.category).filter(Boolean))];

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-md">
                    <p className="text-red-700">{error}</p>
                    <button
                        onClick={fetchTests}
                        className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                    >
                        Try Again
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="container mx-auto px-4 py-8">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900 mb-4">Mock Tests</h1>
                    <p className="text-gray-600">Test your knowledge and skills with our comprehensive mock tests</p>
                </div>

                {/* Filters */}
                <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-2">
                                Search Tests
                            </label>
                            <input
                                type="text"
                                id="search"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                placeholder="Search by title or description..."
                                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                            />
                        </div>
                        <div>
                            <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-2">
                                Category
                            </label>
                            <select
                                id="category"
                                value={categoryFilter}
                                onChange={(e) => setCategoryFilter(e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                            >
                                <option value="">All Categories</option>
                                {categories.map(category => (
                                    <option key={category} value={category}>{category}</option>
                                ))}
                            </select>
                        </div>
                    </div>
                </div>

                {/* Tests Grid */}
                {filteredTests.length === 0 ? (
                    <div className="text-center py-12">
                        <FaQuestionCircle className="mx-auto text-gray-400 text-6xl mb-4" />
                        <h3 className="text-xl font-medium text-gray-900 mb-2">No Tests Found</h3>
                        <p className="text-gray-600">
                            {searchTerm || categoryFilter
                                ? "No tests match your current filters"
                                : "No mock tests are available at the moment"
                            }
                        </p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredTests.map(test => (
                            <div key={test._id} className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200 overflow-hidden">
                                <div className="p-6">
                                    <div className="flex justify-between items-start mb-4">
                                        <h3 className="text-lg font-semibold text-gray-900 line-clamp-2">
                                            {test.title}
                                        </h3>
                                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                            Active
                                        </span>
                                    </div>

                                    {test.description && (
                                        <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                                            {test.description}
                                        </p>
                                    )}

                                    <div className="grid grid-cols-2 gap-4 mb-4">
                                        <div className="flex items-center text-sm text-gray-600">
                                            <FaQuestionCircle className="mr-2 text-blue-500" />
                                            <span>{test.questions?.length || 0} Questions</span>
                                        </div>
                                        <div className="flex items-center text-sm text-gray-600">
                                            <FaClock className="mr-2 text-orange-500" />
                                            <span>{formatTime(test.timeLimit)}</span>
                                        </div>
                                        <div className="flex items-center text-sm text-gray-600">
                                            <FaTrophy className="mr-2 text-yellow-500" />
                                            <span>{test.passingScore}% to pass</span>
                                        </div>
                                        <div className="flex items-center text-sm text-gray-600">
                                            <FaBook className="mr-2 text-green-500" />
                                            <span>{test.courseId?.title || 'General'}</span>
                                        </div>
                                    </div>

                                    {test.createdBy && (
                                        <div className="flex items-center text-sm text-gray-600 mb-4">
                                            <FaUser className="mr-2 text-gray-400" />
                                            <span>By {test.createdBy.firstName} {test.createdBy.lastName}</span>
                                        </div>
                                    )}

                                    <div className="border-t pt-4">
                                        <button
                                            onClick={() => handleStartTest(test._id)}
                                            className="w-full inline-flex justify-center items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200"
                                        >
                                            <FaPlay className="mr-2" />
                                            Start Test
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* Pagination could be added here if needed */}
            </div>
        </div>
    );
};

export default MockTestList;
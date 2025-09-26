import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FaClock, FaQuestionCircle, FaCheckCircle, FaTimesCircle, FaArrowLeft } from 'react-icons/fa';
import api from '../../../utils/axiosConfig';
import { toast } from 'react-toastify';

const TakeMockTest = () => {
    const { testId } = useParams();
    const navigate = useNavigate();
    const [test, setTest] = useState(null);
    const [loading, setLoading] = useState(true);
    const [answers, setAnswers] = useState({});
    const [currentQuestion, setCurrentQuestion] = useState(0);
    const [timeRemaining, setTimeRemaining] = useState(0);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [testStartTime, setTestStartTime] = useState(null);
    const [showConfirmSubmit, setShowConfirmSubmit] = useState(false);

    const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

    useEffect(() => {
        startTest();
    }, [testId]);

    useEffect(() => {
        if (timeRemaining > 0 && test) {
            const timer = setTimeout(() => {
                setTimeRemaining(timeRemaining - 1);
            }, 1000);
            return () => clearTimeout(timer);
        } else if (timeRemaining === 0 && test && !isSubmitting) {
            // Auto-submit when time runs out
            handleSubmit(true);
        }
    }, [timeRemaining, test, isSubmitting]);

    const startTest = async () => {
        try {
            const token = localStorage.getItem("token");
            if (!token) {
                navigate("/login");
                return;
            }

            const config = {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            };

            const { data } = await api.get(
                `${API_BASE_URL}/api/mock-tests/${testId}/start`,
                config
            );

            setTest(data);
            setTimeRemaining(data.timeLimit * 60); // Convert minutes to seconds
            setTestStartTime(Date.now());

            // Initialize answers object
            const initialAnswers = {};
            data.questions.forEach((_, index) => {
                initialAnswers[index] = null;
            });
            setAnswers(initialAnswers);

        } catch (error) {
            console.error("Error starting test:", error);
            if (error.response?.status === 409) {
                // User already attempted this test
                toast.error(error.response.data.message);
                navigate("/dashboard");
            } else if (error.response?.status === 401) {
                navigate("/login");
            } else {
                toast.error("Failed to start test");
                navigate("/dashboard");
            }
        } finally {
            setLoading(false);
        }
    };

    const handleAnswerChange = (questionIndex, optionIndex) => {
        setAnswers(prev => ({
            ...prev,
            [questionIndex]: optionIndex
        }));
    };

    const handleSubmit = async (autoSubmit = false) => {
        if (!autoSubmit && !window.confirm("Are you sure you want to submit your test?")) {
            return;
        }

        setIsSubmitting(true);

        try {
            const token = localStorage.getItem("token");
            const config = {
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
            };

            // Calculate time spent in minutes
            const timeSpent = Math.round((Date.now() - testStartTime) / (1000 * 60));

            // Convert answers object to array format expected by backend
            const answersArray = [];
            for (let i = 0; i < test.questions.length; i++) {
                answersArray[i] = answers[i] !== null ? answers[i] : -1; // -1 for unanswered
            }

            const { data } = await api.post(
                `${API_BASE_URL}/api/mock-tests/${testId}/submit`,
                {
                    answers: answersArray,
                    timeSpent: timeSpent
                },
                config
            );

            // Navigate to results page with the result data
            navigate(`/test-results/${testId}`, { state: { results: data.results } });

        } catch (error) {
            console.error("Error submitting test:", error);
            toast.error(error.response?.data?.message || "Failed to submit test");
        } finally {
            setIsSubmitting(false);
        }
    };

    const formatTime = (seconds) => {
        const hours = Math.floor(seconds / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);
        const secs = seconds % 60;

        if (hours > 0) {
            return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
        } else {
            return `${minutes}:${secs.toString().padStart(2, '0')}`;
        }
    };

    const getAnsweredCount = () => {
        return Object.values(answers).filter(answer => answer !== null).length;
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            </div>
        );
    }

    if (!test) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-md">
                    <p className="text-red-700">Test not found or no longer available</p>
                    <button
                        onClick={() => navigate("/dashboard")}
                        className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                    >
                        Back to Dashboard
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header with timer */}
            <div className="bg-white shadow-sm border-b sticky top-0 z-10">
                <div className="container mx-auto px-4 py-4">
                    <div className="flex justify-between items-center">
                        <div>
                            <h1 className="text-xl font-bold text-gray-900">{test.title}</h1>
                            <p className="text-sm text-gray-600">
                                Question {currentQuestion + 1} of {test.questions.length}
                            </p>
                        </div>
                        <div className="flex items-center space-x-4">
                            <div className={`flex items-center px-3 py-2 rounded-full ${timeRemaining < 300 ? 'bg-red-100 text-red-800' : 'bg-blue-100 text-blue-800'
                                }`}>
                                <FaClock className="mr-2" />
                                <span className="font-mono font-bold">{formatTime(timeRemaining)}</span>
                            </div>
                            <button
                                onClick={() => setShowConfirmSubmit(true)}
                                disabled={isSubmitting}
                                className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50"
                            >
                                {isSubmitting ? 'Submitting...' : 'Submit Test'}
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <div className="container mx-auto px-4 py-6">
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                    {/* Question Navigation */}
                    <div className="lg:col-span-1">
                        <div className="bg-white rounded-lg shadow-sm p-4 sticky top-24">
                            <h3 className="text-lg font-semibold mb-4">Questions</h3>
                            <div className="grid grid-cols-5 gap-2 mb-4">
                                {test.questions.map((_, index) => (
                                    <button
                                        key={index}
                                        onClick={() => setCurrentQuestion(index)}
                                        className={`w-10 h-10 rounded-md text-sm font-medium ${currentQuestion === index
                                                ? 'bg-blue-600 text-white'
                                                : answers[index] !== null
                                                    ? 'bg-green-100 text-green-800 border border-green-300'
                                                    : 'bg-gray-100 text-gray-800 border border-gray-300 hover:bg-gray-200'
                                            }`}
                                    >
                                        {index + 1}
                                    </button>
                                ))}
                            </div>
                            <div className="text-sm text-gray-600">
                                <p>Answered: {getAnsweredCount()}/{test.questions.length}</p>
                                <p>Remaining: {test.questions.length - getAnsweredCount()}</p>
                            </div>
                        </div>
                    </div>

                    {/* Question Content */}
                    <div className="lg:col-span-3">
                        <div className="bg-white rounded-lg shadow-sm p-6">
                            <div className="mb-6">
                                <div className="flex justify-between items-start mb-4">
                                    <h2 className="text-lg font-semibold text-gray-900">
                                        Question {currentQuestion + 1}
                                    </h2>
                                    <span className="text-sm text-gray-500">
                                        {test.questions[currentQuestion].points || 1} point{(test.questions[currentQuestion].points || 1) > 1 ? 's' : ''}
                                    </span>
                                </div>
                                <p className="text-gray-800 text-lg leading-relaxed">
                                    {test.questions[currentQuestion].question}
                                </p>
                            </div>

                            <div className="space-y-3 mb-6">
                                {test.questions[currentQuestion].options.map((option, index) => (
                                    <button
                                        key={index}
                                        onClick={() => handleAnswerChange(currentQuestion, index)}
                                        className={`w-full text-left p-4 rounded-lg border-2 transition-all duration-200 ${answers[currentQuestion] === index
                                                ? 'border-blue-500 bg-blue-50 text-blue-900'
                                                : 'border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50'
                                            }`}
                                    >
                                        <div className="flex items-center">
                                            <div className={`w-5 h-5 rounded-full border-2 mr-3 flex items-center justify-center ${answers[currentQuestion] === index
                                                    ? 'border-blue-500 bg-blue-500'
                                                    : 'border-gray-300'
                                                }`}>
                                                {answers[currentQuestion] === index && (
                                                    <div className="w-2 h-2 rounded-full bg-white"></div>
                                                )}
                                            </div>
                                            <span className="text-sm font-medium mr-3">
                                                {String.fromCharCode(65 + index)}.
                                            </span>
                                            <span>{option}</span>
                                        </div>
                                    </button>
                                ))}
                            </div>

                            {/* Navigation buttons */}
                            <div className="flex justify-between">
                                <button
                                    onClick={() => setCurrentQuestion(Math.max(0, currentQuestion - 1))}
                                    disabled={currentQuestion === 0}
                                    className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    Previous
                                </button>
                                <button
                                    onClick={() => setCurrentQuestion(Math.min(test.questions.length - 1, currentQuestion + 1))}
                                    disabled={currentQuestion === test.questions.length - 1}
                                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    Next
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Confirm Submit Modal */}
            {showConfirmSubmit && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-6 max-w-md mx-4">
                        <h3 className="text-lg font-semibold mb-4">Submit Test</h3>
                        <p className="text-gray-600 mb-4">
                            Are you sure you want to submit your test? You have answered {getAnsweredCount()} out of {test.questions.length} questions.
                        </p>
                        <div className="flex space-x-3">
                            <button
                                onClick={() => setShowConfirmSubmit(false)}
                                className="flex-1 px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={() => handleSubmit()}
                                className="flex-1 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
                            >
                                Submit
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default TakeMockTest;
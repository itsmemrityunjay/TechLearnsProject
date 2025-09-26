import React, { useEffect, useState } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import { FaCheckCircle, FaTimesCircle, FaTrophy, FaClock, FaArrowLeft, FaRedo } from 'react-icons/fa';
import { toast } from 'react-toastify';

const TestResults = () => {
    const { testId } = useParams();
    const location = useLocation();
    const navigate = useNavigate();
    const [results, setResults] = useState(null);

    useEffect(() => {
        if (location.state?.results) {
            setResults(location.state.results);
        } else {
            // If no results in state, redirect to dashboard
            toast.error("No test results found");
            navigate("/dashboard");
        }
    }, [location.state, navigate]);

    const formatTime = (minutes) => {
        const hrs = Math.floor(minutes / 60);
        const mins = minutes % 60;
        return hrs > 0 ? `${hrs}h ${mins}m` : `${mins}m`;
    };

    if (!results) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            </div>
        );
    }

    const { passed, percentage, score, maxScore, timeSpent, totalQuestions, correctAnswers } = results;

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="container mx-auto px-4 py-8">
                {/* Back button */}
                <div className="mb-6">
                    <button
                        onClick={() => navigate("/dashboard")}
                        className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                    >
                        <FaArrowLeft className="mr-2" />
                        Back to Dashboard
                    </button>
                </div>

                {/* Results Header */}
                <div className="bg-white rounded-lg shadow-lg overflow-hidden mb-8">
                    <div className={`px-6 py-8 text-center ${passed ? 'bg-gradient-to-r from-green-500 to-green-600' : 'bg-gradient-to-r from-red-500 to-red-600'}`}>
                        <div className="text-white">
                            {passed ? (
                                <FaCheckCircle className="mx-auto text-6xl mb-4" />
                            ) : (
                                <FaTimesCircle className="mx-auto text-6xl mb-4" />
                            )}
                            <h1 className="text-3xl font-bold mb-2">
                                {passed ? 'Congratulations!' : 'Keep Trying!'}
                            </h1>
                            <p className="text-xl mb-4">
                                {passed ? 'You passed the test!' : 'You didn\'t pass this time, but don\'t give up!'}
                            </p>
                            <div className="text-4xl font-bold mb-2">{percentage}%</div>
                            <p className="text-lg">
                                Your Score: {score}/{maxScore} points
                            </p>
                        </div>
                    </div>

                    {/* Statistics */}
                    <div className="px-6 py-6">
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                            <div className="text-center">
                                <FaTrophy className="mx-auto text-yellow-500 text-2xl mb-2" />
                                <p className="text-gray-600 text-sm">Score</p>
                                <p className="text-2xl font-bold text-gray-900">{score}/{maxScore}</p>
                            </div>
                            <div className="text-center">
                                <FaCheckCircle className="mx-auto text-green-500 text-2xl mb-2" />
                                <p className="text-gray-600 text-sm">Correct</p>
                                <p className="text-2xl font-bold text-gray-900">{correctAnswers}/{totalQuestions}</p>
                            </div>
                            <div className="text-center">
                                <FaTimesCircle className="mx-auto text-red-500 text-2xl mb-2" />
                                <p className="text-gray-600 text-sm">Incorrect</p>
                                <p className="text-2xl font-bold text-gray-900">{totalQuestions - correctAnswers}/{totalQuestions}</p>
                            </div>
                            <div className="text-center">
                                <FaClock className="mx-auto text-blue-500 text-2xl mb-2" />
                                <p className="text-gray-600 text-sm">Time Spent</p>
                                <p className="text-2xl font-bold text-gray-900">{formatTime(timeSpent || 0)}</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Detailed Results */}
                <div className="bg-white rounded-lg shadow-lg overflow-hidden">
                    <div className="px-6 py-4 bg-gray-50 border-b">
                        <h2 className="text-xl font-semibold text-gray-900">Question-wise Results</h2>
                    </div>
                    <div className="divide-y divide-gray-200">
                        {results.questions.map((question, index) => (
                            <div key={index} className="p-6">
                                <div className="flex items-start justify-between mb-4">
                                    <h3 className="text-lg font-medium text-gray-900">
                                        Question {question.questionNumber}
                                        <span className="ml-2 text-sm text-gray-500">
                                            ({question.points} point{question.points > 1 ? 's' : ''})
                                        </span>
                                    </h3>
                                    <div className="flex items-center">
                                        {question.isCorrect ? (
                                            <FaCheckCircle className="text-green-500 text-xl" />
                                        ) : (
                                            <FaTimesCircle className="text-red-500 text-xl" />
                                        )}
                                        <span className="ml-2 text-sm font-medium">
                                            {question.earnedPoints}/{question.points}
                                        </span>
                                    </div>
                                </div>

                                <p className="text-gray-800 mb-4">{question.question}</p>

                                <div className="space-y-2 mb-4">
                                    {question.options.map((option, optionIndex) => (
                                        <div
                                            key={optionIndex}
                                            className={`p-3 rounded-lg border ${optionIndex === question.correctAnswer
                                                    ? 'border-green-500 bg-green-50'
                                                    : optionIndex === question.userAnswer && !question.isCorrect
                                                        ? 'border-red-500 bg-red-50'
                                                        : 'border-gray-200 bg-gray-50'
                                                }`}
                                        >
                                            <div className="flex items-center">
                                                <span className="font-medium mr-3">
                                                    {String.fromCharCode(65 + optionIndex)}.
                                                </span>
                                                <span>{option}</span>
                                                {optionIndex === question.correctAnswer && (
                                                    <FaCheckCircle className="ml-auto text-green-500" />
                                                )}
                                                {optionIndex === question.userAnswer && !question.isCorrect && (
                                                    <FaTimesCircle className="ml-auto text-red-500" />
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                {question.userAnswer === undefined || question.userAnswer === -1 ? (
                                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                                        <p className="text-yellow-800 text-sm">
                                            <strong>Not Answered:</strong> You didn't select an answer for this question.
                                        </p>
                                    </div>
                                ) : (
                                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-3">
                                        <p className="text-blue-800 text-sm">
                                            <strong>Your Answer:</strong> {String.fromCharCode(65 + question.userAnswer)} - {question.options[question.userAnswer]}
                                        </p>
                                        <p className="text-blue-800 text-sm">
                                            <strong>Correct Answer:</strong> {String.fromCharCode(65 + question.correctAnswer)} - {question.options[question.correctAnswer]}
                                        </p>
                                    </div>
                                )}

                                {question.explanation && (
                                    <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
                                        <p className="text-gray-700 text-sm">
                                            <strong>Explanation:</strong> {question.explanation}
                                        </p>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>

                {/* Action buttons */}
                <div className="flex justify-center mt-8">
                    <button
                        onClick={() => navigate("/dashboard")}
                        className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                    >
                        Back to Dashboard
                    </button>
                </div>
            </div>
        </div>
    );
};

export default TestResults;
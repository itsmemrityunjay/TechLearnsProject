import React, { useState, useEffect } from 'react';
import { FaPlus, FaTrash, FaSave, FaTimes } from 'react-icons/fa';

const MockTestForm = ({ test = null, onSubmit, onCancel, courses }) => {
    const emptyQuestion = {
        question: '',
        options: ['', '', '', ''],
        correctAnswer: 0, // Index of the correct option
        explanation: '',
    };

    const [formData, setFormData] = useState({
        title: '',
        description: '',
        courseId: '',
        timeLimit: 30,
        passingScore: 70,
        isActive: false,
        questions: [{ ...emptyQuestion }],
    });

    const [activeQuestionIndex, setActiveQuestionIndex] = useState(0);
    const [error, setError] = useState('');

    useEffect(() => {
        // If editing existing test, populate form with test data
        if (test) {
            setFormData({
                title: test.title || '',
                description: test.description || '',
                courseId: test.courseId || '',
                timeLimit: test.timeLimit || 30,
                passingScore: test.passingScore || 70,
                isActive: test.isActive || false,
                questions: test.questions?.length > 0
                    ? test.questions
                    : [{ ...emptyQuestion }],
            });
        }
    }, [test]);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData({
            ...formData,
            [name]: type === 'checkbox' ? checked : value
        });
    };

    const handleQuestionChange = (e, questionIndex) => {
        const { name, value } = e.target;
        const updatedQuestions = [...formData.questions];

        updatedQuestions[questionIndex] = {
            ...updatedQuestions[questionIndex],
            [name]: value
        };

        setFormData({
            ...formData,
            questions: updatedQuestions
        });
    };

    const handleOptionChange = (e, questionIndex, optionIndex) => {
        const { value } = e.target;
        const updatedQuestions = [...formData.questions];
        const options = [...updatedQuestions[questionIndex].options];

        options[optionIndex] = value;

        updatedQuestions[questionIndex] = {
            ...updatedQuestions[questionIndex],
            options
        };

        setFormData({
            ...formData,
            questions: updatedQuestions
        });
    };

    const handleCorrectAnswerChange = (questionIndex, optionIndex) => {
        const updatedQuestions = [...formData.questions];

        updatedQuestions[questionIndex] = {
            ...updatedQuestions[questionIndex],
            correctAnswer: optionIndex
        };

        setFormData({
            ...formData,
            questions: updatedQuestions
        });
    };

    const handleAddQuestion = () => {
        const updatedQuestions = [...formData.questions, { ...emptyQuestion }];

        setFormData({
            ...formData,
            questions: updatedQuestions
        });

        setActiveQuestionIndex(updatedQuestions.length - 1);
    };

    const handleRemoveQuestion = (questionIndex) => {
        if (formData.questions.length === 1) {
            setError('Test must have at least one question');
            return;
        }

        const updatedQuestions = [...formData.questions];
        updatedQuestions.splice(questionIndex, 1);

        setFormData({
            ...formData,
            questions: updatedQuestions
        });

        if (activeQuestionIndex >= updatedQuestions.length) {
            setActiveQuestionIndex(updatedQuestions.length - 1);
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        setError('');

        // Validation
        if (!formData.title.trim()) {
            setError('Title is required');
            return;
        }

        if (!formData.courseId) {
            setError('Please select a course');
            return;
        }

        if (formData.timeLimit <= 0) {
            setError('Time limit must be greater than 0');
            return;
        }

        if (formData.passingScore < 0 || formData.passingScore > 100) {
            setError('Passing score must be between 0 and 100');
            return;
        }

        // Validate questions
        let isValid = true;
        formData.questions.forEach((q, i) => {
            if (!q.question.trim()) {
                setError(`Question ${i + 1} text is empty`);
                isValid = false;
                return;
            }

            q.options.forEach((opt, j) => {
                if (!opt.trim()) {
                    setError(`Option ${j + 1} in Question ${i + 1} is empty`);
                    isValid = false;
                    return;
                }
            });
        });

        if (!isValid) {
            return;
        }

        // Submit form
        onSubmit(formData);
    };

    return (
        <div className="bg-white shadow rounded-lg overflow-hidden">
            <div className="bg-gradient-to-r from-indigo-600 to-purple-600 px-6 py-4">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                    <h2 className="text-2xl font-bold text-white">
                        {test ? 'Edit Mock Test' : 'Create Mock Test'}
                    </h2>
                    <button
                        type="button"
                        onClick={onCancel}
                        className="mt-4 md:mt-0 px-4 py-2 bg-white text-indigo-600 rounded-md hover:bg-gray-100 transition-colors"
                    >
                        <FaTimes className="inline mr-1" /> Cancel
                    </button>
                </div>
            </div>

            {error && (
                <div className="bg-red-50 border-l-4 border-red-500 p-4 m-6">
                    <div className="flex items-center">
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
            )}

            <div className="p-6">
                <form onSubmit={handleSubmit}>
                    {/* Test Details */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Test Title
                            </label>
                            <input
                                type="text"
                                name="title"
                                value={formData.title}
                                onChange={handleChange}
                                className="block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                placeholder="e.g., Python Fundamentals Quiz"
                                required
                            />
                        </div>

                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Description
                            </label>
                            <textarea
                                name="description"
                                value={formData.description}
                                onChange={handleChange}
                                rows={3}
                                className="block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                placeholder="Brief description about this test"
                            ></textarea>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Associated Course
                            </label>
                            <select
                                name="courseId"
                                value={formData.courseId}
                                onChange={handleChange}
                                className="block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                required
                            >
                                <option value="">Select a course</option>
                                {courses.map((course) => (
                                    <option key={course._id} value={course._id}>
                                        {course.title}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Time Limit (minutes)
                            </label>
                            <input
                                type="number"
                                name="timeLimit"
                                value={formData.timeLimit}
                                onChange={handleChange}
                                min="1"
                                className="block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Passing Score (%)
                            </label>
                            <input
                                type="number"
                                name="passingScore"
                                value={formData.passingScore}
                                onChange={handleChange}
                                min="0"
                                max="100"
                                className="block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                required
                            />
                        </div>

                        <div className="flex items-center">
                            <input
                                id="isActive"
                                name="isActive"
                                type="checkbox"
                                checked={formData.isActive}
                                onChange={handleChange}
                                className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                            />
                            <label htmlFor="isActive" className="ml-2 block text-sm text-gray-900">
                                Make test active and available to students
                            </label>
                        </div>
                    </div>

                    {/* Questions Section */}
                    <div className="border-t border-gray-200 pt-6">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-lg font-medium text-gray-900">Questions</h3>
                            <button
                                type="button"
                                onClick={handleAddQuestion}
                                className="inline-flex items-center px-3 py-1 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                            >
                                <FaPlus className="mr-1" /> Add Question
                            </button>
                        </div>

                        {/* Question Tabs */}
                        <div className="border-b border-gray-200 mb-4">
                            <div className="flex overflow-x-auto">
                                {formData.questions.map((_, index) => (
                                    <button
                                        key={index}
                                        type="button"
                                        onClick={() => setActiveQuestionIndex(index)}
                                        className={`px-4 py-2 text-sm font-medium ${activeQuestionIndex === index
                                                ? 'border-b-2 border-indigo-500 text-indigo-600'
                                                : 'text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                            }`}
                                    >
                                        Q{index + 1}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Active Question */}
                        <div className="bg-gray-50 p-4 rounded-md mb-6">
                            <div className="flex justify-between items-start mb-4">
                                <h4 className="text-md font-medium text-gray-800">
                                    Question {activeQuestionIndex + 1}
                                </h4>
                                <button
                                    type="button"
                                    onClick={() => handleRemoveQuestion(activeQuestionIndex)}
                                    className="text-red-500 hover:text-red-700"
                                    disabled={formData.questions.length === 1}
                                >
                                    <FaTrash /> Remove
                                </button>
                            </div>

                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Question Text
                                </label>
                                <textarea
                                    name="question"
                                    value={formData.questions[activeQuestionIndex].question}
                                    onChange={(e) => handleQuestionChange(e, activeQuestionIndex)}
                                    rows={2}
                                    className="block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                    placeholder="Enter question text"
                                    required
                                ></textarea>
                            </div>

                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Options
                                </label>
                                {formData.questions[activeQuestionIndex].options.map((option, optIndex) => (
                                    <div key={optIndex} className="flex items-center mb-2">
                                        <input
                                            type="radio"
                                            id={`q${activeQuestionIndex}-opt${optIndex}`}
                                            name={`q${activeQuestionIndex}-correct`}
                                            checked={formData.questions[activeQuestionIndex].correctAnswer === optIndex}
                                            onChange={() => handleCorrectAnswerChange(activeQuestionIndex, optIndex)}
                                            className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300"
                                        />
                                        <input
                                            type="text"
                                            value={option}
                                            onChange={(e) => handleOptionChange(e, activeQuestionIndex, optIndex)}
                                            className="ml-2 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                            placeholder={`Option ${optIndex + 1}`}
                                            required
                                        />
                                    </div>
                                ))}
                                <p className="text-xs text-gray-500 mt-1">
                                    Select the radio button next to the correct answer
                                </p>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Explanation (Optional)
                                </label>
                                <textarea
                                    name="explanation"
                                    value={formData.questions[activeQuestionIndex].explanation}
                                    onChange={(e) => handleQuestionChange(e, activeQuestionIndex)}
                                    rows={2}
                                    className="block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                    placeholder="Explain why this answer is correct (shown after test completion)"
                                ></textarea>
                            </div>
                        </div>
                    </div>

                    {/* Submit Buttons */}
                    <div className="flex justify-end space-x-3">
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
                            <FaSave className="mr-2" /> {test ? 'Update Test' : 'Create Test'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default MockTestForm;
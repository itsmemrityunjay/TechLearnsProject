import React, { useState, useEffect } from 'react';
import { CKEditor } from '@ckeditor/ckeditor5-react';
import ClassicEditor from '@ckeditor/ckeditor5-build-classic';
import { FaPlus, FaTrash, FaVideo, FaFile, FaListUl } from 'react-icons/fa';

const CourseForm = ({ course = null, onSubmit, onCancel, onAddContent, onVideoUpload }) => {
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        category: '',
        courseFor: 'undergraduate', // Add this line with default
        isPremium: false,
        price: 0,
        thumbnail: '',
        objectives: [''],
        content: []
    });

    const [uploadProgress, setUploadProgress] = useState(0);
    const [uploading, setUploading] = useState(false);
    const [activeSection, setActiveSection] = useState('basic');
    const [contentType, setContentType] = useState('lesson');
    const [contentData, setContentData] = useState({
        title: '',
        description: '',
        videoUrl: '',
        duration: '',
        textContent: '',
        attachments: []
    });
    const [error, setError] = useState('');

    useEffect(() => {
        if (course) {
            setFormData({
                title: course.title || '',
                description: course.description || '',
                category: course.category || '',
                courseFor: course.courseFor || 'both', // Add this line
                isPremium: course.isPremium || false,
                price: course.price || 0,
                thumbnail: course.thumbnail || '',
                objectives: course.objectives?.length > 0 ? course.objectives : [''],
                content: course.content || []
            });
        }
    }, [course]);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData({
            ...formData,
            [name]: type === 'checkbox' ? checked : value
        });
    };

    const handleContentChange = (e) => {
        const { name, value } = e.target;
        setContentData({
            ...contentData,
            [name]: value
        });
    };

    const handleObjectiveChange = (value, index) => {
        const updatedObjectives = [...formData.objectives];
        updatedObjectives[index] = value;
        setFormData({
            ...formData,
            objectives: updatedObjectives
        });
    };

    const handleAddObjective = () => {
        setFormData({
            ...formData,
            objectives: [...formData.objectives, '']
        });
    };

    const handleRemoveObjective = (index) => {
        const updatedObjectives = [...formData.objectives];
        updatedObjectives.splice(index, 1);

        if (updatedObjectives.length === 0) {
            updatedObjectives.push('');
        }

        setFormData({
            ...formData,
            objectives: updatedObjectives
        });
    };

    const handleThumbnailUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        if (file.size > 5 * 1024 * 1024) {
            setError('Thumbnail size must be less than 5MB');
            return;
        }

        const formDataImg = new FormData();
        formDataImg.append('file', file); // Changed from 'image' to 'file' to match backend

        try {
            setUploading(true);
            const token = localStorage.getItem('token');
            const response = await fetch(`${import.meta.env.VITE_API_URL || "http://localhost:3000"}/api/upload`, {
                method: 'POST',
                headers: {
                    Authorization: `Bearer ${token}`
                },
                body: formDataImg
            });

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(errorText || 'Error uploading thumbnail');
            }

            const data = await response.json();
            setFormData({
                ...formData,
                thumbnail: data.fileUrl // Changed from imageUrl to fileUrl
            });
        } catch (error) {
            console.error('Error uploading thumbnail:', error);
            setError('Failed to upload thumbnail. Please try again.');
        } finally {
            setUploading(false);
        }
    };

    const handleVideoUploadForContent = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        if (file.size > 500 * 1024 * 1024) { // 500MB limit for videos
            setError('Video size must be less than 500MB');
            return;
        }

        try {
            setUploading(true);
            const videoUrl = await onVideoUpload(file, (progress) => {
                setUploadProgress(progress);
            });

            setContentData({
                ...contentData,
                videoUrl
            });
        } catch (error) {
            console.error('Error uploading video:', error);
            setError('Failed to upload video. Please try again.');
        } finally {
            setUploading(false);
            setUploadProgress(0);
        }
    };

    const handleAttachmentUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        if (file.size > 10 * 1024 * 1024) { // 10MB limit for attachments
            setError('File size must be less than 10MB');
            return;
        }

        const formDataFile = new FormData();
        formDataFile.append('file', file);

        try {
            setUploading(true);
            const token = localStorage.getItem('token');
            const response = await fetch(`${import.meta.env.VITE_API_URL || "http://localhost:3000"}/api/upload`, {
                method: 'POST',
                headers: {
                    Authorization: `Bearer ${token}`
                },
                body: formDataFile
            });

            const data = await response.json();
            if (!response.ok) {
                throw new Error(data.message || 'Error uploading file');
            }

            const fileUrl = data.fileUrl || data.url;
            const fileName = file.name;

            setContentData({
                ...contentData,
                attachments: [
                    ...contentData.attachments,
                    { name: fileName, url: fileUrl }
                ]
            });
        } catch (error) {
            console.error('Error uploading file:', error);
            setError('Failed to upload file. Please try again.');
        } finally {
            setUploading(false);
        }
    };

    const handleAddContentItem = () => {
        if (!contentData.title.trim()) {
            setError('Content title is required');
            return;
        }

        // For video type, ensure there's a video URL
        if (contentType === 'video' && !contentData.videoUrl) {
            setError('Please upload a video');
            return;
        }

        // For lesson type, ensure there's text content
        if (contentType === 'lesson' && !contentData.textContent.trim()) {
            setError('Lesson content cannot be empty');
            return;
        }

        const newContent = {
            ...contentData,
            type: contentType,
            _id: Date.now().toString() // Temporary ID for frontend
        };

        if (course && onAddContent) {
            // Add content to existing course
            onAddContent(newContent);
        } else {
            // Add content to new course being created
            setFormData({
                ...formData,
                content: [...formData.content, newContent]
            });
        }

        // Reset content form
        setContentData({
            title: '',
            description: '',
            videoUrl: '',
            duration: '',
            textContent: '',
            attachments: []
        });
        setError('');
    };

    const handleRemoveContent = (index) => {
        const updatedContent = [...formData.content];
        updatedContent.splice(index, 1);
        setFormData({
            ...formData,
            content: updatedContent
        });
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        // Validate form
        if (!formData.title.trim()) {
            setError('Course title is required');
            setActiveSection('basic');
            return;
        }

        if (!formData.description.trim()) {
            setError('Course description is required');
            setActiveSection('basic');
            return;
        }

        if (!formData.category.trim()) {
            setError('Course category is required');
            setActiveSection('basic');
            return;
        }

        if (formData.isPremium && (!formData.price || formData.price <= 0)) {
            setError('Price must be greater than 0 for premium courses');
            setActiveSection('basic');
            return;
        }

        // Filter out empty objectives
        const filteredObjectives = formData.objectives.filter(obj => obj.trim() !== '');

        if (filteredObjectives.length === 0) {
            setError('Please add at least one learning objective');
            setActiveSection('objectives');
            return;
        }

        if (formData.content.length === 0) {
            setError('Please add at least one content item (lesson, video, or quiz)');
            setActiveSection('content');
            return;
        }

        // Submit form data
        onSubmit({
            ...formData,
            objectives: filteredObjectives,
            price: formData.isPremium ? Number(formData.price) : 0
        });
    };

    return (
        <div className="bg-white shadow rounded-lg overflow-hidden">
            <div className="bg-gradient-to-r from-indigo-600 to-purple-600 px-6 py-4">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                    <h2 className="text-2xl font-bold text-white">
                        {course ? 'Edit Course' : 'Create New Course'}
                    </h2>
                    <button
                        onClick={onCancel}
                        className="mt-4 md:mt-0 px-4 py-2 bg-white text-indigo-600 rounded-md hover:bg-gray-100 transition-colors"
                    >
                        Cancel
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
                <div className="flex border-b border-gray-200 mb-6">
                    <button
                        className={`px-4 py-2 font-medium ${activeSection === 'basic'
                            ? 'text-indigo-600 border-b-2 border-indigo-600'
                            : 'text-gray-500 hover:text-indigo-600'
                            }`}
                        onClick={() => setActiveSection('basic')}
                    >
                        Basic Information
                    </button>
                    <button
                        className={`px-4 py-2 font-medium ${activeSection === 'objectives'
                            ? 'text-indigo-600 border-b-2 border-indigo-600'
                            : 'text-gray-500 hover:text-indigo-600'
                            }`}
                        onClick={() => setActiveSection('objectives')}
                    >
                        Learning Objectives
                    </button>
                    <button
                        className={`px-4 py-2 font-medium ${activeSection === 'content'
                            ? 'text-indigo-600 border-b-2 border-indigo-600'
                            : 'text-gray-500 hover:text-indigo-600'
                            }`}
                        onClick={() => setActiveSection('content')}
                    >
                        Course Content
                    </button>
                </div>

                <form onSubmit={handleSubmit}>
                    {/* Basic Information Section */}
                    {activeSection === 'basic' && (
                        <div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="col-span-2">
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Course Title
                                    </label>
                                    <input
                                        type="text"
                                        name="title"
                                        value={formData.title}
                                        onChange={handleChange}
                                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                        placeholder="e.g., Complete Python Programming"
                                    />
                                </div>

                                <div className="col-span-2">
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Course Description
                                    </label>
                                    <textarea
                                        name="description"
                                        value={formData.description}
                                        onChange={handleChange}
                                        rows={4}
                                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                        placeholder="Provide a detailed description of your course..."
                                    ></textarea>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Category
                                    </label>
                                    <select
                                        name="category"
                                        value={formData.category}
                                        onChange={handleChange}
                                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                    >
                                        <option value="">Select Category</option>
                                        <option value="Programming">Programming</option>
                                        <option value="Web Development">Web Development</option>
                                        <option value="Mobile Development">Mobile Development</option>
                                        <option value="Data Science">Data Science</option>
                                        <option value="Machine Learning">Machine Learning</option>
                                        <option value="DevOps">DevOps</option>
                                        <option value="Cloud Computing">Cloud Computing</option>
                                        <option value="Cybersecurity">Cybersecurity</option>
                                        <option value="Blockchain">Blockchain</option>
                                        <option value="Game Development">Game Development</option>
                                        <option value="Other">Other</option>
                                    </select>
                                </div>


                                <div>
                                    <div className="flex items-center mt-5">
                                        <input
                                            type="checkbox"
                                            id="isPremium"
                                            name="isPremium"
                                            checked={formData.isPremium}
                                            onChange={handleChange}
                                            className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                                        />
                                        <label htmlFor="isPremium" className="ml-2 block text-sm text-gray-700">
                                            Premium Course
                                        </label>
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Target Audience
                                    </label>
                                    <div className="mt-2 space-y-2">
                                        <div className="flex items-center">
                                            <input
                                                id="elementary"
                                                name="courseFor"
                                                type="radio"
                                                value="elementary"
                                                checked={formData.courseFor === 'elementary'}
                                                onChange={handleChange}
                                                className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300"
                                            />
                                            <label htmlFor="elementary" className="ml-2 block text-sm text-gray-700">
                                                Elementary School
                                            </label>
                                        </div>
                                        <div className="flex items-center">
                                            <input
                                                id="undergraduate"
                                                name="courseFor"
                                                type="radio"
                                                value="undergraduate"
                                                checked={formData.courseFor === 'undergraduate'}
                                                onChange={handleChange}
                                                className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300"
                                            />
                                            <label htmlFor="undergraduate" className="ml-2 block text-sm text-gray-700">
                                                Under Graduates
                                            </label>
                                        </div>
                                        <div className="flex items-center">
                                            <input
                                                id="both"
                                                name="courseFor"
                                                type="radio"
                                                value="both"
                                                checked={formData.courseFor === 'both'}
                                                onChange={handleChange}
                                                className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300"
                                            />
                                            <label htmlFor="both" className="ml-2 block text-sm text-gray-700">
                                                Both
                                            </label>
                                        </div>
                                    </div>
                                </div>

                                {formData.isPremium && (
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Price (₹)
                                        </label>
                                        <input
                                            type="number"
                                            name="price"
                                            value={formData.price}
                                            onChange={handleChange}
                                            min="0"
                                            step="0.01"
                                            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                        />
                                    </div>
                                )}

                                <div className="col-span-2">
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Course Thumbnail
                                    </label>
                                    <div className="mt-1 flex items-center">
                                        {formData.thumbnail ? (
                                            <div className="relative">
                                                <img
                                                    src={formData.thumbnail}
                                                    alt="Course thumbnail"
                                                    className="w-32 h-32 object-cover rounded-md"
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() => setFormData({ ...formData, thumbnail: '' })}
                                                    className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 focus:outline-none"
                                                >
                                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                                    </svg>
                                                </button>
                                            </div>
                                        ) : (
                                            <label className="cursor-pointer inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
                                                <svg className="h-5 w-5 mr-2 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                                </svg>
                                                Upload Thumbnail
                                                <input
                                                    type="file"
                                                    className="hidden"
                                                    onChange={handleThumbnailUpload}
                                                    accept="image/*"
                                                    disabled={uploading}
                                                />
                                            </label>
                                        )}
                                        {uploading && (
                                            <div className="ml-4 flex items-center">
                                                <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-indigo-600 mr-2"></div>
                                                <span className="text-sm text-gray-500">Uploading...</span>
                                            </div>
                                        )}
                                    </div>
                                    <p className="mt-1 text-xs text-gray-500">
                                        Recommended size: 1280x720 pixels (16:9 ratio)
                                    </p>
                                </div>
                            </div>

                            <div className="mt-6 flex justify-end">
                                <button
                                    type="button"
                                    onClick={() => setActiveSection('objectives')}
                                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                                >
                                    Next: Learning Objectives
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Learning Objectives Section */}
                    {activeSection === 'objectives' && (
                        <div>
                            <h3 className="text-lg font-medium text-gray-900 mb-4">What students will learn</h3>
                            <p className="text-gray-600 mb-4">
                                List the key learning objectives or outcomes of your course. What skills will students gain?
                            </p>

                            {formData.objectives.map((objective, index) => (
                                <div key={index} className="flex items-center mb-2">
                                    <div className="flex items-center mr-2 text-indigo-600">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                        </svg>
                                    </div>
                                    <input
                                        type="text"
                                        value={objective}
                                        onChange={(e) => handleObjectiveChange(e.target.value, index)}
                                        className="flex-1 border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                        placeholder="e.g., Build responsive websites using HTML, CSS and JavaScript"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => handleRemoveObjective(index)}
                                        className="ml-2 text-red-600 hover:text-red-800 focus:outline-none"
                                        disabled={formData.objectives.length === 1 && !objective}
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                        </svg>
                                    </button>
                                </div>
                            ))}

                            <button
                                type="button"
                                onClick={handleAddObjective}
                                className="inline-flex items-center mt-3 px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                            >
                                <FaPlus className="mr-2" /> Add Objective
                            </button>

                            <div className="mt-8 flex justify-between">
                                <button
                                    type="button"
                                    onClick={() => setActiveSection('basic')}
                                    className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                                >
                                    Back
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setActiveSection('content')}
                                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                                >
                                    Next: Course Content
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Course Content Section */}
                    {activeSection === 'content' && (
                        <div>
                            <h3 className="text-lg font-medium text-gray-900 mb-4">Course Content</h3>

                            {/* Content List */}
                            {formData.content.length > 0 && (
                                <div className="mb-6">
                                    <h4 className="text-md font-medium text-gray-700 mb-3">Added Content</h4>
                                    <div className="border rounded-md overflow-hidden">
                                        {formData.content.map((item, index) => (
                                            <div
                                                key={index}
                                                className={`p-4 ${index % 2 === 0 ? 'bg-gray-50' : 'bg-white'} ${index !== formData.content.length - 1 ? 'border-b' : ''
                                                    }`}
                                            >
                                                <div className="flex items-center justify-between">
                                                    <div className="flex items-center">
                                                        {item.type === 'video' ? (
                                                            <FaVideo className="text-red-600 mr-3" />
                                                        ) : item.type === 'lesson' ? (
                                                            <FaFile className="text-blue-600 mr-3" />
                                                        ) : (
                                                            <FaListUl className="text-green-600 mr-3" />
                                                        )}
                                                        <div>
                                                            <h5 className="text-sm font-medium text-gray-900">{item.title}</h5>
                                                            <p className="text-xs text-gray-500">
                                                                {item.type.charAt(0).toUpperCase() + item.type.slice(1)}
                                                                {item.duration ? ` • ${item.duration}` : ''}
                                                            </p>
                                                        </div>
                                                    </div>
                                                    <button
                                                        type="button"
                                                        onClick={() => handleRemoveContent(index)}
                                                        className="text-red-600 hover:text-red-800 focus:outline-none"
                                                    >
                                                        <FaTrash />
                                                    </button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Add New Content Form */}
                            <div className="bg-gray-50 p-4 rounded-md mb-6">
                                <h4 className="text-md font-medium text-gray-700 mb-3">Add New Content</h4>

                                <div className="flex mb-4 border-b pb-2">
                                    <button
                                        type="button"
                                        onClick={() => setContentType('lesson')}
                                        className={`mr-4 px-3 py-1 rounded-md ${contentType === 'lesson'
                                            ? 'bg-blue-600 text-white'
                                            : 'bg-white text-gray-700 hover:bg-gray-100'
                                            }`}
                                    >
                                        <FaFile className="inline mr-1" /> Lesson
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setContentType('video')}
                                        className={`mr-4 px-3 py-1 rounded-md ${contentType === 'video'
                                            ? 'bg-red-600 text-white'
                                            : 'bg-white text-gray-700 hover:bg-gray-100'
                                            }`}
                                    >
                                        <FaVideo className="inline mr-1" /> Video
                                    </button>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                                    <div className="md:col-span-2">
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Title
                                        </label>
                                        <input
                                            type="text"
                                            name="title"
                                            value={contentData.title}
                                            onChange={handleContentChange}
                                            className="block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                            placeholder={`${contentType === 'video' ? 'Video' : 'Lesson'} title`}
                                        />
                                    </div>

                                    <div className="md:col-span-2">
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Description (optional)
                                        </label>
                                        <textarea
                                            name="description"
                                            value={contentData.description}
                                            onChange={handleContentChange}
                                            rows={2}
                                            className="block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                            placeholder="Short description of this content"
                                        ></textarea>
                                    </div>

                                    {contentType === 'video' && (
                                        <>
                                            <div className="md:col-span-2">
                                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                                    Upload Video
                                                </label>
                                                <div className="mt-1 flex items-center">
                                                    {contentData.videoUrl ? (
                                                        <div className="flex items-center">
                                                            <svg className="h-6 w-6 text-green-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                                            </svg>
                                                            <span className="text-sm text-gray-700">Video uploaded successfully</span>
                                                            <button
                                                                type="button"
                                                                onClick={() => setContentData({ ...contentData, videoUrl: '' })}
                                                                className="ml-4 text-sm text-red-600 hover:text-red-800"
                                                            >
                                                                Remove
                                                            </button>
                                                        </div>
                                                    ) : (
                                                        <label className="cursor-pointer inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
                                                            <FaVideo className="mr-2 text-gray-400" />
                                                            Upload Video
                                                            <input
                                                                type="file"
                                                                className="hidden"
                                                                onChange={handleVideoUploadForContent}
                                                                accept="video/*"
                                                                disabled={uploading}
                                                            />
                                                        </label>
                                                    )}
                                                    {uploading && (
                                                        <div className="ml-4">
                                                            <div className="w-full bg-gray-200 rounded-full h-2.5">
                                                                <div
                                                                    className="bg-blue-600 h-2.5 rounded-full"
                                                                    style={{ width: `${uploadProgress}%` }}
                                                                ></div>
                                                            </div>
                                                            <p className="mt-1 text-xs text-gray-500">{uploadProgress}% uploaded</p>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                                    Duration (optional)
                                                </label>
                                                <input
                                                    type="text"
                                                    name="duration"
                                                    value={contentData.duration}
                                                    onChange={handleContentChange}
                                                    className="block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                                    placeholder="e.g., 15:30"
                                                />
                                            </div>
                                        </>
                                    )}

                                    {contentType === 'lesson' && (
                                        <div className="md:col-span-2">
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                Lesson Content
                                            </label>
                                            <CKEditor
                                                editor={ClassicEditor}
                                                data={contentData.textContent}
                                                onChange={(event, editor) => {
                                                    const data = editor.getData();
                                                    setContentData({
                                                        ...contentData,
                                                        textContent: data
                                                    });
                                                }}
                                                config={{
                                                    toolbar: ['heading', '|', 'bold', 'italic', 'link', 'bulletedList', 'numberedList', '|', 'undo', 'redo']
                                                }}
                                            />
                                        </div>
                                    )}

                                    <div className="md:col-span-2">
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Attachments (optional)
                                        </label>
                                        {contentData.attachments.length > 0 && (
                                            <div className="mb-3">
                                                <ul className="border border-gray-200 rounded-md divide-y divide-gray-200">
                                                    {contentData.attachments.map((attachment, idx) => (
                                                        <li key={idx} className="pl-3 pr-4 py-2 flex items-center justify-between text-sm">
                                                            <div className="w-0 flex-1 flex items-center">
                                                                <svg className="flex-shrink-0 h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                                                    <path fillRule="evenodd" d="M8 4a3 3 0 00-3 3v4a5 5 0 0010 0V7a1 1 0 112 0v4a7 7 0 11-14 0V7a5 5 0 0110 0v4a3 3 0 11-6 0V7a1 1 0 012 0v4a1 1 0 102 0V7a3 3 0 00-3-3z" clipRule="evenodd" />
                                                                </svg>
                                                                <span className="ml-2 flex-1 w-0 truncate">{attachment.name}</span>
                                                            </div>
                                                            <div className="ml-4 flex-shrink-0">
                                                                <button
                                                                    type="button"
                                                                    onClick={() => {
                                                                        const updatedAttachments = [...contentData.attachments];
                                                                        updatedAttachments.splice(idx, 1);
                                                                        setContentData({
                                                                            ...contentData,
                                                                            attachments: updatedAttachments
                                                                        });
                                                                    }}
                                                                    className="text-red-600 hover:text-red-800"
                                                                >
                                                                    Remove
                                                                </button>
                                                            </div>
                                                        </li>
                                                    ))}
                                                </ul>
                                            </div>
                                        )}
                                        <label className="cursor-pointer inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
                                            <svg className="mr-2 h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                                            </svg>
                                            Add Attachment
                                            <input
                                                type="file"
                                                className="hidden"
                                                onChange={handleAttachmentUpload}
                                                disabled={uploading}
                                            />
                                        </label>
                                    </div>
                                </div>

                                <button
                                    type="button"
                                    onClick={handleAddContentItem}
                                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                                >
                                    <FaPlus className="mr-2" /> Add {contentType === 'video' ? 'Video' : 'Lesson'}
                                </button>
                            </div>

                            <div className="mt-8 flex justify-between">
                                <button
                                    type="button"
                                    onClick={() => setActiveSection('objectives')}
                                    className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                                >
                                    Back
                                </button>
                                <button
                                    type="submit"
                                    className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                                >
                                    {course ? 'Update Course' : 'Create Course'}
                                </button>
                            </div>
                        </div>
                    )}
                </form>
            </div>
        </div>
    );
};

export default CourseForm;
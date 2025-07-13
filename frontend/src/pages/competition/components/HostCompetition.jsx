import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext'; // Import auth hook
import {
    FaPlus, FaMinus, FaUpload, FaExternalLinkAlt,
    FaClipboardList, FaCalendarAlt, FaUserCheck,
    FaAward, FaTrash, FaClock, FaFlag, FaCheck, FaArrowRight
} from 'react-icons/fa';
import { motion } from 'framer-motion';

const HostCompetition = () => {
    const { currentUser } = useAuth(); // Use auth context
    const { id } = useParams();
    const navigate = useNavigate();
    const isEditing = !!id;

    // Form states with new fields
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        startDate: '',
        endDate: '',
        category: 'coding',
        difficulty: 'medium',
        maxParticipants: '',
        thumbnail: '',
        competitionType: 'internal',
        // New fields
        eligibilityCriteria: [''],
        evaluationCriteria: [''],
        timeline: [
            { phase: 'Registration', startDate: '', endDate: '' },
            { phase: 'Submission', startDate: '', endDate: '' },
            { phase: 'Evaluation', startDate: '', endDate: '' },
            { phase: 'Results', startDate: '', endDate: '' }
        ],
        // Existing fields
        rules: [''],
        prizes: [{ rank: 1, description: '', value: '' }],
        venue: '',
        organizer: '',
        registrationDeadline: '',
        externalLink: ''
    });

    // UI states
    const [thumbnailFile, setThumbnailFile] = useState(null);
    const [thumbnailPreview, setThumbnailPreview] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [submitSuccess, setSubmitSuccess] = useState(false);
    const [userInfo, setUserInfo] = useState(null);
    const [activeStep, setActiveStep] = useState(1); // For multi-step form
    const [currentTab, setCurrentTab] = useState('basic'); // For tab navigation

    // Get auth header function - improved version
    const getAuthHeader = () => {
        if (currentUser && currentUser.token) {
            return { Authorization: `Bearer ${currentUser.token}` };
        }
        return {};
    };

    // Check auth on mount with better error handling
    useEffect(() => {
        if (!currentUser) {
            setError('You must be logged in to host a competition');
            navigate('/login', { state: { from: '/competitions-host' } });
            return;
        }

        try {
            const parsedInfo = currentUser;
            console.log('- token in parsed userInfo:', !!parsedInfo.token);
            setUserInfo(parsedInfo);

            // If editing, fetch competition data
            if (isEditing) {
                fetchCompetitionData();
            }
        } catch (error) {
            console.error('Error parsing user info:', error);
            navigate('/login', { state: { from: '/competitions-host' } });
        }
    }, [navigate, id, isEditing, currentUser]);

    // Fetch competition data for editing
    const fetchCompetitionData = async () => {
        try {
            setLoading(true);

            const authHeaders = getAuthHeader();
            const response = await fetch(`/api/competitions/${id}`, {
                headers: { ...authHeaders }
            });

            if (!response.ok) {
                throw new Error(`Failed to fetch competition: ${response.status}`);
            }

            const data = await response.json();

            // Check if current user is the competition host
            if (!userInfo ||
                (data.hostModel === 'User' && data.hostedBy._id !== userInfo._id) ||
                (data.hostModel === 'Mentor' && data.hostedBy._id !== userInfo._id) ||
                (data.hostModel === 'School' && data.hostedBy._id !== userInfo._id)) {
                setError('You are not authorized to edit this competition');
                navigate('/competitions');
                return;
            }

            // Format dates for form input
            const formatDate = (dateString) => {
                if (!dateString) return '';
                const date = new Date(dateString);
                return date.toISOString().split('T')[0];
            };

            setFormData({
                title: data.title || '',
                description: data.description || '',
                startDate: formatDate(data.startDate),
                endDate: formatDate(data.endDate),
                category: data.category || 'coding',
                difficulty: data.difficulty || 'medium',
                maxParticipants: data.maxParticipants || '',
                thumbnail: data.thumbnail || '',
                competitionType: data.competitionType || 'internal',

                // Handle new fields with fallbacks
                eligibilityCriteria: data.eligibilityCriteria?.length > 0 ? data.eligibilityCriteria : [''],
                evaluationCriteria: data.evaluationCriteria?.length > 0 ? data.evaluationCriteria : [''],
                timeline: data.timeline?.length > 0 ? data.timeline.map(t => ({
                    ...t,
                    startDate: formatDate(t.startDate),
                    endDate: formatDate(t.endDate)
                })) : [
                    { phase: 'Registration', startDate: '', endDate: '' },
                    { phase: 'Submission', startDate: '', endDate: '' },
                    { phase: 'Evaluation', startDate: '', endDate: '' },
                    { phase: 'Results', startDate: '', endDate: '' }
                ],

                // Existing fields
                rules: data.rules?.length > 0 ? data.rules : [''],
                prizes: data.prizes?.length > 0 ? data.prizes : [{ rank: 1, description: '', value: '' }],
                venue: data.venue || '',
                organizer: data.organizer || '',
                registrationDeadline: formatDate(data.registrationDeadline),
                externalLink: data.externalLink || ''
            });

            // Set thumbnail preview
            if (data.thumbnail) {
                setThumbnailPreview(data.thumbnail);
            }

        } catch (error) {
            console.error('Error fetching competition:', error);
            setError(`Failed to load competition: ${error.message}`);
        } finally {
            setLoading(false);
        }
    };

    // Handle basic input changes
    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    // Handle thumbnail file selection
    const handleThumbnailChange = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        if (file.size > 5 * 1024 * 1024) { // 5MB limit
            setError('Image size must be less than 5MB');
            return;
        }

        setThumbnailFile(file);

        // Create preview
        const reader = new FileReader();
        reader.onloadend = () => {
            setThumbnailPreview(reader.result);
        };
        reader.readAsDataURL(file);
    };

    // ARRAY FIELD HANDLERS

    // Handle eligibility criteria changes
    const handleEligibilityCriteriaChange = (index, value) => {
        const newArray = [...formData.eligibilityCriteria];
        newArray[index] = value;
        setFormData(prev => ({ ...prev, eligibilityCriteria: newArray }));
    };

    const addEligibilityCriteria = () => {
        setFormData(prev => ({
            ...prev,
            eligibilityCriteria: [...prev.eligibilityCriteria, '']
        }));
    };

    const removeEligibilityCriteria = (index) => {
        if (formData.eligibilityCriteria.length > 1) {
            const newArray = [...formData.eligibilityCriteria];
            newArray.splice(index, 1);
            setFormData(prev => ({ ...prev, eligibilityCriteria: newArray }));
        }
    };

    // Handle evaluation criteria changes
    const handleEvaluationCriteriaChange = (index, value) => {
        const newArray = [...formData.evaluationCriteria];
        newArray[index] = value;
        setFormData(prev => ({ ...prev, evaluationCriteria: newArray }));
    };

    const addEvaluationCriteria = () => {
        setFormData(prev => ({
            ...prev,
            evaluationCriteria: [...prev.evaluationCriteria, '']
        }));
    };

    const removeEvaluationCriteria = (index) => {
        if (formData.evaluationCriteria.length > 1) {
            const newArray = [...formData.evaluationCriteria];
            newArray.splice(index, 1);
            setFormData(prev => ({ ...prev, evaluationCriteria: newArray }));
        }
    };

    // Handle timeline changes
    const handleTimelineChange = (index, field, value) => {
        const newTimeline = [...formData.timeline];
        newTimeline[index] = { ...newTimeline[index], [field]: value };
        setFormData(prev => ({ ...prev, timeline: newTimeline }));
    };

    const addTimelinePhase = () => {
        setFormData(prev => ({
            ...prev,
            timeline: [...prev.timeline, { phase: '', startDate: '', endDate: '' }]
        }));
    };

    const removeTimelinePhase = (index) => {
        if (formData.timeline.length > 1) {
            const newTimeline = [...formData.timeline];
            newTimeline.splice(index, 1);
            setFormData(prev => ({ ...prev, timeline: newTimeline }));
        }
    };

    // Handle rules array changes
    const handleRuleChange = (index, value) => {
        const newRules = [...formData.rules];
        newRules[index] = value;
        setFormData(prev => ({ ...prev, rules: newRules }));
    };

    const addRule = () => {
        setFormData(prev => ({
            ...prev,
            rules: [...prev.rules, '']
        }));
    };

    const removeRule = (index) => {
        if (formData.rules.length > 1) {
            const newRules = [...formData.rules];
            newRules.splice(index, 1);
            setFormData(prev => ({ ...prev, rules: newRules }));
        }
    };

    // Handle prizes array changes
    const handlePrizeChange = (index, field, value) => {
        const newPrizes = [...formData.prizes];
        newPrizes[index] = { ...newPrizes[index], [field]: value };
        setFormData(prev => ({ ...prev, prizes: newPrizes }));
    };

    const addPrize = () => {
        const newRank = formData.prizes.length + 1;
        setFormData(prev => ({
            ...prev,
            prizes: [...prev.prizes, { rank: newRank, description: '', value: '' }]
        }));
    };

    const removePrize = (index) => {
        if (formData.prizes.length > 1) {
            const newPrizes = [...formData.prizes].filter((_, i) => i !== index);
            // Update ranks after removal
            const updatedPrizes = newPrizes.map((prize, i) => ({
                ...prize,
                rank: i + 1
            }));
            setFormData(prev => ({ ...prev, prizes: updatedPrizes }));
        }
    };

    // Form validation - updated with new fields
    const validateForm = () => {
        // Basic required fields validation
        if (!formData.title.trim()) return "Title is required";
        if (!formData.description.trim()) return "Description is required";
        if (!formData.startDate) return "Start date is required";
        if (!formData.endDate) return "End date is required";
        if (!formData.category.trim()) return "Category is required";

        // Date validation
        const start = new Date(formData.startDate);
        const end = new Date(formData.endDate);
        if (end <= start) return "End date must be after start date";

        // Validate eligibility and evaluation criteria
        if (formData.eligibilityCriteria.some(item => !item.trim())) {
            return "All eligibility criteria must have content";
        }

        if (formData.evaluationCriteria.some(item => !item.trim())) {
            return "All evaluation criteria must have content";
        }

        // Validate timeline
        for (const phase of formData.timeline) {
            if (!phase.phase.trim()) return "All timeline phases must have names";
            if (!phase.startDate) return `Start date is required for ${phase.phase} phase`;
            if (!phase.endDate) return `End date is required for ${phase.phase} phase`;

            const phaseStart = new Date(phase.startDate);
            const phaseEnd = new Date(phase.endDate);
            if (phaseEnd < phaseStart) {
                return `End date must be after start date for ${phase.phase} phase`;
            }
        }

        // Type-specific validation
        if (formData.competitionType === 'internal') {
            // Validate rules and prizes for internal competitions
            if (formData.rules.some(rule => !rule.trim())) {
                return "All rules must have content";
            }

            if (formData.prizes.some(prize => !prize.description.trim() || !prize.value)) {
                return "All prizes must have description and value";
            }
        } else {
            // Validate fields required for external competitions
            if (!formData.venue.trim()) return "Venue is required for external competitions";
            if (!formData.organizer.trim()) return "Organizer is required for external competitions";
            if (!formData.externalLink.trim()) return "External link is required";

            // Validate URL format
            try {
                new URL(formData.externalLink);
            } catch (_) {
                return "Please enter a valid URL for the external link";
            }
        }

        return null; // No errors
    };

    // Improved error handling for handleSubmit function
    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        // Validate form
        const validationError = validateForm();
        if (validationError) {
            setError(validationError);
            setLoading(false);
            return;
        }

        try {
            let thumbnailUrl = formData.thumbnail;
            const authHeaders = getAuthHeader();

            console.log('Auth headers for request:', authHeaders);

            // If there's a new file to upload
            if (thumbnailFile) {
                const formDataFile = new FormData();
                formDataFile.append('file', thumbnailFile);

                try {
                    const uploadResponse = await fetch('/api/upload', {
                        method: 'POST',
                        headers: {
                            ...authHeaders
                        },
                        body: formDataFile
                    });

                    if (uploadResponse.ok) {
                        const uploadResult = await uploadResponse.json();
                        thumbnailUrl = uploadResult.url;
                    } else {
                        const errorText = await uploadResponse.text();
                        console.error(`Upload API error: Status ${uploadResponse.status}`, errorText);
                        thumbnailUrl = thumbnailPreview; // Use preview as fallback
                    }
                } catch (uploadError) {
                    console.error('Upload error:', uploadError);
                    thumbnailUrl = thumbnailPreview; // Fallback
                }
            }

            // Prepare data to send to API
            const dataToSend = {
                ...formData,
                thumbnail: thumbnailUrl
            };

            // Debug information
            console.log('Sending competition data:', JSON.stringify(dataToSend, null, 2));

            // Make API request
            const url = isEditing ? `/api/competitions/${id}` : '/api/competitions';
            console.log(`Sending ${isEditing ? 'PUT' : 'POST'} request to ${url}`);

            const response = await fetch(url, {
                method: isEditing ? 'PUT' : 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    ...authHeaders
                },
                body: JSON.stringify(dataToSend),
                credentials: 'include'
            });

            // Better error handling
            if (!response.ok) {
                const status = response.status;
                let errorMessage;

                // Try to get detailed error message
                try {
                    const errorData = await response.json();
                    errorMessage = errorData.message || errorData.error || `Server returned ${status}`;
                    console.error('Server error details:', errorData);
                } catch (parseError) {
                    // If response isn't JSON, get text instead
                    const text = await response.text();
                    console.error('Server error response:', text);
                    errorMessage = text || `HTTP error ${status}`;
                }

                throw new Error(errorMessage || `Failed with status: ${status}`);
            }

            const responseData = await response.json();
            console.log('Competition created/updated:', responseData);

            setSubmitSuccess(true);
            setTimeout(() => {
                navigate('/competitions');
            }, 2000);

        } catch (err) {
            console.error('Error submitting competition:', err);
            setError(err.message || 'An error occurred while submitting the competition. Please try again or contact support.');
        } finally {
            setLoading(false);
        }
    };

    // Navigate between tabs
    const handleTabChange = (tab) => {
        setCurrentTab(tab);
    };

    // Loading state display
    if (loading && !formData.title) {
        return (
            <div className="flex justify-center items-center min-h-screen">
                <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-[#f99e1c]"></div>
            </div>
        );
    }

    // Tab headers component
    const TabHeaders = () => {
        const tabs = [
            { id: 'basic', label: 'Basic Info', icon: <FaClipboardList /> },
            { id: 'eligibility', label: 'Eligibility', icon: <FaUserCheck /> },
            { id: 'timeline', label: 'Timeline', icon: <FaCalendarAlt /> },
            { id: 'details', label: 'Details', icon: <FaAward /> }
        ];

        return (
            <div className="mb-8">
                <div className="flex flex-wrap justify-center gap-2 md:gap-4">
                    {tabs.map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => handleTabChange(tab.id)}
                            className={`flex items-center gap-2 px-4 py-3 rounded-lg transition-all duration-200
                                ${currentTab === tab.id
                                    ? 'bg-[#013954] text-white shadow-lg'
                                    : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'}`}
                        >
                            <span>{tab.icon}</span>
                            <span>{tab.label}</span>
                        </button>
                    ))}
                </div>
            </div>
        );
    };

    return (
        <div className="min-h-screen bg-gray-50 py-8 px-4">
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5 }}
                className="container mx-auto"
            >
                <div className="text-center mb-8">
                    <h1 className="text-3xl md:text-4xl font-extrabold text-[#013954]">
                        {isEditing ? 'Edit Your Competition' : 'Host a Competition'}
                    </h1>
                    <p className="mt-2 text-gray-600 max-w-xl mx-auto">
                        {isEditing
                            ? 'Update your competition details and manage settings.'
                            : 'Create a new competition, define the rules, and engage participants.'
                        }
                    </p>
                </div>

                {/* Error and success messages */}
                {error && (
                    <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6 rounded-md">
                        <div className="flex items-center">
                            <div className="flex-shrink-0">
                                <svg className="h-5 w-5 text-red-500" viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                                </svg>
                            </div>
                            <div className="ml-3">
                                <p className="text-red-700 text-sm font-medium">{error}</p>
                            </div>
                        </div>
                    </div>
                )}

                {submitSuccess && (
                    <div className="bg-green-50 border-l-4 border-green-500 p-4 mb-6 rounded-md">
                        <div className="flex items-center">
                            <div className="flex-shrink-0">
                                <svg className="h-5 w-5 text-green-500" viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                </svg>
                            </div>
                            <div className="ml-3">
                                <p className="text-green-700 text-sm font-medium">
                                    Competition {isEditing ? 'updated' : 'created'} successfully! Redirecting...
                                </p>
                            </div>
                        </div>
                    </div>
                )}

                {/* Form with tabs */}
                <form onSubmit={handleSubmit} className="bg-white shadow-xl rounded-2xl overflow-hidden">
                    {/* Competition type selector - always visible */}
                    <div className="bg-gradient-to-r from-[#013954] to-[#02506e] p-6 text-white">
                        <p className="font-medium mb-3">Competition Type</p>
                        <div className="flex gap-6">
                            <label className="flex items-center gap-2 cursor-pointer">
                                <input
                                    type="radio"
                                    name="competitionType"
                                    value="internal"
                                    checked={formData.competitionType === 'internal'}
                                    onChange={handleChange}
                                    className="w-4 h-4 accent-[#f99e1c]"
                                />
                                <span>Host on TechLeaRNS Platform</span>
                            </label>
                            <label className="flex items-center gap-2 cursor-pointer">
                                <input
                                    type="radio"
                                    name="competitionType"
                                    value="external"
                                    checked={formData.competitionType === 'external'}
                                    onChange={handleChange}
                                    className="w-4 h-4 accent-[#f99e1c]"
                                />
                                <span>External Competition</span>
                            </label>
                        </div>
                    </div>

                    {/* Tab navigation */}
                    <div className="border-b border-gray-200 p-4">
                        <TabHeaders />
                    </div>

                    {/* Tab content */}
                    <div className="p-6">

                        {/* BASIC INFO TAB */}
                        {currentTab === 'basic' && (
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ duration: 0.3 }}
                            >
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="col-span-1 md:col-span-2">
                                        <label className="block text-gray-700 font-medium mb-2">Competition Title *</label>
                                        <input
                                            type="text"
                                            name="title"
                                            value={formData.title}
                                            onChange={handleChange}
                                            placeholder="Enter an engaging title"
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#f99e1c] focus:border-transparent"
                                            required
                                        />
                                    </div>

                                    <div className="col-span-1 md:col-span-2">
                                        <label className="block text-gray-700 font-medium mb-2">Description *</label>
                                        <textarea
                                            name="description"
                                            value={formData.description}
                                            onChange={handleChange}
                                            placeholder="Describe what the competition is about"
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#f99e1c] focus:border-transparent h-32 resize-none"
                                            required
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-gray-700 font-medium mb-2">Category *</label>
                                        <select
                                            name="category"
                                            value={formData.category}
                                            onChange={handleChange}
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#f99e1c] focus:border-transparent bg-white"
                                            required
                                        >
                                            <option value="coding">Coding</option>
                                            <option value="design">Design</option>
                                            <option value="business">Business</option>
                                            <option value="gaming">Gaming</option>
                                            <option value="datascience">Data Science</option>
                                            <option value="ai">Artificial Intelligence</option>
                                            <option value="web">Web Development</option>
                                            <option value="mobile">Mobile App Development</option>
                                            <option value="other">Other</option>
                                        </select>
                                    </div>

                                    <div>
                                        <label className="block text-gray-700 font-medium mb-2">Difficulty Level *</label>
                                        <select
                                            name="difficulty"
                                            value={formData.difficulty}
                                            onChange={handleChange}
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#f99e1c] focus:border-transparent bg-white"
                                            required
                                        >
                                            <option value="beginner">Beginner</option>
                                            <option value="easy">Easy</option>
                                            <option value="medium">Medium</option>
                                            <option value="hard">Hard</option>
                                            <option value="expert">Expert</option>
                                        </select>
                                    </div>

                                    <div>
                                        <label className="block text-gray-700 font-medium mb-2">Start Date *</label>
                                        <input
                                            type="date"
                                            name="startDate"
                                            value={formData.startDate}
                                            onChange={handleChange}
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#f99e1c] focus:border-transparent"
                                            required
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-gray-700 font-medium mb-2">End Date *</label>
                                        <input
                                            type="date"
                                            name="endDate"
                                            value={formData.endDate}
                                            onChange={handleChange}
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#f99e1c] focus:border-transparent"
                                            required
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-gray-700 font-medium mb-2">Maximum Participants</label>
                                        <input
                                            type="number"
                                            name="maxParticipants"
                                            value={formData.maxParticipants}
                                            onChange={handleChange}
                                            placeholder="Leave empty for unlimited"
                                            min="1"
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#f99e1c] focus:border-transparent"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-gray-700 font-medium mb-2">Competition Thumbnail</label>
                                        <div className="flex items-center">
                                            <label className="flex items-center justify-center w-full max-w-xs px-4 py-6 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
                                                {thumbnailPreview ? (
                                                    <img
                                                        src={thumbnailPreview}
                                                        alt="Thumbnail preview"
                                                        className="h-28 object-cover"
                                                    />
                                                ) : (
                                                    <div className="text-center">
                                                        <FaUpload className="mx-auto h-10 w-10 text-gray-400" />
                                                        <p className="mt-1 text-sm text-gray-600">Upload Image</p>
                                                        <p className="text-xs text-gray-500">(Max 5MB)</p>
                                                    </div>
                                                )}
                                                <input
                                                    type="file"
                                                    className="hidden"
                                                    onChange={handleThumbnailChange}
                                                    accept="image/*"
                                                />
                                            </label>
                                        </div>
                                    </div>
                                </div>

                                {/* Navigation buttons */}
                                <div className="mt-8 flex justify-end">
                                    <button
                                        type="button"
                                        onClick={() => handleTabChange('eligibility')}
                                        className="bg-[#013954] text-white px-6 py-2 rounded-lg hover:bg-[#024b70] transition-colors flex items-center gap-2"
                                    >
                                        Next: Eligibility <FaArrowRight />
                                    </button>
                                </div>
                            </motion.div>
                        )}

                        {/* ELIGIBILITY CRITERIA TAB */}
                        {currentTab === 'eligibility' && (
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ duration: 0.3 }}
                            >
                                {/* Eligibility Criteria Section */}
                                <div className="mb-8">
                                    <div className="flex justify-between items-center mb-4">
                                        <h2 className="text-xl font-semibold text-[#013954] flex items-center">
                                            <FaUserCheck className="mr-2" />
                                            Eligibility Criteria
                                        </h2>
                                        <button
                                            type="button"
                                            onClick={addEligibilityCriteria}
                                            className="text-[#f99e1c] hover:text-[#e08200] flex items-center gap-1"
                                        >
                                            <FaPlus /> Add Criterion
                                        </button>
                                    </div>

                                    <p className="text-gray-600 mb-4">
                                        Define who can participate in this competition.
                                    </p>

                                    {formData.eligibilityCriteria.map((criterion, index) => (
                                        <div key={index} className="flex items-center mb-3 group">
                                            <div className="bg-blue-50 text-[#013954] rounded-full h-6 w-6 flex items-center justify-center mr-3">
                                                {index + 1}
                                            </div>
                                            <input
                                                type="text"
                                                value={criterion}
                                                onChange={(e) => handleEligibilityCriteriaChange(index, e.target.value)}
                                                placeholder={`Eligibility criterion ${index + 1}`}
                                                className="flex-grow px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#f99e1c] focus:border-transparent"
                                            />
                                            <button
                                                type="button"
                                                onClick={() => removeEligibilityCriteria(index)}
                                                className="ml-2 text-red-500 hover:text-red-700 opacity-0 group-hover:opacity-100 transition-opacity"
                                                disabled={formData.eligibilityCriteria.length <= 1}
                                            >
                                                <FaTrash />
                                            </button>
                                        </div>
                                    ))}
                                </div>

                                {/* Evaluation Criteria Section */}
                                <div className="mb-8">
                                    <div className="flex justify-between items-center mb-4">
                                        <h2 className="text-xl font-semibold text-[#013954] flex items-center">
                                            <FaCheck className="mr-2" />
                                            Evaluation Criteria
                                        </h2>
                                        <button
                                            type="button"
                                            onClick={addEvaluationCriteria}
                                            className="text-[#f99e1c] hover:text-[#e08200] flex items-center gap-1"
                                        >
                                            <FaPlus /> Add Criterion
                                        </button>
                                    </div>

                                    <p className="text-gray-600 mb-4">
                                        Define how submissions will be evaluated.
                                    </p>

                                    {formData.evaluationCriteria.map((criterion, index) => (
                                        <div key={index} className="flex items-center mb-3 group">
                                            <div className="bg-orange-50 text-[#f99e1c] rounded-full h-6 w-6 flex items-center justify-center mr-3">
                                                {index + 1}
                                            </div>
                                            <input
                                                type="text"
                                                value={criterion}
                                                onChange={(e) => handleEvaluationCriteriaChange(index, e.target.value)}
                                                placeholder={`Evaluation criterion ${index + 1}`}
                                                className="flex-grow px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#f99e1c] focus:border-transparent"
                                            />
                                            <button
                                                type="button"
                                                onClick={() => removeEvaluationCriteria(index)}
                                                className="ml-2 text-red-500 hover:text-red-700 opacity-0 group-hover:opacity-100 transition-opacity"
                                                disabled={formData.evaluationCriteria.length <= 1}
                                            >
                                                <FaTrash />
                                            </button>
                                        </div>
                                    ))}
                                </div>

                                {/* Navigation buttons */}
                                <div className="mt-8 flex justify-between">
                                    <button
                                        type="button"
                                        onClick={() => handleTabChange('basic')}
                                        className="border border-gray-300 bg-white text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-2"
                                    >
                                        <FaArrowRight className="rotate-180" /> Previous
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => handleTabChange('timeline')}
                                        className="bg-[#013954] text-white px-6 py-2 rounded-lg hover:bg-[#024b70] transition-colors flex items-center gap-2"
                                    >
                                        Next: Timeline <FaArrowRight />
                                    </button>
                                </div>
                            </motion.div>
                        )}

                        {/* TIMELINE TAB */}
                        {currentTab === 'timeline' && (
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ duration: 0.3 }}
                            >
                                <div className="mb-8">
                                    <div className="flex justify-between items-center mb-4">
                                        <h2 className="text-xl font-semibold text-[#013954] flex items-center">
                                            <FaCalendarAlt className="mr-2" />
                                            Competition Timeline
                                        </h2>
                                        <button
                                            type="button"
                                            onClick={addTimelinePhase}
                                            className="text-[#f99e1c] hover:text-[#e08200] flex items-center gap-1"
                                        >
                                            <FaPlus /> Add Phase
                                        </button>
                                    </div>

                                    <p className="text-gray-600 mb-4">
                                        Define the key dates and phases of your competition.
                                    </p>
                                </div>

                                {/* Timeline visualization */}
                                <div className="mb-8 relative">
                                    <div className="absolute left-4 top-8 bottom-10 w-0.5 bg-gradient-to-b from-[#013954] to-[#f99e1c]"></div>

                                    {formData.timeline.map((phase, index) => (
                                        <div key={index} className="relative pl-12 pb-8 group">
                                            {/* Timeline marker */}
                                            <div className={`absolute left-2 w-6 h-6 transform -translate-x-1/2 rounded-full border-4 ${index === 0 ? 'border-[#013954] bg-white' :
                                                index === formData.timeline.length - 1 ? 'border-[#f99e1c] bg-white' :
                                                    'border-gray-300 bg-white'
                                                }`}></div>

                                            {/* Timeline content */}
                                            <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm hover:shadow-md transition-shadow">
                                                <div className="flex flex-col md:flex-row gap-4">
                                                    <div className="md:w-1/3">
                                                        <label className="block text-gray-700 font-medium mb-1">Phase Name</label>
                                                        <input
                                                            type="text"
                                                            value={phase.phase}
                                                            onChange={(e) => handleTimelineChange(index, 'phase', e.target.value)}
                                                            placeholder="e.g., Registration"
                                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#f99e1c] focus:border-transparent"
                                                        />
                                                    </div>
                                                    <div className="md:w-1/3">
                                                        <label className="block text-gray-700 font-medium mb-1">Start Date</label>
                                                        <input
                                                            type="date"
                                                            value={phase.startDate}
                                                            onChange={(e) => handleTimelineChange(index, 'startDate', e.target.value)}
                                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#f99e1c] focus:border-transparent"
                                                        />
                                                    </div>
                                                    <div className="md:w-1/3">
                                                        <label className="block text-gray-700 font-medium mb-1">End Date</label>
                                                        <div className="flex items-center">
                                                            <input
                                                                type="date"
                                                                value={phase.endDate}
                                                                onChange={(e) => handleTimelineChange(index, 'endDate', e.target.value)}
                                                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#f99e1c] focus:border-transparent"
                                                            />
                                                            <button
                                                                type="button"
                                                                onClick={() => removeTimelinePhase(index)}
                                                                className="ml-2 text-red-500 hover:text-red-700 opacity-0 group-hover:opacity-100 transition-opacity"
                                                                disabled={formData.timeline.length <= 1}
                                                            >
                                                                <FaTrash />
                                                            </button>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                {/* Navigation buttons */}
                                <div className="mt-8 flex justify-between">
                                    <button
                                        type="button"
                                        onClick={() => handleTabChange('eligibility')}
                                        className="border border-gray-300 bg-white text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-2"
                                    >
                                        <FaArrowRight className="rotate-180" /> Previous
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => handleTabChange('details')}
                                        className="bg-[#013954] text-white px-6 py-2 rounded-lg hover:bg-[#024b70] transition-colors flex items-center gap-2"
                                    >
                                        Next: Details <FaArrowRight />
                                    </button>
                                </div>
                            </motion.div>
                        )}

                        {/* DETAILS TAB */}
                        {currentTab === 'details' && (
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ duration: 0.3 }}
                            >
                                {formData.competitionType === 'internal' ? (
                                    <>
                                        {/* Rules Section */}
                                        <div className="mb-8">
                                            <div className="flex justify-between items-center mb-4">
                                                <h2 className="text-xl font-semibold text-[#013954] flex items-center">
                                                    <FaClipboardList className="mr-2" />
                                                    Competition Rules
                                                </h2>
                                                <button
                                                    type="button"
                                                    onClick={addRule}
                                                    className="text-[#f99e1c] hover:text-[#e08200] flex items-center gap-1"
                                                >
                                                    <FaPlus /> Add Rule
                                                </button>
                                            </div>

                                            <p className="text-gray-600 mb-4">
                                                Define the rules participants must follow.
                                            </p>

                                            {formData.rules.map((rule, index) => (
                                                <div key={index} className="flex items-center mb-3 group">
                                                    <div className="bg-gray-100 text-gray-700 rounded-full h-6 w-6 flex items-center justify-center mr-3">
                                                        {index + 1}
                                                    </div>
                                                    <input
                                                        type="text"
                                                        value={rule}
                                                        onChange={(e) => handleRuleChange(index, e.target.value)}
                                                        placeholder={`Rule ${index + 1}`}
                                                        className="flex-grow px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#f99e1c] focus:border-transparent"
                                                    />
                                                    <button
                                                        type="button"
                                                        onClick={() => removeRule(index)}
                                                        className="ml-2 text-red-500 hover:text-red-700 opacity-0 group-hover:opacity-100 transition-opacity"
                                                        disabled={formData.rules.length <= 1}
                                                    >
                                                        <FaTrash />
                                                    </button>
                                                </div>
                                            ))}
                                        </div>

                                        {/* Prizes Section */}
                                        <div className="mb-8">
                                            <div className="flex justify-between items-center mb-4">
                                                <h2 className="text-xl font-semibold text-[#013954] flex items-center">
                                                    <FaAward className="mr-2" />
                                                    Prizes
                                                </h2>
                                                <button
                                                    type="button"
                                                    onClick={addPrize}
                                                    className="text-[#f99e1c] hover:text-[#e08200] flex items-center gap-1"
                                                >
                                                    <FaPlus /> Add Prize
                                                </button>
                                            </div>

                                            <p className="text-gray-600 mb-4">
                                                Define the prizes for winners.
                                            </p>

                                            {formData.prizes.map((prize, index) => (
                                                <div key={index} className="bg-gradient-to-r from-gray-50 to-white p-4 rounded-lg border border-gray-200 mb-4 shadow-sm">
                                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                                        <div>
                                                            <label className="block text-gray-700 font-medium mb-1">Rank</label>
                                                            <div className="bg-white border border-gray-300 rounded-lg px-4 py-2 text-center font-bold text-[#013954]">
                                                                {index === 0 ? '🥇 1st' : index === 1 ? '🥈 2nd' : index === 2 ? '🥉 3rd' : `${prize.rank}th`}
                                                            </div>
                                                        </div>
                                                        <div>
                                                            <label className="block text-gray-700 font-medium mb-1">Description</label>
                                                            <input
                                                                type="text"
                                                                value={prize.description}
                                                                onChange={(e) => handlePrizeChange(index, 'description', e.target.value)}
                                                                placeholder="e.g., Cash Prize"
                                                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#f99e1c] focus:border-transparent"
                                                            />
                                                        </div>
                                                        <div>
                                                            <label className="block text-gray-700 font-medium mb-1">Value (₹)</label>
                                                            <div className="flex items-center">
                                                                <input
                                                                    type="number"
                                                                    value={prize.value}
                                                                    onChange={(e) => handlePrizeChange(index, 'value', e.target.value)}
                                                                    placeholder="e.g., 10000"
                                                                    min="0"
                                                                    className="flex-grow px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#f99e1c] focus:border-transparent"
                                                                />
                                                                {index > 0 && (
                                                                    <button
                                                                        type="button"
                                                                        onClick={() => removePrize(index)}
                                                                        className="ml-2 text-red-500 hover:text-red-700"
                                                                    >
                                                                        <FaTrash />
                                                                    </button>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </>
                                ) : (
                                    <>
                                        {/* External Competition Details */}
                                        <div className="mb-8">
                                            <h2 className="text-xl font-semibold text-[#013954] mb-4 flex items-center">
                                                <FaExternalLinkAlt className="mr-2" />
                                                External Competition Details
                                            </h2>

                                            <p className="text-gray-600 mb-6">
                                                Provide information about the external event.
                                            </p>

                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                <div>
                                                    <label className="block text-gray-700 font-medium mb-2">Venue *</label>
                                                    <input
                                                        type="text"
                                                        name="venue"
                                                        value={formData.venue}
                                                        onChange={handleChange}
                                                        placeholder="e.g., IIT Delhi Campus"
                                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#f99e1c] focus:border-transparent"
                                                        required={formData.competitionType === 'external'}
                                                    />
                                                </div>

                                                <div>
                                                    <label className="block text-gray-700 font-medium mb-2">Organizer *</label>
                                                    <input
                                                        type="text"
                                                        name="organizer"
                                                        value={formData.organizer}
                                                        onChange={handleChange}
                                                        placeholder="e.g., IEEE Student Branch"
                                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#f99e1c] focus:border-transparent"
                                                        required={formData.competitionType === 'external'}
                                                    />
                                                </div>

                                                <div>
                                                    <label className="block text-gray-700 font-medium mb-2">Registration Deadline</label>
                                                    <input
                                                        type="date"
                                                        name="registrationDeadline"
                                                        value={formData.registrationDeadline}
                                                        onChange={handleChange}
                                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#f99e1c] focus:border-transparent"
                                                    />
                                                </div>

                                                <div>
                                                    <label className="block text-gray-700 font-medium mb-2">External Registration Link *</label>
                                                    <input
                                                        type="url"
                                                        name="externalLink"
                                                        value={formData.externalLink}
                                                        onChange={handleChange}
                                                        placeholder="https://example.com/register"
                                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#f99e1c] focus:border-transparent"
                                                        required={formData.competitionType === 'external'}
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    </>
                                )}

                                {/* Navigation and submit buttons */}
                                <div className="mt-12 flex justify-between">
                                    <button
                                        type="button"
                                        onClick={() => handleTabChange('timeline')}
                                        className="border border-gray-300 bg-white text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-2"
                                    >
                                        <FaArrowRight className="rotate-180" /> Previous
                                    </button>

                                    <button
                                        type="submit"
                                        className={`px-8 py-3 bg-gradient-to-r from-[#013954] to-[#025d82] text-white font-medium rounded-lg shadow-lg hover:shadow-xl transition-all flex items-center gap-2 ${loading ? 'opacity-70 cursor-not-allowed' : ''}`}
                                        disabled={loading}
                                    >
                                        {loading ? (
                                            <>
                                                <div className="h-5 w-5 border-t-2 border-b-2 border-white rounded-full animate-spin"></div>
                                                <span>Processing...</span>
                                            </>
                                        ) : (
                                            <>
                                                <FaFlag />
                                                <span>{isEditing ? 'Update Competition' : 'Launch Competition'}</span>
                                            </>
                                        )}
                                    </button>
                                </div>
                            </motion.div>
                        )}
                    </div>
                </form>
            </motion.div>
        </div>
    );
};

export default HostCompetition;
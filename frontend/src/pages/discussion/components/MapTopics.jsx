import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    FaSearch, FaUsers, FaComments, FaClock, FaTimes, FaFilter,
    FaThumbsUp, FaReply, FaShare, FaBookmark, FaEllipsisH, FaChevronDown
} from 'react-icons/fa';
import { useAuth } from '../../../context/AuthContext';

const TopicsGrid = () => {
    // State management
    const [topics, setTopics] = useState([]);
    const [filteredTopics, setFilteredTopics] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('all');
    const [showModal, setShowModal] = useState(false);
    const [currentTopic, setCurrentTopic] = useState(null);
    const [replyText, setReplyText] = useState('');
    const [replyLoading, setReplyLoading] = useState(false);
    const [showFilters, setShowFilters] = useState(false);
    const [likedTopics, setLikedTopics] = useState(new Set());
    const [savedTopics, setSavedTopics] = useState(new Set());
    const [userCache, setUserCache] = useState({});
    // Add these new states for reply functionality
    const [replyToQuestion, setReplyToQuestion] = useState(null);
    const [answerText, setAnswerText] = useState('');
    const [answerLoading, setAnswerLoading] = useState(false);
    const [userFetchQueue] = useState(new Set());
    // Add this new state for liked responses
    const [likedResponses, setLikedResponses] = useState(new Set());

    const { currentUser } = useAuth();

    // Categories for filter
    const categories = [
        { id: 'all', name: 'All Categories' },
        { id: 'programming', name: 'Programming' },
        { id: 'webdev', name: 'Web Development' },
        { id: 'mobile', name: 'Mobile Development' },
        { id: 'ai', name: 'AI & Machine Learning' },
        { id: 'datascience', name: 'Data Science' },
        { id: 'devops', name: 'DevOps' },
        { id: 'cloud', name: 'Cloud Computing' },
        { id: 'cybersecurity', name: 'Cybersecurity' },
        { id: 'other', name: 'Other' }
    ];

    // Fetch topics from API
    useEffect(() => {
        const fetchTopics = async () => {
            try {
                setLoading(true);
                const response = await fetch('/api/topics?includeDiscussions=true');

                if (!response.ok) {
                    throw new Error(`HTTP error! Status: ${response.status}`);
                }

                const data = await response.json();

                // Sort topics by creation date (newest first)
                const sortedTopics = data.sort((a, b) =>
                    new Date(b.createdAt) - new Date(a.createdAt)
                );

                setTopics(sortedTopics);
                setFilteredTopics(sortedTopics);
            } catch (err) {
                console.error('Error fetching topics:', err);
                setError('Failed to load topics. Please try again later.');
            } finally {
                setLoading(false);
            }
        };

        fetchTopics();
    }, []);

    // Enhanced user data fetch
    useEffect(() => {
        // Only run this effect when we have a currentTopic with discussions
        if (!currentTopic || !currentTopic.discussions) return;

        // Create a function to fetch user details
        const fetchUserDetails = async () => {
            try {
                // Create a deep copy of the current topic
                const topicWithDetails = { ...currentTopic };
                let hasUpdates = false;

                // Add user details to each discussion
                if (topicWithDetails.discussions && topicWithDetails.discussions.length > 0) {
                    for (let i = 0; i < topicWithDetails.discussions.length; i++) {
                        const discussion = topicWithDetails.discussions[i];

                        // Skip if we already have details or no askedBy
                        if (!discussion.question || discussion.question.askedByDetails || !discussion.question.askedBy) {
                            continue;
                        }

                        // Get the user ID (handle both string ID and object cases)
                        let userId;
                        if (typeof discussion.question.askedBy === 'string') {
                            userId = discussion.question.askedBy;
                        } else if (discussion.question.askedBy._id) {
                            userId = discussion.question.askedBy._id;
                        } else if (discussion.question.askedBy.id) {
                            userId = discussion.question.askedBy.id;
                        }

                        // Skip if we couldn't get a valid ID
                        if (!userId || userId === '[object Object]') {
                            // Use model name if available as a fallback
                            if (discussion.question.askerModel) {
                                topicWithDetails.discussions[i].question.askedByDetails = {
                                    name: discussion.question.askerModel === 'User' ? 'Forum User' : 'Mentor'
                                };
                                hasUpdates = true;
                            } else {
                                // Ultimate fallback
                                topicWithDetails.discussions[i].question.askedByDetails = {
                                    name: 'Forum User'
                                };
                                hasUpdates = true;
                            }
                            continue;
                        }

                        // Check cache first to avoid unnecessary API calls
                        if (userCache[userId]) {
                            topicWithDetails.discussions[i].question.askedByDetails = userCache[userId];
                            hasUpdates = true;
                            continue;
                        }

                        // If we can't fetch, just use a placeholder
                        topicWithDetails.discussions[i].question.askedByDetails = {
                            name: 'Forum User'  // Better fallback than showing User ID
                        };
                        hasUpdates = true;
                    }
                }

                // Only update if we actually made changes
                if (hasUpdates) {
                    setCurrentTopic(topicWithDetails);
                }
            } catch (err) {
                console.error('Error updating user details:', err);
            }
        };

        fetchUserDetails();
    }, [currentTopic?._id, userCache]);

    // Filter and search topics whenever dependencies change
    useEffect(() => {
        let results = [...topics];

        // Filter by category if not 'all'
        if (selectedCategory !== 'all') {
            results = results.filter(topic => topic.category === selectedCategory);
        }

        // Filter by search query
        if (searchQuery.trim()) {
            const query = searchQuery.toLowerCase();
            results = results.filter(topic =>
                topic.title.toLowerCase().includes(query) ||
                topic.description.toLowerCase().includes(query) ||
                (topic.tags && topic.tags.some(tag => tag.toLowerCase().includes(query)))
            );
        }

        setFilteredTopics(results);
    }, [searchQuery, selectedCategory, topics]);

    // Update the handleTopicClick function - remove the problematic API call
    const handleTopicClick = async (topicId) => {
        try {
            setLoading(true);
            const token = localStorage.getItem('token');

            // Fetch the complete topic with all details
            const response = await fetch(`/api/topics/${topicId}`, {
                headers: token ? {
                    'Authorization': `Bearer ${token}`
                } : {}
            });

            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }

            const topicData = await response.json();
            setCurrentTopic(topicData);

            // Remove the problematic API call that was here
            // We'll manage likes client-side instead
            setShowModal(true);
        } catch (err) {
            console.error('Error fetching topic details:', err);
            setError('Failed to load topic details. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    // Improved getUserNameFromId function
    const getUserNameFromId = (userId) => {
        if (!userId) return 'Anonymous';

        // If it's not a string, it might be an object - extract the name
        if (typeof userId !== 'string') {
            if (userId.name) return userId.name;
            if (userId.firstName) return `${userId.firstName} ${userId.lastName || ''}`.trim();
            return 'Anonymous';
        }

        // Check if we have cached user data
        const cachedUser = userCache[userId];
        if (cachedUser) {
            return cachedUser.name ||
                (cachedUser.firstName && `${cachedUser.firstName} ${cachedUser.lastName || ''}`.trim()) ||
                'Forum User';  // Better fallback than showing User ID
        }

        // Try to fetch the user data now if we don't have it cached
        if (!userFetchQueue.has(userId)) {
            userFetchQueue.add(userId);
            const token = localStorage.getItem('token');

            fetch(`/api/users/${userId}`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            })
                .then(response => {
                    if (response.ok) return response.json();
                    throw new Error('Failed to fetch user data');
                })
                .then(userData => {
                    setUserCache(prev => ({
                        ...prev,
                        [userId]: userData
                    }));
                })
                .catch(err => {
                    console.error('Error fetching user:', err);
                })
                .finally(() => {
                    userFetchQueue.delete(userId);
                });
        }

        return 'Forum User';  // Better default while loading
    };

    // Update handleReplySubmit for the main reply form
    const handleReplySubmit = async (e) => {
        e.preventDefault();
        if (!replyText.trim()) return;

        try {
            setReplyLoading(true);
            const token = localStorage.getItem('token');

            const response = await fetch(`/api/topics/${currentTopic._id}/questions`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    content: replyText
                })
            });

            if (!response.ok) {
                const data = await response.json();
                throw new Error(data.message || 'Failed to submit reply');
            }

            // Get the response data with the new question ID
            const responseData = await response.json();

            // Optimistically update the UI with the new comment
            const updatedTopic = { ...currentTopic };

            // Create a new discussion entry with the current user's information
            const newDiscussion = {
                _id: responseData._id || `temp-${Date.now()}`,
                question: {
                    content: replyText,
                    askedBy: currentUser._id,
                    askedByDetails: {
                        name: currentUser.name || `${currentUser.firstName || ''} ${currentUser.lastName || ''}`.trim(),
                        firstName: currentUser.firstName,
                        lastName: currentUser.lastName
                    },
                    date: new Date().toISOString(),
                    likes: 0
                },
                answers: []
            };

            // Add to discussions array or create it if it doesn't exist
            if (!updatedTopic.discussions) {
                updatedTopic.discussions = [newDiscussion];
            } else {
                updatedTopic.discussions = [newDiscussion, ...updatedTopic.discussions];
            }

            // Update the current topic
            setCurrentTopic(updatedTopic);

            // Update the user cache with current user info
            setUserCache(prev => ({
                ...prev,
                [currentUser._id]: currentUser
            }));

            // Clear the reply text
            setReplyText('');

        } catch (err) {
            console.error('Error submitting reply:', err);
            setError('Failed to submit your reply. Please try again.');
        } finally {
            setReplyLoading(false);
        }
    };

    // Function to handle replying to individual comments
    const handleAnswerSubmit = async (e, questionId) => {
        e.preventDefault();
        if (!answerText.trim()) return;

        try {
            setAnswerLoading(true);
            const token = localStorage.getItem('token');

            const response = await fetch(`/api/topics/${currentTopic._id}/questions/${questionId}/answers`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    content: answerText
                })
            });

            if (!response.ok) {
                const data = await response.json();
                throw new Error(data.message || 'Failed to submit answer');
            }

            // Optimistically update the UI with the new answer
            const updatedTopic = { ...currentTopic };

            // Find the correct discussion to update
            const discussionIndex = updatedTopic.discussions.findIndex(
                disc => disc._id === questionId
            );

            if (discussionIndex !== -1) {
                // Create a new answer object
                const newAnswer = {
                    _id: `temp-${Date.now()}`,
                    content: answerText,
                    answeredBy: currentUser._id,
                    answeredByDetails: {
                        name: currentUser.name || `${currentUser.firstName || ''} ${currentUser.lastName || ''}`.trim(),
                        firstName: currentUser.firstName,
                        lastName: currentUser.lastName
                    },
                    date: new Date().toISOString()
                };

                // Add the answer to the discussion
                if (!updatedTopic.discussions[discussionIndex].answers) {
                    updatedTopic.discussions[discussionIndex].answers = [newAnswer];
                } else {
                    updatedTopic.discussions[discussionIndex].answers.push(newAnswer);
                }

                // Update the topic in state
                setCurrentTopic(updatedTopic);
            }

            // Reset form
            setAnswerText('');
            setReplyToQuestion(null);

        } catch (err) {
            console.error('Error submitting answer:', err);
            setError('Failed to submit your answer. Please try again.');
        } finally {
            setAnswerLoading(false);
        }
    };

    // Add this new function to handle liking responses
    const handleResponseLike = async (e, discussionId) => {
        e.stopPropagation();  // Prevent event bubbling

        if (!currentUser) {
            setError("Please login to like responses");
            return;
        }

        try {
            const token = localStorage.getItem('token');
            const responseKey = `${currentTopic._id}-${discussionId}`;
            const isLiked = likedResponses.has(responseKey);

            const response = await fetch(`/api/topics/${currentTopic._id}/questions/${discussionId}/like`, {
                method: isLiked ? 'DELETE' : 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (!response.ok) {
                throw new Error('Failed to update like status');
            }

            // Update local state
            const newLikedResponses = new Set(likedResponses);

            // Find the discussion in the current topic
            const updatedTopic = { ...currentTopic };
            const discussionIndex = updatedTopic.discussions.findIndex(
                disc => disc._id === discussionId
            );

            if (discussionIndex !== -1) {
                if (isLiked) {
                    newLikedResponses.delete(responseKey);
                    // Decrease the like count
                    updatedTopic.discussions[discussionIndex].question.likes =
                        (updatedTopic.discussions[discussionIndex].question.likes || 1) - 1;
                } else {
                    newLikedResponses.add(responseKey);
                    // Increase the like count
                    updatedTopic.discussions[discussionIndex].question.likes =
                        (updatedTopic.discussions[discussionIndex].question.likes || 0) + 1;
                }

                // Update the topic with the new like count
                setCurrentTopic(updatedTopic);
            }

            setLikedResponses(newLikedResponses);
        } catch (err) {
            console.error('Error updating response like status:', err);
            setError('Failed to update like status');
        }
    };

    // Format relative time
    const getRelativeTime = (dateString) => {
        if (!dateString) return 'Unknown time';

        const date = new Date(dateString);
        const now = new Date();
        const diffInSeconds = Math.floor((now - date) / 1000);

        if (diffInSeconds < 60) return 'just now';
        if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} min ago`;
        if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`;
        if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)} days ago`;

        // Just return the date if it's older
        return date.toLocaleDateString();
    };

    const handleLike = async (e, topicId) => {
        e.stopPropagation(); // Prevent opening the topic modal

        if (!currentUser) {
            setError("Please login to like topics");
            return;
        }

        try {
            const token = localStorage.getItem('token');
            const isLiked = likedTopics.has(topicId);

            const response = await fetch(`/api/topics/${topicId}/like`, {
                method: isLiked ? 'DELETE' : 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (!response.ok) {
                throw new Error('Failed to update like status');
            }

            // Update local state
            const newLikedTopics = new Set(likedTopics);
            if (isLiked) {
                newLikedTopics.delete(topicId);

                // Update the like count in the current topic if open
                if (currentTopic && currentTopic._id === topicId) {
                    setCurrentTopic({
                        ...currentTopic,
                        likes: (currentTopic.likes || 0) - 1
                    });
                }
            } else {
                newLikedTopics.add(topicId);

                // Update the like count in the current topic if open
                if (currentTopic && currentTopic._id === topicId) {
                    setCurrentTopic({
                        ...currentTopic,
                        likes: (currentTopic.likes || 0) + 1
                    });
                }
            }
            setLikedTopics(newLikedTopics);

        } catch (err) {
            console.error('Error updating like status:', err);
            setError('Failed to update like status');
        }
    };

    const handleSave = async (e, topicId) => {
        e.stopPropagation(); // Prevent opening the topic modal

        if (!currentUser) {
            setError("Please login to save topics");
            return;
        }

        try {
            const token = localStorage.getItem('token');
            const isSaved = savedTopics.has(topicId);

            const response = await fetch(`/api/topics/${topicId}/bookmark`, {
                method: isSaved ? 'DELETE' : 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (!response.ok) {
                throw new Error('Failed to update bookmark status');
            }

            // Update local state
            const newSavedTopics = new Set(savedTopics);
            if (isSaved) {
                newSavedTopics.delete(topicId);
            } else {
                newSavedTopics.add(topicId);
            }
            setSavedTopics(newSavedTopics);

        } catch (err) {
            console.error('Error updating bookmark status:', err);
            setError('Failed to update bookmark status');
        }
    };

    const handleShare = (e, topicId) => {
        e.stopPropagation(); // Prevent opening the topic modal

        // Create the share URL for the current topic
        const shareUrl = `${window.location.origin}/discussions/${topicId}`;

        // Use the Web Share API if available
        if (navigator.share) {
            navigator.share({
                title: 'Check out this discussion!',
                text: 'I found an interesting discussion on TechLeaRNS',
                url: shareUrl
            })
                .catch(error => console.log('Error sharing:', error));
        } else {
            // Fallback: copy to clipboard
            navigator.clipboard.writeText(shareUrl)
                .then(() => {
                    // Show a temporary "Copied" message
                    setError("Link copied to clipboard!");
                    setTimeout(() => setError(null), 2000);
                })
                .catch(err => {
                    console.error('Failed to copy:', err);
                    setError('Failed to copy link');
                });
        }
    };

    const handleCommentClick = (e, topicId) => {
        e.stopPropagation(); // Prevent the default card click

        // First open the modal
        handleTopicClick(topicId);

        // After modal is open, we want to focus on the reply input
        // We need a slight delay to ensure the modal is rendered
        setTimeout(() => {
            const replyInput = document.getElementById('reply-input');
            if (replyInput) replyInput.focus();
        }, 300);
    };

    return (
        <section className="py-8 px-4 md:py-12 md:px-8 bg-gray-50">
            <div className="container mx-auto">
                {/* Search and filter section */}
                <div className="mb-8 bg-white rounded-xl shadow-md p-4 md:p-6">
                    <div className="flex flex-col md:flex-row gap-4 items-center">
                        {/* Search input */}
                        <div className="relative flex-grow">
                            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                                <FaSearch className="text-gray-400" />
                            </div>
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder="Search topics by title, content, or tags..."
                                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#f99e1c] focus:border-transparent"
                            />
                        </div>

                        {/* Filter button (mobile) */}
                        <button
                            onClick={() => setShowFilters(!showFilters)}
                            className="md:hidden px-4 py-2.5 bg-[#013954] text-white rounded-lg flex items-center gap-2"
                        >
                            <FaFilter />
                            <span>Filter</span>
                            <FaChevronDown className={`transition-transform ${showFilters ? 'rotate-180' : ''}`} />
                        </button>

                        {/* Category selector (desktop) */}
                        <div className="hidden md:block">
                            <select
                                value={selectedCategory}
                                onChange={(e) => setSelectedCategory(e.target.value)}
                                className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#f99e1c] focus:border-transparent bg-white cursor-pointer"
                            >
                                {categories.map(category => (
                                    <option key={category.id} value={category.id}>
                                        {category.name}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>

                    {/* Category selector (mobile, only shown when filter button is clicked) */}
                    <AnimatePresence>
                        {showFilters && (
                            <motion.div
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: 'auto', opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                transition={{ duration: 0.2 }}
                                className="md:hidden overflow-hidden mt-4"
                            >
                                <div className="grid grid-cols-2 gap-2">
                                    {categories.map(category => (
                                        <button
                                            key={category.id}
                                            onClick={() => {
                                                setSelectedCategory(category.id);
                                                setShowFilters(false);
                                            }}
                                            className={`px-3 py-2 text-sm rounded-lg border transition-colors ${selectedCategory === category.id
                                                ? 'bg-[#013954] text-white border-[#013954]'
                                                : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'
                                                }`}
                                        >
                                            {category.name}
                                        </button>
                                    ))}
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                {/* Error message */}
                {error && (
                    <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6 rounded-md">
                        <p className="text-red-700 text-sm">{error}</p>
                    </div>
                )}

                {/* Loading state */}
                {loading && !showModal && (
                    <div className="flex justify-center items-center py-20">
                        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#013954]"></div>
                    </div>
                )}

                {/* No results message */}
                {!loading && filteredTopics.length === 0 && (
                    <div className="text-center py-16">
                        <FaComments className="mx-auto text-gray-300 text-5xl mb-4" />
                        <h3 className="text-xl font-semibold text-gray-500 mb-1">No topics found</h3>
                        <p className="text-gray-400 max-w-md mx-auto">
                            {searchQuery
                                ? "Try adjusting your search or filters to find what you're looking for."
                                : "Be the first to start a discussion on this topic!"}
                        </p>
                    </div>
                )}

                {/* Topics grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {filteredTopics.map((topic) => (
                        <motion.div
                            key={topic._id}
                            layoutId={`topic-card-${topic._id}`}
                            onClick={() => handleTopicClick(topic._id)}
                            className="bg-white rounded-lg shadow-md overflow-hidden border border-gray-100 cursor-pointer hover:shadow-lg transition-shadow duration-300"
                            whileHover={{ y: -5 }}
                            transition={{ duration: 0.2 }}
                        >
                            <div className="p-5 flex flex-col h-full">
                                {/* Category badge */}
                                <div className="inline-block mb-2">
                                    <span className="px-2 py-1 bg-[#f99e1c]/10 text-[#f99e1c] rounded-full text-xs font-medium">
                                        {categories.find(c => c.id === topic.category)?.name || 'Uncategorized'}
                                    </span>

                                    {topic.isPremium && (
                                        <span className="ml-2 px-2 py-1 bg-[#013954]/10 text-[#013954] rounded-full text-xs font-medium">
                                            Premium
                                        </span>
                                    )}
                                </div>

                                {/* Title */}
                                <h3 className="text-lg font-semibold text-[#013954] mb-2 line-clamp-2">
                                    {topic.title}
                                </h3>

                                {/* Description */}
                                <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                                    {topic.description}
                                </p>

                                {/* Tags */}
                                {topic.tags && topic.tags.length > 0 && (
                                    <div className="flex flex-wrap gap-1 mb-3">
                                        {topic.tags.slice(0, 3).map((tag, idx) => (
                                            <span key={idx} className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded">
                                                #{tag}
                                            </span>
                                        ))}
                                        {topic.tags.length > 3 && (
                                            <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded">
                                                +{topic.tags.length - 3}
                                            </span>
                                        )}
                                    </div>
                                )}

                                {/* Stats */}
                                <div className="grid grid-cols-2 gap-2 mb-2 text-sm mt-auto">
                                    <div className="flex items-center text-gray-600">
                                        <FaUsers className="mr-2 text-[#013954]/70" size={14} />
                                        <span>{topic.views || 0}</span>
                                    </div>

                                    <div className="flex items-center text-gray-600">
                                        <FaComments className="mr-2 text-[#013954]/70" size={14} />
                                        {/* Fixed the reference to discussions count */}
                                        <span>{topic.discussions?.length || 0}</span>
                                    </div>
                                </div>

                                <div className="mt-2 pt-2 border-t border-gray-100">
                                    <div className="flex justify-between items-center">
                                        <div className="flex items-center text-gray-500 text-xs">
                                            <FaClock className="mr-1" size={12} />
                                            <span>{getRelativeTime(topic.createdAt)}</span>
                                        </div>

                                        <div className="text-xs flex items-center text-gray-500">
                                            {topic.createdBy?.name ||
                                                (topic.createdBy?.firstName && `${topic.createdBy.firstName} ${topic.createdBy.lastName || ''}`) ||
                                                'Anonymous'}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>

                {/* Detail View Modal */}
                <AnimatePresence>
                    {showModal && currentTopic && (
                        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: 20 }}
                                className="bg-white rounded-xl shadow-2xl w-full max-w-4xl h-[85vh] overflow-hidden relative"
                            >
                                {/* Modal Header */}
                                <div className="bg-[#013954] text-white py-4 px-6 flex justify-between items-center sticky top-0 z-10">
                                    <div>
                                        <span className="inline-block px-2 py-1 bg-[#f99e1c]/20 text-[#f99e1c] rounded-full text-xs font-medium mb-1">
                                            {categories.find(c => c.id === currentTopic.category)?.name || 'Uncategorized'}
                                        </span>
                                        <h3 className="text-xl font-bold">{currentTopic.title}</h3>
                                    </div>
                                    <button
                                        onClick={() => setShowModal(false)}
                                        className="text-white/80 hover:text-white transition-colors"
                                    >
                                        <FaTimes size={20} />
                                    </button>
                                </div>

                                {/* Modal Body */}
                                <div className="overflow-y-auto p-6 h-[calc(85vh-70px)]">
                                    {/* Original Post */}
                                    <div className="bg-gray-50 p-5 rounded-lg mb-8">
                                        <div className="flex justify-between items-start mb-4">
                                            <div className="flex items-center">
                                                <div className="w-10 h-10 bg-[#013954] rounded-full flex items-center justify-center text-white font-bold mr-3">
                                                    {(currentTopic.createdBy?.name || currentTopic.author?.name || 'A').charAt(0).toUpperCase()}
                                                </div>
                                                <div>
                                                    <div className="font-medium text-[#013954]">
                                                        {currentTopic.createdBy?.name ||
                                                            (currentTopic.createdBy?.firstName && `${currentTopic.createdBy.firstName} ${currentTopic.createdBy.lastName || ''}`) ||
                                                            'Anonymous'}
                                                    </div>
                                                    <div className="text-xs text-gray-500">
                                                        {getRelativeTime(currentTopic.createdAt)}
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="flex items-center gap-1">
                                                {currentTopic.isPremium && (
                                                    <span className="px-2 py-1 bg-[#013954]/10 text-[#013954] rounded-full text-xs font-medium">
                                                        Premium
                                                    </span>
                                                )}
                                                <button className="text-gray-500 hover:text-[#013954]">
                                                    <FaEllipsisH />
                                                </button>
                                            </div>
                                        </div>

                                        <div className="prose prose-sm max-w-none mb-6">
                                            <p>{currentTopic.description}</p>
                                        </div>

                                        {/* Tags */}
                                        {currentTopic.tags && currentTopic.tags.length > 0 && (
                                            <div className="flex flex-wrap gap-1 mb-4">
                                                {currentTopic.tags.map((tag, idx) => (
                                                    <span key={idx} className="text-xs bg-gray-200 text-gray-700 px-2 py-1 rounded">
                                                        #{tag}
                                                    </span>
                                                ))}
                                            </div>
                                        )}

                                        <div className="flex items-center gap-4 text-sm text-gray-600">
                                            <button
                                                onClick={(e) => handleLike(e, currentTopic._id)}
                                                className={`flex items-center gap-1 ${likedTopics.has(currentTopic._id) ? 'text-[#f99e1c]' : 'hover:text-[#013954]'}`}
                                            >
                                                <FaThumbsUp size={14} /> {currentTopic.likes || 0}
                                            </button>
                                            <button
                                                onClick={() => document.getElementById('reply-input').focus()}
                                                className="flex items-center gap-1 hover:text-[#013954]"
                                            >
                                                <FaComments size={14} /> {currentTopic.discussions?.length || 0}
                                            </button>
                                            <button
                                                onClick={(e) => handleShare(e, currentTopic._id)}
                                                className="flex items-center gap-1 hover:text-[#013954]"
                                            >
                                                <FaShare size={14} /> Share
                                            </button>
                                            <button
                                                onClick={(e) => handleSave(e, currentTopic._id)}
                                                className={`flex items-center gap-1 ${savedTopics.has(currentTopic._id) ? 'text-[#f99e1c]' : 'hover:text-[#013954]'}`}
                                            >
                                                <FaBookmark size={14} /> Save
                                            </button>
                                        </div>
                                    </div>

                                    {/* Questions/Replies Section */}
                                    <div className="space-y-6 mb-20">
                                        <h4 className="text-lg font-semibold text-[#013954] mb-4">
                                            Responses ({currentTopic.discussions?.length || 0})
                                        </h4>

                                        {currentTopic.discussions && currentTopic.discussions.length > 0 ? (
                                            currentTopic.discussions.map((discussion) => (
                                                <div key={discussion._id} className="bg-white border border-gray-200 rounded-lg p-5">
                                                    <div className="flex items-start justify-between mb-4">
                                                        <div className="flex items-center">
                                                            <div className="w-8 h-8 bg-[#f99e1c] rounded-full flex items-center justify-center text-white font-bold mr-3">
                                                                {discussion.question.askedByDetails?.name ?
                                                                    discussion.question.askedByDetails.name.charAt(0).toUpperCase() :
                                                                    (discussion.question.askedBy ?
                                                                        (typeof discussion.question.askedBy === 'string' ?
                                                                            discussion.question.askedBy.charAt(0).toUpperCase() : 'A') : 'A')}
                                                            </div>
                                                            <div>
                                                                <div className="font-medium text-gray-800">
                                                                    {/* Show username either from askedByDetails or through getUserNameFromId */}
                                                                    {discussion.question.askedByDetails?.name ||
                                                                        (discussion.question.askedByDetails?.firstName &&
                                                                            `${discussion.question.askedByDetails.firstName} ${discussion.question.askedByDetails.lastName || ''}`) ||
                                                                        getUserNameFromId(discussion.question.askedBy)}
                                                                </div>
                                                                <div className="text-xs text-gray-500">
                                                                    {getRelativeTime(discussion.question.date)}
                                                                </div>
                                                            </div>
                                                        </div>
                                                        <button className="text-gray-500 hover:text-[#013954]">
                                                            <FaEllipsisH />
                                                        </button>
                                                    </div>

                                                    <div className="prose prose-sm max-w-none mb-4">
                                                        <p>{discussion.question.content}</p>
                                                    </div>

                                                    <div className="flex items-center gap-3 text-xs text-gray-600">
                                                        {/* <button
                                                            onClick={(e) => handleResponseLike(e, discussion._id)}
                                                            className={`flex items-center gap-1 ${likedResponses.has(`${currentTopic._id}-${discussion._id}`) ? 'text-[#f99e1c]' : 'hover:text-[#013954]'}`}
                                                        >
                                                            <FaThumbsUp size={12} /> {discussion.question.likes || 0}
                                                        </button> */}
                                                        <button
                                                            className="flex items-center gap-1 hover:text-[#013954]"
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                setReplyToQuestion(replyToQuestion === discussion._id ? null : discussion._id);
                                                            }}
                                                        >
                                                            <FaReply size={12} /> Reply
                                                        </button>
                                                    </div>

                                                    {/* Reply form for individual comments */}
                                                    {replyToQuestion === discussion._id && currentUser && (
                                                        <form
                                                            onSubmit={(e) => handleAnswerSubmit(e, discussion._id)}
                                                            className="mt-4 flex items-start gap-2"
                                                        >
                                                            <div className="w-6 h-6 bg-[#013954] rounded-full flex items-center justify-center text-white text-xs font-bold mt-1">
                                                                {currentUser.name?.charAt(0).toUpperCase() || currentUser.firstName?.charAt(0).toUpperCase() || 'Y'}
                                                            </div>
                                                            <div className="flex-grow">
                                                                <textarea
                                                                    value={answerText}
                                                                    onChange={(e) => setAnswerText(e.target.value)}
                                                                    placeholder="Write your answer..."
                                                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#f99e1c] focus:border-transparent min-h-[80px] text-sm"
                                                                    required
                                                                ></textarea>
                                                                <div className="flex justify-end gap-2 mt-2">
                                                                    <button
                                                                        type="button"
                                                                        onClick={() => setReplyToQuestion(null)}
                                                                        className="px-3 py-1.5 text-sm border border-gray-300 text-gray-600 rounded-lg hover:bg-gray-50"
                                                                    >
                                                                        Cancel
                                                                    </button>
                                                                    <button
                                                                        type="submit"
                                                                        disabled={answerLoading || !answerText.trim()}
                                                                        className={`px-3 py-1.5 text-sm bg-[#013954] text-white rounded-lg hover:bg-[#012d44] transition-colors flex items-center gap-2 ${answerLoading || !answerText.trim() ? 'opacity-50 cursor-not-allowed' : ''
                                                                            }`}
                                                                    >
                                                                        {answerLoading ? (
                                                                            <>
                                                                                <div className="h-3 w-3 border-2 border-t-transparent border-white rounded-full animate-spin"></div>
                                                                                <span>Posting...</span>
                                                                            </>
                                                                        ) : 'Post Answer'}
                                                                    </button>
                                                                </div>
                                                            </div>
                                                        </form>
                                                    )}

                                                    {/* Answers to this question */}
                                                    {discussion.answers && discussion.answers.length > 0 && (
                                                        <div className="mt-4 pl-4 border-l-2 border-gray-200 space-y-4">
                                                            {discussion.answers.map((answer) => (
                                                                <div key={answer._id} className="bg-gray-50 rounded p-4">
                                                                    <div className="flex items-center mb-2">
                                                                        <div className="w-6 h-6 bg-gray-600 rounded-full flex items-center justify-center text-white text-xs font-bold mr-2">
                                                                            {answer.answeredByDetails?.name ?
                                                                                answer.answeredByDetails.name.charAt(0).toUpperCase() : 'A'}
                                                                        </div>
                                                                        <div>
                                                                            <div className="text-sm font-medium text-gray-800">
                                                                                {answer.answeredByDetails?.name ||
                                                                                    answer.answeredByDetails?.firstName ||
                                                                                    getUserNameFromId(answer.answeredBy)}
                                                                            </div>
                                                                            <div className="text-xs text-gray-500">
                                                                                {getRelativeTime(answer.date)}
                                                                            </div>
                                                                        </div>
                                                                    </div>
                                                                    <p className="text-sm text-gray-700">{answer.content}</p>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    )}
                                                </div>
                                            ))
                                        ) : (
                                            <div className="text-center py-8 text-gray-500">
                                                <FaComments className="mx-auto text-gray-300 text-4xl mb-3" onClick={e => handleCommentClick(e, currentTopic._id)} />
                                                <p>No responses yet. Be the first to reply!</p>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Reply Form - Fixed at bottom */}
                                <div className="sticky bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4">
                                    {currentUser ? (
                                        <form onSubmit={handleReplySubmit} className="flex items-center gap-3">
                                            <div className="w-8 h-8 bg-[#013954] rounded-full flex items-center justify-center text-white font-bold">
                                                {currentUser.name?.charAt(0).toUpperCase() || currentUser.firstName?.charAt(0).toUpperCase() || 'Y'}
                                            </div>
                                            <input
                                                id="reply-input"
                                                type="text"
                                                value={replyText}
                                                onChange={(e) => setReplyText(e.target.value)}
                                                placeholder="Add your response..."
                                                className="flex-grow px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#f99e1c] focus:border-transparent"
                                                required
                                            />
                                            <button
                                                type="submit"
                                                disabled={replyLoading || !replyText.trim()}
                                                className={`px-4 py-2 bg-[#013954] text-white rounded-lg hover:bg-[#012d44] transition-colors flex items-center gap-2 ${replyLoading || !replyText.trim() ? 'opacity-50 cursor-not-allowed' : ''
                                                    }`}
                                            >
                                                {replyLoading ? (
                                                    <>
                                                        <div className="h-4 w-4 border-2 border-t-transparent border-white rounded-full animate-spin"></div>
                                                        <span>Sending...</span>
                                                    </>
                                                ) : (
                                                    <>
                                                        <FaReply /> Reply
                                                    </>
                                                )}
                                            </button>
                                        </form>
                                    ) : (
                                        <div className="text-center">
                                            <p className="text-gray-600 mb-2">Sign in to join the discussion</p>
                                            <button
                                                onClick={() => window.location.href = '/login'}
                                                className="px-4 py-2 bg-[#f99e1c] text-white rounded-lg hover:bg-[#e08200] transition-colors"
                                            >
                                                Login to Reply
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </motion.div>
                        </div>
                    )}
                </AnimatePresence>
            </div>
        </section>
    );
};

export default TopicsGrid;
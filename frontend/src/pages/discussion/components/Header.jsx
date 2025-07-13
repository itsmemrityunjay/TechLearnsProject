import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { FaComments, FaPlus, FaSearch, FaTags, FaLightbulb, FaUsers, FaThumbsUp } from 'react-icons/fa';
import { useAuth } from '../../../context/AuthContext';

const Header = () => {
    const { currentUser, isAuthenticated } = useAuth();
    const [showModal, setShowModal] = useState(false);
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        category: 'programming',
        tags: '',
        isPremium: false
    });
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);
        setLoading(true);

        try {
            // Validate form
            if (!formData.title.trim() || !formData.description.trim()) {
                throw new Error("Title and description are required");
            }

            // Prepare data - convert tags from string to array
            const tagsArray = formData.tags
                .split(',')
                .map(tag => tag.trim())
                .filter(tag => tag !== '');

            // Auth headers
            const token = localStorage.getItem('token');
            const headers = {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            };

            // Submit form
            const response = await fetch('/api/topics', {
                method: 'POST',
                headers,
                body: JSON.stringify({
                    ...formData,
                    tags: tagsArray
                }),
                credentials: 'include'
            });

            if (!response.ok) {
                const data = await response.json();
                throw new Error(data.message || 'Failed to create topic');
            }

            // Success!
            setSuccess(true);
            setTimeout(() => {
                setShowModal(false);
                setSuccess(false);
                setFormData({
                    title: '',
                    description: '',
                    category: 'programming',
                    tags: '',
                    isPremium: false
                });
            }, 2000);

        } catch (err) {
            console.error('Error creating topic:', err);
            setError(err.message || 'An unexpected error occurred');
        } finally {
            setLoading(false);
        }
    };

    return (
        <section className="relative bg-gradient-to-br from-[#013954] to-[#01273b] py-16 md:py-20 overflow-hidden">
            {/* Decorative elements */}
            <div className="absolute top-0 left-0 w-40 h-40 bg-[#f99e1c]/10 rounded-full -translate-x-1/2 -translate-y-1/2 blur-3xl"></div>
            <div className="absolute bottom-0 right-0 w-60 h-60 bg-[#f99e1c]/5 rounded-full translate-x-1/3 translate-y-1/3 blur-3xl"></div>

            <div className="container mx-auto px-4 md:px-6 relative z-10">
                <div className="flex flex-col lg:flex-row items-center gap-8 md:gap-12">
                    {/* Left content */}
                    <div className="flex-1 text-center lg:text-left">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6 }}
                            className="mb-6"
                        >
                            <span className="inline-block px-4 py-1 bg-[#f99e1c]/10 text-[#f99e1c] rounded-full text-sm font-medium mb-4">
                                TechLearns Community
                            </span>
                            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white leading-tight mb-4">
                                Ask, Answer, <br className="hidden md:block" />
                                <span className="text-[#f99e1c]">Share Knowledge</span>
                            </h1>
                            <p className="text-white/80 text-base md:text-lg max-w-2xl mx-auto lg:mx-0">
                                Join our tech discussions to get answers to your questions, help others,
                                and share your expertise with our growing community.
                            </p>
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6, delay: 0.2 }}
                            className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start"
                        >
                            <button
                                onClick={() => isAuthenticated ? setShowModal(true) : window.location.href = '/login'}
                                className="px-6 py-3 bg-[#f99e1c] hover:bg-[#f99e1c]/90 text-white font-medium rounded-lg shadow-lg shadow-[#f99e1c]/20 transition-all duration-300 flex items-center justify-center gap-2 group"
                            >
                                Start Discussion
                                <FaPlus className="group-hover:rotate-90 transition-transform" />
                            </button>

                            <button className="px-6 py-3 bg-transparent hover:bg-white/10 text-white border-2 border-white/30 font-medium rounded-lg transition-colors duration-300 flex items-center justify-center gap-2">
                                <FaSearch size={14} />
                                Browse Discussions
                            </button>
                        </motion.div>

                        {/* Stats */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6, delay: 0.4 }}
                            className="mt-10 grid grid-cols-2 md:grid-cols-3 gap-4 max-w-md mx-auto lg:mx-0"
                        >
                            {[
                                { value: "1.2K+", label: "Active Topics" },
                                { value: "24K+", label: "Solutions" },
                                { value: "8K+", label: "Contributors" }
                            ].map((stat, index) => (
                                <div key={index} className="bg-white/5 backdrop-blur-sm rounded-lg p-3 text-center">
                                    <div className="text-[#f99e1c] text-xl md:text-2xl font-bold">{stat.value}</div>
                                    <div className="text-white/70 text-sm">{stat.label}</div>
                                </div>
                            ))}
                        </motion.div>
                    </div>

                    {/* Right content - Discussion illustration */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.8 }}
                        className="lg:flex-1 w-full max-w-md"
                    >
                        <div className="relative">
                            {/* Main image */}
                            <div className="bg-gradient-to-br from-[#f99e1c]/20 to-[#f99e1c]/5 p-6 rounded-2xl shadow-xl relative overflow-hidden">
                                <div className="aspect-square relative z-10 flex items-center justify-center">
                                    <div className="relative">
                                        {/* Comments icon with glow */}
                                        <div className="absolute inset-0 bg-[#f99e1c] rounded-full filter blur-2xl opacity-30 scale-75"></div>
                                        <div className="relative bg-gradient-to-br from-[#f99e1c] to-[#f8b254] p-10 rounded-full shadow-lg">
                                            <FaComments className="w-32 h-32 text-white" />
                                        </div>
                                    </div>
                                </div>

                                {/* Decorative elements */}
                                <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -translate-x-8 -translate-y-10 blur-md"></div>
                                <div className="absolute bottom-0 left-0 w-24 h-24 bg-[#f99e1c]/10 rounded-full translate-x-4 translate-y-6 blur-md"></div>

                                {/* Highlight cards */}
                                <div className="absolute top-5 left-5 bg-white/90 backdrop-blur-sm p-3 rounded-lg shadow-lg transform -rotate-6">
                                    <div className="flex items-center gap-2">
                                        <div className="h-2 w-2 rounded-full bg-[#f99e1c]"></div>
                                        <span className="text-[#013954] font-medium text-sm">Development</span>
                                    </div>
                                </div>

                                <div className="absolute bottom-10 right-5 bg-white/90 backdrop-blur-sm p-3 rounded-lg shadow-lg transform rotate-6">
                                    <div className="flex items-center gap-2">
                                        <div className="h-2 w-2 rounded-full bg-[#013954]"></div>
                                        <span className="text-[#013954] font-medium text-sm">AI & Machine Learning</span>
                                    </div>
                                </div>
                            </div>

                            {/* Border accents */}
                            <div className="absolute -bottom-3 -right-3 h-24 w-24 border-r-2 border-b-2 border-[#f99e1c] rounded-br-xl z-0"></div>
                            <div className="absolute -top-3 -left-3 h-24 w-24 border-l-2 border-t-2 border-[#013954] rounded-tl-xl z-0"></div>
                        </div>
                    </motion.div>
                </div>
            </div>

            {/* Modal for creating discussion */}
            {showModal && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-white rounded-xl shadow-2xl w-full max-w-2xl overflow-hidden"
                    >
                        <div className="bg-[#013954] text-white py-4 px-6 flex justify-between items-center">
                            <h3 className="text-xl font-bold flex items-center gap-2">
                                <FaLightbulb /> Start a Discussion
                            </h3>
                            <button
                                onClick={() => setShowModal(false)}
                                className="text-white/80 hover:text-white transition-colors"
                            >
                                ✕
                            </button>
                        </div>

                        {success ? (
                            <div className="p-8 text-center">
                                <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                                    <FaThumbsUp className="text-green-600 text-3xl" />
                                </div>
                                <h3 className="text-xl font-bold text-gray-800 mb-2">Topic Created Successfully!</h3>
                                <p className="text-gray-600">Your discussion has been posted to our community.</p>
                            </div>
                        ) : (
                            <form onSubmit={handleSubmit} className="p-6">
                                {error && (
                                    <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-4 rounded">
                                        <p className="text-red-700 text-sm">{error}</p>
                                    </div>
                                )}

                                <div className="mb-4">
                                    <label className="block text-gray-700 font-medium mb-2" htmlFor="title">
                                        Topic Title*
                                    </label>
                                    <input
                                        type="text"
                                        id="title"
                                        name="title"
                                        value={formData.title}
                                        onChange={handleChange}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#f99e1c] focus:border-transparent"
                                        placeholder="E.g., How to optimize React performance?"
                                        required
                                    />
                                </div>

                                <div className="mb-4">
                                    <label className="block text-gray-700 font-medium mb-2" htmlFor="description">
                                        Description*
                                    </label>
                                    <textarea
                                        id="description"
                                        name="description"
                                        value={formData.description}
                                        onChange={handleChange}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#f99e1c] focus:border-transparent h-32 resize-none"
                                        placeholder="Describe your question or topic in detail..."
                                        required
                                    ></textarea>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                                    <div>
                                        <label className="block text-gray-700 font-medium mb-2" htmlFor="category">
                                            Category*
                                        </label>
                                        <select
                                            id="category"
                                            name="category"
                                            value={formData.category}
                                            onChange={handleChange}
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#f99e1c] focus:border-transparent bg-white"
                                        >
                                            <option value="programming">Programming</option>
                                            <option value="webdev">Web Development</option>
                                            <option value="mobile">Mobile Development</option>
                                            <option value="ai">AI & Machine Learning</option>
                                            <option value="datascience">Data Science</option>
                                            <option value="devops">DevOps</option>
                                            <option value="cloud">Cloud Computing</option>
                                            <option value="cybersecurity">Cybersecurity</option>
                                            <option value="other">Other</option>
                                        </select>
                                    </div>

                                    <div>
                                        <label className="block text-gray-700 font-medium mb-2" htmlFor="tags">
                                            Tags <span className="text-gray-500 text-sm">(comma separated)</span>
                                        </label>
                                        <div className="flex items-center border border-gray-300 rounded-lg px-3 py-2 focus-within:ring-2 focus-within:ring-[#f99e1c] focus-within:border-transparent">
                                            <FaTags className="text-gray-400 mr-2" />
                                            <input
                                                type="text"
                                                id="tags"
                                                name="tags"
                                                value={formData.tags}
                                                onChange={handleChange}
                                                className="w-full outline-none"
                                                placeholder="react, performance, hooks"
                                            />
                                        </div>
                                    </div>
                                </div>

                                {currentUser?.role === 'mentor' && (
                                    <div className="mb-6">
                                        <label className="flex items-center gap-2 cursor-pointer">
                                            <input
                                                type="checkbox"
                                                name="isPremium"
                                                checked={formData.isPremium}
                                                onChange={handleChange}
                                                className="rounded text-[#f99e1c] focus:ring-[#f99e1c]"
                                            />
                                            <span className="text-gray-700">Mark as Premium Content</span>
                                        </label>
                                    </div>
                                )}

                                <div className="flex justify-end gap-3 mt-6">
                                    <button
                                        type="button"
                                        onClick={() => setShowModal(false)}
                                        className="px-5 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={loading}
                                        className={`px-5 py-2 bg-[#013954] text-white rounded-lg hover:bg-[#012d44] flex items-center gap-2 ${loading ? 'opacity-70 cursor-not-allowed' : ''}`}
                                    >
                                        {loading ? (
                                            <>
                                                <div className="h-4 w-4 border-2 border-t-transparent border-white rounded-full animate-spin"></div>
                                                Creating...
                                            </>
                                        ) : (
                                            <>
                                                Post Discussion <FaUsers />
                                            </>
                                        )}
                                    </button>
                                </div>
                            </form>
                        )}
                    </motion.div>
                </div>
            )}
        </section>
    );
};

export default Header;
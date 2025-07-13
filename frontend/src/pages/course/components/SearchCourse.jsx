import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { FaSearch, FaTimes, FaGraduationCap, FaArrowRight } from 'react-icons/fa';
import { Link } from 'react-router-dom';

const SearchCourse = () => {
    const [keyword, setKeyword] = useState('');
    const [courses, setCourses] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [focused, setFocused] = useState(false);
    const [showResults, setShowResults] = useState(false);
    const searchRef = useRef(null);
    const inputRef = useRef(null);

    // Search for courses when keyword changes (with debounce)
    useEffect(() => {
        const delayDebounceFn = setTimeout(() => {
            if (keyword.trim().length >= 2) {
                searchCourses();
                setShowResults(true);
            } else {
                setCourses([]);
                setShowResults(false);
            }
        }, 500);

        return () => clearTimeout(delayDebounceFn);
    }, [keyword]);

    // Close search results when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (searchRef.current && !searchRef.current.contains(event.target)) {
                setShowResults(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Search courses API call
    const searchCourses = async () => {
        if (keyword.trim() === '') return;

        setLoading(true);
        setError(null);

        try {
            const response = await axios.get(`/api/courses?keyword=${encodeURIComponent(keyword)}`);
            setCourses(response.data.slice(0, 6)); // Limit to 6 results for the dropdown
        } catch (err) {
            console.error('Search error:', err);
            setError('Failed to fetch courses. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (keyword.trim() !== '') {
            // This would navigate to a full search results page
            window.location.href = `/courses/explore?keyword=${encodeURIComponent(keyword)}`;
        }
    };

    const clearSearch = () => {
        setKeyword('');
        setCourses([]);
        setShowResults(false);
        inputRef.current.focus();
    };

    return (
        <div className="relative z-20 container my-3 mx-auto" ref={searchRef}>
            <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className="w-full"
            >
                <form onSubmit={handleSubmit} className="relative">
                    <div className={`flex items-center bg-white rounded-xl shadow-lg transition-all duration-300 ${focused ? 'ring-2 ring-[#f99e1c]' : ''}`}>
                        <div className="pl-4 py-3 text-gray-500">
                            <FaSearch size={20} className={`transition-colors duration-300 ${focused ? 'text-[#f99e1c]' : 'text-gray-400'}`} />
                        </div>

                        <input
                            ref={inputRef}
                            type="text"
                            placeholder="Search for courses, skills or topics..."
                            value={keyword}
                            onChange={(e) => setKeyword(e.target.value)}
                            onFocus={() => setFocused(true)}
                            onBlur={() => setFocused(false)}
                            className="flex-1 py-3 px-4 outline-none bg-transparent text-gray-800 placeholder-gray-400 text-lg"
                        />

                        {keyword && (
                            <motion.button
                                initial={{ opacity: 0, scale: 0.8 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.8 }}
                                type="button"
                                onClick={clearSearch}
                                className="p-3 mr-1 text-gray-500 hover:text-gray-700"
                                aria-label="Clear search"
                            >
                                <FaTimes size={16} />
                            </motion.button>
                        )}

                        <button
                            type="submit"
                            className="h-full px-6 py-4 bg-[#013954] hover:bg-[#012a3e] text-white rounded-r-xl transition-colors duration-300 flex items-center justify-center"
                            aria-label="Search"
                        >
                            Search
                        </button>
                    </div>
                </form>

                {/* Search filters (optional) */}
                {/* <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.2 }}
                    className="flex flex-wrap gap-2 mt-3 px-1"
                >
                    {['Programming', 'Data Science', 'Design', 'Business', 'NEP 2020'].map((filter) => (
                        <button
                            key={filter}
                            onClick={() => setKeyword(filter)}
                            className="px-3 py-1 text-xs bg-white/80 hover:bg-white text-[#013954] rounded-full border border-gray-200 transition-all hover:shadow-sm"
                        >
                            {filter}
                        </button>
                    ))}
                </motion.div> */}
            </motion.div>

            {/* Search results dropdown */}
            <AnimatePresence>
                {showResults && (keyword.length >= 2) && (
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 10 }}
                        transition={{ duration: 0.2 }}
                        className="absolute left-0 right-0 mt-2 bg-white rounded-lg shadow-xl border border-gray-100 overflow-hidden max-h-[70vh] overflow-y-auto"
                    >
                        {loading ? (
                            <div className="p-4 text-center">
                                <div className="inline-block w-6 h-6 border-2 border-t-transparent border-[#f99e1c] rounded-full animate-spin"></div>
                                <p className="mt-2 text-gray-500">Searching courses...</p>
                            </div>
                        ) : error ? (
                            <div className="p-4 text-center text-red-500">
                                <p>{error}</p>
                            </div>
                        ) : courses.length > 0 ? (
                            <>
                                <div className="divide-y divide-gray-100">
                                    {courses.map((course) => (
                                        <motion.div
                                            key={course._id}
                                            whileHover={{ backgroundColor: '#f8f9fa' }}
                                            className="p-4 transition-colors"
                                        >
                                            <Link
                                                to={`/courses/${course._id}`}
                                                className="flex items-start gap-4"
                                                onClick={() => setShowResults(false)}
                                            >
                                                <div className="w-16 h-16 rounded-md overflow-hidden bg-gray-100 flex-shrink-0">
                                                    {course.thumbnail ? (
                                                        <img
                                                            src={course.thumbnail}
                                                            alt={course.title}
                                                            className="w-full h-full object-cover"
                                                        />
                                                    ) : (
                                                        <div className="w-full h-full flex items-center justify-center bg-[#013954]/10 text-[#013954]">
                                                            <FaGraduationCap size={24} />
                                                        </div>
                                                    )}
                                                </div>
                                                <div className="flex-1">
                                                    <h3 className="font-medium text-gray-800 line-clamp-1">{course.title}</h3>
                                                    <p className="text-sm text-gray-500 line-clamp-2 mt-1">{course.description}</p>
                                                    <div className="mt-1 flex items-center text-xs text-gray-400">
                                                        <span className="px-2 py-0.5 bg-gray-100 rounded-full">{course.category}</span>
                                                        {course.isPremium && (
                                                            <span className="ml-2 px-2 py-0.5 bg-[#f99e1c]/10 text-[#f99e1c] rounded-full">Premium</span>
                                                        )}
                                                    </div>
                                                </div>
                                                <FaArrowRight className="text-gray-400 mt-2" />
                                            </Link>
                                        </motion.div>
                                    ))}
                                </div>
                                <div className="bg-gray-50 p-3 text-center">
                                    <Link
                                        to={`/courses/explore?keyword=${encodeURIComponent(keyword)}`}
                                        onClick={() => setShowResults(false)}
                                        className="text-[#013954] hover:text-[#f99e1c] text-sm font-medium transition-colors"
                                    >
                                        View all results <FaArrowRight className="inline ml-1" size={12} />
                                    </Link>
                                </div>
                            </>
                        ) : (
                            <div className="p-6 text-center">
                                <p className="text-gray-500">No courses found matching "{keyword}"</p>
                                <p className="text-sm text-gray-400 mt-1">Try different keywords or browse all courses</p>
                                <Link
                                    to="/courses/explore"
                                    className="mt-3 inline-block px-4 py-2 bg-[#013954] text-white rounded-lg text-sm hover:bg-[#012a3e] transition-colors"
                                    onClick={() => setShowResults(false)}
                                >
                                    Browse all courses
                                </Link>
                            </div>
                        )}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default SearchCourse;
import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { FaStar, FaUser, FaFilter, FaChevronDown, FaChevronUp, FaChild } from 'react-icons/fa';
import { Link } from 'react-router-dom';

const ElementryCourse = () => {
    // State for courses and display options
    const [courses, setCourses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [visibleCount, setVisibleCount] = useState(4);

    // Filter states
    const [showFilters, setShowFilters] = useState(false);
    const [typeFilter, setTypeFilter] = useState('all');
    const [categoryFilter, setCategoryFilter] = useState('all');
    const [categories, setCategories] = useState([]);

    // Fetch courses with proper query parameters
    const fetchCourses = useCallback(async () => {
        setLoading(true);
        setError(null);

        try {
            // Build query parameters based on filters
            let queryParams = new URLSearchParams();

            // METHOD 1: If your backend supports complex queries
            // For courseFor, we need a more complex query to include:
            // - elementary courses
            // - both (suitable for elementary and undergraduate)
            // - courses without a specific target audience
            queryParams.append('courseFor', 'elementary,both,null');
            queryParams.append('courseForNot', 'undergraduate'); // Exclude undergraduate courses

            // METHOD 2: If your backend doesn't support complex queries
            // Don't filter by courseFor on the server side, we'll filter client-side
            // Uncomment the following block and comment out the above if needed
            /*
            // Only add other filters
            if (typeFilter !== 'all') {
                queryParams.append('isPremium', typeFilter === 'premium');
            }
            
            if (categoryFilter !== 'all') {
                queryParams.append('category', categoryFilter);
            }
            */

            // Add type filter if not "all"
            if (typeFilter !== 'all') {
                queryParams.append('isPremium', typeFilter === 'premium');
            }

            // Add category filter if not "all"
            if (categoryFilter !== 'all') {
                queryParams.append('category', categoryFilter);
            }

            // Fetch courses
            const response = await axios.get(`/api/courses?${queryParams.toString()}`);
            let fetchedCourses = response.data;

            // METHOD 2: Client-side filtering if the backend doesn't support complex queries
            // Uncomment this if using Method 2 above

            fetchedCourses = fetchedCourses.filter(course =>
                course.courseFor === 'elementary' ||
                course.courseFor === 'both' ||
                !course.courseFor ||
                course.courseFor === null ||
                course.courseFor === undefined
            );


            // Update courses
            setCourses(fetchedCourses);

            // Only update categories if they haven't been loaded or if empty
            if (categories.length === 0) {
                const uniqueCategories = [...new Set(fetchedCourses.map(course => course.category))];
                setCategories(uniqueCategories);
            }

            setLoading(false);
        } catch (err) {
            console.error('Error fetching courses:', err);
            setError('Failed to load courses. Please try again later.');
            setLoading(false);
        }
    }, [typeFilter, categoryFilter, categories.length]);

    // Fetch courses when component mounts or filters change
    useEffect(() => {
        fetchCourses();
    }, [fetchCourses]);

    // Handle show more/less functionality
    const handleShowToggle = () => {
        if (visibleCount === 4) {
            setVisibleCount(8); // Show more
        } else {
            setVisibleCount(4); // Show less
            // Scroll back to top of the section
            document.getElementById('elementary-courses')?.scrollIntoView({ behavior: 'smooth' });
        }
    };

    // Reset filters
    const resetFilters = () => {
        setTypeFilter('all');
        setCategoryFilter('all');
    };

    return (
        <section id="elementary-courses" className="py-12 bg-gray-50">
            <div className="container mx-auto px-4">
                {/* Header with icon */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
                    <div>
                        <div className="flex items-center mb-2">
                            <FaChild className="text-[#f99e1c] mr-2" size={24} />
                            <h2 className="text-2xl md:text-3xl font-bold text-[#013954]">
                                Elementary Courses
                            </h2>
                        </div>
                        <div className="mt-2 w-20 h-1 bg-[#f99e1c]"></div>
                        <p className="mt-3 text-gray-600 max-w-xl">
                            Foundational courses designed for beginners to build essential knowledge and skills.
                        </p>
                    </div>

                    {/* Filters - unchanged */}
                    <div className="mt-4 md:mt-0">
                        {/* ... filter UI code unchanged ... */}
                        <div className="relative">
                            <button
                                onClick={() => setShowFilters(!showFilters)}
                                className="px-4 py-2 bg-white border border-gray-300 rounded-md shadow-sm flex items-center text-[#013954] hover:border-[#f99e1c]"
                            >
                                <FaFilter className="mr-2" />
                                Filters
                                {showFilters ?
                                    <FaChevronUp className="ml-2" /> :
                                    <FaChevronDown className="ml-2" />
                                }
                            </button>

                            <AnimatePresence>
                                {showFilters && (
                                    <motion.div
                                        initial={{ opacity: 0, y: -10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: -10 }}
                                        transition={{ duration: 0.2 }}
                                        className="absolute right-0 mt-2 bg-white rounded-lg shadow-xl border border-gray-100 z-20 w-64"
                                    >
                                        <div className="p-4">
                                            <h3 className="font-medium text-gray-700 mb-2">Course Type</h3>
                                            <div className="space-y-2 mb-4">
                                                {['all', 'free', 'premium'].map(type => (
                                                    <label key={type} className="flex items-center cursor-pointer">
                                                        <input
                                                            type="radio"
                                                            name="type"
                                                            checked={typeFilter === type}
                                                            onChange={() => setTypeFilter(type)}
                                                            className="form-radio text-[#f99e1c]"
                                                        />
                                                        <span className="ml-2 capitalize">
                                                            {type === 'all' ? 'All Types' : type}
                                                        </span>
                                                    </label>
                                                ))}
                                            </div>

                                            <h3 className="font-medium text-gray-700 mb-2">Category</h3>
                                            <div className="space-y-2">
                                                <label className="flex items-center cursor-pointer">
                                                    <input
                                                        type="radio"
                                                        name="category"
                                                        checked={categoryFilter === 'all'}
                                                        onChange={() => setCategoryFilter('all')}
                                                        className="form-radio text-[#f99e1c]"
                                                    />
                                                    <span className="ml-2">All Categories</span>
                                                </label>

                                                {categories.map(category => (
                                                    <label key={category} className="flex items-center cursor-pointer">
                                                        <input
                                                            type="radio"
                                                            name="category"
                                                            checked={categoryFilter === category}
                                                            onChange={() => setCategoryFilter(category)}
                                                            className="form-radio text-[#f99e1c]"
                                                        />
                                                        <span className="ml-2">{category}</span>
                                                    </label>
                                                ))}
                                            </div>

                                            <button
                                                onClick={resetFilters}
                                                className="mt-4 text-sm text-[#013954] hover:text-[#f99e1c]"
                                            >
                                                Reset Filters
                                            </button>
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    </div>
                </div>

                {/* Active filter indicators - unchanged */}
                {(typeFilter !== 'all' || categoryFilter !== 'all') && (
                    <div className="mb-4 flex flex-wrap gap-2">
                        <span className="text-sm text-gray-500">Active Filters:</span>
                        {typeFilter !== 'all' && (
                            <span className="px-2 py-1 bg-[#013954]/10 text-[#013954] rounded-full text-xs">
                                {typeFilter === 'premium' ? 'Premium' : 'Free'} courses
                            </span>
                        )}
                        {categoryFilter !== 'all' && (
                            <span className="px-2 py-1 bg-[#f99e1c]/10 text-[#f99e1c] rounded-full text-xs">
                                {categoryFilter}
                            </span>
                        )}
                    </div>
                )}

                {/* Loading state */}
                {loading && (
                    <div className="flex justify-center items-center py-20">
                        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#f99e1c]"></div>
                    </div>
                )}

                {/* Error state */}
                {error && (
                    <div className="text-center py-10">
                        <p className="text-red-500">{error}</p>
                        <button
                            className="mt-4 px-4 py-2 bg-[#013954] text-white rounded-md"
                            onClick={fetchCourses}
                        >
                            Try Again
                        </button>
                    </div>
                )}

                {/* No results state */}
                {!loading && !error && courses.length === 0 && (
                    <div className="text-center py-10">
                        <p className="text-gray-500">No courses found with the selected filters.</p>
                        <button
                            className="mt-4 px-4 py-2 bg-[#013954] text-white rounded-md"
                            onClick={resetFilters}
                        >
                            Clear Filters
                        </button>
                    </div>
                )}

                {/* Course cards grid */}
                {!loading && !error && courses.length > 0 && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mt-4">
                        {courses.slice(0, visibleCount).map(course => (
                            <motion.div
                                key={course._id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.3 }}
                                className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-all duration-300"
                            >
                                {/* Course image */}
                                <div className="relative h-40 md:h-48 overflow-hidden">
                                    <img
                                        src={course.thumbnail || 'https://via.placeholder.com/400x300?text=No+Image'}
                                        alt={course.title}
                                        className="w-full h-full object-cover transform hover:scale-105 transition-all duration-700"
                                    />
                                    <div className="absolute top-0 left-0 bg-[#f99e1c] text-white px-2 md:px-3 py-1 text-xs md:text-sm font-medium">
                                        {course.category}
                                    </div>
                                    {course.isPremium && (
                                        <div className="absolute top-0 right-0 bg-[#013954] text-white px-2 md:px-3 py-1 text-xs md:text-sm font-medium">
                                            Premium
                                        </div>
                                    )}
                                </div>

                                {/* Course info */}
                                <div className="p-3 md:p-5">
                                    <h3 className="text-base md:text-lg font-semibold text-[#013954] mb-2 line-clamp-2 h-12 md:h-14">
                                        {course.title}
                                    </h3>

                                    <div className="flex justify-between items-center mt-3 md:mt-4">
                                        <div className="flex items-center">
                                            <FaStar className="text-[#f99e1c] mr-1" size={14} />
                                            <span className="font-medium text-sm md:text-base">
                                                {course.averageRating?.toFixed(1) || '4.5'}
                                            </span>
                                        </div>

                                        <div className="flex items-center text-gray-500 text-xs md:text-sm">
                                            <FaUser className="mr-1" size={12} />
                                            <span>
                                                {course.enrolledStudents?.length > 1000
                                                    ? `${(course.enrolledStudents.length / 1000).toFixed(1)}k`
                                                    : course.enrolledStudents?.length || 0}
                                                {' students'}
                                            </span>
                                        </div>
                                    </div>

                                    <Link
                                        to={`/courses/${course._id}`}
                                        className="mt-3 md:mt-4 w-full py-1.5 md:py-2 border-2 border-[#013954] text-[#013954] text-center text-sm md:text-base font-medium rounded-md hover:bg-[#013954] hover:text-white transition-colors duration-300 block"
                                    >
                                        View Course
                                    </Link>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                )}

                {/* Show more/less button */}
                {!loading && courses.length > 4 && (
                    <div className="flex justify-center mt-8">
                        <button
                            onClick={handleShowToggle}
                            className="px-6 py-2 border-2 border-[#013954] bg-white text-[#013954] rounded-full hover:bg-[#013954] hover:text-white transition-colors duration-300 flex items-center font-medium"
                        >
                            {visibleCount > 4
                                ? <>Show Less <FaChevronUp className="ml-2" /></>
                                : <>Show More <FaChevronDown className="ml-2" /></>
                            }
                        </button>
                    </div>
                )}
            </div>
        </section>
    );
};

export default ElementryCourse;
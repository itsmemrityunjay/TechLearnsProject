import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaTrophy, FaCalendarAlt, FaUsers, FaChevronDown, FaChevronUp } from 'react-icons/fa';
import { Link } from 'react-router-dom';

const OurCompetitions = () => {
    // State for pagination
    const [visibleCount, setVisibleCount] = useState(4);

    // States for API data
    const [competitions, setCompetitions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Update the useEffect with proper filtering
    useEffect(() => {
        const fetchCompetitions = async () => {
            try {
                setLoading(true);
                // You can add query params to filter on the server, if backend supports it
                const response = await fetch('/api/competitions?type=internal');

                if (!response.ok) {
                    throw new Error(`HTTP error! Status: ${response.status}`);
                }

                const data = await response.json();

                // Get current date for filtering
                const currentDate = new Date();

                // Filter to only include:
                // 1. Internal competitions
                // 2. Active competitions (end date >= current date)
                const filteredCompetitions = data.filter(competition => {
                    const endDate = new Date(competition.endDate);
                    return (
                        competition.competitionType === 'internal' &&
                        endDate >= currentDate
                    );
                });

                setCompetitions(filteredCompetitions);
            } catch (error) {
                console.error('Error fetching competitions:', error);
                setError('Failed to load competitions. Please try again later.');
            } finally {
                setLoading(false);
            }
        };

        fetchCompetitions();
    }, []);

    // Helper function to format date range
    const formatDateRange = (startDate, endDate) => {
        const start = new Date(startDate);
        const end = new Date(endDate);

        const startMonth = start.toLocaleString('default', { month: 'short' });
        const endMonth = end.toLocaleString('default', { month: 'short' });

        // Same month
        if (startMonth === endMonth && start.getFullYear() === end.getFullYear()) {
            return `${startMonth} ${start.getDate()}-${end.getDate()}, ${start.getFullYear()}`;
        }

        // Different months or years
        return `${startMonth} ${start.getDate()} - ${endMonth} ${end.getDate()}, ${end.getFullYear()}`;
    };

    // Helper function to get prize value
    const getPrizeValue = (prizes) => {
        if (!prizes || prizes.length === 0) return "N/A";
        // Get first prize (rank 1)
        const firstPrize = prizes.find(prize => prize.rank === 1);
        // Ensure firstPrize and firstPrize.value exist before using toLocaleString
        return (firstPrize && typeof firstPrize.value === 'number')
            ? `₹${firstPrize.value.toLocaleString()}`
            : "N/A";
    };

    // Now slice based on visibleCount
    const visibleCompetitions = competitions.slice(0, visibleCount);

    // Show the "Show More" button only if there are more competitions to show
    const hasMoreToShow = competitions.length > visibleCount;

    // Handle show more/less clicks
    const handleShowMoreClick = () => {
        setVisibleCount(prev => prev + 4); // Show 4 more cards
    };

    const handleShowLessClick = () => {
        setVisibleCount(4); // Reset to initial 4 cards
    };

    return (
        <section className="py-16 md:py-20 bg-white">
            <div className="container mx-auto px-4 md:px-6">
                {/* Section header */}
                <div className="mb-10 text-center">
                    <h2 className="text-3xl md:text-4xl font-bold text-[#013954] inline-block relative">
                        Our Competitions
                        <div className="mt-2 mx-auto w-24 h-1.5 bg-[#f99e1c] rounded-full"></div>
                    </h2>
                    <p className="mt-4 max-w-2xl mx-auto text-gray-600">
                        Discover our diverse range of competitions designed to challenge your skills and
                        connect you with like-minded tech enthusiasts.
                    </p>
                </div>

                {/* Loading indicator */}
                {loading && (
                    <div className="flex justify-center items-center py-20">
                        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#013954]"></div>
                    </div>
                )}

                {/* Error message */}
                {error && (
                    <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-8 mx-auto max-w-2xl">
                        <div className="flex">
                            <div className="flex-shrink-0">
                                <svg className="h-5 w-5 text-red-500" viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                                </svg>
                            </div>
                            <div className="ml-3">
                                <p className="text-red-700">{error}</p>
                            </div>
                        </div>
                    </div>
                )}

                {/* Empty state */}
                {!loading && !error && competitions.length === 0 && (
                    <div className="text-center py-12">
                        <FaTrophy className="mx-auto text-gray-300 text-5xl mb-4" />
                        <h3 className="text-xl font-semibold text-gray-500 mb-1">No competitions available</h3>
                        <p className="text-gray-400">Check back later for upcoming competitions</p>
                    </div>
                )}

                {/* Competitions grid - responsive: 1 column on mobile, 2 on tablet, 4 on desktop */}
                {!loading && !error && competitions.length > 0 && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                        <AnimatePresence>
                            {visibleCompetitions.map((competition, index) => (
                                <motion.div
                                    key={`${competition._id}-${index}`}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{
                                        duration: 0.5,
                                        delay: index >= visibleCount - 4 ? 0.1 * (index % 4) : 0
                                    }}
                                    className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-xl transition-all duration-300 border border-gray-100"
                                >
                                    {/* Competition image */}
                                    <div className="relative h-48 overflow-hidden">
                                        <img
                                            src={competition.thumbnail || "https://images.unsplash.com/photo-1504639725590-34d0984388bd?ixlib=rb-4.0.3&auto=format&fit=crop&w=1074&q=80"}
                                            alt={competition.title}
                                            className="w-full h-full object-cover transform hover:scale-105 transition-all duration-700"
                                        />
                                        <div className="absolute top-0 left-0 bg-[#f99e1c] text-white px-3 py-1 text-sm font-medium rounded-br-lg">
                                            {competition.category}
                                        </div>
                                        <div className="absolute inset-0 bg-gradient-to-t from-[#013954]/70 to-transparent opacity-0 hover:opacity-100 transition-opacity duration-300"></div>
                                    </div>

                                    {/* Competition info */}
                                    <div className="p-5">
                                        <h3 className="text-lg font-semibold text-[#013954] mb-3 line-clamp-2 h-14">
                                            {competition.title}
                                        </h3>

                                        <div className="space-y-2 mb-4">
                                            <div className="flex items-center text-gray-600">
                                                <FaCalendarAlt className="mr-2 text-[#f99e1c]" size={14} />
                                                <span className="text-sm">
                                                    {formatDateRange(competition.startDate, competition.endDate)}
                                                </span>
                                            </div>

                                            <div className="flex items-center text-gray-600">
                                                <FaUsers className="mr-2 text-[#f99e1c]" size={14} />
                                                <span className="text-sm">
                                                    {competition.participants ? competition.participants.length : 0}+ Participants
                                                </span>
                                            </div>
                                        </div>

                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center bg-[#013954]/5 px-3 py-1 rounded-md">
                                                <FaTrophy className="mr-2 text-[#f99e1c]" size={14} />
                                                <span className="text-[#013954] text-sm font-medium">
                                                    {getPrizeValue(competition.prizes)}
                                                </span>
                                            </div>

                                            <Link
                                                to={`/competitions/${competition._id}`}
                                                className="bg-[#013954] hover:bg-[#013954]/90 text-white px-4 py-1 rounded-md text-sm font-medium shadow-sm transition-colors duration-200"
                                            >
                                                View Details
                                            </Link>
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </AnimatePresence>
                    </div>
                )}

                {/* Modified Show More/Less buttons - only show if there are competitions */}
                {!loading && !error && competitions.length > 0 && (
                    <div className="mt-10 text-center flex justify-center gap-4">
                        {hasMoreToShow && (
                            <motion.button
                                onClick={handleShowMoreClick}
                                className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-[#013954] text-white font-medium shadow-md hover:shadow-lg transition-all duration-300"
                                whileHover={{ y: -2 }}
                                whileTap={{ y: 0 }}
                            >
                                Show More <FaChevronDown className="text-[#f99e1c]" />
                            </motion.button>
                        )}

                        {visibleCount > 4 && (
                            <motion.button
                                onClick={handleShowLessClick}
                                className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-white text-[#013954] border-2 border-[#013954] font-medium shadow-md hover:shadow-lg transition-all duration-300"
                                whileHover={{ y: -2 }}
                                whileTap={{ y: 0 }}
                            >
                                Show Less <FaChevronUp className="text-[#f99e1c]" />
                            </motion.button>
                        )}
                    </div>
                )}
            </div>
        </section>
    );
};

export default OurCompetitions;
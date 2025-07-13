import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FaArrowRight, FaArrowLeft, FaComments, FaUsers, FaClock, FaExternalLinkAlt } from 'react-icons/fa';

const Discussion = () => {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [cardsToShow, setCardsToShow] = useState(4);
    const sliderRef = useRef(null);

    // Mock discussion data - replace with your actual data
    const discussions = [
        {
            id: 1,
            title: "Future of AI in Education",
            category: "Technology",
            participants: 156,
            lastActivity: "2 hours ago",
            comments: 38,
            color: "#4F46E5"
        },
        {
            id: 2,
            title: "Programming Best Practices",
            category: "Development",
            participants: 243,
            lastActivity: "5 hours ago",
            comments: 72,
            color: "#0891B2"
        },
        {
            id: 3,
            title: "Data Science Career Paths",
            category: "Career",
            participants: 198,
            lastActivity: "1 day ago",
            comments: 47,
            color: "#7C3AED"
        },
        {
            id: 4,
            title: "Web3 & Blockchain Technology",
            category: "Emerging Tech",
            participants: 167,
            lastActivity: "3 hours ago",
            comments: 29,
            color: "#0D9488"
        },
        {
            id: 5,
            title: "UX/UI Design Principles",
            category: "Design",
            participants: 132,
            lastActivity: "6 hours ago",
            comments: 41,
            color: "#DB2777"
        },
        {
            id: 6,
            title: "Mobile App Development",
            category: "Development",
            participants: 219,
            lastActivity: "2 days ago",
            comments: 53,
            color: "#9333EA"
        },
        {
            id: 7,
            title: "Cloud Computing Solutions",
            category: "Infrastructure",
            participants: 176,
            lastActivity: "12 hours ago",
            comments: 34,
            color: "#0284C7"
        },
        {
            id: 8,
            title: "Cybersecurity Challenges",
            category: "Security",
            participants: 225,
            lastActivity: "4 hours ago",
            comments: 67,
            color: "#4338CA"
        },
    ];

    // Responsive cards handling
    useEffect(() => {
        const handleResize = () => {
            if (window.innerWidth < 640) {
                setCardsToShow(1);
            } else if (window.innerWidth < 768) {
                setCardsToShow(2);
            } else if (window.innerWidth < 1024) {
                setCardsToShow(3);
            } else {
                setCardsToShow(4);
            }
        };

        handleResize(); // Initial check
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const maxIndex = Math.max(0, discussions.length - cardsToShow);

    // Navigation functions
    const nextSlide = () => {
        if (currentIndex < maxIndex) {
            setCurrentIndex(currentIndex + 1);
        } else {
            setCurrentIndex(0); // Loop back to start
        }
    };

    const prevSlide = () => {
        if (currentIndex > 0) {
            setCurrentIndex(currentIndex - 1);
        } else {
            setCurrentIndex(maxIndex); // Loop to end
        }
    };

    // Handle "Show All" action
    const handleShowAll = () => {
        console.log("Show all discussions clicked");
        // Navigate to all discussions page
    };

    return (
        <section className="py-16 md:py-20 bg-white" id="discussions">
            <div className="container mx-auto px-4 md:px-6">
                {/* Header with title and show all button */}
                <div className="flex flex-col sm:flex-row justify-between sm:items-center mb-6 md:mb-8 gap-4">
                    <div>
                        <h2 className="text-2xl md:text-3xl font-bold text-[#013954]">Active Discussions</h2>
                        <div className="mt-2 w-20 h-1 bg-[#f99e1c]"></div>
                    </div>
                    <button
                        onClick={handleShowAll}
                        className="px-4 py-2 sm:px-6 bg-[#013954] text-white rounded-md hover:bg-[#013954]/90 transition-all duration-300 flex items-center gap-2 self-start sm:self-auto"
                    >
                        Show All
                        <FaExternalLinkAlt size={14} />
                    </button>
                </div>

                {/* Discussions slider container */}
                <div className="relative">
                    {/* Left arrow - hidden on small screens */}
                    <button
                        onClick={prevSlide}
                        className="absolute -left-3 md:-left-5 top-1/2 transform -translate-y-1/2 z-10 bg-white text-[#013954] hover:text-[#f99e1c] p-2 md:p-4 rounded-full shadow-lg transition-all duration-300 hidden sm:block"
                        aria-label="Previous slide"
                    >
                        <FaArrowLeft size={16} />
                    </button>

                    {/* Slider */}
                    <div className="overflow-hidden" ref={sliderRef}>
                        <motion.div
                            className="flex gap-3 md:gap-6"
                            animate={{ x: -currentIndex * (100 / cardsToShow) + '%' }}
                            transition={{ type: "spring", stiffness: 300, damping: 30 }}
                        >
                            {discussions.map((discussion) => (
                                <motion.div
                                    key={discussion.id}
                                    className="min-w-[calc(100%/1-6px)] sm:min-w-[calc(100%/2-6px)] md:min-w-[calc(100%/3-12px)] lg:min-w-[calc(100%/4-18px)] h-[220px] bg-white rounded-lg shadow-md overflow-hidden border border-gray-100"
                                    style={{
                                        width: `calc(${100 / cardsToShow}% - ${cardsToShow > 1 ? '18px' : '0px'})`
                                    }}
                                    whileHover={{ y: -5, boxShadow: "0 10px 30px -10px rgba(0,0,0,0.1)" }}
                                    transition={{ duration: 0.3 }}
                                >
                                    {/* Discussion card content */}
                                    <div className="p-4 md:p-5 flex flex-col h-full relative">
                                        {/* Category badge */}
                                        <div className="inline-block mb-2">
                                            <span className="px-2 py-1 bg-[#f99e1c]/10 text-[#f99e1c] rounded-full text-xs font-medium">
                                                {discussion.category}
                                            </span>
                                        </div>

                                        {/* Title */}
                                        <h3 className="text-lg font-semibold text-[#013954] mb-3 line-clamp-2">
                                            {discussion.title}
                                        </h3>

                                        {/* Activity bar - subtle visual indicator */}
                                        <div className="w-full h-1 bg-gray-100 mb-3 rounded">
                                            <div
                                                className="h-full rounded"
                                                style={{
                                                    width: `${Math.min(100, (discussion.comments / 80) * 100)}%`,
                                                    backgroundColor: '#f99e1c'
                                                }}
                                            ></div>
                                        </div>

                                        {/* Stats */}
                                        <div className="grid grid-cols-2 gap-2 mb-3 text-sm">
                                            <div className="flex items-center text-gray-600">
                                                <FaUsers className="mr-2 text-[#013954]/70" size={14} />
                                                <span>{discussion.participants}</span>
                                            </div>

                                            <div className="flex items-center text-gray-600">
                                                <FaComments className="mr-2 text-[#013954]/70" size={14} />
                                                <span>{discussion.comments}</span>
                                            </div>
                                        </div>

                                        <div className="mt-auto pt-2 border-t border-gray-100">
                                            <div className="flex justify-between items-center">
                                                <div className="flex items-center text-gray-500 text-xs">
                                                    <FaClock className="mr-1" size={12} />
                                                    <span>{discussion.lastActivity}</span>
                                                </div>

                                                <motion.button
                                                    whileHover={{ scale: 1.05 }}
                                                    whileTap={{ scale: 0.95 }}
                                                    className="text-sm font-medium text-[#f99e1c] hover:text-[#013954] transition-colors duration-300"
                                                >
                                                    Join
                                                </motion.button>
                                            </div>
                                        </div>

                                        {/* Decorative elements */}
                                        <div className="absolute top-0 right-0 h-12 w-12 overflow-hidden">
                                            <div
                                                className="absolute top-0 right-0 h-24 w-24 -mt-12 -mr-12 opacity-5 rounded-full"
                                                style={{ backgroundColor: discussion.color }}
                                            ></div>
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </motion.div>
                    </div>

                    {/* Right arrow - hidden on small screens */}
                    <button
                        onClick={nextSlide}
                        className="absolute -right-3 md:-right-5 top-1/2 transform -translate-y-1/2 z-10 bg-white text-[#013954] hover:text-[#f99e1c] p-2 md:p-4 rounded-full shadow-lg transition-all duration-300 hidden sm:block"
                        aria-label="Next slide"
                    >
                        <FaArrowRight size={16} />
                    </button>
                </div>

                {/* Dots indicator - more prominent on mobile */}
                <div className="flex justify-center mt-6 md:mt-10 space-x-2">
                    {Array.from({ length: maxIndex + 1 }).map((_, index) => (
                        <button
                            key={index}
                            onClick={() => setCurrentIndex(index)}
                            className={`h-2 md:h-2 rounded-full transition-all ${currentIndex === index
                                    ? "w-8 bg-[#f99e1c]"
                                    : "w-2 bg-gray-200"
                                }`}
                            aria-label={`Go to slide ${index + 1}`}
                        />
                    ))}
                </div>

                {/* Mobile navigation buttons */}
                <div className="flex justify-center gap-4 mt-4 sm:hidden">
                    <button
                        onClick={prevSlide}
                        className="bg-[#013954] text-white p-3 rounded-full shadow-md"
                        aria-label="Previous slide"
                    >
                        <FaArrowLeft size={16} />
                    </button>
                    <button
                        onClick={nextSlide}
                        className="bg-[#013954] text-white p-3 rounded-full shadow-md"
                        aria-label="Next slide"
                    >
                        <FaArrowRight size={16} />
                    </button>
                </div>
            </div>
        </section>
    );
};

export default Discussion;
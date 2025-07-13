import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FaArrowRight, FaArrowLeft, FaStar, FaUser } from 'react-icons/fa';

const Elementry = () => {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [cardsToShow, setCardsToShow] = useState(4);
    const sliderRef = useRef(null);

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

    // Mock course data - replace with your actual data
    const courses = [
        {
            id: 1,
            title: "Introduction to Python Programming",
            category: "Computer Science",
            rating: 4.8,
            students: 15423,
            image: "https://images.unsplash.com/photo-1526379095098-d400fd0bf935?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1074&q=80"
        },
        {
            id: 2,
            title: "Machine Learning Fundamentals",
            category: "Data Science",
            rating: 4.9,
            students: 12189,
            image: "https://images.unsplash.com/photo-1515879218367-8466d910aaa4?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1169&q=80"
        },
        {
            id: 3,
            title: "Web Development Bootcamp",
            category: "Web Development",
            rating: 4.7,
            students: 18564,
            image: "https://images.unsplash.com/photo-1547658719-da2b51169166?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1064&q=80"
        },
        {
            id: 4,
            title: "Data Structures & Algorithms",
            category: "Computer Science",
            rating: 4.6,
            students: 10876,
            image: "https://images.unsplash.com/photo-1504868584819-f8e8b4b6d7e3?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1076&q=80"
        },
        {
            id: 5,
            title: "Artificial Intelligence Essentials",
            category: "AI & ML",
            rating: 4.9,
            students: 7865,
            image: "https://images.unsplash.com/photo-1531746790731-6c087fecd65a?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1006&q=80"
        },
        {
            id: 6,
            title: "Cloud Computing Foundations",
            category: "DevOps",
            rating: 4.7,
            students: 9432,
            image: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1172&q=80"
        },
        {
            id: 7,
            title: "Cyber Security Fundamentals",
            category: "Security",
            rating: 4.8,
            students: 11258,
            image: "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1170&q=80"
        },
        {
            id: 8,
            title: "Mobile App Development with React Native",
            category: "Mobile Development",
            rating: 4.5,
            students: 8765,
            image: "https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1170&q=80"
        }
    ];

    const maxIndex = Math.max(0, courses.length - cardsToShow);

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
        // Navigate to all courses page
        console.log("Show all courses clicked");
        // In a real app, you'd use navigation here
        // navigate("/courses");
    };

    return (
        <section className="py-8 sm:py-12 md:py-16 bg-white">
            <div className="container mx-auto px-4 md:px-6">
                {/* Header with title and show all button */}
                <div className="flex flex-col sm:flex-row justify-between sm:items-center mb-6 md:mb-10 gap-4">
                    <div>
                        <h2 className="text-2xl md:text-3xl font-bold text-[#013954]">Featured Elementary Courses</h2>
                        <div className="mt-2 w-20 h-1 bg-[#f99e1c]"></div>
                    </div>
                    <button
                        onClick={handleShowAll}
                        className="px-4 py-2 sm:px-6 bg-[#013954] text-white rounded-md hover:bg-[#013954]/90 transition-all duration-300 flex items-center self-start sm:self-auto"
                    >
                        Show All
                        <FaArrowRight className="ml-2" />
                    </button>
                </div>

                {/* Courses slider container */}
                <div className="relative">
                    {/* Left arrow - hidden on small screens */}
                    <button
                        onClick={prevSlide}
                        className="absolute -left-3 md:-left-4 top-1/2 transform -translate-y-1/2 z-10 bg-white text-[#013954] hover:text-[#f99e1c] p-2 md:p-3 rounded-full shadow-lg transition-all duration-300 hidden sm:block"
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
                            {courses.map((course) => (
                                <div
                                    key={course.id}
                                    className="min-w-[calc(100%/1-6px)] sm:min-w-[calc(100%/2-6px)] md:min-w-[calc(100%/3-12px)] lg:min-w-[calc(100%/4-18px)] bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-all duration-300"
                                    style={{
                                        width: `calc(${100 / cardsToShow}% - ${cardsToShow > 1 ? '18px' : '0px'})`
                                    }}
                                >
                                    {/* Course image */}
                                    <div className="relative h-40 md:h-48 overflow-hidden">
                                        <img
                                            src={course.image}
                                            alt={course.title}
                                            className="w-full h-full object-cover transform hover:scale-105 transition-all duration-700"
                                        />
                                        <div className="absolute top-0 left-0 bg-[#f99e1c] text-white px-2 md:px-3 py-1 text-xs md:text-sm font-medium">
                                            {course.category}
                                        </div>
                                    </div>

                                    {/* Course info */}
                                    <div className="p-3 md:p-5">
                                        <h3 className="text-base md:text-lg font-semibold text-[#013954] mb-2 line-clamp-2 h-12 md:h-14">
                                            {course.title}
                                        </h3>

                                        <div className="flex justify-between items-center mt-3 md:mt-4">
                                            <div className="flex items-center">
                                                <FaStar className="text-[#f99e1c] mr-1" size={14} />
                                                <span className="font-medium text-sm md:text-base">{course.rating}</span>
                                            </div>

                                            <div className="flex items-center text-gray-500 text-xs md:text-sm">
                                                <FaUser className="mr-1" size={12} />
                                                <span>{(course.students / 1000).toFixed(1)}k students</span>
                                            </div>
                                        </div>

                                        <button className="mt-3 md:mt-4 w-full py-1.5 md:py-2 border-2 border-[#013954] text-[#013954] text-sm md:text-base font-medium rounded-md hover:bg-[#013954] hover:text-white transition-colors duration-300">
                                            View Course
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </motion.div>
                    </div>

                    {/* Right arrow - hidden on small screens */}
                    <button
                        onClick={nextSlide}
                        className="absolute -right-3 md:-right-4 top-1/2 transform -translate-y-1/2 z-10 bg-white text-[#013954] hover:text-[#f99e1c] p-2 md:p-3 rounded-full shadow-lg transition-all duration-300 hidden sm:block"
                        aria-label="Next slide"
                    >
                        <FaArrowRight size={16} />
                    </button>
                </div>

                {/* Dots indicator */}
                <div className="flex justify-center mt-6 md:mt-8 space-x-2">
                    {Array.from({ length: maxIndex + 1 }).map((_, index) => (
                        <button
                            key={index}
                            onClick={() => setCurrentIndex(index)}
                            className={`h-2 rounded-full transition-all ${currentIndex === index ? "w-8 bg-[#f99e1c]" : "w-2 bg-gray-300"
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

export default Elementry;
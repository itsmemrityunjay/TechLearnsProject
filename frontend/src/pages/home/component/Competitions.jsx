import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FaArrowRight, FaArrowLeft, FaTrophy, FaCalendarAlt, FaUsers } from 'react-icons/fa';

const Competitions = () => {
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

    // Mock competition data - replace with your actual data
    const competitions = [
        {
            id: 1,
            title: "National Coding Championship",
            category: "Programming",
            date: "May 15-18, 2023",
            participants: "2,500+",
            prize: "₹50,000",
            image: "https://images.unsplash.com/photo-1504639725590-34d0984388bd?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1074&q=80"
        },
        {
            id: 2,
            title: "AI Solutions Hackathon",
            category: "Artificial Intelligence",
            date: "June 10-12, 2023",
            participants: "1,800+",
            prize: "₹75,000",
            image: "https://images.unsplash.com/photo-1551434678-e076c223a692?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1170&q=80"
        },
        {
            id: 3,
            title: "Data Science Challenge",
            category: "Data Analytics",
            date: "July 5-8, 2023",
            participants: "3,200+",
            prize: "₹60,000",
            image: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1115&q=80"
        },
        {
            id: 4,
            title: "Web Development Showdown",
            category: "Web Tech",
            date: "August 20-22, 2023",
            participants: "2,100+",
            prize: "₹45,000",
            image: "https://images.unsplash.com/photo-1522071820081-009f0129c71c?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1170&q=80"
        },
        {
            id: 5,
            title: "Mobile App Innovation Contest",
            category: "Mobile Development",
            date: "September 15-17, 2023",
            participants: "1,950+",
            prize: "₹55,000",
            image: "https://images.unsplash.com/photo-1551434678-e076c223a692?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1170&q=80"
        },
        {
            id: 6,
            title: "Cybersecurity CTF Challenge",
            category: "Security",
            date: "October 8-10, 2023",
            participants: "1,500+",
            prize: "₹65,000",
            image: "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1074&q=80"
        },
        {
            id: 7,
            title: "Blockchain Innovation Summit",
            category: "Blockchain",
            date: "November 12-14, 2023",
            participants: "1,200+",
            prize: "₹80,000",
            image: "https://images.unsplash.com/photo-1561489413-985b06da5bee?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1170&q=80"
        },
        {
            id: 8,
            title: "IoT Solutions Challenge",
            category: "IoT",
            date: "December 5-7, 2023",
            participants: "1,400+",
            prize: "₹70,000",
            image: "https://images.unsplash.com/photo-1573164713988-8665fc963095?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1169&q=80"
        }
    ];

    const maxIndex = Math.max(0, competitions.length - cardsToShow);

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
        console.log("Show all competitions clicked");
        // In a real app, you'd use navigation here
        // navigate("/competitions");
    };

    return (
        <section className="py-12 md:py-16 lg:py-20 bg-gray-50" id="competitions">
            <div className="container mx-auto px-4 md:px-6">
                {/* Header with title and show all button */}
                <div className="flex flex-col sm:flex-row justify-between sm:items-center mb-6 md:mb-10 gap-4">
                    <div>
                        <h2 className="text-2xl md:text-3xl font-bold text-[#013954]">Upcoming Competitions</h2>
                        <div className="mt-2 w-20 h-1 bg-[#f99e1c]"></div>
                    </div>
                    <button
                        onClick={handleShowAll}
                        className="px-4 py-2 sm:px-6 bg-[#013954] text-white rounded-md hover:bg-[#013954]/90 transition-all duration-300 flex items-center gap-2 shadow-md self-start sm:self-auto"
                    >
                        Show All
                        <FaArrowRight />
                    </button>
                </div>

                {/* Competitions slider container */}
                <div className="relative">
                    {/* Left arrow - hidden on small screens */}
                    <button
                        onClick={prevSlide}
                        className="absolute -left-3 md:-left-5 top-1/2 transform -translate-y-1/2 z-10 bg-white text-[#013954] hover:text-[#f99e1c] hover:bg-white/95 p-2 md:p-3 rounded-full shadow-lg transition-all duration-300 hidden sm:block"
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
                            {competitions.map((competition) => (
                                <div
                                    key={competition.id}
                                    className="min-w-[calc(100%/1-6px)] sm:min-w-[calc(100%/2-6px)] md:min-w-[calc(100%/3-12px)] lg:min-w-[calc(100%/4-18px)] bg-white rounded-xl shadow-md overflow-hidden hover:shadow-xl transition-all duration-300 border border-gray-100"
                                    style={{
                                        width: `calc(${100 / cardsToShow}% - ${cardsToShow > 1 ? '18px' : '0px'})`
                                    }}
                                >
                                    {/* Competition image */}
                                    <div className="relative h-36 md:h-44 overflow-hidden">
                                        <img
                                            src={competition.image}
                                            alt={competition.title}
                                            className="w-full h-full object-cover transform hover:scale-105 transition-all duration-700"
                                        />
                                        <div className="absolute top-0 left-0 bg-[#f99e1c] text-white px-2 md:px-4 py-1 text-xs md:text-sm font-medium rounded-br-lg">
                                            {competition.category}
                                        </div>
                                        <div className="absolute inset-0 bg-gradient-to-t from-[#013954]/70 to-transparent opacity-0 hover:opacity-100 transition-opacity duration-300"></div>
                                    </div>

                                    {/* Competition info */}
                                    <div className="p-3 md:p-5">
                                        <h3 className="text-base md:text-lg font-semibold text-[#013954] mb-2 md:mb-3 line-clamp-2 h-12 md:h-14">
                                            {competition.title}
                                        </h3>

                                        <div className="space-y-1 md:space-y-2 mb-3 md:mb-4">
                                            <div className="flex items-center text-gray-600">
                                                <FaCalendarAlt className="mr-2 text-[#f99e1c]" size={12} />
                                                <span className="text-xs md:text-sm">{competition.date}</span>
                                            </div>

                                            <div className="flex items-center text-gray-600">
                                                <FaUsers className="mr-2 text-[#f99e1c]" size={12} />
                                                <span className="text-xs md:text-sm">{competition.participants} Participants</span>
                                            </div>
                                        </div>

                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center bg-[#013954]/5 px-2 md:px-3 py-1 rounded-md">
                                                <FaTrophy className="mr-1 md:mr-2 text-[#f99e1c]" size={12} />
                                                <span className="text-[#013954] text-xs md:text-sm font-medium">{competition.prize}</span>
                                            </div>

                                            <motion.button
                                                whileHover={{ scale: 1.05 }}
                                                whileTap={{ scale: 0.95 }}
                                                className="bg-[#013954] hover:bg-[#013954]/90 text-white px-3 md:px-4 py-1 rounded-md text-xs md:text-sm font-medium shadow-sm"
                                            >
                                                Register
                                            </motion.button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </motion.div>
                    </div>

                    {/* Right arrow - hidden on small screens */}
                    <button
                        onClick={nextSlide}
                        className="absolute -right-3 md:-right-5 top-1/2 transform -translate-y-1/2 z-10 bg-white text-[#013954] hover:text-[#f99e1c] hover:bg-white/95 p-2 md:p-3 rounded-full shadow-lg transition-all duration-300 hidden sm:block"
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

export default Competitions;
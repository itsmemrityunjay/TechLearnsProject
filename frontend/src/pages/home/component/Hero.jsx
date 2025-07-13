import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FaArrowRight, FaGraduationCap, FaUserCheck, FaLaptopCode } from "react-icons/fa";

// Import any additional assets you need
import heroImage from '../../../assets/Right.svg';

const Hero = () => {
    const navigate = useNavigate();

    const handleGetStarted = () => {
        navigate('/login');
    };

    // Animation variants
    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.3,
                delayChildren: 0.2,
            }
        }
    };

    const itemVariants = {
        hidden: { y: 20, opacity: 0 },
        visible: {
            y: 0,
            opacity: 1,
            transition: { type: 'spring', stiffness: 100 }
        }
    };

    return (
        <div className="relative overflow-hidden bg-[#013954] text-white">
            {/* Abstract Animated Shapes */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0">
                <motion.div
                    className="absolute top-20 left-10 w-64 h-64 rounded-full bg-[#f99e1c] opacity-10 blur-3xl"
                    animate={{
                        scale: [1, 1.2, 1],
                        x: [0, 50, 0],
                        y: [0, 30, 0],
                    }}
                    transition={{
                        duration: 15,
                        repeat: Infinity,
                        repeatType: "reverse"
                    }}
                />
                <motion.div
                    className="absolute bottom-40 right-20 w-72 h-72 rounded-full bg-white opacity-5 blur-3xl"
                    animate={{
                        scale: [1, 1.1, 1],
                        x: [0, -30, 0],
                        y: [0, 50, 0],
                    }}
                    transition={{
                        duration: 18,
                        repeat: Infinity,
                        repeatType: "reverse"
                    }}
                />
                <motion.div
                    className="absolute top-60 right-40 w-48 h-48 rounded-full bg-[#f99e1c] opacity-10 blur-3xl"
                    animate={{
                        scale: [1, 1.3, 1],
                        x: [0, 40, 0],
                        y: [0, -50, 0],
                    }}
                    transition={{
                        duration: 20,
                        repeat: Infinity,
                        repeatType: "reverse"
                    }}
                />
            </div>

            {/* Content Container */}
            <div className='container mx-auto px-6 py-24 lg:py-32 flex flex-col lg:flex-row items-center justify-between relative z-10'>
                {/* Text Content */}
                <motion.div
                    className="lg:max-w-xl relative z-10"
                    variants={containerVariants}
                    initial="hidden"
                    animate="visible"
                >
                    <motion.div variants={itemVariants}>
                        <div className="inline-block px-4 py-2 bg-white/10 backdrop-blur-sm rounded-full mb-6 border border-white/20">
                            <p className="text-sm font-medium text-white flex items-center">
                                <span className="bg-[#f99e1c] text-white rounded-full p-1 mr-2">
                                    <FaGraduationCap size={12} />
                                </span>
                                The Future of Tech Learning
                            </p>
                        </div>
                    </motion.div>

                    <motion.h1
                        variants={itemVariants}
                        className="text-4xl lg:text-6xl font-bold leading-tight mb-6"
                    >
                        Master <span className="text-[#f99e1c]">New Skills</span> With TechLeaRNS
                    </motion.h1>

                    <motion.p
                        variants={itemVariants}
                        className="text-lg text-white/80 mb-10"
                    >
                        A premier learning platform equipping you with cutting-edge tech skills,
                        enhancing academic performance, and driving your professional growth.
                    </motion.p>

                    {/* Stats Row */}
                    <motion.div
                        variants={itemVariants}
                        className="grid grid-cols-3 gap-6 mb-10"
                    >
                        <div className="border-l-2 border-[#f99e1c] pl-4">
                            <p className="text-3xl font-bold text-white">42K+</p>
                            <p className="text-sm text-white/70">Students</p>
                        </div>
                        <div className="border-l-2 border-[#f99e1c] pl-4">
                            <p className="text-3xl font-bold text-white">500+</p>
                            <p className="text-sm text-white/70">Courses</p>
                        </div>
                        <div className="border-l-2 border-[#f99e1c] pl-4">
                            <p className="text-3xl font-bold text-white">99%</p>
                            <p className="text-sm text-white/70">Success Rate</p>
                        </div>
                    </motion.div>

                    {/* CTA Button */}
                    <motion.div variants={itemVariants} className="flex items-center gap-4">
                        <motion.button
                            onClick={handleGetStarted}
                            className="bg-[#f99e1c] hover:bg-[#f99e1c]/90 text-[#013954] font-semibold py-3 px-8 rounded-md flex items-center gap-2 shadow-lg hover:shadow-xl transition-all duration-300"
                            whileHover={{ scale: 1.03 }}
                            whileTap={{ scale: 0.98 }}
                        >
                            <span>Get Started Today</span>
                            <motion.span
                                className="bg-white p-2 rounded-full"
                                animate={{ x: [0, 5, 0] }}
                                transition={{ repeat: Infinity, duration: 1.5 }}
                            >
                                <FaArrowRight className="text-[#013954]" size={14} />
                            </motion.span>
                        </motion.button>

                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.98 }}
                            className="text-white border border-white/30 hover:border-[#f99e1c] bg-white/5 backdrop-blur-sm font-medium py-3 px-8 rounded-md transition-all duration-300"
                        >
                            Explore Courses
                        </motion.button>
                    </motion.div>
                </motion.div>

                {/* Hero Image/Illustration */}
                <motion.div
                    className="relative mt-16 lg:mt-0"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{
                        duration: 0.8,
                        delay: 0.5
                    }}
                >
                    <div className="absolute inset-0 bg-[#f99e1c]/20 rounded-full filter blur-3xl opacity-20"></div>

                    <motion.div
                        className="relative z-10 border-2 border-[#f99e1c]/20 bg-white/5 backdrop-blur-sm p-4 rounded-lg"
                        animate={{ y: [0, -10, 0] }}
                        transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
                    >
                        <img
                            src={heroImage}
                            alt="Learning platform illustration"
                            className="w-full max-w-lg mx-auto rounded-lg"
                        />

                        {/* Floating Feature Pills */}
                        <motion.div
                            className="absolute -left-8 top-1/4 bg-white text-[#013954] px-4 py-2 rounded-md shadow-lg flex items-center gap-2 border-l-4 border-[#f99e1c]"
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 1 }}
                        >
                            <FaLaptopCode className="text-[#f99e1c]" />
                            <span className="font-medium">Live Coding</span>
                        </motion.div>

                        <motion.div
                            className="absolute -right-6 top-2/3 bg-white text-[#013954] px-4 py-2 rounded-md shadow-lg flex items-center gap-2 border-l-4 border-[#f99e1c]"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 1.3 }}
                        >
                            <FaUserCheck className="text-[#f99e1c]" />
                            <span className="font-medium">Expert Mentors</span>
                        </motion.div>
                    </motion.div>
                </motion.div>
            </div>
        </div>
    );
};

export default Hero;
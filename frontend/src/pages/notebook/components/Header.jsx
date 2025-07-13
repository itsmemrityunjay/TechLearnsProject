import React from 'react';
import { motion } from 'framer-motion';
import { FaCode, FaLaptopCode, FaPlus, FaArrowRight } from 'react-icons/fa';
import { Link } from 'react-router-dom';

const Header = () => {
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
                                TechLearns Notebook IDE
                            </span>
                            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white leading-tight mb-4">
                                Code, Practice, <br className="hidden md:block" />
                                <span className="text-[#f99e1c]">Master Your Skills</span>
                            </h1>
                            <p className="text-white/80 text-base md:text-lg max-w-2xl mx-auto lg:mx-0">
                                Access our interactive coding environment to practice in multiple programming languages,
                                save your work, and build your programming portfolio.
                            </p>
                        </motion.div>



                        {/* Stats */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6, delay: 0.4 }}
                            className="mt-10 grid grid-cols-2 md:grid-cols-3 gap-4 max-w-md mx-auto lg:mx-0"
                        >
                            {[
                                { value: "12+", label: "Languages Supported" },
                                { value: "500+", label: "Code Snippets" },
                                { value: "24/7", label: "Cloud Access" }
                            ].map((stat, index) => (
                                <div key={index} className="bg-white/5 backdrop-blur-sm rounded-lg p-3 text-center">
                                    <div className="text-[#f99e1c] text-xl md:text-2xl font-bold">{stat.value}</div>
                                    <div className="text-white/70 text-sm">{stat.label}</div>
                                </div>
                            ))}
                        </motion.div>
                    </div>

                    {/* Right content - Code illustration */}
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
                                        {/* Code icon with glow */}
                                        <div className="absolute inset-0 bg-[#f99e1c] rounded-full filter blur-2xl opacity-30 scale-75"></div>
                                        <div className="relative bg-gradient-to-br from-[#f99e1c] to-[#f8b254] p-10 rounded-full shadow-lg">
                                            <FaLaptopCode className="w-32 h-32 text-white" />
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
                                        <span className="text-[#013954] font-medium text-sm">JavaScript</span>
                                    </div>
                                </div>

                                <div className="absolute bottom-10 right-5 bg-white/90 backdrop-blur-sm p-3 rounded-lg shadow-lg transform rotate-6">
                                    <div className="flex items-center gap-2">
                                        <div className="h-2 w-2 rounded-full bg-[#013954]"></div>
                                        <span className="text-[#013954] font-medium text-sm">Python</span>
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
        </section>
    );
};

export default Header;
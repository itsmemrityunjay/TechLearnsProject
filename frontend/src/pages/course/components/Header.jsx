import React from 'react';
import { motion } from 'framer-motion';
import { FaGraduationCap, FaBook, FaUserGraduate, FaArrowRight, FaCertificate } from 'react-icons/fa';
import { Link } from 'react-router-dom';
import SkillIndiaLogo from '../../../assets/skill-india.png'

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
                                NEP 2020 Aligned Courses
                            </span>
                            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white leading-tight mb-4">
                                Future-Ready <br className="hidden md:block" />
                                <span className="text-[#f99e1c]">Education & Skills</span>
                            </h1>
                            <p className="text-white/80 text-base md:text-lg max-w-2xl mx-auto lg:mx-0">
                                Discover industry-aligned courses designed according to the National Education Policy 2020,
                                enriched with Skill India certification to enhance your employability and career growth.
                            </p>
                        </motion.div>

                        {/* Skill India Partnership */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6, delay: 0.2 }}
                            className="mb-6 flex flex-col lg:flex-row items-center lg:items-start gap-4"
                        >
                            <div className="bg-white/10 backdrop-blur-sm p-4 rounded-xl border border-white/10 flex items-center">
                                {/* Skill India Logo */}
                                <div className="flex-shrink-0 h-16 w-16 mr-4 bg-white rounded-lg  flex items-center justify-center">
                                    <div className="relative w-full h-full">
                                        <div className="absolute inset-0 flex items-center justify-center">
                                            {/* <div className="w-8 h-8 border-4 border-[#FF9933] rounded-full"></div> */}
                                        </div>
                                        <div className="absolute inset-0 flex items-center justify-center">
                                            <div className="font-bold text-[#000080] text-xs"><img src={SkillIndiaLogo} alt="skillIndia" /></div>
                                        </div>
                                    </div>
                                </div>
                                <div className="text-left">
                                    <h3 className="text-white font-semibold text-sm">In Partnership with</h3>
                                    <p className="text-[#f99e1c] font-bold">Skill India Initiative</p>
                                    <p className="text-xs text-white/70">Ministry of Skill Development & Entrepreneurship</p>
                                </div>
                            </div>
                        </motion.div>

                        {/* CTA Button */}
                        {/* <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6, delay: 0.3 }}
                            className="mb-8"
                        >
                            <Link to="/courses/explore" className="inline-flex items-center px-5 py-3 bg-[#f99e1c] text-white rounded-lg font-medium hover:bg-[#e08e15] transition-colors">
                                Explore NEP Courses <FaArrowRight className="ml-2" />
                            </Link>
                        </motion.div> */}

                        {/* Stats */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6, delay: 0.4 }}
                            className="mt-10 grid grid-cols-2 md:grid-cols-3 gap-4 max-w-md mx-auto lg:mx-0"
                        >
                            {[
                                { value: "50+", label: "NEP Aligned Courses" },
                                { value: "100K+", label: "Certified Students" },
                                { value: "92%", label: "Placement Rate" }
                            ].map((stat, index) => (
                                <div key={index} className="bg-white/5 backdrop-blur-sm rounded-lg p-3 text-center">
                                    <div className="text-[#f99e1c] text-xl md:text-2xl font-bold">{stat.value}</div>
                                    <div className="text-white/70 text-sm">{stat.label}</div>
                                </div>
                            ))}
                        </motion.div>
                    </div>

                    {/* Right content - Course features */}
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
                                        {/* Graduation cap icon with glow */}
                                        <div className="absolute inset-0 bg-[#f99e1c] rounded-full filter blur-2xl opacity-30 scale-75"></div>
                                        <div className="relative bg-gradient-to-br from-[#f99e1c] to-[#f8b254] p-10 rounded-full shadow-lg">
                                            <FaGraduationCap className="w-32 h-32 text-white" />
                                        </div>
                                    </div>
                                </div>

                                {/* Decorative elements */}
                                <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -translate-x-8 -translate-y-10 blur-md"></div>
                                <div className="absolute bottom-0 left-0 w-24 h-24 bg-[#f99e1c]/10 rounded-full translate-x-4 translate-y-6 blur-md"></div>

                                {/* NEP Features */}
                                <div className="absolute top-5 left-5 bg-white/90 backdrop-blur-sm p-3 rounded-lg shadow-lg transform -rotate-6">
                                    <div className="flex items-center gap-2">
                                        <div className="h-2 w-2 rounded-full bg-[#f99e1c]"></div>
                                        <span className="text-[#013954] font-medium text-sm">Multidisciplinary</span>
                                    </div>
                                </div>

                                <div className="absolute bottom-10 right-5 bg-white/90 backdrop-blur-sm p-3 rounded-lg shadow-lg transform rotate-6">
                                    <div className="flex items-center gap-2">
                                        <div className="h-2 w-2 rounded-full bg-[#013954]"></div>
                                        <span className="text-[#013954] font-medium text-sm">Industry Partnership</span>
                                    </div>
                                </div>

                                {/* Additional NEP feature */}
                                <div className="absolute bottom-28 left-8 bg-white/90 backdrop-blur-sm p-3 rounded-lg shadow-lg transform -rotate-3">
                                    <div className="flex items-center gap-2">
                                        <div className="h-2 w-2 rounded-full bg-[#013954]"></div>
                                        <span className="text-[#013954] font-medium text-sm">Digital Learning</span>
                                    </div>
                                </div>
                            </div>

                            {/* Border accents */}
                            <div className="absolute -bottom-3 -right-3 h-24 w-24 border-r-2 border-b-2 border-[#f99e1c] rounded-br-xl z-0"></div>
                            <div className="absolute -top-3 -left-3 h-24 w-24 border-l-2 border-t-2 border-[#013954] rounded-tl-xl z-0"></div>
                        </div>
                    </motion.div>
                </div>

                {/* NEP Information */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.5 }}
                    className="mt-12 bg-white/5 p-6 rounded-xl backdrop-blur-sm"
                >
                    <h3 className="text-[#f99e1c] text-xl font-semibold mb-3">National Education Policy 2020</h3>
                    <p className="text-white/80 text-sm mb-4">
                        The NEP 2020 aims to transform India's education system by emphasizing flexibility,
                        multidisciplinary learning, critical thinking, and skill development. Our courses are
                        designed to align with these principles, offering learners practical knowledge and
                        industry-relevant skills.
                    </p>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                        {[
                            { icon: <FaUserGraduate />, text: "Holistic Development" },
                            { icon: <FaBook />, text: "Flexible Curriculum" },
                            { icon: <FaCertificate />, text: "Skill Certification" },
                            { icon: <FaGraduationCap />, text: "Learning Outcomes" }
                        ].map((item, index) => (
                            <div key={index} className="bg-white/10 p-3 rounded-lg">
                                <div className="text-[#f99e1c] flex justify-center mb-2">{item.icon}</div>
                                <div className="text-white text-sm">{item.text}</div>
                            </div>
                        ))}
                    </div>
                </motion.div>
            </div>
        </section>
    );
};

export default Header;
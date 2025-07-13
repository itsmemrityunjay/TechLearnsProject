import React from 'react';
import { motion } from 'framer-motion';
import { FaGraduationCap, FaHandshake, FaChartLine, FaUsers, FaLaptopCode, FaCertificate } from 'react-icons/fa';
import { Link } from 'react-router-dom';
// Import Skill India logo (create images folder if it doesn't exist)
import SkillIndiaLogo from '../../../assets/skill-india.png';

const SkillIndiaCourses = () => {
    // Animation variants
    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.2,
                delayChildren: 0.3
            }
        }
    };

    const itemVariants = {
        hidden: { y: 20, opacity: 0 },
        visible: { y: 0, opacity: 1, transition: { duration: 0.6 } }
    };

    return (
        <section className="py-16 bg-gradient-to-br from-gray-50 to-gray-100 overflow-hidden">
            <div className="container mx-auto px-4 md:px-6">


                {/* Heading */}
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.7 }}
                    className="text-center mb-12"
                >
                    <div className="flex justify-center mb-4">
                        <div className="bg-[#FF9933]/10 rounded-full p-3">
                            <FaGraduationCap size={32} className="text-[#FF9933]" />
                        </div>
                    </div>
                    <h2 className="text-3xl md:text-4xl font-bold text-[#013954] mb-4">
                        Empowering India's Youth Through <span className="text-[#f99e1c]">Skills</span>
                    </h2>
                    <div className="w-24 h-1 bg-[#f99e1c] mx-auto mb-6"></div>
                    {/* <p className="text-gray-600 max-w-2xl mx-auto">
                        In partnership with Skill India, we're building a future-ready workforce by bridging the gap between education and employability.
                    </p> */}
                </motion.div>

                {/* Skill India Logo Banner - ADDED THIS SECTION */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.7 }}
                    className="flex justify-center items-center mb-12"
                >
                    <div className="bg-white rounded-xl shadow-md p-6 flex flex-col md:flex-row items-center justify-center gap-6 w-full ">
                        {/* Left side - Logo */}
                        <div className="w-48 h-48 md:w-32 md:h-32 flex-shrink-0 relative">
                            {/* If you don't have the actual logo, replace with this placeholder */}
                            {/* Remove this conditional and keep only the img tag once you have the logo */}
                            {SkillIndiaLogo ? (
                                <img
                                    src={SkillIndiaLogo}
                                    alt="Skill India Logo"
                                    className="w-full h-full object-contain"
                                />
                            ) : (
                                <div className="w-full h-full flex flex-col items-center justify-center bg-white border-2 border-[#FF9933] rounded-lg p-2">
                                    <div className="w-full h-3/4 flex items-center justify-center">
                                        <div className="w-16 h-16 border-4 border-[#FF9933] rounded-full flex items-center justify-center">
                                            <div className="w-10 h-10 bg-[#FF9933]/20 rounded-full"></div>
                                        </div>
                                    </div>
                                    <div className="mt-2 text-center">
                                        <div className="text-[#FF9933] font-bold text-lg">SKILL INDIA</div>
                                        <div className="text-[#000080] text-xs">कौशल भारत</div>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Right side - Text */}
                        <div className="text-center md:text-left">
                            <h3 className="text-xl md:text-2xl font-bold text-[#013954]">
                                National Skill Development Mission
                            </h3>
                            <p className="text-sm md:text-base text-gray-600 mt-2">
                                An initiative by Ministry of Skill Development & Entrepreneurship, Government of India
                            </p>
                            <div className="mt-3 flex flex-wrap justify-center md:justify-start gap-2">
                                <span className="inline-block bg-[#FF9933]/10 text-[#FF9933] px-3 py-1 rounded-full text-xs font-medium">
                                    Official Partner
                                </span>
                                <span className="inline-block bg-[#013954]/10 text-[#013954] px-3 py-1 rounded-full text-xs font-medium">
                                    Certified Training
                                </span>
                            </div>
                        </div>
                    </div>
                </motion.div>

                {/* Vision & Mission */}
                <div className="grid md:grid-cols-2 gap-8 mb-16">
                    <motion.div
                        initial={{ opacity: 0, x: -30 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.7 }}
                        className="bg-white rounded-xl shadow-lg p-8 border-t-4 border-[#013954]"
                    >
                        <h3 className="text-xl font-bold text-[#013954] mb-4 flex items-center">
                            <span className="bg-[#013954]/10 p-2 rounded-full mr-3">
                                <FaHandshake className="text-[#013954]" />
                            </span>
                            Skill India Mission
                        </h3>
                        <p className="text-gray-600 mb-4">
                            The Skill India Mission, launched in 2015, aims to train over 400 million people in
                            India in different skills by 2022. It includes various initiatives like:
                        </p>
                        <ul className="space-y-2">
                            <li className="flex items-start">
                                <span className="text-[#f99e1c] mr-2">•</span>
                                <span className="text-gray-700">Pradhan Mantri Kaushal Vikas Yojana (PMKVY)</span>
                            </li>
                            <li className="flex items-start">
                                <span className="text-[#f99e1c] mr-2">•</span>
                                <span className="text-gray-700">National Skill Development Mission</span>
                            </li>
                            <li className="flex items-start">
                                <span className="text-[#f99e1c] mr-2">•</span>
                                <span className="text-gray-700">Skill Loan Scheme</span>
                            </li>
                            <li className="flex items-start">
                                <span className="text-[#f99e1c] mr-2">•</span>
                                <span className="text-gray-700">Rural India Skill</span>
                            </li>
                        </ul>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, x: 30 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.7 }}
                        className="bg-white rounded-xl shadow-lg p-8 border-t-4 border-[#f99e1c]"
                    >
                        <h3 className="text-xl font-bold text-[#013954] mb-4 flex items-center">
                            <span className="bg-[#f99e1c]/10 p-2 rounded-full mr-3">
                                <FaChartLine className="text-[#f99e1c]" />
                            </span>
                            Our Contribution
                        </h3>
                        <p className="text-gray-600 mb-4">
                            TechLearns is proud to be a part of this transformative journey by providing:
                        </p>
                        <ul className="space-y-2">
                            <li className="flex items-start">
                                <span className="text-[#013954] mr-2">•</span>
                                <span className="text-gray-700">Industry-aligned curriculum developed with top employers</span>
                            </li>
                            <li className="flex items-start">
                                <span className="text-[#013954] mr-2">•</span>
                                <span className="text-gray-700">Hands-on training with real-world projects</span>
                            </li>
                            <li className="flex items-start">
                                <span className="text-[#013954] mr-2">•</span>
                                <span className="text-gray-700">Nationally recognized certification</span>
                            </li>
                            <li className="flex items-start">
                                <span className="text-[#013954] mr-2">•</span>
                                <span className="text-gray-700">Placement assistance with 500+ partner companies</span>
                            </li>
                        </ul>
                    </motion.div>
                </div>

                {/* Statistics */}
                <motion.div
                    variants={containerVariants}
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true }}
                    className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-16"
                >
                    {[
                        { icon: <FaUsers className="text-[#f99e1c]" size={28} />, count: '50,000+', label: 'Students Trained' },
                        { icon: <FaLaptopCode className="text-[#013954]" size={28} />, count: '60+', label: 'Skill Courses' },
                        { icon: <FaHandshake className="text-[#f99e1c]" size={28} />, count: '500+', label: 'Industry Partners' },
                        { icon: <FaCertificate className="text-[#013954]" size={28} />, count: '85%', label: 'Placement Rate' },
                    ].map((stat, index) => (
                        <motion.div
                            key={index}
                            variants={itemVariants}
                            className="bg-white rounded-xl shadow-md p-6 text-center"
                        >
                            <div className="mb-3 flex justify-center">
                                {stat.icon}
                            </div>
                            <h4 className="text-2xl font-bold text-[#013954]">{stat.count}</h4>
                            <p className="text-gray-500 text-sm">{stat.label}</p>
                        </motion.div>
                    ))}
                </motion.div>

                {/* Our Approach */}
                <motion.div
                    initial={{ opacity: 0, y: 40 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.8 }}
                    className="bg-[#013954] rounded-2xl text-white p-8 md:p-12 relative overflow-hidden mb-16"
                >
                    {/* Background decorative elements */}
                    <div className="absolute top-0 right-0 w-64 h-64 bg-[#f99e1c]/10 rounded-full -translate-x-1/2 -translate-y-1/2 blur-3xl"></div>
                    <div className="absolute bottom-0 left-0 w-64 h-64 bg-[#f99e1c]/5 rounded-full translate-x-1/3 translate-y-1/3 blur-2xl"></div>

                    <div className="relative z-10">
                        <h3 className="text-2xl md:text-3xl font-bold mb-6">Our Approach to Skill Development</h3>
                        <p className="text-white/80 mb-8 max-w-3xl">
                            We believe in a holistic approach to skill development that combines theoretical knowledge with practical application,
                            industry exposure, and soft skills training to create well-rounded professionals ready for the workforce.
                        </p>

                        <div className="grid md:grid-cols-3 gap-6">
                            {[
                                {
                                    title: "Learn",
                                    description: "Structured curriculum designed by industry experts focusing on in-demand skills",
                                },
                                {
                                    title: "Practice",
                                    description: "Hands-on projects and lab exercises to apply knowledge to real-world scenarios",
                                },
                                {
                                    title: "Achieve",
                                    description: "Industry-recognized certification and placement support to kick-start careers",
                                }
                            ].map((step, index) => (
                                <div key={index} className="bg-white/10 backdrop-blur-sm p-6 rounded-lg">
                                    <span className="inline-block bg-[#f99e1c] text-white text-sm font-bold px-3 py-1 rounded-full mb-4">
                                        Step {index + 1}
                                    </span>
                                    <h4 className="text-xl font-semibold mb-3">{step.title}</h4>
                                    <p className="text-white/70">{step.description}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </motion.div>


            </div>
        </section>
    );
};

export default SkillIndiaCourses;
import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FaUserPlus, FaUserCircle, FaArrowRight } from 'react-icons/fa';
import Love from '../assets/love.svg';
import Sun from '../assets/Sun.svg';

const CTA = ({ isLoggedIn = false, userName = "" }) => {
    return (
        <section className="py-10 md:py-16 px-4 md:px-0">
            <div className="container mx-auto">
                <div className="relative bg-gradient-to-r from-[#013954] to-[#013954]/90 rounded-2xl overflow-hidden">
                    {/* Background decorative elements */}
                    <div className="absolute top-0 right-0 w-80 h-80 bg-[#f99e1c]/10 rounded-full -mr-20 -mt-20 blur-xl"></div>
                    <div className="absolute bottom-0 left-0 w-64 h-64 bg-[#f99e1c]/5 rounded-full -ml-10 -mb-10 blur-2xl"></div>

                    <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8 p-6 md:p-12">
                        {/* Left side - Text content */}
                        <div className="flex-1 text-white">
                            {isLoggedIn ? (
                                <>
                                    <h2 className="text-2xl md:text-3xl font-bold mb-2">
                                        Welcome back, <span className="text-[#f99e1c]">{userName || "Learner"}</span>!
                                    </h2>
                                    <p className="text-white/80 text-base md:text-lg mb-4">
                                        Continue your learning journey right where you left off. Check your progress and explore recommended courses.
                                    </p>
                                </>
                            ) : (
                                <>
                                    <h2 className="text-2xl md:text-3xl font-bold mb-2">
                                        Start Your Learning Journey <span className="text-[#f99e1c]">Today</span>
                                    </h2>
                                    <p className="text-white/80 text-base md:text-lg mb-4">
                                        Join thousands of students already learning with TechLeaRNS.
                                        Create your free account to track progress, save courses, and earn certificates.
                                    </p>
                                </>
                            )}

                            <div className="flex flex-col sm:flex-row gap-4">
                                {isLoggedIn ? (
                                    <Link to="/profile" className="inline-flex items-center justify-center bg-[#f99e1c] hover:bg-[#f99e1c]/90 text-white px-6 py-3 rounded-lg font-medium transition-colors duration-300 shadow-lg shadow-[#f99e1c]/20">
                                        <FaUserCircle className="mr-2" />
                                        Go to Profile
                                    </Link>
                                ) : (
                                    <>
                                        <Link to="/signup" className="inline-flex items-center justify-center bg-[#f99e1c] hover:bg-[#f99e1c]/90 text-white px-6 py-3 rounded-lg font-medium transition-colors duration-300 shadow-lg shadow-[#f99e1c]/20">
                                            <FaUserPlus className="mr-2" />
                                            Create Account
                                        </Link>
                                        <Link to="/login" className="inline-flex items-center justify-center bg-transparent hover:bg-white/10 text-white border border-white/30 px-6 py-3 rounded-lg font-medium transition-colors duration-300">
                                            Already have an account?
                                            <FaArrowRight className="ml-2" />
                                        </Link>
                                    </>
                                )}
                            </div>

                            {!isLoggedIn && (
                                <p className="mt-4 text-xs text-white/60">
                                    No credit card required. Start learning immediately.
                                </p>
                            )}
                        </div>

                        {/* Right side - Image/Graphic */}
                        <motion.div
                            className="flex-shrink-0 w-full md:w-1/3 max-w-xs"
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6 }}
                            viewport={{ once: true }}
                        >
                            <img
                                src={isLoggedIn
                                    ? Sun
                                    : Love
                                }
                                alt={isLoggedIn ? "Student profile" : "Student sign up"}
                                className="w-full h-[200px]"
                            />
                        </motion.div>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default CTA;
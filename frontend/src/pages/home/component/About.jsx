import React from 'react';
import { motion } from 'framer-motion';
import { FaGraduationCap, FaLaptopCode, FaUsers, FaChartLine } from 'react-icons/fa';

const About = () => {
    const fadeIn = {
        hidden: { opacity: 0, y: 20 },
        visible: {
            opacity: 1,
            y: 0,
            transition: { duration: 0.6 }
        }
    };

    return (
        <section className="py-20 bg-white" id="about">
            <div className="container mx-auto px-6">
                {/* Section Header */}
                <div className="mb-16 text-center">
                    <motion.div
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true, amount: 0.2 }}
                        variants={fadeIn}
                        className="inline-block"
                    >
                        <span className="text-sm font-semibold tracking-wider text-[#f99e1c] uppercase">Who We Are</span>
                        <h2 className="mt-2 text-4xl font-bold text-[#013954]">About TechLeaRNS</h2>
                        <div className="mt-2 mx-auto w-20 h-1 bg-[#f99e1c]"></div>
                    </motion.div>
                </div>

                {/* Main Content */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
                    {/* Left Side - Image and Statistics */}
                    <motion.div
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true, amount: 0.2 }}
                        variants={fadeIn}
                        className="relative"
                    >
                        <div className="relative">
                            <div className="absolute -top-4 -left-4 w-full h-full border-2 border-[#f99e1c] rounded-lg"></div>
                            <div className="relative z-10 overflow-hidden rounded-lg shadow-xl">
                                <img
                                    src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1171&q=80"
                                    alt="Students learning together"
                                    className="w-full h-auto object-cover"
                                />
                            </div>
                        </div>

                        {/* Stats */}
                        <div className="grid grid-cols-2 gap-4 mt-8">
                            {[
                                { icon: <FaUsers />, count: '45,000+', label: 'Students', color: '#f99e1c' },
                                { icon: <FaGraduationCap />, count: '500+', label: 'Courses', color: '#013954' },
                                { icon: <FaLaptopCode />, count: '100+', label: 'Expert Mentors', color: '#013954' },
                                { icon: <FaChartLine />, count: '96%', label: 'Success Rate', color: '#f99e1c' }
                            ].map((stat, index) => (
                                <div key={index} className="bg-white p-4 rounded-lg shadow-md border-t-2" style={{ borderColor: stat.color }}>
                                    <div className="text-gray-500 mb-2" style={{ color: stat.color }}>{stat.icon}</div>
                                    <h3 className="text-2xl font-bold text-[#013954]">{stat.count}</h3>
                                    <p className="text-sm text-gray-600">{stat.label}</p>
                                </div>
                            ))}
                        </div>
                    </motion.div>

                    {/* Right Side - Text Content */}
                    <motion.div
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true, amount: 0.2 }}
                        variants={fadeIn}
                    >
                        <h3 className="text-2xl font-semibold text-[#013954] mb-6">
                            Empowering Through <span className="text-[#f99e1c]">Education</span>
                        </h3>

                        <p className="text-gray-700 mb-6 leading-relaxed">
                            TechLearns is a premier online learning platform dedicated to equipping individuals with cutting-edge technical skills and knowledge. Founded in 2020, we've grown to become a trusted educational resource for students, professionals, and organizations worldwide.
                        </p>

                        <p className="text-gray-700 mb-10 leading-relaxed">
                            Our mission is to make quality technical education accessible to everyone, regardless of their background or prior knowledge. We believe in the power of education to transform lives and create opportunities.
                        </p>

                        {/* Features */}
                        <div className="space-y-4">
                            {[
                                { title: "Expert-Led Instruction", description: "Learn from industry professionals with years of practical experience" },
                                { title: "Hands-On Learning", description: "Apply concepts through real-world projects and interactive exercises" },
                                { title: "Flexible Learning Path", description: "Study at your own pace with lifetime access to course materials" },
                            ].map((feature, index) => (
                                <div key={index} className="flex items-start">
                                    <div className="flex-shrink-0 h-6 w-6 rounded-full bg-[#f99e1c]/20 flex items-center justify-center mt-1">
                                        <div className="h-3 w-3 rounded-full bg-[#f99e1c]"></div>
                                    </div>
                                    <div className="ml-4">
                                        <h4 className="text-lg font-medium text-[#013954]">{feature.title}</h4>
                                        <p className="text-gray-600">{feature.description}</p>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* CTA Button */}
                        <motion.button
                            whileHover={{ scale: 1.03 }}
                            whileTap={{ scale: 0.97 }}
                            className="mt-10 px-8 py-3 bg-[#013954] hover:bg-[#013954]/90 text-white rounded-lg transition-all duration-300 shadow-lg flex items-center space-x-2"
                        >
                            <span>Learn More About Us</span>
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                            </svg>
                        </motion.button>
                    </motion.div>
                </div>
            </div>
        </section>
    );
};

export default About;
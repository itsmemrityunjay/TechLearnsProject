import React from 'react';
import { motion } from 'framer-motion';
import { FaGraduationCap, FaLaptopCode, FaRocket, FaPuzzlePiece, FaChartLine } from 'react-icons/fa';

const NEP = () => {
    const fadeIn = {
        hidden: { opacity: 0, y: 20 },
        visible: {
            opacity: 1,
            y: 0,
            transition: { duration: 0.6 }
        }
    };

    return (
        <section className="py-20 bg-gray-50" id="nep-alignment">
            <div className="container mx-auto px-6">
                {/* Section Header */}
                <motion.div
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true, amount: 0.2 }}
                    variants={fadeIn}
                    className="mb-16 text-center max-w-3xl mx-auto"
                >
                    <div className="inline-block mb-3">
                        <span className="px-4 py-1 bg-[#013954]/5 text-[#013954] rounded-full text-sm font-medium">National Education Policy 2020</span>
                    </div>

                    <h2 className="text-4xl font-bold text-[#013954] mb-4">
                        Aligned with <span className="text-[#f99e1c]">NEP 2020</span> Vision
                    </h2>

                    <p className="text-gray-600">
                        TechLearns embraces the principles of India's National Education Policy 2020,
                        providing learners with flexible, skill-based education that nurtures curiosity and creativity.
                    </p>
                </motion.div>

                {/* Main Content - Split Layout */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
                    {/* Left Side - Image Grid with Overlays */}
                    <motion.div
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true, amount: 0.2 }}
                        variants={fadeIn}
                        className="relative"
                    >
                        <div className="grid grid-cols-2 gap-4 relative">
                            {/* Decorative elements */}
                            <div className="absolute -top-3 -left-3 h-24 w-24 border-l-2 border-t-2 border-[#013954] rounded-tl-xl z-10"></div>
                            <div className="absolute -bottom-3 -right-3 h-24 w-24 border-r-2 border-b-2 border-[#f99e1c] rounded-br-xl z-10"></div>

                            {/* Main large image */}
                            <motion.div
                                className="col-span-2 rounded-lg overflow-hidden shadow-lg h-64 relative"
                                whileHover={{ boxShadow: "0 0 20px rgba(0, 0, 0, 0.5)" }}
                                transition={{ duration: 0.3 }}
                            >
                                <img
                                    src="https://images.unsplash.com/photo-1571260899304-425eee4c7efd?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1170&q=80"
                                    alt="NEP 2020 Vision"
                                    className="w-full h-full object-cover"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-[#013954]/90 to-transparent"></div>
                                <div className="absolute bottom-0 left-0 p-4 text-white">
                                    <h3 className="font-bold text-xl mb-1">NEP 2020 Vision</h3>
                                    <p className="text-sm text-white/80">Transforming education through innovation</p>
                                </div>

                                {/* NEP Badge */}
                                <div className="absolute top-4 right-4 bg-[#f99e1c] text-white px-3 py-1 rounded-full text-sm font-bold shadow-lg">
                                    NEP 2020
                                </div>
                            </motion.div>

                            {/* Smaller images */}
                            <motion.div
                                className="rounded-lg overflow-hidden shadow-lg h-44 relative"
                                whileHover={{ boxShadow: "0 0 5px rgba(0, 0, 0, 0.2)" }}
                                transition={{ duration: 0.3 }}
                            >
                                <img
                                    src="https://images.unsplash.com/photo-1509062522246-3755977927d7?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1232&q=80"
                                    alt="Flexible learning paths"
                                    className="w-full h-full object-cover"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-[#013954]/80 to-transparent"></div>
                                <div className="absolute bottom-0 left-0 p-3 text-white">
                                    <h3 className="font-bold text-sm">Flexible Learning Paths</h3>
                                </div>
                            </motion.div>

                            <motion.div
                                className="rounded-lg overflow-hidden shadow-lg h-44 relative"
                                whileHover={{ boxShadow: "0 0 20px rgba(0, 0, 0, 0.5)" }}
                                transition={{ duration: 0.3 }}
                            >
                                <img
                                    src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1171&q=80"
                                    alt="Student-centric approach"
                                    className="w-full h-full object-cover"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-[#013954]/80 to-transparent"></div>
                                <div className="absolute bottom-0 left-0 p-3 text-white">
                                    <h3 className="font-bold text-sm">Student-Centric Approach</h3>
                                </div>
                            </motion.div>




                        </div>

                        {/* TechLeaRNS integration card */}
                        <motion.div
                            className="mt-6 bg-white rounded-lg shadow-lg border-t-4 border-[#f99e1c] p-4"
                            initial={{ y: 20, opacity: 0 }}
                            whileInView={{ y: 0, opacity: 1 }}
                            transition={{ delay: 0.7 }}
                        >
                            <div className="flex items-start">
                                <div className="h-10 w-10 rounded-md bg-[#013954] text-white flex items-center justify-center flex-shrink-0">
                                    <FaGraduationCap size={20} />
                                </div>
                                <div className="ml-3">
                                    <h4 className="font-bold text-[#013954]">TechLeaRNS Implementation</h4>
                                    <p className="text-sm text-gray-600 mt-1">Our platform seamlessly integrates NEP 2020 principles into every learning experience, creating pathways for young learners to explore and excel.</p>
                                </div>
                            </div>
                        </motion.div>
                    </motion.div>

                    {/* Right Side - Key Points */}
                    <motion.div
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true, amount: 0.2 }}
                        variants={{
                            hidden: { opacity: 0 },
                            visible: {
                                opacity: 1,
                                transition: {
                                    staggerChildren: 0.2
                                }
                            }
                        }}
                    >
                        <h3 className="text-2xl font-semibold text-[#013954] mb-6">
                            How TechLearns <span className="text-[#f99e1c]">Implements</span> NEP 2020 Principles
                        </h3>

                        <div className="space-y-6">
                            {[
                                {
                                    icon: <FaPuzzlePiece />,
                                    title: "Multidisciplinary Learning",
                                    description: "Courses that integrate multiple disciplines, allowing students to explore connections between different fields."
                                },
                                {
                                    icon: <FaRocket />,
                                    title: "Competency-Based Education",
                                    description: "Focus on skill acquisition and practical application rather than memorization, aligning with NEP's emphasis on outcome-based learning."
                                },
                                {
                                    icon: <FaLaptopCode />,
                                    title: "Digital Literacy & Computational Thinking",
                                    description: "Programming and tech courses designed specifically for young learners, preparing them for the digital future."
                                },
                                {
                                    icon: <FaChartLine />,
                                    title: "Continuous Assessment",
                                    description: "Formative assessment methods that help identify strengths and areas for improvement, matching NEP's vision for holistic progress tracking."
                                }
                            ].map((item, index) => (
                                <motion.div
                                    key={index}
                                    variants={fadeIn}
                                    className="flex items-start p-4 bg-white rounded-lg shadow-sm border-l-2 hover:border-l-4 hover:shadow-md transition-all duration-300"
                                    style={{ borderColor: index % 2 === 0 ? '#f99e1c' : '#013954' }}
                                >
                                    <div className="flex-shrink-0 h-10 w-10 rounded-full flex items-center justify-center"
                                        style={{ backgroundColor: index % 2 === 0 ? '#f99e1c' : '#013954' }}>
                                        <span className="text-white">
                                            {React.cloneElement(item.icon, { size: 18 })}
                                        </span>
                                    </div>
                                    <div className="ml-4">
                                        <h4 className="font-medium text-[#013954]">{item.title}</h4>
                                        <p className="text-gray-600 text-sm mt-1">{item.description}</p>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </motion.div>
                </div>

                {/* Bottom Quote Section */}
                <motion.div
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true, amount: 0.2 }}
                    variants={fadeIn}
                    className="mt-16 bg-gradient-to-r from-[#013954] to-[#013954]/90 rounded-lg p-8 shadow-lg relative overflow-hidden"
                >
                    <div className="absolute top-0 right-0 w-64 h-64 bg-[#f99e1c]/20 rounded-full -mr-32 -mt-32 blur-3xl"></div>
                    <div className="absolute bottom-0 left-0 w-64 h-64 bg-[#f99e1c]/10 rounded-full -ml-32 -mb-32 blur-3xl"></div>

                    <div className="relative z-10 text-center">
                        <FaGraduationCap className="mx-auto mb-4 text-[#f99e1c]" size={36} />
                        <blockquote className="text-white text-xl italic max-w-3xl mx-auto">
                            "The aim of education is not knowledge alone, but action. TechLeaRNS empowers young minds to take action by providing education that aligns with their interests and the nation's educational vision."
                        </blockquote>
                        <div className="mt-4 w-16 h-1 bg-[#f99e1c] mx-auto"></div>

                    </div>
                </motion.div>
            </div>
        </section>
    );
};

export default NEP;
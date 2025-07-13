import React from 'react';
import { motion } from 'framer-motion';
import SkillIndiaImage from '../../../assets/SkillIndia.png'
import SkillIndiaLogo from '../../../assets/skill-india.png'
import { FaHandshake, FaGraduationCap, FaLaptopCode, FaChartLine, FaUserTie } from 'react-icons/fa';

const SkillIndia = () => {
    const fadeIn = {
        hidden: { opacity: 0, y: 20 },
        visible: {
            opacity: 1,
            y: 0,
            transition: { duration: 0.6 }
        }
    };

    return (
        <section className="py-20 bg-white" id="skill-india">
            <div className="container mx-auto px-6">
                {/* Section Header */}
                <motion.div
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true, amount: 0.2 }}
                    variants={fadeIn}
                    className="mb-16 text-center max-w-3xl mx-auto"
                >
                    <div className="flex items-center justify-center gap-3 mb-4">
                        <div className="h-1 w-12 bg-[#f99e1c]"></div>
                        <span className="text-sm font-semibold text-[#013954] uppercase tracking-wider">National Initiative</span>
                        <div className="h-1 w-12 bg-[#f99e1c]"></div>
                    </div>

                    {/* Added Skill India Logo */}
                    <div className="flex justify-center mb-6">
                        <img
                            src={SkillIndiaLogo}
                            alt="Skill India Logo"
                            className="h-auto w-32"
                        />
                    </div>

                    <h2 className="text-4xl font-bold text-[#013954] mb-4">Empowering India's Youth with <span className="text-[#f99e1c]">Skills</span></h2>

                    <p className="text-gray-600">TechLeaRNS proudly supports the Skill India mission by providing cutting-edge technical education aligned with industry demands.</p>
                </motion.div>

                {/* Main Content */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
                    {/* Left Side - Image with overlay */}
                    <motion.div
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true, amount: 0.2 }}
                        variants={fadeIn}
                    >
                        <h3 className="text-2xl font-semibold text-[#013954] mb-6">
                            TechLearns: <span className="text-[#f99e1c]">Advancing</span> the Vision
                        </h3>

                        <p className="text-gray-700 mb-6 leading-relaxed">
                            TechLearns is committed to supporting the Skill India mission by equipping India's youth with industry-relevant technical skills. Our platform bridges the gap between traditional education and workplace requirements, creating a skilled workforce ready for the digital economy.
                        </p>

                        {/* Features */}
                        <div className="space-y-6 mb-8">
                            {[
                                {
                                    icon: <FaLaptopCode />,
                                    title: "Industry-Aligned Curriculum",
                                    description: "Courses designed with input from industry leaders to ensure relevant skill development"
                                },
                                {
                                    icon: <FaUserTie />,
                                    title: "Expert Mentorship",
                                    description: "Learn from professionals with years of industry experience across various tech domains"
                                },
                                {
                                    icon: <FaChartLine />,
                                    title: "Skill Assessment & Certification",
                                    description: "Comprehensive evaluation aligned with National Skills Qualification Framework"
                                },
                            ].map((feature, index) => (
                                <div key={index} className="flex items-start">
                                    <div className="flex-shrink-0 h-12 w-12 rounded-md bg-[#013954] text-[#f99e1c] flex items-center justify-center">
                                        {React.cloneElement(feature.icon, { size: 24 })}
                                    </div>
                                    <div className="ml-4">
                                        <h4 className="text-lg font-medium text-[#013954]">{feature.title}</h4>
                                        <p className="text-gray-600">{feature.description}</p>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Stats in Cards */}
                        <div className="flex flex-wrap gap-4 mt-8">
                            <div className="flex-1 min-w-[140px] border-l-4 border-[#f99e1c] bg-gray-50 p-4 shadow-sm">
                                <p className="text-gray-500 text-sm">Courses aligned with</p>
                                <h4 className="text-xl font-bold text-[#013954]">NSQF Standards</h4>
                            </div>
                            <div className="flex-1 min-w-[140px] border-l-4 border-[#013954] bg-gray-50 p-4 shadow-sm">
                                <p className="text-gray-500 text-sm">Focus on</p>
                                <h4 className="text-xl font-bold text-[#f99e1c]">Practical Learning</h4>
                            </div>
                        </div>
                    </motion.div>


                    {/* Right Side - Text Content */}
                    <motion.div
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true, amount: 0.2 }}
                        variants={fadeIn}
                        className="relative"
                    >
                        <div className="relative h-full">
                            {/* Decorative elements */}
                            <div className="absolute -top-4 -left-4 h-full w-full border-t-2 border-l-2 border-[#f99e1c] rounded-tl-lg"></div>
                            <div className="absolute -bottom-4 -right-4 h-full w-full border-b-2 border-r-2 border-[#013954] rounded-br-lg"></div>

                            {/* Main image */}
                            <div className="relative z-10 overflow-hidden rounded-lg shadow-xl">
                                <img
                                    src={SkillIndiaImage}
                                    alt="Skill India Initiative"
                                    className="w-full h-full object-cover"
                                />

                                {/* Color overlay */}
                                <div className="absolute inset-0 bg-gradient-to-tr from-[#013954]/80 to-transparent"></div>

                                {/* Text overlay */}
                                <div className="absolute bottom-0 left-0 p-6 text-white">
                                    <h3 className="text-2xl font-bold mb-2">Skill India Mission</h3>
                                    <p className="text-sm text-white/90">Launched by the Government of India to empower youth with employable skills</p>
                                </div>

                                {/* Added collaboration badge with logo */}
                                <div className="absolute top-4 right-4 bg-white/90 rounded-lg p-2 shadow-lg">
                                    <img
                                        src={SkillIndiaLogo}
                                        alt="Skill India Logo"
                                        className="h-auto w-32"
                                    />
                                </div>
                            </div>
                        </div>
                    </motion.div>

                </div>


            </div>
        </section>
    );
};

export default SkillIndia;
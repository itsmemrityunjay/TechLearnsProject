import React from 'react';
import { motion } from 'framer-motion';
import { FaTrophy, FaUsers, FaLightbulb, FaBrain, FaChartLine, FaRocket, FaRegHandshake } from 'react-icons/fa';

const Benefit = () => {
    // Benefits data array for easy mapping
    const benefitsData = [
        {
            icon: <FaLightbulb className="text-3xl" />,
            title: "Practical Skill Development",
            description: "Apply theoretical knowledge to solve real-world challenges and develop hands-on technical skills that employers value.",
            highlightText: "hands-on technical skills",
            accentColor: "bg-[#013954]"
        },
        {
            icon: <FaUsers className="text-3xl" />,
            title: "Networking Opportunities",
            description: "Connect with industry professionals, mentors, and like-minded peers to build valuable professional relationships.",
            highlightText: "valuable professional relationships",
            accentColor: "bg-[#f99e1c]"
        },
        {
            icon: <FaTrophy className="text-3xl" />,
            title: "Resume Enhancement",
            description: "Competition achievements stand out on your resume, demonstrating initiative and setting you apart from other candidates.",
            highlightText: "setting you apart",
            accentColor: "bg-[#013954]"
        },
        {
            icon: <FaBrain className="text-3xl" />,
            title: "Problem-Solving Under Pressure",
            description: "Learn to think critically and make decisions quickly, developing adaptability and resilience essential in tech careers.",
            highlightText: "adaptability and resilience",
            accentColor: "bg-[#f99e1c]"
        },
        {
            icon: <FaRocket className="text-3xl" />,
            title: "Career Acceleration",
            description: "Competitions can fast-track your career growth by providing exposure to cutting-edge technologies and industry practices.",
            highlightText: "fast-track your career growth",
            accentColor: "bg-[#013954]"
        },
        {
            icon: <FaRegHandshake className="text-3xl" />,
            title: "Industry Recognition",
            description: "Get noticed by top companies and organizations that sponsor and monitor tech competitions for emerging talent.",
            highlightText: "noticed by top companies",
            accentColor: "bg-[#f99e1c]"
        }
    ];

    return (
        <section className="py-16 md:py-24 bg-gradient-to-b from-white to-gray-50 overflow-hidden">
            {/* Container */}
            <div className="container mx-auto px-4 relative">
                {/* Decorative elements */}
                <div className="absolute top-0 left-0 w-64 h-64 bg-[#f99e1c]/5 rounded-full -translate-x-1/2 -translate-y-1/2 blur-3xl"></div>
                <div className="absolute bottom-0 right-0 w-64 h-64 bg-[#013954]/5 rounded-full translate-x-1/2 translate-y-1/2 blur-3xl"></div>

                {/* Section header */}
                <div className="text-center mb-16 relative z-10">
                    <motion.h2
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6 }}
                        viewport={{ once: true }}
                        className="text-3xl md:text-4xl lg:text-5xl font-bold text-[#013954] inline-block relative pb-4"
                    >
                        Why Competitions Matter
                        <span className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-20 h-1 bg-[#f99e1c] rounded-full"></span>
                    </motion.h2>

                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.2 }}
                        viewport={{ once: true }}
                        className="mt-6 max-w-3xl mx-auto text-lg text-gray-600"
                    >
                        Participating in tech competitions provides invaluable opportunities for
                        growth and advancement in your professional journey.
                    </motion.p>
                </div>

                {/* Benefits grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 relative z-10">
                    {benefitsData.map((benefit, index) => (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5, delay: 0.1 * index }}
                            viewport={{ once: true }}
                            className="bg-white rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100 group"
                        >
                            {/* Card top accent line */}
                            <div className={`h-1.5 w-full ${benefit.accentColor}`}></div>

                            <div className="p-8">
                                {/* Icon */}
                                <div className={`${benefit.accentColor} text-white rounded-full w-16 h-16 flex items-center justify-center mb-6 transform group-hover:scale-110 transition-transform duration-300`}>
                                    {benefit.icon}
                                </div>

                                {/* Content */}
                                <h3 className="text-xl font-bold text-[#013954] mb-4">{benefit.title}</h3>
                                <p className="text-gray-600 leading-relaxed">
                                    {benefit.description.replace(benefit.highlightText,
                                        `**${benefit.highlightText}**`
                                    ).split('**').map((text, i) =>
                                        i % 2 === 0 ? text :
                                            <span key={i} className="text-[#f99e1c] font-semibold">{text}</span>
                                    )}
                                </p>
                            </div>
                        </motion.div>
                    ))}
                </div>

                {/* Bottom CTA */}
            </div>
        </section>
    );
};

export default Benefit;
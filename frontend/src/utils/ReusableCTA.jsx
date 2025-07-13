import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FaArrowRight, FaCode, FaGraduationCap, FaComments, FaTrophy } from 'react-icons/fa';

const ReusableCTA = ({
    title = "Ready to take the next step?",
    description = "Join our community and enhance your learning experience.",
    buttonText = "Get Started",
    redirectTo = "/",
    variant = "primary",
    withIcon = true,
    iconType = "default"
}) => {
    // Icon mapping based on iconType
    const getIcon = () => {
        switch (iconType) {
            case 'competition': return <FaTrophy className="w-5 h-5" />;
            case 'course': return <FaGraduationCap className="w-5 h-5" />;
            case 'discussion': return <FaComments className="w-5 h-5" />;
            case 'code': return <FaCode className="w-5 h-5" />;
            default: return <FaArrowRight className="w-5 h-5" />;
        }
    };

    // Style variants for different contexts
    const variants = {
        primary: "bg-gradient-to-r from-[#013954] to-[#025d82] text-white",
        secondary: "bg-gradient-to-r from-[#f99e1c] to-[#f8b75c] text-white",
        light: "bg-white text-[#013954] border border-gray-200",
        dark: "bg-gray-900 text-white",
        subtle: "bg-gray-50 text-[#013954] border border-gray-200"
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className={`rounded-xl overflow-hidden shadow-md ${variants[variant]} my-8`}
        >
            <div className="container mx-auto px-6 py-10 md:py-12">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                    <div className="mb-6 md:mb-0 md:pr-8">
                        <motion.h3
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.2 }}
                            className="text-2xl font-bold mb-2"
                        >
                            {title}
                        </motion.h3>
                        <motion.p
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.3 }}
                            className={`${variant.includes('light') || variant === 'subtle' ? 'text-gray-600' : 'text-gray-100'} max-w-md`}
                        >
                            {description}
                        </motion.p>
                    </div>

                    <motion.div
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                    >
                        <Link
                            to={redirectTo}
                            className={`inline-flex items-center px-6 py-3 rounded-lg shadow-sm font-medium transition duration-300 ease-in-out
                ${variant === 'primary' ? 'bg-[#f99e1c] hover:bg-[#e08200] text-white' :
                                    variant === 'secondary' ? 'bg-[#013954] hover:bg-[#012d44] text-white' :
                                        variant === 'light' ? 'bg-[#013954] hover:bg-[#012d44] text-white' :
                                            variant === 'dark' ? 'bg-[#f99e1c] hover:bg-[#e08200] text-white' :
                                                'bg-[#013954] hover:bg-[#012d44] text-white'}`}
                        >
                            <span>{buttonText}</span>
                            {withIcon && (
                                <span className="ml-2">
                                    {getIcon()}
                                </span>
                            )}
                        </Link>
                    </motion.div>
                </div>
            </div>
        </motion.div>
    );
};

export default ReusableCTA;
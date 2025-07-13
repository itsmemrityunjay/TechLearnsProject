import React from 'react';
import { motion } from 'framer-motion';
import { FaFileUpload, FaCheck, FaCrown, FaShieldAlt, FaQuestion } from 'react-icons/fa';
import { Link } from 'react-router-dom';

const BelowPoverty = () => {
    // Animation variants
    const fadeIn = {
        hidden: { opacity: 0, y: 20 },
        visible: {
            opacity: 1,
            y: 0,
            transition: { duration: 0.6 }
        }
    };

    return (
        <section className="py-16 bg-gray-50">
            <div className="container mx-auto px-4 md:px-6">
                {/* Header */}
                <motion.div
                    className="text-center max-w-3xl mx-auto mb-12"
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true }}
                    variants={fadeIn}
                >
                    <span className="inline-block px-4 py-1 bg-[#013954]/10 text-[#013954] rounded-full text-sm font-medium mb-3">
                        Inclusive Education Initiative
                    </span>
                    <h2 className="text-3xl md:text-4xl font-bold text-[#013954] mb-4">
                        Premium Access for <span className="text-[#f99e1c]">Below Poverty Line</span> Families
                    </h2>
                    <p className="text-gray-600 md:text-lg">
                        At TechLearns, we believe quality education should be accessible to everyone, regardless of economic status.
                        If your family holds a BPL (Below Poverty Line) ration card, you're eligible for free premium access.
                    </p>
                </motion.div>

                {/* Main content */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12 mb-12">
                    {/* Left column - Benefits */}
                    <motion.div
                        className="md:col-span-1"
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true }}
                        variants={fadeIn}
                    >
                        <div className="bg-white p-6 rounded-xl shadow-md">
                            <h3 className="text-xl font-bold text-[#013954] mb-4 flex items-center">
                                <FaCrown className="text-[#f99e1c] mr-2" /> Premium Benefits
                            </h3>

                            <ul className="space-y-3">
                                {[
                                    "Full access to all courses and learning materials",
                                    "Personalized learning paths and mentorship",
                                    "Downloadable resources and offline access",
                                    "Priority support and doubt resolution",
                                    "Official certificates upon course completion",
                                    "Access to live workshops and webinars"
                                ].map((benefit, index) => (
                                    <li key={index} className="flex items-start">
                                        <FaCheck className="text-[#f99e1c] mt-1 mr-2 flex-shrink-0" />
                                        <span className="text-gray-700">{benefit}</span>
                                    </li>
                                ))}
                            </ul>

                            <div className="mt-6 bg-[#013954]/5 p-4 rounded-lg">
                                <p className="text-[#013954] text-sm font-medium">
                                    Regular premium subscription value: <span className="line-through">₹1,499/month</span>
                                </p>
                                <p className="text-[#f99e1c] font-bold text-lg mt-1">
                                    Your cost: ₹0/month
                                </p>
                            </div>
                        </div>
                    </motion.div>

                    {/* Middle column - Process */}
                    <motion.div
                        className="md:col-span-2"
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true }}
                        variants={fadeIn}
                    >
                        <div className="bg-white p-6 rounded-xl shadow-md h-full">
                            <h3 className="text-xl font-bold text-[#013954] mb-6">Simple Verification Process</h3>

                            <div className="space-y-6">
                                {[
                                    {
                                        step: "1",
                                        title: "Create an account",
                                        description: "Sign up for a free TechLeaRNS account with your basic information."
                                    },
                                    {
                                        step: "2",
                                        title: "Upload your ration card",
                                        description: "Take a clear photo or scan of your BPL ration card and upload it securely to our system."
                                    },
                                    {
                                        step: "3",
                                        title: "Brief verification period",
                                        description: "Our team will verify your document within 2-3 business days."
                                    },
                                    {
                                        step: "4",
                                        title: "Receive premium access",
                                        description: "Once verified, we'll upgrade your account to premium status and notify you via email."
                                    }
                                ].map((step, index) => (
                                    <div key={index} className="flex">
                                        <div className="flex-shrink-0 h-10 w-10 rounded-full bg-[#013954] text-white flex items-center justify-center font-bold">
                                            {step.step}
                                        </div>
                                        <div className="ml-4">
                                            <h4 className="font-medium text-lg text-[#013954]">{step.title}</h4>
                                            <p className="text-gray-600">{step.description}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <Link to="/upload-documents" className="mt-8 inline-flex items-center justify-center bg-[#f99e1c] hover:bg-[#f99e1c]/90 text-white px-6 py-3 rounded-lg font-medium transition-all duration-300 w-full sm:w-auto">
                                <FaFileUpload className="mr-2" />
                                Upload Ration Card
                            </Link>
                        </div>
                    </motion.div>
                </div>

                {/* FAQs */}
                {/* <motion.div
                    className="bg-white p-6 md:p-8 rounded-xl shadow-md"
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true }}
                    variants={fadeIn}
                >
                    <h3 className="text-xl font-bold text-[#013954] mb-6">Frequently Asked Questions</h3>

                    <div className="space-y-6">
                        {[
                            {
                                question: "What types of ration cards are eligible?",
                                answer: "Any official government-issued BPL (Below Poverty Line) ration card is eligible. This includes Antyodaya cards and Priority Household cards categorized under BPL."
                            },
                            {
                                question: "Is my information secure?",
                                answer: "Absolutely. We use industry-standard encryption and secure storage methods. Your documents are only accessed by our verification team and are never shared with third parties."
                            },
                            {
                                question: "How long does the verification process take?",
                                answer: "Typically 2-3 business days. In case of high volume, it might take up to 5 business days. You'll receive email updates throughout the process."
                            },
                            {
                                question: "What if my application is rejected?",
                                answer: "If your application isn't approved, we'll explain why and suggest alternatives or additional documents that might help. You can reapply with updated information."
                            }
                        ].map((faq, index) => (
                            <div key={index} className="border-b border-gray-100 pb-4 last:border-b-0 last:pb-0">
                                <h4 className="font-medium text-[#013954] flex items-center mb-2">
                                    <FaQuestion className="text-[#f99e1c] mr-2 flex-shrink-0" />
                                    {faq.question}
                                </h4>
                                <p className="text-gray-600 pl-6">{faq.answer}</p>
                            </div>
                        ))}
                    </div>
                </motion.div> */}

                {/* Bottom note */}
                {/* <motion.div
                    className="text-center max-w-2xl mx-auto mt-10"
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true }}
                    variants={fadeIn}
                >
                    <div className="flex items-center justify-center mb-4">
                        <FaShieldAlt className="text-[#013954] text-xl mr-2" />
                        <h4 className="font-medium text-[#013954]">Data Privacy Assurance</h4>
                    </div>
                    <p className="text-gray-600 text-sm">
                        We value your privacy and handle your sensitive information with utmost care. Your documentation is securely stored,
                        used only for verification purposes, and protected by our strict privacy protocols. For more information,
                        please review our <Link to="/privacy-policy" className="text-[#f99e1c] hover:underline">Privacy Policy</Link>.
                    </p>
                </motion.div> */}
            </div>
        </section>
    );
};

export default BelowPoverty;
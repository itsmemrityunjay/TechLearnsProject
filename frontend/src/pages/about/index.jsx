import React from 'react';
import { motion } from 'framer-motion';
import {
    FaGraduationCap,
    FaLaptopCode,
    FaUsers,
    FaChartLine,
    FaAward,
    FaGlobe,
    FaLightbulb,
    FaRocket,
    FaHeart,
    FaShieldAlt,
    FaClock,
    FaBookOpen,
    FaUserGraduate,
    FaHandshake,
    FaStar,
    FaTrophy,
    FaMedal,
    FaCertificate
} from 'react-icons/fa';
import {
    Target,
    Zap,
    TrendingUp,
    Globe,
    Users,
    BookOpen,
    Award,
    Heart,
    Shield,
    Clock,
    Star
} from 'lucide-react';

const About = () => {
    // Animation variants
    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.2,
                delayChildren: 0.1,
            }
        }
    };

    const itemVariants = {
        hidden: { y: 30, opacity: 0 },
        visible: {
            y: 0,
            opacity: 1,
            transition: { type: 'spring', stiffness: 100 }
        }
    };

    const fadeInUp = {
        hidden: { opacity: 0, y: 50 },
        visible: {
            opacity: 1,
            y: 0,
            transition: { duration: 0.8 }
        }
    };

    const stats = [
        { icon: <Users className="w-8 h-8" />, count: '45,000+', label: 'Active Students', color: '#f99e1c' },
        { icon: <BookOpen className="w-8 h-8" />, count: '500+', label: 'Expert Courses', color: '#013954' },
        { icon: <Award className="w-8 h-8" />, count: '100+', label: 'Expert Mentors', color: '#013954' },
        { icon: <TrendingUp className="w-8 h-8" />, count: '96%', label: 'Success Rate', color: '#f99e1c' }
    ];

    const values = [
        {
            icon: <FaLightbulb className="w-8 h-8" />,
            title: "Innovation",
            description: "We constantly innovate our teaching methods and curriculum to stay ahead of industry trends."
        },
        {
            icon: <FaHeart className="w-8 h-8" />,
            title: "Passion",
            description: "Our passion for education drives us to deliver exceptional learning experiences."
        },
        {
            icon: <FaShieldAlt className="w-8 h-8" />,
            title: "Quality",
            description: "We maintain the highest standards of educational quality and content excellence."
        },
        {
            icon: <FaHandshake className="w-8 h-8" />,
            title: "Community",
            description: "Building a supportive community where learners grow together and succeed."
        }
    ];

    const achievements = [
        { icon: <FaTrophy />, title: "Best EdTech Platform 2023", description: "Awarded by Tech Education Association" },
        { icon: <FaMedal />, title: "Excellence in Online Learning", description: "Recognized for innovative teaching methods" },
        { icon: <FaCertificate />, title: "ISO 9001:2015 Certified", description: "Quality management system certified" },
        { icon: <FaStar />, title: "4.9/5 Student Rating", description: "Consistently high student satisfaction" }
    ];

    const team = [
        {
            name: "Dr. Sarah Johnson",
            role: "Chief Academic Officer",
            image: "https://images.unsplash.com/photo-1494790108755-2616b612b786?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=687&q=80",
            description: "PhD in Computer Science with 15+ years in EdTech"
        },
        {
            name: "Michael Chen",
            role: "Head of Technology",
            image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1170&q=80",
            description: "Former Google engineer with expertise in AI/ML"
        },
        {
            name: "Emily Rodriguez",
            role: "Director of Student Success",
            image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1170&q=80",
            description: "Specialist in student engagement and career development"
        }
    ];

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Hero Section */}
            <section className="relative overflow-hidden bg-gradient-to-br from-[#013954] via-[#013954] to-[#025a7a] text-white">
                {/* Animated Background Elements */}
                <div className="absolute inset-0 overflow-hidden">
                    <motion.div
                        className="absolute top-20 left-10 w-64 h-64 rounded-full bg-[#f99e1c] opacity-10 blur-3xl"
                        animate={{
                            scale: [1, 1.2, 1],
                            x: [0, 50, 0],
                            y: [0, 30, 0],
                        }}
                        transition={{
                            duration: 15,
                            repeat: Infinity,
                            repeatType: "reverse"
                        }}
                    />
                    <motion.div
                        className="absolute bottom-40 right-20 w-72 h-72 rounded-full bg-white opacity-5 blur-3xl"
                        animate={{
                            scale: [1, 1.1, 1],
                            x: [0, -30, 0],
                            y: [0, 50, 0],
                        }}
                        transition={{
                            duration: 18,
                            repeat: Infinity,
                            repeatType: "reverse"
                        }}
                    />
                </div>

                <div className="container mx-auto px-6 py-24 lg:py-32 relative z-10">
                    <motion.div
                        variants={containerVariants}
                        initial="hidden"
                        animate="visible"
                        className="text-center max-w-4xl mx-auto"
                    >
                        <motion.div variants={itemVariants}>
                            <div className="inline-block px-6 py-3 bg-white/10 backdrop-blur-sm rounded-full mb-8 border border-white/20">
                                <p className="text-lg font-medium text-white flex items-center justify-center">
                                    <span className="bg-[#f99e1c] text-white rounded-full p-2 mr-3">
                                        <FaGraduationCap size={20} />
                                    </span>
                                    About TechLearns Academy
                                </p>
                            </div>
                        </motion.div>

                        <motion.h1
                            variants={itemVariants}
                            className="text-5xl lg:text-7xl font-bold leading-tight mb-8"
                        >
                            Empowering <span className="text-[#f99e1c]">Future</span> Tech Leaders
                        </motion.h1>

                        <motion.p
                            variants={itemVariants}
                            className="text-xl text-white/90 mb-12 leading-relaxed"
                        >
                            TechLearns Academy is a premier online learning platform dedicated to transforming
                            education through cutting-edge technology, expert mentorship, and innovative learning experiences.
                        </motion.p>

                        {/* Stats Row */}
                        <motion.div
                            variants={itemVariants}
                            className="grid grid-cols-2 lg:grid-cols-4 gap-8"
                        >
                            {stats.map((stat, index) => (
                                <div key={index} className="text-center">
                                    <div className="flex justify-center mb-4">
                                        <div
                                            className="p-4 rounded-full bg-white/10 backdrop-blur-sm border border-white/20"
                                            style={{ color: stat.color }}
                                        >
                                            {stat.icon}
                                        </div>
                                    </div>
                                    <h3 className="text-3xl font-bold text-white mb-2">{stat.count}</h3>
                                    <p className="text-white/80">{stat.label}</p>
                                </div>
                            ))}
                        </motion.div>
                    </motion.div>
                </div>
            </section>

            {/* Mission & Vision Section */}
            <section className="py-20 bg-white">
                <div className="container mx-auto px-6">
                    <motion.div
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true, amount: 0.2 }}
                        variants={containerVariants}
                        className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center"
                    >
                        {/* Mission */}
                        <motion.div variants={itemVariants}>
                            <div className="bg-gradient-to-br from-[#013954] to-[#025a7a] text-white p-8 rounded-2xl shadow-xl">
                                <div className="flex items-center mb-6">
                                    <div className="bg-[#f99e1c] p-3 rounded-full mr-4">
                                        <Target className="w-8 h-8 text-white" />
                                    </div>
                                    <h3 className="text-2xl font-bold">Our Mission</h3>
                                </div>
                                <p className="text-lg leading-relaxed text-white/90">
                                    To democratize quality technical education by providing accessible,
                                    affordable, and industry-relevant learning experiences that empower
                                    individuals to achieve their career goals and contribute to the digital economy.
                                </p>
                            </div>
                        </motion.div>

                        {/* Vision */}
                        <motion.div variants={itemVariants}>
                            <div className="bg-gradient-to-br from-[#f99e1c] to-[#ffb347] text-white p-8 rounded-2xl shadow-xl">
                                <div className="flex items-center mb-6">
                                    <div className="bg-white p-3 rounded-full mr-4">
                                        <Zap className="w-8 h-8 text-[#f99e1c]" />
                                    </div>
                                    <h3 className="text-2xl font-bold">Our Vision</h3>
                                </div>
                                <p className="text-lg leading-relaxed text-white/90">
                                    To become the world's leading platform for technical education,
                                    fostering innovation, creativity, and excellence in learning while
                                    building a global community of skilled professionals.
                                </p>
                            </div>
                        </motion.div>
                    </motion.div>
                </div>
            </section>

            {/* Story Section */}
            <section className="py-20 bg-gray-50">
                <div className="container mx-auto px-6">
                    <motion.div
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true, amount: 0.2 }}
                        variants={containerVariants}
                        className="text-center mb-16"
                    >
                        <motion.div variants={itemVariants}>
                            <span className="text-sm font-semibold tracking-wider text-[#f99e1c] uppercase">Our Story</span>
                            <h2 className="mt-2 text-4xl font-bold text-[#013954]">The TechLearns Journey</h2>
                            <div className="mt-2 mx-auto w-20 h-1 bg-[#f99e1c]"></div>
                        </motion.div>
                    </motion.div>

                    <motion.div
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true, amount: 0.2 }}
                        variants={containerVariants}
                        className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center"
                    >
                        <motion.div variants={itemVariants}>
                            <div className="relative">
                                <div className="absolute -top-4 -left-4 w-full h-full border-2 border-[#f99e1c] rounded-lg"></div>
                                <div className="relative z-10 overflow-hidden rounded-lg shadow-xl">
                                    <img
                                        src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1171&q=80"
                                        alt="TechLearns team working together"
                                        className="w-full h-auto object-cover"
                                    />
                                </div>
                            </div>
                        </motion.div>

                        <motion.div variants={itemVariants}>
                            <h3 className="text-3xl font-bold text-[#013954] mb-6">
                                From <span className="text-[#f99e1c]">Vision</span> to Reality
                            </h3>
                            <div className="space-y-6">
                                <div className="flex items-start">
                                    <div className="flex-shrink-0 h-8 w-8 rounded-full bg-[#f99e1c] flex items-center justify-center mt-1">
                                        <span className="text-white font-bold">2020</span>
                                    </div>
                                    <div className="ml-6">
                                        <h4 className="text-xl font-semibold text-[#013954]">Foundation</h4>
                                        <p className="text-gray-600 mt-2">
                                            TechLearns was founded with a simple yet powerful vision: to make quality
                                            technical education accessible to everyone, everywhere.
                                        </p>
                                    </div>
                                </div>

                                <div className="flex items-start">
                                    <div className="flex-shrink-0 h-8 w-8 rounded-full bg-[#f99e1c] flex items-center justify-center mt-1">
                                        <span className="text-white font-bold">2021</span>
                                    </div>
                                    <div className="ml-6">
                                        <h4 className="text-xl font-semibold text-[#013954]">Growth & Innovation</h4>
                                        <p className="text-gray-600 mt-2">
                                            Launched our first 100 courses and reached 10,000 students.
                                            Introduced AI-powered learning paths and personalized mentoring.
                                        </p>
                                    </div>
                                </div>

                                <div className="flex items-start">
                                    <div className="flex-shrink-0 h-8 w-8 rounded-full bg-[#f99e1c] flex items-center justify-center mt-1">
                                        <span className="text-white font-bold">2023</span>
                                    </div>
                                    <div className="ml-6">
                                        <h4 className="text-xl font-semibold text-[#013954]">Global Expansion</h4>
                                        <p className="text-gray-600 mt-2">
                                            Reached 45,000+ students worldwide, launched 500+ courses,
                                            and established partnerships with leading tech companies.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    </motion.div>
                </div>
            </section>

            {/* Values Section */}
            <section className="py-20 bg-white">
                <div className="container mx-auto px-6">
                    <motion.div
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true, amount: 0.2 }}
                        variants={containerVariants}
                        className="text-center mb-16"
                    >
                        <motion.div variants={itemVariants}>
                            <span className="text-sm font-semibold tracking-wider text-[#f99e1c] uppercase">Our Values</span>
                            <h2 className="mt-2 text-4xl font-bold text-[#013954]">What Drives Us Forward</h2>
                            <div className="mt-2 mx-auto w-20 h-1 bg-[#f99e1c]"></div>
                        </motion.div>
                    </motion.div>

                    <motion.div
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true, amount: 0.2 }}
                        variants={containerVariants}
                        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8"
                    >
                        {values.map((value, index) => (
                            <motion.div
                                key={index}
                                variants={itemVariants}
                                className="bg-white p-8 rounded-xl shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300 group"
                            >
                                <div className="text-[#f99e1c] mb-6 group-hover:scale-110 transition-transform duration-300">
                                    {value.icon}
                                </div>
                                <h3 className="text-xl font-bold text-[#013954] mb-4">{value.title}</h3>
                                <p className="text-gray-600 leading-relaxed">{value.description}</p>
                            </motion.div>
                        ))}
                    </motion.div>
                </div>
            </section>

            {/* Achievements Section */}
            <section className="py-20 bg-gradient-to-br from-[#013954] to-[#025a7a] text-white">
                <div className="container mx-auto px-6">
                    <motion.div
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true, amount: 0.2 }}
                        variants={containerVariants}
                        className="text-center mb-16"
                    >
                        <motion.div variants={itemVariants}>
                            <span className="text-sm font-semibold tracking-wider text-[#f99e1c] uppercase">Recognition</span>
                            <h2 className="mt-2 text-4xl font-bold text-white">Awards & Achievements</h2>
                            <div className="mt-2 mx-auto w-20 h-1 bg-[#f99e1c]"></div>
                        </motion.div>
                    </motion.div>

                    <motion.div
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true, amount: 0.2 }}
                        variants={containerVariants}
                        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8"
                    >
                        {achievements.map((achievement, index) => (
                            <motion.div
                                key={index}
                                variants={itemVariants}
                                className="bg-white/10 backdrop-blur-sm p-8 rounded-xl border border-white/20 hover:bg-white/20 transition-all duration-300"
                            >
                                <div className="text-[#f99e1c] mb-6 text-4xl">
                                    {achievement.icon}
                                </div>
                                <h3 className="text-xl font-bold text-white mb-4">{achievement.title}</h3>
                                <p className="text-white/80">{achievement.description}</p>
                            </motion.div>
                        ))}
                    </motion.div>
                </div>
            </section>

            {/* Team Section */}
            <section className="py-20 bg-gray-50">
                <div className="container mx-auto px-6">
                    <motion.div
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true, amount: 0.2 }}
                        variants={containerVariants}
                        className="text-center mb-16"
                    >
                        <motion.div variants={itemVariants}>
                            <span className="text-sm font-semibold tracking-wider text-[#f99e1c] uppercase">Our Team</span>
                            <h2 className="mt-2 text-4xl font-bold text-[#013954]">Meet the Leadership</h2>
                            <div className="mt-2 mx-auto w-20 h-1 bg-[#f99e1c]"></div>
                        </motion.div>
                    </motion.div>

                    <motion.div
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true, amount: 0.2 }}
                        variants={containerVariants}
                        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
                    >
                        {team.map((member, index) => (
                            <motion.div
                                key={index}
                                variants={itemVariants}
                                className="bg-white p-8 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 group"
                            >
                                <div className="text-center">
                                    <div className="relative mb-6">
                                        <img
                                            src={member.image}
                                            alt={member.name}
                                            className="w-32 h-32 rounded-full mx-auto object-cover border-4 border-[#f99e1c]/20 group-hover:border-[#f99e1c] transition-all duration-300"
                                        />
                                        <div className="absolute -bottom-2 -right-2 bg-[#f99e1c] text-white p-2 rounded-full">
                                            <FaUserGraduate className="w-5 h-5" />
                                        </div>
                                    </div>
                                    <h3 className="text-xl font-bold text-[#013954] mb-2">{member.name}</h3>
                                    <p className="text-[#f99e1c] font-semibold mb-4">{member.role}</p>
                                    <p className="text-gray-600">{member.description}</p>
                                </div>
                            </motion.div>
                        ))}
                    </motion.div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="py-20 bg-gradient-to-r from-[#013954] to-[#025a7a] text-white">
                <div className="container mx-auto px-6 text-center">
                    <motion.div
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true, amount: 0.2 }}
                        variants={containerVariants}
                    >
                        <motion.div variants={itemVariants}>
                            <h2 className="text-4xl lg:text-5xl font-bold mb-6">
                                Ready to Start Your <span className="text-[#f99e1c]">Learning Journey</span>?
                            </h2>
                            <p className="text-xl text-white/90 mb-10 max-w-3xl mx-auto">
                                Join thousands of learners who have transformed their careers with TechLearns Academy.
                                Start your journey today and unlock your potential.
                            </p>
                            <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                className="bg-[#f99e1c] hover:bg-[#f99e1c]/90 text-[#013954] font-semibold py-4 px-8 rounded-lg text-lg shadow-lg hover:shadow-xl transition-all duration-300 flex items-center gap-3 mx-auto"
                            >
                                <FaRocket className="w-6 h-6" />
                                Get Started Today
                            </motion.button>
                        </motion.div>
                    </motion.div>
                </div>
            </section>
        </div>
    );
};

export default About;

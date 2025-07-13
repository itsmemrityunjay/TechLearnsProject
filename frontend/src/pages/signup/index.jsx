import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';

// Import your logo
import logo from '../../assets/Logo.png'; // Adjust the path as needed

const Signup = () => {
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        email: '',
        password: '',
        confirmPassword: '',
        contactNumber: '',
        skills: '',
        organizationName: '',
        headName: '',
        headContactNumber: '',
        organizationEmail: ''
    });

    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [userType, setUserType] = useState('user');
    const [passwordStrength, setPasswordStrength] = useState(0);
    const [acceptTerms, setAcceptTerms] = useState(false);

    const navigate = useNavigate();

    // Calculate password strength
    useEffect(() => {
        const calculateStrength = (password) => {
            if (!password) return 0;

            let strength = 0;
            if (password.length >= 8) strength += 1;
            if (/[A-Z]/.test(password)) strength += 1;
            if (/[0-9]/.test(password)) strength += 1;
            if (/[^A-Za-z0-9]/.test(password)) strength += 1;

            return strength;
        };

        setPasswordStrength(calculateStrength(formData.password));
    }, [formData.password]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData({
            ...formData,
            [name]: value
        });
    };

    const validateForm = () => {
        // Email validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(formData.email)) {
            setError('Please enter a valid email address');
            return false;
        }

        // Password validation
        if (formData.password.length < 6) {
            setError('Password must be at least 6 characters long');
            return false;
        }

        // Password confirmation
        if (formData.password !== formData.confirmPassword) {
            setError('Passwords do not match');
            return false;
        }

        if (!acceptTerms) {
            setError('You must accept the Terms of Service and Privacy Policy');
            return false;
        }

        // User type specific validation
        if (userType === 'user') {
            if (!formData.firstName || !formData.lastName) {
                setError('Please enter your first and last name');
                return false;
            }
            if (!formData.contactNumber) {
                setError('Please enter your contact number');
                return false;
            }
        } else if (userType === 'mentor') {
            if (!formData.firstName || !formData.lastName) {
                setError('Please enter your first and last name');
                return false;
            }
            if (!formData.contactNumber) {
                setError('Please enter your contact number');
                return false;
            }
            if (!formData.skills) {
                setError('Please enter at least one skill');
                return false;
            }
        } else if (userType === 'school') {
            if (!formData.organizationName || !formData.headName) {
                setError('Please enter organization and head name');
                return false;
            }
            if (!formData.headContactNumber || !formData.organizationEmail) {
                setError('Please enter contact details');
                return false;
            }
        }

        return true;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!validateForm()) return;

        setLoading(true);
        setError('');

        try {
            // Determine which API endpoint to use based on user type
            const endpoint = userType === 'user'
                ? '/api/users/register'
                : userType === 'mentor'
                    ? '/api/mentors/register'
                    : '/api/schools/register';

            // Prepare data based on user type
            let registrationData = {};

            if (userType === 'user') {
                registrationData = {
                    firstName: formData.firstName,
                    lastName: formData.lastName,
                    email: formData.email,
                    password: formData.password,
                    contactNumber: formData.contactNumber
                };
            } else if (userType === 'mentor') {
                registrationData = {
                    firstName: formData.firstName,
                    lastName: formData.lastName,
                    email: formData.email,
                    password: formData.password,
                    contactNumber: formData.contactNumber,
                    skills: formData.skills.split(',').map(skill => skill.trim())
                };
            } else if (userType === 'school') {
                registrationData = {
                    organizationName: formData.organizationName,
                    headName: formData.headName,
                    headContactNumber: formData.headContactNumber,
                    organizationEmail: formData.organizationEmail || formData.email,
                    password: formData.password,
                    address: {},
                    website: '',
                    established: '',
                    description: ''
                };
            }

            // Ensure API URL matches your backend
            const response = await axios.post(
                `${import.meta.env.VITE_API_URL || 'http://localhost:3000'}${endpoint}`,
                registrationData
            );

            navigate('/login');
        } catch (error) {
            console.error('Registration error:', error);
            setError(
                error.response?.data?.message ||
                'Registration failed. Please try again with different information.'
            );
        } finally {
            setLoading(false);
        }
    };

    const renderUserFields = () => (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="space-y-4"
        >
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div>
                    <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-1">
                        First Name
                    </label>
                    <input
                        id="firstName"
                        name="firstName"
                        type="text"
                        required
                        className="block w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#013954] focus:border-transparent transition-colors duration-200"
                        value={formData.firstName}
                        onChange={handleInputChange}
                        placeholder="John"
                    />
                </div>
                <div>
                    <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-1">
                        Last Name
                    </label>
                    <input
                        id="lastName"
                        name="lastName"
                        type="text"
                        required
                        className="block w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#013954] focus:border-transparent transition-colors duration-200"
                        value={formData.lastName}
                        onChange={handleInputChange}
                        placeholder="Doe"
                    />
                </div>
            </div>

            <div>
                <label htmlFor="contactNumber" className="block text-sm font-medium text-gray-700 mb-1">
                    Contact Number
                </label>
                <input
                    id="contactNumber"
                    name="contactNumber"
                    type="text"
                    required
                    className="block w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#013954] focus:border-transparent transition-colors duration-200"
                    value={formData.contactNumber}
                    onChange={handleInputChange}
                    placeholder="+1 (234) 567-8900"
                />
            </div>
        </motion.div>
    );

    const renderMentorFields = () => (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="space-y-4"
        >
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div>
                    <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-1">
                        First Name
                    </label>
                    <input
                        id="firstName"
                        name="firstName"
                        type="text"
                        required
                        className="block w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#013954] focus:border-transparent transition-colors duration-200"
                        value={formData.firstName}
                        onChange={handleInputChange}
                    />
                </div>
                <div>
                    <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-1">
                        Last Name
                    </label>
                    <input
                        id="lastName"
                        name="lastName"
                        type="text"
                        required
                        className="block w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#013954] focus:border-transparent transition-colors duration-200"
                        value={formData.lastName}
                        onChange={handleInputChange}
                    />
                </div>
            </div>

            <div>
                <label htmlFor="contactNumber" className="block text-sm font-medium text-gray-700 mb-1">
                    Contact Number
                </label>
                <input
                    id="contactNumber"
                    name="contactNumber"
                    type="text"
                    required
                    className="block w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#013954] focus:border-transparent transition-colors duration-200"
                    value={formData.contactNumber}
                    onChange={handleInputChange}
                />
            </div>

            <div>
                <label htmlFor="skills" className="block text-sm font-medium text-gray-700 mb-1">
                    Skills (comma-separated)
                </label>
                <input
                    id="skills"
                    name="skills"
                    type="text"
                    required
                    placeholder="e.g. React, Node.js, Python"
                    className="block w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#013954] focus:border-transparent transition-colors duration-200"
                    value={formData.skills}
                    onChange={handleInputChange}
                />
            </div>
        </motion.div>
    );

    const renderSchoolFields = () => (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="space-y-4"
        >
            <div>
                <label htmlFor="organizationName" className="block text-sm font-medium text-gray-700 mb-1">
                    Organization Name
                </label>
                <input
                    id="organizationName"
                    name="organizationName"
                    type="text"
                    required
                    className="block w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#013954] focus:border-transparent transition-colors duration-200"
                    value={formData.organizationName}
                    onChange={handleInputChange}
                    placeholder="ABC School"
                />
            </div>

            <div>
                <label htmlFor="headName" className="block text-sm font-medium text-gray-700 mb-1">
                    Head's Name
                </label>
                <input
                    id="headName"
                    name="headName"
                    type="text"
                    required
                    className="block w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#013954] focus:border-transparent transition-colors duration-200"
                    value={formData.headName}
                    onChange={handleInputChange}
                />
            </div>

            <div>
                <label htmlFor="headContactNumber" className="block text-sm font-medium text-gray-700 mb-1">
                    Head's Contact Number
                </label>
                <input
                    id="headContactNumber"
                    name="headContactNumber"
                    type="text"
                    required
                    className="block w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#013954] focus:border-transparent transition-colors duration-200"
                    value={formData.headContactNumber}
                    onChange={handleInputChange}
                />
            </div>

            <div>
                <label htmlFor="organizationEmail" className="block text-sm font-medium text-gray-700 mb-1">
                    Organization Email
                </label>
                <input
                    id="organizationEmail"
                    name="organizationEmail"
                    type="email"
                    required
                    className="block w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#013954] focus:border-transparent transition-colors duration-200"
                    value={formData.organizationEmail}
                    onChange={handleInputChange}
                    placeholder="contact@abcschool.com"
                />
            </div>
        </motion.div>
    );

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center px-4 py-6 sm:px-6 lg:px-8">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="max-w-2xl w-full space-y-8"
            >
                <div className="text-center">
                    <img
                        src={logo}
                        alt="TechLearns Logo"
                        className="mx-auto h-12 w-auto"
                    />
                    <h2 className="mt-6 text-3xl font-bold text-[#013954]">
                        Create Account
                    </h2>
                    <p className="mt-2 text-sm text-gray-600">
                        Join TechLearns and start your learning journey
                    </p>
                </div>

                <div className="bg-white shadow-sm rounded-xl p-8">
                    {/* User Type Selection */}
                    <div className="mb-8">
                        <div className="flex justify-between p-1 bg-gray-100 rounded-lg">
                            {[
                                { id: 'user', label: 'Student' },
                                { id: 'mentor', label: 'Mentor' },
                                { id: 'school', label: 'School' }
                            ].map((type) => (
                                <button
                                    key={type.id}
                                    type="button"
                                    className={`relative flex-1 py-2.5 px-4 text-sm font-medium rounded-md transition-all duration-200 
                                        ${userType === type.id
                                            ? 'text-white shadow-md bg-black'
                                            : 'text-gray-700 hover:bg-gray-50'
                                        }`}
                                    onClick={() => setUserType(type.id)}
                                >
                                    {userType === type.id && (
                                        <motion.div
                                            layoutId="activePill"
                                            className="absolute inset-0 bg-[#013954] rounded-md"
                                            style={{ zIndex: -1 }}
                                            initial={false}
                                            transition={{ type: 'spring', duration: 0.5 }}
                                        />
                                    )}
                                    {type.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    {error && (
                        <motion.div
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="mb-6 rounded-md bg-red-50 p-4 border-l-4 border-red-500"
                        >
                            <div className="flex">
                                <div className="flex-shrink-0">
                                    <svg className="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                                    </svg>
                                </div>
                                <div className="ml-3">
                                    <p className="text-sm text-red-700">
                                        {error}
                                    </p>
                                </div>
                            </div>
                        </motion.div>
                    )}

                    <form className="space-y-6" onSubmit={handleSubmit}>
                        <AnimatePresence mode="wait">
                            {userType === 'user' && renderUserFields()}
                            {userType === 'mentor' && renderMentorFields()}
                            {userType === 'school' && renderSchoolFields()}
                        </AnimatePresence>

                        {/* Common fields for all user types */}
                        <div className="space-y-4 pt-4 border-t border-gray-100">
                            <div>
                                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                                    Email Address
                                </label>
                                <input
                                    id="email"
                                    name="email"
                                    type="email"
                                    autoComplete="email"
                                    required
                                    className="block w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#013954] focus:border-transparent transition-colors duration-200"
                                    value={formData.email}
                                    onChange={handleInputChange}
                                    placeholder="your.email@example.com"
                                />
                            </div>

                            <div>
                                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                                    Password
                                </label>
                                <input
                                    id="password"
                                    name="password"
                                    type="password"
                                    autoComplete="new-password"
                                    required
                                    className="block w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#013954] focus:border-transparent transition-colors duration-200"
                                    value={formData.password}
                                    onChange={handleInputChange}
                                />
                                <div className="mt-2">
                                    <div className="flex justify-between mb-1">
                                        <p className="text-xs text-gray-500">Password strength</p>
                                        <p className="text-xs font-medium">
                                            {passwordStrength === 0 && 'Very weak'}
                                            {passwordStrength === 1 && 'Weak'}
                                            {passwordStrength === 2 && 'Medium'}
                                            {passwordStrength === 3 && 'Strong'}
                                            {passwordStrength === 4 && 'Very strong'}
                                        </p>
                                    </div>
                                    <div className="h-1.5 w-full bg-gray-100 rounded-full overflow-hidden">
                                        <motion.div
                                            className={`h-full ${passwordStrength === 0 ? 'bg-gray-200' :
                                                passwordStrength === 1 ? 'bg-red-400' :
                                                    passwordStrength === 2 ? 'bg-orange-400' :
                                                        passwordStrength === 3 ? 'bg-yellow-400' :
                                                            'bg-green-400'
                                                }`}
                                            initial={{ width: '0%' }}
                                            animate={{ width: `${passwordStrength * 25}%` }}
                                        />
                                    </div>
                                    <p className="mt-1 text-xs text-gray-500">
                                        Must be at least 6 characters
                                    </p>
                                </div>
                            </div>

                            <div>
                                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
                                    Confirm Password
                                </label>
                                <input
                                    id="confirmPassword"
                                    name="confirmPassword"
                                    type="password"
                                    autoComplete="new-password"
                                    required
                                    className={`block w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-[#013954] focus:border-transparent transition-colors duration-200 ${formData.confirmPassword && formData.password !== formData.confirmPassword
                                        ? 'border-red-300 bg-red-50'
                                        : 'border-gray-200'
                                        }`}
                                    value={formData.confirmPassword}
                                    onChange={handleInputChange}
                                />
                                {formData.confirmPassword && formData.password !== formData.confirmPassword && (
                                    <p className="mt-1 text-xs text-red-500">
                                        Passwords do not match
                                    </p>
                                )}
                            </div>
                        </div>

                        <div className="flex items-center">
                            <input
                                id="terms"
                                name="terms"
                                type="checkbox"
                                checked={acceptTerms}
                                onChange={() => setAcceptTerms(!acceptTerms)}
                                className="h-4 w-4 text-[#013954] focus:ring-[#013954] rounded"
                            />
                            <label htmlFor="terms" className="ml-2 block text-sm text-gray-700">
                                I agree to the{" "}
                                <Link to="/terms" className="font-medium text-[#013954] hover:text-[#f99e1c] transition-colors">
                                    Terms of Service
                                </Link>{" "}
                                and{" "}
                                <Link to="/privacy" className="font-medium text-[#013954] hover:text-[#f99e1c] transition-colors">
                                    Privacy Policy
                                </Link>
                            </label>
                        </div>

                        <div>
                            <button
                                type="submit"
                                disabled={loading}
                                className={`group relative w-full flex justify-center py-3 px-4 text-sm font-medium rounded-lg text-white transition-all duration-200
                                    ${loading ? 'bg-gray-400 cursor-not-allowed' : 'bg-[#013954] hover:bg-[#012d44] shadow-md hover:shadow-lg'}`}
                            >
                                {loading ? (
                                    <div className="flex items-center">
                                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                        Creating Your Account...
                                    </div>
                                ) : (
                                    'Create Account'
                                )}
                            </button>
                        </div>
                    </form>

                    <div className="text-center mt-8">
                        <p className="text-sm text-gray-600">
                            Already have an account?{' '}
                            <Link to="/login" className="font-medium text-[#f99e1c] hover:text-[#e08e16] transition-colors">
                                Sign in
                            </Link>
                        </p>
                    </div>
                </div>
            </motion.div>
        </div>
    );
};

export default Signup;
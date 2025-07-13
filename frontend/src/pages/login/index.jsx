import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';

// Import your logo
import logo from '../../assets/Logo.png'; // Adjust path as needed

const Login = () => {
    const [formData, setFormData] = useState({
        email: '',
        password: ''
    });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [userType, setUserType] = useState('user'); // 'user', 'mentor', or 'school'
    const [rememberMe, setRememberMe] = useState(false);

    const navigate = useNavigate();

    // Check if user is already logged in
    useEffect(() => {
        const token = localStorage.getItem('token');
        const userInfo = localStorage.getItem('userInfo');
        const storedUserType = localStorage.getItem('userType');

        if (token && userInfo) {
            if (storedUserType === 'mentor') {
                navigate('/mentor-dashboard');
            } else if (storedUserType === 'school') {
                navigate('/school-dashboard');
            } else {
                navigate('/dashboard');
            }
        }
    }, [navigate]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData({
            ...formData,
            [name]: value
        });
    };

    const validateForm = () => {
        if (!formData.email || !formData.password) {
            setError('Please fill in all fields');
            return false;
        }

        // Basic email validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(formData.email)) {
            setError('Please enter a valid email address');
            return false;
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
                ? '/api/users/login'
                : userType === 'mentor'
                    ? '/api/mentors/login'
                    : '/api/schools/login';

            const response = await axios.post(
                `${import.meta.env.VITE_API_URL || ''}${endpoint}`,
                formData
            );

            const { token, ...userData } = response.data;

            // Ensure role is set based on userType
            userData.role = userType;

            // Store token and user info in localStorage
            localStorage.setItem('token', token);
            localStorage.setItem('userInfo', JSON.stringify(userData));
            localStorage.setItem('userType', userType);

            // Update auth header for future requests
            axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;

            // Redirect based on user type
            if (userType === 'mentor') {
                navigate('/mentor-dashboard');
            } else if (userType === 'school') {
                navigate('/school-dashboard');
            } else {
                navigate('/dashboard');
            }
        } catch (error) {
            setError(
                error.response?.data?.message ||
                'Login failed. Please check your credentials and try again.'
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4 sm:px-6 lg:px-8 py-12">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="max-w-md w-full space-y-8"
            >
                <div className="text-center">
                    <img
                        src={logo}
                        alt="TechLearns Logo"
                        className="mx-auto h-12 w-auto"
                    />
                    <h2 className="mt-6 text-3xl font-bold text-[#013954]">
                        Welcome Back
                    </h2>
                    <p className="mt-2 text-sm text-gray-600">
                        Sign in to continue to your TechLeaRNS account
                    </p>
                </div>

                <div className="bg-white shadow-sm rounded-xl p-8">
                    {/* User Type Selection */}
                    <div className="mb-6">
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

                    <AnimatePresence>
                        {error && (
                            <motion.div
                                initial={{ opacity: 0, y: -10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                transition={{ duration: 0.2 }}
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
                    </AnimatePresence>

                    <form className="space-y-5" onSubmit={handleSubmit}>
                        <div className="space-y-4">
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
                                    placeholder="your.email@example.com"
                                    value={formData.email}
                                    onChange={handleInputChange}
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
                                    autoComplete="current-password"
                                    required
                                    className="block w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#013954] focus:border-transparent transition-colors duration-200"
                                    placeholder="••••••••"
                                    value={formData.password}
                                    onChange={handleInputChange}
                                />
                            </div>
                        </div>

                        <div className="flex items-center justify-between">
                            <div className="flex items-center">
                                <input
                                    id="remember-me"
                                    name="remember-me"
                                    type="checkbox"
                                    checked={rememberMe}
                                    onChange={() => setRememberMe(!rememberMe)}
                                    className="h-4 w-4 text-[#013954] focus:ring-[#013954] border-gray-300 rounded"
                                />
                                <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-700">
                                    Remember me
                                </label>
                            </div>

                            <div className="text-sm">
                                <Link to="/forgot-password" className="font-medium text-[#f99e1c] hover:text-[#e08e15] transition-colors">
                                    Forgot password?
                                </Link>
                            </div>
                        </div>

                        <div className="pt-2">
                            <button
                                type="submit"
                                disabled={loading}
                                className={`group relative w-full flex justify-center py-3 px-4 text-sm font-medium rounded-lg text-white transition-all duration-200
                                    ${loading ? 'bg-gray-400 cursor-not-allowed' : 'bg-black hover:bg-[#012d44] shadow-sm hover:shadow-md'}`}
                            >
                                {loading ? (
                                    <div className="flex items-center">
                                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                        Signing in...
                                    </div>
                                ) : (
                                    'Sign in'
                                )}
                            </button>
                        </div>
                    </form>

                    {userType === 'user' && (
                        <div className="mt-6 border-t border-gray-100 pt-5">
                            <p className="text-center text-sm text-gray-600">
                                From a low-income background?{' '}
                                <Link to="/below-poverty-verification" className="font-medium text-[#f99e1c] hover:text-[#e08e15]">
                                    Apply for free premium access
                                </Link>
                            </p>
                        </div>
                    )}

                    <div className="text-center mt-5">
                        {userType === 'user' && (
                            <p className="text-sm text-gray-600">
                                Don't have an account?{' '}
                                <Link to="/register" className="font-medium text-[#013954] hover:text-[#f99e1c] transition-colors">
                                    Register now
                                </Link>
                            </p>
                        )}
                        {userType === 'mentor' && (
                            <p className="text-sm text-gray-600">
                                Want to become a mentor?{' '}
                                <Link to="/mentor/register" className="font-medium text-[#013954] hover:text-[#f99e1c] transition-colors">
                                    Apply as a mentor
                                </Link>
                            </p>
                        )}
                        {userType === 'school' && (
                            <p className="text-sm text-gray-600">
                                Register your school/organization?{' '}
                                <Link to="/school/register" className="font-medium text-[#013954] hover:text-[#f99e1c] transition-colors">
                                    Register here
                                </Link>
                            </p>
                        )}
                    </div>
                </div>
            </motion.div>
        </div>
    );
};

export default Login;
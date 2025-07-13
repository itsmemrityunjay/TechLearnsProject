import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { motion } from 'framer-motion';
import { FaStar, FaUser, FaLock, FaRegClock, FaGraduationCap, FaChevronDown, FaChevronUp } from 'react-icons/fa';
import { BiTime } from 'react-icons/bi';
import { useAuth } from '../../../context/AuthContext';
import api from '../../../utils/axiosConfig';

const DetailedCourse = () => {
    const { currentUser } = useAuth();
    const { id } = useParams();
    const navigate = useNavigate();

    // State variables
    const [course, setCourse] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [enrolling, setEnrolling] = useState(false);
    const [enrollmentError, setEnrollmentError] = useState(null);
    const [expandedSections, setExpandedSections] = useState({});
    const [isEnrolled, setIsEnrolled] = useState(false);
    const [showLoginPrompt, setShowLoginPrompt] = useState(false);
    const [showPaymentModal, setShowPaymentModal] = useState(false);

    // Fetch course details
    useEffect(() => {
        const fetchCourse = async () => {
            try {
                setLoading(true);
                const response = await api.get(`/api/courses/${id}`);
                setCourse(response.data);

                // Check if user is enrolled in this course
                if (currentUser) {
                    try {
                        const userResponse = await api.get('/api/users/me');

                        // First check if user data includes the direct enrollmentStatus
                        if (userResponse.data.enrolledCourses &&
                            Array.isArray(userResponse.data.enrolledCourses)) {

                            // Check different possible formats of course IDs
                            const enrolled = userResponse.data.enrolledCourses.some(courseId =>
                                courseId === id || courseId._id === id || courseId.toString() === id
                            );

                            if (enrolled) {
                                setIsEnrolled(true);
                                return;
                            }
                        }

                        // Next check registeredCourses format
                        if (userResponse.data.registeredCourses &&
                            Array.isArray(userResponse.data.registeredCourses)) {

                            const enrolled = userResponse.data.registeredCourses.some(course => {
                                // Handle different possible ID formats
                                const courseId = course.courseId || course._id || course.id || course;
                                return courseId === id ||
                                    (courseId && courseId.toString() === id) ||
                                    (typeof courseId === 'object' && courseId._id === id);
                            });

                            if (enrolled) {
                                setIsEnrolled(true);
                                return;
                            }
                        }

                        // As a final check, get the course directly to check enrollment
                        const courseResponse = await api.get(`/api/courses/${id}/enrollment-status`);
                        if (courseResponse.data && courseResponse.data.isEnrolled) {
                            setIsEnrolled(true);
                            return;
                        }

                        setIsEnrolled(false);

                    } catch (err) {
                        console.error('Failed to check enrollment status:', err);

                        // Add fallback check in case the /me endpoint fails
                        try {
                            const enrollmentCheck = await api.get(`/api/courses/${id}/enrollment-status`);
                            if (enrollmentCheck.data && enrollmentCheck.data.isEnrolled) {
                                setIsEnrolled(true);
                            }
                        } catch (fallbackErr) {
                            console.error('Fallback enrollment check failed:', fallbackErr);
                        }
                    }
                }
            } catch (err) {
                console.error('Error fetching course:', err);
                setError('Failed to load course details. Please try again later.');
            } finally {
                setLoading(false);
            }
        };

        fetchCourse();
    }, [id, currentUser]);

    // Add this useEffect after your existing one
    useEffect(() => {
        // Check localStorage for enrolled courses as a backup
        if (currentUser && id) {
            try {
                const enrolledCourses = JSON.parse(localStorage.getItem('enrolledCourses') || '[]');
                if (enrolledCourses.includes(id)) {
                    setIsEnrolled(true);
                }
            } catch (err) {
                console.error('Error checking local enrollment data:', err);
            }
        }
    }, [currentUser, id]);

    // Toggle section expansion
    const toggleSection = (index) => {
        setExpandedSections(prev => ({
            ...prev,
            [index]: !prev[index]
        }));
    };

    // Calculate total course length
    const calculateTotalDuration = () => {
        if (!course?.content) return '0 min';

        const totalMinutes = course.content.reduce((total, item) => {
            if (!item.duration) return total;

            // Convert "HH:MM" format to minutes
            const parts = item.duration.split(':');
            if (parts.length === 2) {
                return total + (parseInt(parts[0]) * 60 + parseInt(parts[1]));
            }

            // Handle simple minute format
            return total + parseInt(item.duration.replace('min', '').trim());
        }, 0);

        if (totalMinutes >= 60) {
            const hours = Math.floor(totalMinutes / 60);
            const minutes = totalMinutes % 60;
            return `${hours}h ${minutes}m`;
        }

        return `${totalMinutes} min`;
    };

    // Add this function before the handleEnroll
    const validateToken = () => {
        const token = localStorage.getItem('token');
        if (!token) {
            setCurrentUser(null); // Clear user if no token exists
            return false;
        }
        return true;
    };

    // Handle enrollment
    const handleEnroll = async () => {
        if (!currentUser) {
            setShowLoginPrompt(true);
            return;
        }

        // Validate token before proceeding
        if (!validateToken()) {
            setEnrollmentError("Your session has expired. Please log in again.");
            setShowLoginPrompt(true);
            return;
        }

        // For premium courses, show payment modal
        if (course.isPremium) {
            setShowPaymentModal(true);
            return;
        }

        try {
            setEnrolling(true);
            setEnrollmentError(null);

            // Use api instead of axios
            await api.post(`/api/courses/${id}/enroll`);

            setIsEnrolled(true);

            // Store enrollment in localStorage as a backup
            const enrolledCourses = JSON.parse(localStorage.getItem('enrolledCourses') || '[]');
            if (!enrolledCourses.includes(id)) {
                enrolledCourses.push(id);
                localStorage.setItem('enrolledCourses', JSON.stringify(enrolledCourses));
            }

            // Show success notification
            alert("Successfully enrolled in the course!");
        } catch (err) {
            console.error('Enrollment error:', err);

            // More specific error handling
            if (err.response?.status === 401) {
                setEnrollmentError("Authentication failed. Please try logging in again.");
            } else if (err.response?.status === 403) {
                setEnrollmentError("You don't have permission to enroll in this course.");
            } else {
                setEnrollmentError(err.response?.data?.message || 'Failed to enroll in this course');
            }
        } finally {
            setEnrolling(false);
        }
    };

    // Handle payment completion
    const handlePaymentComplete = async () => {
        try {
            setEnrolling(true);
            setEnrollmentError(null);

            // Step 1: Create an order on your backend
            const orderResponse = await api.post(`/api/payments/create-order`, {
                courseId: id,
                amount: course.price * 100 // Razorpay expects amount in paise
            });

            const options = {
                key: process.env.REACT_APP_RAZORPAY_KEY_ID || "rzp_test_USRBs9xzh6MqbM",
                amount: course.price * 100, // Amount in paise
                currency: "INR",
                name: "TechLeaRNS",
                description: `Enrollment for ${course.title}`,
                order_id: orderResponse.data.id,
                handler: async function (response) {
                    try {
                        // Step 2: Verify payment with your backend
                        const verificationResponse = await api.post('/api/payments/verify', {
                            razorpay_payment_id: response.razorpay_payment_id,
                            razorpay_order_id: response.razorpay_order_id,
                            razorpay_signature: response.razorpay_signature,
                            courseId: id
                        });

                        // Step 3: If verification succeeds, enroll the user
                        if (verificationResponse.status === 200) {
                            const enrollResponse = await api.post(`/api/courses/${id}/enroll`, {
                                paymentCompleted: true,
                                paymentId: response.razorpay_payment_id
                            });

                            setIsEnrolled(true);
                            setShowPaymentModal(false);

                            // Store enrollment in localStorage as a backup
                            const enrolledCourses = JSON.parse(localStorage.getItem('enrolledCourses') || '[]');
                            if (!enrolledCourses.includes(id)) {
                                enrolledCourses.push(id);
                                localStorage.setItem('enrolledCourses', JSON.stringify(enrolledCourses));
                            }

                            alert("Payment successful! You're now enrolled in this course.");
                        } else {
                            setEnrollmentError("Payment verification failed. Please contact support.");
                        }
                    } catch (err) {
                        console.error("Payment or enrollment error:", err);
                        setEnrollmentError(err.response?.data?.message || "Payment verification failed. Please contact support.");
                    } finally {
                        setEnrolling(false);
                    }
                },
                prefill: {
                    name: currentUser?.firstName + " " + currentUser?.lastName || "",
                    email: currentUser?.email || "",
                    contact: currentUser?.phone || ""
                },
                theme: {
                    color: "#013954"
                }
            };

            const razorpay = new window.Razorpay(options);
            razorpay.open();
        } catch (err) {
            console.error('Payment initialization error:', err);
            setEnrollmentError(err.response?.data?.message || 'Failed to initialize payment');
            setEnrolling(false);
        }
    };

    // Login prompt component
    const LoginPrompt = () => (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white shadow-lg rounded-lg p-6 max-w-md mx-auto my-8"
        >
            <h3 className="text-xl font-bold text-gray-800 mb-4">Login Required</h3>
            <p className="text-gray-600 mb-6">
                Please log in to view this course and access the learning materials.
            </p>
            <div className="flex justify-between">
                <button
                    onClick={() => setShowLoginPrompt(false)}
                    className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                >
                    Cancel
                </button>
                <Link
                    to="/login"
                    state={{ from: `/courses/${id}` }}
                    className="px-4 py-2 bg-[#013954] text-white rounded-md hover:bg-[#013954]/90"
                >
                    Log In
                </Link>
            </div>
        </motion.div>
    );

    // Payment modal component
    const PaymentModal = () => (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-white rounded-lg p-6 max-w-md w-full mx-4"
            >
                <h3 className="text-xl font-bold text-gray-800 mb-4">Complete Your Purchase</h3>

                <div className="mb-5">
                    <h4 className="font-medium text-gray-700 mb-2">Course Details:</h4>
                    <p className="text-gray-600">{course?.title}</p>
                    <p className="text-sm text-gray-500">by {course?.createdBy ? `${course.createdBy.firstName} ${course.createdBy.lastName}` : 'Instructor'}</p>
                </div>

                <div className="bg-gray-50 p-4 rounded-md mb-5">
                    <div className="flex justify-between mb-2">
                        <span>Course Fee:</span>
                        <span className="font-medium">₹{course?.price || 0}</span>
                    </div>
                    <div className="flex justify-between mb-2">
                        <span>Taxes:</span>
                        <span className="font-medium">₹{Math.round(course?.price * 0.18) || 0}</span>
                    </div>
                    <div className="border-t pt-2 mt-2 flex justify-between">
                        <span className="font-bold">Total Amount:</span>
                        <span className="font-bold">₹{Math.round(course?.price * 1.18) || 0}</span>
                    </div>
                </div>

                <div className="text-sm text-gray-500 mb-5">
                    <p>Click the Pay button below to process your payment securely via Razorpay.</p>
                </div>

                <div className="flex justify-between">
                    <button
                        onClick={() => setShowPaymentModal(false)}
                        className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handlePaymentComplete}
                        className="px-4 py-2 bg-[#f99e1c] text-white rounded-md hover:bg-[#f99e1c]/90"
                        disabled={enrolling}
                    >
                        {enrolling ? 'Processing...' : `Pay ₹${Math.round(course?.price * 1.18) || 0}`}
                    </button>
                </div>
            </motion.div>
        </div>
    );

    // Loading state
    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-[600px]">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#f99e1c]"></div>
            </div>
        );
    }

    // Error state
    if (error) {
        return (
            <div className="text-center py-16">
                <p className="text-red-500 mb-4">{error}</p>
                <button
                    onClick={() => navigate(-1)}
                    className="px-4 py-2 bg-[#013954] text-white rounded-md"
                >
                    Go Back
                </button>
            </div>
        );
    }

    // Show login prompt if needed
    if (showLoginPrompt) {
        return <LoginPrompt />;
    }

    return (
        <div className="bg-gray-50 min-h-screen">
            {/* Show payment modal if active */}
            {showPaymentModal && <PaymentModal />}

            {/* Course header */}
            <div className="bg-gradient-to-r from-[#013954] to-[#025277] text-white py-10">
                <div className="container mx-auto px-4">
                    <div className="flex flex-col lg:flex-row gap-8">
                        {/* Course thumbnail */}
                        <div className="lg:w-1/3">
                            <div className="rounded-lg overflow-hidden shadow-lg">
                                <img
                                    src={course?.thumbnail || 'https://via.placeholder.com/640x360?text=Course+Thumbnail'}
                                    alt={course?.title}
                                    className="w-full h-auto object-cover aspect-video"
                                />
                            </div>
                        </div>

                        {/* Course info */}
                        <div className="lg:w-2/3">
                            <div className="flex items-center mb-4">
                                <span className="px-3 py-1 bg-[#f99e1c] text-white rounded-full text-sm font-medium">
                                    {course?.category}
                                </span>
                                {course?.isPremium && (
                                    <span className="ml-2 px-3 py-1 bg-purple-600 text-white rounded-full text-sm font-medium">
                                        Premium
                                    </span>
                                )}
                                <span className="ml-2 px-3 py-1 bg-blue-500 text-white rounded-full text-sm font-medium">
                                    {course?.courseFor === 'elementary' ? 'Elementary' : 'Undergraduate'}
                                </span>
                            </div>

                            <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold mb-4">
                                {course?.title}
                            </h1>

                            <p className="text-gray-200 mb-6 line-clamp-3 md:line-clamp-none">
                                {course?.description}
                            </p>

                            <div className="flex flex-wrap items-center gap-6 mb-6">
                                <div className="flex items-center">
                                    <FaStar className="text-yellow-400 mr-1" />
                                    <span className="font-medium">{course?.averageRating?.toFixed(1) || '4.5'}</span>
                                </div>

                                <div className="flex items-center">
                                    <BiTime className="mr-1" />
                                    <span>{calculateTotalDuration()}</span>
                                </div>

                                <div className="flex items-center">
                                    <FaUser className="mr-1" />
                                    <span>
                                        {course?.enrolledStudents?.length || 0} students enrolled
                                    </span>
                                </div>
                            </div>

                            <div className="flex items-center">
                                {course?.createdBy?.profileImage && (
                                    <img
                                        src={course.createdBy.profileImage}
                                        alt={`${course.createdBy.firstName} ${course.createdBy.lastName}`}
                                        className="w-10 h-10 rounded-full mr-3 object-cover"
                                    />
                                )}
                                <div>
                                    <p className="font-semibold">
                                        {course?.createdBy ?
                                            `${course.createdBy.firstName} ${course.createdBy.lastName}` :
                                            'Instructor'}
                                    </p>
                                    <p className="text-sm text-gray-300">Course Instructor</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main content */}
            <div className="container mx-auto px-4 py-8">
                <div className="flex flex-col lg:flex-row gap-8">
                    {/* Course details */}
                    <div className="lg:w-2/3">
                        {/* Course description */}
                        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
                            <h2 className="text-2xl font-bold text-[#013954] mb-4">
                                About This Course
                            </h2>
                            <p className="text-gray-700 whitespace-pre-line">
                                {course?.description}
                            </p>

                            {/* Learning objectives */}
                            {course?.objectives && course.objectives.length > 0 && (
                                <div className="mt-8">
                                    <h3 className="text-xl font-bold text-[#013954] mb-4">
                                        What You'll Learn
                                    </h3>
                                    <ul className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                        {course.objectives.map((objective, index) => (
                                            <li key={index} className="flex items-start">
                                                <div className="text-[#f99e1c] mr-2 mt-1">
                                                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                                    </svg>
                                                </div>
                                                <span className="text-gray-700">{objective}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            )}
                        </div>

                        {/* Course content */}
                        <div className="bg-white rounded-lg shadow-md p-6">
                            <h2 className="text-2xl font-bold text-[#013954] mb-6">
                                Course Content
                            </h2>

                            {!currentUser && (
                                <div className="bg-gray-50 border border-gray-200 rounded-md p-4 mb-6">
                                    <p className="text-gray-700 flex items-center">
                                        <FaLock className="mr-2 text-[#013954]" />
                                        Please log in to view the course content
                                    </p>
                                </div>
                            )}

                            {currentUser && !isEnrolled && (
                                <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4 mb-6">
                                    <p className="text-gray-700 flex items-center">
                                        <FaRegClock className="mr-2 text-[#f99e1c]" />
                                        Preview mode: Enroll to access full content
                                    </p>
                                </div>
                            )}

                            {/* Content sections */}
                            {course?.content && course.content.length > 0 ? (
                                <div className="border border-gray-200 rounded-md overflow-hidden">
                                    {course.content.map((item, index) => {
                                        // Only show the first 10% of content for non-enrolled users
                                        const previewCutoff = Math.ceil(course.content.length * 0.1);
                                        const isPreviewContent = index < previewCutoff;
                                        const isAccessible = isEnrolled || isPreviewContent;

                                        return (
                                            <div key={item._id || index} className={`border-b last:border-b-0 ${isAccessible ? 'bg-white hover:bg-gray-50' : 'bg-gray-50'}`}>
                                                <button
                                                    onClick={() => toggleSection(index)}
                                                    className="w-full px-4 py-3 flex items-center justify-between text-left"
                                                    disabled={!isAccessible}
                                                >
                                                    <div className="flex items-center">
                                                        {!isAccessible && (
                                                            <FaLock className="text-gray-400 mr-2" size={14} />
                                                        )}
                                                        <div>
                                                            <h4 className={`font-medium ${isAccessible ? 'text-gray-800' : 'text-gray-500'}`}>
                                                                {item.title}
                                                            </h4>
                                                            <div className="flex items-center mt-1 text-sm text-gray-500">
                                                                {item.type === "video" &&
                                                                    <span className="flex items-center">
                                                                        <span className="inline-block w-2 h-2 bg-red-500 rounded-full mr-2"></span>
                                                                        Video
                                                                    </span>
                                                                }
                                                                {item.type === "lesson" &&
                                                                    <span className="flex items-center">
                                                                        <span className="inline-block w-2 h-2 bg-blue-500 rounded-full mr-2"></span>
                                                                        Lesson
                                                                    </span>
                                                                }
                                                                {item.type === "quiz" &&
                                                                    <span className="flex items-center">
                                                                        <span className="inline-block w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                                                                        Quiz
                                                                    </span>
                                                                }
                                                                {item.duration && (
                                                                    <span className="ml-3">{item.duration}</span>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </div>
                                                    {isAccessible ? (
                                                        expandedSections[index] ?
                                                            <FaChevronUp className="text-gray-500" /> :
                                                            <FaChevronDown className="text-gray-500" />
                                                    ) : null}
                                                </button>

                                                {/* Content details */}
                                                {isAccessible && expandedSections[index] && (
                                                    <div className="px-4 pb-4">
                                                        {item.description && (
                                                            <p className="text-sm text-gray-700 mb-4">
                                                                {item.description}
                                                            </p>
                                                        )}

                                                        {item.type === "video" && item.videoUrl && (
                                                            <div className="aspect-video rounded-md overflow-hidden mb-4">
                                                                <video
                                                                    controls
                                                                    className="w-full h-full"
                                                                    src={item.videoUrl}
                                                                >
                                                                    Your browser does not support the video tag.
                                                                </video>
                                                            </div>
                                                        )}

                                                        {item.type === "lesson" && item.textContent && (
                                                            <div className="prose prose-sm max-w-none">
                                                                <div dangerouslySetInnerHTML={{ __html: item.textContent }} />
                                                            </div>
                                                        )}

                                                        {item.attachments && item.attachments.length > 0 && (
                                                            <div className="mt-4">
                                                                <h5 className="text-sm font-medium text-gray-700 mb-2">
                                                                    Attachments
                                                                </h5>
                                                                <div className="space-y-2">
                                                                    {item.attachments.map((attachment, i) => (
                                                                        <a
                                                                            key={i}
                                                                            href={attachment.url}
                                                                            target="_blank"
                                                                            rel="noopener noreferrer"
                                                                            className="block px-3 py-2 bg-gray-50 rounded border border-gray-200 text-sm text-blue-600 hover:bg-gray-100"
                                                                        >
                                                                            {attachment.name}
                                                                        </a>
                                                                    ))}
                                                                </div>
                                                            </div>
                                                        )}
                                                    </div>
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>
                            ) : (
                                <p className="text-gray-500 italic">No content available for this course yet.</p>
                            )}
                        </div>
                    </div>

                    {/* Sidebar */}
                    <div className="lg:w-1/3">
                        {/* Enrollment card */}
                        <div className="bg-white rounded-lg shadow-md p-6 sticky top-20">
                            {course?.isPremium && (
                                <div className="mb-4">
                                    <div className="flex items-baseline justify-between mb-1">
                                        <span className="text-3xl font-bold text-[#013954]">₹{course.price}</span>
                                        {/* You can add original price or discount here if needed */}
                                    </div>
                                </div>
                            )}

                            {/* Enrollment status */}
                            {isEnrolled ? (
                                <div className="mb-6">
                                    <div className="bg-green-50 border border-green-200 rounded-md p-4">
                                        <p className="text-green-700 flex items-center font-medium">
                                            <FaGraduationCap className="mr-2" />
                                            You're enrolled in this course
                                        </p>
                                    </div>
                                </div>
                            ) : (
                                <button
                                    onClick={handleEnroll}
                                    disabled={enrolling}
                                    className={`w-full py-3 rounded-md font-medium flex items-center justify-center ${course?.isPremium
                                        ? 'bg-[#f99e1c] text-white hover:bg-[#f99e1c]/90'
                                        : 'bg-[#013954] text-white hover:bg-[#013954]/90'
                                        }`}
                                >
                                    {enrolling ? (
                                        <>
                                            <div className="animate-spin mr-2 h-4 w-4 border-2 border-white border-t-transparent rounded-full"></div>
                                            Processing...
                                        </>
                                    ) : (
                                        <>
                                            {course?.isPremium ? `Enroll for ₹${course.price}` : 'Enroll for Free'}
                                        </>
                                    )}
                                </button>
                            )}

                            {/* Enrollment error */}
                            {enrollmentError && (
                                <div className="mt-2 text-red-500 text-sm">
                                    {enrollmentError}
                                </div>
                            )}

                            {/* Course includes */}
                            <div className="mt-6">
                                <h4 className="font-medium text-gray-700 mb-3">This course includes:</h4>
                                <ul className="space-y-2">
                                    <li className="flex items-start">
                                        <svg className="mt-1 h-4 w-4 text-[#f99e1c]" fill="currentColor" viewBox="0 0 20 20">
                                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                        </svg>
                                        <span className="ml-2 text-gray-700">
                                            {course?.content?.length || 0} lessons
                                        </span>
                                    </li>
                                    <li className="flex items-start">
                                        <svg className="mt-1 h-4 w-4 text-[#f99e1c]" fill="currentColor" viewBox="0 0 20 20">
                                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                        </svg>
                                        <span className="ml-2 text-gray-700">
                                            {calculateTotalDuration()} of content
                                        </span>
                                    </li>
                                    <li className="flex items-start">
                                        <svg className="mt-1 h-4 w-4 text-[#f99e1c]" fill="currentColor" viewBox="0 0 20 20">
                                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                        </svg>
                                        <span className="ml-2 text-gray-700">
                                            Full lifetime access
                                        </span>
                                    </li>
                                    <li className="flex items-start">
                                        <svg className="mt-1 h-4 w-4 text-[#f99e1c]" fill="currentColor" viewBox="0 0 20 20">
                                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                        </svg>
                                        <span className="ml-2 text-gray-700">
                                            Certificate of completion
                                        </span>
                                    </li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DetailedCourse;
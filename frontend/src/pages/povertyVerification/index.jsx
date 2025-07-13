import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { motion } from 'framer-motion';

const PovertyVerification = () => {
    const [formData, setFormData] = useState({
        fullName: '',
        contactNumber: '',
        address: '',
        annualIncome: '',
        familySize: '',
        rationCardNumber: '',
        additionalInfo: ''
    });
    const [rationCardImage, setRationCardImage] = useState(null);
    const [imagePreview, setImagePreview] = useState(null);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [success, setSuccess] = useState(false);
    const [currentStep, setCurrentStep] = useState(1);
    const totalSteps = 2;

    const navigate = useNavigate();

    // Check if user is logged in
    useEffect(() => {
        const token = localStorage.getItem('token');
        if (!token) {
            navigate('/login');
        }
    }, [navigate]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData({
            ...formData,
            [name]: value
        });
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        // Validate file type
        const validTypes = ['image/jpeg', 'image/png', 'image/jpg', 'application/pdf'];
        if (!validTypes.includes(file.type)) {
            setError('Please upload a valid file (JPEG, PNG, or PDF)');
            return;
        }

        // Validate file size (max 5MB)
        if (file.size > 5 * 1024 * 1024) {
            setError('File size should be less than 5MB');
            return;
        }

        setRationCardImage(file);

        // Create preview URL for images (not for PDFs)
        if (file.type.startsWith('image/')) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setImagePreview(reader.result);
            };
            reader.readAsDataURL(file);
        } else {
            setImagePreview(null);
        }

        setError('');
    };

    const validateForm = () => {
        if (currentStep === 1) {
            if (!formData.fullName || !formData.contactNumber || !formData.address ||
                !formData.annualIncome || !formData.familySize) {
                setError('Please fill in all required fields');
                return false;
            }

            // Validate annualIncome is a number
            if (isNaN(formData.annualIncome)) {
                setError('Annual income must be a number');
                return false;
            }

            // Validate familySize is a number
            if (isNaN(formData.familySize)) {
                setError('Family size must be a number');
                return false;
            }

            return true;
        } else {
            if (!formData.rationCardNumber) {
                setError('Please provide your ration card number');
                return false;
            }

            if (!rationCardImage) {
                setError('Please upload your ration card image');
                return false;
            }

            return true;
        }
    };

    const handleNextStep = () => {
        if (validateForm()) {
            setError('');
            setCurrentStep(currentStep + 1);
        }
    };

    const handlePrevStep = () => {
        setError('');
        setCurrentStep(currentStep - 1);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!validateForm()) return;

        setLoading(true);
        setError('');
        setUploadProgress(0);

        try {
            const token = localStorage.getItem('token');
            if (!token) {
                navigate('/login');
                return;
            }

            // First upload the image
            const imageFormData = new FormData();
            imageFormData.append('file', rationCardImage);

            const uploadConfig = {
                headers: {
                    'Content-Type': 'multipart/form-data',
                    Authorization: `Bearer ${token}`
                },
                onUploadProgress: (progressEvent) => {
                    const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
                    setUploadProgress(percentCompleted);
                }
            };

            const uploadResponse = await axios.post(
                `${process.env.REACT_APP_API_URL || 'http://localhost:3000'}/api/upload`,
                imageFormData,
                uploadConfig
            );

            const fileUrl = uploadResponse.data.fileUrl;

            // Then submit the form with the file URL
            await axios.post(
                `${process.env.REACT_APP_API_URL || 'http://localhost:3000'}/api/users/poverty-verification`,
                {
                    ...formData,
                    rationCardImageUrl: fileUrl
                },
                {
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${token}`
                    }
                }
            );

            setSuccess(true);

            // Update user info in local storage to reflect poverty status
            const userInfo = JSON.parse(localStorage.getItem('userInfo') || '{}');
            localStorage.setItem('userInfo', JSON.stringify({
                ...userInfo,
                belowPoverty: {
                    status: true,
                    verified: false, // Admin needs to verify
                    document: fileUrl
                }
            }));

            // Redirect after 3 seconds
            setTimeout(() => {
                navigate('/dashboard');
            }, 3000);

        } catch (error) {
            setError(
                error.response?.data?.message ||
                'Verification submission failed. Please try again.'
            );
        } finally {
            setLoading(false);
        }
    };

    if (success) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4 sm:px-6 lg:px-8">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="max-w-md w-full bg-white p-8 rounded-xl shadow-sm"
                >
                    <div className="mx-auto flex items-center justify-center h-20 w-20 rounded-full bg-green-50">
                        <svg className="h-12 w-12 text-green-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                        </svg>
                    </div>
                    <h2 className="mt-6 text-center text-2xl font-semibold text-gray-800">Verification Submitted</h2>
                    <p className="mt-3 text-center text-gray-600">
                        Your application has been submitted successfully. Our team will review your details and verify your eligibility shortly.
                    </p>
                    <div className="mt-8">
                        <Link
                            to="/dashboard"
                            className="w-full flex justify-center py-2.5 px-4 rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-200"
                        >
                            Return to Dashboard
                        </Link>
                    </div>
                </motion.div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4 sm:px-6 lg:px-8 py-12">
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="max-w-lg w-full space-y-6 bg-white p-8 rounded-lg shadow-sm"
            >
                <div>
                    <h2 className="text-center text-2xl font-semibold text-gray-800">
                        Premium Access Application
                    </h2>
                    <p className="mt-2 text-center text-sm text-gray-500">
                        Complete this form to verify your eligibility for free premium features
                    </p>
                </div>

                {/* Progress indicator */}
                <div className="relative pt-4">
                    <div className="flex items-center justify-between mb-2">
                        <div className="w-full flex items-center">
                            <div className="relative flex items-center justify-center">
                                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${currentStep >= 1 ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-600'}`}>
                                    1
                                </div>
                            </div>
                            <div className={`flex-1 h-1 mx-2 ${currentStep >= 2 ? 'bg-blue-600' : 'bg-gray-200'}`}></div>
                            <div className="relative flex items-center justify-center">
                                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${currentStep >= 2 ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-600'}`}>
                                    2
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="flex justify-between text-xs text-gray-500">
                        <div className="w-1/2 text-center">Personal Details</div>
                        <div className="w-1/2 text-center">Document Verification</div>
                    </div>
                </div>

                {error && (
                    <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-red-50 border-l-4 border-red-500 p-4 rounded-md"
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

                <form className="mt-4 space-y-6" onSubmit={handleSubmit}>
                    {/* Step 1: Personal Details */}
                    {currentStep === 1 && (
                        <motion.div
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 20 }}
                            className="space-y-4"
                        >
                            <div>
                                <label htmlFor="fullName" className="block text-sm font-medium text-gray-700">
                                    Full Name <span className="text-red-500">*</span>
                                </label>
                                <input
                                    id="fullName"
                                    name="fullName"
                                    type="text"
                                    required
                                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                                    value={formData.fullName}
                                    onChange={handleInputChange}
                                />
                            </div>

                            <div>
                                <label htmlFor="contactNumber" className="block text-sm font-medium text-gray-700">
                                    Contact Number <span className="text-red-500">*</span>
                                </label>
                                <input
                                    id="contactNumber"
                                    name="contactNumber"
                                    type="text"
                                    required
                                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                                    value={formData.contactNumber}
                                    onChange={handleInputChange}
                                />
                            </div>

                            <div>
                                <label htmlFor="address" className="block text-sm font-medium text-gray-700">
                                    Address <span className="text-red-500">*</span>
                                </label>
                                <textarea
                                    id="address"
                                    name="address"
                                    rows="3"
                                    required
                                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                                    value={formData.address}
                                    onChange={handleInputChange}
                                />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label htmlFor="annualIncome" className="block text-sm font-medium text-gray-700">
                                        Annual Income (₹) <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        id="annualIncome"
                                        name="annualIncome"
                                        type="number"
                                        required
                                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                                        value={formData.annualIncome}
                                        onChange={handleInputChange}
                                    />
                                </div>

                                <div>
                                    <label htmlFor="familySize" className="block text-sm font-medium text-gray-700">
                                        Family Size <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        id="familySize"
                                        name="familySize"
                                        type="number"
                                        required
                                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                                        value={formData.familySize}
                                        onChange={handleInputChange}
                                    />
                                </div>
                            </div>

                            <div className="flex justify-end mt-6">
                                <button
                                    type="button"
                                    onClick={handleNextStep}
                                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                                >
                                    Next
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                    </svg>
                                </button>
                            </div>
                        </motion.div>
                    )}

                    {/* Step 2: Document Verification */}
                    {currentStep === 2 && (
                        <motion.div
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            className="space-y-4"
                        >
                            <div>
                                <label htmlFor="rationCardNumber" className="block text-sm font-medium text-gray-700">
                                    Ration Card Number <span className="text-red-500">*</span>
                                </label>
                                <input
                                    id="rationCardNumber"
                                    name="rationCardNumber"
                                    type="text"
                                    required
                                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                                    value={formData.rationCardNumber}
                                    onChange={handleInputChange}
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Upload Ration Card Image <span className="text-red-500">*</span>
                                </label>
                                <div
                                    className={`mt-1 flex justify-center px-6 pt-5 pb-6 border-2 ${rationCardImage ? 'border-blue-300 bg-blue-50' : 'border-gray-300 border-dashed'} rounded-md transition-colors duration-200 hover:bg-gray-50`}
                                    onDragOver={(e) => e.preventDefault()}
                                    onDrop={(e) => {
                                        e.preventDefault();
                                        const file = e.dataTransfer.files[0];
                                        if (file) {
                                            const changeEvent = { target: { files: [file] } };
                                            handleImageChange(changeEvent);
                                        }
                                    }}
                                >
                                    <div className="space-y-1 text-center">
                                        {imagePreview ? (
                                            <div className="mb-3">
                                                <img
                                                    src={imagePreview}
                                                    alt="Ration Card Preview"
                                                    className="mx-auto h-40 object-contain rounded-md"
                                                />
                                                <p className="mt-2 text-sm text-blue-500">
                                                    {rationCardImage.name}
                                                </p>
                                            </div>
                                        ) : (
                                            <svg
                                                className="mx-auto h-12 w-12 text-gray-400"
                                                stroke="currentColor"
                                                fill="none"
                                                viewBox="0 0 48 48"
                                            >
                                                <path
                                                    d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                                                    strokeWidth="2"
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                />
                                            </svg>
                                        )}
                                        <div className="flex text-sm text-gray-600 justify-center">
                                            <label
                                                htmlFor="rationCardImage"
                                                className="relative cursor-pointer bg-white rounded-md font-medium text-blue-600 hover:text-blue-500 focus-within:outline-none px-2 py-1"
                                            >
                                                <span>{imagePreview ? 'Change file' : 'Upload a file'}</span>
                                                <input
                                                    id="rationCardImage"
                                                    name="rationCardImage"
                                                    type="file"
                                                    className="sr-only"
                                                    accept="image/*,application/pdf"
                                                    onChange={handleImageChange}
                                                />
                                            </label>
                                            {!imagePreview && <p className="pl-1 pt-1">or drag and drop</p>}
                                        </div>
                                        <p className="text-xs text-gray-500">
                                            PNG, JPG, JPEG or PDF up to 5MB
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <div>
                                <label htmlFor="additionalInfo" className="block text-sm font-medium text-gray-700">
                                    Additional Information (Optional)
                                </label>
                                <textarea
                                    id="additionalInfo"
                                    name="additionalInfo"
                                    rows="3"
                                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                                    placeholder="Add any other relevant information here"
                                    value={formData.additionalInfo}
                                    onChange={handleInputChange}
                                />
                            </div>

                            <div className="mt-2 text-sm text-gray-500">
                                <p>
                                    By submitting this form, you confirm that all information provided is true and correct.
                                </p>
                            </div>

                            <div className="flex justify-between mt-6">
                                <button
                                    type="button"
                                    onClick={handlePrevStep}
                                    className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                                    </svg>
                                    Back
                                </button>
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className={`relative inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white ${loading ? 'bg-blue-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'
                                        } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500`}
                                >
                                    {loading ? (
                                        <>
                                            {uploadProgress > 0 ? (
                                                <div className="flex items-center">
                                                    <div className="w-16 bg-blue-300 rounded-full h-2 mr-2">
                                                        <div
                                                            className="bg-white h-2 rounded-full"
                                                            style={{ width: `${uploadProgress}%` }}
                                                        ></div>
                                                    </div>
                                                    <span>{uploadProgress}%</span>
                                                </div>
                                            ) : (
                                                <>
                                                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                                    </svg>
                                                    Processing
                                                </>
                                            )}
                                        </>
                                    ) : (
                                        <>
                                            Submit Application
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                            </svg>
                                        </>
                                    )}
                                </button>
                            </div>
                        </motion.div>
                    )}
                </form>

                <div className="text-center mt-4">
                    <Link to="/dashboard" className="text-sm font-medium text-blue-600 hover:text-blue-500 inline-flex items-center">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                        </svg>
                        Return to Dashboard
                    </Link>
                </div>
            </motion.div>
        </div>
    );
};

export default PovertyVerification;
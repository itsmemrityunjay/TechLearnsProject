import React, { useState, useEffect } from 'react';
import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

const ProfileSection = ({ mentor, setMentor, onProfileUpdate }) => {
    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState({
        firstName: "",
        lastName: "",
        email: "",
        contactNumber: "",
        bio: "",
        expertise: [],
        education: {
            degree: "",
            institution: "",
            year: "",
        },
        experience: "",
        profileImage: "",
        socialLinks: {
            linkedin: "",
            twitter: "",
            github: "",
            website: "",
        }
    });
    const [newExpertise, setNewExpertise] = useState("");
    const [imageUploading, setImageUploading] = useState(false);
    const [error, setError] = useState("");
    const [profileUpdating, setProfileUpdating] = useState(false);

    // Initialize form data when mentor data is available
    useEffect(() => {
        if (mentor) {
            setFormData({
                firstName: mentor.firstName || "",
                lastName: mentor.lastName || "",
                email: mentor.email || "",
                contactNumber: mentor.contactNumber || "",
                bio: mentor.bio || "",
                expertise: Array.isArray(mentor.expertise) ? mentor.expertise : [],
                education: {
                    degree: mentor.education?.degree || "",
                    institution: mentor.education?.institution || "",
                    year: mentor.education?.year || "",
                },
                experience: mentor.experience || "",
                profileImage: mentor.profileImage || "",
                socialLinks: {
                    linkedin: mentor.socialLinks?.linkedin || "",
                    twitter: mentor.socialLinks?.twitter || "",
                    github: mentor.socialLinks?.github || "",
                    website: mentor.socialLinks?.website || "",
                }
            });
        }
    }, [mentor]);

    const handleChange = (e) => {
        const { name, value } = e.target;

        // Handle nested objects
        if (name.includes('.')) {
            const [parent, child] = name.split('.');
            setFormData({
                ...formData,
                [parent]: {
                    ...formData[parent],
                    [child]: value
                }
            });
        } else {
            setFormData({
                ...formData,
                [name]: value
            });
        }
    };

    const handleAddExpertise = () => {
        if (newExpertise.trim() !== "" && !formData.expertise.includes(newExpertise.trim())) {
            setFormData({
                ...formData,
                expertise: [...formData.expertise, newExpertise.trim()]
            });
            setNewExpertise("");
        }
    };

    const handleRemoveExpertise = (expertiseToRemove) => {
        setFormData({
            ...formData,
            expertise: formData.expertise.filter(exp => exp !== expertiseToRemove)
        });
    };

    const handleImageUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        // Validate file size
        if (file.size > 5 * 1024 * 1024) { // 5MB limit
            setError('Image file size must be less than 5MB');
            return;
        }

        // Validate file type
        const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
        if (!allowedTypes.includes(file.type)) {
            setError('Please select a valid image file (JPEG, PNG, GIF, WEBP)');
            return;
        }

        setImageUploading(true);
        setError('');

        const formDataImg = new FormData();
        formDataImg.append("image", file);

        try {
            const token = localStorage.getItem("token");
            const config = {
                headers: {
                    "Content-Type": "multipart/form-data",
                    Authorization: `Bearer ${token}`,
                },
            };

            const { data } = await axios.post(
                `${API_BASE_URL}/api/mentors/upload`,
                formDataImg,
                config
            );

            if (data && (data.imageUrl || data.fileUrl)) {
                setFormData({
                    ...formData,
                    profileImage: data.imageUrl || data.fileUrl,
                });
            } else {
                setError('Server returned an invalid response format');
            }
        } catch (error) {
            console.error('Image upload error:', error);
            setError(
                error.response?.data?.message ||
                'Error uploading image. Please try again.'
            );
        } finally {
            setImageUploading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setProfileUpdating(true);
        setError('');

        try {
            const token = localStorage.getItem("token");
            if (!token) {
                setError("Authentication token not found. Please log in again.");
                return;
            }

            const config = {
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
            };

            const { data } = await axios.put(
                `${API_BASE_URL}/api/mentors/profile`,
                formData,
                config
            );

            setMentor(data);
            setIsEditing(false);

            // Notify parent component
            if (onProfileUpdate) {
                onProfileUpdate(data);
            }

            // Update local storage if needed
            const userInfo = JSON.parse(localStorage.getItem("userInfo") || "{}");
            localStorage.setItem(
                "userInfo",
                JSON.stringify({
                    ...userInfo,
                    firstName: data.firstName,
                    lastName: data.lastName,
                    profileImage: data.profileImage,
                })
            );
        } catch (error) {
            console.error('Profile update error:', error);
            setError(
                error.response?.data?.message ||
                'Error updating profile. Please try again.'
            );
        } finally {
            setProfileUpdating(false);
        }
    };

    if (!mentor) {
        return <div className="text-center py-6">Loading mentor profile...</div>;
    }

    return (
        <div className="bg-white shadow rounded-lg overflow-hidden">
            <div className="bg-gradient-to-r from-indigo-600 to-purple-600 px-6 py-4">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                    <h2 className="text-2xl font-bold text-white">Mentor Profile</h2>
                    <button
                        onClick={() => setIsEditing(!isEditing)}
                        className="mt-4 md:mt-0 px-4 py-2 bg-white text-indigo-600 rounded-md hover:bg-gray-100 transition-colors"
                    >
                        {isEditing ? "Cancel Editing" : "Edit Profile"}
                    </button>
                </div>
            </div>

            {error && (
                <div className="bg-red-50 border-l-4 border-red-500 p-4 m-6">
                    <div className="flex items-center">
                        <div className="flex-shrink-0">
                            <svg
                                className="h-5 w-5 text-red-400"
                                xmlns="http://www.w3.org/2000/svg"
                                viewBox="0 0 20 20"
                                fill="currentColor"
                            >
                                <path
                                    fillRule="evenodd"
                                    d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                                    clipRule="evenodd"
                                />
                            </svg>
                        </div>
                        <div className="ml-3">
                            <p className="text-sm text-red-700">{error}</p>
                        </div>
                    </div>
                </div>
            )}

            {isEditing ? (
                <form onSubmit={handleSubmit} className="p-6">
                    {/* Profile Image */}
                    <div className="mb-6 flex flex-col items-center">
                        <div className="relative">
                            <img
                                src={
                                    formData.profileImage ||
                                    "https://avatar.iran.liara.run/public/boy"
                                }
                                alt="Profile"
                                className="w-32 h-32 rounded-full object-cover border-4 border-white shadow-md"
                            />
                            <label
                                htmlFor="profile-image"
                                className="absolute bottom-0 right-0 bg-indigo-500 text-white p-2 rounded-full cursor-pointer hover:bg-indigo-600 transition-colors shadow-md"
                            >
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    className="h-5 w-5"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth="2"
                                        d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"
                                    />
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth="2"
                                        d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"
                                    />
                                </svg>
                                <input
                                    type="file"
                                    id="profile-image"
                                    accept="image/*"
                                    className="hidden"
                                    onChange={handleImageUpload}
                                    disabled={imageUploading}
                                />
                            </label>
                            {imageUploading && (
                                <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 rounded-full">
                                    <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-white"></div>
                                </div>
                            )}
                        </div>
                        <p className="text-sm text-gray-500 mt-2">
                            Click the camera icon to change your profile picture
                        </p>
                    </div>

                    {/* Personal Information */}
                    <div className="bg-gray-50 p-4 rounded-md mb-6">
                        <h3 className="text-lg font-semibold text-gray-800 mb-4">
                            Personal Information
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700">
                                    First Name
                                </label>
                                <input
                                    type="text"
                                    name="firstName"
                                    value={formData.firstName}
                                    onChange={handleChange}
                                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">
                                    Last Name
                                </label>
                                <input
                                    type="text"
                                    name="lastName"
                                    value={formData.lastName}
                                    onChange={handleChange}
                                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">
                                    Email
                                </label>
                                <input
                                    type="email"
                                    value={mentor.email}
                                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 bg-gray-100 text-gray-600 sm:text-sm cursor-not-allowed"
                                    disabled
                                />
                                <p className="text-xs text-gray-500 mt-1">
                                    Email cannot be changed
                                </p>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">
                                    Contact Number
                                </label>
                                <input
                                    type="text"
                                    name="contactNumber"
                                    value={formData.contactNumber}
                                    onChange={handleChange}
                                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Professional Information */}
                    <div className="bg-gray-50 p-4 rounded-md mb-6">
                        <h3 className="text-lg font-semibold text-gray-800 mb-4">
                            Professional Information
                        </h3>
                        <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Bio
                            </label>
                            <textarea
                                name="bio"
                                value={formData.bio}
                                onChange={handleChange}
                                rows={4}
                                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                placeholder="Tell students about yourself, your teaching style, and expertise..."
                            ></textarea>
                        </div>
                        <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Years of Experience
                            </label>
                            <input
                                type="number"
                                name="experience"
                                value={formData.experience}
                                onChange={handleChange}
                                min="0"
                                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                            />
                        </div>
                    </div>

                    {/* Education */}
                    <div className="bg-gray-50 p-4 rounded-md mb-6">
                        <h3 className="text-lg font-semibold text-gray-800 mb-4">
                            Education
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700">
                                    Degree
                                </label>
                                <input
                                    type="text"
                                    name="education.degree"
                                    value={formData.education.degree}
                                    onChange={handleChange}
                                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">
                                    Institution
                                </label>
                                <input
                                    type="text"
                                    name="education.institution"
                                    value={formData.education.institution}
                                    onChange={handleChange}
                                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">
                                    Year
                                </label>
                                <input
                                    type="number"
                                    name="education.year"
                                    value={formData.education.year}
                                    onChange={handleChange}
                                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Areas of Expertise */}
                    <div className="bg-gray-50 p-4 rounded-md mb-6">
                        <h3 className="text-lg font-semibold text-gray-800 mb-4">
                            Areas of Expertise
                        </h3>
                        <div className="flex flex-wrap gap-2 mb-4">
                            {formData.expertise.map((expertise, index) => (
                                <div
                                    key={index}
                                    className="bg-indigo-100 text-indigo-800 px-3 py-1 rounded-full flex items-center"
                                >
                                    <span>{expertise}</span>
                                    <button
                                        type="button"
                                        onClick={() => handleRemoveExpertise(expertise)}
                                        className="ml-2 text-indigo-600 hover:text-indigo-800 focus:outline-none"
                                    >
                                        <svg
                                            xmlns="http://www.w3.org/2000/svg"
                                            className="h-4 w-4"
                                            fill="none"
                                            viewBox="0 0 24 24"
                                            stroke="currentColor"
                                        >
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                strokeWidth="2"
                                                d="M6 18L18 6M6 6l12 12"
                                            />
                                        </svg>
                                    </button>
                                </div>
                            ))}
                        </div>
                        <div className="flex gap-2">
                            <input
                                type="text"
                                value={newExpertise}
                                onChange={(e) => setNewExpertise(e.target.value)}
                                placeholder="Add a new expertise"
                                className="flex-1 border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                            />
                            <button
                                type="button"
                                onClick={handleAddExpertise}
                                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                            >
                                Add
                            </button>
                        </div>
                    </div>

                    {/* Social Links */}
                    <div className="bg-gray-50 p-4 rounded-md mb-6">
                        <h3 className="text-lg font-semibold text-gray-800 mb-4">
                            Social Links
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700">
                                    LinkedIn
                                </label>
                                <input
                                    type="text"
                                    name="socialLinks.linkedin"
                                    value={formData.socialLinks.linkedin}
                                    onChange={handleChange}
                                    placeholder="https://linkedin.com/in/username"
                                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">
                                    Twitter
                                </label>
                                <input
                                    type="text"
                                    name="socialLinks.twitter"
                                    value={formData.socialLinks.twitter}
                                    onChange={handleChange}
                                    placeholder="https://twitter.com/username"
                                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">
                                    GitHub
                                </label>
                                <input
                                    type="text"
                                    name="socialLinks.github"
                                    value={formData.socialLinks.github}
                                    onChange={handleChange}
                                    placeholder="https://github.com/username"
                                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">
                                    Personal Website
                                </label>
                                <input
                                    type="text"
                                    name="socialLinks.website"
                                    value={formData.socialLinks.website}
                                    onChange={handleChange}
                                    placeholder="https://yourwebsite.com"
                                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Submit Button */}
                    <div className="flex justify-end">
                        <button
                            type="submit"
                            disabled={profileUpdating}
                            className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                        >
                            {profileUpdating ? (
                                <>
                                    <svg
                                        className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                                        xmlns="http://www.w3.org/2000/svg"
                                        fill="none"
                                        viewBox="0 0 24 24"
                                    >
                                        <circle
                                            className="opacity-25"
                                            cx="12"
                                            cy="12"
                                            r="10"
                                            stroke="currentColor"
                                            strokeWidth="4"
                                        ></circle>
                                        <path
                                            className="opacity-75"
                                            fill="currentColor"
                                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                        ></path>
                                    </svg>
                                    Saving Changes...
                                </>
                            ) : (
                                "Save Changes"
                            )}
                        </button>
                    </div>
                </form>
            ) : (
                <div className="p-6">
                    {/* Profile View Mode */}
                    <div className="flex flex-col md:flex-row items-center md:items-start mb-8">
                        <div className="mb-4 md:mb-0 md:mr-8 flex flex-col items-center">
                            <img
                                src={
                                    mentor.profileImage ||
                                    "https://avatar.iran.liara.run/public/boy"
                                }
                                alt="Profile"
                                className="w-32 h-32 rounded-full object-cover border-4 border-white shadow-md"
                            />
                            <div className="mt-4 text-center">
                                <div className="font-semibold text-lg text-gray-800">
                                    {mentor.firstName} {mentor.lastName}
                                </div>
                                <div className="text-gray-600">
                                    {mentor.email ? `@${mentor.email.split("@")[0]}` : ""}
                                </div>
                            </div>
                        </div>

                        <div className="flex-1">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-y-4 gap-x-6">
                                <div>
                                    <h3 className="text-sm font-medium text-gray-500">Email</h3>
                                    <p className="mt-1 text-sm text-gray-900">{mentor.email}</p>
                                </div>

                                <div>
                                    <h3 className="text-sm font-medium text-gray-500">
                                        Contact Number
                                    </h3>
                                    <p className="mt-1 text-sm text-gray-900">
                                        {mentor.contactNumber || "Not provided"}
                                    </p>
                                </div>

                                <div>
                                    <h3 className="text-sm font-medium text-gray-500">
                                        Experience
                                    </h3>
                                    <p className="mt-1 text-sm text-gray-900">
                                        {mentor.experience ? `${mentor.experience} years` : "Not provided"}
                                    </p>
                                </div>

                                <div>
                                    <h3 className="text-sm font-medium text-gray-500">
                                        Member Since
                                    </h3>
                                    <p className="mt-1 text-sm text-gray-900">
                                        {mentor.createdAt
                                            ? new Date(mentor.createdAt).toLocaleDateString("en-US", {
                                                year: "numeric",
                                                month: "long",
                                                day: "numeric",
                                            })
                                            : "Not available"}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Bio */}
                    <div className="border-t border-gray-200 pt-6 mb-6">
                        <h2 className="text-lg font-medium text-gray-900 mb-2">About Me</h2>
                        <p className="text-gray-700 whitespace-pre-line">
                            {mentor.bio || "Bio not provided yet."}
                        </p>
                    </div>

                    {/* Education */}
                    <div className="border-t border-gray-200 pt-6 mb-6">
                        <h2 className="text-lg font-medium text-gray-900 mb-4">
                            Education
                        </h2>
                        {mentor.education &&
                            (mentor.education.degree || mentor.education.institution) ? (
                            <div className="bg-white rounded-md p-4 border border-gray-200">
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <div>
                                        <h3 className="text-sm font-medium text-gray-500">
                                            Degree
                                        </h3>
                                        <p className="mt-1 text-sm text-gray-900">
                                            {mentor.education.degree || "Not specified"}
                                        </p>
                                    </div>
                                    <div>
                                        <h3 className="text-sm font-medium text-gray-500">
                                            Institution
                                        </h3>
                                        <p className="mt-1 text-sm text-gray-900">
                                            {mentor.education.institution || "Not specified"}
                                        </p>
                                    </div>
                                    <div>
                                        <h3 className="text-sm font-medium text-gray-500">
                                            Year
                                        </h3>
                                        <p className="mt-1 text-sm text-gray-900">
                                            {mentor.education.year || "Not specified"}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <p className="text-gray-500 italic">
                                No education details provided
                            </p>
                        )}
                    </div>

                    {/* Areas of Expertise */}
                    <div className="border-t border-gray-200 pt-6 mb-6">
                        <h2 className="text-lg font-medium text-gray-900 mb-4">Areas of Expertise</h2>
                        {mentor.expertise && mentor.expertise.length > 0 ? (
                            <div className="flex flex-wrap gap-2">
                                {mentor.expertise.map((expertise, index) => (
                                    <span
                                        key={index}
                                        className="bg-indigo-100 text-indigo-800 px-3 py-1 rounded-full text-sm"
                                    >
                                        {expertise}
                                    </span>
                                ))}
                            </div>
                        ) : (
                            <p className="text-gray-500 italic">No expertise areas added</p>
                        )}
                    </div>

                    {/* Social Links */}
                    <div className="border-t border-gray-200 pt-6 mb-6">
                        <h2 className="text-lg font-medium text-gray-900 mb-4">Connect with me</h2>
                        {mentor.socialLinks &&
                            Object.values(mentor.socialLinks).some(link => link) ? (
                            <div className="flex flex-wrap gap-4">
                                {mentor.socialLinks.linkedin && (
                                    <a
                                        href={mentor.socialLinks.linkedin}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="inline-flex items-center text-gray-700 hover:text-indigo-600"
                                    >
                                        <svg className="h-5 w-5 mr-1" fill="currentColor" viewBox="0 0 24 24">
                                            <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
                                        </svg>
                                        LinkedIn
                                    </a>
                                )}
                                {mentor.socialLinks.twitter && (
                                    <a
                                        href={mentor.socialLinks.twitter}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="inline-flex items-center text-gray-700 hover:text-indigo-600"
                                    >
                                        <svg className="h-5 w-5 mr-1" fill="currentColor" viewBox="0 0 24 24">
                                            <path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z" />
                                        </svg>
                                        Twitter
                                    </a>
                                )}
                                {mentor.socialLinks.github && (
                                    <a
                                        href={mentor.socialLinks.github}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="inline-flex items-center text-gray-700 hover:text-indigo-600"
                                    >
                                        <svg className="h-5 w-5 mr-1" fill="currentColor" viewBox="0 0 24 24">
                                            <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
                                        </svg>
                                        GitHub
                                    </a>
                                )}
                                {mentor.socialLinks.website && (
                                    <a
                                        href={mentor.socialLinks.website}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="inline-flex items-center text-gray-700 hover:text-indigo-600"
                                    >
                                        <svg className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
                                        </svg>
                                        Website
                                    </a>
                                )}
                            </div>
                        ) : (
                            <p className="text-gray-500 italic">No social links provided</p>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default ProfileSection;
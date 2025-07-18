import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import api from '../../../utils/axiosConfig';

// Fix the API URL throughout the component
const API_BASE_URL = import.meta.env.VITE_API_URL;

const UserProfile = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [imageUploading, setImageUploading] = useState(false);
  const [profileUpdating, setProfileUpdating] = useState(false);
  // ...existing state declarations...
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    contactNumber: "",
    schoolOrganizationName: "",
    education: {
      level: "",
      institution: "",
      year: "",
    },
    address: {
      street: "",
      city: "",
      state: "",
      country: "",
      pincode: "",
    },
    skills: [],
    profileImage: "",
    belowPoverty: {
      status: false,
      document: "",
    },
  });
  const [newSkill, setNewSkill] = useState("");

  const navigate = useNavigate();

  // Get user data
  useEffect(() => {
    const fetchUserData = async () => {
      setLoading(true);
      setError("");

      try {
        const token = localStorage.getItem("token");
        if (!token) {
          navigate("/login");
          return;
        }

        const config = {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        };

        console.log('Fetching user profile with token:', token?.substring(0, 10) + '...');

        const { data } = await api.get(
          `${API_BASE_URL}/api/users/profile`,
          config
        );

        console.log('User data received:', data);

        if (data) {
          setUser(data);

          // Initialize form data from user data with fallbacks for all properties
          setFormData({
            firstName: data.firstName || "",
            lastName: data.lastName || "",
            email: data.email || "",
            contactNumber: data.contactNumber || "",
            schoolOrganizationName: data.schoolOrganizationName || "",
            education: {
              level: data.education?.level || "",
              institution: data.education?.institution || "",
              year: data.education?.year || "",
            },
            address: {
              street: data.address?.street || "",
              city: data.address?.city || "",
              state: data.address?.state || "",
              country: data.address?.country || "",
              pincode: data.address?.pincode || "",
            },
            skills: Array.isArray(data.skills) ? data.skills : [],
            profileImage: data.profileImage || "",
            belowPoverty: {
              status: data.belowPoverty?.status || false,
              document: data.belowPoverty?.document || "",
            },
          });
        } else {
          setError("Invalid or empty response received from server");
        }
      } catch (error) {
        console.error('Error fetching user data:', error);

        if (error.response) {
          console.error('Server response:', error.response.data);
          setError(`Failed to load profile: ${error.response.data?.message || error.response.statusText}`);

          if (error.response.status === 401) {
            localStorage.removeItem("token");
            localStorage.removeItem("userInfo");
            navigate("/login");
          }
        } else if (error.request) {
          console.error('No response received:', error.request);
          setError("Server not responding. Please check your connection and try again.");
        } else {
          console.error('Request setup error:', error.message);
          setError(`Error: ${error.message}`);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name.includes(".")) {
      const [parent, child] = name.split(".");
      setFormData({
        ...formData,
        [parent]: {
          ...formData[parent],
          [child]: value,
        },
      });
    } else {
      setFormData({
        ...formData,
        [name]: value,
      });
    }
  };

  const handleAddSkill = () => {
    if (newSkill.trim() !== "" && !formData.skills.includes(newSkill.trim())) {
      setFormData({
        ...formData,
        skills: [...formData.skills, newSkill.trim()],
      });
      setNewSkill("");
    }
  };

  const handleRemoveSkill = (skillToRemove) => {
    setFormData({
      ...formData,
      skills: formData.skills.filter((skill) => skill !== skillToRemove),
    });
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // File size validation
    if (file.size > 5 * 1024 * 1024) {
      setError('Image file size must be less than 5MB');
      return;
    }

    // File type validation
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      setError('Please select a valid image file (JPEG, PNG, GIF, WEBP)');
      return;
    }

    const formDataImg = new FormData();
    formDataImg.append("file", file); // Changed from "image" to "file" to match backend

    setImageUploading(true);
    setError('');

    try {
      const token = localStorage.getItem("token");
      const config = {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${token}`,
        },
      };

      const { data } = await axios.post(
        `${API_BASE_URL}/api/upload`,  // Changed from /api/users/upload to /api/upload
        formDataImg,
        config
      );

      console.log('Image upload response:', data);

      // Handle different response formats
      const imageUrl = data.url || data.fileUrl;

      if (imageUrl) {
        setFormData({
          ...formData,
          profileImage: imageUrl,
        });
      } else {
        console.error('Invalid image URL in response:', data);
        setError('Server returned an invalid image URL format');
      }
    } catch (error) {
      console.error('Image upload error:', error);

      if (error.response) {
        console.error('Error details:', {
          status: error.response.status,
          data: error.response.data
        });

        setError(
          error.response?.data?.message ||
          `Upload failed (${error.response.status}). Please try again.`
        );
      } else if (error.request) {
        setError('No response from server. Check your connection and try again.');
      } else {
        setError(`Image upload failed: ${error.message}`);
      }
    } finally {
      setImageUploading(false);
    }
  };

  const handleDocumentUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file size
    if (file.size > 5 * 1024 * 1024) {
      setError('Document file size must be less than 5MB');
      return;
    }

    // Validate file type
    const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png', 'image/jpg'];
    if (!allowedTypes.includes(file.type)) {
      setError('Please select a valid document file (PDF, JPEG, PNG)');
      return;
    }

    const formDataDoc = new FormData();
    formDataDoc.append("file", file); // Changed from "document" to "file" to match backend

    setError('');
    const tempBtnText = document.getElementById('upload-doc-btn').innerText;
    document.getElementById('upload-doc-btn').innerText = "Uploading...";

    try {
      const token = localStorage.getItem("token");
      const config = {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${token}`,
        },
      };

      const { data } = await axios.post(
        `${API_BASE_URL}/api/upload`,  // Changed from /api/users/upload to /api/upload
        formDataDoc,
        config
      );

      console.log('Document upload response:', data);

      // Handle different response formats
      const documentUrl = data.url || data.fileUrl;

      if (documentUrl) {
        setFormData({
          ...formData,
          belowPoverty: {
            ...formData.belowPoverty,
            document: documentUrl,
          },
        });
      } else {
        setError('Invalid response from server during document upload');
      }
    } catch (error) {
      console.error('Document upload error:', error);

      if (error.response) {
        setError(`Upload failed: ${error.response.data?.message || error.response.statusText}`);
      } else if (error.request) {
        setError('No server response. Check your connection.');
      } else {
        setError(`Upload error: ${error.message}`);
      }
    } finally {
      document.getElementById('upload-doc-btn').innerText = tempBtnText;
    }
  };

  const validateForm = () => {
    // Required fields
    if (!formData.firstName || !formData.lastName) {
      setError("First name and last name are required");
      return false;
    }

    // Validate email format if present
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (formData.email && !emailRegex.test(formData.email)) {
      setError("Please enter a valid email address");
      return false;
    }

    // Validate phone number if present
    if (formData.contactNumber && !/^\d{7,15}$/.test(formData.contactNumber.replace(/[\s-]/g, ''))) {
      setError("Please enter a valid contact number");
      return false;
    }

    // Year validation
    if (formData.education.year && (isNaN(formData.education.year) || formData.education.year < 1900 || formData.education.year > new Date().getFullYear())) {
      setError("Please enter a valid year");
      return false;
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setProfileUpdating(true);
    setError("");

    try {
      const token = localStorage.getItem("token");
      if (!token) {
        setError("Authentication token not found. Please log in again.");
        navigate("/login");
        return;
      }

      const config = {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      };

      // Always send email
      const payload = { ...formData, email: user.email };

      const { data } = await axios.put(
        `${API_BASE_URL}/api/users/profile`,
        payload,
        config
      );

      setUser(data);
      setIsEditing(false);

      // Update local storage user info
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

      setError("");
      alert("Profile updated successfully!");
    } catch (error) {
      // ...existing error handling...
    } finally {
      setProfileUpdating(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#f99e1c]"></div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="bg-white border-l-4 border-[#f99e1c] p-4 rounded shadow-md">
          <p className="text-gray-700">Failed to load user data. Please try again later.</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 px-4 py-2 bg-[#013954] text-white rounded hover:bg-opacity-90 transition-all"
          >
            Refresh Page
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8">
      <div className="bg-white shadow-md rounded-lg overflow-hidden border border-gray-100">
        {/* Profile Header */}
        <div className="bg-gradient-to-r from-[#013954] to-[#02507c] px-8 py-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between">
            <h1 className="text-2xl font-bold text-white">My Profile</h1>
            <button
              onClick={() => setIsEditing(!isEditing)}
              className="mt-4 md:mt-0 px-5 py-2 bg-[#f99e1c] text-white rounded-md hover:bg-[#e08c10] transition-colors shadow-sm font-medium"
            >
              {isEditing ? "Cancel Editing" : "Edit Profile"}
            </button>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border-l-4 border-red-400 p-4 mx-6 my-4 rounded">
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
            <div className="mb-8 flex flex-col items-center">
              <div className="relative">
                <img
                  src={
                    formData.profileImage?.startsWith('data:') ||
                      formData.profileImage?.startsWith('http') ?
                      formData.profileImage :
                      `${API_BASE_URL}${formData.profileImage}` ||
                      "https://avatar.iran.liara.run/public"
                  }
                  alt="Profile"
                  className="w-32 h-32 rounded-full object-cover border-4 border-white shadow-lg"
                />
                <label
                  htmlFor="profile-image"
                  className="absolute bottom-0 right-0 bg-[#f99e1c] text-white p-2 rounded-full cursor-pointer hover:bg-[#e08c10] transition-all shadow-md"
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
            <div className="bg-white p-6 rounded-lg mb-6 shadow-sm border border-gray-100">
              <h2 className="text-lg font-semibold text-[#013954] mb-4 pb-2 border-b border-gray-100">
                Personal Information
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    First Name
                  </label>
                  <input
                    type="text"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleChange}
                    className="block w-full border border-gray-200 rounded-md px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#f99e1c] focus:border-transparent transition-all text-gray-800"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Last Name
                  </label>
                  <input
                    type="text"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleChange}
                    className="block w-full border border-gray-200 rounded-md px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#f99e1c] focus:border-transparent transition-all text-gray-800"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email
                  </label>
                  <input
                    type="email"
                    value={user.email}
                    className="block w-full border border-gray-200 rounded-md px-4 py-2.5 bg-gray-50 text-gray-500 cursor-not-allowed"
                    disabled
                  />
                  <p className="text-xs text-gray-400 mt-1">
                    Email cannot be changed
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Contact Number
                  </label>
                  <input
                    type="text"
                    name="contactNumber"
                    value={formData.contactNumber}
                    onChange={handleChange}
                    className="block w-full border border-gray-200 rounded-md px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#f99e1c] focus:border-transparent transition-all text-gray-800"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    School/Organization
                  </label>
                  <input
                    type="text"
                    name="schoolOrganizationName"
                    value={formData.schoolOrganizationName}
                    onChange={handleChange}
                    className="block w-full border border-gray-200 rounded-md px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#f99e1c] focus:border-transparent transition-all text-gray-800"
                  />
                </div>
              </div>
            </div>

            {/* Education */}
            <div className="bg-white p-6 rounded-lg mb-6 shadow-sm border border-gray-100">
              <h2 className="text-lg font-semibold text-[#013954] mb-4 pb-2 border-b border-gray-100">
                Education
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Level
                  </label>
                  <select
                    name="education.level"
                    value={formData.education.level}
                    onChange={handleChange}
                    className="block w-full border border-gray-200 rounded-md px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#f99e1c] focus:border-transparent transition-all text-gray-800"
                  >
                    <option value="">Select Level</option>
                    <option value="Elementary">Elementary</option>
                    <option value="High School">High School</option>
                    <option value="Undergraduate">Undergraduate</option>
                    <option value="Graduate">Graduate</option>
                    <option value="Postgraduate">Postgraduate</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Institution
                  </label>
                  <input
                    type="text"
                    name="education.institution"
                    value={formData.education.institution}
                    onChange={handleChange}
                    className="block w-full border border-gray-200 rounded-md px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#f99e1c] focus:border-transparent transition-all text-gray-800"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Year
                  </label>
                  <input
                    type="number"
                    name="education.year"
                    value={formData.education.year}
                    onChange={handleChange}
                    className="block w-full border border-gray-200 rounded-md px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#f99e1c] focus:border-transparent transition-all text-gray-800"
                  />
                </div>
              </div>
            </div>

            {/* Address */}
            <div className="bg-white p-6 rounded-lg mb-6 shadow-sm border border-gray-100">
              <h2 className="text-lg font-semibold text-[#013954] mb-4 pb-2 border-b border-gray-100">
                Address
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Street
                  </label>
                  <input
                    type="text"
                    name="address.street"
                    value={formData.address.street}
                    onChange={handleChange}
                    className="block w-full border border-gray-200 rounded-md px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#f99e1c] focus:border-transparent transition-all text-gray-800"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    City
                  </label>
                  <input
                    type="text"
                    name="address.city"
                    value={formData.address.city}
                    onChange={handleChange}
                    className="block w-full border border-gray-200 rounded-md px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#f99e1c] focus:border-transparent transition-all text-gray-800"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    State
                  </label>
                  <input
                    type="text"
                    name="address.state"
                    value={formData.address.state}
                    onChange={handleChange}
                    className="block w-full border border-gray-200 rounded-md px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#f99e1c] focus:border-transparent transition-all text-gray-800"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Country
                  </label>
                  <input
                    type="text"
                    name="address.country"
                    value={formData.address.country}
                    onChange={handleChange}
                    className="block w-full border border-gray-200 rounded-md px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#f99e1c] focus:border-transparent transition-all text-gray-800"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Pin Code
                  </label>
                  <input
                    type="text"
                    name="address.pincode"
                    value={formData.address.pincode}
                    onChange={handleChange}
                    className="block w-full border border-gray-200 rounded-md px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#f99e1c] focus:border-transparent transition-all text-gray-800"
                  />
                </div>
              </div>
            </div>

            {/* Skills */}
            <div className="bg-white p-6 rounded-lg mb-6 shadow-sm border border-gray-100">
              <h2 className="text-lg font-semibold text-[#013954] mb-4 pb-2 border-b border-gray-100">
                Skills
              </h2>
              <div className="flex flex-wrap gap-2 mb-4">
                {formData.skills.map((skill, index) => (
                  <div
                    key={index}
                    className="bg-[#013954] bg-opacity-10 text-[#013954] px-3 py-1.5 rounded-full flex items-center"
                  >
                    <span className="text-sm">{skill}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveSkill(skill)}
                      className="ml-2 text-[#013954] hover:text-[#f99e1c] transition-colors focus:outline-none"
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
                  value={newSkill}
                  onChange={(e) => setNewSkill(e.target.value)}
                  placeholder="Add a new skill"
                  className="flex-1 border border-gray-200 rounded-md px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#f99e1c] focus:border-transparent transition-all text-gray-800"
                />
                <button
                  type="button"
                  onClick={handleAddSkill}
                  className="px-5 py-2.5 bg-[#013954] text-white rounded-md hover:bg-opacity-90 transition-colors shadow-sm font-medium"
                >
                  Add
                </button>
              </div>
            </div>

            {/* Below Poverty Status */}
            <div className="bg-white p-6 rounded-lg mb-6 shadow-sm border border-gray-100">
              <h2 className="text-lg font-semibold text-[#013954] mb-4 pb-2 border-b border-gray-100">
                Below Poverty Status
              </h2>
              <div className="flex items-center mb-4">
                <input
                  id="poverty-status"
                  type="checkbox"
                  checked={formData.belowPoverty.status}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      belowPoverty: {
                        ...formData.belowPoverty,
                        status: e.target.checked,
                      },
                    })
                  }
                  className="h-5 w-5 text-[#f99e1c] focus:ring-[#f99e1c] border-gray-300 rounded transition-all"
                />
                <label
                  htmlFor="poverty-status"
                  className="ml-2 text-sm text-gray-700"
                >
                  I am from a below poverty level background
                </label>
              </div>
              {formData.belowPoverty.status && (
                <div className="p-4 bg-gray-50 rounded-md">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Upload Verification Document (Ration Card etc.)
                  </label>
                  <div className="flex items-center">
                    {formData.belowPoverty.document && (
                      <div className="flex items-center mr-4">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-5 w-5 text-green-500"
                          viewBox="0 0 20 20"
                          fill="currentColor"
                        >
                          <path
                            fillRule="evenodd"
                            d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                            clipRule="evenodd"
                          />
                        </svg>
                        <span className="ml-1 text-sm text-gray-700">
                          Document uploaded
                        </span>
                      </div>
                    )}
                    <label id="upload-doc-btn" className="cursor-pointer inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-all">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-5 w-5 mr-2 text-gray-500"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                        />
                      </svg>
                      {formData.belowPoverty.document
                        ? "Change Document"
                        : "Upload Document"}
                      <input
                        type="file"
                        className="hidden"
                        accept=".pdf,.jpg,.jpeg,.png"
                        onChange={handleDocumentUpload}
                      />
                    </label>
                  </div>
                  <p className="text-xs text-gray-500 mt-2">
                    Accepted formats: PDF, JPG, JPEG, PNG (Max 5MB)
                  </p>
                </div>
              )}
            </div>

            {/* Submit Button */}
            <div className="flex justify-end">
              <button
                type="submit"
                disabled={profileUpdating}
                className="px-8 py-3 bg-[#f99e1c] text-white rounded-md shadow-sm hover:bg-[#e08c10] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#f99e1c] transition-all font-medium"
              >
                {profileUpdating ? (
                  <>
                    <svg
                      className="animate-spin -ml-1 mr-3 h-5 w-5 text-white inline-block"
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
            {/* Profile Image and Basic Info */}
            <div className="flex flex-col md:flex-row items-center md:items-start mb-8">
              <div className="mb-4 md:mb-0 md:mr-10 flex flex-col items-center">
                <div className="relative">
                  <img
                    src={
                      user.profileImage?.startsWith('data:') ||
                        user.profileImage?.startsWith('http') ?
                        user.profileImage :
                        `${API_BASE_URL}${user.profileImage}` ||
                        "https://avatar.iran.liara.run/public"
                    }
                    alt="Profile"
                    className="w-36 h-36 rounded-full object-cover border-4 border-white shadow-md"
                  />
                  <div className="absolute -bottom-2 -right-2 bg-[#f99e1c] text-white w-8 h-8 rounded-full flex items-center justify-center shadow-md">
                    <span className="text-xs font-bold">{user?.streak || 0}d</span>
                  </div>
                </div>
                <div className="mt-4 text-center">
                  <div className="font-semibold text-xl text-[#013954]">
                    {user?.firstName} {user?.lastName}
                  </div>
                  <div className="text-gray-500 mt-1">
                    {user?.email ? `@${user.email.split("@")[0]}` : ""}
                  </div>
                </div>
              </div>

              <div className="flex-1 bg-white p-6 rounded-lg shadow-sm border border-gray-100">
                <h3 className="text-lg font-medium text-[#013954] mb-4 pb-1 border-b border-gray-100">Personal Details</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-y-4 gap-x-8">
                  <div>
                    <h4 className="text-sm font-medium text-gray-500">Email</h4>
                    <p className="mt-1 text-sm text-gray-900">{user.email}</p>
                  </div>

                  <div>
                    <h4 className="text-sm font-medium text-gray-500">Contact Number</h4>
                    <p className="mt-1 text-sm text-gray-900">
                      {user.contactNumber || "Not provided"}
                    </p>
                  </div>

                  <div>
                    <h4 className="text-sm font-medium text-gray-500">School/Organization</h4>
                    <p className="mt-1 text-sm text-gray-900">
                      {user.schoolOrganizationName || "Not provided"}
                    </p>
                  </div>

                  <div>
                    <h4 className="text-sm font-medium text-gray-500">Member Since</h4>
                    <p className="mt-1 text-sm text-gray-900">
                      {(() => {
                        try {
                          return user.createdAt ?
                            new Date(user.createdAt).toLocaleDateString("en-US", {
                              year: "numeric",
                              month: "long",
                              day: "numeric",
                            }) :
                            "Not available";
                        } catch (e) {
                          return "Invalid date format";
                        }
                      })()}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Stats */}
            <div className="mb-8">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-white p-4 rounded-lg border border-gray-100 shadow-sm text-center transition-all hover:shadow-md hover:border-[#f99e1c]">
                  <p className="text-2xl font-bold text-[#f99e1c]">
                    {user.registeredCourses?.length || 0}
                  </p>
                  <p className="text-sm text-[#013954] font-medium">Courses</p>
                </div>
                <div className="bg-white p-4 rounded-lg border border-gray-100 shadow-sm text-center transition-all hover:shadow-md hover:border-[#f99e1c]">
                  <p className="text-2xl font-bold text-[#f99e1c]">
                    {user.competitionsParticipated?.length || 0}
                  </p>
                  <p className="text-sm text-[#013954] font-medium">Competitions</p>
                </div>
                <div className="bg-white p-4 rounded-lg border border-gray-100 shadow-sm text-center transition-all hover:shadow-md hover:border-[#f99e1c]">
                  <p className="text-2xl font-bold text-[#f99e1c]">
                    {user.badges?.length || 0}
                  </p>
                  <p className="text-sm text-[#013954] font-medium">Badges</p>
                </div>
                <div className="bg-white p-4 rounded-lg border border-gray-100 shadow-sm text-center transition-all hover:shadow-md hover:border-[#f99e1c]">
                  <p className="text-2xl font-bold text-[#f99e1c]">
                    {user.streak || 0}
                  </p>
                  <p className="text-sm text-[#013954] font-medium">Day Streak</p>
                </div>
              </div>
            </div>

            {/* Skills */}
            <div className="bg-white p-6 rounded-lg mb-6 shadow-sm border border-gray-100">
              <h2 className="text-lg font-medium text-[#013954] mb-4 pb-1 border-b border-gray-100">Skills</h2>
              {user.skills && user.skills.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {user.skills.map((skill, index) => (
                    <span
                      key={index}
                      className="bg-[#013954] bg-opacity-10 text-[#013954] px-6 py-3 rounded-full text-sm font-medium"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 italic">No skills added</p>
              )}
            </div>

            {/* Education */}
            <div className="bg-white p-6 rounded-lg mb-6 shadow-sm border border-gray-100">
              <h2 className="text-lg font-medium text-[#013954] mb-4 pb-1 border-b border-gray-100">Education</h2>
              {user.education &&
                (user.education.level || user.education.institution) ? (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <h3 className="text-sm font-medium text-gray-500 mb-1">Level</h3>
                    <p className="text-base text-gray-900">
                      {user.education.level || "Not specified"}
                    </p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-gray-500 mb-1">Institution</h3>
                    <p className="text-base text-gray-900">
                      {user.education.institution || "Not specified"}
                    </p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-gray-500 mb-1">Year</h3>
                    <p className="text-base text-gray-900">
                      {user.education.year || "Not specified"}
                    </p>
                  </div>
                </div>
              ) : (
                <p className="text-gray-500 italic">No education details provided</p>
              )}
            </div>

            {/* Address */}
            <div className="bg-white p-6 rounded-lg mb-6 shadow-sm border border-gray-100">
              <h2 className="text-lg font-medium text-[#013954] mb-4 pb-1 border-b border-gray-100">Address</h2>
              {user.address &&
                (user.address.street ||
                  user.address.city ||
                  user.address.state) ? (
                <div className="bg-gray-50 rounded-md p-4 border border-gray-100">
                  <p className="text-base text-gray-800">
                    {[
                      user.address.street,
                      user.address.city,
                      user.address.state,
                      user.address.country,
                      user.address.pincode
                    ]
                      .filter(Boolean)
                      .join(", ")}
                  </p>
                </div>
              ) : (
                <p className="text-gray-500 italic">No address details provided</p>
              )}
            </div>

            {/* Below Poverty Status */}
            <div className="bg-white p-6 rounded-lg mb-6 shadow-sm border border-gray-100">
              <h2 className="text-lg font-medium text-[#013954] mb-4 pb-1 border-b border-gray-100">Below Poverty Status</h2>
              <div className="p-4 bg-gray-50 rounded-md border border-gray-100">
                <div className="flex items-center">
                  {user.belowPoverty?.status ? (
                    <>
                      <div
                        className={`w-3 h-3 rounded-full mr-2 ${user.belowPoverty?.verified
                          ? "bg-green-500"
                          : "bg-[#f99e1c]"
                          }`}
                      ></div>
                      <p className="text-base text-gray-800">
                        {user.belowPoverty?.verified
                          ? "Verified as below poverty level"
                          : "Verification pending for below poverty level status"}
                      </p>
                    </>
                  ) : (
                    <>
                      <div className="w-3 h-3 rounded-full bg-gray-300 mr-2"></div>
                      <p className="text-base text-gray-500">Not applicable</p>
                    </>
                  )}
                </div>

                {user.belowPoverty?.document && (
                  <div className="mt-3 text-sm text-gray-600 bg-white p-2 rounded border border-gray-200 inline-block">
                    <span className="font-medium">Document submitted:</span> {user.belowPoverty.document.split("/").pop()}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default UserProfile;

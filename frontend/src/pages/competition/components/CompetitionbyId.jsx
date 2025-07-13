import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../../context/AuthContext';
import axios from 'axios';
import {
    FaTrophy, FaCalendarAlt, FaUsers, FaUserCheck, FaClock,
    FaEdit, FaChartLine, FaMedal, FaList, FaUpload, FaGithub,
    FaCheck, FaTimes, FaSpinner, FaLevelUpAlt, FaRegClock,
    FaDownload, FaUser, FaArrowLeft, FaEye, FaStar, FaTrash,
    FaSearch, FaPodcast, FaSort, FaFilter
} from 'react-icons/fa';

const CompetitionById = () => {
    const { id } = useParams();
    const { currentUser } = useAuth();

    // State variables
    const [competition, setCompetition] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showManageModal, setShowManageModal] = useState(false);
    const [showSubmitModal, setShowSubmitModal] = useState(false);
    const [showResultsModal, setShowResultsModal] = useState(false);
    const [submissionType, setSubmissionType] = useState('github');
    const [githubLink, setGithubLink] = useState('');
    const [zipFile, setZipFile] = useState(null);
    const [submitting, setSubmitting] = useState(false);
    const [submitSuccess, setSubmitSuccess] = useState(false);
    const [submitError, setSubmitError] = useState(null);

    // Management panel state
    const [activeManagePanel, setActiveManagePanel] = useState('main');
    const [participants, setParticipants] = useState([]);
    const [participantsLoading, setParticipantsLoading] = useState(false);
    const [participantsError, setParticipantsError] = useState(null);
    const [editForm, setEditForm] = useState(null);
    const [editLoading, setEditLoading] = useState(false);
    const [editError, setEditError] = useState(null);
    const [results, setResults] = useState([]);
    const [resultsLoading, setResultsLoading] = useState(false);
    const [resultsError, setResultsError] = useState(null);

    // Check if user is host, participant or neither
    const isHost = competition?.hostedBy?._id === currentUser?._id;
    const isParticipant = competition?.participants?.some(p => p.userId?._id === currentUser?._id);

    // Check if competition has ended
    const isCompetitionEnded = () => {
        if (!competition) return false;
        const now = new Date();
        const end = new Date(competition.endDate);
        return now > end;
    };

    // Fetch competition data
    useEffect(() => {
        const getCompetition = async () => {
            try {
                setLoading(true);
                const res = await axios.get(`/api/competitions/${id}`);
                setCompetition(res.data);

                // If we have form data from an edit, populate it
                if (editForm === null && res.data) {
                    setEditForm({
                        title: res.data.title,
                        description: res.data.description,
                        startDate: new Date(res.data.startDate).toISOString().split('T')[0],
                        endDate: new Date(res.data.endDate).toISOString().split('T')[0],
                        category: res.data.category,
                        difficulty: res.data.difficulty,
                        maxParticipants: res.data.maxParticipants || '',
                        rules: res.data.rules || [],
                        prizes: res.data.prizes || [],
                        eligibilityCriteria: res.data.eligibilityCriteria || [],
                        evaluationCriteria: res.data.evaluationCriteria || []
                    });
                }
            } catch (err) {
                console.error("Error fetching competition:", err);
                setError(err.response?.data?.message || "Failed to fetch competition details");
            } finally {
                setLoading(false);
            }
        };

        if (id) {
            getCompetition();
        }
    }, [id, editForm]);

    // Format date for display
    const formatDate = (dateString) => {
        const options = { year: 'numeric', month: 'long', day: 'numeric' };
        return new Date(dateString).toLocaleDateString(undefined, options);
    };

    // Check competition status
    const getCompetitionStatus = () => {
        if (!competition) return {};

        const now = new Date();
        const start = new Date(competition.startDate);
        const end = new Date(competition.endDate);

        if (now < start) {
            return { status: "upcoming", color: "text-blue-600", bgColor: "bg-blue-100" };
        } else if (now > end) {
            return { status: "completed", color: "text-purple-600", bgColor: "bg-purple-100" };
        } else {
            return { status: "ongoing", color: "text-green-600", bgColor: "bg-green-100" };
        }
    };

    // Check if submission is allowed (during competition period)
    const isSubmissionAllowed = () => {
        if (!competition) return false;

        const now = new Date();
        const start = new Date(competition.startDate);
        const end = new Date(competition.endDate);

        return now >= start && now <= end;
    };

    // Handle competition registration
    const handleJoinCompetition = async () => {
        try {
            setLoading(true);
            await axios.post(`/api/competitions/${id}/register`, {}, {
                headers: {
                    Authorization: `Bearer ${currentUser.token}`
                }
            });

            // Refresh competition data to update UI
            const res = await axios.get(`/api/competitions/${id}`);
            setCompetition(res.data);

        } catch (err) {
            setError(err.response?.data?.message || "Failed to join competition");
        } finally {
            setLoading(false);
        }
    };

    // Handle solution submission
    const handleSubmitSolution = async (e) => {
        e.preventDefault();

        try {
            setSubmitting(true);
            setSubmitError(null);

            let submissionData;

            if (submissionType === 'github') {
                if (!githubLink) {
                    setSubmitError("Please enter a GitHub link");
                    return;
                }
                submissionData = { submissionUrl: githubLink };
            } else {
                if (!zipFile) {
                    setSubmitError("Please upload a ZIP file");
                    return;
                }

                // Handle file upload logic here
                const formData = new FormData();
                formData.append('file', zipFile);

                // Upload file first, then get the URL
                const uploadRes = await axios.post('/api/uploads', formData, {
                    headers: {
                        'Content-Type': 'multipart/form-data',
                        Authorization: `Bearer ${currentUser.token}`
                    }
                });

                submissionData = { submissionUrl: uploadRes.data.fileUrl };
            }

            // Submit the solution
            await axios.post(`/api/competitions/${id}/submit`, submissionData, {
                headers: {
                    Authorization: `Bearer ${currentUser.token}`
                }
            });

            setSubmitSuccess(true);

            // Refresh competition data
            const res = await axios.get(`/api/competitions/${id}`);
            setCompetition(res.data);

            // Close modal after delay
            setTimeout(() => {
                setShowSubmitModal(false);
                setSubmitSuccess(false);
            }, 2000);

        } catch (err) {
            console.error("Submission error:", err);
            setSubmitError(err.response?.data?.message || "Failed to submit solution");
        } finally {
            setSubmitting(false);
        }
    };

    // Fetch competition participants
    const fetchParticipants = async () => {
        try {
            setParticipantsLoading(true);
            const res = await axios.get(`/api/competitions/${id}/participants`, {
                headers: {
                    Authorization: `Bearer ${currentUser.token}`
                }
            });
            setParticipants(res.data);
        } catch (err) {
            setParticipantsError("Failed to load participants");
        } finally {
            setParticipantsLoading(false);
        }
    };

    // Fetch competition results
    const fetchResults = async () => {
        try {
            setResultsLoading(true);
            const res = await axios.get(`/api/competitions/${id}/results`, {
                headers: {
                    Authorization: `Bearer ${currentUser.token}`
                }
            });
            setResults(res.data);
        } catch (err) {
            setResultsError("Failed to load results");
        } finally {
            setResultsLoading(false);
        }
    };

    // Handle competition edit form submission
    const handleEditSubmit = async (e) => {
        e.preventDefault();
        try {
            setEditLoading(true);
            const res = await axios.put(`/api/competitions/${id}`, editForm, {
                headers: {
                    Authorization: `Bearer ${currentUser.token}`
                }
            });
            setCompetition(res.data);
            setActiveManagePanel('main');
        } catch (err) {
            setEditError("Failed to update competition");
        } finally {
            setEditLoading(false);
        }
    };

    // Handle management action selection
    const handleManageAction = async (action) => {
        setActiveManagePanel(action);

        // Load data based on the selected panel
        switch (action) {
            case 'participants':
                fetchParticipants();
                break;
            case 'results':
                fetchResults();
                break;
            default:
                break;
        }
    };

    // Back to main manage panel
    const goBackToMainPanel = () => {
        setActiveManagePanel('main');
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-screen">
                <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-[#013954]"></div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center px-4">
                <div className="bg-white p-8 rounded-lg shadow-lg max-w-md w-full text-center">
                    <div className="rounded-full bg-red-100 mx-auto p-4 h-16 w-16 flex items-center justify-center mb-4">
                        <FaTimes className="text-red-500 text-2xl" />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-800 mb-2">Error</h2>
                    <p className="text-gray-600 mb-6">{error}</p>
                    <Link to="/competitions" className="inline-block bg-[#013954] text-white px-6 py-2 rounded-md hover:bg-[#024b70]">
                        Back to Competitions
                    </Link>
                </div>
            </div>
        );
    }

    if (!competition) return null;

    const competitionStatus = getCompetitionStatus();

    return (
        <div className="min-h-screen bg-gray-50 py-8 px-4">
            <div className="container mx-auto">
                {/* Competition Header */}
                <div className="bg-white rounded-xl shadow-md overflow-hidden mb-8">
                    {/* Banner Image */}
                    <div className="relative h-64 md:h-80 bg-gradient-to-r from-[#013954] to-[#024b70]">
                        {competition.thumbnail && (
                            <img
                                src={competition.thumbnail}
                                alt={competition.title}
                                className="w-full h-full object-cover opacity-40"
                            />
                        )}
                        <div className="absolute inset-0 flex flex-col justify-end p-6 md:p-10 bg-gradient-to-t from-[#013954]/90 to-transparent">
                            <div className="flex flex-wrap items-center gap-3 mb-3">
                                <span className={`px-3 py-1 text-sm font-medium rounded-full ${competitionStatus.bgColor} ${competitionStatus.color}`}>
                                    {competitionStatus.status}
                                </span>
                                <span className="px-3 py-1 text-sm font-medium rounded-full bg-[#f99e1c]/20 text-[#f99e1c]">
                                    {competition.category}
                                </span>
                                <span className="px-3 py-1 text-sm font-medium rounded-full bg-gray-200 text-gray-700">
                                    {competition.difficulty}
                                </span>
                            </div>
                            <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">{competition.title}</h1>

                            <div className="flex flex-wrap items-center gap-4 text-white/90 text-sm">
                                <div className="flex items-center">
                                    <FaCalendarAlt className="mr-2 text-[#f99e1c]" />
                                    <span>
                                        {formatDate(competition.startDate)} - {formatDate(competition.endDate)}
                                    </span>
                                </div>
                                <div className="flex items-center">
                                    <FaUsers className="mr-2 text-[#f99e1c]" />
                                    <span>{competition.participants?.length || 0} Participants</span>
                                </div>
                                {competition.maxParticipants && (
                                    <div className="flex items-center">
                                        <FaUserCheck className="mr-2 text-[#f99e1c]" />
                                        <span>Max: {competition.maxParticipants}</span>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Action Bar */}
                    <div className="bg-white p-4 md:p-6 border-b border-gray-100 flex flex-wrap justify-between items-center gap-4">
                        {/* Host info */}
                        <div className="flex items-center">
                            <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden mr-3">
                                {competition.hostedBy?.profileImage ? (
                                    <img
                                        src={competition.hostedBy.profileImage}
                                        alt="Host"
                                        className="w-full h-full object-cover"
                                    />
                                ) : (
                                    <FaUser className="text-gray-500" />
                                )}
                            </div>
                            <div>
                                <p className="text-sm text-gray-500">Hosted by</p>
                                <p className="font-medium">
                                    {competition.hostedBy?.firstName ?
                                        `${competition.hostedBy.firstName} ${competition.hostedBy.lastName}` :
                                        competition.hostedBy?.organizationName || competition.hostedBy?.name || "Unknown Host"}
                                </p>
                            </div>
                        </div>

                        {/* Action buttons based on user role */}
                        <div className="flex flex-wrap gap-3">
                            {currentUser ? (
                                isHost ? (
                                    <motion.button
                                        whileHover={{ scale: 1.03 }}
                                        whileTap={{ scale: 0.98 }}
                                        onClick={() => setShowManageModal(true)}
                                        className="px-6 py-3 bg-gradient-to-r from-[#013954] to-[#024b70] text-white rounded-lg font-medium flex items-center"
                                        style={{ willChange: 'transform' }}
                                    >
                                        <FaEdit className="mr-2" /> Manage Competition
                                    </motion.button>
                                ) : isParticipant ? (
                                    <div className="flex flex-wrap gap-3">
                                        {isCompetitionEnded() ? (
                                            // Show Results button if competition has ended
                                            <motion.button
                                                whileHover={{ scale: 1.03 }}
                                                whileTap={{ scale: 0.98 }}
                                                onClick={() => setShowResultsModal(true)}
                                                className="px-6 py-3 bg-gradient-to-r from-purple-600 to-purple-800 text-white rounded-lg font-medium flex items-center"
                                                style={{ willChange: 'transform' }}
                                            >
                                                <FaTrophy className="mr-2" /> View Results
                                            </motion.button>
                                        ) : (
                                            // Show Submit Solution button if competition is ongoing
                                            <motion.button
                                                whileHover={{ scale: 1.03 }}
                                                whileTap={{ scale: 0.98 }}
                                                disabled={!isSubmissionAllowed()}
                                                onClick={() => isSubmissionAllowed() && setShowSubmitModal(true)}
                                                className={`px-6 py-3 rounded-lg font-medium flex items-center ${isSubmissionAllowed()
                                                    ? "bg-gradient-to-r from-[#f99e1c] to-[#e08200] text-white"
                                                    : "bg-gray-200 text-gray-500 cursor-not-allowed"
                                                    }`}
                                                style={{ willChange: 'transform' }}
                                            >
                                                <FaUpload className="mr-2" /> Submit Solution
                                            </motion.button>
                                        )}
                                        <span className={`text-sm px-4 py-1 rounded-full flex items-center ${isSubmissionAllowed()
                                            ? "bg-green-100 text-green-700"
                                            : "bg-yellow-100 text-yellow-700"
                                            }`}>
                                            {isSubmissionAllowed() ? (
                                                <><FaRegClock className="mr-1" /> Submission Open</>
                                            ) : (
                                                <><FaClock className="mr-1" /> Submission {new Date() < new Date(competition.startDate) ? "Not Started" : "Closed"}</>
                                            )}
                                        </span>
                                    </div>
                                ) : (
                                    <motion.button
                                        whileHover={{ scale: 1.03 }}
                                        whileTap={{ scale: 0.98 }}
                                        onClick={handleJoinCompetition}
                                        disabled={new Date() >= new Date(competition.startDate) ||
                                            (competition.maxParticipants && competition.participants.length >= competition.maxParticipants)}
                                        className={`px-6 py-3 rounded-lg font-medium flex items-center ${new Date() >= new Date(competition.startDate) ||
                                            (competition.maxParticipants && competition.participants.length >= competition.maxParticipants)
                                            ? "bg-gray-200 text-gray-500 cursor-not-allowed"
                                            : "bg-gradient-to-r from-[#013954] to-[#024b70] text-white"
                                            }`}
                                        style={{ willChange: 'transform' }}
                                    >
                                        <FaUserCheck className="mr-2" /> Join Competition
                                    </motion.button>
                                )
                            ) : (
                                <Link
                                    to="/login"
                                    className="px-6 py-3 bg-gradient-to-r from-[#013954] to-[#024b70] text-white rounded-lg font-medium flex items-center"
                                >
                                    Login to Participate
                                </Link>
                            )}
                        </div>
                    </div>
                </div>

                {/* Main Content - Two Column Layout */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Left Column - Competition Details */}
                    <div className="lg:col-span-2">
                        <div className="bg-white rounded-xl shadow-md overflow-hidden mb-8">
                            <div className="p-6 md:p-8">
                                <h2 className="text-2xl font-bold text-[#013954] mb-4">About This Competition</h2>
                                <div className="prose max-w-none text-gray-700">
                                    {competition.description.split('\n').map((paragraph, idx) => (
                                        <p key={idx} className="mb-4">{paragraph}</p>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Rules Section */}
                        {competition.rules && competition.rules.length > 0 && (
                            <div className="bg-white rounded-xl shadow-md overflow-hidden mb-8">
                                <div className="p-6 md:p-8">
                                    <h2 className="text-2xl font-bold text-[#013954] mb-4">Competition Rules</h2>
                                    <ul className="space-y-3">
                                        {competition.rules.map((rule, index) => (
                                            <li key={index} className="flex">
                                                <span className="bg-[#013954]/10 text-[#013954] rounded-full h-6 w-6 flex items-center justify-center mr-3 shrink-0 mt-0.5">
                                                    {index + 1}
                                                </span>
                                                <span className="text-gray-700">{rule}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            </div>
                        )}

                        {/* Eligibility Criteria Section */}
                        {competition.eligibilityCriteria && competition.eligibilityCriteria.length > 0 && (
                            <div className="bg-white rounded-xl shadow-md overflow-hidden mb-8">
                                <div className="p-6 md:p-8">
                                    <h2 className="text-2xl font-bold text-[#013954] mb-4 flex items-center">
                                        <FaUserCheck className="mr-2 text-[#013954]" /> Eligibility Criteria
                                    </h2>
                                    <ul className="space-y-3">
                                        {competition.eligibilityCriteria.map((criterion, index) => (
                                            <li key={index} className="flex">
                                                <span className="bg-blue-50 text-[#013954] rounded-full h-6 w-6 flex items-center justify-center mr-3 shrink-0 mt-0.5">
                                                    {index + 1}
                                                </span>
                                                <span className="text-gray-700">{criterion}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            </div>
                        )}

                        {/* Evaluation Criteria Section */}
                        {competition.evaluationCriteria && competition.evaluationCriteria.length > 0 && (
                            <div className="bg-white rounded-xl shadow-md overflow-hidden mb-8">
                                <div className="p-6 md:p-8">
                                    <h2 className="text-2xl font-bold text-[#013954] mb-4 flex items-center">
                                        <FaCheck className="mr-2 text-[#f99e1c]" /> Evaluation Criteria
                                    </h2>
                                    <ul className="space-y-3">
                                        {competition.evaluationCriteria.map((criterion, index) => (
                                            <li key={index} className="flex">
                                                <span className="bg-orange-50 text-[#f99e1c] rounded-full h-6 w-6 flex items-center justify-center mr-3 shrink-0 mt-0.5">
                                                    {index + 1}
                                                </span>
                                                <span className="text-gray-700">{criterion}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            </div>
                        )}

                        {/* Timeline Section */}
                        <div className="bg-white rounded-xl shadow-md overflow-hidden mb-8 lg:mb-0">
                            <div className="p-6 md:p-8">
                                <h2 className="text-2xl font-bold text-[#013954] mb-6">Competition Timeline</h2>

                                <div className="relative pl-8 pb-1">
                                    {/* Left vertical line */}
                                    <div className="absolute left-3 top-2 bottom-0 w-0.5 bg-gray-200"></div>

                                    {competition.timeline && competition.timeline.length > 0 ? (
                                        competition.timeline.map((phase, index) => (
                                            <div key={index} className="mb-8 relative">
                                                <div
                                                    className={`absolute left-0 w-6 h-6 transform -translate-x-1/2 rounded-full border-4 border-white shadow-sm ${index === 0
                                                        ? 'bg-[#f99e1c]'
                                                        : index === competition.timeline.length - 1
                                                            ? 'bg-green-500'
                                                            : 'bg-[#013954]'
                                                        }`}
                                                ></div>
                                                <div
                                                    className={`rounded-xl p-4 ${index === 0
                                                        ? 'bg-[#f99e1c]/5'
                                                        : index === competition.timeline.length - 1
                                                            ? 'bg-green-50'
                                                            : 'bg-[#013954]/5'
                                                        }`}
                                                >
                                                    <h3
                                                        className={`text-lg font-semibold ${index === competition.timeline.length - 1
                                                            ? 'text-green-700'
                                                            : 'text-[#013954]'
                                                            }`}
                                                    >
                                                        {phase.phase}
                                                    </h3>
                                                    <p className="text-gray-700 mb-2">
                                                        {index === 0
                                                            ? 'Register before the competition begins.'
                                                            : index === 1
                                                                ? 'Submit your solutions during this period.'
                                                                : index === competition.timeline.length - 1
                                                                    ? 'Winners will be announced after evaluation.'
                                                                    : 'Important phase of the competition.'}
                                                    </p>
                                                    <div className="flex items-center text-sm text-gray-500">
                                                        <FaCalendarAlt
                                                            className={`mr-2 ${index === 0
                                                                ? 'text-[#f99e1c]'
                                                                : index === competition.timeline.length - 1
                                                                    ? 'text-green-500'
                                                                    : 'text-[#013954]'
                                                                }`}
                                                        />
                                                        <span>{formatDate(phase.startDate)} - {formatDate(phase.endDate)}</span>
                                                    </div>
                                                </div>
                                            </div>
                                        ))
                                    ) : (
                                        // Fallback to default timeline if none provided
                                        <>
                                            {/* Registration Phase */}
                                            <div className="mb-8 relative">
                                                <div className="absolute left-0 w-6 h-6 transform -translate-x-1/2 bg-[#f99e1c] rounded-full border-4 border-white shadow-sm"></div>
                                                <div className="bg-[#f99e1c]/5 rounded-xl p-4">
                                                    <h3 className="text-lg font-semibold text-[#013954]">Registration Phase</h3>
                                                    <p className="text-gray-700 mb-2">
                                                        Register before the competition begins.
                                                    </p>
                                                    <div className="flex items-center text-sm text-gray-500">
                                                        <FaCalendarAlt className="mr-2 text-[#f99e1c]" />
                                                        <span>Until {formatDate(competition.startDate)}</span>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Competition Phase */}
                                            <div className="mb-8 relative">
                                                <div className="absolute left-0 w-6 h-6 transform -translate-x-1/2 bg-[#013954] rounded-full border-4 border-white shadow-sm"></div>
                                                <div className="bg-[#013954]/5 rounded-xl p-4">
                                                    <h3 className="text-lg font-semibold text-[#013954]">Competition Phase</h3>
                                                    <p className="text-gray-700 mb-2">
                                                        Submit your solutions during this period.
                                                    </p>
                                                    <div className="flex items-center text-sm text-gray-500">
                                                        <FaCalendarAlt className="mr-2 text-[#013954]" />
                                                        <span>{formatDate(competition.startDate)} - {formatDate(competition.endDate)}</span>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Results Phase */}
                                            <div className="relative">
                                                <div className="absolute left-0 w-6 h-6 transform -translate-x-1/2 bg-green-500 rounded-full border-4 border-white shadow-sm"></div>
                                                <div className="bg-green-50 rounded-xl p-4">
                                                    <h3 className="text-lg font-semibold text-green-700">Results Announcement</h3>
                                                    <p className="text-gray-700 mb-2">
                                                        Winners will be announced after evaluation.
                                                    </p>
                                                    <div className="flex items-center text-sm text-gray-500">
                                                        <FaCalendarAlt className="mr-2 text-green-500" />
                                                        <span>After {formatDate(competition.endDate)}</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right Column - Prizes and Info */}
                    <div>
                        {/* Prizes Section */}
                        {competition.prizes && competition.prizes.length > 0 && (
                            <div className="bg-white rounded-xl shadow-md overflow-hidden mb-8">
                                <div className="p-6 md:p-8">
                                    <h2 className="text-2xl font-bold text-[#013954] mb-4 flex items-center">
                                        <FaTrophy className="text-[#f99e1c] mr-2" /> Prizes
                                    </h2>

                                    <div className="space-y-4">
                                        {competition.prizes
                                            .sort((a, b) => a.rank - b.rank)
                                            .map((prize, index) => (
                                                <div
                                                    key={index}
                                                    className={`p-4 rounded-lg flex items-start ${index === 0
                                                        ? 'bg-gradient-to-r from-yellow-50 to-yellow-100 border border-yellow-200'
                                                        : index === 1
                                                            ? 'bg-gradient-to-r from-gray-50 to-gray-100 border border-gray-200'
                                                            : index === 2
                                                                ? 'bg-gradient-to-r from-amber-50 to-amber-100 border border-amber-200'
                                                                : 'bg-white border border-gray-100'
                                                        }`}
                                                >
                                                    <div className={`rounded-full h-10 w-10 flex items-center justify-center mr-4 shrink-0 ${index === 0
                                                        ? 'bg-yellow-400 text-yellow-800'
                                                        : index === 1
                                                            ? 'bg-gray-300 text-gray-700'
                                                            : index === 2
                                                                ? 'bg-amber-400 text-amber-800'
                                                                : 'bg-blue-100 text-blue-800'
                                                        }`}>
                                                        {index === 0 ? '1st' : index === 1 ? '2nd' : index === 2 ? '3rd' : `${prize.rank}th`}
                                                    </div>
                                                    <div className="flex-1">
                                                        <div className="font-medium">{prize.description}</div>
                                                        {prize.value > 0 && (
                                                            <div className="text-[#013954] font-bold mt-1">
                                                                ₹{prize.value.toLocaleString()}
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            ))}
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Competition Stats Box */}
                        <div className="bg-white rounded-xl shadow-md overflow-hidden mb-8">
                            <div className="p-6">
                                <h2 className="text-xl font-bold text-[#013954] mb-4">Competition Details</h2>

                                <div className="space-y-3">
                                    <div className="flex justify-between pb-2 border-b border-gray-100">
                                        <span className="text-gray-600">Difficulty</span>
                                        <div className="flex items-center">
                                            <FaLevelUpAlt className="mr-1 text-[#013954]" />
                                            <span className="font-medium capitalize">{competition.difficulty}</span>
                                        </div>
                                    </div>

                                    <div className="flex justify-between pb-2 border-b border-gray-100">
                                        <span className="text-gray-600">Category</span>
                                        <span className="font-medium">{competition.category}</span>
                                    </div>

                                    <div className="flex justify-between pb-2 border-b border-gray-100">
                                        <span className="text-gray-600">Participants</span>
                                        <span className="font-medium">{competition.participants?.length || 0} / {competition.maxParticipants || '∞'}</span>
                                    </div>

                                    {competition.competitionType === 'external' && (
                                        <>
                                            <div className="flex justify-between pb-2 border-b border-gray-100">
                                                <span className="text-gray-600">Venue</span>
                                                <span className="font-medium">{competition.venue}</span>
                                            </div>

                                            <div className="flex justify-between pb-2 border-b border-gray-100">
                                                <span className="text-gray-600">Organizer</span>
                                                <span className="font-medium">{competition.organizer}</span>
                                            </div>

                                            {competition.externalLink && (
                                                <div className="mt-4">
                                                    <a
                                                        href={competition.externalLink}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="block w-full py-2.5 bg-[#013954] text-white text-center rounded-lg hover:bg-[#024b70] transition-colors"
                                                    >
                                                        External Registration Link
                                                    </a>
                                                </div>
                                            )}
                                        </>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Manage Competition Modal with In-Modal Management */}
            <AnimatePresence>
                {showManageModal && (
                    <motion.div
                        className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-4"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.2 }}
                    >
                        <motion.div
                            className="bg-white rounded-xl shadow-xl max-w-4xl w-full overflow-hidden"
                            initial={{ opacity: 0, scale: 0.95, y: 10 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 10 }}
                            transition={{ duration: 0.25, type: "spring", stiffness: 400, damping: 25 }}
                        >
                            {activeManagePanel === 'main' ? (
                                <div className="p-6">
                                    {/* Main panel content */}
                                    <div className="text-center mb-8">
                                        <h3 className="text-2xl font-bold text-[#013954]">Manage Competition</h3>
                                        <p className="text-gray-600 mt-1">Select an action to manage your competition</p>
                                    </div>

                                    <div className="space-y-4">
                                        <button
                                            onClick={() => handleManageAction('edit')}
                                            className="w-full py-3 px-4 flex items-center bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors"
                                        >
                                            <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center mr-4">
                                                <FaEdit className="text-[#013954]" />
                                            </div>
                                            <div className="text-left">
                                                <h4 className="font-medium">Edit Competition</h4>
                                                <p className="text-sm text-gray-600">Update competition details and settings</p>
                                            </div>
                                        </button>

                                        <button
                                            onClick={() => handleManageAction('participants')}
                                            className="w-full py-3 px-4 flex items-center bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors"
                                        >
                                            <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center mr-4">
                                                <FaUsers className="text-green-600" />
                                            </div>
                                            <div className="text-left">
                                                <h4 className="font-medium">View Participants</h4>
                                                <p className="text-sm text-gray-600">See who's registered for your competition</p>
                                            </div>
                                        </button>

                                        <button
                                            onClick={() => handleManageAction('results')}
                                            className="w-full py-3 px-4 flex items-center bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors"
                                        >
                                            <div className="w-10 h-10 rounded-full bg-[#f99e1c]/20 flex items-center justify-center mr-4">
                                                <FaMedal className="text-[#f99e1c]" />
                                            </div>
                                            <div className="text-left">
                                                <h4 className="font-medium">Manage Results</h4>
                                                <p className="text-sm text-gray-600">Review submissions and declare winners</p>
                                            </div>
                                        </button>
                                    </div>

                                    <div className="mt-6 flex justify-end">
                                        <button
                                            onClick={() => setShowManageModal(false)}
                                            className="px-5 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                                        >
                                            Close
                                        </button>
                                    </div>
                                </div>
                            ) : activeManagePanel === 'participants' ? (
                                <div className="max-h-[80vh] overflow-auto">
                                    {/* Participants panel content */}
                                    <div className="sticky top-0 bg-white border-b border-gray-200 p-6 flex items-center justify-between">
                                        <div className="flex items-center">
                                            <button
                                                onClick={goBackToMainPanel}
                                                className="mr-3 h-8 w-8 flex items-center justify-center rounded-full bg-gray-100 hover:bg-gray-200"
                                            >
                                                <FaArrowLeft className="text-gray-600" />
                                            </button>
                                            <h3 className="text-xl font-bold text-[#013954]">Competition Participants</h3>
                                        </div>
                                        <span className="bg-[#013954] text-white px-3 py-1 rounded-full text-sm">
                                            {participants.length} Participants
                                        </span>
                                    </div>

                                    <div className="p-6">
                                        {participantsLoading ? (
                                            <div className="flex justify-center py-8">
                                                <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-[#013954]"></div>
                                            </div>
                                        ) : participantsError ? (
                                            <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-4">
                                                <div className="flex">
                                                    <div className="flex-shrink-0">
                                                        <FaTimes className="h-5 w-5 text-red-500" />
                                                    </div>
                                                    <div className="ml-3">
                                                        <p className="text-red-700">{participantsError}</p>
                                                    </div>
                                                </div>
                                            </div>
                                        ) : participants.length === 0 ? (
                                            <div className="text-center py-8">
                                                <div className="rounded-full bg-gray-100 mx-auto p-4 h-16 w-16 flex items-center justify-center mb-4">
                                                    <FaUsers className="text-gray-500 text-xl" />
                                                </div>
                                                <h3 className="text-lg font-medium text-gray-800 mb-2">No Participants Yet</h3>
                                                <p className="text-gray-600">
                                                    No one has registered for this competition yet.
                                                </p>
                                            </div>
                                        ) : (
                                            <div className="overflow-x-auto">
                                                <table className="min-w-full divide-y divide-gray-200">
                                                    <thead className="bg-gray-50">
                                                        <tr>
                                                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                                Participant
                                                            </th>
                                                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                                Registered On
                                                            </th>
                                                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                                Submission
                                                            </th>
                                                        </tr>
                                                    </thead>
                                                    <tbody className="bg-white divide-y divide-gray-200">
                                                        {participants.map((participant) => (
                                                            <tr key={participant._id}>
                                                                <td className="px-6 py-4 whitespace-nowrap">
                                                                    <div className="flex items-center">
                                                                        <div className="h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center mr-3">
                                                                            {participant.userId?.profileImage ? (
                                                                                <img
                                                                                    src={participant.userId.profileImage}
                                                                                    alt=""
                                                                                    className="h-8 w-8 rounded-full"
                                                                                />
                                                                            ) : (
                                                                                <FaUser className="text-gray-500" />
                                                                            )}
                                                                        </div>
                                                                        <div>
                                                                            <div className="font-medium text-gray-900">
                                                                                {participant.userId?.firstName} {participant.userId?.lastName}
                                                                            </div>
                                                                            <div className="text-sm text-gray-500">
                                                                                {participant.userId?.email}
                                                                            </div>
                                                                        </div>
                                                                    </div>
                                                                </td>
                                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                                    {formatDate(participant.registeredAt)}
                                                                </td>
                                                                <td className="px-6 py-4 whitespace-nowrap">
                                                                    {participant.submissionUrl ? (
                                                                        <a
                                                                            href={participant.submissionUrl}
                                                                            target="_blank"
                                                                            rel="noopener noreferrer"
                                                                            className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 hover:bg-green-200"
                                                                        >
                                                                            <FaEye className="mr-1" /> View Submission
                                                                        </a>
                                                                    ) : (
                                                                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                                                                            No Submission
                                                                        </span>
                                                                    )}
                                                                </td>
                                                            </tr>
                                                        ))}
                                                    </tbody>
                                                </table>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ) : activeManagePanel === 'results' ? (
                                <div className="max-h-[80vh] overflow-auto">
                                    {/* Results panel content */}
                                    <div className="sticky top-0 bg-white border-b border-gray-200 p-6 flex items-center justify-between">
                                        <div className="flex items-center">
                                            <button
                                                onClick={goBackToMainPanel}
                                                className="mr-3 h-8 w-8 flex items-center justify-center rounded-full bg-gray-100 hover:bg-gray-200"
                                            >
                                                <FaArrowLeft className="text-gray-600" />
                                            </button>
                                            <h3 className="text-xl font-bold text-[#013954]">Competition Results</h3>
                                        </div>
                                        <div className="flex space-x-2">
                                            <button
                                                className="bg-[#013954] text-white px-4 py-2 rounded-lg text-sm flex items-center"
                                            >
                                                <FaTrophy className="mr-2" /> Declare Winners
                                            </button>
                                        </div>
                                    </div>

                                    <div className="p-6">
                                        {resultsLoading ? (
                                            <div className="flex justify-center py-8">
                                                <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-[#013954]"></div>
                                            </div>
                                        ) : resultsError ? (
                                            <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-4">
                                                <div className="flex">
                                                    <div className="flex-shrink-0">
                                                        <FaTimes className="h-5 w-5 text-red-500" />
                                                    </div>
                                                    <div className="ml-3">
                                                        <p className="text-red-700">{resultsError}</p>
                                                    </div>
                                                </div>
                                            </div>
                                        ) : isCompetitionEnded() ? (
                                            <div className="space-y-6">
                                                <div className="bg-purple-50 border-l-4 border-purple-500 p-4">
                                                    <div className="flex">
                                                        <div className="flex-shrink-0">
                                                            <FaMedal className="h-5 w-5 text-purple-500" />
                                                        </div>
                                                        <div className="ml-3">
                                                            <p className="text-purple-700">
                                                                Competition has ended. You can now evaluate submissions and declare winners.
                                                            </p>
                                                        </div>
                                                    </div>
                                                </div>

                                                {competition.participants.some(p => p.submissionUrl) ? (
                                                    <div className="overflow-x-auto">
                                                        <table className="min-w-full divide-y divide-gray-200">
                                                            <thead className="bg-gray-50">
                                                                <tr>
                                                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                                        Participant
                                                                    </th>
                                                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                                        Submission
                                                                    </th>
                                                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                                        Score
                                                                    </th>
                                                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                                        Rank
                                                                    </th>
                                                                </tr>
                                                            </thead>
                                                            <tbody className="bg-white divide-y divide-gray-200">
                                                                {competition.participants
                                                                    .filter(p => p.submissionUrl)
                                                                    .sort((a, b) => (b.score || 0) - (a.score || 0))
                                                                    .map((participant, index) => (
                                                                        <tr key={participant._id}>
                                                                            <td className="px-6 py-4 whitespace-nowrap">
                                                                                <div className="flex items-center">
                                                                                    <div className="h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center mr-3">
                                                                                        {participant.userId?.profileImage ? (
                                                                                            <img
                                                                                                src={participant.userId.profileImage}
                                                                                                alt=""
                                                                                                className="h-8 w-8 rounded-full"
                                                                                            />
                                                                                        ) : (
                                                                                            <FaUser className="text-gray-500" />
                                                                                        )}
                                                                                    </div>
                                                                                    <div>
                                                                                        <div className="font-medium text-gray-900">
                                                                                            {participant.userId?.firstName} {participant.userId?.lastName}
                                                                                        </div>
                                                                                        <div className="text-sm text-gray-500">
                                                                                            {participant.userId?.email}
                                                                                        </div>
                                                                                    </div>
                                                                                </div>
                                                                            </td>
                                                                            <td className="px-6 py-4 whitespace-nowrap">
                                                                                <a
                                                                                    href={participant.submissionUrl}
                                                                                    target="_blank"
                                                                                    rel="noopener noreferrer"
                                                                                    className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 hover:bg-blue-200"
                                                                                >
                                                                                    <FaEye className="mr-1" /> View Submission
                                                                                </a>
                                                                            </td>
                                                                            <td className="px-6 py-4 whitespace-nowrap">
                                                                                <input
                                                                                    type="number"
                                                                                    min="0"
                                                                                    max="100"
                                                                                    value={participant.score || ''}
                                                                                    onChange={(e) => {
                                                                                        // Handle score update
                                                                                    }}
                                                                                    className="border border-gray-300 rounded-md px-2 py-1 w-16 text-center"
                                                                                />
                                                                            </td>
                                                                            <td className="px-6 py-4 whitespace-nowrap">
                                                                                {participant.rank ? (
                                                                                    <span className={`inline-flex items-center justify-center w-8 h-8 rounded-full ${participant.rank === 1
                                                                                        ? 'bg-yellow-100 text-yellow-800'
                                                                                        : participant.rank === 2
                                                                                            ? 'bg-gray-200 text-gray-800'
                                                                                            : participant.rank === 3
                                                                                                ? 'bg-amber-100 text-amber-800'
                                                                                                : 'bg-purple-50 text-purple-800'
                                                                                        }`}>
                                                                                        {participant.rank}
                                                                                    </span>
                                                                                ) : (
                                                                                    <span>-</span>
                                                                                )}
                                                                            </td>
                                                                        </tr>
                                                                    ))}
                                                            </tbody>
                                                        </table>
                                                    </div>
                                                ) : (
                                                    <div className="text-center py-8">
                                                        <div className="rounded-full bg-gray-100 mx-auto p-4 h-16 w-16 flex items-center justify-center mb-4">
                                                            <FaUpload className="text-gray-500 text-xl" />
                                                        </div>
                                                        <h3 className="text-lg font-medium text-gray-800 mb-2">No Submissions</h3>
                                                        <p className="text-gray-600">
                                                            No participants have submitted solutions yet.
                                                        </p>
                                                    </div>
                                                )}
                                            </div>
                                        ) : (
                                            <div className="text-center py-8">
                                                <div className="rounded-full bg-yellow-100 mx-auto p-4 h-16 w-16 flex items-center justify-center mb-4">
                                                    <FaClock className="text-yellow-500 text-xl" />
                                                </div>
                                                <h3 className="text-lg font-medium text-gray-800 mb-2">Competition In Progress</h3>
                                                <p className="text-gray-600">
                                                    You can manage results after the competition ends on {formatDate(competition.endDate)}.
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ) : activeManagePanel === 'edit' ? (
                                <div className="max-h-[80vh] overflow-auto">
                                    {/* Edit panel content */}
                                    <div className="sticky top-0 bg-white border-b border-gray-200 p-6 flex items-center justify-between">
                                        <div className="flex items-center">
                                            <button
                                                onClick={goBackToMainPanel}
                                                className="mr-3 h-8 w-8 flex items-center justify-center rounded-full bg-gray-100 hover:bg-gray-200"
                                            >
                                                <FaArrowLeft className="text-gray-600" />
                                            </button>
                                            <h3 className="text-xl font-bold text-[#013954]">Edit Competition</h3>
                                        </div>
                                    </div>

                                    <div className="p-6">
                                        {editError && (
                                            <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-4">
                                                <div className="flex">
                                                    <div className="flex-shrink-0">
                                                        <FaTimes className="h-5 w-5 text-red-500" />
                                                    </div>
                                                    <div className="ml-3">
                                                        <p className="text-red-700">{editError}</p>
                                                    </div>
                                                </div>
                                            </div>
                                        )}

                                        <form onSubmit={handleEditSubmit}>
                                            <div className="space-y-6">
                                                <div>
                                                    <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
                                                        Title
                                                    </label>
                                                    <input
                                                        type="text"
                                                        id="title"
                                                        value={editForm.title}
                                                        onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                                                        className="block w-full p-2 border border-gray-300 rounded-md"
                                                        required
                                                    />
                                                </div>

                                                <div>
                                                    <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                                                        Description
                                                    </label>
                                                    <textarea
                                                        id="description"
                                                        value={editForm.description}
                                                        onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                                                        rows={4}
                                                        className="block w-full p-2 border border-gray-300 rounded-md"
                                                        required
                                                    />
                                                </div>

                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                    <div>
                                                        <label htmlFor="startDate" className="block text-sm font-medium text-gray-700 mb-1">
                                                            Start Date
                                                        </label>
                                                        <input
                                                            type="date"
                                                            id="startDate"
                                                            value={editForm.startDate}
                                                            onChange={(e) => setEditForm({ ...editForm, startDate: e.target.value })}
                                                            className="block w-full p-2 border border-gray-300 rounded-md"
                                                            required
                                                        />
                                                    </div>
                                                    <div>
                                                        <label htmlFor="endDate" className="block text-sm font-medium text-gray-700 mb-1">
                                                            End Date
                                                        </label>
                                                        <input
                                                            type="date"
                                                            id="endDate"
                                                            value={editForm.endDate}
                                                            onChange={(e) => setEditForm({ ...editForm, endDate: e.target.value })}
                                                            className="block w-full p-2 border border-gray-300 rounded-md"
                                                            required
                                                        />
                                                    </div>
                                                </div>

                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                    <div>
                                                        <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">
                                                            Category
                                                        </label>
                                                        <input
                                                            type="text"
                                                            id="category"
                                                            value={editForm.category}
                                                            onChange={(e) => setEditForm({ ...editForm, category: e.target.value })}
                                                            className="block w-full p-2 border border-gray-300 rounded-md"
                                                            required
                                                        />
                                                    </div>
                                                    <div>
                                                        <label htmlFor="difficulty" className="block text-sm font-medium text-gray-700 mb-1">
                                                            Difficulty
                                                        </label>
                                                        <select
                                                            id="difficulty"
                                                            value={editForm.difficulty}
                                                            onChange={(e) => setEditForm({ ...editForm, difficulty: e.target.value })}
                                                            className="block w-full p-2 border border-gray-300 rounded-md"
                                                            required
                                                        >
                                                            <option value="beginner">Beginner</option>
                                                            <option value="easy">Easy</option>
                                                            <option value="medium">Medium</option>
                                                            <option value="hard">Hard</option>
                                                            <option value="expert">Expert</option>
                                                        </select>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="mt-8 flex justify-end space-x-3">
                                                <button
                                                    type="button"
                                                    onClick={goBackToMainPanel}
                                                    className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                                                >
                                                    Cancel
                                                </button>
                                                <button
                                                    type="submit"
                                                    disabled={editLoading}
                                                    className="px-4 py-2 bg-[#013954] text-white rounded-lg hover:bg-[#024b70] flex items-center"
                                                >
                                                    {editLoading ? (
                                                        <><FaSpinner className="animate-spin mr-2" /> Saving...</>
                                                    ) : (
                                                        'Save Changes'
                                                    )}
                                                </button>
                                            </div>
                                        </form>
                                    </div>
                                </div>
                            ) : null}
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Submit Solution Modal */}
            <AnimatePresence>
                {showSubmitModal && (
                    <motion.div
                        className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-4"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.2 }}
                    >
                        <motion.div
                            className="bg-white rounded-xl shadow-xl max-w-md w-full p-6"
                            initial={{ opacity: 0, scale: 0.95, y: 10 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 10 }}
                            transition={{ duration: 0.25, type: "spring", stiffness: 400, damping: 25 }}
                        >
                            <div className="text-center mb-6">
                                <h3 className="text-2xl font-bold text-[#013954]">Submit Your Solution</h3>
                                <p className="text-gray-600 mt-1">Upload your project solution</p>
                            </div>

                            {submitSuccess ? (
                                <div className="bg-green-50 border-l-4 border-green-500 p-4 mb-4">
                                    <div className="flex">
                                        <div className="flex-shrink-0">
                                            <FaCheck className="h-5 w-5 text-green-500" />
                                        </div>
                                        <div className="ml-3">
                                            <p className="text-green-700">Solution submitted successfully!</p>
                                        </div>
                                    </div>
                                </div>
                            ) : submitError ? (
                                <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-4">
                                    <div className="flex">
                                        <div className="flex-shrink-0">
                                            <FaTimes className="h-5 w-5 text-red-500" />
                                        </div>
                                        <div className="ml-3">
                                            <p className="text-red-700">{submitError}</p>
                                        </div>
                                    </div>
                                </div>
                            ) : null}

                            <div className="mb-6">
                                <div className="flex border-b border-gray-200 mb-4">
                                    <button
                                        className={`pb-2 px-4 ${submissionType === 'github'
                                            ? 'border-b-2 border-[#013954] text-[#013954] font-medium'
                                            : 'text-gray-500'
                                            }`}
                                        onClick={() => setSubmissionType('github')}
                                    >
                                        <FaGithub className="inline mr-2" /> GitHub Link
                                    </button>
                                    <button
                                        className={`pb-2 px-4 ${submissionType === 'file'
                                            ? 'border-b-2 border-[#013954] text-[#013954] font-medium'
                                            : 'text-gray-500'
                                            }`}
                                        onClick={() => setSubmissionType('file')}
                                    >
                                        <FaUpload className="inline mr-2" /> Upload ZIP
                                    </button>
                                </div>

                                <form onSubmit={handleSubmitSolution}>
                                    {submissionType === 'github' ? (
                                        <div>
                                            <label htmlFor="github-link" className="block text-gray-700 mb-2">
                                                Enter GitHub Repository Link
                                            </label>
                                            <input
                                                type="url"
                                                id="github-link"
                                                value={githubLink}
                                                onChange={(e) => setGithubLink(e.target.value)}
                                                placeholder="https://github.com/username/repository"
                                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#f99e1c] focus:border-transparent"
                                            />
                                            <p className="text-xs text-gray-500 mt-1">
                                                Make sure your repository is public or accessible to reviewers
                                            </p>
                                        </div>
                                    ) : (
                                        <div>
                                            <label htmlFor="zip-file" className="block text-gray-700 mb-2">
                                                Upload Project ZIP File
                                            </label>
                                            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:bg-gray-50 cursor-pointer">
                                                <input
                                                    type="file"
                                                    id="zip-file"
                                                    accept=".zip"
                                                    onChange={(e) => setZipFile(e.target.files[0])}
                                                    className="hidden"
                                                />
                                                <label htmlFor="zip-file" className="cursor-pointer">
                                                    {zipFile ? (
                                                        <div>
                                                            <FaDownload className="mx-auto h-8 w-8 text-[#013954] mb-2" />
                                                            <p className="text-gray-700">{zipFile.name}</p>
                                                            <p className="text-xs text-gray-500 mt-1">
                                                                {Math.round(zipFile.size / 1024)} KB
                                                            </p>
                                                        </div>
                                                    ) : (
                                                        <div>
                                                            <FaUpload className="mx-auto h-8 w-8 text-gray-400" />
                                                            <p className="mt-2 text-gray-600">Click to select ZIP file</p>
                                                            <p className="text-xs text-gray-500">Maximum file size: 10MB</p>
                                                        </div>
                                                    )}
                                                </label>
                                            </div>
                                        </div>
                                    )}

                                    <div className="mt-6 flex justify-between">
                                        <button
                                            type="button"
                                            onClick={() => setShowSubmitModal(false)}
                                            className="px-5 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                                            disabled={submitting}
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            type="submit"
                                            disabled={submitting}
                                            className="px-5 py-2 bg-gradient-to-r from-[#f99e1c] to-[#e08200] text-white rounded-lg hover:shadow-md disabled:opacity-70"
                                        >
                                            {submitting ? (
                                                <><FaSpinner className="inline mr-2 animate-spin" /> Submitting...</>
                                            ) : (
                                                'Submit Solution'
                                            )}
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* View Results Modal */}
            <AnimatePresence>
                {showResultsModal && (
                    <motion.div
                        className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-4"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.2 }}
                    >
                        <motion.div
                            className="bg-white rounded-xl shadow-xl max-w-2xl w-full"
                            initial={{ opacity: 0, scale: 0.95, y: 10 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 10 }}
                            transition={{ duration: 0.25, type: "spring", stiffness: 400, damping: 25 }}
                        >
                            <div className="p-6 border-b border-gray-200">
                                <div className="flex justify-between items-center">
                                    <h3 className="text-2xl font-bold text-[#013954]">Competition Results</h3>
                                    <button
                                        onClick={() => setShowResultsModal(false)}
                                        className="h-8 w-8 flex items-center justify-center rounded-full bg-gray-100 hover:bg-gray-200"
                                    >
                                        <FaTimes className="text-gray-600" />
                                    </button>
                                </div>
                            </div>

                            <div className="p-6 max-h-[70vh] overflow-auto">
                                {competition.participants.some(p => p.rank) ? (
                                    <div className="space-y-8">
                                        {/* Top Winners */}
                                        <div className="flex flex-col items-center">
                                            <h4 className="text-xl font-bold text-[#013954] mb-6 flex items-center">
                                                <FaTrophy className="text-[#f99e1c] mr-2" /> Winners
                                            </h4>

                                            <div className="flex flex-wrap justify-center items-end gap-4 md:gap-8">
                                                {/* Second Place */}
                                                {competition.participants.find(p => p.rank === 2) && (
                                                    <div className="flex flex-col items-center order-1 md:order-0">
                                                        <div className="w-16 h-16 md:w-20 md:h-20 bg-gray-200 rounded-full mb-3 overflow-hidden flex items-center justify-center">
                                                            {competition.participants.find(p => p.rank === 2)?.userId?.profileImage ? (
                                                                <img
                                                                    src={competition.participants.find(p => p.rank === 2)?.userId?.profileImage}
                                                                    alt="2nd Place"
                                                                    className="w-full h-full object-cover"
                                                                />
                                                            ) : (
                                                                <FaUser className="text-gray-400 text-3xl" />
                                                            )}
                                                        </div>
                                                        <div className="h-2 w-8 bg-gray-300 mb-1"></div>
                                                        <div className="h-12 w-12 rounded-full bg-gray-200 flex items-center justify-center mb-2">
                                                            <span className="text-gray-800 font-bold">2</span>
                                                        </div>
                                                        <h5 className="font-medium text-gray-900 text-center">
                                                            {competition.participants.find(p => p.rank === 2)?.userId?.firstName} {competition.participants.find(p => p.rank === 2)?.userId?.lastName}
                                                        </h5>
                                                    </div>
                                                )}

                                                {/* First Place */}
                                                {competition.participants.find(p => p.rank === 1) && (
                                                    <div className="flex flex-col items-center order-0 md:order-1">
                                                        <div className="w-20 h-20 md:w-28 md:h-28 bg-yellow-100 rounded-full mb-3 overflow-hidden flex items-center justify-center border-4 border-yellow-300">
                                                            {competition.participants.find(p => p.rank === 1)?.userId?.profileImage ? (
                                                                <img
                                                                    src={competition.participants.find(p => p.rank === 1)?.userId?.profileImage}
                                                                    alt="Winner"
                                                                    className="w-full h-full object-cover"
                                                                />
                                                            ) : (
                                                                <FaUser className="text-yellow-400 text-4xl" />
                                                            )}
                                                        </div>
                                                        <div className="h-3 w-10 bg-yellow-300 mb-1"></div>
                                                        <div className="h-14 w-14 rounded-full bg-yellow-100 flex items-center justify-center mb-2 border-2 border-yellow-400">
                                                            <FaCrown className="text-yellow-500 text-xl" />
                                                        </div>
                                                        <h5 className="font-bold text-gray-900 text-center text-lg">
                                                            {competition.participants.find(p => p.rank === 1)?.userId?.firstName} {competition.participants.find(p => p.rank === 1)?.userId?.lastName}
                                                        </h5>
                                                    </div>
                                                )}

                                                {/* Third Place */}
                                                {competition.participants.find(p => p.rank === 3) && (
                                                    <div className="flex flex-col items-center order-2">
                                                        <div className="w-16 h-16 md:w-20 md:h-20 bg-amber-100 rounded-full mb-3 overflow-hidden flex items-center justify-center">
                                                            {competition.participants.find(p => p.rank === 3)?.userId?.profileImage ? (
                                                                <img
                                                                    src={competition.participants.find(p => p.rank === 3)?.userId?.profileImage}
                                                                    alt="3rd Place"
                                                                    className="w-full h-full object-cover"
                                                                />
                                                            ) : (
                                                                <FaUser className="text-amber-400 text-3xl" />
                                                            )}
                                                        </div>
                                                        <div className="h-2 w-8 bg-amber-300 mb-1"></div>
                                                        <div className="h-12 w-12 rounded-full bg-amber-100 flex items-center justify-center mb-2">
                                                            <span className="text-amber-800 font-bold">3</span>
                                                        </div>
                                                        <h5 className="font-medium text-gray-900 text-center">
                                                            {competition.participants.find(p => p.rank === 3)?.userId?.firstName} {competition.participants.find(p => p.rank === 3)?.userId?.lastName}
                                                        </h5>
                                                    </div>
                                                )}
                                            </div>
                                        </div>

                                        {/* All Results */}
                                        <div>
                                            <h4 className="text-lg font-bold text-[#013954] mb-4">All Participants</h4>

                                            <div className="bg-gray-50 rounded-xl p-4">
                                                <table className="min-w-full">
                                                    <thead>
                                                        <tr>
                                                            <th className="text-left text-sm font-medium text-gray-500 uppercase tracking-wider py-2">Rank</th>
                                                            <th className="text-left text-sm font-medium text-gray-500 uppercase tracking-wider py-2">Participant</th>
                                                            <th className="text-right text-sm font-medium text-gray-500 uppercase tracking-wider py-2">Score</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody>
                                                        {competition.participants
                                                            .filter(p => p.submissionUrl)
                                                            .sort((a, b) => (a.rank || 999) - (b.rank || 999))
                                                            .map((participant, index) => (
                                                                <tr key={participant._id} className="border-t border-gray-200">
                                                                    <td className="py-3 text-sm">
                                                                        <span className={`inline-flex items-center justify-center w-8 h-8 rounded-full ${participant.rank === 1
                                                                            ? 'bg-yellow-100 text-yellow-800'
                                                                            : participant.rank === 2
                                                                                ? 'bg-gray-200 text-gray-800'
                                                                                : participant.rank === 3
                                                                                    ? 'bg-amber-100 text-amber-800'
                                                                                    : 'bg-gray-100 text-gray-800'
                                                                            }`}>
                                                                            {participant.rank || '-'}
                                                                        </span>
                                                                    </td>
                                                                    <td className="py-3">
                                                                        <div className="flex items-center">
                                                                            <div className="h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center mr-3">
                                                                                {participant.userId?.profileImage ? (
                                                                                    <img
                                                                                        src={participant.userId.profileImage}
                                                                                        alt=""
                                                                                        className="h-8 w-8 rounded-full object-cover"
                                                                                    />
                                                                                ) : (
                                                                                    <FaUser className="text-gray-500" />
                                                                                )}
                                                                            </div>
                                                                            <span className="font-medium">
                                                                                {participant.userId?.firstName} {participant.userId?.lastName}
                                                                            </span>
                                                                        </div>
                                                                    </td>
                                                                    <td className="py-3 text-right">
                                                                        <div className="inline-flex items-center px-2 py-0.5 rounded text-sm font-medium bg-blue-50 text-blue-700">
                                                                            <FaStar className="mr-1 text-yellow-500" /> {participant.score || 0}
                                                                        </div>
                                                                    </td>
                                                                </tr>
                                                            ))}
                                                    </tbody>
                                                </table>
                                            </div>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="text-center py-8">
                                        <div className="rounded-full bg-gray-100 mx-auto p-4 h-16 w-16 flex items-center justify-center mb-4">
                                            <FaTrophy className="text-gray-500 text-xl" />
                                        </div>
                                        <h3 className="text-lg font-medium text-gray-800 mb-2">Results Not Available</h3>
                                        <p className="text-gray-600">
                                            The competition results have not been announced yet.
                                            Check back later or contact the competition host.
                                        </p>
                                    </div>
                                )}
                            </div>

                            <div className="p-4 border-t border-gray-200 flex justify-end">
                                <button
                                    onClick={() => setShowResultsModal(false)}
                                    className="px-5 py-2 bg-[#013954] text-white rounded-lg hover:bg-[#024b70]"
                                >
                                    Close
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default CompetitionById;
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Tab, Tabs, TabList, TabPanel } from 'react-tabs';
import 'react-tabs/style/react-tabs.css';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Import components
import ProfileSection from './components/ProfileSection';
import CoursesSection from './components/CoursesSection';
import CourseForm from './components/CourseForm.jsx';
import MockTestsSection from './components/MockTestsSection.jsx';
import MockTestForm from './components/MockTestForm';
import StudentsSection from './components/StudentsSection.jsx';
import ClassesSection from './components/ClassesSection.jsx';
import ClassForm from './components/ClassForm.jsx';
import AttendanceSheet from './components/AttendanceSheet';
import NotificationsSection from './components/NotificationsSection';

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

const MentorDashboard = () => {
    const [mentor, setMentor] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [tabIndex, setTabIndex] = useState(0);
    const [isCreatingCourse, setIsCreatingCourse] = useState(false);
    const [isCreatingTest, setIsCreatingTest] = useState(false);
    const [isSchedulingClass, setIsSchedulingClass] = useState(false);
    const [courses, setCourses] = useState([]);
    const [mockTests, setMockTests] = useState([]);
    const [students, setStudents] = useState([]);
    const [classes, setClasses] = useState([]);
    const [notifications, setNotifications] = useState([]);
    const [selectedCourse, setSelectedCourse] = useState(null);
    const [selectedTest, setSelectedTest] = useState(null);
    const [selectedClass, setSelectedClass] = useState(null);
    const [refreshData, setRefreshData] = useState(false);

    const navigate = useNavigate();

    useEffect(() => {
        const fetchMentorData = async () => {
            setLoading(true);
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

            try {
                // Fetch mentor profile data
                console.log("Fetching mentor profile...");
                const { data: profileData } = await axios.get(
                    `${API_BASE_URL}/api/mentors/profile`,
                    config
                );
                console.log("Mentor profile data received:", profileData);

                if (profileData && !profileData.message) {
                    setMentor(profileData);
                } else {
                    console.error("Invalid profile data format:", profileData);
                }

                // Fetch mentor's courses - this is the key change
                console.log("Fetching mentor courses...");
                const { data: coursesData } = await axios.get(
                    `${API_BASE_URL}/api/mentors/courses`,
                    config
                );
                console.log("Courses received:", coursesData);
                setCourses(coursesData);

                // Fetch other data...
            } catch (error) {
                console.error("Error fetching mentor data:", error);
                if (error.response && error.response.status === 401) {
                    localStorage.removeItem("token");
                    navigate("/login");
                }
            } finally {
                setLoading(false);
            }
        };

        fetchMentorData();
    }, [navigate, refreshData]);

    // const handleProfileUpdate = (updatedMentor) => {
    //     setMentor(updatedMentor);
    //     setRefreshData(prev => !prev);
    // };

    // Handler for profile updates
    const handleProfileUpdate = async (updatedData) => {
        try {
            const token = localStorage.getItem('token');
            const config = {
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`
                }
            };

            const { data } = await axios.put(
                `${API_BASE_URL}/api/mentors/profile`,
                updatedData,
                config
            );

            setMentor(data);
            toast.success('Profile updated successfully!');
        } catch (error) {
            console.error('Error updating profile:', error);
            toast.error('Failed to update profile');
        }
    };

    // Handler for course creation
    const handleCreateCourse = async (courseData) => {
        try {
            const token = localStorage.getItem('token');
            const config = {
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`
                }
            };

            console.log("Sending course data:", courseData);

            const { data } = await axios.post(
                `${API_BASE_URL}/api/courses`,
                courseData,
                config
            );

            console.log("Course created successfully:", data);

            // Update courses array with the newly created course
            setCourses(prevCourses => [...prevCourses, data]);
            setIsCreatingCourse(false);
            toast.success('Course created successfully!');

            // Optional: Refresh all data to ensure everything is up to date
            setRefreshData(prev => !prev);
        } catch (error) {
            console.error('Error creating course:', error.response?.data || error);
            toast.error(error.response?.data?.message || 'Failed to create course');
        }
    };

    // Handler for course updates
    const handleUpdateCourse = async (courseId, updatedData) => {
        try {
            const token = localStorage.getItem('token');
            const config = {
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`
                }
            };

            const { data } = await axios.put(
                `${API_BASE_URL}/api/courses/${courseId}`,
                updatedData,
                config
            );

            setCourses(courses.map(course => course._id === courseId ? data : course));
            setSelectedCourse(null);
            toast.success('Course updated successfully!');
        } catch (error) {
            console.error('Error updating course:', error);
            toast.error('Failed to update course');
        }
    };

    // Handler for course deletion
    const handleDeleteCourse = async (courseId) => {
        if (!window.confirm('Are you sure you want to delete this course?')) return;

        try {
            const token = localStorage.getItem('token');
            const config = {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            };

            await axios.delete(`${API_BASE_URL}/api/courses/${courseId}`, config);

            setCourses(courses.filter(course => course._id !== courseId));
            toast.success('Course deleted successfully!');
            setRefreshData(prev => !prev);
        } catch (error) {
            console.error('Error deleting course:', error);
            toast.error('Failed to delete course');
        }
    };

    // Handler for adding course content
    const handleAddCourseContent = async (courseId, contentData) => {
        try {
            const token = localStorage.getItem('token');
            const config = {
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`
                }
            };

            const { data } = await axios.post(
                `${API_BASE_URL}/api/courses/${courseId}/content`,
                contentData,
                config
            );

            setCourses(courses.map(course => course._id === courseId ? data : course));
            toast.success('Content added successfully!');
            setRefreshData(prev => !prev);
        } catch (error) {
            console.error('Error adding content:', error);
            toast.error('Failed to add content');
        }
    };

    // Handler for video upload
    const handleVideoUpload = async (courseId, file, onProgressUpdate) => {
        try {
            const token = localStorage.getItem('token');
            const formData = new FormData();
            formData.append('video', file);

            const { data } = await axios.post(
                `${API_BASE_URL}/api/courses/${courseId}/video`,
                formData,
                {
                    headers: {
                        'Content-Type': 'multipart/form-data',
                        Authorization: `Bearer ${token}`
                    },
                    onUploadProgress: (progressEvent) => {
                        const percentage = Math.round((progressEvent.loaded * 100) / progressEvent.total);
                        onProgressUpdate(percentage);
                    }
                }
            );

            toast.success('Video uploaded successfully!');
            setRefreshData(prev => !prev);
            return data.videoUrl;
        } catch (error) {
            console.error('Error uploading video:', error);
            toast.error('Failed to upload video');
            throw error;
        }
    };


    // Handle creating a mock test
    const handleCreateMockTest = async (mockTestData) => {
        try {
            const token = localStorage.getItem('token');
            const config = {
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`
                }
            };

            console.log("Sending mock test data:", mockTestData);

            const { data } = await axios.post(
                `${API_BASE_URL}/api/mocktests`,
                mockTestData,
                config
            );

            console.log("Mock test created successfully:", data);
            setMockTests([...mockTests, data]);
            setIsCreatingMockTest(false);
            toast.success('Mock test created successfully!');
            setRefreshData(prev => !prev);
        } catch (error) {
            console.error('Error creating mock test:', error.response?.data || error);
            toast.error(error.response?.data?.message || 'Failed to create mock test');
        }
    };

    // Handler for scheduling a class
    const handleScheduleClass = async (classData) => {
        try {
            const token = localStorage.getItem('token');
            const config = {
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`
                }
            };

            const { data } = await axios.post(
                `${API_BASE_URL}/api/mentors/classes`,
                classData,
                config
            );

            setClasses([...classes, data]);
            setIsSchedulingClass(false);
            toast.success('Class scheduled successfully!');
            setRefreshData(prev => !prev);
        } catch (error) {
            console.error('Error scheduling class:', error);
            toast.error('Failed to schedule class');
        }
    };

    // Handler for taking attendance
    const handleTakeAttendance = async (classId, attendanceData) => {
        try {
            const token = localStorage.getItem('token');
            const config = {
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`
                }
            };

            const { data } = await axios.post(
                `${API_BASE_URL}/api/mentors/classes/${classId}/attendance`,
                attendanceData,
                config
            );

            setClasses(
                classes.map(cls => cls._id === classId ? { ...cls, attendance: data.attendance } : cls)
            );
            setSelectedClass(null);
            toast.success('Attendance recorded successfully!');
        } catch (error) {
            console.error('Error recording attendance:', error);
            toast.error('Failed to record attendance');
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="bg-red-50 border-l-4 border-red-500 p-4">
                    <p className="text-red-700">{error}</p>
                    <button
                        onClick={() => setRefreshData(prev => !prev)}
                        className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                    >
                        Try Again
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="container mx-auto py-8">
            <ToastContainer position="top-right" autoClose={3000} />

            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900">
                    {mentor && `${mentor.firstName} ${mentor.lastName}`}'s Dashboard
                </h1>
                <p className="text-gray-600">Manage your courses, students, and schedule</p>
            </div>

            <Tabs selectedIndex={tabIndex} onSelect={index => setTabIndex(index)}>
                <TabList className="flex border-b border-gray-200 mb-6">
                    <Tab className="px-6 py-3 font-medium text-gray-700 hover:text-blue-600 cursor-pointer focus:outline-none">
                        Profile
                    </Tab>
                    <Tab className="px-6 py-3 font-medium text-gray-700 hover:text-blue-600 cursor-pointer focus:outline-none">
                        Courses
                    </Tab>
                    <Tab className="px-6 py-3 font-medium text-gray-700 hover:text-blue-600 cursor-pointer focus:outline-none">
                        Mock Tests
                    </Tab>
                    <Tab className="px-6 py-3 font-medium text-gray-700 hover:text-blue-600 cursor-pointer focus:outline-none">
                        Classes
                    </Tab>
                    <Tab className="px-6 py-3 font-medium text-gray-700 hover:text-blue-600 cursor-pointer focus:outline-none">
                        Students
                    </Tab>
                    <Tab className="px-6 py-3 font-medium text-gray-700 hover:text-blue-600 cursor-pointer focus:outline-none">
                        Notifications
                        {notifications.length > 0 && (
                            <span className="ml-2 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white bg-red-500 rounded-full">
                                {notifications.length}
                            </span>
                        )}
                    </Tab>
                </TabList>

                <TabPanel>
                    {mentor && <ProfileSection mentor={mentor} onUpdate={handleProfileUpdate} />}
                </TabPanel>

                <TabPanel>
                    {isCreatingCourse ? (
                        <CourseForm
                            onSubmit={handleCreateCourse}
                            onCancel={() => setIsCreatingCourse(false)}
                            onVideoUpload={handleVideoUpload}
                        />
                    ) : selectedCourse ? (
                        <CourseForm
                            course={selectedCourse}
                            onSubmit={(data) => handleUpdateCourse(selectedCourse._id, data)}
                            onCancel={() => setSelectedCourse(null)}
                            onAddContent={(content) => handleAddCourseContent(selectedCourse._id, content)}
                            onVideoUpload={(file, progressCb) => handleVideoUpload(selectedCourse._id, file, progressCb)}
                        />
                    ) : (
                        <CoursesSection
                            courses={courses}
                            onNewCourse={() => setIsCreatingCourse(true)}
                            onEditCourse={setSelectedCourse}
                            onDeleteCourse={handleDeleteCourse}
                        />
                    )}
                </TabPanel>

                <TabPanel>
                    {isCreatingTest ? (
                        <MockTestForm
                            onSubmit={handleCreateMockTest}
                            onCancel={() => setIsCreatingTest(false)}
                            courses={courses}
                        />
                    ) : selectedTest ? (
                        <MockTestForm
                            test={selectedTest}
                            onSubmit={(data) => {
                                // Handle update mock test
                            }}
                            onCancel={() => setSelectedTest(null)}
                            courses={courses}
                        />
                    ) : (
                        <MockTestsSection
                            tests={mockTests}
                            onNewTest={() => setIsCreatingTest(true)}
                            onEditTest={setSelectedTest}
                        />
                    )}
                </TabPanel>

                <TabPanel>
                    {isSchedulingClass ? (
                        <ClassForm
                            onSubmit={handleScheduleClass}
                            onCancel={() => setIsSchedulingClass(false)}
                            courses={courses}
                        />
                    ) : selectedClass ? (
                        <AttendanceSheet
                            classInfo={selectedClass}
                            onSubmit={(data) => handleTakeAttendance(selectedClass._id, data)}
                            onCancel={() => setSelectedClass(null)}
                        />
                    ) : (
                        <ClassesSection
                            classes={classes}
                            onNewClass={() => setIsSchedulingClass(true)}
                            onSelectClass={setSelectedClass}
                        />
                    )}
                </TabPanel>

                <TabPanel>
                    <StudentsSection students={students} />
                </TabPanel>

                <TabPanel>
                    <NotificationsSection
                        notifications={notifications}
                        onMarkAsRead={(id) => {
                            // Handle marking notification as read
                        }}
                    />
                </TabPanel>
            </Tabs>
        </div>
    );
};

export default MentorDashboard;
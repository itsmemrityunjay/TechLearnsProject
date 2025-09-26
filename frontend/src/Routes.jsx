import React from 'react';
import { Routes, Route } from 'react-router-dom';
import ScrollToTop from './utils/ScrollToTop';
import Layout from './utils/Layout';

// Import all page components
import Login from './pages/login';
import Signup from './pages/signup';
import Home from './pages/home'
import Competitions from './pages/competition';
import HostCompetitions from './pages/competition/components/HostCompetition';
import CompetitionById from './pages/competition/components/CompetitionbyId';
import Topics from './pages/discussion'
import Notebook from './pages/notebook'
import UserDashboard from './pages/dashboard/User';
import PovertyVerification from './pages/povertyVerification';
import MentorDash from './pages/dashboard/Mentor';
import Course from './pages/course'; // Import the Course component
import DetailedCourse from './pages/course/components/DetailedCourse';
import About from './pages/about';

// Mock Test Components
import MockTestList from './pages/MockTest/MockTestList';
import TakeMockTest from './pages/MockTest/TakeMockTest';
import TestResults from './pages/MockTest/TestResults';
import MockTestResults from './pages/dashboard/Mentor/components/MockTestResults';

const AppRoutes = () => {
    return (<>
        <ScrollToTop />
        <Layout>
            <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Signup />} />
                <Route path='/competitions' element={<Competitions />} />
                <Route path='/competitions-host' element={<HostCompetitions />} />
                <Route path='/competitions/:id' element={<CompetitionById />} />
                <Route path='/discussions' element={<Topics />} />
                <Route path='/notebook' element={<Notebook />} />
                <Route path="/dashboard" element={<UserDashboard />} />
                <Route path="/mentor/register" element={<Signup />} />
                <Route path="/school/register" element={<Signup />} />
                <Route path="/below-poverty-verification" element={<PovertyVerification />} />
                <Route path="/mentor" element={<MentorDash />} />
                <Route path="/mentor-dashboard" element={<MentorDash />} />
                <Route path="/about" element={<About />} />

                {/* Course Routes */}
                <Route path="/courses" element={<Course />} />
                <Route path="/courses/:id" element={<DetailedCourse />} />

                {/* Mock Test Routes */}
                <Route path="/mock-tests" element={<MockTestList />} />
                <Route path="/take-test/:testId" element={<TakeMockTest />} />
                <Route path="/test-results/:testId" element={<TestResults />} />
                <Route path="/mentor/mock-test-results/:testId" element={<MockTestResults />} />

                {/* Add more routes as needed */}
            </Routes>
        </Layout>
    </>
    );
};

export default AppRoutes;
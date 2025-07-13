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
                <Route path="/mentor-dashboard" element={<MentorDash />} />

                {/* Added Course Routes */}
                <Route path="/courses" element={<Course />} />
                <Route path="/courses/:id" element={<DetailedCourse />} />


                {/* Add more routes as needed */}
            </Routes>
        </Layout>
    </>
    );
};

export default AppRoutes;
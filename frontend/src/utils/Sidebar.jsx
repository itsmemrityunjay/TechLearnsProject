import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext'; // Import the auth hook
import {
    FaHome,
    FaTrophy,
    FaBook,
    FaComment,
    FaUser,
    FaBars,
    FaTimes,
    FaSignOutAlt,
    FaUniversity,
    FaCheckCircle,
    FaTachometerAlt,
    FaGraduationCap // Add this import
} from 'react-icons/fa';
import logo from '../assets/Logo-w.png';

const Sidebar = ({ onWidthChange }) => {
    const { currentUser, logout } = useAuth(); // Use the auth context
    const navigate = useNavigate();
    const location = useLocation();
    const [drawerOpen, setDrawerOpen] = useState(false);
    const [isMobile, setIsMobile] = useState(window.innerWidth <= 600);
    const [activeItem, setActiveItem] = useState('');
    const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);

    // Notify parent component when sidebar width changes - with debounce
    useEffect(() => {
        const width = isMobile
            ? (drawerOpen ? 'w-64' : 'w-0')
            : (drawerOpen ? 'w-64' : 'w-20');

        // Use requestAnimationFrame to ensure smooth transitions
        if (onWidthChange) {
            requestAnimationFrame(() => {
                onWidthChange(width);
            });
        }
    }, [drawerOpen, isMobile, onWidthChange]);

    // Check auth state on mount
    useEffect(() => {
        const checkAuth = () => {
            try {
                const storedUserInfo = localStorage.getItem('userInfo');
                if (storedUserInfo) {
                    const parsedInfo = JSON.parse(storedUserInfo);
                    console.log('User authenticated with role:', parsedInfo.role);
                }
            } catch (error) {
                console.error('Error checking auth state:', error);
            }
        };

        checkAuth();

        // Check if mobile screen and add resize listener
        const handleResize = () => {
            setIsMobile(window.innerWidth <= 600);
        };

        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    // Set active item based on current path
    useEffect(() => {
        const path = location.pathname;

        if (path === '/') setActiveItem('Home');
        else if (path.includes('courses')) setActiveItem('Courses'); // Add this line
        else if (path.includes('competitions')) setActiveItem('Competitions');
        else if (path.includes('notebook')) setActiveItem('Notebook');   // Add this line
        else if (path.includes('discussions')) setActiveItem('Discussions');
        else if (path.includes('dashboard')) setActiveItem('Dashboard');
        else if (path === '/below-poverty-verification') setActiveItem('Verification');
        else if (path.includes('mentor-dashboard')) setActiveItem('Mentor');
        else setActiveItem('');
    }, [location.pathname]);

    // Navigation items based on user role
    const getNavigationItems = () => {
        const role = currentUser?.role || '';
        console.log('Building navigation with role:', role);

        const baseNavigation = [
            {
                title: "Home",
                path: "/",
                icon: <FaHome size={20} />,
                roles: ["user", "student", "admin", "mentor", "school", ""]
            },
            {
                title: "Courses",
                path: "/courses",
                icon: <FaGraduationCap size={20} />, // You'll need to import FaGraduationCap
                roles: ["user", "student", "admin", "mentor", "school", ""]
            },
            {
                title: "Competitions",
                path: "/competitions",
                icon: <FaTrophy size={20} />,
                roles: ["user", "student", "admin", "mentor", "school", ""]
            },
            {
                title: "Notebook",
                path: "/notebook",
                icon: <FaBook size={20} />,  // Using FaBook icon for notebooks
                roles: ["user", "student", "admin", "mentor", "school", ""]
            },
            {
                title: "Discussions",
                path: "/discussions",
                icon: <FaComment size={20} />,
                roles: ["user", "student", "admin", "mentor", "school", ""]
            }
        ];

        // Conditional navigation items
        if (role === 'mentor') {
            baseNavigation.push({
                title: "Mentor Dashboard",
                path: "/mentor-dashboard",
                icon: <FaTachometerAlt size={20} />,
                roles: ["mentor"]
            });
        } else if (role === 'admin' || role === 'sub-admin') {
            baseNavigation.push({
                title: "Admin Dashboard",
                path: "/dashboard",
                icon: <FaTachometerAlt size={20} />,
                roles: ["admin", "sub-admin"]
            });
        } else {
            baseNavigation.push({
                title: "User Dashboard",
                path: "/dashboard",
                icon: <FaUser size={20} />,
                roles: ["user", "student", ""]
            });
        }

        // Poverty verification available to all users
        if (role === 'user' || role === 'student') {
            baseNavigation.push({
                title: "Verification",
                path: "/below-poverty-verification",
                icon: <FaCheckCircle size={20} />,
                roles: ["user", "student"]
            });
        }

        return baseNavigation.filter(item =>
            item.roles.includes(role) || item.roles.includes("")
        );
    };

    const toggleDrawer = () => {
        setDrawerOpen(!drawerOpen);
    };

    const handleNavigation = (path, title) => {
        setActiveItem(title);

        // Ensure auth header will be available for the next request
        // (Token stays in localStorage, so authentication persists)
        navigate(path);

        // Close drawer on mobile after navigation
        if (isMobile) {
            setDrawerOpen(false);
        }
    };

    const handleLogout = () => {
        logout();
        navigate("/login");
        setIsLogoutModalOpen(false);
    };

    return (
        <>
            {/* Mobile Toggle Button */}
            {isMobile && (
                <button
                    className="fixed top-4 left-4 z-40 bg-black text-white p-2 rounded-md shadow-lg"
                    onClick={toggleDrawer}
                >
                    {drawerOpen ? <FaTimes size={24} /> : <FaBars size={24} />}
                </button>
            )}

            {/* Sidebar/Drawer - Updated CSS transitions */}
            <div
                className={`fixed top-0 left-2 h-full bg-black text-white shadow-xl z-30
                    ${isMobile
                        ? (drawerOpen ? 'w-64 translate-x-0' : 'w-0 -translate-x-full')
                        : (drawerOpen ? 'w-64' : 'w-20')}
                    overflow-hidden rounded-xl will-change-transform`}
                style={{
                    transition: 'width 300ms cubic-bezier(0.4, 0, 0.2, 1), transform 300ms cubic-bezier(0.4, 0, 0.2, 1)'
                }}
            >
                <div className="flex flex-col h-full">
                    {/* Logo and Toggle */}
                    <div className="flex items-center justify-between p-4 border-b border-gray-700">
                        {drawerOpen && (
                            <img
                                src={logo} onClick={() => window.location.href = '/'}
                                alt="Logo"
                                className="h-8"
                            />
                        )}
                        {!isMobile && (
                            <button
                                onClick={toggleDrawer}
                                className={`${drawerOpen ? 'ml-auto' : 'mx-auto'} text-white hover:bg-gray-700 p-2 rounded-md`}
                            >
                                {drawerOpen ? <FaTimes size={20} /> : <FaBars size={20} />}
                            </button>
                        )}
                    </div>

                    {/* Navigation Links */}
                    <nav className="flex-1 px-2 py-4">
                        <ul className="space-y-2">
                            {getNavigationItems().map((item) => (
                                <li key={item.title}>
                                    <button
                                        onClick={() => handleNavigation(item.path, item.title)}
                                        className={`flex items-center ${drawerOpen ? 'justify-start' : 'justify-center'} w-full p-3 rounded-md transition-all
                              ${activeItem === item.title ? 'bg-white text-black' : 'text-white hover:bg-gray-700'}`}
                                    >
                                        <span className="text-center">{item.icon}</span>
                                        {drawerOpen && <span className="ml-3">{item.title}</span>}
                                    </button>
                                </li>
                            ))}
                        </ul>
                    </nav>

                    {/* Logout Button */}
                    <div className="p-4 border-t border-gray-700">
                        <button
                            onClick={() => setIsLogoutModalOpen(true)}
                            className={`flex items-center ${drawerOpen ? 'justify-start' : 'justify-center'} w-full p-3 text-white hover:bg-red-700 rounded-md transition-all`}
                        >
                            <FaSignOutAlt size={20} />
                            {drawerOpen && <span className="ml-3">Logout</span>}
                        </button>
                    </div>
                </div>
            </div>

            {/* Logout Confirmation Modal */}
            {isLogoutModalOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white p-6 rounded-lg shadow-lg max-w-sm w-full">
                        <h3 className="text-lg font-medium text-gray-900">Confirm Logout</h3>
                        <p className="mt-2 text-gray-500">Are you sure you want to log out?</p>
                        <div className="mt-4 flex justify-end space-x-3">
                            <button
                                onClick={() => setIsLogoutModalOpen(false)}
                                className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleLogout}
                                className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
                            >
                                Logout
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default Sidebar;
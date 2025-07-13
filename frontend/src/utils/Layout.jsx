import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import Sidebar from './Sidebar';
import Footer from './Footer';
import logo from '../assets/Logo.png'; // Import the colored logo for white background

const Layout = ({ children }) => {
    const location = useLocation();
    const currentPath = location.pathname;

    // Hide sidebar on these paths
    const hideSidebarPaths = ['/', '/login', '/register'];
    const showSidebar = !hideSidebarPaths.includes(currentPath);

    const [isLoading, setIsLoading] = useState(true);
    const [sidebarWidth, setSidebarWidth] = useState('w-20'); // Default collapsed width
    const [isMobile, setIsMobile] = useState(window.innerWidth <= 768); // Add a state to track if we're in mobile view

    // Use ref to avoid unnecessary re-renders
    const mainContentRef = React.useRef(null);

    // Listen for sidebar width changes with improved handling
    const handleSidebarWidthChange = (width) => {
        if (sidebarWidth !== width) {
            setSidebarWidth(width);
        }
    };

    useEffect(() => {
        // Loading effect simulation
        const loadTimeout = setTimeout(() => {
            setIsLoading(false);
        }, 1000);

        return () => clearTimeout(loadTimeout);
    }, []);

    // Add this effect to detect screen size changes
    useEffect(() => {
        const handleResize = () => {
            setIsMobile(window.innerWidth <= 768);
        };

        window.addEventListener('resize', handleResize);

        // Initial check
        handleResize();

        return () => {
            window.removeEventListener('resize', handleResize);
        };
    }, []);

    // Apply margin changes directly to the DOM for smoother transitions
    useEffect(() => {
        if (mainContentRef.current) {
            // Use direct style manipulation for smoother transitions
            const mainElement = mainContentRef.current;

            if (!showSidebar) {
                mainElement.style.marginLeft = '0';
            } else if (isMobile) {
                // For mobile views, always use 0 margin when sidebar is shown
                mainElement.style.marginLeft = '0';
            } else if (sidebarWidth === 'w-64') {
                mainElement.style.marginLeft = '17rem'; // 64 (w-64) = 16rem
            } else {
                mainElement.style.marginLeft = '6rem'; // 20 (w-20) = 5rem
            }
        }
    }, [sidebarWidth, showSidebar, isMobile]);

    return (
        <div className="flex flex-col min-h-screen bg-gray-50">
            {/* New top navigation bar with logo */}
            <div className="w-full bg-white shadow-sm z-20 sticky top-0">
                <div className="container mx-auto ml-16 sm:ml-0 md:ml-24 py-4 flex items-center ">
                    <img
                        src={logo} onClick={() => window.location.href = '/'}
                        alt="TechLearns"
                        className="h-10 w-auto"
                    />
                </div>
            </div>

            <div className="flex flex-1">
                {/* Conditionally render sidebar */}
                {showSidebar && (
                    <Sidebar onWidthChange={handleSidebarWidthChange} />
                )}

                {/* Main content - with improved transitions */}
                <main
                    ref={mainContentRef}
                    className="flex-1 overflow-x-hidden"
                    style={{
                        transition: 'margin-left 300ms cubic-bezier(0.4, 0, 0.2, 1)',
                        willChange: 'margin-left'
                    }}
                >
                    {isLoading ? (
                        <div className="flex items-center justify-center h-screen">
                            <div className="loader">
                                <iframe
                                    src="https://lottie.host/embed/7ba88a5c-ed1e-4914-bc20-0c3bc677280c/YurJgPsrJ1.json"
                                    title="Loading Animation"
                                    style={{ width: "300px", height: "300px", border: "none" }}
                                    allowFullScreen
                                ></iframe>
                            </div>
                        </div>
                    ) : (
                        <div className="flex flex-col min-h-screen">
                            <div className="flex-grow pt-1">
                                {children}
                            </div>
                            <div className="w-full">
                                <Footer />
                            </div>
                        </div>
                    )}
                </main>
            </div>
        </div>
    );
};

export default Layout;
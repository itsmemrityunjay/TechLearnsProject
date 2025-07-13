import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import Header from './components/Header';
import MainNotebook from './components/MainNotebook';

const NotebookPage = () => {
    const { id } = useParams();
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        // Check authentication
        const token = localStorage.getItem('token');
        if (!token) {
            setError('Please login to access the Notebook IDE');
            setLoading(false);
        } else {
            setLoading(false);
        }
    }, []);

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-100 flex items-center justify-center">
                <div className="w-16 h-16 border-4 border-[#013954] border-t-transparent border-solid rounded-full animate-spin"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-100">
            <Header />
            <div className="container mx-auto px-4 py-8">
                {error ? (
                    <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded">
                        <p>{error}</p>
                    </div>
                ) : (
                    <MainNotebook notebookId={id} />
                )}
            </div>
        </div>
    );
};

export default NotebookPage;
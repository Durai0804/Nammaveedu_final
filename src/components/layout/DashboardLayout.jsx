import React, { useState } from 'react';
import Header from './Header';
import Sidebar from './Sidebar';

const DashboardLayout = ({ children, allowResidentAccess = false }) => {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const userRole = localStorage.getItem('userRole') || 'admin'; // Default to admin for dev if not set

    const toggleMobileMenu = () => {
        setIsMobileMenuOpen(!isMobileMenuOpen);
    };

    const closeMobileMenu = () => {
        setIsMobileMenuOpen(false);
    };

    return (
        <div className="min-h-screen bg-neutral-50">
            <Header
                onMenuToggle={toggleMobileMenu}
                isMobileMenuOpen={isMobileMenuOpen}
            />

            <div className="flex">
                <Sidebar
                    isOpen={isMobileMenuOpen}
                    onClose={closeMobileMenu}
                    role={userRole}
                />

                <main className="flex-1 p-4 lg:p-6 custom-scrollbar overflow-y-auto">
                    <div className="max-w-7xl mx-auto">
                        {userRole === 'resident' && !allowResidentAccess ? (
                            <div className="flex flex-col items-center justify-center min-h-[60vh] text-center animate-fadeIn">
                                <div className="w-24 h-24 bg-green-100 text-green-600 rounded-full flex items-center justify-center mb-6">
                                    <span className="text-4xl">🏠</span>
                                </div>
                                <h2 className="text-2xl font-bold text-neutral-900 mb-2">Welcome Home</h2>
                                <p className="text-neutral-600 max-w-md">
                                    The Resident Portal is currently being setup. You will soon be able to view your maintenance dues, raise complaints, and more.
                                </p>
                            </div>
                        ) : (
                            children
                        )}
                    </div>
                </main>
            </div>
        </div>
    );
};

export default DashboardLayout;

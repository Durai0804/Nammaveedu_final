import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../../context/LanguageContext';
import { Menu, X, Globe } from 'lucide-react';
import Button from '../ui/Button';

const Header = ({ onMenuToggle, isMobileMenuOpen }) => {
    const { t, toggleLanguage, language } = useLanguage();
    const navigate = useNavigate();

    const handleLogout = () => {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('token');
        localStorage.removeItem('userRole');
        localStorage.removeItem('rememberMe');
        localStorage.removeItem('residentProfile');
        localStorage.removeItem('residentComplaints');
        localStorage.removeItem('preApprovedVisitors');
        navigate('/login');
    };

    return (
        <header className="bg-white border-b border-neutral-200 sticky top-0 z-40">
            <div className="flex items-center justify-between px-4 py-3 lg:px-6">
                {/* Mobile Menu Toggle */}
                <button
                    onClick={onMenuToggle}
                    className="lg:hidden p-2 rounded-lg hover:bg-neutral-100 transition-colors"
                    aria-label="Toggle menu"
                >
                    {isMobileMenuOpen ? (
                        <X className="w-6 h-6 text-neutral-700" />
                    ) : (
                        <Menu className="w-6 h-6 text-neutral-700" />
                    )}
                </button>

                {/* Logo - Desktop */}
                <div className="hidden lg:flex items-center space-x-2">
                    <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center">
                        <span className="text-white font-bold text-lg">N</span>
                    </div>
                    <span className={`text-xl font-bold text-neutral-800 ${language === 'ta' ? 'font-tamil' : ''}`}>
                        {t('appName')}
                    </span>
                </div>

                {/* Logo - Mobile */}
                <div className="lg:hidden flex items-center space-x-2">
                    <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center">
                        <span className="text-white font-bold text-lg">N</span>
                    </div>
                    <span className={`text-lg font-bold text-neutral-800 ${language === 'ta' ? 'font-tamil' : ''}`}>
                        {t('appName')}
                    </span>
                </div>

                {/* Right Section */}
                <div className="flex items-center space-x-3">
                    {/* Language Toggle */}
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={toggleLanguage}
                        className="flex items-center space-x-1"
                    >
                        <Globe className="w-4 h-4" />
                        <span className="hidden sm:inline">{language === 'en' ? 'தமிழ்' : 'English'}</span>
                    </Button>

                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={handleLogout}
                    >
                        Logout
                    </Button>

                    {/* User Profile */}
                    <div className="flex items-center space-x-2">
                        <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center">
                            <span className="text-primary-700 font-medium text-sm">A</span>
                        </div>
                        <span className="hidden md:inline text-sm font-medium text-neutral-700">Admin</span>
                    </div>
                </div>
            </div>
        </header>
    );
};

export default Header;

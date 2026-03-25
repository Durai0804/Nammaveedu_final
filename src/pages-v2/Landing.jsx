import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Building2, Shield, Users, Bell, ChevronRight, ArrowRight, CheckCircle2 } from 'lucide-react';

const Landing = () => {
    const navigate = useNavigate();
    const [theme, setTheme] = useState('dark');

    useEffect(() => {
        const savedTheme = localStorage.getItem('theme') || 'dark';
        setTheme(savedTheme);

        // If already logged in, redirect to dashboard
        const token = localStorage.getItem('token');
        if (token) {
            const role = localStorage.getItem('userRole');
            if (role === 'resident') {
                navigate('/resident/dashboard');
            } else {
                navigate('/admin/dashboard');
            }
        }
    }, [navigate]);

    const isDark = theme === 'dark';

    const features = [
        {
            icon: Building2,
            title: 'Flat Management',
            description: 'Complete flat records, resident details, and occupancy tracking in one place.',
            color: 'from-blue-500 to-blue-600'
        },
        {
            icon: Shield,
            title: 'Complaint System',
            description: 'Raise, track and resolve complaints with real-time status updates.',
            color: 'from-purple-500 to-purple-600'
        },
        {
            icon: Users,
            title: 'Visitor Logging',
            description: 'Pre-approve visitors, log entries and exits with complete security.',
            color: 'from-teal-500 to-teal-600'
        },
        {
            icon: Bell,
            title: 'Smart Notices',
            description: 'Community announcements with automatic notifications to all residents.',
            color: 'from-orange-500 to-orange-600'
        }
    ];

    const stats = [
        { label: 'Apartments Managed', value: '500+' },
        { label: 'Active Communities', value: '50+' },
        { label: 'Complaints Resolved', value: '10K+' },
        { label: 'Happy Residents', value: '2000+' }
    ];

    return (
        <div className={`min-h-screen ${isDark ? 'bg-gray-950' : 'bg-gray-50'} transition-colors duration-500`}>
            {/* Navigation */}
            <nav className={`fixed top-0 left-0 right-0 z-50 ${isDark ? 'bg-gray-950/80' : 'bg-white/80'} backdrop-blur-xl border-b ${isDark ? 'border-gray-800' : 'border-gray-200'}`}>
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-16">
                        <div className="flex items-center gap-3">
                            <div className={`w-9 h-9 rounded-xl ${isDark ? 'bg-gradient-to-br from-cyan-500 to-blue-600' : 'bg-gradient-to-br from-cyan-500 to-blue-600'} flex items-center justify-center shadow-lg`}>
                                <span className="text-white font-bold text-sm">N</span>
                            </div>
                            <span className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                                NammaVeedu
                            </span>
                        </div>
                        <div className="flex items-center gap-3">
                            <button
                                onClick={() => {
                                    const newTheme = theme === 'dark' ? 'light' : 'dark';
                                    setTheme(newTheme);
                                    localStorage.setItem('theme', newTheme);
                                }}
                                className={`p-2 rounded-lg ${isDark ? 'hover:bg-gray-800 text-gray-400' : 'hover:bg-gray-100 text-gray-600'} transition-colors`}
                            >
                                {isDark ? (
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                                    </svg>
                                ) : (
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                                    </svg>
                                )}
                            </button>
                            <button
                                onClick={() => navigate('/login')}
                                className={`px-5 py-2.5 rounded-xl text-sm font-semibold transition-all duration-300 ${isDark
                                    ? 'bg-white text-gray-900 hover:bg-gray-100 shadow-lg shadow-white/10'
                                    : 'bg-gray-900 text-white hover:bg-gray-800 shadow-lg shadow-gray-900/20'
                                    }`}
                            >
                                Sign In
                            </button>
                        </div>
                    </div>
                </div>
            </nav>

            {/* Hero Section */}
            <section className="pt-32 pb-20 px-4 relative overflow-hidden">
                {/* Background decoration */}
                <div className="absolute inset-0 overflow-hidden">
                    <div className={`absolute top-20 left-1/4 w-96 h-96 rounded-full blur-3xl opacity-10 ${isDark ? 'bg-cyan-500' : 'bg-cyan-400'}`} />
                    <div className={`absolute bottom-0 right-1/4 w-96 h-96 rounded-full blur-3xl opacity-10 ${isDark ? 'bg-blue-500' : 'bg-blue-400'}`} />
                </div>

                <div className="max-w-7xl mx-auto text-center relative z-10">
                    <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full ${isDark ? 'bg-cyan-500/10 border border-cyan-500/20' : 'bg-cyan-50 border border-cyan-200'} mb-8`}>
                        <CheckCircle2 className="w-4 h-4 text-cyan-500" />
                        <span className={`text-sm font-medium ${isDark ? 'text-cyan-400' : 'text-cyan-700'}`}>
                            Trusted by 50+ communities across India
                        </span>
                    </div>

                    <h1 className={`text-5xl sm:text-6xl lg:text-7xl font-bold mb-6 leading-tight ${isDark ? 'text-white' : 'text-gray-900'}`}>
                        Smart Apartment
                        <br />
                        <span className="bg-gradient-to-r from-cyan-500 to-blue-600 bg-clip-text text-transparent">
                            Management
                        </span>
                    </h1>

                    <p className={`text-lg sm:text-xl max-w-2xl mx-auto mb-10 leading-relaxed ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                        Streamline your apartment community with digital maintenance tracking,
                        complaint resolution, visitor management, and instant notifications.
                    </p>

                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                        <button
                            onClick={() => navigate('/login')}
                            className="group px-8 py-4 bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-semibold rounded-xl hover:shadow-lg hover:shadow-cyan-500/25 transition-all duration-300 flex items-center gap-2 text-lg"
                        >
                            Get Started
                            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                        </button>
                        <button
                            onClick={() => navigate('/login')}
                            className={`px-8 py-4 rounded-xl font-semibold text-lg transition-all duration-300 flex items-center gap-2 ${isDark
                                ? 'bg-gray-800 text-white hover:bg-gray-700 border border-gray-700'
                                : 'bg-white text-gray-900 hover:bg-gray-50 border border-gray-200 shadow-sm'
                                }`}
                        >
                            Login as Resident
                            <ChevronRight className="w-5 h-5" />
                        </button>
                    </div>
                </div>
            </section>

            {/* Stats Section */}
            <section className={`py-16 ${isDark ? 'bg-gray-900/50' : 'bg-white'}`}>
                <div className="max-w-7xl mx-auto px-4">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                        {stats.map((stat, index) => (
                            <div key={index} className="text-center">
                                <p className={`text-3xl sm:text-4xl font-bold mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                                    {stat.value}
                                </p>
                                <p className={`text-sm ${isDark ? 'text-gray-500' : 'text-gray-600'}`}>
                                    {stat.label}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Features Section */}
            <section className="py-20 px-4">
                <div className="max-w-7xl mx-auto">
                    <div className="text-center mb-16">
                        <h2 className={`text-3xl sm:text-4xl font-bold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                            Everything You Need
                        </h2>
                        <p className={`text-lg max-w-2xl mx-auto ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                            A complete suite of tools to manage your apartment community efficiently
                        </p>
                    </div>

                    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {features.map((feature, index) => {
                            const Icon = feature.icon;
                            return (
                                <div
                                    key={index}
                                    className={`group p-6 rounded-2xl border transition-all duration-300 hover:-translate-y-1 ${isDark
                                        ? 'bg-gray-900 border-gray-800 hover:border-gray-700'
                                        : 'bg-white border-gray-200 hover:border-gray-300 hover:shadow-lg'
                                        }`}
                                >
                                    <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${feature.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                                        <Icon className="w-6 h-6 text-white" />
                                    </div>
                                    <h3 className={`text-lg font-semibold mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                                        {feature.title}
                                    </h3>
                                    <p className={`text-sm leading-relaxed ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                                        {feature.description}
                                    </p>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className={`py-20 px-4 ${isDark ? 'bg-gray-900/50' : 'bg-gray-100'}`}>
                <div className="max-w-4xl mx-auto text-center">
                    <h2 className={`text-3xl sm:text-4xl font-bold mb-6 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                        Ready to Simplify Your Community?
                    </h2>
                    <p className={`text-lg mb-8 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                        Join thousands of communities already using NammaVeedu for hassle-free apartment management.
                    </p>
                    <button
                        onClick={() => navigate('/login')}
                        className="group px-10 py-4 bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-semibold rounded-xl hover:shadow-lg hover:shadow-cyan-500/25 transition-all duration-300 flex items-center gap-2 text-lg mx-auto"
                    >
                        Start Managing Today
                        <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                    </button>
                </div>
            </section>

            {/* Footer */}
            <footer className={`py-8 px-4 border-t ${isDark ? 'border-gray-800' : 'border-gray-200'}`}>
                <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center">
                            <span className="text-white font-bold text-xs">N</span>
                        </div>
                        <span className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>NammaVeedu</span>
                    </div>
                    <p className={`text-sm ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>
                        © 2026 NammaVeedu Systems. All rights reserved.
                    </p>
                </div>
            </footer>
        </div>
    );
};

export default Landing;

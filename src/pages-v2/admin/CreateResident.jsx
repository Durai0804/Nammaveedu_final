import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Home, Users, AlertCircle, Building2, Menu, X, LogOut, Settings,
    ChevronRight, Loader, IndianRupee, Bell, Package, FileText,
    UserPlus, CheckCircle, Copy
} from 'lucide-react';

const CreateResident = () => {
    const navigate = useNavigate();
    const [theme, setTheme] = useState('light');
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [credentials, setCredentials] = useState(null);
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        mobile: '',
        flatNumber: '',
        block: '',
        floor: '',
        members: '',
        password: 'Temp@1234'
    });

    useEffect(() => {
        const savedTheme = localStorage.getItem('theme') || 'light';
        setTheme(savedTheme);
    }, []);

    // Fixed default password for all new residents
    const DEFAULT_PASSWORD = 'Temp@1234';

    const handleLogout = () => {
        localStorage.clear();
        navigate('/login');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const token = localStorage.getItem('accessToken') || localStorage.getItem('token');

        try {
            setLoading(true);

            // Prepare payload according to backend schema
            const payload = {
                name: formData.name,
                email: formData.email,
                mobile: formData.mobile,
                flatNumber: formData.flatNumber,
                block: formData.block,
                floor: formData.floor,
                members: formData.members ? parseInt(formData.members) : null
            };

            const response = await fetch('http://localhost:4000/api/admin/residents', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(payload)
            });

            const result = await response.json();
            if (result.success) {
                setSuccess(true);
                setCredentials({
                    email: formData.email,
                    password: formData.password,
                    flatNumber: formData.flatNumber
                });
            } else {
                // Handle specific Zod errors or business logic errors
                const errorMessage = result.error || 'Failed to create resident';
                const details = result.details ? JSON.stringify(result.details) : '';
                alert(`${errorMessage}${details ? ': ' + details : ''}`);
            }
        } catch (error) {
            console.error('Error creating resident:', error);
            alert('Failed to create resident. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const copyToClipboard = (text) => {
        navigator.clipboard.writeText(text);
        alert('Copied to clipboard!');
    };

    const resetForm = () => {
        setFormData({
            name: '',
            email: '',
            mobile: '',
            flatNumber: '',
            block: '',
            floor: '',
            members: '',
            password: DEFAULT_PASSWORD
        });
        setSuccess(false);
        setCredentials(null);
    };

    const isDark = theme === 'dark';

    const sidebarItems = [
        { icon: Home, label: 'Dashboard', path: '/admin/dashboard' },
        { icon: Building2, label: 'Flats', path: '/flats' },
        { icon: IndianRupee, label: 'Administration', path: '/administration' },
        { icon: AlertCircle, label: 'Complaints', path: '/complaints' },
        { icon: Bell, label: 'Notices', path: '/notices' },
        { icon: Package, label: 'Visitors', path: '/visitors' },
        { icon: UserPlus, label: 'Create Resident', path: '/admin/residents/create', active: true },
        { icon: FileText, label: 'Reports', path: '/reports' },
        { icon: Settings, label: 'Settings', path: '/settings' }
    ];

    return (
        <div className={`min-h-screen ${isDark ? 'bg-black' : 'bg-gray-50'} transition-colors duration-300`}>
            {/* Sidebar */}
            <div className={`fixed inset-y-0 left-0 z-50 w-64 ${isDark ? 'bg-[#0a0a0a] border-[#1f1f1f]' : 'bg-white border-gray-200'} border-r transform transition-transform duration-300 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0`}>
                <div className={`flex items-center justify-between p-4 border-b ${isDark ? 'border-[#1f1f1f]' : 'border-gray-200'}`}>
                    <div className="flex items-center gap-2">
                        <div className={`w-8 h-8 ${isDark ? 'bg-[#181818]' : 'bg-gray-900'} rounded-lg flex items-center justify-center`}>
                            <span className="text-white font-bold text-sm">N</span>
                        </div>
                        <span className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>NammaVeedu</span>
                    </div>
                    <button onClick={() => setSidebarOpen(false)} className="lg:hidden">
                        <X className={`w-5 h-5 ${isDark ? 'text-gray-400' : 'text-gray-600'}`} />
                    </button>
                </div>

                <nav className="p-4 space-y-1 overflow-y-auto" style={{ maxHeight: 'calc(100vh - 140px)' }}>
                    {sidebarItems.map((item) => {
                        const Icon = item.icon;
                        return (
                            <button
                                key={item.path}
                                onClick={() => {
                                    navigate(item.path);
                                    setSidebarOpen(false);
                                }}
                                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${item.active
                                    ? isDark ? 'bg-[#1f1f1f] text-white' : 'bg-blue-600 text-white'
                                    : isDark ? 'text-gray-400 hover:bg-[#181818] hover:text-white' : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                                    }`}
                            >
                                <Icon className="w-5 h-5" />
                                <span className="font-medium">{item.label}</span>
                            </button>
                        );
                    })}
                </nav>

                <div className={`absolute bottom-0 left-0 right-0 p-4 border-t ${isDark ? 'border-[#1f1f1f]' : 'border-gray-200'}`}>
                    <button onClick={handleLogout} className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${isDark ? 'text-red-400 hover:bg-red-500/10' : 'text-red-600 hover:bg-red-50'}`}>
                        <LogOut className="w-5 h-5" />
                        <span className="font-medium">Logout</span>
                    </button>
                </div>
            </div>

            {/* Main Content */}
            <div className="lg:ml-64">
                {/* Header */}
                <div className={`${isDark ? 'bg-[#0a0a0a] border-[#1f1f1f]' : 'bg-white border-gray-200'} border-b sticky top-0 z-40`}>
                    <div className="px-4 sm:px-6 lg:px-8">
                        <div className="flex items-center justify-between h-16">
                            <button onClick={() => setSidebarOpen(true)} className="lg:hidden">
                                <Menu className={`w-6 h-6 ${isDark ? 'text-white' : 'text-gray-900'}`} />
                            </button>

                            <div className="flex items-center gap-2">
                                <span className={`text-sm ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>Admin</span>
                                <ChevronRight className="w-4 h-4 text-gray-400" />
                                <span className={`text-sm font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>Create Resident</span>
                            </div>

                            <button
                                onClick={() => {
                                    const newTheme = theme === 'dark' ? 'light' : 'dark';
                                    setTheme(newTheme);
                                    localStorage.setItem('theme', newTheme);
                                }}
                                className={`p-2 rounded-lg ${isDark ? 'hover:bg-[#181818]' : 'hover:bg-gray-100'} transition-colors`}
                            >
                                {isDark ? (
                                    <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                                    </svg>
                                ) : (
                                    <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                                    </svg>
                                )}
                            </button>
                        </div>
                    </div>
                </div>

                {/* Page Content */}
                <div className="p-4 sm:p-6 lg:p-8">
                    <div className="max-w-2xl mx-auto">
                        <div className="mb-6">
                            <h1 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>Create New Resident</h1>
                            <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'} mt-1`}>Register a new resident in the system</p>
                        </div>

                        {!success ? (
                            <div className={`${isDark ? 'bg-[#0f0f0f] border-[#1f1f1f]' : 'bg-white border-gray-200'} rounded-xl border p-6`}>
                                <form onSubmit={handleSubmit} className="space-y-6">
                                    <div className="grid md:grid-cols-2 gap-6">
                                        <div>
                                            <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>Full Name *</label>
                                            <input
                                                type="text"
                                                required
                                                value={formData.name}
                                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                                className={`w-full ${isDark ? 'bg-[#141414] text-white border-[#1f1f1f]' : 'bg-gray-50 text-gray-900 border-gray-200'} border rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-600`}
                                                placeholder="John Doe"
                                            />
                                        </div>

                                        <div>
                                            <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>Email Address *</label>
                                            <input
                                                type="email"
                                                required
                                                value={formData.email}
                                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                                className={`w-full ${isDark ? 'bg-[#141414] text-white border-[#1f1f1f]' : 'bg-gray-50 text-gray-900 border-gray-200'} border rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-600`}
                                                placeholder="john@example.com"
                                            />
                                        </div>
                                    </div>

                                    <div className="grid md:grid-cols-2 gap-6">
                                        <div>
                                            <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>Mobile Number *</label>
                                            <input
                                                type="tel"
                                                required
                                                value={formData.mobile}
                                                onChange={(e) => setFormData({ ...formData, mobile: e.target.value })}
                                                className={`w-full ${isDark ? 'bg-[#141414] text-white border-[#1f1f1f]' : 'bg-gray-50 text-gray-900 border-gray-200'} border rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-600`}
                                                placeholder="+91 98765 43210"
                                            />
                                        </div>

                                        <div>
                                            <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>Flat Number *</label>
                                            <input
                                                type="text"
                                                required
                                                value={formData.flatNumber}
                                                onChange={(e) => setFormData({ ...formData, flatNumber: e.target.value })}
                                                className={`w-full ${isDark ? 'bg-[#141414] text-white border-[#1f1f1f]' : 'bg-gray-50 text-gray-900 border-gray-200'} border rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-600`}
                                                placeholder="101"
                                            />
                                        </div>
                                    </div>

                                    <div className="grid md:grid-cols-2 gap-6">
                                        <div>
                                            <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>Block *</label>
                                            <input
                                                type="text"
                                                required
                                                value={formData.block}
                                                onChange={(e) => setFormData({ ...formData, block: e.target.value })}
                                                className={`w-full ${isDark ? 'bg-[#141414] text-white border-[#1f1f1f]' : 'bg-gray-50 text-gray-900 border-gray-200'} border rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-600`}
                                                placeholder="A"
                                            />
                                        </div>

                                        <div>
                                            <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>Floor *</label>
                                            <input
                                                type="text"
                                                required
                                                value={formData.floor}
                                                onChange={(e) => setFormData({ ...formData, floor: e.target.value })}
                                                className={`w-full ${isDark ? 'bg-[#141414] text-white border-[#1f1f1f]' : 'bg-gray-50 text-gray-900 border-gray-200'} border rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-600`}
                                                placeholder="1"
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>Number of Family Members</label>
                                        <input
                                            type="number"
                                            value={formData.members}
                                            onChange={(e) => setFormData({ ...formData, members: e.target.value })}
                                            className={`w-full ${isDark ? 'bg-[#141414] text-white border-[#1f1f1f]' : 'bg-gray-50 text-gray-900 border-gray-200'} border rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-600`}
                                            placeholder="3"
                                            min="1"
                                        />
                                    </div>

                                    <div>
                                        <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>Default Password</label>
                                        <input
                                            type="text"
                                            readOnly
                                            value={formData.password}
                                            className={`w-full ${isDark ? 'bg-[#141414] text-white border-[#1f1f1f]' : 'bg-gray-50 text-gray-900 border-gray-200'} border rounded-lg px-4 py-3 focus:outline-none`}
                                        />
                                        <p className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-500'} mt-1`}>All new residents will use this default password: <span className="font-semibold">Temp@1234</span></p>
                                    </div>

                                    <div className={`p-4 rounded-lg ${isDark ? 'bg-blue-500/10 border-blue-500/20' : 'bg-blue-50 border-blue-200'} border`}>
                                        <p className={`text-sm ${isDark ? 'text-blue-300' : 'text-blue-800'}`}>
                                            ℹ️ The resident can login using their email and the default password <strong>Temp@1234</strong>. They should change it after first login.
                                        </p>
                                    </div>

                                    <button
                                        type="submit"
                                        disabled={loading}
                                        className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                                    >
                                        {loading ? (
                                            <>
                                                <Loader className="w-5 h-5 animate-spin" />
                                                Creating...
                                            </>
                                        ) : (
                                            <>
                                                <UserPlus className="w-5 h-5" />
                                                Create Resident
                                            </>
                                        )}
                                    </button>
                                </form>
                            </div>
                        ) : (
                            <div className={`${isDark ? 'bg-[#0f0f0f] border-[#1f1f1f]' : 'bg-white border-gray-200'} rounded-xl border p-8 text-center`}>
                                <CheckCircle className="w-16 h-16 text-green-600 mx-auto mb-4" />
                                <h2 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'} mb-2`}>Resident Created Successfully!</h2>
                                <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'} mb-6`}>The resident can now login with their email and the default password</p>

                                <div className={`${isDark ? 'bg-[#141414] border-[#1f1f1f]' : 'bg-gray-50 border-gray-200'} border rounded-lg p-6 mb-6`}>
                                    <h3 className={`text-sm font-semibold ${isDark ? 'text-gray-300' : 'text-gray-700'} mb-4`}>Login Credentials:</h3>
                                    <div className="space-y-3">
                                        <div className="flex items-center justify-between">
                                            <span className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Email:</span>
                                            <div className="flex items-center gap-2">
                                                <span className={`text-sm font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>{credentials.email}</span>
                                                <button onClick={() => copyToClipboard(credentials.email)} className="text-blue-600 hover:text-blue-700">
                                                    <Copy className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <span className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Password:</span>
                                            <div className="flex items-center gap-2">
                                                <span className={`text-sm font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>{credentials.password}</span>
                                                <button onClick={() => copyToClipboard(credentials.password)} className="text-blue-600 hover:text-blue-700">
                                                    <Copy className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <span className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Flat:</span>
                                            <span className={`text-sm font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>{credentials.flatNumber}</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex gap-3">
                                    <button
                                        onClick={resetForm}
                                        className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                                    >
                                        Create Another Resident
                                    </button>
                                    <button
                                        onClick={() => navigate('/flats')}
                                        className={`flex-1 px-6 py-3 rounded-lg ${isDark ? 'bg-[#181818] text-white hover:bg-[#1f1f1f]' : 'bg-gray-200 text-gray-900 hover:bg-gray-300'} transition-colors`}
                                    >
                                        View All Flats
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Sidebar Overlay */}
            {sidebarOpen && (
                <div
                    className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
                    onClick={() => setSidebarOpen(false)}
                />
            )}
        </div>
    );
};

export default CreateResident;

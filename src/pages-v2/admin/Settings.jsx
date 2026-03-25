import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Home, Users, AlertCircle, Building2, Menu, X, LogOut, Settings as SettingsIcon,
    ChevronRight, Loader, IndianRupee, Bell as BellIcon, Package, FileText,
    UserPlus, Save, Key, User, Building, Bell, Info
} from 'lucide-react';

const Settings = () => {
    const navigate = useNavigate();
    const [theme, setTheme] = useState('light');
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [activeTab, setActiveTab] = useState('society');

    const [societyInfo, setSocietyInfo] = useState({
        name: 'Green Valley Apartments',
        address: '123 Main Street, City',
        email: 'admin@greenvalley.com',
        phone: '+91 98765 43210'
    });

    const [adminProfile, setAdminProfile] = useState({
        name: 'Admin User',
        email: 'admin@nammaveedu.com',
        mobile: '+91 98765 43210'
    });

    const [passwordData, setPasswordData] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
    });

    const [maintenanceSettings, setMaintenanceSettings] = useState({
        defaultAmount: '2000',
        dueDate: '5',
        lateFeePenalty: '50'
    });

    const [notificationSettings, setNotificationSettings] = useState({
        emailNotifications: true,
        smsNotifications: false,
        maintenanceReminders: true,
        complaintUpdates: true,
        visitorAlerts: true
    });

    useEffect(() => {
        const savedTheme = localStorage.getItem('theme') || 'light';
        setTheme(savedTheme);
    }, []);

    const handleLogout = () => {
        localStorage.clear();
        navigate('/login');
    };

    const saveSocietyInfo = async () => {
        setLoading(true);
        // API call to save society info
        setTimeout(() => {
            setLoading(false);
            alert('Society information updated successfully!');
        }, 1000);
    };

    const saveAdminProfile = async () => {
        setLoading(true);
        // API call to save admin profile
        setTimeout(() => {
            setLoading(false);
            alert('Profile updated successfully!');
        }, 1000);
    };

    const changePassword = async (e) => {
        e.preventDefault();
        if (passwordData.newPassword !== passwordData.confirmPassword) {
            alert('Passwords do not match!');
            return;
        }

        setLoading(true);
        // API call to change password
        setTimeout(() => {
            setLoading(false);
            setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
            alert('Password changed successfully!');
        }, 1000);
    };

    const saveMaintenanceSettings = async () => {
        setLoading(true);
        // API call to save maintenance settings
        setTimeout(() => {
            setLoading(false);
            alert('Maintenance settings updated successfully!');
        }, 1000);
    };

    const saveNotificationSettings = async () => {
        setLoading(true);
        // API call to save notification settings
        setTimeout(() => {
            setLoading(false);
            alert('Notification preferences updated successfully!');
        }, 1000);
    };

    const isDark = theme === 'dark';

    const sidebarItems = [
        { icon: Home, label: 'Dashboard', path: '/admin/dashboard' },
        { icon: Building2, label: 'Flats', path: '/flats' },
        { icon: IndianRupee, label: 'Administration', path: '/administration' },
        { icon: AlertCircle, label: 'Complaints', path: '/complaints' },
        { icon: BellIcon, label: 'Notices', path: '/notices' },
        { icon: Package, label: 'Visitors', path: '/visitors' },
        { icon: UserPlus, label: 'Create Resident', path: '/admin/residents/create' },
        { icon: FileText, label: 'Reports', path: '/reports' },
        { icon: SettingsIcon, label: 'Settings', path: '/settings', active: true }
    ];

    const tabs = [
        { id: 'society', label: 'Society Info', icon: Building },
        { id: 'profile', label: 'Admin Profile', icon: User },
        { id: 'password', label: 'Change Password', icon: Key },
        { id: 'maintenance', label: 'Maintenance', icon: IndianRupee },
        { icon: Bell, label: 'Notifications', id: 'notifications' }
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
                                <span className={`text-sm font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>Settings</span>
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
                    <div className="mb-6">
                        <h1 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>System Settings</h1>
                        <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'} mt-1`}>Manage system configuration and preferences</p>
                    </div>

                    <div className="grid lg:grid-cols-4 gap-6">
                        {/* Tabs */}
                        <div className={`${isDark ? 'bg-[#0f0f0f] border-[#1f1f1f]' : 'bg-white border-gray-200'} rounded-xl border p-4 h-fit`}>
                            <nav className="space-y-1">
                                {tabs.map((tab) => {
                                    const Icon = tab.icon;
                                    return (
                                        <button
                                            key={tab.id}
                                            onClick={() => setActiveTab(tab.id)}
                                            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${activeTab === tab.id
                                                    ? isDark ? 'bg-[#1f1f1f] text-white' : 'bg-blue-50 text-blue-600'
                                                    : isDark ? 'text-gray-400 hover:bg-[#181818] hover:text-white' : 'text-gray-600 hover:bg-gray-50'
                                                }`}
                                        >
                                            <Icon className="w-5 h-5" />
                                            <span className="font-medium">{tab.label}</span>
                                        </button>
                                    );
                                })}
                            </nav>
                        </div>

                        {/* Content */}
                        <div className="lg:col-span-3">
                            {/* Society Info Tab */}
                            {activeTab === 'society' && (
                                <div className={`${isDark ? 'bg-[#0f0f0f] border-[#1f1f1f]' : 'bg-white border-gray-200'} rounded-xl border p-6`}>
                                    <h2 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'} mb-6`}>Society Information</h2>
                                    <div className="space-y-4">
                                        <div>
                                            <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>Society Name</label>
                                            <input
                                                type="text"
                                                value={societyInfo.name}
                                                onChange={(e) => setSocietyInfo({ ...societyInfo, name: e.target.value })}
                                                className={`w-full ${isDark ? 'bg-[#141414] text-white border-[#1f1f1f]' : 'bg-gray-50 text-gray-900 border-gray-200'} border rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-600`}
                                            />
                                        </div>
                                        <div>
                                            <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>Address</label>
                                            <textarea
                                                rows={3}
                                                value={societyInfo.address}
                                                onChange={(e) => setSocietyInfo({ ...societyInfo, address: e.target.value })}
                                                className={`w-full ${isDark ? 'bg-[#141414] text-white border-[#1f1f1f]' : 'bg-gray-50 text-gray-900 border-gray-200'} border rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-600`}
                                            />
                                        </div>
                                        <div className="grid md:grid-cols-2 gap-4">
                                            <div>
                                                <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>Email</label>
                                                <input
                                                    type="email"
                                                    value={societyInfo.email}
                                                    onChange={(e) => setSocietyInfo({ ...societyInfo, email: e.target.value })}
                                                    className={`w-full ${isDark ? 'bg-[#141414] text-white border-[#1f1f1f]' : 'bg-gray-50 text-gray-900 border-gray-200'} border rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-600`}
                                                />
                                            </div>
                                            <div>
                                                <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>Phone</label>
                                                <input
                                                    type="tel"
                                                    value={societyInfo.phone}
                                                    onChange={(e) => setSocietyInfo({ ...societyInfo, phone: e.target.value })}
                                                    className={`w-full ${isDark ? 'bg-[#141414] text-white border-[#1f1f1f]' : 'bg-gray-50 text-gray-900 border-gray-200'} border rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-600`}
                                                />
                                            </div>
                                        </div>
                                        <button
                                            onClick={saveSocietyInfo}
                                            disabled={loading}
                                            className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                                        >
                                            {loading ? <Loader className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                                            Save Changes
                                        </button>
                                    </div>
                                </div>
                            )}

                            {/* Admin Profile Tab */}
                            {activeTab === 'profile' && (
                                <div className={`${isDark ? 'bg-[#0f0f0f] border-[#1f1f1f]' : 'bg-white border-gray-200'} rounded-xl border p-6`}>
                                    <h2 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'} mb-6`}>Admin Profile</h2>
                                    <div className="space-y-4">
                                        <div>
                                            <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>Name</label>
                                            <input
                                                type="text"
                                                value={adminProfile.name}
                                                onChange={(e) => setAdminProfile({ ...adminProfile, name: e.target.value })}
                                                className={`w-full ${isDark ? 'bg-[#141414] text-white border-[#1f1f1f]' : 'bg-gray-50 text-gray-900 border-gray-200'} border rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-600`}
                                            />
                                        </div>
                                        <div>
                                            <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>Email</label>
                                            <input
                                                type="email"
                                                value={adminProfile.email}
                                                onChange={(e) => setAdminProfile({ ...adminProfile, email: e.target.value })}
                                                className={`w-full ${isDark ? 'bg-[#141414] text-white border-[#1f1f1f]' : 'bg-gray-50 text-gray-900 border-gray-200'} border rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-600`}
                                            />
                                        </div>
                                        <div>
                                            <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>Mobile</label>
                                            <input
                                                type="tel"
                                                value={adminProfile.mobile}
                                                onChange={(e) => setAdminProfile({ ...adminProfile, mobile: e.target.value })}
                                                className={`w-full ${isDark ? 'bg-[#141414] text-white border-[#1f1f1f]' : 'bg-gray-50 text-gray-900 border-gray-200'} border rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-600`}
                                            />
                                        </div>
                                        <button
                                            onClick={saveAdminProfile}
                                            disabled={loading}
                                            className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                                        >
                                            {loading ? <Loader className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                                            Save Changes
                                        </button>
                                    </div>
                                </div>
                            )}

                            {/* Password Tab */}
                            {activeTab === 'password' && (
                                <div className={`${isDark ? 'bg-[#0f0f0f] border-[#1f1f1f]' : 'bg-white border-gray-200'} rounded-xl border p-6`}>
                                    <h2 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'} mb-6`}>Change Password</h2>
                                    <form onSubmit={changePassword} className="space-y-4">
                                        <div>
                                            <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>Current Password</label>
                                            <input
                                                type="password"
                                                required
                                                value={passwordData.currentPassword}
                                                onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                                                className={`w-full ${isDark ? 'bg-[#141414] text-white border-[#1f1f1f]' : 'bg-gray-50 text-gray-900 border-gray-200'} border rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-600`}
                                            />
                                        </div>
                                        <div>
                                            <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>New Password</label>
                                            <input
                                                type="password"
                                                required
                                                value={passwordData.newPassword}
                                                onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                                                className={`w-full ${isDark ? 'bg-[#141414] text-white border-[#1f1f1f]' : 'bg-gray-50 text-gray-900 border-gray-200'} border rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-600`}
                                            />
                                        </div>
                                        <div>
                                            <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>Confirm New Password</label>
                                            <input
                                                type="password"
                                                required
                                                value={passwordData.confirmPassword}
                                                onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                                                className={`w-full ${isDark ? 'bg-[#141414] text-white border-[#1f1f1f]' : 'bg-gray-50 text-gray-900 border-gray-200'} border rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-600`}
                                            />
                                        </div>
                                        <button
                                            type="submit"
                                            disabled={loading}
                                            className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                                        >
                                            {loading ? <Loader className="w-5 h-5 animate-spin" /> : <Key className="w-5 h-5" />}
                                            Change Password
                                        </button>
                                    </form>
                                </div>
                            )}

                            {/* Maintenance Tab */}
                            {activeTab === 'maintenance' && (
                                <div className={`${isDark ? 'bg-[#0f0f0f] border-[#1f1f1f]' : 'bg-white border-gray-200'} rounded-xl border p-6`}>
                                    <h2 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'} mb-6`}>Maintenance Settings</h2>
                                    <div className="space-y-4">
                                        <div>
                                            <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>Default Maintenance Amount (₹)</label>
                                            <input
                                                type="number"
                                                value={maintenanceSettings.defaultAmount}
                                                onChange={(e) => setMaintenanceSettings({ ...maintenanceSettings, defaultAmount: e.target.value })}
                                                className={`w-full ${isDark ? 'bg-[#141414] text-white border-[#1f1f1f]' : 'bg-gray-50 text-gray-900 border-gray-200'} border rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-600`}
                                            />
                                        </div>
                                        <div>
                                            <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>Due Date (Day of Month)</label>
                                            <input
                                                type="number"
                                                min="1"
                                                max="31"
                                                value={maintenanceSettings.dueDate}
                                                onChange={(e) => setMaintenanceSettings({ ...maintenanceSettings, dueDate: e.target.value })}
                                                className={`w-full ${isDark ? 'bg-[#141414] text-white border-[#1f1f1f]' : 'bg-gray-50 text-gray-900 border-gray-200'} border rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-600`}
                                            />
                                        </div>
                                        <div>
                                            <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>Late Fee Penalty (₹)</label>
                                            <input
                                                type="number"
                                                value={maintenanceSettings.lateFeePenalty}
                                                onChange={(e) => setMaintenanceSettings({ ...maintenanceSettings, lateFeePenalty: e.target.value })}
                                                className={`w-full ${isDark ? 'bg-[#141414] text-white border-[#1f1f1f]' : 'bg-gray-50 text-gray-900 border-gray-200'} border rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-600`}
                                            />
                                        </div>
                                        <button
                                            onClick={saveMaintenanceSettings}
                                            disabled={loading}
                                            className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                                        >
                                            {loading ? <Loader className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                                            Save Changes
                                        </button>
                                    </div>
                                </div>
                            )}

                            {/* Notifications Tab */}
                            {activeTab === 'notifications' && (
                                <div className={`${isDark ? 'bg-[#0f0f0f] border-[#1f1f1f]' : 'bg-white border-gray-200'} rounded-xl border p-6`}>
                                    <h2 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'} mb-6`}>Notification Preferences</h2>
                                    <div className="space-y-4">
                                        {[
                                            { key: 'emailNotifications', label: 'Email Notifications' },
                                            { key: 'smsNotifications', label: 'SMS Notifications' },
                                            { key: 'maintenanceReminders', label: 'Maintenance Reminders' },
                                            { key: 'complaintUpdates', label: 'Complaint Updates' },
                                            { key: 'visitorAlerts', label: 'Visitor Alerts' }
                                        ].map((setting) => (
                                            <div key={setting.key} className="flex items-center justify-between py-3">
                                                <span className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{setting.label}</span>
                                                <label className="relative inline-flex items-center cursor-pointer">
                                                    <input
                                                        type="checkbox"
                                                        checked={notificationSettings[setting.key]}
                                                        onChange={(e) => setNotificationSettings({ ...notificationSettings, [setting.key]: e.target.checked })}
                                                        className="sr-only peer"
                                                    />
                                                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                                                </label>
                                            </div>
                                        ))}
                                        <button
                                            onClick={saveNotificationSettings}
                                            disabled={loading}
                                            className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                                        >
                                            {loading ? <Loader className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                                            Save Preferences
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
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

export default Settings;

import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Home, MessageSquare, AlertCircle, Package, Bell, Settings as SettingsIcon,
    Menu, X, LogOut, ChevronRight, Loader, User, Mail, Phone, Lock, CheckCircle2
} from 'lucide-react';

const Settings = () => {
    const navigate = useNavigate();
    const [theme, setTheme] = useState('light');
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [loadingProfile, setLoadingProfile] = useState(false);
    const [loadingPw, setLoadingPw] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const [profileForm, setProfileForm] = useState({
        name: localStorage.getItem('userName') || '',
        email: localStorage.getItem('userEmail') || '',
        phone: ''
    });

    const [pwForm, setPwForm] = useState({
        oldPassword: '',
        newPassword: '',
        confirmPassword: ''
    });

    useEffect(() => {
        const savedTheme = localStorage.getItem('theme') || 'light';
        setTheme(savedTheme);
    }, []);

    const isDark = theme === 'dark';

    const sidebarItems = [
        { icon: Home, label: 'Dashboard', path: '/resident/dashboard' },
        { icon: MessageSquare, label: 'My Complaints', path: '/resident/complaints' },
        { icon: AlertCircle, label: 'Raise Complaint', path: '/resident/complaints/new' },
        { icon: Package, label: 'Visitors', path: '/resident/visitors' },
        { icon: Bell, label: 'Notices', path: '/resident/notices' },
        { icon: SettingsIcon, label: 'Settings', path: '/resident/settings', active: true }
    ];

    const updateProfile = async (e) => {
        e.preventDefault();
        setError(''); setSuccess('');
        const token = localStorage.getItem('token');
        if (!token) { navigate('/login'); return; }
        try {
            setLoadingProfile(true);
            const res = await fetch('http://localhost:4000/api/resident/profile', {
                method: 'PUT',
                headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name: profileForm.name || undefined,
                    email: profileForm.email || undefined,
                    phone: profileForm.phone || undefined
                })
            });
            const data = await res.json();
            if (!data.success) throw new Error(data.error || 'Unable to update profile');
            if (data.data?.user?.name) localStorage.setItem('userName', data.data.user.name);
            if (data.data?.user?.email) localStorage.setItem('userEmail', data.data.user.email);
            setSuccess('Profile updated successfully');
        } catch (err) {
            setError(err.message || 'Unable to update profile');
        } finally {
            setLoadingProfile(false);
        }
    };

    const changePassword = async (e) => {
        e.preventDefault();
        setError(''); setSuccess('');
        if (!pwForm.oldPassword || !pwForm.newPassword) {
            setError('Please fill all password fields'); return;
        }
        if (pwForm.newPassword !== pwForm.confirmPassword) {
            setError('New password and confirm password do not match'); return;
        }
        const token = localStorage.getItem('token');
        if (!token) { navigate('/login'); return; }
        try {
            setLoadingPw(true);
            const res = await fetch('http://localhost:4000/api/resident/password', {
                method: 'PUT',
                headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    oldPassword: pwForm.oldPassword,
                    newPassword: pwForm.newPassword
                })
            });
            const data = await res.json();
            if (!data.success) throw new Error(data.error || 'Unable to change password');
            setPwForm({ oldPassword: '', newPassword: '', confirmPassword: '' });
            setSuccess('Password updated successfully');
        } catch (err) {
            setError(err.message || 'Unable to change password');
        } finally {
            setLoadingPw(false);
        }
    };

    const handleLogout = () => { localStorage.clear(); navigate('/login'); };

    return (
        <div className={`min-h-screen ${isDark ? 'bg-black' : 'bg-gray-50'} transition-colors duration-300`}>
            {/* Sidebar */}
            <div className={`fixed inset-y-0 left-0 z-50 w-64 ${isDark ? 'bg-[#1a1a1a] border-gray-800' : 'bg-white border-gray-200'} border-r transform transition-transform duration-300 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0`}>
                <div className={`flex items-center justify-between p-4 border-b ${isDark ? 'border-gray-800' : 'border-gray-200'}`}>
                    <div className="flex items-center gap-2">
                        <div className={`w-8 h-8 ${isDark ? 'bg-gray-800' : 'bg-gray-900'} rounded-lg flex items-center justify-center`}>
                            <span className="text-white font-bold text-sm">N</span>
                        </div>
                        <span className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>NammaVeedu</span>
                    </div>
                    <button onClick={() => setSidebarOpen(false)} className="lg:hidden">
                        <X className={`w-5 h-5 ${isDark ? 'text-gray-400' : 'text-gray-600'}`} />
                    </button>
                </div>
                <nav className="p-4 space-y-1">
                    {sidebarItems.map((item) => {
                        const Icon = item.icon;
                        return (
                            <button key={item.path} onClick={() => { navigate(item.path); setSidebarOpen(false); }}
                                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${item.active
                                    ? isDark ? 'bg-gray-700 text-white' : 'bg-blue-600 text-white'
                                    : isDark ? 'text-gray-400 hover:bg-gray-800 hover:text-white' : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                                    }`}>
                                <Icon className="w-5 h-5" />
                                <span className="font-medium">{item.label}</span>
                            </button>
                        );
                    })}
                </nav>
                <div className={`absolute bottom-0 left-0 right-0 p-4 border-t ${isDark ? 'border-gray-800' : 'border-gray-200'}`}>
                    <button onClick={handleLogout} className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${isDark ? 'text-red-400 hover:bg-red-500/10' : 'text-red-600 hover:bg-red-50'}`}>
                        <LogOut className="w-5 h-5" /><span className="font-medium">Logout</span>
                    </button>
                </div>
            </div>

            {/* Main */}
            <div className="lg:ml-64">
                <div className={`${isDark ? 'bg-[#1a1a1a] border-gray-800' : 'bg-white border-gray-200'} border-b sticky top-0 z-40`}>
                    <div className="px-4 sm:px-6 lg:px-8">
                        <div className="flex items-center justify-between h-16">
                            <button onClick={() => setSidebarOpen(true)} className="lg:hidden">
                                <Menu className={`w-6 h-6 ${isDark ? 'text-white' : 'text-gray-900'}`} />
                            </button>
                            <div className="flex items-center gap-2">
                                <span className={`text-sm ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>Resident</span>
                                <ChevronRight className="w-4 h-4 text-gray-400" />
                                <span className={`text-sm font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>Settings</span>
                            </div>
                            <div />
                        </div>
                    </div>
                </div>

                <div className="p-4 sm:p-6 lg:p-8 max-w-3xl mx-auto">
                    <h1 className={`text-2xl font-bold mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>Settings</h1>
                    <p className={`text-sm mb-8 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Update your profile and password</p>

                    {/* Status Messages */}
                    {error && (
                        <div className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-lg">
                            <p className="text-red-500 text-sm">{error}</p>
                        </div>
                    )}
                    {success && (
                        <div className="mb-6 p-4 bg-green-500/10 border border-green-500/30 rounded-lg flex items-center gap-2">
                            <CheckCircle2 className="w-4 h-4 text-green-500" />
                            <p className="text-green-500 text-sm">{success}</p>
                        </div>
                    )}

                    {/* Profile Form */}
                    <div className={`${isDark ? 'bg-[#252525] border-gray-800' : 'bg-white border-gray-200'} rounded-xl border p-6 mb-6`}>
                        <h2 className={`text-lg font-semibold mb-6 ${isDark ? 'text-white' : 'text-gray-900'}`}>Profile</h2>
                        <form onSubmit={updateProfile} className="space-y-5">
                            <div className="grid sm:grid-cols-2 gap-5">
                                <div>
                                    <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                                        <User className="w-4 h-4 inline mr-2" />Name
                                    </label>
                                    <input type="text" value={profileForm.name} onChange={(e) => setProfileForm(f => ({ ...f, name: e.target.value }))}
                                        className={`w-full px-4 py-3 rounded-lg border ${isDark ? 'bg-gray-800 border-gray-700 text-white' : 'bg-gray-50 border-gray-200 text-gray-900'} outline-none focus:ring-2 focus:ring-blue-500`} />
                                </div>
                                <div>
                                    <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                                        <Mail className="w-4 h-4 inline mr-2" />Email
                                    </label>
                                    <input type="email" value={profileForm.email} onChange={(e) => setProfileForm(f => ({ ...f, email: e.target.value }))}
                                        className={`w-full px-4 py-3 rounded-lg border ${isDark ? 'bg-gray-800 border-gray-700 text-white' : 'bg-gray-50 border-gray-200 text-gray-900'} outline-none focus:ring-2 focus:ring-blue-500`} />
                                </div>
                                <div>
                                    <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                                        <Phone className="w-4 h-4 inline mr-2" />Mobile
                                    </label>
                                    <input type="tel" value={profileForm.phone} onChange={(e) => setProfileForm(f => ({ ...f, phone: e.target.value }))}
                                        className={`w-full px-4 py-3 rounded-lg border ${isDark ? 'bg-gray-800 border-gray-700 text-white' : 'bg-gray-50 border-gray-200 text-gray-900'} outline-none focus:ring-2 focus:ring-blue-500`} />
                                </div>
                            </div>
                            <button type="submit" disabled={loadingProfile}
                                className="px-6 py-3 bg-blue-600 text-white rounded-lg font-medium text-sm hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center gap-2">
                                {loadingProfile ? <Loader className="w-4 h-4 animate-spin" /> : null}
                                {loadingProfile ? 'Saving...' : 'Save Profile'}
                            </button>
                        </form>
                    </div>

                    {/* Change Password */}
                    <div className={`${isDark ? 'bg-[#252525] border-gray-800' : 'bg-white border-gray-200'} rounded-xl border p-6`}>
                        <h2 className={`text-lg font-semibold mb-6 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                            <Lock className="w-5 h-5 inline mr-2" />Change Password
                        </h2>
                        <form onSubmit={changePassword} className="space-y-5">
                            <div className="grid sm:grid-cols-2 gap-5">
                                <div>
                                    <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>Old Password</label>
                                    <input type="password" value={pwForm.oldPassword} onChange={(e) => setPwForm(f => ({ ...f, oldPassword: e.target.value }))}
                                        className={`w-full px-4 py-3 rounded-lg border ${isDark ? 'bg-gray-800 border-gray-700 text-white' : 'bg-gray-50 border-gray-200 text-gray-900'} outline-none focus:ring-2 focus:ring-blue-500`} />
                                </div>
                                <div>
                                    <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>New Password</label>
                                    <input type="password" value={pwForm.newPassword} onChange={(e) => setPwForm(f => ({ ...f, newPassword: e.target.value }))}
                                        className={`w-full px-4 py-3 rounded-lg border ${isDark ? 'bg-gray-800 border-gray-700 text-white' : 'bg-gray-50 border-gray-200 text-gray-900'} outline-none focus:ring-2 focus:ring-blue-500`} />
                                </div>
                                <div>
                                    <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>Confirm New Password</label>
                                    <input type="password" value={pwForm.confirmPassword} onChange={(e) => setPwForm(f => ({ ...f, confirmPassword: e.target.value }))}
                                        className={`w-full px-4 py-3 rounded-lg border ${isDark ? 'bg-gray-800 border-gray-700 text-white' : 'bg-gray-50 border-gray-200 text-gray-900'} outline-none focus:ring-2 focus:ring-blue-500`} />
                                </div>
                            </div>
                            <button type="submit" disabled={loadingPw}
                                className="px-6 py-3 bg-blue-600 text-white rounded-lg font-medium text-sm hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center gap-2">
                                {loadingPw ? <Loader className="w-4 h-4 animate-spin" /> : null}
                                {loadingPw ? 'Updating...' : 'Update Password'}
                            </button>
                        </form>
                    </div>
                </div>
            </div>

            {sidebarOpen && <div className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden" onClick={() => setSidebarOpen(false)} />}
        </div>
    );
};

export default Settings;

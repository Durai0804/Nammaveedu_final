import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Home, User, Phone, Mail, CreditCard, Building2, Package, Bell,
    AlertCircle, CheckCircle2, Clock, ArrowRight, Users, Calendar,
    Menu, X, LogOut, MessageSquare, FileText, Settings, Eye,
    ChevronRight, Loader
} from 'lucide-react';

const ResidentDashboard = () => {
    const navigate = useNavigate();
    const [theme, setTheme] = useState('light');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [notificationsOpen, setNotificationsOpen] = useState(false);

    // State for dashboard data
    const [residentData, setResidentData] = useState(null);
    const [complaints, setComplaints] = useState([]);
    const [visitors, setVisitors] = useState([]);
    const [maintenance, setMaintenance] = useState(null);
    const [notices, setNotices] = useState([]);
    const [notifications, setNotifications] = useState([]);

    useEffect(() => {
        const savedTheme = localStorage.getItem('theme') || 'light';
        setTheme(savedTheme);
    }, []);

    // Fetch dashboard data from API
    useEffect(() => {
        const fetchDashboardData = async () => {
            const token = localStorage.getItem('token');
            if (!token) {
                navigate('/login');
                return;
            }

            try {
                setLoading(true);
                const response = await fetch('http://localhost:4000/api/resident/dashboard', {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                });

                const result = await response.json();

                if (response.ok && result.success) {
                    const data = result.data;

                    if (data.user) {
                        setResidentData({
                            name: data.user.name,
                            email: data.user.email,
                            flatNumber: data.user.flatNumber,
                            floor: data.flat?.floor || '',
                            block: data.flat?.block || '',
                            phone: data.resident?.phone || '',
                            members: data.resident?.members || 0
                        });
                    }

                    if (data.complaints) setComplaints(data.complaints);
                    if (data.visitorsToday) setVisitors(data.visitorsToday);
                    if (data.maintenance && data.maintenance.length > 0) {
                        setMaintenance(data.maintenance[0]);
                    }
                }

                // Fetch notices
                const noticesRes = await fetch('http://localhost:4000/api/notices', {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                const noticesData = await noticesRes.json();
                if (noticesData.success) {
                    setNotices(noticesData.data.filter(n => n.status === 'UPCOMING' || n.status === 'ONGOING').slice(0, 3));
                }

                // Fetch notifications
                const notifsRes = await fetch('http://localhost:4000/api/resident/notifications?take=10', {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                const notifsData = await notifsRes.json();
                if (notifsData.success) {
                    setNotifications(notifsData.data || []);
                }

            } catch (err) {
                console.error('Dashboard fetch error:', err);
                setError('Unable to connect to server');
            } finally {
                setLoading(false);
            }
        };

        fetchDashboardData();
    }, [navigate]);

    const handleLogout = () => {
        localStorage.clear();
        navigate('/login');
    };

    const isDark = theme === 'dark';

    const sidebarItems = [
        { icon: Home, label: 'Dashboard', path: '/resident/dashboard', active: true },
        { icon: MessageSquare, label: 'My Complaints', path: '/resident/complaints' },
        { icon: AlertCircle, label: 'Raise Complaint', path: '/resident/complaints/new' },
        { icon: Package, label: 'Visitors', path: '/resident/visitors' },
        { icon: Bell, label: 'Notices', path: '/resident/notices' },
        { icon: Settings, label: 'Settings', path: '/resident/settings' }
    ];

    const getStatusColor = (status) => {
        const statusLower = status?.toLowerCase();
        if (statusLower === 'resolved') return { bg: 'bg-green-50', text: 'text-green-600', border: 'border-green-200', dot: 'bg-green-500' };
        if (statusLower === 'in_progress' || statusLower === 'in progress') return { bg: 'bg-blue-50', text: 'text-blue-600', border: 'border-blue-200', dot: 'bg-blue-500' };
        return { bg: 'bg-orange-50', text: 'text-orange-600', border: 'border-orange-200', dot: 'bg-orange-500' };
    };

    const unreadNotifications = notifications.filter(n => !n.read);

    if (loading) {
        return (
            <div className={`min-h-screen ${isDark ? 'bg-black' : 'bg-gray-50'} flex items-center justify-center`}>
                <div className="text-center">
                    <Loader className="w-16 h-16 text-blue-600 animate-spin mx-auto mb-4" />
                    <p className={isDark ? 'text-white' : 'text-gray-900'}>Loading dashboard...</p>
                </div>
            </div>
        );
    }

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
                            <button
                                key={item.path}
                                onClick={() => {
                                    navigate(item.path);
                                    setSidebarOpen(false);
                                }}
                                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${item.active
                                        ? isDark ? 'bg-gray-700 text-white' : 'bg-blue-600 text-white'
                                        : isDark ? 'text-gray-400 hover:bg-gray-800 hover:text-white' : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                                    }`}
                            >
                                <Icon className="w-5 h-5" />
                                <span className="font-medium">{item.label}</span>
                            </button>
                        );
                    })}
                </nav>

                <div className={`absolute bottom-0 left-0 right-0 p-4 border-t ${isDark ? 'border-gray-800' : 'border-gray-200'}`}>
                    <button
                        onClick={handleLogout}
                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${isDark ? 'text-red-400 hover:bg-red-500/10' : 'text-red-600 hover:bg-red-50'
                            }`}
                    >
                        <LogOut className="w-5 h-5" />
                        <span className="font-medium">Logout</span>
                    </button>
                </div>
            </div>

            {/* Main Content */}
            <div className="lg:ml-64">
                {/* Header */}
                <div className={`${isDark ? 'bg-[#1a1a1a] border-gray-800' : 'bg-white border-gray-200'} border-b sticky top-0 z-40`}>
                    <div className="px-4 sm:px-6 lg:px-8">
                        <div className="flex items-center justify-between h-16">
                            <button onClick={() => setSidebarOpen(true)} className="lg:hidden">
                                <Menu className={`w-6 h-6 ${isDark ? 'text-white' : 'text-gray-900'}`} />
                            </button>

                            <div className="flex items-center gap-2">
                                <span className={`text-sm ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>Resident</span>
                                <ChevronRight className="w-4 h-4 text-gray-400" />
                                <span className={`text-sm font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>Dashboard</span>
                            </div>

                            <div className="flex items-center gap-3">
                                {/* Notifications */}
                                <div className="relative">
                                    <button
                                        onClick={() => setNotificationsOpen(!notificationsOpen)}
                                        className={`p-2 rounded-lg ${isDark ? 'hover:bg-gray-800' : 'hover:bg-gray-100'} transition-colors relative`}
                                    >
                                        <Bell className={`w-5 h-5 ${isDark ? 'text-gray-400' : 'text-gray-600'}`} />
                                        {unreadNotifications.length > 0 && (
                                            <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
                                        )}
                                    </button>

                                    {notificationsOpen && (
                                        <div className={`absolute right-0 mt-2 w-80 ${isDark ? 'bg-[#252525] border-gray-800' : 'bg-white border-gray-200'} border rounded-xl shadow-xl max-h-96 overflow-y-auto`}>
                                            <div className="p-4 border-b border-gray-200">
                                                <div className="flex items-center justify-between">
                                                    <h3 className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>Notifications</h3>
                                                    {unreadNotifications.length > 0 && (
                                                        <span className="px-2 py-1 bg-blue-100 text-blue-600 text-xs rounded-full">
                                                            {unreadNotifications.length} new
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                            <div className="divide-y divide-gray-200">
                                                {notifications.length > 0 ? (
                                                    notifications.map((notif) => (
                                                        <div key={notif.id} className={`p-4 ${!notif.read ? (isDark ? 'bg-blue-500/5' : 'bg-blue-50') : ''}`}>
                                                            <p className={`font-medium text-sm ${isDark ? 'text-white' : 'text-gray-900'}`}>{notif.title}</p>
                                                            <p className={`text-sm mt-1 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{notif.message}</p>
                                                            <p className={`text-xs mt-2 ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>
                                                                {new Date(notif.createdAt).toLocaleString('en-IN')}
                                                            </p>
                                                        </div>
                                                    ))
                                                ) : (
                                                    <div className="p-8 text-center">
                                                        <Bell className={`w-12 h-12 mx-auto mb-2 ${isDark ? 'text-gray-600' : 'text-gray-300'}`} />
                                                        <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>No notifications</p>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    )}
                                </div>

                                <button
                                    onClick={() => {
                                        const newTheme = theme === 'dark' ? 'light' : 'dark';
                                        setTheme(newTheme);
                                        localStorage.setItem('theme', newTheme);
                                    }}
                                    className={`p-2 rounded-lg ${isDark ? 'hover:bg-gray-800' : 'hover:bg-gray-100'} transition-colors`}
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

                                <div className={`w-8 h-8 rounded-full ${isDark ? 'bg-gray-800' : 'bg-gray-200'} flex items-center justify-center`}>
                                    <span className={`text-sm font-medium ${isDark ? 'text-white' : 'text-gray-700'}`}>
                                        {residentData?.name?.charAt(0) || 'R'}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Dashboard Content */}
                <div className="p-4 sm:p-6 lg:p-8">
                    <div className="grid lg:grid-cols-3 gap-6">
                        {/* Left Column */}
                        <div className="lg:col-span-2 space-y-6">
                            {/* Resident Details */}
                            <div className={`${isDark ? 'bg-[#252525] border-gray-800' : 'bg-white border-gray-200'} rounded-2xl border p-6`}>
                                <h2 className={`text-lg font-semibold mb-6 ${isDark ? 'text-white' : 'text-gray-900'}`}>Resident Details</h2>
                                <div className="grid md:grid-cols-2 gap-6">
                                    <div className="space-y-4">
                                        <div className="flex items-start gap-3">
                                            <div className={`w-10 h-10 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-blue-50'} flex items-center justify-center`}>
                                                <User className="w-5 h-5 text-blue-600" />
                                            </div>
                                            <div>
                                                <p className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-500'} uppercase tracking-wide font-semibold mb-1`}>Full Name</p>
                                                <p className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>{residentData?.name || 'N/A'}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-start gap-3">
                                            <div className={`w-10 h-10 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-green-50'} flex items-center justify-center`}>
                                                <Mail className="w-5 h-5 text-green-600" />
                                            </div>
                                            <div>
                                                <p className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-500'} uppercase tracking-wide font-semibold mb-1`}>Email</p>
                                                <p className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>{residentData?.email || 'N/A'}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-start gap-3">
                                            <div className={`w-10 h-10 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-purple-50'} flex items-center justify-center`}>
                                                <Phone className="w-5 h-5 text-purple-600" />
                                            </div>
                                            <div>
                                                <p className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-500'} uppercase tracking-wide font-semibold mb-1`}>Phone</p>
                                                <p className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>{residentData?.phone || 'N/A'}</p>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="space-y-4">
                                        <div className="flex items-start gap-3">
                                            <div className={`w-10 h-10 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-orange-50'} flex items-center justify-center`}>
                                                <Home className="w-5 h-5 text-orange-600" />
                                            </div>
                                            <div>
                                                <p className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-500'} uppercase tracking-wide font-semibold mb-1`}>Flat Number</p>
                                                <p className={`font-medium text-lg ${isDark ? 'text-white' : 'text-gray-900'}`}>{residentData?.flatNumber || 'N/A'}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-start gap-3">
                                            <div className={`w-10 h-10 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-teal-50'} flex items-center justify-center`}>
                                                <Building2 className="w-5 h-5 text-teal-600" />
                                            </div>
                                            <div>
                                                <p className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-500'} uppercase tracking-wide font-semibold mb-1`}>Location</p>
                                                <p className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                                                    {residentData?.floor && residentData?.block ? `${residentData.floor}, Block ${residentData.block}` : 'N/A'}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="flex items-start gap-3">
                                            <div className={`w-10 h-10 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-pink-50'} flex items-center justify-center`}>
                                                <Users className="w-5 h-5 text-pink-600" />
                                            </div>
                                            <div>
                                                <p className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-500'} uppercase tracking-wide font-semibold mb-1`}>Family Members</p>
                                                <p className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>{residentData?.members || 0} Members</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Complaints */}
                            <div className={`${isDark ? 'bg-[#252525] border-gray-800' : 'bg-white border-gray-200'} rounded-2xl border p-6`}>
                                <div className="flex items-center justify-between mb-6">
                                    <h2 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>My Complaints</h2>
                                    <button
                                        onClick={() => navigate('/resident/complaints')}
                                        className="text-sm font-medium text-blue-600 hover:text-blue-700 flex items-center gap-1"
                                    >
                                        View All <ArrowRight className="w-4 h-4" />
                                    </button>
                                </div>
                                <div className="space-y-3">
                                    {complaints.length > 0 ? (
                                        complaints.slice(0, 3).map((complaint) => {
                                            const statusColors = getStatusColor(complaint.status);
                                            return (
                                                <div key={complaint.id} className={`p-4 rounded-xl ${isDark ? 'bg-gray-800/50' : 'bg-gray-50'} border ${isDark ? 'border-gray-700' : 'border-gray-100'}`}>
                                                    <div className="flex items-start justify-between mb-2">
                                                        <p className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>{complaint.description}</p>
                                                        <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${statusColors.bg} ${statusColors.text} whitespace-nowrap ml-2`}>
                                                            {complaint.status}
                                                        </span>
                                                    </div>
                                                    <div className="flex items-center gap-4 text-xs text-gray-500">
                                                        <span>{new Date(complaint.createdAt).toLocaleDateString('en-IN')}</span>
                                                        {complaint.assignedTo && <span>Assigned: {complaint.assignedTo}</span>}
                                                    </div>
                                                </div>
                                            );
                                        })
                                    ) : (
                                        <div className="text-center py-8">
                                            <CheckCircle2 className={`w-12 h-12 mx-auto mb-3 ${isDark ? 'text-gray-600' : 'text-gray-300'}`} />
                                            <p className={`${isDark ? 'text-gray-400' : 'text-gray-500'} mb-3`}>No complaints raised</p>
                                            <button
                                                onClick={() => navigate('/resident/complaints/new')}
                                                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm"
                                            >
                                                Raise a Complaint
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Notices */}
                            <div className={`${isDark ? 'bg-[#252525] border-gray-800' : 'bg-white border-gray-200'} rounded-2xl border p-6`}>
                                <div className="flex items-center justify-between mb-6">
                                    <h2 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>Upcoming Events & Notices</h2>
                                    <button
                                        onClick={() => navigate('/resident/notices')}
                                        className="text-sm font-medium text-blue-600 hover:text-blue-700 flex items-center gap-1"
                                    >
                                        View All <ArrowRight className="w-4 h-4" />
                                    </button>
                                </div>
                                <div className="space-y-3">
                                    {notices.length > 0 ? (
                                        notices.map((notice) => (
                                            <div key={notice.id} className={`p-4 rounded-xl ${isDark ? 'bg-gray-800/50' : 'bg-gray-50'} border ${isDark ? 'border-gray-700' : 'border-gray-100'}`}>
                                                <div className="flex items-start gap-3">
                                                    <Calendar className={`w-5 h-5 mt-0.5 ${notice.status === 'ONGOING' ? 'text-green-600' : 'text-blue-600'}`} />
                                                    <div className="flex-1">
                                                        <div className="flex items-start justify-between mb-1">
                                                            <p className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>{notice.title}</p>
                                                            <span className={`px-2 py-0.5 rounded text-xs ${notice.status === 'ONGOING' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'}`}>
                                                                {notice.status}
                                                            </span>
                                                        </div>
                                                        <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'} mb-2`}>{notice.description}</p>
                                                        <div className="flex items-center gap-3 text-xs text-gray-500">
                                                            <span>📅 {new Date(notice.date).toLocaleDateString('en-IN')}</span>
                                                            {notice.time && <span>🕐 {notice.time}</span>}
                                                            {notice.location && <span>📍 {notice.location}</span>}
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        ))
                                    ) : (
                                        <div className="text-center py-8">
                                            <Bell className={`w-12 h-12 mx-auto mb-3 ${isDark ? 'text-gray-600' : 'text-gray-300'}`} />
                                            <p className={`${isDark ? 'text-gray-400' : 'text-gray-500'}`}>No upcoming events</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Right Column */}
                        <div className="space-y-6">
                            {/* Maintenance */}
                            <div className={`${isDark ? 'bg-[#252525] border-gray-800' : 'bg-white border-gray-200'} rounded-2xl border p-6`}>
                                <h2 className={`text-lg font-semibold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>Maintenance</h2>
                                {maintenance ? (
                                    <div className="text-center">
                                        <div className={`w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center ${maintenance.status === 'paid' ? isDark ? 'bg-gray-800' : 'bg-green-100' : isDark ? 'bg-gray-800' : 'bg-orange-100'
                                            }`}>
                                            {maintenance.status === 'paid' ? <CheckCircle2 className="w-8 h-8 text-green-600" /> : <Clock className="w-8 h-8 text-orange-600" />}
                                        </div>
                                        <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium mb-4 ${maintenance.status === 'paid' ? 'bg-green-50 text-green-600 border border-green-200' : 'bg-orange-50 text-orange-600 border border-orange-200'
                                            }`}>
                                            {maintenance.status === 'paid' ? 'Paid' : 'Pending'}
                                        </span>
                                        <div className="space-y-3 mt-4">
                                            <div className="flex justify-between items-center pb-3 border-b border-gray-200">
                                                <span className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Amount</span>
                                                <span className={`font-bold text-lg ${isDark ? 'text-white' : 'text-gray-900'}`}>₹{maintenance.amount?.toLocaleString('en-IN')}</span>
                                            </div>
                                            <div className="flex justify-between items-center pb-3 border-b border-gray-200">
                                                <span className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Month</span>
                                                <span className={`text-sm ${isDark ? 'text-white' : 'text-gray-900'}`}>{maintenance.month}</span>
                                            </div>
                                            {maintenance.status === 'paid' && maintenance.paidAt && (
                                                <div className="flex justify-between items-center">
                                                    <span className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Paid On</span>
                                                    <span className={`text-sm ${isDark ? 'text-white' : 'text-gray-900'}`}>{new Date(maintenance.paidAt).toLocaleDateString('en-IN')}</span>
                                                </div>
                                            )}
                                        </div>
                                        {maintenance.status !== 'paid' && (
                                            <button className="w-full mt-4 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium">Pay Now</button>
                                        )}
                                    </div>
                                ) : (
                                    <div className="text-center py-8">
                                        <p className={`${isDark ? 'text-gray-400' : 'text-gray-500'}`}>No maintenance records</p>
                                    </div>
                                )}
                            </div>

                            {/* Visitors */}
                            <div className={`${isDark ? 'bg-[#252525] border-gray-800' : 'bg-white border-gray-200'} rounded-2xl border p-6`}>
                                <h2 className={`text-lg font-semibold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>Visitors</h2>
                                <div className="mb-4">
                                    <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'} mb-3`}>Today's Visitors</p>
                                    <div className="space-y-2">
                                        {visitors.length > 0 ? (
                                            visitors.slice(0, 3).map((visitor) => (
                                                <div key={visitor.id} className={`flex items-center justify-between p-3 rounded-lg ${isDark ? 'bg-gray-800/50' : 'bg-gray-50'}`}>
                                                    <div className="flex items-center gap-2">
                                                        <div className={`w-8 h-8 rounded-full ${isDark ? 'bg-gray-700' : 'bg-gray-200'} flex items-center justify-center`}>
                                                            <Users className={`w-4 h-4 ${isDark ? 'text-gray-400' : 'text-gray-600'}`} />
                                                        </div>
                                                        <div>
                                                            <p className={`text-sm font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>{visitor.name}</p>
                                                            <p className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>{visitor.purpose}</p>
                                                        </div>
                                                    </div>
                                                    <div className="text-right">
                                                        <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{visitor.inTime}</p>
                                                        <span className={`inline-block px-2 py-0.5 rounded text-xs ${visitor.status === 'in' ? 'bg-green-50 text-green-600' : 'bg-gray-100 text-gray-600'}`}>
                                                            {visitor.status === 'in' ? 'Inside' : 'Left'}
                                                        </span>
                                                    </div>
                                                </div>
                                            ))
                                        ) : (
                                            <p className={`text-sm ${isDark ? 'text-gray-500' : 'text-gray-500'} text-center py-4`}>No visitors today</p>
                                        )}
                                    </div>
                                </div>
                                <button
                                    onClick={() => navigate('/resident/visitors')}
                                    className={`w-full py-2.5 rounded-lg font-medium text-sm transition-colors flex items-center justify-center gap-2 ${isDark ? 'bg-white text-black hover:bg-gray-100' : 'bg-black text-white hover:bg-gray-800'
                                        }`}
                                >
                                    Pre-approve Visitors <ArrowRight className="w-4 h-4" />
                                </button>
                            </div>
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

            {/* Notifications Overlay */}
            {notificationsOpen && (
                <div
                    className="fixed inset-0 z-30"
                    onClick={() => setNotificationsOpen(false)}
                />
            )}
        </div>
    );
};

export default ResidentDashboard;

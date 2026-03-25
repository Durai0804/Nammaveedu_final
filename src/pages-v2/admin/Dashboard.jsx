import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Home, Users, AlertCircle, IndianRupee, Building2, Package, Bell,
    TrendingUp, Menu, X, LogOut, FileText, Settings, UserPlus,
    ArrowRight, ChevronRight, Loader, Eye, Calendar, Clock, CheckCircle2
} from 'lucide-react';
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const AdminDashboard = () => {
    const navigate = useNavigate();
    const [theme, setTheme] = useState('light');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [notificationsOpen, setNotificationsOpen] = useState(false);

    // Dashboard data state
    const [stats, setStats] = useState({
        totalResidents: 0,
        totalFlats: 0,
        pendingComplaints: 0,
        maintenanceDue: 0,
        maintenanceCollected: 0,
        totalMaintenance: 0
    });
    const [recentComplaints, setRecentComplaints] = useState([]);
    const [recentVisitors, setRecentVisitors] = useState([]);
    const [maintenanceData, setMaintenanceData] = useState([]);
    const [notices, setNotices] = useState([]);

    useEffect(() => {
        const savedTheme = localStorage.getItem('theme') || 'light';
        setTheme(savedTheme);
    }, []);

    // Fetch admin dashboard data
    useEffect(() => {
        const fetchDashboardData = async () => {
            const token = localStorage.getItem('token');
            if (!token) {
                navigate('/login');
                return;
            }

            try {
                setLoading(true);

                // Fetch main dashboard stats
                const dashboardRes = await fetch('http://localhost:4000/api/admin/dashboard', {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                });
                const dashboardData = await dashboardRes.json();

                // Fetch complaints
                const complaintsRes = await fetch('http://localhost:4000/api/admin/complaints', {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                const complaintsData = await complaintsRes.json();

                // Fetch visitors
                const visitorsRes = await fetch('http://localhost:4000/api/admin/visitors', {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                const visitorsData = await visitorsRes.json();

                // Fetch flats to count residents
                const flatsRes = await fetch('http://localhost:4000/api/admin/flats', {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                const flatsData = await flatsRes.json();

                // Fetch maintenance data
                const maintenanceRes = await fetch('http://localhost:4000/api/admin/maintenance', {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                const maintenanceData = await maintenanceRes.json();

                if (dashboardData.success) {
                    const data = dashboardData.data;

                    // Count total residents from flats
                    const totalResidents = flatsData.success ? flatsData.data.length : 0;

                    // Set stats
                    setStats({
                        totalResidents: totalResidents,
                        totalFlats: data.stats?.totalFlats || 0,
                        pendingComplaints: data.stats?.pendingComplaints || 0,
                        maintenanceDue: data.stats?.maintenanceDue || 0,
                        maintenanceCollected: data.stats?.maintenanceCollected || 0,
                        totalMaintenance: data.stats?.totalMaintenance || 0
                    });

                    // Set recent complaints
                    if (complaintsData.success && complaintsData.data) {
                        setRecentComplaints(complaintsData.data.slice(0, 5));
                    }

                    // Set recent visitors
                    if (visitorsData.success && visitorsData.data) {
                        setRecentVisitors(visitorsData.data.slice(0, 5));
                    }

                    // Prepare maintenance chart data by month
                    if (maintenanceData.success && maintenanceData.data) {
                        const monthMap = new Map();

                        maintenanceData.data.forEach(item => {
                            const month = item.month;
                            if (!monthMap.has(month)) {
                                monthMap.set(month, { month, collected: 0, pending: 0 });
                            }
                            const entry = monthMap.get(month);
                            if (item.status === 'paid') {
                                entry.collected += item.maintenance || 0;
                            } else {
                                entry.pending += item.maintenance || 0;
                            }
                        });

                        const chartData = Array.from(monthMap.values()).slice(0, 6);
                        setMaintenanceData(chartData);
                    }

                    // Fetch notices
                    const noticesRes = await fetch('http://localhost:4000/api/notices', {
                        headers: { 'Authorization': `Bearer ${token}` }
                    });
                    const noticesData = await noticesRes.json();
                    if (noticesData.success) {
                        setNotices(noticesData.data.slice(0, 5));
                    }
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
        { icon: Home, label: 'Dashboard', path: '/admin/dashboard', active: true },
        { icon: Building2, label: 'Flats', path: '/flats' },
        { icon: IndianRupee, label: 'Administration', path: '/administration' },
        { icon: AlertCircle, label: 'Complaints', path: '/complaints' },
        { icon: Bell, label: 'Notices', path: '/notices' },
        { icon: Package, label: 'Visitors', path: '/visitors' },
        { icon: UserPlus, label: 'Create Resident', path: '/admin/residents/create' },
        { icon: FileText, label: 'Reports', path: '/reports' },
        { icon: Settings, label: 'Settings', path: '/settings' }
    ];

    const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444'];

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

    const collectionPercentage = stats.totalMaintenance ? Math.round((stats.maintenanceCollected / stats.totalMaintenance) * 100) : 0;

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
                <div className={`${isDark ? 'bg-[#0a0a0a] border-[#1f1f1f]' : 'bg-white border-gray-200'} border-b sticky top-0 z-40`}>
                    <div className="px-4 sm:px-6 lg:px-8">
                        <div className="flex items-center justify-between h-16">
                            <button onClick={() => setSidebarOpen(true)} className="lg:hidden">
                                <Menu className={`w-6 h-6 ${isDark ? 'text-white' : 'text-gray-900'}`} />
                            </button>

                            <div className="flex items-center gap-2">
                                <span className={`text-sm ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>Admin</span>
                                <ChevronRight className="w-4 h-4 text-gray-400" />
                                <span className={`text-sm font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>Dashboard</span>
                            </div>

                            <div className="flex items-center gap-3">
                                <button className={`p-2 rounded-lg ${isDark ? 'hover:bg-[#181818]' : 'hover:bg-gray-100'} transition-colors`}>
                                    <Bell className={`w-5 h-5 ${isDark ? 'text-gray-400' : 'text-gray-600'}`} />
                                </button>

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

                                <div className={`w-8 h-8 rounded-full ${isDark ? 'bg-[#181818]' : 'bg-gray-200'} flex items-center justify-center`}>
                                    <span className={`text-sm font-medium ${isDark ? 'text-white' : 'text-gray-700'}`}>A</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Dashboard Content */}
                <div className="p-4 sm:p-6 lg:p-8">
                    {/* Stats Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
                        <div className={`${isDark ? 'bg-[#0f0f0f] border-[#1f1f1f]' : 'bg-white border-gray-200'} rounded-2xl border p-6`}>
                            <div className="flex items-center justify-between mb-4">
                                <div className={`w-12 h-12 rounded-lg ${isDark ? 'bg-[#181818]' : 'bg-blue-50'} flex items-center justify-center`}>
                                    <Users className="w-6 h-6 text-blue-600" />
                                </div>
                                <button
                                    onClick={() => navigate('/flats')}
                                    className="text-blue-600 hover:text-blue-700"
                                >
                                    <Eye className="w-5 h-5" />
                                </button>
                            </div>
                            <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'} mb-1`}>Total Residents</p>
                            <p className={`text-3xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>{stats.totalResidents}</p>
                        </div>

                        <div className={`${isDark ? 'bg-[#0f0f0f] border-[#1f1f1f]' : 'bg-white border-gray-200'} rounded-2xl border p-6`}>
                            <div className="flex items-center justify-between mb-4">
                                <div className={`w-12 h-12 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-purple-50'} flex items-center justify-center`}>
                                    <Building2 className="w-6 h-6 text-purple-600" />
                                </div>
                                <button
                                    onClick={() => navigate('/flats')}
                                    className="text-purple-600 hover:text-purple-700"
                                >
                                    <Eye className="w-5 h-5" />
                                </button>
                            </div>
                            <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'} mb-1`}>Total Flats</p>
                            <p className={`text-3xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>{stats.totalFlats}</p>
                        </div>

                        <div className={`${isDark ? 'bg-[#0f0f0f] border-[#1f1f1f]' : 'bg-white border-gray-200'} rounded-2xl border p-6`}>
                            <div className="flex items-center justify-between mb-4">
                                <div className={`w-12 h-12 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-orange-50'} flex items-center justify-center`}>
                                    <AlertCircle className="w-6 h-6 text-orange-600" />
                                </div>
                                <button
                                    onClick={() => navigate('/complaints')}
                                    className="text-orange-600 hover:text-orange-700"
                                >
                                    <Eye className="w-5 h-5" />
                                </button>
                            </div>
                            <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'} mb-1`}>Pending Complaints</p>
                            <p className={`text-3xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>{stats.pendingComplaints}</p>
                        </div>

                        <div className={`${isDark ? 'bg-[#0f0f0f] border-[#1f1f1f]' : 'bg-white border-gray-200'} rounded-2xl border p-6`}>
                            <div className="flex items-center justify-between mb-4">
                                <div className={`w-12 h-12 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-green-50'} flex items-center justify-center`}>
                                    <IndianRupee className="w-6 h-6 text-green-600" />
                                </div>
                                <button
                                    onClick={() => navigate('/maintenance')}
                                    className="text-green-600 hover:text-green-700"
                                >
                                    <Eye className="w-5 h-5" />
                                </button>
                            </div>
                            <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'} mb-1`}>Maintenance Collection</p>
                            <p className={`text-3xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>{collectionPercentage}%</p>
                            <p className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-500'} mt-1`}>
                                ₹{stats.maintenanceCollected.toLocaleString('en-IN')} / ₹{stats.totalMaintenance.toLocaleString('en-IN')}
                            </p>
                        </div>
                    </div>

                    {/* Charts Row */}
                    <div className="grid lg:grid-cols-2 gap-6 mb-6">
                        {/* Maintenance Chart */}
                        <div className={`${isDark ? 'bg-[#0f0f0f] border-[#1f1f1f]' : 'bg-white border-gray-200'} rounded-2xl border p-6`}>
                            <div className="flex items-center justify-between mb-6">
                                <h2 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>Maintenance Overview</h2>
                                <button
                                    onClick={() => navigate('/maintenance')}
                                    className="text-sm font-medium text-blue-600 hover:text-blue-700 flex items-center gap-1"
                                >
                                    View All <ArrowRight className="w-4 h-4" />
                                </button>
                            </div>
                            <ResponsiveContainer width="100%" height={250}>
                                <BarChart data={maintenanceData}>
                                    <CartesianGrid strokeDasharray="3 3" stroke={isDark ? '#1f1f1f' : '#E5E7EB'} />
                                    <XAxis dataKey="month" stroke={isDark ? '#666666' : '#6B7280'} />
                                    <YAxis stroke={isDark ? '#666666' : '#6B7280'} />
                                    <Tooltip
                                        contentStyle={{
                                            backgroundColor: isDark ? 'rgba(10, 10, 10, 0.95)' : 'rgba(255, 255, 255, 0.95)',
                                            border: isDark ? '1px solid rgba(31, 31, 31, 0.5)' : '1px solid rgba(229, 231, 235, 0.8)',
                                            borderRadius: '8px',
                                            padding: '8px 12px',
                                            boxShadow: isDark ? '0 4px 6px rgba(0, 0, 0, 0.3)' : '0 4px 6px rgba(0, 0, 0, 0.1)',
                                            color: isDark ? '#FFFFFF' : '#000000'
                                        }}
                                        cursor={false}
                                    />
                                    <Legend />
                                    <Bar dataKey="collected" fill="#10B981" name="Collected" />
                                    <Bar dataKey="pending" fill="#F59E0B" name="Pending" />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>

                        {/* Announcements */}
                        <div className={`${isDark ? 'bg-[#0f0f0f] border-[#1f1f1f]' : 'bg-white border-gray-200'} rounded-2xl border p-6`}>
                            <div className="flex items-center justify-between mb-6">
                                <h2 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>Announcements</h2>
                                <button
                                    onClick={() => navigate('/notices')}
                                    className="text-sm font-medium text-blue-600 hover:text-blue-700 flex items-center gap-1"
                                >
                                    View All <ArrowRight className="w-4 h-4" />
                                </button>
                            </div>
                            <div className="space-y-3">
                                {notices.length > 0 ? (
                                    notices.map((notice) => (
                                        <div key={notice.id} className={`p-4 rounded-xl ${isDark ? 'bg-[#141414]' : 'bg-gray-50'} border ${isDark ? 'border-gray-700' : 'border-gray-100'}`}>
                                            <div className="flex items-start gap-3">
                                                <Calendar className={`w-5 h-5 mt-0.5 ${notice.status === 'ONGOING' ? 'text-green-600' : notice.status === 'UPCOMING' ? 'text-blue-600' : 'text-gray-600'}`} />
                                                <div className="flex-1">
                                                    <div className="flex items-start justify-between mb-1">
                                                        <p className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>{notice.title}</p>
                                                        <span className={`px-2 py-0.5 rounded text-xs ml-2 ${notice.status === 'ONGOING' ? 'bg-green-100 text-green-700' :
                                                            notice.status === 'UPCOMING' ? 'bg-blue-100 text-blue-700' :
                                                                'bg-gray-100 text-gray-700'
                                                            }`}>
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
                                        <p className={`${isDark ? 'text-gray-400' : 'text-gray-500'}`}>No announcements</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Recent Activity Row */}
                    <div className="grid lg:grid-cols-2 gap-6">
                        {/* Recent Complaints */}
                        <div className={`${isDark ? 'bg-[#0f0f0f] border-[#1f1f1f]' : 'bg-white border-gray-200'} rounded-2xl border p-6`}>
                            <div className="flex items-center justify-between mb-6">
                                <h2 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>Recent Complaints</h2>
                                <button
                                    onClick={() => navigate('/complaints')}
                                    className="text-sm font-medium text-blue-600 hover:text-blue-700 flex items-center gap-1"
                                >
                                    View All <ArrowRight className="w-4 h-4" />
                                </button>
                            </div>
                            <div className="space-y-3">
                                {recentComplaints.length > 0 ? (
                                    recentComplaints.map((complaint) => (
                                        <div key={complaint.id} className={`p-4 rounded-xl ${isDark ? 'bg-[#141414]' : 'bg-gray-50'}`}>
                                            <div className="flex items-start justify-between mb-2">
                                                <div className="flex-1">
                                                    <p className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>{complaint.description}</p>
                                                    <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'} mt-1`}>Flat: {complaint.flatNumber}</p>
                                                </div>
                                                <span className={`px-2.5 py-1 rounded-full text-xs font-medium ml-2 ${complaint.status === 'RESOLVED' ? 'bg-green-100 text-green-700' :
                                                    complaint.status === 'IN_PROGRESS' ? 'bg-blue-100 text-blue-700' :
                                                        'bg-orange-100 text-orange-700'
                                                    }`}>
                                                    {complaint.status}
                                                </span>
                                            </div>
                                            <div className="flex items-center gap-3 text-xs text-gray-500">
                                                <span>{new Date(complaint.createdAt).toLocaleDateString('en-IN')}</span>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <p className={`text-center py-8 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>No recent complaints</p>
                                )}
                            </div>
                        </div>

                        {/* Recent Visitors */}
                        <div className={`${isDark ? 'bg-[#0f0f0f] border-[#1f1f1f]' : 'bg-white border-gray-200'} rounded-2xl border p-6`}>
                            <div className="flex items-center justify-between mb-6">
                                <h2 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>Recent Visitors</h2>
                                <button
                                    onClick={() => navigate('/visitors')}
                                    className="text-sm font-medium text-blue-600 hover:text-blue-700 flex items-center gap-1"
                                >
                                    View All <ArrowRight className="w-4 h-4" />
                                </button>
                            </div>
                            <div className="space-y-3">
                                {recentVisitors.length > 0 ? (
                                    recentVisitors.map((visitor) => (
                                        <div key={visitor.id} className={`p-4 rounded-xl ${isDark ? 'bg-[#141414]' : 'bg-gray-50'}`}>
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-3">
                                                    <div className={`w-10 h-10 rounded-full ${isDark ? 'bg-[#181818]' : 'bg-gray-200'} flex items-center justify-center`}>
                                                        <Users className={`w-5 h-5 ${isDark ? 'text-gray-400' : 'text-gray-600'}`} />
                                                    </div>
                                                    <div>
                                                        <p className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>{visitor.name}</p>
                                                        <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                                                            Flat: {visitor.flat?.flatNumber || 'N/A'} • {visitor.purpose}
                                                        </p>
                                                    </div>
                                                </div>
                                                <div className="text-right">
                                                    <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{visitor.inTime}</p>
                                                    <span className={`inline-block px-2 py-0.5 rounded text-xs ${visitor.status === 'in' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'
                                                        }`}>
                                                        {visitor.status === 'in' ? 'Inside' : 'Left'}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <p className={`text-center py-8 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>No recent visitors</p>
                                )}
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
        </div>
    );
};

export default AdminDashboard;

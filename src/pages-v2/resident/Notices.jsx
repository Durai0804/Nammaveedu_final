import React, { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Home, MessageSquare, AlertCircle, Package, Bell, Settings,
    Menu, X, LogOut, ChevronRight, Loader, Calendar, Clock, MapPin
} from 'lucide-react';

const Notices = () => {
    const navigate = useNavigate();
    const [theme, setTheme] = useState('light');
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [notices, setNotices] = useState([]);
    const [filter, setFilter] = useState('all');

    useEffect(() => {
        const savedTheme = localStorage.getItem('theme') || 'light';
        setTheme(savedTheme);
    }, []);

    useEffect(() => {
        const fetchNotices = async () => {
            const token = localStorage.getItem('token');
            if (!token) { navigate('/login'); return; }
            try {
                setLoading(true);
                const res = await fetch('http://localhost:4000/api/notices', {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                const data = await res.json();
                if (data.success) setNotices(data.data || []);
            } catch (err) {
                setError('Unable to load notices');
            } finally {
                setLoading(false);
            }
        };
        fetchNotices();
    }, [navigate]);

    const isDark = theme === 'dark';

    const filtered = useMemo(() => {
        if (filter === 'all') return notices;
        return notices.filter(n => n.status?.toUpperCase() === filter.toUpperCase());
    }, [notices, filter]);

    const getStatusStyle = (status) => {
        const s = status?.toUpperCase();
        if (s === 'ONGOING') return 'bg-green-100 text-green-700';
        if (s === 'UPCOMING') return 'bg-blue-100 text-blue-700';
        if (s === 'COMPLETED') return 'bg-gray-100 text-gray-700';
        return 'bg-gray-100 text-gray-600';
    };

    const sidebarItems = [
        { icon: Home, label: 'Dashboard', path: '/resident/dashboard' },
        { icon: MessageSquare, label: 'My Complaints', path: '/resident/complaints' },
        { icon: AlertCircle, label: 'Raise Complaint', path: '/resident/complaints/new' },
        { icon: Package, label: 'Visitors', path: '/resident/visitors' },
        { icon: Bell, label: 'Notices', path: '/resident/notices', active: true },
        { icon: Settings, label: 'Settings', path: '/resident/settings' }
    ];

    const handleLogout = () => { localStorage.clear(); navigate('/login'); };
    const filterButtons = [
        { value: 'all', label: 'All' },
        { value: 'ONGOING', label: 'Ongoing' },
        { value: 'UPCOMING', label: 'Upcoming' },
        { value: 'COMPLETED', label: 'Completed' }
    ];

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
                                <span className={`text-sm font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>Notices</span>
                            </div>
                            <div />
                        </div>
                    </div>
                </div>

                <div className="p-4 sm:p-6 lg:p-8">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
                        <div>
                            <h1 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>Notices & Events</h1>
                            <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>All apartment events and announcements</p>
                        </div>
                        <div className="flex gap-2 flex-wrap">
                            {filterButtons.map(btn => (
                                <button key={btn.value} onClick={() => setFilter(btn.value)}
                                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${filter === btn.value
                                        ? 'bg-blue-600 text-white'
                                        : isDark ? 'bg-gray-800 text-gray-300 hover:bg-gray-700' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                        }`}>
                                    {btn.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    {loading ? (
                        <div className="flex items-center justify-center py-20">
                            <Loader className="w-8 h-8 text-blue-600 animate-spin" />
                        </div>
                    ) : error ? (
                        <div className={`text-center py-20 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{error}</div>
                    ) : filtered.length > 0 ? (
                        <div className="space-y-4">
                            {filtered.map(notice => (
                                <div key={notice.id} className={`${isDark ? 'bg-[#252525] border-gray-800' : 'bg-white border-gray-200'} rounded-xl border p-5`}>
                                    <div className="flex items-start justify-between gap-4">
                                        <div className="flex items-start gap-3 flex-1">
                                            <Calendar className={`w-5 h-5 mt-0.5 flex-shrink-0 ${notice.status?.toUpperCase() === 'ONGOING' ? 'text-green-600' : 'text-blue-600'}`} />
                                            <div className="flex-1">
                                                <div className="flex items-center gap-3 mb-2 flex-wrap">
                                                    <h3 className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>{notice.title}</h3>
                                                    <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusStyle(notice.status)}`}>
                                                        {notice.status}
                                                    </span>
                                                </div>
                                                <p className={`text-sm mb-3 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{notice.description}</p>
                                                <div className="flex items-center gap-4 flex-wrap">
                                                    <span className={`flex items-center gap-1 text-xs ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>
                                                        <Calendar className="w-3 h-3" /> {new Date(notice.date).toLocaleDateString('en-IN')}
                                                    </span>
                                                    {notice.time && (
                                                        <span className={`flex items-center gap-1 text-xs ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>
                                                            <Clock className="w-3 h-3" /> {notice.time}
                                                        </span>
                                                    )}
                                                    {notice.location && (
                                                        <span className={`flex items-center gap-1 text-xs ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>
                                                            <MapPin className="w-3 h-3" /> {notice.location}
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className={`text-center py-20 ${isDark ? 'bg-[#252525] border-gray-800' : 'bg-white border-gray-200'} rounded-xl border`}>
                            <Bell className={`w-16 h-16 mx-auto mb-4 ${isDark ? 'text-gray-600' : 'text-gray-300'}`} />
                            <p className={`text-lg font-medium ${isDark ? 'text-white' : 'text-gray-900'} mb-2`}>No notices found</p>
                            <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>There are no announcements at this time</p>
                        </div>
                    )}
                </div>
            </div>

            {sidebarOpen && <div className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden" onClick={() => setSidebarOpen(false)} />}
        </div>
    );
};

export default Notices;

import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
    Home, MessageSquare, AlertCircle, Package, Bell, Settings,
    Menu, X, LogOut, ChevronRight, Loader, Search, Filter,
    Plus, Trash2, ArrowRight
} from 'lucide-react';

const MyComplaints = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const [theme, setTheme] = useState('light');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [complaints, setComplaints] = useState([]);
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');

    useEffect(() => {
        const savedTheme = localStorage.getItem('theme') || 'light';
        setTheme(savedTheme);
    }, []);

    useEffect(() => {
        const fetchComplaints = async () => {
            const token = localStorage.getItem('token');
            if (!token) { navigate('/login'); return; }
            try {
                setLoading(true);
                const res = await fetch('http://localhost:4000/api/resident/complaints', {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                const data = await res.json();
                if (data.success) setComplaints(data.data || []);
            } catch (err) {
                setError('Unable to load complaints');
            } finally {
                setLoading(false);
            }
        };
        fetchComplaints();
    }, [navigate]);

    const handleDelete = async (e, id) => {
        e.stopPropagation();
        if (!window.confirm('Delete this complaint?')) return;
        const token = localStorage.getItem('token');
        try {
            await fetch(`http://localhost:4000/api/complaints/${encodeURIComponent(id)}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            setComplaints(prev => prev.filter(c => String(c.id) !== String(id)));
        } catch (err) {
            alert('Unable to delete complaint');
        }
    };

    const isDark = theme === 'dark';

    const sidebarItems = [
        { icon: Home, label: 'Dashboard', path: '/resident/dashboard' },
        { icon: MessageSquare, label: 'My Complaints', path: '/resident/complaints', active: true },
        { icon: AlertCircle, label: 'Raise Complaint', path: '/resident/complaints/new' },
        { icon: Package, label: 'Visitors', path: '/resident/visitors' },
        { icon: Bell, label: 'Notices', path: '/resident/notices' },
        { icon: Settings, label: 'Settings', path: '/resident/settings' }
    ];

    const filtered = complaints.filter(c => {
        const matchStatus = statusFilter === 'all' || c.status?.toUpperCase() === statusFilter;
        const matchSearch = !search || c.description?.toLowerCase().includes(search.toLowerCase());
        return matchStatus && matchSearch;
    });

    const getStatusStyle = (status) => {
        const s = status?.toUpperCase();
        if (s === 'RESOLVED') return 'bg-green-100 text-green-700';
        if (s === 'IN_PROGRESS') return 'bg-blue-100 text-blue-700';
        return 'bg-orange-100 text-orange-700';
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

            {/* Main Content */}
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
                                <span className={`text-sm font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>My Complaints</span>
                            </div>
                            <button
                                onClick={() => { const t = theme === 'dark' ? 'light' : 'dark'; setTheme(t); localStorage.setItem('theme', t); }}
                                className={`p-2 rounded-lg ${isDark ? 'hover:bg-gray-800' : 'hover:bg-gray-100'} transition-colors`}>
                                {isDark ? (
                                    <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
                                ) : (
                                    <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" /></svg>
                                )}
                            </button>
                        </div>
                    </div>
                </div>

                <div className="p-4 sm:p-6 lg:p-8">
                    {/* Header */}
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
                        <div>
                            <h1 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>My Complaints</h1>
                            <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Track and manage your complaints</p>
                        </div>
                        <button onClick={() => navigate('/resident/complaints/new')}
                            className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium text-sm transition-colors">
                            <Plus className="w-4 h-4" /> Raise Complaint
                        </button>
                    </div>

                    {/* Filters */}
                    <div className={`${isDark ? 'bg-[#252525] border-gray-800' : 'bg-white border-gray-200'} rounded-xl border p-4 mb-6`}>
                        <div className="flex flex-col sm:flex-row gap-4">
                            <div className="relative flex-1">
                                <Search className={`absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 ${isDark ? 'text-gray-500' : 'text-gray-400'}`} />
                                <input type="text" placeholder="Search complaints..." value={search} onChange={(e) => setSearch(e.target.value)}
                                    className={`w-full pl-10 pr-4 py-2.5 rounded-lg border ${isDark ? 'bg-gray-800 border-gray-700 text-white placeholder-gray-500' : 'bg-gray-50 border-gray-200 text-gray-900 placeholder-gray-400'} focus:ring-2 focus:ring-blue-500 outline-none`} />
                            </div>
                            <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}
                                className={`px-4 py-2.5 rounded-lg border ${isDark ? 'bg-gray-800 border-gray-700 text-white' : 'bg-gray-50 border-gray-200 text-gray-900'} outline-none`}>
                                <option value="all">All Status</option>
                                <option value="OPEN">Open</option>
                                <option value="IN_PROGRESS">In Progress</option>
                                <option value="RESOLVED">Resolved</option>
                            </select>
                        </div>
                    </div>

                    {/* Complaints List */}
                    {loading ? (
                        <div className="flex items-center justify-center py-20">
                            <Loader className="w-8 h-8 text-blue-600 animate-spin" />
                        </div>
                    ) : error ? (
                        <div className={`text-center py-20 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{error}</div>
                    ) : filtered.length > 0 ? (
                        <div className="space-y-4">
                            {filtered.map(c => (
                                <div key={c.id} onClick={() => navigate(`/resident/complaints/${encodeURIComponent(c.id)}`)}
                                    className={`${isDark ? 'bg-[#252525] border-gray-800 hover:border-gray-700' : 'bg-white border-gray-200 hover:border-gray-300'} rounded-xl border p-5 cursor-pointer transition-all`}>
                                    <div className="flex items-start justify-between gap-4">
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-3 mb-2 flex-wrap">
                                                <span className={`text-xs font-mono ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>#{c.id}</span>
                                                <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${getStatusStyle(c.status)}`}>{c.status}</span>
                                            </div>
                                            <p className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>{c.description}</p>
                                            <div className="flex items-center gap-4 mt-2">
                                                <span className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>Flat: {c.flatNumber}</span>
                                                <span className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>{new Date(c.createdAt).toLocaleDateString('en-IN')}</span>
                                                {c.assignedTo && <span className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>Assigned: {c.assignedTo}</span>}
                                            </div>
                                        </div>
                                        <button onClick={(e) => handleDelete(e, c.id)}
                                            className={`p-2 rounded-lg ${isDark ? 'hover:bg-red-500/10 text-gray-500 hover:text-red-400' : 'hover:bg-red-50 text-gray-400 hover:text-red-600'} transition-colors`}>
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className={`text-center py-20 ${isDark ? 'bg-[#252525] border-gray-800' : 'bg-white border-gray-200'} rounded-xl border`}>
                            <MessageSquare className={`w-16 h-16 mx-auto mb-4 ${isDark ? 'text-gray-600' : 'text-gray-300'}`} />
                            <p className={`text-lg font-medium ${isDark ? 'text-white' : 'text-gray-900'} mb-2`}>No complaints found</p>
                            <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'} mb-4`}>You haven't raised any complaints yet</p>
                            <button onClick={() => navigate('/resident/complaints/new')}
                                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium">
                                Raise a Complaint
                            </button>
                        </div>
                    )}
                </div>
            </div>

            {sidebarOpen && <div className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden" onClick={() => setSidebarOpen(false)} />}
        </div>
    );
};

export default MyComplaints;

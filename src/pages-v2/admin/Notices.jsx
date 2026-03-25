import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Home, Users, AlertCircle, Building2, Menu, X, LogOut, Settings,
    Search, Edit, Trash2, Plus, ChevronRight, Loader, IndianRupee,
    Bell, Package, FileText, UserPlus, Calendar, MapPin, Clock
} from 'lucide-react';

const Notices = () => {
    const navigate = useNavigate();
    const [theme, setTheme] = useState('light');
    const [loading, setLoading] = useState(true);
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [notices, setNotices] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [filterStatus, setFilterStatus] = useState('all');
    const [showModal, setShowModal] = useState(false);
    const [editingNotice, setEditingNotice] = useState(null);
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        date: '',
        time: '',
        location: '',
        status: 'UPCOMING'
    });

    useEffect(() => {
        const savedTheme = localStorage.getItem('theme') || 'light';
        setTheme(savedTheme);
    }, []);

    useEffect(() => {
        fetchNotices();
    }, []);

    const fetchNotices = async () => {
        const token = localStorage.getItem('accessToken') || localStorage.getItem('token');
        if (!token) {
            navigate('/login');
            return;
        }

        try {
            setLoading(true);
            const response = await fetch('http://localhost:4000/api/notices', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const result = await response.json();
            if (result.success) {
                setNotices(result.data);
            }
        } catch (error) {
            console.error('Error fetching notices:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleLogout = () => {
        localStorage.clear();
        navigate('/login');
    };

    const openCreateModal = () => {
        setEditingNotice(null);
        setFormData({
            title: '',
            description: '',
            date: '',
            time: '',
            location: '',
            status: 'UPCOMING'
        });
        setShowModal(true);
    };

    const openEditModal = (notice) => {
        setEditingNotice(notice);
        setFormData({
            title: notice.title,
            description: notice.description,
            date: notice.date.split('T')[0],
            time: notice.time || '',
            location: notice.location || '',
            status: notice.status
        });
        setShowModal(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const token = localStorage.getItem('accessToken') || localStorage.getItem('token');

        try {
            const url = editingNotice
                ? `http://localhost:4000/api/admin/notices/${editingNotice.id}`
                : 'http://localhost:4000/api/admin/notices';

            // Normalize payload to backend expectations (ISO date string)
            const payload = {
                title: formData.title,
                description: formData.description,
                date: formData.date ? new Date(formData.date).toISOString() : new Date().toISOString(),
                time: formData.time || null,
                location: formData.location || null,
                status: formData.status,
            };

            const response = await fetch(url, {
                method: editingNotice ? 'PUT' : 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(payload)
            });

            const result = await response.json();
            if (result.success) {
                setShowModal(false);
                fetchNotices();
                if (!editingNotice) {
                    alert('Notice created! Notifications sent to all residents.');
                }
            }
        } catch (error) {
            console.error('Error saving notice:', error);
        }
    };

    const handleDelete = async (noticeId) => {
        if (!confirm('Are you sure you want to delete this notice?')) return;

        const token = localStorage.getItem('accessToken') || localStorage.getItem('token');
        try {
            const response = await fetch(`http://localhost:4000/api/admin/notices/${noticeId}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });

            const result = await response.json();
            if (result.success) {
                fetchNotices();
            }
        } catch (error) {
            console.error('Error deleting notice:', error);
        }
    };

    const isDark = theme === 'dark';

    const sidebarItems = [
        { icon: Home, label: 'Dashboard', path: '/admin/dashboard' },
        { icon: Building2, label: 'Flats', path: '/flats' },
        { icon: IndianRupee, label: 'Administration', path: '/administration' },
        { icon: AlertCircle, label: 'Complaints', path: '/complaints' },
        { icon: Bell, label: 'Notices', path: '/notices', active: true },
        { icon: Package, label: 'Visitors', path: '/visitors' },
        { icon: UserPlus, label: 'Create Resident', path: '/admin/residents/create' },
        { icon: FileText, label: 'Reports', path: '/reports' },
        { icon: Settings, label: 'Settings', path: '/settings' }
    ];

    const filteredNotices = notices.filter(notice => {
        const matchesSearch = notice.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            notice.description.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesFilter = filterStatus === 'all' || notice.status === filterStatus;
        return matchesSearch && matchesFilter;
    });

    const getStatusBadge = (status) => {
        if (status === 'ONGOING') return { bg: 'bg-green-100', text: 'text-green-800' };
        if (status === 'UPCOMING') return { bg: 'bg-blue-100', text: 'text-blue-800' };
        return { bg: 'bg-gray-100', text: 'text-gray-800' };
    };

    if (loading) {
        return (
            <div className={`min-h-screen ${isDark ? 'bg-black' : 'bg-gray-50'} flex items-center justify-center`}>
                <Loader className="w-16 h-16 text-blue-600 animate-spin" />
            </div>
        );
    }

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
                                <span className={`text-sm font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>Notices</span>
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
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <h1 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>Notices & Announcements</h1>
                            <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'} mt-1`}>Create and manage community notices</p>
                        </div>
                        <button
                            onClick={openCreateModal}
                            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                        >
                            <Plus className="w-5 h-5" />
                            Create Notice
                        </button>
                    </div>

                    {/* Filters */}
                    <div className={`${isDark ? 'bg-[#0f0f0f] border-[#1f1f1f]' : 'bg-white border-gray-200'} rounded-xl border p-4 mb-6`}>
                        <div className="grid md:grid-cols-2 gap-4">
                            <div className="relative">
                                <Search className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
                                <input
                                    type="text"
                                    placeholder="Search notices..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className={`w-full ${isDark ? 'bg-[#141414] text-white border-[#1f1f1f]' : 'bg-gray-50 text-gray-900 border-gray-200'} border rounded-lg pl-10 pr-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-600`}
                                />
                            </div>

                            <select
                                value={filterStatus}
                                onChange={(e) => setFilterStatus(e.target.value)}
                                className={`${isDark ? 'bg-[#141414] text-white border-[#1f1f1f]' : 'bg-gray-50 text-gray-900 border-gray-200'} border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-600`}
                            >
                                <option value="all">All Status</option>
                                <option value="UPCOMING">Upcoming</option>
                                <option value="ONGOING">Ongoing</option>
                                <option value="COMPLETED">Completed</option>
                            </select>
                        </div>
                    </div>

                    {/* Notices Grid */}
                    <div className="grid gap-4">
                        {filteredNotices.map((notice) => {
                            const statusInfo = getStatusBadge(notice.status);

                            return (
                                <div key={notice.id} className={`${isDark ? 'bg-[#0f0f0f] border-[#1f1f1f]' : 'bg-white border-gray-200'} rounded-xl border p-6`}>
                                    <div className="flex items-start justify-between mb-3">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-3 mb-2">
                                                <h3 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>{notice.title}</h3>
                                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusInfo.bg} ${statusInfo.text}`}>
                                                    {notice.status}
                                                </span>
                                            </div>
                                            <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'} mb-3`}>{notice.description}</p>
                                            <div className={`flex items-center gap-6 text-sm ${isDark ? 'text-gray-500' : 'text-gray-600'}`}>
                                                <span className="flex items-center gap-1">
                                                    <Calendar className="w-4 h-4" />
                                                    {new Date(notice.date).toLocaleDateString('en-IN')}
                                                </span>
                                                {notice.time && (
                                                    <span className="flex items-center gap-1">
                                                        <Clock className="w-4 h-4" />
                                                        {notice.time}
                                                    </span>
                                                )}
                                                {notice.location && (
                                                    <span className="flex items-center gap-1">
                                                        <MapPin className="w-4 h-4" />
                                                        {notice.location}
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <button
                                                onClick={() => openEditModal(notice)}
                                                className="text-blue-600 hover:text-blue-800"
                                            >
                                                <Edit className="w-5 h-5" />
                                            </button>
                                            <button
                                                onClick={() => handleDelete(notice.id)}
                                                className="text-red-600 hover:text-red-800"
                                            >
                                                <Trash2 className="w-5 h-5" />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    {filteredNotices.length === 0 && (
                        <div className={`${isDark ? 'bg-[#0f0f0f] border-[#1f1f1f]' : 'bg-white border-gray-200'} rounded-xl border p-12 text-center`}>
                            <Bell className={`w-12 h-12 mx-auto mb-3 ${isDark ? 'text-gray-600' : 'text-gray-300'}`} />
                            <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>No notices found</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Create/Edit Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black bg-opacity-75 z-50 flex items-center justify-center p-4">
                    <div className={`${isDark ? 'bg-[#0f0f0f] border-[#1f1f1f]' : 'bg-white border-gray-200'} border rounded-2xl max-w-lg w-full p-6 max-h-[90vh] overflow-y-auto`}>
                        <h2 className={`text-xl font-bold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                            {editingNotice ? 'Edit Notice' : 'Create New Notice'}
                        </h2>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>Title *</label>
                                <input
                                    type="text"
                                    required
                                    value={formData.title}
                                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                    className={`w-full ${isDark ? 'bg-[#141414] text-white border-[#1f1f1f]' : 'bg-gray-50 text-gray-900 border-gray-200'} border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-600`}
                                    placeholder="Community Meeting"
                                />
                            </div>
                            <div>
                                <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>Description *</label>
                                <textarea
                                    required
                                    rows={3}
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    className={`w-full ${isDark ? 'bg-[#141414] text-white border-[#1f1f1f]' : 'bg-gray-50 text-gray-900 border-gray-200'} border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-600`}
                                    placeholder="Details about the event..."
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>Date *</label>
                                    <input
                                        type="date"
                                        required
                                        value={formData.date}
                                        onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                                        className={`w-full ${isDark ? 'bg-[#141414] text-white border-[#1f1f1f]' : 'bg-gray-50 text-gray-900 border-gray-200'} border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-600`}
                                    />
                                </div>
                                <div>
                                    <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>Time</label>
                                    <input
                                        type="time"
                                        value={formData.time}
                                        onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                                        className={`w-full ${isDark ? 'bg-[#141414] text-white border-[#1f1f1f]' : 'bg-gray-50 text-gray-900 border-gray-200'} border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-600`}
                                    />
                                </div>
                            </div>
                            <div>
                                <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>Location</label>
                                <input
                                    type="text"
                                    value={formData.location}
                                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                                    className={`w-full ${isDark ? 'bg-[#141414] text-white border-[#1f1f1f]' : 'bg-gray-50 text-gray-900 border-gray-200'} border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-600`}
                                    placeholder="Community Hall"
                                />
                            </div>
                            <div>
                                <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>Status</label>
                                <select
                                    value={formData.status}
                                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                                    className={`w-full ${isDark ? 'bg-[#141414] text-white border-[#1f1f1f]' : 'bg-gray-50 text-gray-900 border-gray-200'} border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-600`}
                                >
                                    <option value="UPCOMING">Upcoming</option>
                                    <option value="ONGOING">Ongoing</option>
                                    <option value="COMPLETED">Completed</option>
                                </select>
                            </div>
                            {!editingNotice && (
                                <div className={`p-3 rounded-lg ${isDark ? 'bg-blue-500/10 border-blue-500/20' : 'bg-blue-50 border-blue-200'} border`}>
                                    <p className={`text-sm ${isDark ? 'text-blue-300' : 'text-blue-800'}`}>
                                        📱 All residents will receive a notification about this notice
                                    </p>
                                </div>
                            )}
                            <div className="flex gap-3 pt-4">
                                <button
                                    type="button"
                                    onClick={() => setShowModal(false)}
                                    className={`flex-1 px-4 py-2 rounded-lg ${isDark ? 'bg-[#181818] text-white hover:bg-[#1f1f1f]' : 'bg-gray-200 text-gray-900 hover:bg-gray-300'} transition-colors`}
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                                >
                                    {editingNotice ? 'Update' : 'Create & Notify'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

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

export default Notices;

import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
    Home, Users, AlertCircle, Building2, Menu, X, LogOut, Settings,
    Search, Edit, ChevronRight, Loader, IndianRupee, Bell, Package,
    FileText, UserPlus, MessageSquare, Clock, CheckCircle, AlertTriangle
} from 'lucide-react';

const Complaints = () => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const [theme, setTheme] = useState('light');
    const [loading, setLoading] = useState(true);
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [complaints, setComplaints] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [filterStatus, setFilterStatus] = useState(searchParams.get('status') || 'all');
    const [showModal, setShowModal] = useState(false);
    const [editingComplaint, setEditingComplaint] = useState(null);
    const [formData, setFormData] = useState({ status: '', assignedTo: '' });

    useEffect(() => {
        const savedTheme = localStorage.getItem('theme') || 'light';
        setTheme(savedTheme);
    }, []);

    useEffect(() => {
        fetchComplaints();
    }, [searchParams]);

    const fetchComplaints = async () => {
        const token = localStorage.getItem('token');
        if (!token) {
            navigate('/login');
            return;
        }

        try {
            setLoading(true);
            const flatFilter = searchParams.get('flat');
            let url = 'http://localhost:4000/api/admin/complaints';
            if (flatFilter) url += `?flat=${flatFilter}`;

            const response = await fetch(url, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const result = await response.json();
            if (result.success) {
                setComplaints(result.data);
            }
        } catch (error) {
            console.error('Error fetching complaints:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleLogout = () => {
        localStorage.clear();
        navigate('/login');
    };

    const openEditModal = (complaint) => {
        setEditingComplaint(complaint);
        setFormData({
            status: complaint.status,
            assignedTo: complaint.assignedTo || ''
        });
        setShowModal(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const token = localStorage.getItem('token');

        try {
            const response = await fetch(`http://localhost:4000/api/admin/complaints/${editingComplaint.id}`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(formData)
            });

            const result = await response.json();
            if (result.success) {
                setShowModal(false);
                fetchComplaints();
                // Notification sent automatically by backend
                alert('Complaint updated! Notification sent to resident.');
            }
        } catch (error) {
            console.error('Error updating complaint:', error);
        }
    };

    const isDark = theme === 'dark';

    const sidebarItems = [
        { icon: Home, label: 'Dashboard', path: '/admin/dashboard' },
        { icon: Building2, label: 'Flats', path: '/flats' },
        { icon: IndianRupee, label: 'Administration', path: '/administration' },
        { icon: AlertCircle, label: 'Complaints', path: '/complaints', active: true },
        { icon: Bell, label: 'Notices', path: '/notices' },
        { icon: Package, label: 'Visitors', path: '/visitors' },
        { icon: UserPlus, label: 'Create Resident', path: '/admin/residents/create' },
        { icon: FileText, label: 'Reports', path: '/reports' },
        { icon: Settings, label: 'Settings', path: '/settings' }
    ];

    const filteredComplaints = complaints.filter(complaint => {
        const matchesSearch = complaint.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
            complaint.flatNumber.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesFilter = filterStatus === 'all' || complaint.status === filterStatus;
        return matchesSearch && matchesFilter;
    });

    const getStatusBadge = (status) => {
        const statusUpper = status.toUpperCase();
        if (statusUpper === 'RESOLVED') return { bg: 'bg-green-100', text: 'text-green-800', icon: CheckCircle };
        if (statusUpper === 'IN_PROGRESS') return { bg: 'bg-blue-100', text: 'text-blue-800', icon: Clock };
        return { bg: 'bg-orange-100', text: 'text-orange-800', icon: AlertTriangle };
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
            {/* Sidebar - Same as other pages */}
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
                                <span className={`text-sm font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>Complaints</span>
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
                        <h1 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>Complaints Management</h1>
                        <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'} mt-1`}>Track and resolve resident complaints</p>
                    </div>

                    {/* Filters */}
                    <div className={`${isDark ? 'bg-[#0f0f0f] border-[#1f1f1f]' : 'bg-white border-gray-200'} rounded-xl border p-4 mb-6`}>
                        <div className="grid md:grid-cols-2 gap-4">
                            <div className="relative">
                                <Search className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
                                <input
                                    type="text"
                                    placeholder="Search by description or flat number..."
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
                                <option value="OPEN">Open</option>
                                <option value="IN_PROGRESS">In Progress</option>
                                <option value="RESOLVED">Resolved</option>
                            </select>
                        </div>
                    </div>

                    {/* Complaints Grid */}
                    <div className="grid gap-4">
                        {filteredComplaints.map((complaint) => {
                            const statusInfo = getStatusBadge(complaint.status);
                            const StatusIcon = statusInfo.icon;

                            return (
                                <div key={complaint.id} className={`${isDark ? 'bg-[#0f0f0f] border-[#1f1f1f]' : 'bg-white border-gray-200'} rounded-xl border p-6 hover:shadow-lg transition-shadow`}>
                                    <div className="flex items-start justify-between mb-4">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-3 mb-2">
                                                <h3 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>{complaint.description}</h3>
                                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusInfo.bg} ${statusInfo.text} flex items-center gap-1`}>
                                                    <StatusIcon className="w-3 h-3" />
                                                    {complaint.status.replace('_', ' ')}
                                                </span>
                                            </div>
                                            <div className={`flex items-center gap-6 text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                                                <span className="flex items-center gap-1">
                                                    <Building2 className="w-4 h-4" />
                                                    Flat: {complaint.flatNumber}
                                                </span>
                                                <span className="flex items-center gap-1">
                                                    <Clock className="w-4 h-4" />
                                                    {new Date(complaint.createdAt).toLocaleDateString('en-IN')}
                                                </span>
                                                {complaint.assignedTo && (
                                                    <span className="flex items-center gap-1">
                                                        <Users className="w-4 h-4" />
                                                        Assigned: {complaint.assignedTo}
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                        <button
                                            onClick={() => openEditModal(complaint)}
                                            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
                                        >
                                            <Edit className="w-4 h-4" />
                                            Update
                                        </button>
                                    </div>
                                    {complaint.comments && complaint.comments.length > 0 && (
                                        <div className={`mt-4 pt-4 border-t ${isDark ? 'border-[#1f1f1f]' : 'border-gray-200'}`}>
                                            <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'} flex items-center gap-1`}>
                                                <MessageSquare className="w-4 h-4" />
                                                {complaint.comments.length} comment(s)
                                            </p>
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>

                    {filteredComplaints.length === 0 && (
                        <div className={`${isDark ? 'bg-[#0f0f0f] border-[#1f1f1f]' : 'bg-white border-gray-200'} rounded-xl border p-12 text-center`}>
                            <AlertCircle className={`w-12 h-12 mx-auto mb-3 ${isDark ? 'text-gray-600' : 'text-gray-300'}`} />
                            <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>No complaints found</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Edit Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black bg-opacity-75 z-50 flex items-center justify-center p-4">
                    <div className={`${isDark ? 'bg-[#0f0f0f] border-[#1f1f1f]' : 'bg-white border-gray-200'} border rounded-2xl max-w-md w-full p-6`}>
                        <h2 className={`text-xl font-bold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                            Update Complaint
                        </h2>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>Status</label>
                                <select
                                    value={formData.status}
                                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                                    className={`w-full ${isDark ? 'bg-[#141414] text-white border-[#1f1f1f]' : 'bg-gray-50 text-gray-900 border-gray-200'} border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-600`}
                                >
                                    <option value="OPEN">Open</option>
                                    <option value="IN_PROGRESS">In Progress</option>
                                    <option value="RESOLVED">Resolved</option>
                                </select>
                            </div>
                            <div>
                                <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>Assign To</label>
                                <input
                                    type="text"
                                    value={formData.assignedTo}
                                    onChange={(e) => setFormData({ ...formData, assignedTo: e.target.value })}
                                    placeholder="Enter name or leave empty"
                                    className={`w-full ${isDark ? 'bg-[#141414] text-white border-[#1f1f1f]' : 'bg-gray-50 text-gray-900 border-gray-200'} border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-600`}
                                />
                            </div>
                            <div className={`p-3 rounded-lg ${isDark ? 'bg-blue-500/10 border-blue-500/20' : 'bg-blue-50 border-blue-200'} border`}>
                                <p className={`text-sm ${isDark ? 'text-blue-300' : 'text-blue-800'}`}>
                                    📱 Resident will be notified of this update
                                </p>
                            </div>
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
                                    Update & Notify
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

export default Complaints;

import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Home, Users, AlertCircle, Building2, Menu, X, LogOut, Settings,
    Search, Filter, Edit, Download, ChevronRight, Loader, IndianRupee,
    Bell, Package, FileText, UserPlus, CheckCircle, Clock, FileDown
} from 'lucide-react';

const Maintenance = () => {
    const navigate = useNavigate();
    const [theme, setTheme] = useState('light');
    const [loading, setLoading] = useState(true);
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [maintenance, setMaintenance] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [filterStatus, setFilterStatus] = useState('all');
    const [filterMonth, setFilterMonth] = useState('all');
    const [filterYear, setFilterYear] = useState(new Date().getFullYear().toString());
    const [showModal, setShowModal] = useState(false);
    const [editingRecord, setEditingRecord] = useState(null);
    const [formData, setFormData] = useState({ maintenance: '', status: 'unpaid' });

    useEffect(() => {
        const savedTheme = localStorage.getItem('theme') || 'light';
        setTheme(savedTheme);
    }, []);

    useEffect(() => {
        fetchMaintenance();
    }, [filterStatus, filterMonth, filterYear]);

    const fetchMaintenance = async () => {
        const token = localStorage.getItem('token');
        if (!token) {
            navigate('/login');
            return;
        }

        try {
            setLoading(true);
            let url = 'http://localhost:4000/api/admin/maintenance?';
            if (filterStatus !== 'all') url += `status=${filterStatus}&`;
            if (filterMonth !== 'all') url += `month=${encodeURIComponent(`${filterMonth} ${filterYear}`)}&`;
            // complaints filter removed

            const response = await fetch(url, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const result = await response.json();
            if (result.success) {
                setMaintenance(result.data);
            }
        } catch (error) {
            console.error('Error fetching maintenance:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleLogout = () => {
        localStorage.clear();
        navigate('/login');
    };

    const openEditModal = (record) => {
        setEditingRecord(record);
        setFormData({
            maintenance: record.maintenance,
            status: record.status
        });
        setShowModal(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const token = localStorage.getItem('token');

        try {
            const response = await fetch(`http://localhost:4000/api/admin/maintenance/${editingRecord.id}`, {
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
                fetchMaintenance();

                // If status changed to paid, generate receipt
                if (formData.status === 'paid' && editingRecord.status !== 'paid') {
                    // Receipt generation would happen on backend
                    alert('Payment recorded! E-receipt will be sent to resident.');
                }
            }
        } catch (error) {
            console.error('Error updating maintenance:', error);
        }
    };

    const generateReceipt = (record) => {
        // This would typically generate and download a PDF
        alert(`Generating receipt for ${record.flatNumber} - ${record.month}`);
        // In real implementation, call API endpoint that returns PDF
    };

    const isDark = theme === 'dark';

    const sidebarItems = [
        { icon: Home, label: 'Dashboard', path: '/admin/dashboard' },
        { icon: Building2, label: 'Flats', path: '/flats' },
        { icon: IndianRupee, label: 'Administration', path: '/administration', active: true },
        { icon: AlertCircle, label: 'Complaints', path: '/complaints' },
        { icon: Bell, label: 'Notices', path: '/notices' },
        { icon: Package, label: 'Visitors', path: '/visitors' },
        { icon: UserPlus, label: 'Create Resident', path: '/admin/residents/create' },
        { icon: FileText, label: 'Reports', path: '/reports' },
        { icon: Settings, label: 'Settings', path: '/settings' }
    ];

    const filteredMaintenance = maintenance.filter(record => {
        const matchesSearch = record.flatNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
            record.owner.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesSearch;
    });

    const monthNames = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
    const currentYear = new Date().getFullYear();
    const years = [currentYear - 1, currentYear, currentYear + 1].map(String);

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
                                <span className={`text-sm font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>Administration</span>
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
                        <h1 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>Administration</h1>
                        <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'} mt-1`}>Manage maintenance and monitor flats with complaints</p>
                    </div>

                    {/* Filters */}
                    <div className={`${isDark ? 'bg-[#0f0f0f] border-[#1f1f1f]' : 'bg-white border-gray-200'} rounded-xl border p-4 mb-6`}>
                        <div className="grid md:grid-cols-4 gap-4">
                            <div className="relative">
                                <Search className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
                                <input
                                    type="text"
                                    placeholder="Search by flat number or owner..."
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
                                <option value="paid">Paid</option>
                                <option value="unpaid">Pending</option>
                            </select>

                            <div className="flex items-center gap-2">
                                <select
                                    value={filterMonth}
                                    onChange={(e) => setFilterMonth(e.target.value)}
                                    className={`${isDark ? 'bg-[#141414] text-white border-[#1f1f1f]' : 'bg-gray-50 text-gray-900 border-gray-200'} border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-600`}
                                >
                                    <option value="all">All Months</option>
                                    {monthNames.map(m => (
                                        <option key={m} value={m}>{m}</option>
                                    ))}
                                </select>
                                <select
                                    value={filterYear}
                                    onChange={(e) => setFilterYear(e.target.value)}
                                    className={`${isDark ? 'bg-[#141414] text-white border-[#1f1f1f]' : 'bg-gray-50 text-gray-900 border-gray-200'} border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-600`}
                                >
                                    {years.map(y => (
                                        <option key={y} value={y}>{y}</option>
                                    ))}
                                </select>
                            </div>

                            {/* complaints filter removed */}
                        </div>
                    </div>

                    {/* Maintenance Table */}
                    <div className={`${isDark ? 'bg-[#0f0f0f] border-[#1f1f1f]' : 'bg-white border-gray-200'} rounded-xl border overflow-hidden`}>
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className={isDark ? 'bg-[#141414]' : 'bg-gray-50'}>
                                    <tr>
                                        <th className={`px-6 py-3 text-left text-xs font-medium ${isDark ? 'text-gray-400' : 'text-gray-500'} uppercase tracking-wider`}>Flat</th>
                                        <th className={`px-6 py-3 text-left text-xs font-medium ${isDark ? 'text-gray-400' : 'text-gray-500'} uppercase tracking-wider`}>Owner</th>
                                        <th className={`px-6 py-3 text-left text-xs font-medium ${isDark ? 'text-gray-400' : 'text-gray-500'} uppercase tracking-wider`}>Month</th>
                                        <th className={`px-6 py-3 text-left text-xs font-medium ${isDark ? 'text-gray-400' : 'text-gray-500'} uppercase tracking-wider`}>Amount</th>
                                        <th className={`px-6 py-3 text-left text-xs font-medium ${isDark ? 'text-gray-400' : 'text-gray-500'} uppercase tracking-wider`}>Status</th>
                                        {/* complaints column removed */}
                                        <th className={`px-6 py-3 text-left text-xs font-medium ${isDark ? 'text-gray-400' : 'text-gray-500'} uppercase tracking-wider`}>Paid Date</th>
                                        <th className={`px-6 py-3 text-right text-xs font-medium ${isDark ? 'text-gray-400' : 'text-gray-500'} uppercase tracking-wider`}>Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200 dark:divide-[#1f1f1f]">
                                    {filteredMaintenance.map((record) => (
                                        <tr key={record.id} className={isDark ? 'hover:bg-[#141414]' : 'hover:bg-gray-50'}>
                                            <td className={`px-6 py-4 whitespace-nowrap text-sm font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>{record.flatNumber}</td>
                                            <td className={`px-6 py-4 whitespace-nowrap text-sm ${isDark ? 'text-gray-300' : 'text-gray-900'}`}>{record.owner}</td>
                                            <td className={`px-6 py-4 whitespace-nowrap text-sm ${isDark ? 'text-gray-300' : 'text-gray-900'}`}>{record.month}</td>
                                            <td className={`px-6 py-4 whitespace-nowrap text-sm font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>₹{record.maintenance?.toLocaleString('en-IN')}</td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${record.status === 'paid' ? 'bg-green-100 text-green-800' : 'bg-orange-100 text-orange-800'
                                                    }`}>
                                                    {record.status === 'paid' ? <CheckCircle className="w-3 h-3 mr-1" /> : <Clock className="w-3 h-3 mr-1" />}
                                                    {record.status === 'paid' ? 'Paid' : 'Pending'}
                                                </span>
                                            </td>
                                            {/* complaints cell removed */}
                                            <td className={`px-6 py-4 whitespace-nowrap text-sm ${isDark ? 'text-gray-300' : 'text-gray-900'}`}>
                                                {record.paidAt ? new Date(record.paidAt).toLocaleDateString('en-IN') : '-'}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                <div className="flex items-center justify-end gap-2">
                                                    <button
                                                        onClick={() => openEditModal(record)}
                                                        className="text-blue-600 hover:text-blue-800"
                                                        title="Edit"
                                                    >
                                                        <Edit className="w-4 h-4" />
                                                    </button>
                                                    {record.status === 'paid' && (
                                                        <button
                                                            onClick={() => generateReceipt(record)}
                                                            className="text-green-600 hover:text-green-800"
                                                            title="Download Receipt"
                                                        >
                                                            <FileDown className="w-4 h-4" />
                                                        </button>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {filteredMaintenance.length === 0 && (
                            <div className="text-center py-12">
                                <IndianRupee className={`w-12 h-12 mx-auto mb-3 ${isDark ? 'text-gray-600' : 'text-gray-300'}`} />
                                <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>No maintenance records found</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Edit Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black bg-opacity-75 z-50 flex items-center justify-center p-4">
                    <div className={`${isDark ? 'bg-[#0f0f0f] border-[#1f1f1f]' : 'bg-white border-gray-200'} border rounded-2xl max-w-md w-full p-6`}>
                        <h2 className={`text-xl font-bold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                            Update Maintenance
                        </h2>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>Amount</label>
                                <input
                                    type="number"
                                    required
                                    value={formData.maintenance}
                                    onChange={(e) => setFormData({ ...formData, maintenance: e.target.value })}
                                    className={`w-full ${isDark ? 'bg-[#141414] text-white border-[#1f1f1f]' : 'bg-gray-50 text-gray-900 border-gray-200'} border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-600`}
                                />
                            </div>
                            <div>
                                <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>Payment Status</label>
                                <select
                                    value={formData.status}
                                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                                    className={`w-full ${isDark ? 'bg-[#141414] text-white border-[#1f1f1f]' : 'bg-gray-50 text-gray-900 border-gray-200'} border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-600`}
                                >
                                    <option value="paid">Paid</option>
                                    <option value="unpaid">Pending</option>
                                </select>
                            </div>
                            {formData.status === 'paid' && editingRecord?.status !== 'paid' && (
                                <div className={`p-3 rounded-lg ${isDark ? 'bg-blue-500/10 border-blue-500/20' : 'bg-blue-50 border-blue-200'} border`}>
                                    <p className={`text-sm ${isDark ? 'text-blue-300' : 'text-blue-800'}`}>
                                        📧 E-receipt will be automatically generated and sent to resident
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
                                    Update
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

export default Maintenance;

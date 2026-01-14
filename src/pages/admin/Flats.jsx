import React, { useState, useMemo, useEffect } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import DashboardLayout from '../../components/layout/DashboardLayout';
import Card from '../../components/ui/Card';
import Table from '../../components/ui/Table';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import Modal from '../../components/ui/Modal';
import { Search, Filter, Edit2, CheckCircle, AlertTriangle } from 'lucide-react';
import api from '../../utils/api';

const Flats = () => {
    const { t, language } = useLanguage();
    const [flats, setFlats] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const [isComplaintsOpen, setIsComplaintsOpen] = useState(false);
    const [complaintsFlat, setComplaintsFlat] = useState(null);
    const [flatComplaints, setFlatComplaints] = useState([]);
    const [complaintsLoading, setComplaintsLoading] = useState(false);
    const [complaintsError, setComplaintsError] = useState('');

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalMode, setModalMode] = useState('create');
    const [currentFlat, setCurrentFlat] = useState({
        flatNumber: '',
        owner: '',
        mobile: '',
        maintenance: 0,
        status: 'paid'
    });

    const [isSaving, setIsSaving] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);

    useEffect(() => {
        const token = localStorage.getItem('accessToken') || localStorage.getItem('token');
        if (!token) {
            setError('Please login as admin to view flats');
            setFlats([]);
            return;
        }

        setLoading(true);
        setError('');
        api.get('/api/admin/flats')
            .then(({ data }) => {
                if (!data?.success) throw new Error('Failed to load');
                setFlats(data.data || []);
            })
            .catch((e) => {
                setError(e?.response?.data?.error || e.message || 'Unable to load flats');
                setFlats([]);
            })
            .finally(() => setLoading(false));
    }, []);

    const filteredFlats = useMemo(() => {
        return flats.filter(flat => {
            const matchesSearch =
                flat.flatNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
                flat.owner.toLowerCase().includes(searchTerm.toLowerCase());

            const matchesStatus = statusFilter === 'all' || flat.status === statusFilter;

            return matchesSearch && matchesStatus;
        });
    }, [flats, searchTerm, statusFilter]);

    const handleCreateClick = () => {
        setModalMode('create');
        setCurrentFlat({
            flatNumber: '',
            owner: '',
            mobile: '',
            maintenance: 0,
            status: 'paid',
            activeComplaints: 0
        });
        setIsModalOpen(true);
    };

    const handleEditClick = (flat) => {
        setModalMode('edit');
        setCurrentFlat({ ...flat });
        setIsModalOpen(true);
    };

    const handleSave = async (e) => {
        e.preventDefault();
        const token = localStorage.getItem('accessToken') || localStorage.getItem('token');
        if (!token) {
            alert('Please login as admin');
            return;
        }

        try {
            setIsSaving(true);
            const payload = {
                flatNumber: currentFlat.flatNumber,
                owner: currentFlat.owner,
                mobile: currentFlat.mobile,
                maintenance: Number(currentFlat.maintenance || 0),
                status: currentFlat.status,
            };

            if (modalMode === 'edit') {
                const { data } = await api.put(`/api/admin/flats/${encodeURIComponent(currentFlat.id)}`, payload);
                if (!data?.success) throw new Error(data?.error || 'Unable to save');
                setFlats(prev => prev.map(f => f.id === currentFlat.id ? { ...f, ...data.data } : f));
            } else {
                const { data } = await api.post('/api/admin/flats', payload);
                if (!data?.success) throw new Error(data?.error || 'Unable to create');
                setFlats(prev => [data.data, ...prev]);
            }

            setIsModalOpen(false);
        } catch (err) {
            alert(err?.response?.data?.error || err.message || 'Unable to save flat');
        } finally {
            setIsSaving(false);
        }
    };

    const handleDelete = async () => {
        const ok = window.confirm('Delete this flat and all related records?');
        if (!ok) return;

        try {
            setIsDeleting(true);
            const { data } = await api.delete(`/api/admin/flats/${encodeURIComponent(currentFlat.id)}`);
            if (!data?.success) throw new Error(data?.error || 'Unable to delete');
            setFlats(prev => prev.filter(f => f.id !== currentFlat.id));
            setIsModalOpen(false);
        } catch (err) {
            alert(err?.response?.data?.error || err.message || 'Unable to delete flat');
        } finally {
            setIsDeleting(false);
        }
    };

    const headers = [
        t('flatNumber') || 'Flat No',
        t('owner') || 'Owner Name',
        t('mobile') || 'Mobile',
        t('maintenanceMoney') || 'Maintenance',
        t('status') || 'Status',
        t('complaints') || 'Active Complaints',
        t('actions') || 'Actions'
    ];

    const renderRow = (flat) => (
        <>
            <td className="px-4 py-3 text-sm font-medium text-neutral-900">{flat.flatNumber}</td>
            <td className="px-4 py-3 text-sm text-neutral-600">{flat.owner}</td>
            <td className="px-4 py-3 text-sm text-neutral-600">{flat.mobile || '—'}</td>
            <td className="px-4 py-3 text-sm font-medium text-neutral-900">₹{flat.maintenance.toLocaleString()}</td>
            <td className="px-4 py-3">
                <Badge variant={flat.status === 'paid' ? 'success' : 'danger'}>
                    {flat.status === 'paid' ? 'Paid' : 'Unpaid'}
                </Badge>
            </td>
            <td className="px-4 py-3">
                {flat.activeComplaints > 0 ? (
                    <button
                        type="button"
                        className="inline-flex"
                        onClick={async (e) => {
                            e.preventDefault();
                            const token = localStorage.getItem('accessToken') || localStorage.getItem('token');
                            if (!token) {
                                alert('Please login as admin');
                                return;
                            }
                            setIsComplaintsOpen(true);
                            setComplaintsFlat(flat);
                            setFlatComplaints([]);
                            setComplaintsError('');
                            try {
                                setComplaintsLoading(true);
                                const { data } = await api.get(`/api/admin/flats/${encodeURIComponent(flat.id)}/complaints`);
                                if (!data?.success) throw new Error(data?.error || 'Failed to load');
                                setFlatComplaints(data.data?.complaints || []);
                                setComplaintsFlat(prev => prev ? ({ ...prev, flatNumber: data.data?.flat?.flatNumber || prev.flatNumber }) : prev);
                            } catch (err) {
                                setComplaintsError(err?.response?.data?.error || err.message || 'Unable to load complaints');
                            } finally {
                                setComplaintsLoading(false);
                            }
                        }}
                    >
                        <Badge variant="warning" className="flex w-fit items-center space-x-1 cursor-pointer">
                        <AlertTriangle className="w-3 h-3" />
                        <span>{flat.activeComplaints} Open</span>
                        </Badge>
                    </button>
                ) : (
                    <Badge variant="success" className="flex w-fit items-center space-x-1">
                        <CheckCircle className="w-3 h-3" />
                        <span>None</span>
                    </Badge>
                )}
            </td>
            <td className="px-4 py-3">
                <Button variant="ghost" size="sm" onClick={() => handleEditClick(flat)}>
                    <Edit2 className="w-4 h-4 text-neutral-500 hover:text-primary-600" />
                </Button>
            </td>
        </>
    );

    return (
        <DashboardLayout>
            <div className="space-y-6 animate-fadeIn">
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                    <div>
                        <h1 className={`text-3xl font-bold text-neutral-900 ${language === 'ta' ? 'font-tamil' : ''}`}>
                            {t('flats') || 'Flats Management'}
                        </h1>
                        <p className={`text-neutral-600 mt-1 ${language === 'ta' ? 'font-tamil' : ''}`}>
                            {t('manageFlatsMessage') || 'View residents and maintenance status'}
                        </p>
                    </div>
                    <Button onClick={handleCreateClick}>
                        + Add New Flat
                    </Button>
                </div>

                <Card padding="md" className="flex flex-col md:flex-row gap-4 items-center justify-between shadow-sm border border-neutral-200/60 bg-white/80 backdrop-blur-sm hover:shadow-md transition-shadow duration-300">
                    <div className="w-full md:w-1/3 relative group">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-400 w-5 h-5 group-hover:text-primary-500 transition-colors duration-300" />
                        <Input
                            placeholder="Search by Flat No or Owner..."
                            className="pl-10 w-full"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <div className="flex items-center space-x-3 w-full md:w-auto">
                        <div className="flex items-center space-x-2 bg-neutral-50 px-3 py-2 rounded-lg border border-neutral-200 hover:border-primary-200 transition-colors duration-300">
                            <Filter className="w-4 h-4 text-neutral-500" />
                            <select
                                className="bg-transparent text-sm text-neutral-700 focus:outline-none cursor-pointer"
                                value={statusFilter}
                                onChange={(e) => setStatusFilter(e.target.value)}
                            >
                                <option value="all">All Status</option>
                                <option value="paid">Paid</option>
                                <option value="unpaid">Unpaid</option>
                            </select>
                        </div>
                    </div>
                </Card>

                <Card padding="none" className="overflow-hidden border-0 shadow-lg shadow-neutral-100/50">
                    <Table
                        headers={headers}
                        data={filteredFlats}
                        renderRow={renderRow}
                        emptyMessage={loading ? 'Loading flats…' : (error || 'No flats found matching your search.')}
                    />
                </Card>

                <Modal
                    isOpen={isModalOpen}
                    onClose={() => setIsModalOpen(false)}
                    title={modalMode === 'create' ? 'Add New Flat' : 'Edit Flat Details'}
                >
                    <form onSubmit={handleSave} className="space-y-6">
                        <div className="space-y-4">
                            <Input
                                label="Flat Number"
                                value={currentFlat.flatNumber}
                                disabled={modalMode === 'edit'}
                                onChange={(e) => setCurrentFlat({ ...currentFlat, flatNumber: e.target.value })}
                                required
                                placeholder="e.g. A-101"
                                className="transition-all focus:ring-2 focus:ring-primary-500/20"
                            />

                            <div className="h-px bg-neutral-100 my-4" />

                            <Input
                                label="Owner Name"
                                value={currentFlat.owner}
                                onChange={(e) => setCurrentFlat({ ...currentFlat, owner: e.target.value })}
                                required
                                placeholder="Enter owner's full name"
                            />

                            <Input
                                label="Mobile Number"
                                value={currentFlat.mobile}
                                onChange={(e) => setCurrentFlat({ ...currentFlat, mobile: e.target.value })}
                                required
                                placeholder="e.g. 9894100001"
                            />

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <Input
                                    label="Maintenance (₹)"
                                    type="number"
                                    value={currentFlat.maintenance}
                                    onChange={(e) => setCurrentFlat({ ...currentFlat, maintenance: parseInt(e.target.value || 0) })}
                                    required
                                />
                                <div>
                                    <label className="block text-sm font-semibold text-neutral-700 mb-2">Status</label>
                                    <select
                                        className="w-full px-4 py-2.5 border border-neutral-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-primary-500 appearance-none cursor-pointer hover:border-neutral-300 transition-colors"
                                        value={currentFlat.status}
                                        onChange={(e) => setCurrentFlat({ ...currentFlat, status: e.target.value })}
                                        style={{ backgroundImage: 'none' }}
                                    >
                                        <option value="paid">Paid</option>
                                        <option value="unpaid">Unpaid</option>
                                    </select>
                                </div>
                            </div>
                        </div>

                        <div className="pt-6 border-t border-neutral-100 flex justify-between items-center space-x-3 mt-8">
                            {modalMode === 'edit' ? (
                                <Button
                                    type="button"
                                    variant="danger"
                                    onClick={handleDelete}
                                    isLoading={isDeleting}
                                >
                                    Delete
                                </Button>
                            ) : <div />}
                            <Button
                                type="button"
                                variant="ghost"
                                onClick={() => setIsModalOpen(false)}
                                className="text-neutral-500 hover:text-neutral-700 hover:bg-neutral-50 px-6"
                            >
                                Cancel
                            </Button>
                            <Button
                                type="submit"
                                className="min-w-[140px] shadow-lg shadow-primary-500/20 active:scale-95 transition-transform"
                                isLoading={isSaving}
                            >
                                {modalMode === 'create' ? 'Create Flat' : 'Save Changes'}
                            </Button>
                        </div>
                    </form>
                </Modal>

                <Modal
                    isOpen={isComplaintsOpen}
                    onClose={() => setIsComplaintsOpen(false)}
                    title={`Open Complaints${complaintsFlat?.flatNumber ? ` • ${complaintsFlat.flatNumber}` : ''}`}
                >
                    <div className="space-y-3">
                        {complaintsLoading ? (
                            <div className="text-sm text-neutral-600">Loading…</div>
                        ) : complaintsError ? (
                            <div className="text-sm text-neutral-600">{complaintsError}</div>
                        ) : flatComplaints.length ? (
                            <div className="space-y-3 max-h-[60vh] overflow-y-auto">
                                {flatComplaints.map(c => (
                                    <Card key={c.id} padding="md" className="border border-neutral-200">
                                        <div className="flex items-start justify-between gap-3">
                                            <div className="min-w-0">
                                                <div className="text-xs text-neutral-500">#{c.id}</div>
                                                <div className="font-medium text-neutral-900 break-words">{c.description}</div>
                                                <div className="text-xs text-neutral-500 mt-1">
                                                    Created: {new Date(c.createdAt).toLocaleString('en-IN')}
                                                </div>
                                                <div className="text-xs text-neutral-500 mt-1">
                                                    By: {c.createdBy?.name || '—'}{c.createdBy?.email ? ` (${c.createdBy.email})` : ''}
                                                </div>
                                            </div>
                                            <Badge variant={(c.status === 'RESOLVED' || c.status === 'resolved') ? 'success' : (c.status === 'IN_PROGRESS' || c.status === 'inProgress') ? 'warning' : 'danger'}>
                                                {c.status}
                                            </Badge>
                                        </div>
                                    </Card>
                                ))}
                            </div>
                        ) : (
                            <div className="text-sm text-neutral-600">No open complaints for this flat.</div>
                        )}
                    </div>
                </Modal>
            </div>
        </DashboardLayout>
    );
};

export default Flats;

import React, { useState, useEffect } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import DashboardLayout from '../../components/layout/DashboardLayout';
import Card from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Modal from '../../components/ui/Modal';
import { Plus, Filter, Edit2, Search } from 'lucide-react';
import api from '../../utils/api';

const Complaints = () => {
    const { t, language } = useLanguage();
    const [complaints, setComplaints] = useState([]);
    const [statusFilter, setStatusFilter] = useState('all');
    const [searchTerm, setSearchTerm] = useState('');

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalMode, setModalMode] = useState('create');
    const [currentComplaint, setCurrentComplaint] = useState({
        flatNumber: '',
        description: '',
        assignedTo: '',
        status: 'open'
    });

    const [comments, setComments] = useState([]);
    const [commentText, setCommentText] = useState('');
    const [commentsLoading, setCommentsLoading] = useState(false);

    useEffect(() => {
        const token = localStorage.getItem('accessToken') || localStorage.getItem('token');
        if (!token) {
            setError('Please login as admin to view complaints');
            setComplaints([]);
            return;
        }

        setLoading(true);
        setError('');
        api.get('/api/admin/complaints')
            .then(({ data }) => {
                if (!data?.success) throw new Error('Failed to load');
                setComplaints(data.data || []);
            })
            .catch((e) => {
                setError(e?.response?.data?.error || e.message || 'Unable to load complaints');
                setComplaints([]);
            })
            .finally(() => setLoading(false));
    }, []);

    const uiStatus = (st) => {
        const s = String(st || '').toUpperCase();
        if (s === 'IN_PROGRESS') return 'inProgress';
        if (s === 'RESOLVED') return 'resolved';
        if (s === 'OPEN') return 'open';
        return st;
    };

    const apiStatus = (st) => {
        if (st === 'inProgress') return 'IN_PROGRESS';
        if (st === 'resolved') return 'RESOLVED';
        return 'OPEN';
    };

    const filteredComplaints = complaints.filter(c => {
        const matchesStatus = statusFilter === 'all' || uiStatus(c.status) === statusFilter;
        const matchesSearch =
            c.flatNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
            c.description.toLowerCase().includes(searchTerm.toLowerCase());
        return matchesStatus && matchesSearch;
    });

    const getStatusVariant = (status) => {
        switch (status) {
            case 'open': return 'danger';
            case 'inProgress': return 'warning';
            case 'resolved': return 'success';
            default: return 'default';
        }
    };

    const getStatusLabel = (status) => {
        switch (status) {
            case 'open': return t('open');
            case 'inProgress': return t('inProgress');
            case 'resolved': return t('resolved');
            default: return status;
        }
    };

    const handleCreateClick = () => {
        setModalMode('create');
        setCurrentComplaint({
            flatNumber: '',
            description: '',
            assignedTo: '',
            status: 'open',
        });
        setIsModalOpen(true);
    };

    const handleEditClick = (complaint) => {
        setModalMode('edit');
        setCurrentComplaint({
            ...complaint,
            status: uiStatus(complaint.status),
            assignedTo: complaint.assignedTo || '',
        });
        setComments([]);
        setCommentText('');
        setCommentsLoading(true);
        api.get(`/api/admin/complaints/${encodeURIComponent(complaint.id)}/comments`)
            .then(({ data }) => { if (data?.success) setComments(data.data || []); })
            .catch(() => {})
            .finally(() => setCommentsLoading(false));
        setIsModalOpen(true);
    };

    const handleSave = async (e) => {
        e.preventDefault();

        if (modalMode !== 'edit') {
            alert('Residents raise complaints. Admin can edit existing complaints.');
            return;
        }

        try {
            const { data } = await api.put(`/api/admin/complaints/${encodeURIComponent(currentComplaint.id)}`, {
                description: currentComplaint.description,
                status: apiStatus(currentComplaint.status),
                assignedTo: currentComplaint.assignedTo || null,
            });
            if (!data?.success) throw new Error(data?.error || 'Unable to save');
            setComplaints(prev => prev.map(c => c.id === currentComplaint.id ? data.data : c));
            setIsModalOpen(false);
        } catch (err) {
            alert(err?.response?.data?.error || err.message || 'Unable to save complaint');
        }
    };

    const addComment = async (e) => {
        e.preventDefault();
        if (!commentText.trim()) return;
        try {
            const { data } = await api.post(`/api/admin/complaints/${encodeURIComponent(currentComplaint.id)}/comments`, { text: commentText.trim() });
            if (!data?.success) throw new Error(data?.error || 'Unable to add comment');
            setComments(prev => [data.data, ...prev]);
            setCommentText('');
        } catch (err) {
            alert(err?.response?.data?.error || err.message || 'Unable to add comment');
        }
    };

    return (
        <DashboardLayout>
            <div className="space-y-6 animate-fadeIn">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                        <h1 className={`text-3xl font-bold text-neutral-900 ${language === 'ta' ? 'font-tamil' : ''}`}>
                            {t('complaints')}
                        </h1>
                        <p className="text-neutral-600 mt-1">Manage and track resident complaints</p>
                    </div>
                    <Button onClick={handleCreateClick} className={language === 'ta' ? 'font-tamil' : ''}>
                        <Plus className="w-4 h-4 mr-2" />
                        {t('addComplaint')}
                    </Button>
                </div>

                <Card padding="md" className="flex flex-col md:flex-row gap-4 items-center justify-between shadow-sm border border-neutral-200/60 bg-white/80 backdrop-blur-sm">
                    <div className="w-full md:w-1/3 relative group">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-400 w-5 h-5 group-hover:text-primary-500 transition-colors duration-300" />
                        <Input
                            placeholder="Search description or flat..."
                            className="pl-10 w-full"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>

                    <div className="flex items-center space-x-2 w-full md:w-auto overflow-x-auto pb-2 md:pb-0">
                        <span className={`text-sm font-medium text-neutral-600 whitespace-nowrap ${language === 'ta' ? 'font-tamil' : ''}`}>
                            {t('filterByStatus')}:
                        </span>
                        {['all', 'open', 'inProgress', 'resolved'].map((status) => (
                            <button
                                key={status}
                                onClick={() => setStatusFilter(status)}
                                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${statusFilter === status
                                    ? 'bg-primary-600 text-white shadow-md shadow-primary-500/20'
                                    : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
                                    } ${language === 'ta' ? 'font-tamil' : ''}`}
                            >
                                {status === 'all' ? 'All' : getStatusLabel(status)}
                            </button>
                        ))}
                    </div>
                </Card>

                <div className="grid gap-4">
                    {loading ? (
                        <Card padding="lg" className="text-center py-12"><p className="text-neutral-500">Loading complaints…</p></Card>
                    ) : error ? (
                        <Card padding="lg" className="text-center py-12"><p className="text-neutral-500">{error}</p></Card>
                    ) : filteredComplaints.length > 0 ? (
                        filteredComplaints.map((complaint, index) => (
                            <Card key={complaint.id} padding="lg" hover className="animate-slideInRight" style={{ animationDelay: `${index * 50}ms` }}>
                                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                                    <div className="flex-1">
                                        <div className="flex items-center space-x-3 mb-2">
                                            <span className="font-semibold text-neutral-900 bg-neutral-100 px-2 py-0.5 rounded text-sm">#{complaint.id}</span>
                                            <Badge variant={getStatusVariant(uiStatus(complaint.status))}>
                                                <span className={language === 'ta' ? 'font-tamil' : ''}>
                                                    {getStatusLabel(uiStatus(complaint.status))}
                                                </span>
                                            </Badge>
                                        </div>

                                        <p className="text-neutral-800 mb-3 text-lg font-medium">{complaint.description}</p>

                                        <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm text-neutral-500">
                                            <div className="flex items-center">
                                                <span className={`font-medium text-neutral-700 mr-2 ${language === 'ta' ? 'font-tamil' : ''}`}>
                                                    {t('flatNumber')}:
                                                </span>
                                                {complaint.flatNumber}
                                            </div>
                                            <div className="flex items-center">
                                                <span className={`font-medium text-neutral-700 mr-2 ${language === 'ta' ? 'font-tamil' : ''}`}>
                                                    {t('assignedTo')}:
                                                </span>
                                                {complaint.assignedTo || 'Unassigned'}
                                            </div>
                                            <div className="flex items-center">
                                                <span className="font-medium text-neutral-700 mr-2">Created:</span>
                                                {new Date(complaint.createdAt).toLocaleString('en-IN')}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex sm:flex-col gap-2 pt-4 sm:pt-0 sm:border-l sm:border-neutral-100 sm:pl-4">
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => handleEditClick(complaint)}
                                            className="text-neutral-500 hover:text-primary-600 justify-start"
                                        >
                                            <Edit2 className="w-4 h-4 mr-2" />
                                            {t('edit')}
                                        </Button>
                                    </div>
                                </div>
                            </Card>
                        ))
                    ) : (
                        <Card padding="lg" className="text-center py-12">
                            <p className="text-neutral-500">No complaints found matching your search.</p>
                        </Card>
                    )}
                </div>

                <Modal
                    isOpen={isModalOpen}
                    onClose={() => setIsModalOpen(false)}
                    title={modalMode === 'create' ? t('addComplaint') : 'Edit Complaint'}
                >
                    <form onSubmit={handleSave} className="space-y-6">
                        <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <Input
                                    label={t('flatNumber')}
                                    value={currentComplaint.flatNumber}
                                    onChange={(e) => setCurrentComplaint({ ...currentComplaint, flatNumber: e.target.value })}
                                    required
                                    placeholder="e.g. A-101"
                                    disabled={true}
                                />
                                <div>
                                    <label className="block text-sm font-semibold text-neutral-700 mb-2">{t('status')}</label>
                                    <select
                                        className="w-full px-4 py-2.5 border border-neutral-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-primary-500 appearance-none cursor-pointer"
                                        value={currentComplaint.status}
                                        onChange={(e) => setCurrentComplaint({ ...currentComplaint, status: e.target.value })}
                                    >
                                        <option value="open">{t('open')}</option>
                                        <option value="inProgress">{t('inProgress')}</option>
                                        <option value="resolved">{t('resolved')}</option>
                                    </select>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="block text-sm font-semibold text-neutral-700">{t('description')}</label>
                                <textarea
                                    className="w-full px-4 py-3 border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 min-h-[100px] resize-none"
                                    value={currentComplaint.description}
                                    onChange={(e) => setCurrentComplaint({ ...currentComplaint, description: e.target.value })}
                                    required
                                    placeholder="Describe the issue..."
                                />
                            </div>

                            <Input
                                label={t('assignedTo')}
                                value={currentComplaint.assignedTo}
                                onChange={(e) => setCurrentComplaint({ ...currentComplaint, assignedTo: e.target.value })}
                                placeholder="e.g. Electrician, Security"
                            />

                            {modalMode === 'edit' ? (
                                <div className="pt-4 border-t border-neutral-100 space-y-3">
                                    <div className="text-sm font-semibold text-neutral-700">Comments</div>
                                    <form onSubmit={addComment} className="flex gap-2">
                                        <Input
                                            value={commentText}
                                            onChange={(e) => setCommentText(e.target.value)}
                                            placeholder="Add a comment…"
                                        />
                                        <Button type="submit">Post</Button>
                                    </form>
                                    {commentsLoading ? (
                                        <div className="text-sm text-neutral-500">Loading comments…</div>
                                    ) : comments.length ? (
                                        <div className="space-y-2 max-h-48 overflow-y-auto">
                                            {comments.map(cm => (
                                                <div key={cm.id} className="p-3 bg-neutral-50 rounded-lg border border-neutral-200">
                                                    <div className="text-xs text-neutral-500 flex justify-between gap-2">
                                                        <span>{cm.author?.name || 'User'}{cm.author?.role ? ` • ${cm.author.role}` : ''}</span>
                                                        <span>{new Date(cm.createdAt).toLocaleString('en-IN')}</span>
                                                    </div>
                                                    <div className="text-sm text-neutral-800 mt-1">{cm.text}</div>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="text-sm text-neutral-500">No comments yet.</div>
                                    )}
                                </div>
                            ) : null}
                        </div>

                        <div className="pt-6 border-t border-neutral-100 flex justify-end space-x-3 mt-8">
                            <Button
                                type="button"
                                variant="ghost"
                                onClick={() => setIsModalOpen(false)}
                                className="text-neutral-500 hover:text-neutral-700 hover:bg-neutral-50 px-6"
                            >
                                {t('cancel')}
                            </Button>
                            <Button
                                type="submit"
                                className="min-w-[140px] shadow-lg shadow-primary-500/20 active:scale-95 transition-transform"
                            >
                                {modalMode === 'create' ? 'Post Complaint' : 'Save Changes'}
                            </Button>
                        </div>
                    </form>
                </Modal>
            </div>
        </DashboardLayout>
    );
};

export default Complaints;

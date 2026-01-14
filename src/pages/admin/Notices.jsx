import React, { useState, useEffect } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import DashboardLayout from '../../components/layout/DashboardLayout';
import Card from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Modal from '../../components/ui/Modal';
import { Plus, AlertTriangle, Edit2, Calendar } from 'lucide-react';
import api from '../../utils/api';

const Notices = () => {
  const { t, language } = useLanguage();
  const [notices, setNotices] = useState([]);
  const [statusFilter, setStatusFilter] = useState('all');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState('create');
  const [currentNotice, setCurrentNotice] = useState({
    title: '',
    date: '',
    type: 'general',
    content: '',
    status: 'upcoming',
    urgent: false,
    postedBy: 'Admin',
  });

  useEffect(() => {
    const token = localStorage.getItem('accessToken') || localStorage.getItem('token');
    if (!token) {
      setError('Please login as admin to view notices');
      setNotices([]);
      return;
    }
    setLoading(true);
    setError('');
    api.get('/api/notices')
      .then(({ data }) => { if (data?.success) setNotices(data.data || []); })
      .catch((e) => setError(e?.response?.data?.error || e.message || 'Unable to load notices'))
      .finally(() => setLoading(false));
  }, []);

  const uiStatus = (st) => {
    const s = String(st || '').toUpperCase();
    if (s === 'UPCOMING') return 'upcoming';
    if (s === 'ONGOING') return 'upcoming';
    if (s === 'COMPLETED') return 'completed';
    return st;
  };

  const apiStatus = (st) => {
    if (st === 'completed') return 'COMPLETED';
    if (st === 'delayed') return 'ONGOING';
    return 'UPCOMING';
  };

  const filteredNotices = notices.filter((n) => statusFilter === 'all' || uiStatus(n.status) === statusFilter);

  const getStatusColor = (status) => {
    switch (status) {
      case 'upcoming':
        return 'text-blue-600 bg-blue-50';
      case 'completed':
        return 'text-green-600 bg-green-50';
      case 'delayed':
        return 'text-orange-600 bg-orange-50';
      default:
        return 'text-neutral-600 bg-neutral-100';
    }
  };

  const handleCreateClick = () => {
    setModalMode('create');
    setCurrentNotice({
      title: '',
      date: new Date().toISOString().split('T')[0],
      type: 'general',
      content: '',
      status: 'upcoming',
      urgent: false,
      postedBy: 'Admin',
    });
    setIsModalOpen(true);
  };

  const handleEditClick = (notice) => {
    setModalMode('edit');
    setCurrentNotice({
      ...notice,
      content: notice.description,
      status: uiStatus(notice.status),
      urgent: false,
      postedBy: 'Admin',
      postedOn: notice.createdAt ? new Date(notice.createdAt).toISOString().split('T')[0] : notice.postedOn,
    });
    setIsModalOpen(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        title: currentNotice.title,
        description: currentNotice.content,
        status: apiStatus(currentNotice.status),
        date: currentNotice.date,
      };
      if (modalMode === 'edit') {
        const { data } = await api.put(`/api/admin/notices/${encodeURIComponent(currentNotice.id)}`, payload);
        if (!data?.success) throw new Error(data?.error || 'Unable to save');
        setNotices(prev => prev.map(n => n.id === currentNotice.id ? data.data : n));
      } else {
        const { data } = await api.post('/api/admin/notices', payload);
        if (!data?.success) throw new Error(data?.error || 'Unable to create');
        setNotices(prev => [data.data, ...prev]);
      }
      setIsModalOpen(false);
    } catch (err) {
      alert(err?.response?.data?.error || err.message || 'Unable to save notice');
    }
  };

  const handleDelete = async () => {
    const ok = window.confirm('Delete this notice?');
    if (!ok) return;
    try {
      const { data } = await api.delete(`/api/admin/notices/${encodeURIComponent(currentNotice.id)}`);
      if (!data?.success) throw new Error(data?.error || 'Unable to delete');
      setNotices(prev => prev.filter(n => n.id !== currentNotice.id));
      setIsModalOpen(false);
    } catch (err) {
      alert(err?.response?.data?.error || err.message || 'Unable to delete notice');
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6 animate-fadeIn">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className={`text-3xl font-bold text-neutral-900 ${language === 'ta' ? 'font-tamil' : ''}`}>{t('noticeBoard')}</h1>
            <p className="text-neutral-600 mt-1">Important announcements and updates</p>
          </div>
          <Button onClick={handleCreateClick} className={language === 'ta' ? 'font-tamil' : ''}>
            <Plus className="w-4 h-4 mr-2" />
            {t('addNotice')}
          </Button>
        </div>

        <Card
          padding="md"
          className="flex items-center space-x-2 bg-white/80 backdrop-blur-sm shadow-sm border border-neutral-200/60 overflow-x-auto"
        >
          <span className="text-sm font-medium text-neutral-600 whitespace-nowrap">Filter Status:</span>
          {['all', 'upcoming', 'completed', 'delayed'].map((status) => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors capitalize whitespace-nowrap ${
                statusFilter === status
                  ? 'bg-primary-600 text-white shadow-md shadow-primary-500/20'
                  : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
              }`}
            >
              {status}
            </button>
          ))}
        </Card>

        <div className="grid gap-6">
          {loading ? (
            <p className="text-center text-neutral-500 py-10">Loading notices…</p>
          ) : error ? (
            <p className="text-center text-neutral-500 py-10">{error}</p>
          ) : filteredNotices.length > 0 ? (
            filteredNotices.map((notice, index) => (
              <Card
                key={notice.id}
                padding="lg"
                hover
                className={`animate-slideInRight ${notice.urgent ? 'border-l-4 border-l-red-500 shadow-medium' : 'border-l-4 border-l-transparent'}`}
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <div className="flex flex-col sm:flex-row gap-4 justify-between">
                  <div className="flex-1 space-y-3">
                    <div className="flex flex-wrap items-center gap-2">
                      {notice.urgent && (
                        <Badge variant="danger" className="flex items-center space-x-1">
                          <AlertTriangle className="w-3 h-3" />
                          <span>Urgent</span>
                        </Badge>
                      )}
                      <span className={`px-2 py-0.5 rounded text-xs font-semibold uppercase tracking-wide ${getStatusColor(uiStatus(notice.status))}`}>
                        {uiStatus(notice.status)}
                      </span>
                      <span className="text-sm text-neutral-500 flex items-center">
                        <Calendar className="w-3 h-3 mr-1" />
                        {new Date(notice.date).toISOString().split('T')[0]}
                      </span>
                    </div>

                    <div>
                      <h3 className="text-xl font-bold text-neutral-900 mb-1">{notice.title}</h3>
                      <p className="text-neutral-700 leading-relaxed">{notice.description}</p>
                    </div>

                    <div className="flex items-center gap-4 text-xs text-neutral-500 pt-2">
                      <span>Posted on: {notice.createdAt ? new Date(notice.createdAt).toISOString().split('T')[0] : (notice.postedOn || '—')}</span>
                      <span>By: {notice.postedBy}</span>
                    </div>
                  </div>

                  <div className="flex sm:flex-col gap-2 pt-2 sm:pt-0 sm:pl-4 sm:border-l sm:border-neutral-100">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleEditClick(notice)}
                      className="text-neutral-500 hover:text-primary-600 justify-start"
                    >
                      <Edit2 className="w-4 h-4 mr-2" />
                      Edit
                    </Button>
                  </div>
                </div>
              </Card>
            ))
          ) : (
            <p className="text-center text-neutral-500 py-10">No notices found.</p>
          )}
        </div>

        <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={modalMode === 'create' ? 'Add New Notice' : 'Edit Notice Details'}>
          <form onSubmit={handleSave} className="space-y-6">
            <div className="space-y-4">
              <Input label="Title" value={currentNotice.title} onChange={(e) => setCurrentNotice({ ...currentNotice, title: e.target.value })} required placeholder="e.g. Annual General Meeting" />

              <div className="grid grid-cols-2 gap-4">
                <Input label="Date" type="date" value={currentNotice.date} onChange={(e) => setCurrentNotice({ ...currentNotice, date: e.target.value })} required />
                <div>
                  <label className="block text-sm font-semibold text-neutral-700 mb-2">Status</label>
                  <select className="w-full px-4 py-2.5 border border-neutral-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-primary-500 appearance-none cursor-pointer" value={currentNotice.status} onChange={(e) => setCurrentNotice({ ...currentNotice, status: e.target.value })}>
                    <option value="upcoming">Upcoming</option>
                    <option value="completed">Completed</option>
                    <option value="delayed">Delayed</option>
                  </select>
                </div>
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-semibold text-neutral-700">Content</label>
                <textarea className="w-full px-4 py-3 border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 min-h-[100px] resize-none" value={currentNotice.content} onChange={(e) => setCurrentNotice({ ...currentNotice, content: e.target.value })} required placeholder="Write the notice details here..." />
              </div>

              <div className="flex items-center space-x-2">
                <input type="checkbox" id="urgent" checked={currentNotice.urgent} onChange={(e) => setCurrentNotice({ ...currentNotice, urgent: e.target.checked })} className="w-4 h-4 text-primary-600 rounded focus:ring-primary-500 border-gray-300" />
                <label htmlFor="urgent" className="text-sm font-medium text-neutral-700">Mark as Urgent</label>
              </div>
            </div>

            <div className="pt-6 border-t border-neutral-100 flex justify-between items-center space-x-3 mt-8">
              {modalMode === 'edit' ? (
                <Button type="button" variant="danger" onClick={handleDelete}>Delete</Button>
              ) : <div />}
              <Button type="button" variant="ghost" onClick={() => setIsModalOpen(false)} className="text-neutral-500 hover:text-neutral-700 hover:bg-neutral-50 px-6">
                Cancel
              </Button>
              <Button type="submit" className="min-w[140px] shadow-lg shadow-primary-500/20 active:scale-95 transition-transform">
                {modalMode === 'create' ? 'Post Notice' : 'Save Changes'}
              </Button>
            </div>
          </form>
        </Modal>
      </div>
    </DashboardLayout>
  );
};

export default Notices;

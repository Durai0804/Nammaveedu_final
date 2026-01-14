import React, { useState, useEffect } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import DashboardLayout from '../../components/layout/DashboardLayout';
import Card from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Modal from '../../components/ui/Modal';
import { Plus, UserPlus, LogOut, Clock, Search, Filter } from 'lucide-react';
import api from '../../utils/api';

const Visitors = () => {
  const { t, language } = useLanguage();
  const [visitors, setVisitors] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [preApprovals, setPreApprovals] = useState([]);
  const [preLoading, setPreLoading] = useState(false);
  const [preError, setPreError] = useState('');

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newVisitor, setNewVisitor] = useState({
    name: '',
    phone: '',
    flatNumber: '',
    purpose: 'Delivery',
    memberCount: 1,
  });

  useEffect(() => {
    const token = localStorage.getItem('accessToken') || localStorage.getItem('token');
    if (!token) {
      setError('Please login as admin to view visitors');
      setVisitors([]);
      return;
    }
    setLoading(true);
    setError('');
    api.get('/api/admin/visitors')
      .then(({ data }) => {
        if (!data?.success) throw new Error('Failed to load');
        setVisitors(data.data || []);
      })
      .catch((e) => {
        setError(e?.response?.data?.error || e.message || 'Unable to load visitors');
        setVisitors([]);
      })
      .finally(() => setLoading(false));

    setPreLoading(true);
    setPreError('');
    api.get('/api/admin/pre-approvals')
      .then(({ data }) => { if (data?.success) setPreApprovals(data.data || []); else setPreError('Failed to load pre-approvals'); })
      .catch((e) => setPreError(e?.response?.data?.error || e.message || 'Unable to load pre-approvals'))
      .finally(() => setPreLoading(false));
  }, []);

  const handleCheckinPreApproval = async (id) => {
    const token = localStorage.getItem('accessToken') || localStorage.getItem('token');
    if (!token) return;
    try {
      const { data } = await api.post(`/api/admin/pre-approvals/${encodeURIComponent(id)}/checkin`);
      if (!data?.success) throw new Error('Unable to check-in');
      // remove from pre-approvals and add to visitors list (at top)
      setPreApprovals(prev => prev.filter(p => String(p.id) !== String(id)));
      setVisitors(prev => [data.data, ...prev]);
    } catch (err) {
      alert(err?.response?.data?.error || err.message || 'Unable to check-in pre-approved visitor');
    }
  };

  const filteredVisitors = visitors.filter((v) => {
    const matchesSearch =
      v.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      v.flatNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      v.purpose?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || v.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleEntryClick = () => {
    setNewVisitor({
      name: '',
      phone: '',
      flatNumber: '',
      purpose: 'Delivery',
      memberCount: 1,
    });
    setIsModalOpen(true);
  };

  const handleAddVisitor = (e) => {
    e.preventDefault();
    const token = localStorage.getItem('accessToken') || localStorage.getItem('token');
    if (!token) {
      alert('Please login as admin');
      return;
    }

    api.post('/api/admin/visitors', {
      name: newVisitor.name,
      phone: newVisitor.phone || undefined,
      flatNumber: newVisitor.flatNumber,
      purpose: newVisitor.purpose,
      memberCount: Number(newVisitor.memberCount || 1),
    })
      .then(({ data }) => {
        if (!data?.success) throw new Error('Unable to log');
        setVisitors(prev => [data.data, ...prev]);
        setIsModalOpen(false);
      })
      .catch((err) => alert(err?.response?.data?.error || err.message || 'Unable to log visitor'));
  };

  const handleExitClick = (id) => {
    const token = localStorage.getItem('accessToken') || localStorage.getItem('token');
    if (!token) return;
    api.put(`/api/admin/visitors/${encodeURIComponent(id)}/checkout`)
      .then(({ data }) => {
        if (!data?.success) throw new Error('Unable to checkout');
        setVisitors(prev => prev.map(v => (v.id === id ? data.data : v)));
      })
      .catch((err) => alert(err?.response?.data?.error || err.message || 'Unable to checkout'));
  };

  return (
    <DashboardLayout>
      <div className="space-y-6 animate-fadeIn">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className={`text-3xl font-bold text-neutral-900 ${language === 'ta' ? 'font-tamil' : ''}`}>
              {t('visitorLog') || 'Visitor Log'}
            </h1>
            <p className="text-neutral-600 mt-1">Track entries and exits for security</p>
          </div>
          <Button onClick={handleEntryClick} className={`shadow-lg shadow-primary-500/20 ${language === 'ta' ? 'font-tamil' : ''}`}>
            <UserPlus className="w-4 h-4 mr-2" />
            {t('addVisitor') || 'New Entry'}
          </Button>
        </div>

        <Card padding="md" className="flex flex-col md:flex-row gap-4 items-center justify-between shadow-sm border border-neutral-200/60 bg-white/80 backdrop-blur-sm">
          <div className="w-full md:w-1/3 relative group">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-400 w-5 h-5 group-hover:text-primary-500 transition-colors duration-300" />
            <Input
              placeholder="Search name, flat, or purpose..."
              className="pl-10 w-full"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="flex items-center space-x-2 w-full md:w-auto">
            <span className="text-sm font-medium text-neutral-600 whitespace-nowrap">Filter:</span>
            <div className="flex bg-neutral-100 p-1 rounded-lg">
              {['all', 'in', 'out'].map((status) => (
                <button
                  key={status}
                  onClick={() => setStatusFilter(status)}
                  className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${
                    statusFilter === status ? 'bg-white text-primary-600 shadow-sm' : 'text-neutral-500 hover:text-neutral-700'
                  } capitalize`}
                >
                  {status}
                </button>
              ))}
            </div>
          </div>
        </Card>

        <div className="grid gap-4">
          <Card padding="lg">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold text-neutral-900">Pre-approved Visitors</h2>
                <p className="text-sm text-neutral-600">Residents' pre-approvals (from DB)</p>
              </div>
              <Badge variant="neutral">{preApprovals.length}</Badge>
            </div>
            <div className="mt-4 space-y-2 max-h-64 overflow-y-auto">
              {preLoading ? (
                <p className="text-sm text-neutral-500">Loading pre-approvals…</p>
              ) : preError ? (
                <p className="text-sm text-neutral-500">{preError}</p>
              ) : preApprovals.length ? (
                preApprovals.map(p => (
                  <div key={p.id} className="flex items-start justify-between p-3 bg-neutral-50 rounded-lg border border-neutral-200">
                    <div className="text-sm">
                      <div className="font-medium text-neutral-900">{p.name} • {p.purpose}</div>
                      <div className="text-neutral-600">Flat: {p.flatNumber}</div>
                      <div className="text-neutral-500">Expected: {p.expectedTime || 'Anytime'} • Created: {new Date(p.createdAt).toLocaleString('en-IN')}</div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="info">Pre-approved</Badge>
                      <Button size="sm" onClick={() => handleCheckinPreApproval(p.id)}>Check-in</Button>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-sm text-neutral-500">No pre-approvals yet.</p>
              )}
            </div>
          </Card>

          {loading ? (
            <div className="text-center py-12 bg-neutral-50 rounded-xl border border-dashed border-neutral-300">
              <p className="text-neutral-500">Loading visitors…</p>
            </div>
          ) : error ? (
            <div className="text-center py-12 bg-neutral-50 rounded-xl border border-dashed border-neutral-300">
              <p className="text-neutral-500">{error}</p>
            </div>
          ) : filteredVisitors.length > 0 ? (
            filteredVisitors.map((visitor, index) => (
              <Card
                key={visitor.id}
                padding="lg"
                hover
                className={`animate-slideInRight border-l-4 ${visitor.status === 'in' ? 'border-l-green-500' : 'border-l-neutral-300'}`}
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <h3 className="text-lg font-bold text-neutral-900">{visitor.name}</h3>
                      <Badge variant={visitor.status === 'in' ? 'success' : 'neutral'}>
                        {visitor.status === 'in' ? 'Inside' : 'Checked Out'}
                      </Badge>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-neutral-600">
                      <div>
                        <span className="block text-xs font-semibold text-neutral-400 uppercase tracking-wider">Purpose</span>
                        <span className="font-medium text-neutral-800">{visitor.purpose || 'Visit'}</span>
                      </div>
                      <div>
                        <span className="block text-xs font-semibold text-neutral-400 uppercase tracking-wider">Flat</span>
                        <span className="font-medium text-neutral-800">{visitor.flatNumber}</span>
                      </div>
                      <div>
                        <span className="block text-xs font-semibold text-neutral-400 uppercase tracking-wider">In Time</span>
                        <span className="font-medium text-neutral-800 flex items-center">
                          <Clock className="w-3 h-3 mr-1 text-green-600" />
                          {visitor.inTime}
                        </span>
                      </div>
                      <div>
                        <span className="block text-xs font-semibold text-neutral-400 uppercase tracking-wider">Out Time</span>
                        <span className="font-medium text-neutral-800">{visitor.outTime}</span>
                      </div>
                    </div>
                  </div>

                  {visitor.status === 'in' && (
                    <Button
                      variant="outline"
                      onClick={() => handleExitClick(visitor.id)}
                      className="border-red-200 text-red-600 hover:bg-red-50 hover:border-red-300 w-full sm:w-auto"
                    >
                      <LogOut className="w-4 h-4 mr-2" />
                      Log Exit
                    </Button>
                  )}
                </div>
              </Card>
            ))
          ) : (
            <div className="text-center py-12 bg-neutral-50 rounded-xl border border-dashed border-neutral-300">
              <p className="text-neutral-500">No visitor records found.</p>
            </div>
          )}
        </div>

        <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="New Visitor Entry">
          <form onSubmit={handleAddVisitor} className="space-y-6">
            <Input label="Visitor Name" value={newVisitor.name} onChange={(e) => setNewVisitor({ ...newVisitor, name: e.target.value })} required placeholder="e.g. Swiggy Delivery" />

            <div className="grid grid-cols-2 gap-4">
              <Input label="Phone Number (Optional)" value={newVisitor.phone} onChange={(e) => setNewVisitor({ ...newVisitor, phone: e.target.value })} placeholder="98765..." />
              <Input label="Member Count" type="number" min="1" value={newVisitor.memberCount} onChange={(e) => setNewVisitor({ ...newVisitor, memberCount: parseInt(e.target.value) })} required />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <Input label="Flat Number" value={newVisitor.flatNumber} onChange={(e) => setNewVisitor({ ...newVisitor, flatNumber: e.target.value })} required placeholder="e.g. A-101" />
              <div>
                <label className="block text-sm font-semibold text-neutral-700 mb-2">Purpose</label>
                <select className="w-full px-4 py-2.5 border border-neutral-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-primary-500 appearance-none cursor-pointer" value={newVisitor.purpose} onChange={(e) => setNewVisitor({ ...newVisitor, purpose: e.target.value })}>
                  <option value="Delivery">Delivery</option>
                  <option value="Guest">Guest</option>
                  <option value="Cab">Cab/Taxi</option>
                  <option value="Maintenance">Maintenance/Service</option>
                  <option value="Other">Other</option>
                </select>
              </div>
            </div>

            <div className="pt-6 border-t border-neutral-100 flex justify-end space-x-3 mt-8">
              <Button type="button" variant="ghost" onClick={() => setIsModalOpen(false)} className="text-neutral-500 hover:text-neutral-700 hover:bg-neutral-50 px-6">
                Cancel
              </Button>
              <Button type="submit" className="min-w-[140px] shadow-lg shadow-primary-500/20 active:scale-95 transition-transform">
                Log Entry
              </Button>
            </div>
          </form>
        </Modal>
      </div>
    </DashboardLayout>
  );
};

export default Visitors;

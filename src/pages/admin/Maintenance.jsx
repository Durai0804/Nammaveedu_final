import React, { useState, useMemo, useEffect } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import DashboardLayout from '../../components/layout/DashboardLayout';
import Card from '../../components/ui/Card';
import Table from '../../components/ui/Table';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Modal from '../../components/ui/Modal';
import { Download, Search, Filter, Edit2, FileText } from 'lucide-react';
import api from '../../utils/api';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

const Maintenance = () => {
  const { t, language } = useLanguage();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [monthFilter, setMonthFilter] = useState('all');
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingRecord, setEditingRecord] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem('accessToken') || localStorage.getItem('token');
    if (!token) {
      setError('Please login as admin to view maintenance');
      setRecords([]);
      return;
    }

    setLoading(true);
    setError('');
    api.get('/api/admin/maintenance', { params: { status: statusFilter, q: searchTerm, month: monthFilter } })
      .then(({ data }) => {
        if (!data?.success) throw new Error('Failed to load');
        setRecords(data.data || []);
      })
      .catch((e) => {
        setError(e?.response?.data?.error || e.message || 'Unable to load maintenance');
        setRecords([]);
      })
      .finally(() => setLoading(false));
  }, [monthFilter, searchTerm, statusFilter]);

  const filteredRecords = useMemo(() => records, [records]);

  const handleEditClick = (record) => {
    setEditingRecord({ ...record });
    setIsEditModalOpen(true);
  };

  const handleSave = (e) => {
    e.preventDefault();
    const token = localStorage.getItem('accessToken') || localStorage.getItem('token');
    if (!token) {
      alert('Please login as admin');
      return;
    }

    api.put(`/api/admin/maintenance/${encodeURIComponent(editingRecord.id)}`, {
      maintenance: Number(editingRecord.maintenance || 0),
      status: editingRecord.status,
    })
      .then(({ data }) => {
        if (!data?.success) throw new Error('Update failed');
        setRecords(prev => prev.map(r => (r.id === editingRecord.id ? { ...r, ...data.data } : r)));
        setIsEditModalOpen(false);
      })
      .catch((err) => {
        alert(err?.response?.data?.error || err.message || 'Unable to update record');
      });
  };

  const generateReceipt = (record) => {
    const doc = new jsPDF();

    doc.setFontSize(22);
    doc.setTextColor(13, 148, 136);
    doc.text('NammaVeedu', 105, 20, { align: 'center' });

    doc.setFontSize(12);
    doc.setTextColor(87, 83, 78);
    doc.text('Apartment Maintenance Receipt', 105, 30, { align: 'center' });

    doc.setDrawColor(229, 231, 235);
    doc.line(20, 35, 190, 35);

    doc.setFontSize(10);
    doc.setTextColor(0, 0, 0);

    const receiptNo = `RCP-${String(record.id).slice(-6).toUpperCase()}-${new Date(record.paidAt || Date.now()).getFullYear()}${String(new Date(record.paidAt || Date.now()).getMonth() + 1).padStart(2, '0')}`;
    const date = new Date(record.paidAt || Date.now()).toLocaleDateString('en-IN');

    doc.text(`Receipt No: ${receiptNo}`, 20, 50);
    doc.text(`Date: ${date}`, 150, 50);

    autoTable(doc, {
      startY: 60,
      head: [['Description', 'Details']],
      body: [
        ['Flat Number', record.flatNumber],
        ['Resident Name', record.owner],
        ['Month', record.month || '—'],
        ['Payment Status', record.status.toUpperCase()],
        ['Maintenance Amount', `Rs. ${record.maintenance.toLocaleString()}`],
      ],
      theme: 'striped',
      headStyles: { fillColor: [13, 148, 136] },
      styles: { fontSize: 10, cellPadding: 5 },
    });

    const finalY = doc.lastAutoTable.finalY || 100;

    doc.setFontSize(10);
    doc.text('Thank you for your timely payment.', 105, finalY + 20, { align: 'center' });

    doc.setFontSize(8);
    doc.setTextColor(150, 150, 150);
    doc.text('This is a computer-generated receipt.', 105, finalY + 30, { align: 'center' });

    doc.save(`Receipt_${record.flatNumber}_${record.month || 'Jan2026'}.pdf`);
  };

  const headers = [
    t('flatNumber') || 'Flat No',
    t('owner') || 'Owner',
    t('mobile') || 'Mobile',
    t('month') || 'Month',
    t('amount') || 'Amount',
    t('status') || 'Status',
    t('actions') || 'Actions',
  ];

  const renderRow = (record) => (
    <>
      <td className="px-4 py-3 text-sm font-medium text-neutral-900">{record.flatNumber}</td>
      <td className="px-4 py-3 text-sm text-neutral-600">{record.owner}</td>
      <td className="px-4 py-3 text-sm text-neutral-600">{record.mobile || '—'}</td>
      <td className="px-4 py-3 text-sm text-neutral-600">{record.month || '—'}</td>
      <td className="px-4 py-3 text-sm font-medium text-neutral-900">₹{record.maintenance.toLocaleString('en-IN')}</td>
      <td className="px-4 py-3">
        <Badge variant={record.status === 'paid' ? 'success' : 'danger'}>
          {record.status === 'paid' ? 'Paid' : 'Unpaid'}
        </Badge>
      </td>
      <td className="px-4 py-3 flex items-center space-x-2">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => handleEditClick(record)}
          title="Edit Record"
        >
          <Edit2 className="w-4 h-4 text-neutral-500 hover:text-primary-600" />
        </Button>
        {record.status === 'paid' && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => generateReceipt(record)}
            className="text-primary-600 hover:text-primary-700 hover:bg-primary-50"
            title="Download Receipt"
          >
            <Download className="w-4 h-4 mr-1" />
            <span className="hidden sm:inline">Receipt</span>
          </Button>
        )}
      </td>
    </>
  );

  return (
    <DashboardLayout>
      <div className="space-y-6 animate-fadeIn">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <h1 className={`text-3xl font-bold text-neutral-900 ${language === 'ta' ? 'font-tamil' : ''}`}>
              {t('maintenance') || 'Maintenance'}
            </h1>
            <p className={`text-neutral-600 mt-1 ${language === 'ta' ? 'font-tamil' : ''}`}>
              Track payments and generate receipts
            </p>
          </div>
        </div>

        <Card padding="md" className="flex flex-col md:flex-row gap-4 items-center justify-between shadow-sm border border-neutral-200/60 bg-white/80 backdrop-blur-sm">
          <div className="w-full md:w-1/3 relative group">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-400 w-5 h-5 group-hover:text-primary-500 transition-colors duration-300" />
            <Input
              placeholder="Search by Flat or Owner..."
              className="pl-10 w-full"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex items-center space-x-3 w-full md:w-auto">
            <div className="flex items-center space-x-2 bg-neutral-50 px-3 py-2 rounded-lg border border-neutral-200 hover:border-primary-200 transition-colors duration-300">
              <FileText className="w-4 h-4 text-neutral-500" />
              <select
                className="bg-transparent text-sm text-neutral-700 focus:outline-none cursor-pointer"
                value={monthFilter}
                onChange={(e) => setMonthFilter(e.target.value)}
              >
                <option value="all">All Months</option>
                {Array.from(new Set(records.map(r => r.month).filter(Boolean))).map(m => (
                  <option key={m} value={m}>{m}</option>
                ))}
              </select>
            </div>
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
            data={filteredRecords}
            renderRow={renderRow}
            emptyMessage={loading ? 'Loading maintenance…' : (error || 'No maintenance records found.')}
          />
        </Card>

        <Modal
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          title="Edit Maintenance Record"
        >
          {editingRecord && (
            <form onSubmit={handleSave} className="space-y-6">
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <Input label="Flat Number" value={editingRecord.flatNumber} disabled className="bg-neutral-100" />
                  <Input label="Month" value={editingRecord.month || 'Current'} disabled className="bg-neutral-100" />
                </div>
                <Input label="Owner Name" value={editingRecord.owner} disabled className="bg-neutral-100" />

                <div className="h-px bg-neutral-100 my-2" />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input
                    label="Amount (₹)"
                    type="number"
                    value={editingRecord.maintenance}
                    onChange={(e) => setEditingRecord({ ...editingRecord, maintenance: parseInt(e.target.value || 0) })}
                    required
                  />
                  <div>
                    <label className="block text-sm font-semibold text-neutral-700 mb-2">Payment Status</label>
                    <select
                      className="w-full px-4 py-2.5 border border-neutral-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-primary-500 appearance-none cursor-pointer"
                      value={editingRecord.status}
                      onChange={(e) => setEditingRecord({ ...editingRecord, status: e.target.value })}
                    >
                      <option value="paid">Paid</option>
                      <option value="unpaid">Unpaid</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="pt-6 border-t border-neutral-100 flex justify-end space-x-3 mt-8">
                <Button type="button" variant="ghost" onClick={() => setIsEditModalOpen(false)} className="text-neutral-500 hover:text-neutral-700 hover:bg-neutral-50 px-6">
                  Cancel
                </Button>
                <Button type="submit" className="min-w-[140px] shadow-lg shadow-primary-500/20 active:scale-95 transition-transform">
                  Update Record
                </Button>
              </div>
            </form>
          )}
        </Modal>
      </div>
    </DashboardLayout>
  );
};

export default Maintenance;

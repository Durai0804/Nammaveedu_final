import React, { useEffect, useState } from 'react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import { useNavigate } from 'react-router-dom';
import api from '../../utils/api';

const RaiseComplaint = () => {
  const navigate = useNavigate();

  const [resident, setResident] = useState({
    name: 'Rajesh Kumar',
    email: 'rajesh.kumar@email.com',
    phone: '+91 98765 43210',
    flatNumber: 'A-101',
    doorNumber: 'A-101',
  });

  useEffect(() => {
    const saved = localStorage.getItem('residentProfile');
    if (saved) {
      try {
        const data = JSON.parse(saved);
        setResident(prev => ({ ...prev, ...data, doorNumber: data.flatNumber || prev.doorNumber }));
      } catch {}
    }
  }, []);

  const [form, setForm] = useState({
    category: 'Maintenance',
    description: '',
    doorNumber: '',
    contactPhone: '',
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    setForm(prev => ({
      ...prev,
      doorNumber: resident.doorNumber || resident.flatNumber,
      contactPhone: resident.phone,
    }));
  }, [resident]);

  const submit = async (e) => {
    e.preventDefault();

    const token = localStorage.getItem('accessToken') || localStorage.getItem('token');
    // If not logged in yet, keep existing local-only behavior
    if (!token) {
      const newComplaint = {
        id: `RC${Date.now()}`,
        flatNumber: resident.flatNumber,
        doorNumber: form.doorNumber,
        description: form.description,
        category: form.category,
        status: 'open',
        assignedTo: '',
        createdAt: new Date().toISOString().split('T')[0],
      };
      const key = 'residentComplaints';
      try {
        const existing = JSON.parse(localStorage.getItem(key) || '[]');
        const next = [newComplaint, ...existing];
        localStorage.setItem(key, JSON.stringify(next));
      } catch {
        localStorage.setItem(key, JSON.stringify([newComplaint]));
      }
      navigate('/resident/dashboard');
      return;
    }

    try {
      setIsSubmitting(true);
      const description = `${form.category}: ${form.description}`;
      const { data } = await api.post('/api/complaints', {
        flatNumber: resident.flatNumber,
        description,
      });
      if (!data?.success) throw new Error(data?.error || 'Unable to submit complaint');
      navigate('/resident/dashboard');
    } catch (err) {
      alert(err?.response?.data?.error || err.message || 'Unable to submit complaint');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <DashboardLayout allowResidentAccess={true}>
      <div className="space-y-6 animate-fadeIn">
        <div className="bg-gradient-to-r from-primary-600 to-primary-700 rounded-2xl p-6 md:p-8 text-white shadow-xl">
          <h1 className="text-2xl font-bold">Raise a Complaint</h1>
          <p className="text-primary-100">Submit an issue related to your flat</p>
        </div>

        <Card padding="lg">
          <form onSubmit={submit} className="space-y-6 max-w-2xl">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input label="Flat Number" value={resident.flatNumber} disabled />
              <Input label="Door Number" value={form.doorNumber} onChange={(e) => setForm({ ...form, doorNumber: e.target.value })} required />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-neutral-700 mb-2">Category</label>
                <select className="w-full px-4 py-2.5 border border-neutral-200 rounded-lg bg-white focus:outline-none" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}>
                  <option>Maintenance</option>
                  <option>Security</option>
                  <option>Housekeeping</option>
                  <option>Parking</option>
                  <option>Other</option>
                </select>
              </div>
              <Input label="Contact Phone" value={form.contactPhone} onChange={(e) => setForm({ ...form, contactPhone: e.target.value })} required />
            </div>

            <div>
              <label className="block text-sm font-semibold text-neutral-700 mb-2">Issue Description</label>
              <textarea className="w-full px-4 py-3 border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 min-h-[120px]" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Describe the issue in detail" required />
            </div>

            <div className="flex justify-end gap-3">
              <Button type="button" variant="ghost" onClick={() => navigate('/resident/dashboard')}>Cancel</Button>
              <Button type="submit" isLoading={isSubmitting}>Submit Complaint</Button>
            </div>
          </form>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default RaiseComplaint;

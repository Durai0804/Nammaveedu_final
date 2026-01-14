import React, { useState } from 'react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import Card from '../../components/ui/Card';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import api from '../../utils/api';

const CreateResident = () => {
  const [form, setForm] = useState({
    name: '',
    email: '',
    mobile: '',
    flatNumber: '',
    block: '',
    floor: '',
    members: '',
    ownerName: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const onChange = (e) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');
    try {
      const payload = {
        name: form.name.trim(),
        email: form.email.trim(),
        mobile: form.mobile.trim(),
        flatNumber: form.flatNumber.trim(),
        block: form.block.trim(),
        floor: form.floor.trim(),
        members: form.members ? Number(form.members) : undefined,
        ownerName: form.ownerName || undefined,
      };
      const { data } = await api.post('/api/admin/residents', payload);
      if (!data?.success) throw new Error(data?.error || 'Failed to create resident');
      setSuccess('Resident created successfully');
      setForm({ name: '', email: '', mobile: '', flatNumber: '', block: '', floor: '', members: '', ownerName: '' });
    } catch (err) {
      setError(err?.response?.data?.error || err.message || 'Unable to create resident');
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6 animate-fadeIn">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-neutral-900">Create Resident</h1>
            <p className="text-neutral-600">Add a new resident and link them to a flat</p>
          </div>
          <Badge variant="neutral">Single Create</Badge>
        </div>

        <Card padding="lg">
          <form onSubmit={onSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm text-neutral-700">Name</label>
              <Input name="name" value={form.name} onChange={onChange} placeholder="John Doe" required />
            </div>
            <div>
              <label className="text-sm text-neutral-700">Email</label>
              <Input type="email" name="email" value={form.email} onChange={onChange} placeholder="john@example.com" required />
            </div>
            <div>
              <label className="text-sm text-neutral-700">Mobile</label>
              <Input name="mobile" value={form.mobile} onChange={onChange} placeholder="9876543210" required />
            </div>
            <div>
              <label className="text-sm text-neutral-700">Flat Number</label>
              <Input name="flatNumber" value={form.flatNumber} onChange={onChange} placeholder="A-101" required />
            </div>
            <div>
              <label className="text-sm text-neutral-700">Block</label>
              <Input name="block" value={form.block} onChange={onChange} placeholder="Alpha" required />
            </div>
            <div>
              <label className="text-sm text-neutral-700">Floor</label>
              <Input name="floor" value={form.floor} onChange={onChange} placeholder="1" required />
            </div>
            <div>
              <label className="text-sm text-neutral-700">Members</label>
              <Input name="members" value={form.members} onChange={onChange} placeholder="3" />
            </div>
            <div>
              <label className="text-sm text-neutral-700">Owner/Tenant Name</label>
              <Input name="ownerName" value={form.ownerName} onChange={onChange} placeholder="Owner or Primary Tenant" />
            </div>

            <div className="md:col-span-2 flex items-center gap-3 mt-2">
              <Button type="submit" disabled={loading}>{loading ? 'Creating…' : 'Create Resident'}</Button>
              {error ? <span className="text-sm text-red-600">{error}</span> : null}
              {success ? <span className="text-sm text-green-600">{success}</span> : null}
            </div>
          </form>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default CreateResident;

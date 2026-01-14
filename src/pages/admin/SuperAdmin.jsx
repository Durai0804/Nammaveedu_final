import React, { useState } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import DashboardLayout from '../../components/layout/DashboardLayout';
import Card from '../../components/ui/Card';
import Table from '../../components/ui/Table';
import Badge from '../../components/ui/Badge';
import { Search, Building2 } from 'lucide-react';
import { mockApartments } from '../../utils/mockData';

const SuperAdmin = () => {
  const { t, language } = useLanguage();
  const [searchTerm, setSearchTerm] = useState('');

  const filteredApartments = mockApartments.filter(
    (apt) => apt.name.toLowerCase().includes(searchTerm.toLowerCase()) || apt.location.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className={`text-3xl font-bold text-neutral-900 ${language === 'ta' ? 'font-tamil' : ''}`}>{t('superAdmin')}</h1>
          <p className="text-neutral-600 mt-1">Manage all apartments and subscriptions</p>
        </div>

        <div className="grid sm:grid-cols-3 gap-4">
          <Card padding="lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-neutral-600 mb-1">Total Apartments</p>
                <p className="text-3xl font-bold text-neutral-900">{mockApartments.length}</p>
              </div>
              <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center">
                <Building2 className="w-6 h-6 text-primary-600" />
              </div>
            </div>
          </Card>

          <Card padding="lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-neutral-600 mb-1">Active Subscriptions</p>
                <p className="text-3xl font-bold text-green-600">{mockApartments.filter((a) => a.subscription === 'active').length}</p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <span className="text-2xl">✓</span>
              </div>
            </div>
          </Card>

          <Card padding="lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-neutral-600 mb-1">Total Users</p>
                <p className="text-3xl font-bold text-neutral-900">{mockApartments.reduce((sum, a) => sum + a.userCount, 0)}</p>
              </div>
              <div className="w-12 h-12 bg-secondary-100 rounded-lg flex items-center justify-center">
                <span className="text-2xl">👥</span>
              </div>
            </div>
          </Card>
        </div>

        <Card padding="lg">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-neutral-400" />
            <input
              type="text"
              placeholder={`${t('search')} apartments...`}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>
        </Card>

        <Card padding="none">
          <Table
            headers={[t('apartmentName'), 'Location', 'Flats', t('userCount'), t('subscription')]}
            data={filteredApartments}
            renderRow={(apartment) => (
              <>
                <td className="px-4 py-3">
                  <span className="font-semibold text-neutral-900">{apartment.name}</span>
                </td>
                <td className="px-4 py-3 text-neutral-700">{apartment.location}</td>
                <td className="px-4 py-3 text-neutral-700">{apartment.flats}</td>
                <td className="px-4 py-3">
                  <span className="font-medium text-neutral-900">{apartment.userCount}</span>
                </td>
                <td className="px-4 py-3">
                  <Badge variant={apartment.subscription === 'active' ? 'success' : 'danger'}>
                    <span className={language === 'ta' ? 'font-tamil' : ''}>
                      {apartment.subscription === 'active' ? t('active') : t('inactive')}
                    </span>
                  </Badge>
                </td>
              </>
            )}
            emptyMessage="No apartments found"
          />
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default SuperAdmin;

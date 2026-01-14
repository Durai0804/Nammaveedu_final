import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import Card from '../ui/Card';
import { useLanguage } from '../../context/LanguageContext';

const data = [
    { name: 'Jan', collected: 45000, pending: 5000 },
    { name: 'Feb', collected: 48000, pending: 2000 },
    { name: 'Mar', collected: 43000, pending: 7000 },
    { name: 'Apr', collected: 46000, pending: 4000 },
    { name: 'May', collected: 50000, pending: 0 },
    { name: 'Jun', collected: 42000, pending: 8000 },
];

const RevenueChart = () => {
    const { t } = useLanguage();

    const CustomTooltip = ({ active, payload, label }) => {
        if (active && payload && payload.length) {
            return (
                <div className="bg-white p-3 border border-neutral-100 shadow-medium rounded-lg">
                    <p className="font-semibold text-neutral-800 mb-1">{label}</p>
                    <p className="text-sm text-primary-600">
                        {t('collected') || 'Collected'}: ₹{payload[0].value.toLocaleString()}
                    </p>
                    <p className="text-sm text-amber-500">
                        {t('pending') || 'Pending'}: ₹{payload[1].value.toLocaleString()}
                    </p>
                </div>
            );
        }
        return null;
    };

    return (
        <Card className="h-full animate-fadeIn" style={{ animationDelay: '200ms' }}>
            <h3 className="text-lg font-bold text-neutral-800 mb-6">
                {t('revenueCollection') || 'Maintenance Collection'}
            </h3>
            <div className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                        data={data}
                        margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                        barSize={20}
                    >
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                        <XAxis
                            dataKey="name"
                            axisLine={false}
                            tickLine={false}
                            tick={{ fill: '#78716c', fontSize: 12 }}
                            dy={10}
                        />
                        <YAxis
                            axisLine={false}
                            tickLine={false}
                            tick={{ fill: '#78716c', fontSize: 12 }}
                            tickFormatter={(value) => `₹${value / 1000}k`}
                        />
                        <Tooltip content={<CustomTooltip />} cursor={{ fill: '#fafaf9' }} />
                        <Legend wrapperStyle={{ paddingTop: '20px' }} />
                        <Bar
                            dataKey="collected"
                            name={t('collected') || 'Collected'}
                            fill="var(--color-primary-600)"
                            radius={[4, 4, 0, 0]}
                            stackId="a"
                        />
                        <Bar
                            dataKey="pending"
                            name={t('pending') || 'Pending'}
                            fill="#fdba74"
                            radius={[4, 4, 0, 0]}
                            stackId="a"
                        />
                    </BarChart>
                </ResponsiveContainer>
            </div>
        </Card>
    );
};

export default RevenueChart;

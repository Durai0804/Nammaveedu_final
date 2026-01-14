import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import Card from '../ui/Card';
import { useLanguage } from '../../context/LanguageContext';

const data = [
    { name: 'Plumbing', value: 30, color: '#0d9488' }, // Primary Teal
    { name: 'Electrical', value: 25, color: '#f59e0b' }, // Secondary Amber
    { name: 'Security', value: 15, color: '#ef4444' }, // Red
    { name: 'Others', value: 30, color: '#64748b' }, // Slate
];

const ComplaintsChart = () => {
    const { t } = useLanguage();

    const CustomTooltip = ({ active, payload }) => {
        if (active && payload && payload.length) {
            return (
                <div className="bg-white p-3 border border-neutral-100 shadow-medium rounded-lg">
                    <p className="font-semibold text-neutral-800 mb-1">{payload[0].name}</p>
                    <p className="text-sm text-neutral-600">
                        {payload[0].value}% {t('complaints') || 'Complaints'}
                    </p>
                </div>
            );
        }
        return null;
    };

    return (
        <Card className="h-full animate-fadeIn" style={{ animationDelay: '300ms' }}>
            <h3 className="text-lg font-bold text-neutral-800 mb-6">
                {t('complaintTypes') || 'Complaint Distribution'}
            </h3>
            <div className="h-[300px] w-full flex items-center justify-center">
                <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                        <Pie
                            data={data}
                            cx="50%"
                            cy="50%"
                            innerRadius={60}
                            outerRadius={80}
                            paddingAngle={5}
                            dataKey="value"
                        >
                            {data.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.color} stroke="none" />
                            ))}
                        </Pie>
                        <Tooltip content={<CustomTooltip />} />
                        <Legend
                            layout="vertical"
                            verticalAlign="middle"
                            align="right"
                            wrapperStyle={{ paddingLeft: '20px' }}
                        />
                    </PieChart>
                </ResponsiveContainer>
            </div>
        </Card>
    );
};

export default ComplaintsChart;

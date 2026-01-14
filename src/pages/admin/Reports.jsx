import React, { useState } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import DashboardLayout from '../../components/layout/DashboardLayout';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import { FileText, Calendar, Zap, TrendingUp, AlertTriangle, CheckCircle, Users } from 'lucide-react';
import { mockFlats, mockComplaints, mockVisitors, mockNotices } from '../../utils/mockData';

const Reports = () => {
  const { t, language } = useLanguage();
  const [dateRange, setDateRange] = useState({
    start: new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0],
    end: new Date().toISOString().split('T')[0],
  });
  const [isGenerating, setIsGenerating] = useState(false);
  const [report, setReport] = useState(null);

  const generateAIReport = () => {
    setIsGenerating(true);
    setReport(null);

    setTimeout(() => {
      const start = new Date(dateRange.start);
      const end = new Date(dateRange.end);

      const periodComplaints = mockComplaints.filter((c) => {
        const d = new Date(c.createdAt);
        return d >= start && d <= end;
      });
      const resolvedCount = periodComplaints.filter((c) => c.status === 'resolved').length;
      const resolutionRate = periodComplaints.length ? Math.round((resolvedCount / periodComplaints.length) * 100) : 100;

      const totalCollection = mockFlats.reduce((acc, curr) => acc + (curr.status === 'paid' ? curr.maintenance : 0), 0);
      const pendingCollection = mockFlats.reduce((acc, curr) => acc + (curr.status === 'unpaid' ? curr.maintenance : 0), 0);
      const collectionRate = Math.round((totalCollection / (totalCollection + pendingCollection)) * 100);

      const periodVisitors = mockVisitors.filter((v) => {
        const d = new Date(v.date);
        return d >= start && d <= end;
      });

      const insights = [];
      if (collectionRate < 90) {
        insights.push({ type: 'warning', text: `Maintenance collection is at ${collectionRate}%. Follow up with ${mockFlats.filter(f => f.status === 'unpaid').length} pending residents.` });
      } else {
        insights.push({ type: 'success', text: `Healthy financial status with ${collectionRate}% maintenance collected.` });
      }

      if (periodComplaints.length > 5) {
        insights.push({ type: 'neutral', text: `High complaint volume (${periodComplaints.length}) detected. Review plumbing and electrical infrastructure.` });
      }

      if (periodVisitors.length > 20) {
        insights.push({ type: 'info', text: `Peak visitor traffic detected. Consider increasing security staff during weekends.` });
      }

      setReport({
        summary: `Activity Analysis for ${dateRange.start} to ${dateRange.end}`,
        metrics: {
          complaints: periodComplaints.length,
          resolutionRate,
          totalCollection,
          visitors: periodVisitors.length,
          notices: mockNotices.filter((n) => new Date(n.postedOn) >= start && new Date(n.postedOn) <= end).length,
        },
        insights,
      });
      setIsGenerating(false);
    }, 2000);
  };

  return (
    <DashboardLayout>
      <div className="space-y-6 animate-fadeIn">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <h1 className={`text-3xl font-bold text-neutral-900 ${language === 'ta' ? 'font-tamil' : ''}`}>{t('reports') || 'Intelligence Reports'}</h1>
            <p className="text-neutral-600 mt-1">AI-powered analytics and summary</p>
          </div>
        </div>

        <Card padding="md" className="bg-white/80 backdrop-blur-sm border border-neutral-200/60 shadow-sm">
          <div className="flex flex-col md:flex-row items-end gap-4">
            <div className="grid grid-cols-2 gap-4 w-full md:w-auto">
              <div>
                <label className="block text-xs font-semibold text-neutral-500 mb-1 uppercase tracking-wide">Start Date</label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-400 w-4 h-4" />
                  <input type="date" value={dateRange.start} onChange={(e) => setDateRange((prev) => ({ ...prev, start: e.target.value }))} className="pl-9 pr-4 py-2 border border-neutral-200 rounded-lg text-sm w-full focus:ring-2 focus:ring-primary-500 focus:outline-none" />
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-neutral-500 mb-1 uppercase tracking-wide">End Date</label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-400 w-4 h-4" />
                  <input type="date" value={dateRange.end} onChange={(e) => setDateRange((prev) => ({ ...prev, end: e.target.value }))} className="pl-9 pr-4 py-2 border border-neutral-200 rounded-lg text-sm w-full focus:ring-2 focus:ring-primary-500 focus:outline-none" />
                </div>
              </div>
            </div>
            <Button onClick={generateAIReport} disabled={isGenerating} className={`w-full md:w-auto min-w-[160px] shadow-lg shadow-primary-500/20 active:scale-95 transition-transform ${isGenerating ? 'opacity-80' : ''}`}>
              {isGenerating ? (
                <span className="flex items-center">
                  <Zap className="w-4 h-4 mr-2 animate-pulse text-yellow-300" />
                  Analyzing Data...
                </span>
              ) : (
                <span className="flex items-center">
                  <FileText className="w-4 h-4 mr-2" />
                  Generate Report
                </span>
              )}
            </Button>
          </div>
        </Card>

        {report && (
          <div className="space-y-6 animate-slideInUp">
            <Card className="bg-gradient-to-r from-neutral-900 to-neutral-800 text-white border-none shadow-xl relative overflow-hidden">
              <div className="absolute top-0 right-0 p-8 opacity-10">
                <Zap className="w-64 h-64" />
              </div>
              <div className="relative z-10">
                <h2 className="text-xl font-bold mb-2 flex items-center">
                  <Zap className="w-5 h-5 mr-2 text-yellow-400" />
                  Executive Summary
                </h2>
                <p className="text-neutral-300 text-lg leading-relaxed">
                  {report.summary}. The community is performing well overall. Financial health is strong with <span className="text-white font-bold">₹{(report.metrics.totalCollection / 1000).toFixed(1)}k</span> collected. Operations team resolved <span className="text-white font-bold">{report.metrics.resolutionRate}%</span> of reported issues.
                </p>
              </div>
            </Card>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Card padding="md" className="border-l-4 border-l-primary-500">
                <div className="text-neutral-500 text-xs uppercase font-bold tracking-wider mb-1">Total Complaints</div>
                <div className="text-2xl font-bold text-neutral-900">{report.metrics.complaints}</div>
              </Card>
              <Card padding="md" className="border-l-4 border-l-green-500">
                <div className="text-neutral-500 text-xs uppercase font-bold tracking-wider mb-1">Resolution Rate</div>
                <div className="text-2xl font-bold text-neutral-900">{report.metrics.resolutionRate}%</div>
              </Card>
              <Card padding="md" className="border-l-4 border-l-blue-500">
                <div className="text-neutral-500 text-xs uppercase font-bold tracking-wider mb-1">Visitors Logged</div>
                <div className="text-2xl font-bold text-neutral-900">{report.metrics.visitors}</div>
              </Card>
              <Card padding="md" className="border-l-4 border-l-purple-500">
                <div className="text-neutral-500 text-xs uppercase font-bold tracking-wider mb-1">New Notices</div>
                <div className="text-2xl font-bold text-neutral-900">{report.metrics.notices}</div>
              </Card>
            </div>

            <Card title="Key Insights & Recommendations">
              <div className="space-y-4">
                {report.insights.map((insight, idx) => (
                  <div key={idx} className="flex items-start space-x-3 p-3 rounded-lg bg-neutral-50 border border-neutral-100">
                    {insight.type === 'warning' && <AlertTriangle className="w-5 h-5 text-orange-500 shrink-0 mt-0.5" />}
                    {insight.type === 'success' && <CheckCircle className="w-5 h-5 text-green-500 shrink-0 mt-0.5" />}
                    {insight.type === 'info' && <Users className="w-5 h-5 text-blue-500 shrink-0 mt-0.5" />}
                    {insight.type === 'neutral' && <TrendingUp className="w-5 h-5 text-neutral-500 shrink-0 mt-0.5" />}
                    <div>
                      <p className="text-sm text-neutral-800 font-medium">{insight.text}</p>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default Reports;

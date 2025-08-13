import { useState } from 'react';

interface Ward {
  id: string;
  name: string;
  type: 'ward' | 'branch';
  eqPresident: string;
  contactInfo: string;
}

interface EQReport {
  id: string;
  wardId: string;
  wardName: string;
  submittedBy: string;
  submittedDate: string;
  status: 'new' | 'reviewed' | 'forwarded' | 'completed';
  reportType: 'monthly' | 'quarterly' | 'special' | 'progress';
  content: string;
  attachments: string[];
  priority: 'low' | 'normal' | 'high';
}

interface StakeReport {
  id: string;
  title: string;
  wardId: string;
  wardName: string;
  reportType: 'summary' | 'request' | 'update' | 'concern';
  content: string;
  submittedDate: string;
  status: 'draft' | 'submitted' | 'approved' | 'rejected';
  priority: 'low' | 'normal' | 'high';
  attachments: string[];
}

const StakeRepresentative: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'eq-reports' | 'submit-reports' | 'my-reports'>('eq-reports');
  const [selectedWard, setSelectedWard] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState<'all' | 'new' | 'reviewed' | 'forwarded' | 'completed'>('all');

  const [wards, setWards] = useState<Ward[]>([
    { id: '1', name: 'Ward 1', type: 'ward', eqPresident: 'John Smith', contactInfo: 'john.smith@email.com' },
    { id: '2', name: 'Ward 2', type: 'ward', eqPresident: 'Sarah Johnson', contactInfo: 'sarah.j@email.com' },
    { id: '3', name: 'Ward 3', type: 'ward', eqPresident: 'Michael Brown', contactInfo: 'michael.b@email.com' },
    { id: '4', name: 'Branch A', type: 'branch', eqPresident: 'David Wilson', contactInfo: 'david.w@email.com' },
    { id: '5', name: 'Branch B', type: 'branch', eqPresident: 'Emily Davis', contactInfo: 'emily.d@email.com' },
  ]);

  const [eqReports, setEqReports] = useState<EQReport[]>([
    { 
      id: '1', 
      wardId: '1', 
      wardName: 'Ward 1', 
      submittedBy: 'John Smith', 
      submittedDate: '2024-03-18', 
      status: 'new', 
      reportType: 'monthly',
      content: 'Monthly progress report for Ward 1. All self-reliance groups are progressing well with 85% average completion rate.',
      attachments: ['progress_chart.pdf', 'attendance_log.xlsx'],
      priority: 'normal'
    },
    { 
      id: '2', 
      wardId: '2', 
      wardName: 'Ward 2', 
      submittedBy: 'Sarah Johnson', 
      submittedDate: '2024-03-17', 
      status: 'new', 
      reportType: 'progress',
      content: 'Progress update on financial literacy classes. Need additional resources for advanced topics.',
      attachments: ['financial_report.pdf'],
      priority: 'high'
    },
    { 
      id: '3', 
      wardId: '4', 
      wardName: 'Branch A', 
      submittedBy: 'David Wilson', 
      submittedDate: '2024-03-16', 
      status: 'reviewed', 
      reportType: 'quarterly',
      content: 'Quarterly summary submitted. Branch showing steady improvement in participation.',
      attachments: ['quarterly_summary.pdf', 'participant_feedback.docx'],
      priority: 'normal'
    },
  ]);

  const [stakeReports, setStakeReports] = useState<StakeReport[]>([
    {
      id: '1',
      title: 'Ward 1 Progress Summary',
      wardId: '1',
      wardName: 'Ward 1',
      reportType: 'summary',
      content: 'Comprehensive summary of Ward 1 self-reliance progress for March 2024.',
      submittedDate: '2024-03-15',
      status: 'submitted',
      priority: 'normal',
      attachments: ['ward1_summary.pdf']
    }
  ]);

  const [newStakeReport, setNewStakeReport] = useState({
    title: '',
    wardId: '',
    reportType: 'summary',
    content: '',
    priority: 'normal',
    attachments: [] as string[]
  });

  const filteredEqReports = eqReports.filter(report => {
    if (selectedWard !== 'all' && report.wardId !== selectedWard) return false;
    if (selectedStatus !== 'all' && report.status !== selectedStatus) return false;
    return true;
  });

  const handleSubmitStakeReport = () => {
    if (newStakeReport.title && newStakeReport.wardId && newStakeReport.content) {
      const ward = wards.find(w => w.id === newStakeReport.wardId);
      const report: StakeReport = {
        id: Date.now().toString(),
        title: newStakeReport.title,
        wardId: newStakeReport.wardId,
        wardName: ward?.name || 'Unknown',
        reportType: newStakeReport.reportType as any,
        content: newStakeReport.content,
        submittedDate: new Date().toISOString().split('T')[0],
        status: 'submitted',
        priority: newStakeReport.priority as any,
        attachments: newStakeReport.attachments
      };
      setStakeReports([...stakeReports, report]);
      setNewStakeReport({ title: '', wardId: '', reportType: 'summary', content: '', priority: 'normal', attachments: [] });
    }
  };

  const handleUpdateReportStatus = (reportId: string, newStatus: EQReport['status']) => {
    setEqReports(eqReports.map(report => 
      report.id === reportId ? { ...report, status: newStatus } : report
    ));
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'new': return 'bg-blue-100 text-blue-800';
      case 'reviewed': return 'bg-yellow-100 text-yellow-800';
      case 'forwarded': return 'bg-purple-100 text-purple-800';
      case 'completed': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800';
      case 'normal': return 'bg-blue-100 text-blue-800';
      case 'low': return 'bg-gray-100 text-gray-800';
      default: return 'bg-blue-100 text-blue-800';
    }
  };

  const getReportTypeColor = (type: string) => {
    switch (type) {
      case 'monthly': return 'bg-green-100 text-green-800';
      case 'quarterly': return 'bg-blue-100 text-blue-800';
      case 'special': return 'bg-purple-100 text-purple-800';
      case 'progress': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="min-h-screen bg-white p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-3xl shadow-2xl p-8 mb-8 border border-teal-200 shadow-teal-100">
          <h1 className="text-4xl font-bold text-gray-800 mb-4">Stake Representative Dashboard</h1>
          <p className="text-gray-600 text-lg">Review EQ reports and submit reports to stake committee</p>
        </div>

        {/* Navigation Tabs */}
        <div className="flex space-x-2 mb-8">
          {[
            { id: 'eq-reports', label: 'EQ Reports' },
            { id: 'submit-reports', label: 'Submit Reports' },
            { id: 'my-reports', label: 'My Reports' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-6 py-3 rounded-xl font-semibold transition-all duration-200 ${
                activeTab === tab.id
                  ? 'bg-teal-500 text-white shadow-lg'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Content Sections */}
        {activeTab === 'eq-reports' && (
          <div className="bg-white rounded-3xl shadow-2xl p-8 border border-teal-200 shadow-teal-100">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
              <h2 className="text-2xl font-bold text-gray-800">EQ Reports from Wards/Branches</h2>
              <div className="flex space-x-4">
                <select
                  value={selectedWard}
                  onChange={(e) => setSelectedWard(e.target.value)}
                  className="px-4 py-2 border-2 border-gray-200 rounded-xl focus:border-teal-400 focus:ring-4 focus:ring-teal-50 transition-all duration-200"
                >
                  <option value="all">All Wards/Branches</option>
                  {wards.map(ward => (
                    <option key={ward.id} value={ward.id}>{ward.name}</option>
                  ))}
                </select>
                <select
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value as any)}
                  className="px-4 py-2 border-2 border-gray-200 rounded-xl focus:border-teal-400 focus:ring-4 focus:ring-teal-50 transition-all duration-200"
                >
                  <option value="all">All Statuses</option>
                  <option value="new">New</option>
                  <option value="reviewed">Reviewed</option>
                  <option value="forwarded">Forwarded</option>
                  <option value="completed">Completed</option>
                </select>
              </div>
            </div>
            
            <div className="space-y-6">
              {filteredEqReports.map(report => (
                <div key={report.id} className="bg-gray-50 rounded-xl p-6 border border-gray-200">
                  <div className="flex flex-col lg:flex-row justify-between items-start gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-3">
                        <h3 className="text-lg font-semibold text-gray-800">{report.wardName}</h3>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(report.status)}`}>
                          {report.status}
                        </span>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(report.priority)}`}>
                          {report.priority}
                        </span>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getReportTypeColor(report.reportType)}`}>
                          {report.reportType}
                        </span>
                      </div>
                      <p className="text-gray-600 mb-3">{report.content}</p>
                      <div className="text-sm text-gray-500 mb-3">
                        <span>Submitted by: {report.submittedBy}</span>
                        <span className="mx-2">•</span>
                        <span>Date: {report.submittedDate}</span>
                      </div>
                      {report.attachments.length > 0 && (
                        <div className="mb-3">
                          <span className="text-sm font-medium text-gray-700">Attachments: </span>
                          {report.attachments.map((attachment, index) => (
                            <span key={index} className="text-sm text-teal-600 hover:underline cursor-pointer">
                              {attachment}{index < report.attachments.length - 1 ? ', ' : ''}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                    <div className="flex flex-col gap-2">
                      {report.status === 'new' && (
                        <>
                          <button
                            onClick={() => handleUpdateReportStatus(report.id, 'reviewed')}
                            className="px-4 py-2 bg-yellow-500 hover:bg-yellow-600 text-white text-sm rounded-lg transition-colors"
                          >
                            Mark Reviewed
                          </button>
                          <button
                            onClick={() => handleUpdateReportStatus(report.id, 'forwarded')}
                            className="px-4 py-2 bg-purple-500 hover:bg-purple-600 text-white text-sm rounded-lg transition-colors"
                          >
                            Forward to Committee
                          </button>
                        </>
                      )}
                      {report.status === 'reviewed' && (
                        <button
                          onClick={() => handleUpdateReportStatus(report.id, 'forwarded')}
                          className="px-4 py-2 bg-purple-500 hover:bg-purple-600 text-white text-sm rounded-lg transition-colors"
                        >
                          Forward to Committee
                        </button>
                      )}
                      {report.status === 'forwarded' && (
                        <button
                          onClick={() => handleUpdateReportStatus(report.id, 'completed')}
                          className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white text-sm rounded-lg transition-colors"
                        >
                          Mark Completed
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'submit-reports' && (
          <div className="bg-white rounded-3xl shadow-2xl p-8 border border-teal-200 shadow-teal-100">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">Submit Report to Stake Committee</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              <input
                type="text"
                placeholder="Report Title"
                value={newStakeReport.title}
                onChange={(e) => setNewStakeReport({...newStakeReport, title: e.target.value})}
                className="px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-teal-400 focus:ring-4 focus:ring-teal-50 transition-all duration-200"
              />
              <select
                value={newStakeReport.wardId}
                onChange={(e) => setNewStakeReport({...newStakeReport, wardId: e.target.value})}
                className="px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-teal-400 focus:ring-4 focus:ring-teal-50 transition-all duration-200"
              >
                <option value="">Select Ward/Branch</option>
                {wards.map(ward => (
                  <option key={ward.id} value={ward.id}>{ward.name}</option>
                ))}
              </select>
              <select
                value={newStakeReport.reportType}
                onChange={(e) => setNewStakeReport({...newStakeReport, reportType: e.target.value as any})}
                className="px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-teal-400 focus:ring-4 focus:ring-teal-50 transition-all duration-200"
              >
                <option value="summary">Summary Report</option>
                <option value="request">Request/Recommendation</option>
                <option value="update">Progress Update</option>
                <option value="concern">Concern/Issue</option>
              </select>
              <select
                value={newStakeReport.priority}
                onChange={(e) => setNewStakeReport({...newStakeReport, priority: e.target.value as any})}
                className="px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-teal-400 focus:ring-4 focus:ring-teal-50 transition-all duration-200"
              >
                <option value="low">Low Priority</option>
                <option value="normal">Normal Priority</option>
                <option value="high">High Priority</option>
              </select>
            </div>
            <textarea
              placeholder="Report Content"
              value={newStakeReport.content}
              onChange={(e) => setNewStakeReport({...newStakeReport, content: e.target.value})}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-teal-400 focus:ring-4 focus:ring-teal-50 transition-all duration-200 mb-6"
              rows={6}
            />
            <button
              onClick={handleSubmitStakeReport}
              className="bg-teal-500 hover:bg-teal-600 text-white font-semibold py-3 px-8 rounded-xl transition-all duration-200 transform hover:-translate-y-1 hover:shadow-lg"
            >
              Submit to Stake Committee
            </button>
          </div>
        )}

        {activeTab === 'my-reports' && (
          <div className="bg-white rounded-3xl shadow-2xl p-8 border border-teal-200 shadow-teal-100">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">My Submitted Reports</h2>
            <div className="space-y-4">
              {stakeReports.map(report => (
                <div key={report.id} className="bg-gray-50 rounded-xl p-6 border border-gray-200">
                  <div className="flex justify-between items-start mb-3">
                    <h3 className="text-lg font-semibold text-gray-800">{report.title}</h3>
                    <div className="flex gap-2">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(report.priority)}`}>
                        {report.priority}
                      </span>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        report.status === 'approved' ? 'bg-green-100 text-green-800' :
                        report.status === 'rejected' ? 'bg-red-100 text-red-800' :
                        report.status === 'submitted' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {report.status}
                      </span>
                    </div>
                  </div>
                  <p className="text-gray-600 mb-3">{report.content}</p>
                  <div className="text-sm text-gray-500">
                    <span>Ward/Branch: {report.wardName}</span>
                    <span className="mx-2">•</span>
                    <span>Type: {report.reportType}</span>
                    <span className="mx-2">•</span>
                    <span>Submitted: {report.submittedDate}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default StakeRepresentative;

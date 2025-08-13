import { useState } from 'react';

interface Ward {
  id: string;
  name: string;
  type: 'ward' | 'branch';
  totalGroups: number;
  activeGroups: number;
  totalParticipants: number;
  averageProgress: number;
  lastReportDate: string;
  eqPresident: string;
  bishop: string;
}

interface StakeCommitteeReport {
  id: string;
  title: string;
  submittedBy: string;
  submittedDate: string;
  status: 'pending' | 'approved' | 'rejected' | 'implemented';
  priority: 'low' | 'normal' | 'high';
  category: 'recommendation' | 'concern' | 'update' | 'request';
  content: string;
  wardId?: string;
  wardName?: string;
  attachments: string[];
  response?: string;
  responseDate?: string;
}

interface StakePerformance {
  totalWards: number;
  totalBranches: number;
  totalGroups: number;
  totalParticipants: number;
  averageStakeProgress: number;
  topPerformingWard: string;
  lowestPerformingWard: string;
  overallCompletionRate: number;
  activePrograms: number;
  totalPrograms: number;
}

const StakePresident: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'overview' | 'wards' | 'reports'>('overview');
  const [selectedWard, setSelectedWard] = useState('all');
  const [selectedCategory, setSelectedCategory] = useState<'all' | 'recommendation' | 'concern' | 'update' | 'request'>('all');
  const [selectedPriority, setSelectedPriority] = useState<'all' | 'low' | 'normal' | 'high'>('all');

  const [wards, setWards] = useState<Ward[]>([
    { id: '1', name: 'Ward 1', type: 'ward', totalGroups: 8, activeGroups: 7, totalParticipants: 45, averageProgress: 78, lastReportDate: '2024-03-15', eqPresident: 'John Smith', bishop: 'Robert Johnson' },
    { id: '2', name: 'Ward 2', type: 'ward', totalGroups: 6, activeGroups: 5, totalParticipants: 32, averageProgress: 65, lastReportDate: '2024-03-12', eqPresident: 'Sarah Wilson', bishop: 'Michael Brown' },
    { id: '3', name: 'Ward 3', type: 'ward', totalGroups: 7, activeGroups: 6, totalParticipants: 38, averageProgress: 82, lastReportDate: '2024-03-18', eqPresident: 'David Davis', bishop: 'James Wilson' },
    { id: '4', name: 'Branch A', type: 'branch', totalGroups: 4, activeGroups: 3, totalParticipants: 18, averageProgress: 71, lastReportDate: '2024-03-10', eqPresident: 'Emily Taylor', bishop: 'Thomas Anderson' },
    { id: '5', name: 'Branch B', type: 'branch', totalGroups: 3, activeGroups: 2, totalParticipants: 15, averageProgress: 58, lastReportDate: '2024-03-08', eqPresident: 'Christopher Lee', bishop: 'Daniel Martinez' },
  ]);

  const [stakeCommitteeReports, setStakeCommitteeReports] = useState<StakeCommitteeReport[]>([
    {
      id: '1',
      title: 'Additional Resources for Financial Literacy',
      submittedBy: 'Stake Committee',
      submittedDate: '2024-03-15',
      status: 'pending',
      priority: 'high',
      category: 'recommendation',
      content: 'Recommendation to allocate additional resources for financial literacy programs across all wards. Current programs are at capacity and there is high demand.',
      wardId: '2',
      wardName: 'Ward 2',
      attachments: ['resource_analysis.pdf', 'demand_survey.xlsx']
    },
    {
      id: '2',
      title: 'Stake-wide Self-Reliance Conference',
      submittedBy: 'Stake Committee',
      submittedDate: '2024-03-12',
      status: 'approved',
      priority: 'normal',
      category: 'request',
      content: 'Request for approval to organize a stake-wide self-reliance conference in Q2 2024. This will help share best practices and motivate participants.',
      attachments: ['conference_proposal.pdf', 'budget_estimate.xlsx']
    },
    {
      id: '3',
      title: 'Concern about Branch B Progress',
      submittedBy: 'Stake Committee',
      submittedDate: '2024-03-10',
      status: 'implemented',
      priority: 'high',
      category: 'concern',
      content: 'Concern raised about Branch B showing lower progress rates. Action plan implemented with additional support and mentoring.',
      wardId: '5',
      wardName: 'Branch B',
      attachments: ['action_plan.pdf', 'progress_report.pdf']
    }
  ]);

  const stakePerformance: StakePerformance = {
    totalWards: wards.filter(w => w.type === 'ward').length,
    totalBranches: wards.filter(w => w.type === 'branch').length,
    totalGroups: wards.reduce((sum, ward) => sum + ward.totalGroups, 0),
    totalParticipants: wards.reduce((sum, ward) => sum + ward.totalParticipants, 0),
    averageStakeProgress: Math.round(wards.reduce((sum, ward) => sum + ward.averageProgress, 0) / wards.length),
    topPerformingWard: wards.reduce((top, ward) => ward.averageProgress > top.averageProgress ? ward : top).name,
    lowestPerformingWard: wards.reduce((lowest, ward) => ward.averageProgress < lowest.averageProgress ? ward : lowest).name,
    overallCompletionRate: Math.round(wards.reduce((sum, ward) => sum + ward.averageProgress, 0) / wards.length),
    activePrograms: wards.reduce((sum, ward) => sum + ward.activeGroups, 0),
    totalPrograms: wards.reduce((sum, ward) => sum + ward.totalGroups, 0)
  };

  const filteredWards = selectedWard === 'all' ? wards : wards.filter(ward => ward.id === selectedWard);

  const filteredReports = stakeCommitteeReports.filter(report => {
    if (selectedCategory !== 'all' && report.category !== selectedCategory) return false;
    if (selectedPriority !== 'all' && report.priority !== selectedPriority) return false;
    if (selectedWard !== 'all' && report.wardId !== selectedWard) return false;
    return true;
  });

  const handleUpdateReportStatus = (reportId: string, newStatus: StakeCommitteeReport['status'], response?: string) => {
    setStakeCommitteeReports(stakeCommitteeReports.map(report => 
      report.id === reportId ? { 
        ...report, 
        status: newStatus,
        response: response || report.response,
        responseDate: response ? new Date().toISOString().split('T')[0] : report.responseDate
      } : report
    ));
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'approved': return 'bg-green-100 text-green-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      case 'implemented': return 'bg-blue-100 text-blue-800';
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

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'recommendation': return 'bg-green-100 text-green-800';
      case 'concern': return 'bg-red-100 text-red-800';
      case 'update': return 'bg-blue-100 text-blue-800';
      case 'request': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="min-h-screen bg-white p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-3xl shadow-2xl p-8 mb-8 border border-teal-200 shadow-teal-100">
          <h1 className="text-4xl font-bold text-gray-800 mb-4">Stake President Dashboard</h1>
          <p className="text-gray-600 text-lg">Monitor overall stake progress and review committee recommendations</p>
        </div>

        {/* Navigation Tabs */}
        <div className="flex space-x-2 mb-8">
          {[
            { id: 'overview', label: 'Stake Overview' },
            { id: 'wards', label: 'Ward Progress' },
            { id: 'reports', label: 'Committee Reports' }
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
        {activeTab === 'overview' && (
          <div className="space-y-8">
            {/* Stake Performance Summary */}
            <div className="bg-white rounded-3xl shadow-2xl p-8 border border-teal-200 shadow-teal-100">
              <h2 className="text-2xl font-bold text-gray-800 mb-6">Overall Stake Performance</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
                <div className="text-center">
                  <div className="text-3xl font-bold text-teal-600">{stakePerformance.totalWards}</div>
                  <div className="text-gray-600">Total Wards</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-teal-600">{stakePerformance.totalBranches}</div>
                  <div className="text-gray-600">Total Branches</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-teal-600">{stakePerformance.totalGroups}</div>
                  <div className="text-gray-600">Total Groups</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-teal-600">{stakePerformance.totalParticipants}</div>
                  <div className="text-gray-600">Total Participants</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-teal-600">{stakePerformance.activePrograms}/{stakePerformance.totalPrograms}</div>
                  <div className="text-gray-600">Active Programs</div>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-gray-50 rounded-xl p-6 text-center">
                  <div className="text-4xl font-bold text-teal-600 mb-2">{stakePerformance.averageStakeProgress}%</div>
                  <div className="text-gray-600">Average Stake Progress</div>
                </div>
                <div className="bg-green-50 rounded-xl p-6 text-center">
                  <div className="text-xl font-semibold text-green-800 mb-2">Top Performer</div>
                  <div className="text-2xl font-bold text-green-600">{stakePerformance.topPerformingWard}</div>
                </div>
                <div className="bg-yellow-50 rounded-xl p-6 text-center">
                  <div className="text-xl font-semibold text-yellow-800 mb-2">Needs Attention</div>
                  <div className="text-2xl font-bold text-yellow-600">{stakePerformance.lowestPerformingWard}</div>
                </div>
              </div>
            </div>

            {/* Progress Chart */}
            <div className="bg-white rounded-3xl shadow-2xl p-8 border border-teal-200 shadow-teal-100">
              <h3 className="text-xl font-semibold text-gray-800 mb-6">Ward Progress Overview</h3>
              <div className="space-y-4">
                {wards.map(ward => (
                  <div key={ward.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-4">
                      <div className="w-32 font-medium text-gray-800">{ward.name}</div>
                      <div className="w-24 text-sm text-gray-600">{ward.type}</div>
                      <div className="w-20 text-sm text-gray-600">{ward.totalParticipants} participants</div>
                    </div>
                    <div className="flex items-center space-x-4">
                      <div className="w-32">
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-teal-500 h-2 rounded-full transition-all duration-300"
                            style={{ width: `${ward.averageProgress}%` }}
                          ></div>
                        </div>
                      </div>
                      <div className="w-16 text-right font-semibold text-teal-600">{ward.averageProgress}%</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'wards' && (
          <div className="bg-white rounded-3xl shadow-2xl p-8 border border-teal-200 shadow-teal-100">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
              <h2 className="text-2xl font-bold text-gray-800">Detailed Ward Progress</h2>
              <select
                value={selectedWard}
                onChange={(e) => setSelectedWard(e.target.value)}
                className="px-4 py-2 border-2 border-gray-200 rounded-xl focus:border-teal-400 focus:ring-4 focus:ring-teal-50 transition-all duration-200"
              >
                <option value="all">All Wards & Branches</option>
                {wards.map(ward => (
                  <option key={ward.id} value={ward.id}>{ward.name}</option>
                ))}
              </select>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredWards.map(ward => (
                <div key={ward.id} className="bg-gray-50 rounded-xl p-6 border border-gray-200">
                  <div className="flex justify-between items-start mb-3">
                    <h3 className="text-lg font-semibold text-gray-800">{ward.name}</h3>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      ward.type === 'ward' ? 'bg-blue-100 text-blue-800' : 'bg-purple-100 text-purple-800'
                    }`}>
                      {ward.type}
                    </span>
                  </div>
                  <div className="space-y-2 text-sm mb-4">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Groups:</span>
                      <span className="font-medium text-gray-800">{ward.activeGroups}/{ward.totalGroups}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Participants:</span>
                      <span className="font-medium text-gray-800">{ward.totalParticipants}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Progress:</span>
                      <span className="font-medium text-teal-600">{ward.averageProgress}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Last Report:</span>
                      <span className="font-medium text-gray-800">{ward.lastReportDate}</span>
                    </div>
                  </div>
                  <div className="border-t border-gray-200 pt-3">
                    <div className="text-xs text-gray-600 mb-2">Leadership:</div>
                    <div className="text-xs">
                      <div><span className="font-medium">EQ President:</span> {ward.eqPresident}</div>
                      <div><span className="font-medium">Bishop:</span> {ward.bishop}</div>
                    </div>
                  </div>
                  <div className="mt-4">
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-teal-500 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${ward.averageProgress}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'reports' && (
          <div className="bg-white rounded-3xl shadow-2xl p-8 border border-teal-200 shadow-teal-100">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
              <h2 className="text-2xl font-bold text-gray-800">Stake Committee Reports</h2>
              <div className="flex space-x-4">
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value as any)}
                  className="px-4 py-2 border-2 border-gray-200 rounded-xl focus:border-teal-400 focus:ring-4 focus:ring-teal-50 transition-all duration-200"
                >
                  <option value="all">All Categories</option>
                  <option value="recommendation">Recommendations</option>
                  <option value="concern">Concerns</option>
                  <option value="update">Updates</option>
                  <option value="request">Requests</option>
                </select>
                <select
                  value={selectedPriority}
                  onChange={(e) => setSelectedPriority(e.target.value as any)}
                  className="px-4 py-2 border-2 border-gray-200 rounded-xl focus:border-teal-400 focus:ring-4 focus:ring-teal-50 transition-all duration-200"
                >
                  <option value="all">All Priorities</option>
                  <option value="low">Low Priority</option>
                  <option value="normal">Normal Priority</option>
                  <option value="high">High Priority</option>
                </select>
                <select
                  value={selectedWard}
                  onChange={(e) => setSelectedWard(e.target.value)}
                  className="px-4 py-2 border-2 border-gray-200 rounded-xl focus:border-teal-400 focus:ring-4 focus:ring-teal-50 transition-all duration-200"
                >
                  <option value="all">All Wards</option>
                  {wards.map(ward => (
                    <option key={ward.id} value={ward.id}>{ward.name}</option>
                  ))}
                </select>
              </div>
            </div>
            
            <div className="space-y-6">
              {filteredReports.map(report => (
                <div key={report.id} className="bg-gray-50 rounded-xl p-6 border border-gray-200">
                  <div className="flex flex-col lg:flex-row justify-between items-start gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-3">
                        <h3 className="text-lg font-semibold text-gray-800">{report.title}</h3>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(report.status)}`}>
                          {report.status}
                        </span>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(report.priority)}`}>
                          {report.priority}
                        </span>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getCategoryColor(report.category)}`}>
                          {report.category}
                        </span>
                      </div>
                      <p className="text-gray-600 mb-3">{report.content}</p>
                      <div className="text-sm text-gray-500 mb-3">
                        <span>Submitted by: {report.submittedBy}</span>
                        <span className="mx-2">•</span>
                        <span>Date: {report.submittedDate}</span>
                        {report.wardName && (
                          <>
                            <span className="mx-2">•</span>
                            <span>Ward: {report.wardName}</span>
                          </>
                        )}
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
                      {report.response && (
                        <div className="mt-3 p-3 bg-blue-50 rounded-lg">
                          <div className="text-sm font-medium text-blue-800 mb-1">Response:</div>
                          <div className="text-sm text-blue-700">{report.response}</div>
                          {report.responseDate && (
                            <div className="text-xs text-blue-600 mt-1">Response Date: {report.responseDate}</div>
                          )}
                        </div>
                      )}
                    </div>
                    <div className="flex flex-col gap-2">
                      {report.status === 'pending' && (
                        <>
                          <button
                            onClick={() => handleUpdateReportStatus(report.id, 'approved')}
                            className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white text-sm rounded-lg transition-colors"
                          >
                            Approve
                          </button>
                          <button
                            onClick={() => handleUpdateReportStatus(report.id, 'rejected')}
                            className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white text-sm rounded-lg transition-colors"
                          >
                            Reject
                          </button>
                        </>
                      )}
                      {report.status === 'approved' && (
                        <button
                          onClick={() => handleUpdateReportStatus(report.id, 'implemented')}
                          className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white text-sm rounded-lg transition-colors"
                        >
                          Mark Implemented
                        </button>
                      )}
                    </div>
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

export default StakePresident;

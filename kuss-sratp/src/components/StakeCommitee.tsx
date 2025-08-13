//view progress and request for reports
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
}

interface ProgressReport {
  id: string;
  wardId: string;
  wardName: string;
  requestedDate: string;
  dueDate: string;
  status: 'pending' | 'submitted' | 'overdue';
  priority: 'low' | 'normal' | 'high';
  submittedDate?: string;
  reportData?: any;
}

interface StakePerformance {
  totalWards: number;
  totalBranches: number;
  totalGroups: number;
  totalParticipants: number;
  averageStakeProgress: number;
  topPerformingWard: string;
  lowestPerformingWard: string;
}

const StakeCommitee: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'overview' | 'wards' | 'reports'>('overview');
  const [selectedWard, setSelectedWard] = useState('all');
  const [selectedType, setSelectedType] = useState<'all' | 'ward' | 'branch'>('all');

  const [wards, setWards] = useState<Ward[]>([
    { id: '1', name: 'Ward 1', type: 'ward', totalGroups: 8, activeGroups: 7, totalParticipants: 45, averageProgress: 78, lastReportDate: '2024-03-15' },
    { id: '2', name: 'Ward 2', type: 'ward', totalGroups: 6, activeGroups: 5, totalParticipants: 32, averageProgress: 65, lastReportDate: '2024-03-12' },
    { id: '3', name: 'Ward 3', type: 'ward', totalGroups: 7, activeGroups: 6, totalParticipants: 38, averageProgress: 82, lastReportDate: '2024-03-18' },
    { id: '4', name: 'Branch A', type: 'branch', totalGroups: 4, activeGroups: 3, totalParticipants: 18, averageProgress: 71, lastReportDate: '2024-03-10' },
    { id: '5', name: 'Branch B', type: 'branch', totalGroups: 3, activeGroups: 2, totalParticipants: 15, averageProgress: 58, lastReportDate: '2024-03-08' },
  ]);

  const [progressReports, setProgressReports] = useState<ProgressReport[]>([
    { id: '1', wardId: '1', wardName: 'Ward 1', requestedDate: '2024-03-10', dueDate: '2024-03-20', status: 'submitted', priority: 'normal', submittedDate: '2024-03-15' },
    { id: '2', wardId: '2', wardName: 'Ward 2', requestedDate: '2024-03-12', dueDate: '2024-03-22', status: 'pending', priority: 'normal' },
    { id: '3', wardId: '4', wardName: 'Branch A', requestedDate: '2024-03-08', dueDate: '2024-03-18', status: 'overdue', priority: 'high' },
  ]);

  const [newReportRequest, setNewReportRequest] = useState({ wardId: '', dueDate: '', priority: 'normal' });

  const stakePerformance: StakePerformance = {
    totalWards: wards.filter(w => w.type === 'ward').length,
    totalBranches: wards.filter(w => w.type === 'branch').length,
    totalGroups: wards.reduce((sum, ward) => sum + ward.totalGroups, 0),
    totalParticipants: wards.reduce((sum, ward) => sum + ward.totalParticipants, 0),
    averageStakeProgress: Math.round(wards.reduce((sum, ward) => sum + ward.averageProgress, 0) / wards.length),
    topPerformingWard: wards.reduce((top, ward) => ward.averageProgress > top.averageProgress ? ward : top).name,
    lowestPerformingWard: wards.reduce((lowest, ward) => ward.averageProgress < lowest.averageProgress ? ward : lowest).name,
  };

  const filteredWards = wards.filter(ward => {
    if (selectedWard !== 'all' && ward.id !== selectedWard) return false;
    if (selectedType !== 'all' && ward.type !== selectedType) return false;
    return true;
  });

  const handleRequestReport = () => {
    if (newReportRequest.wardId && newReportRequest.dueDate) {
      const ward = wards.find(w => w.id === newReportRequest.wardId);
      const report: ProgressReport = {
        id: Date.now().toString(),
        wardId: newReportRequest.wardId,
        wardName: ward?.name || 'Unknown',
        requestedDate: new Date().toISOString().split('T')[0],
        dueDate: newReportRequest.dueDate,
        status: 'pending',
        priority: newReportRequest.priority as 'low' | 'normal' | 'high'
      };
      setProgressReports([...progressReports, report]);
      setNewReportRequest({ wardId: '', dueDate: '', priority: 'normal' });
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'submitted': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'overdue': return 'bg-red-100 text-red-800';
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

  return (
    <div className="min-h-screen bg-white p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-3xl shadow-2xl p-8 mb-8 border border-teal-200 shadow-teal-100">
          <h1 className="text-4xl font-bold text-gray-800 mb-4">Stake Committee Dashboard</h1>
          <p className="text-gray-600 text-lg">Monitor stake-wide progress and request reports from wards and branches</p>
        </div>

        {/* Navigation Tabs */}
        <div className="flex space-x-2 mb-8">
          {[
            { id: 'overview', label: 'Stake Overview' },
            { id: 'wards', label: 'Ward/Branch Progress' },
            { id: 'reports', label: 'Report Requests' }
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
              <h2 className="text-2xl font-bold text-gray-800 mb-6">Stake Performance Summary</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
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
              </div>
              
              <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
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

            {/* Recent Activity */}
            <div className="bg-white rounded-3xl shadow-2xl p-8 border border-teal-200 shadow-teal-100">
              <h3 className="text-xl font-semibold text-gray-800 mb-4">Recent Activity</h3>
              <div className="space-y-3">
                {progressReports.slice(0, 5).map(report => (
                  <div key={report.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <span className="font-medium text-gray-800">{report.wardName}</span>
                      <span className="text-gray-600 ml-2">- Report {report.status}</span>
                    </div>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(report.status)}`}>
                      {report.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'wards' && (
          <div className="bg-white rounded-3xl shadow-2xl p-8 border border-teal-200 shadow-teal-100">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
              <h2 className="text-2xl font-bold text-gray-800">Ward/Branch Progress</h2>
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
                  value={selectedType}
                  onChange={(e) => setSelectedType(e.target.value as any)}
                  className="px-4 py-2 border-2 border-gray-200 rounded-xl focus:border-teal-400 focus:ring-4 focus:ring-teal-50 transition-all duration-200"
                >
                  <option value="all">All Types</option>
                  <option value="ward">Wards Only</option>
                  <option value="branch">Branches Only</option>
                </select>
              </div>
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
                  <div className="space-y-2 text-sm">
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
            <h2 className="text-2xl font-bold text-gray-800 mb-6">Request Progress Report</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
              <select
                value={newReportRequest.wardId}
                onChange={(e) => setNewReportRequest({...newReportRequest, wardId: e.target.value})}
                className="px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-teal-400 focus:ring-4 focus:ring-teal-50 transition-all duration-200"
              >
                <option value="">Select Ward/Branch</option>
                {wards.map(ward => (
                  <option key={ward.id} value={ward.id}>{ward.name}</option>
                ))}
              </select>
              <input
                type="date"
                value={newReportRequest.dueDate}
                onChange={(e) => setNewReportRequest({...newReportRequest, dueDate: e.target.value})}
                className="px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-teal-400 focus:ring-4 focus:ring-teal-50 transition-all duration-200"
              />
              <select
                value={newReportRequest.priority}
                onChange={(e) => setNewReportRequest({...newReportRequest, priority: e.target.value})}
                className="px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-teal-400 focus:ring-4 focus:ring-teal-50 transition-all duration-200"
              >
                <option value="low">Low Priority</option>
                <option value="normal">Normal Priority</option>
                <option value="high">High Priority</option>
              </select>
            </div>
            <button
              onClick={handleRequestReport}
              className="bg-teal-500 hover:bg-teal-600 text-white font-semibold py-3 px-8 rounded-xl transition-all duration-200 transform hover:-translate-y-1 hover:shadow-lg"
            >
              Request Report
            </button>

            <div className="mt-8">
              <h3 className="text-xl font-semibold text-gray-800 mb-4">Report Requests</h3>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left py-3 px-4 text-gray-700 font-semibold">Ward/Branch</th>
                      <th className="text-left py-3 px-4 text-gray-700 font-semibold">Requested</th>
                      <th className="text-left py-3 px-4 text-gray-700 font-semibold">Due Date</th>
                      <th className="text-left py-3 px-4 text-gray-700 font-semibold">Priority</th>
                      <th className="text-left py-3 px-4 text-gray-700 font-semibold">Status</th>
                      <th className="text-left py-3 px-4 text-gray-700 font-semibold">Submitted</th>
                    </tr>
                  </thead>
                  <tbody>
                    {progressReports.map(report => (
                      <tr key={report.id} className="border-b border-gray-100 hover:bg-gray-50">
                        <td className="py-3 px-4 text-gray-800 font-medium">{report.wardName}</td>
                        <td className="py-3 px-4 text-gray-800">{report.requestedDate}</td>
                        <td className="py-3 px-4 text-gray-800">{report.dueDate}</td>
                        <td className="py-3 px-4">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(report.priority || 'normal')}`}>
                            {report.priority || 'normal'}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(report.status)}`}>
                            {report.status}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-gray-800">{report.submittedDate || '-'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default StakeCommitee;
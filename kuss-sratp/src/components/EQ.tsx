import { useState } from 'react';

interface Group {
  id: string;
  name: string;
  participants: number;
  progress: number;
  instructor: string;
  startDate: string;
  status: 'active' | 'completed' | 'pending';
}

interface ProgressReport {
  id: string;
  groupId: string;
  date: string;
  attendance: number;
  assignments: number;
  completedAssignments: number;
  notes: string;
  submittedBy: string;
}

const EQ: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'groups' | 'progress' | 'reports'>('groups');
  const [groups, setGroups] = useState<Group[]>([
    { id: '1', name: 'Self-Reliance Group A', participants: 12, progress: 75, instructor: 'John Smith', startDate: '2024-01-15', status: 'active' },
    { id: '2', name: 'Financial Literacy Class', participants: 8, progress: 60, instructor: 'Sarah Johnson', startDate: '2024-02-01', status: 'active' },
    { id: '3', name: 'Career Development Group', participants: 10, progress: 45, instructor: 'Michael Brown', startDate: '2024-01-20', status: 'pending' },
  ]);

  const [progressReports, setProgressReports] = useState<ProgressReport[]>([
    { id: '1', groupId: '1', date: '2024-03-15', attendance: 10, assignments: 8, completedAssignments: 7, notes: 'Good participation, some assignments pending', submittedBy: 'John Smith' },
    { id: '2', groupId: '2', date: '2024-03-10', attendance: 6, assignments: 6, completedAssignments: 5, notes: 'Class progressing well, financial concepts well received', submittedBy: 'Sarah Johnson' },
  ]);

  const [newGroup, setNewGroup] = useState({ name: '', instructor: '', startDate: '', participants: '' });
  const [newReport, setNewReport] = useState({ groupId: '', attendance: '', assignments: '', completedAssignments: '', notes: '' });

  const handleAddGroup = () => {
    if (newGroup.name && newGroup.instructor && newGroup.startDate && newGroup.participants) {
      const group: Group = {
        id: Date.now().toString(),
        name: newGroup.name,
        participants: parseInt(newGroup.participants),
        progress: 0,
        instructor: newGroup.instructor,
        startDate: newGroup.startDate,
        status: 'pending'
      };
      setGroups([...groups, group]);
      setNewGroup({ name: '', instructor: '', startDate: '', participants: '' });
    }
  };

  const handleSubmitReport = () => {
    if (newReport.groupId && newReport.attendance && newReport.assignments && newReport.completedAssignments) {
      const report: ProgressReport = {
        id: Date.now().toString(),
        groupId: newReport.groupId,
        date: new Date().toISOString().split('T')[0],
        attendance: parseInt(newReport.attendance),
        assignments: parseInt(newReport.assignments),
        completedAssignments: parseInt(newReport.completedAssignments),
        notes: newReport.notes,
        submittedBy: 'EQ President'
      };
      setProgressReports([...progressReports, report]);
      setNewReport({ groupId: '', attendance: '', assignments: '', completedAssignments: '', notes: '' });
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'completed': return 'bg-blue-100 text-blue-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="min-h-screen bg-white p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-3xl shadow-2xl p-8 mb-8 border border-teal-200 shadow-teal-100">
          <h1 className="text-4xl font-bold text-gray-800 mb-4">Elder's Quorum Dashboard</h1>
          <p className="text-gray-600 text-lg">Manage groups, track progress, and submit progress reports</p>
        </div>

        {/* Navigation Tabs */}
        <div className="flex space-x-2 mb-8">
          {[
            { id: 'groups', label: 'Group Management' },
            { id: 'progress', label: 'View Progress' },
            { id: 'reports', label: 'Submit Reports' }
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
        {activeTab === 'groups' && (
          <div className="bg-white rounded-3xl shadow-2xl p-8 border border-teal-200 shadow-teal-100">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">Assign New Group</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
              <input
                type="text"
                placeholder="Group Name"
                value={newGroup.name}
                onChange={(e) => setNewGroup({...newGroup, name: e.target.value})}
                className="px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-teal-400 focus:ring-4 focus:ring-teal-50 transition-all duration-200"
              />
              <input
                type="text"
                placeholder="Instructor Name"
                value={newGroup.instructor}
                onChange={(e) => setNewGroup({...newGroup, instructor: e.target.value})}
                className="px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-teal-400 focus:ring-4 focus:ring-teal-50 transition-all duration-200"
              />
              <input
                type="date"
                value={newGroup.startDate}
                onChange={(e) => setNewGroup({...newGroup, startDate: e.target.value})}
                className="px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-teal-400 focus:ring-4 focus:ring-teal-50 transition-all duration-200"
              />
              <input
                type="number"
                placeholder="Expected Participants"
                value={newGroup.participants}
                onChange={(e) => setNewGroup({...newGroup, participants: e.target.value})}
                className="px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-teal-400 focus:ring-4 focus:ring-teal-50 transition-all duration-200"
              />
            </div>
            <button
              onClick={handleAddGroup}
              className="bg-teal-500 hover:bg-teal-600 text-white font-semibold py-3 px-8 rounded-xl transition-all duration-200 transform hover:-translate-y-1 hover:shadow-lg"
            >
              Assign Group
            </button>

            <div className="mt-8">
              <h3 className="text-xl font-semibold text-gray-800 mb-4">Assigned Groups</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {groups.map(group => (
                  <div key={group.id} className="bg-gray-50 rounded-xl p-6 border border-gray-200">
                    <div className="flex justify-between items-start mb-3">
                      <h4 className="text-lg font-semibold text-gray-800">{group.name}</h4>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(group.status)}`}>
                        {group.status}
                      </span>
                    </div>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Instructor:</span>
                        <span className="font-medium text-gray-800">{group.instructor}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Participants:</span>
                        <span className="font-medium text-gray-800">{group.participants}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Progress:</span>
                        <span className="font-medium text-teal-600">{group.progress}%</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Started:</span>
                        <span className="font-medium text-gray-800">{group.startDate}</span>
                      </div>
                    </div>
                    <div className="mt-4">
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-teal-500 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${group.progress}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'progress' && (
          <div className="bg-white rounded-3xl shadow-2xl p-8 border border-teal-200 shadow-teal-100">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">Group Progress Overview</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {groups.map(group => (
                <div key={group.id} className="bg-gray-50 rounded-xl p-6 border border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4">{group.name}</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Overall Progress</span>
                      <span className="text-2xl font-bold text-teal-600">{group.progress}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-3">
                      <div 
                        className="bg-teal-500 h-3 rounded-full transition-all duration-300"
                        style={{ width: `${group.progress}%` }}
                      ></div>
                    </div>
                    <div className="grid grid-cols-2 gap-4 pt-3">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-gray-800">{group.participants}</div>
                        <div className="text-xs text-gray-600">Participants</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-teal-600">{group.instructor}</div>
                        <div className="text-xs text-gray-600">Instructor</div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'reports' && (
          <div className="bg-white rounded-3xl shadow-2xl p-8 border border-teal-200 shadow-teal-100">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">Submit Progress Report</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
              <select
                value={newReport.groupId}
                onChange={(e) => setNewReport({...newReport, groupId: e.target.value})}
                className="px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-teal-400 focus:ring-4 focus:ring-teal-50 transition-all duration-200"
              >
                <option value="">Select Group</option>
                {groups.map(group => (
                  <option key={group.id} value={group.id}>{group.name}</option>
                ))}
              </select>
              <input
                type="number"
                placeholder="Attendance Count"
                value={newReport.attendance}
                onChange={(e) => setNewReport({...newReport, attendance: e.target.value})}
                className="px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-teal-400 focus:ring-4 focus:ring-teal-50 transition-all duration-200"
              />
              <input
                type="number"
                placeholder="Total Assignments"
                value={newReport.assignments}
                onChange={(e) => setNewReport({...newReport, assignments: e.target.value})}
                className="px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-teal-400 focus:ring-4 focus:ring-teal-50 transition-all duration-200"
              />
              <input
                type="number"
                placeholder="Completed Assignments"
                value={newReport.completedAssignments}
                onChange={(e) => setNewReport({...newReport, completedAssignments: e.target.value})}
                className="px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-teal-400 focus:ring-4 focus:ring-teal-50 transition-all duration-200"
              />
              <textarea
                placeholder="Additional Notes"
                value={newReport.notes}
                onChange={(e) => setNewReport({...newReport, notes: e.target.value})}
                className="px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-teal-400 focus:ring-4 focus:ring-teal-50 transition-all duration-200 md:col-span-2 lg:col-span-3"
                rows={3}
              />
            </div>
            <button
              onClick={handleSubmitReport}
              className="bg-teal-500 hover:bg-teal-600 text-white font-semibold py-3 px-8 rounded-xl transition-all duration-200 transform hover:-translate-y-1 hover:shadow-lg"
            >
              Submit Report
            </button>

            <div className="mt-8">
              <h3 className="text-xl font-semibold text-gray-800 mb-4">Recent Progress Reports</h3>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left py-3 px-4 text-gray-700 font-semibold">Date</th>
                      <th className="text-left py-3 px-4 text-gray-700 font-semibold">Group</th>
                      <th className="text-left py-3 px-4 text-gray-700 font-semibold">Attendance</th>
                      <th className="text-left py-3 px-4 text-gray-700 font-semibold">Completed</th>
                      <th className="text-left py-3 px-4 text-gray-700 font-semibold">Notes</th>
                      <th className="text-left py-3 px-4 text-gray-700 font-semibold">Submitted By</th>
                    </tr>
                  </thead>
                  <tbody>
                    {progressReports.map(report => (
                      <tr key={report.id} className="border-b border-gray-100 hover:bg-gray-50">
                        <td className="py-3 px-4 text-gray-800">{report.date}</td>
                        <td className="py-3 px-4 text-gray-800">{groups.find(g => g.id === report.groupId)?.name || 'Unknown'}</td>
                        <td className="py-3 px-4 text-gray-800">{report.attendance}</td>
                        <td className="py-3 px-4 text-teal-600 font-semibold">{report.completedAssignments}/{report.assignments}</td>
                        <td className="py-3 px-4 text-gray-800 max-w-xs truncate">{report.notes}</td>
                        <td className="py-3 px-4 text-gray-800">{report.submittedBy}</td>
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

export default EQ;
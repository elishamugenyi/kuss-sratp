import { useState } from 'react';

interface User {
  id: string;
  name: string;
  role: string;
  ward: string;
  email: string;
}

interface Group {
  id: string;
  name: string;
  type: string;
  participants: number;
  progress: number;
  instructor: string;
  startDate: string;
}

interface Participant {
  id: string;
  name: string;
  group: string;
  attendance: number;
  assignments: number;
  completedAssignments: number;
  lastAttendance: string;
}

const Bishop: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'users' | 'groups' | 'search'>('users');
  const [users, setUsers] = useState<User[]>([
    { id: '1', name: 'John Smith', role: "Elder's Quorum", ward: 'Ward 1', email: 'john.smith@email.com' },
    { id: '2', name: 'Sarah Johnson', role: 'Instructor', ward: 'Ward 2', email: 'sarah.j@email.com' },
    { id: '3', name: 'Michael Brown', role: 'Relief Society', ward: 'Ward 1', email: 'michael.b@email.com' },
  ]);

  const [groups, setGroups] = useState<Group[]>([
    { id: '1', name: 'Self-Reliance Group A', type: "Elder's Quorum", participants: 12, progress: 75, instructor: 'John Smith', startDate: '2024-01-15' },
    { id: '2', name: 'Financial Literacy Class', type: 'Instructor', participants: 8, progress: 60, instructor: 'Sarah Johnson', startDate: '2024-02-01' },
    { id: '3', name: 'Relief Society Group B', type: 'Relief Society', participants: 15, progress: 45, instructor: 'Michael Brown', startDate: '2024-01-20' },
  ]);

  const [participants, setParticipants] = useState<Participant[]>([
    { id: '1', name: 'David Wilson', group: 'Self-Reliance Group A', attendance: 8, assignments: 10, completedAssignments: 8, lastAttendance: '2024-03-15' },
    { id: '2', name: 'Emily Davis', group: 'Financial Literacy Class', attendance: 6, assignments: 8, completedAssignments: 6, lastAttendance: '2024-03-10' },
    { id: '3', name: 'Robert Miller', group: 'Relief Society Group B', attendance: 10, assignments: 12, completedAssignments: 9, lastAttendance: '2024-03-18' },
  ]);

  const [newUser, setNewUser] = useState({ name: '', role: '', ward: '', email: '' });
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedWard, setSelectedWard] = useState('all');

  const roles = ["Elder's Quorum", "Instructor", "Relief Society"];
  const wards = ["Ward 1", "Ward 2", "Ward 3", "Ward 4"];

  const handleAddUser = () => {
    if (newUser.name && newUser.role && newUser.ward && newUser.email) {
      const user: User = {
        id: Date.now().toString(),
        ...newUser
      };
      setUsers([...users, user]);
      setNewUser({ name: '', role: '', ward: '', email: '' });
    }
  };

  const filteredGroups = groups.filter(group => 
    selectedWard === 'all' || group.type === selectedWard
  );

  const filteredParticipants = participants.filter(participant =>
    participant.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    participant.group.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-white p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-3xl shadow-2xl p-8 mb-8 border border-teal-200 shadow-teal-100">
          <h1 className="text-4xl font-bold text-gray-800 mb-4">Bishop Dashboard</h1>
          <p className="text-gray-600 text-lg">Manage users, track progress, and monitor self-reliance groups</p>
        </div>

        {/* Navigation Tabs */}
        <div className="flex space-x-2 mb-8">
          {[
            { id: 'users', label: 'User Management' },
            { id: 'groups', label: 'Group Progress' },
            { id: 'search', label: 'Search Participants' }
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
        {activeTab === 'users' && (
          <div className="bg-white rounded-3xl shadow-2xl p-8 border border-teal-200 shadow-teal-100">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">Add New User</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
              <input
                type="text"
                placeholder="Full Name"
                value={newUser.name}
                onChange={(e) => setNewUser({...newUser, name: e.target.value})}
                className="px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-teal-400 focus:ring-4 focus:ring-teal-50 transition-all duration-200"
              />
              <select
                value={newUser.role}
                onChange={(e) => setNewUser({...newUser, role: e.target.value})}
                className="px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-teal-400 focus:ring-4 focus:ring-teal-50 transition-all duration-200"
              >
                <option value="">Select Role</option>
                {roles.map(role => (
                  <option key={role} value={role}>{role}</option>
                ))}
              </select>
              <select
                value={newUser.ward}
                onChange={(e) => setNewUser({...newUser, ward: e.target.value})}
                className="px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-teal-400 focus:ring-4 focus:ring-teal-50 transition-all duration-200"
              >
                <option value="">Select Ward</option>
                {wards.map(ward => (
                  <option key={ward} value={ward}>{ward}</option>
                ))}
              </select>
              <input
                type="email"
                placeholder="Email"
                value={newUser.email}
                onChange={(e) => setNewUser({...newUser, email: e.target.value})}
                className="px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-teal-400 focus:ring-4 focus:ring-teal-50 transition-all duration-200"
              />
            </div>
            <button
              onClick={handleAddUser}
              className="bg-teal-500 hover:bg-teal-600 text-white font-semibold py-3 px-8 rounded-xl transition-all duration-200 transform hover:-translate-y-1 hover:shadow-lg"
            >
              Add User
            </button>

            <div className="mt-8">
              <h3 className="text-xl font-semibold text-gray-800 mb-4">Current Users</h3>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left py-3 px-4 text-gray-700 font-semibold">Name</th>
                      <th className="text-left py-3 px-4 text-gray-700 font-semibold">Role</th>
                      <th className="text-left py-3 px-4 text-gray-700 font-semibold">Ward</th>
                      <th className="text-left py-3 px-4 text-gray-700 font-semibold">Email</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map(user => (
                      <tr key={user.id} className="border-b border-gray-100 hover:bg-gray-50">
                        <td className="py-3 px-4 text-gray-800">{user.name}</td>
                        <td className="py-3 px-4 text-gray-800">{user.role}</td>
                        <td className="py-3 px-4 text-gray-800">{user.ward}</td>
                        <td className="py-3 px-4 text-gray-800">{user.email}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'groups' && (
          <div className="bg-white rounded-3xl shadow-2xl p-8 border border-teal-200 shadow-teal-100">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-800">Group Progress</h2>
              <select
                value={selectedWard}
                onChange={(e) => setSelectedWard(e.target.value)}
                className="px-4 py-2 border-2 border-gray-200 rounded-xl focus:border-teal-400 focus:ring-4 focus:ring-teal-50 transition-all duration-200"
              >
                <option value="all">All Groups</option>
                {roles.map(role => (
                  <option key={role} value={role}>{role}</option>
                ))}
              </select>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredGroups.map(group => (
                <div key={group.id} className="bg-gray-50 rounded-xl p-6 border border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-800 mb-2">{group.name}</h3>
                  <p className="text-gray-600 mb-4">{group.type}</p>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Participants:</span>
                      <span className="font-semibold text-gray-800">{group.participants}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Progress:</span>
                      <span className="font-semibold text-teal-600">{group.progress}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Instructor:</span>
                      <span className="font-semibold text-gray-800">{group.instructor}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Started:</span>
                      <span className="font-semibold text-gray-800">{group.startDate}</span>
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
        )}

        {activeTab === 'search' && (
          <div className="bg-white rounded-3xl shadow-2xl p-8 border border-teal-200 shadow-teal-100">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">Search Participants</h2>
            <div className="mb-6">
              <input
                type="text"
                placeholder="Search by name or group..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-teal-400 focus:ring-4 focus:ring-teal-50 transition-all duration-200"
              />
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-4 text-gray-700 font-semibold">Name</th>
                    <th className="text-left py-3 px-4 text-gray-700 font-semibold">Group</th>
                    <th className="text-left py-3 px-4 text-gray-700 font-semibold">Attendance</th>
                    <th className="text-left py-3 px-4 text-gray-700 font-semibold">Assignments</th>
                    <th className="text-left py-3 px-4 text-gray-700 font-semibold">Completed</th>
                    <th className="text-left py-3 px-4 text-gray-700 font-semibold">Last Attendance</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredParticipants.map(participant => (
                    <tr key={participant.id} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-3 px-4 text-gray-800 font-medium">{participant.name}</td>
                      <td className="py-3 px-4 text-gray-800">{participant.group}</td>
                      <td className="py-3 px-4 text-gray-800">{participant.attendance}</td>
                      <td className="py-3 px-4 text-gray-800">{participant.assignments}</td>
                      <td className="py-3 px-4 text-teal-600 font-semibold">{participant.completedAssignments}</td>
                      <td className="py-3 px-4 text-gray-800">{participant.lastAttendance}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Bishop; 
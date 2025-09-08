import { useState, useEffect, useCallback, useMemo } from 'react';
import { useApi } from '../hooks/useApi';
import { useAuth } from '../contexts/AuthContext';
import { config } from '../config/config';
import { apiService } from '../services/api';

interface User {
  id: number;
  created_at: string;
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
  const [activeTab, setActiveTab] = useState<'users' | 'groups' | 'View participants'>('users');
  const [users, setUsers] = useState<User[]>([]);
  const [groups, setGroups] = useState<Group[]>([]);
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [newUser, setNewUser] = useState({ name: '', role: '', ward: '', email: '' });
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedWard, setSelectedWard] = useState('all');
  const [selectedParticipantsGroup, setSelectedParticipantsGroup] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  // const [authError, setAuthError] = useState<string | null>(null);
  // const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  // Email-based participant search state
  const [emailQuery, setEmailQuery] = useState('');
  const [participantReport, setParticipantReport] = useState<any | null>(null);
  const [participantsLoading, setParticipantsLoading] = useState(false);
  const [participantsError, setParticipantsError] = useState('');

  const { post, get } = useApi();
  const { isAuthenticated, user } = useAuth();

  const roles = [
    { value: 'eq', label: "Elder's Quorum" },
    { value: 'rs', label: 'Relief Society' },
    { value: 'instructor', label: 'Instructor' },
    {value: 'student', label: 'Student'}
  ];

  // Inside your Bishop component
  const [sortKey, setSortKey] = useState<'name' | 'role'>('name');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

  // users should be your existing ward-scoped array from GET /auth/add_user
  const filteredAndSortedUsers = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();

    const filtered = term
      ? users.filter(u => u.name?.toLowerCase().includes(term))
      : users;

    const sorted = [...filtered].sort((a, b) => {
      const aVal = (a[sortKey] || '').toLowerCase();
      const bVal = (b[sortKey] || '').toLowerCase();
      if (aVal < bVal) return sortOrder === 'asc' ? -1 : 1;
      if (aVal > bVal) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });

    return sorted;
  }, [users, searchTerm, sortKey, sortOrder]);

  // Fetch users from the API
  const fetchUsers = useCallback(async () => {
    if (!isAuthenticated || !user) {
      setError('Authentication required - please log in');
      return;
    }

    try {
      setIsLoading(true);
      setError('');
      
      const response = await get(config.API_ENDPOINTS.ADD_USER);
      
      if (response.ok) {
        const data = await response.json();
        
        if (data.success && data.users) {
          setUsers(data.users);
          setError(''); // Clear any previous errors
        } else {
          setError('Failed to fetch users - unexpected response format');
        }
      } else {
        try {
          const errorData = await response.json();
          setError(`Failed to fetch users: ${response.status} - ${errorData.message || response.statusText}`);
        } catch (parseError) {
          setError(`Failed to fetch users: ${response.status} ${response.statusText}`);
        }
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      setError(`Failed to fetch users: ${errorMessage}`);
    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated, user, get]);

  // Automatically fetch users when component mounts and user is authenticated
  useEffect(() => {
    if (isAuthenticated && user?.ward) {
      setNewUser(prev => ({ ...prev, ward: user.ward }));
      fetchUsers();
    }
  }, [isAuthenticated, user?.ward, fetchUsers]);

  // Also refresh users whenever the Users tab becomes active
  useEffect(() => {
    if (activeTab === 'users' && isAuthenticated && user?.ward) {
      fetchUsers();
    }
  }, [activeTab, isAuthenticated, user?.ward, fetchUsers]);

  const handleAddUser = async () => {
    if (!isAuthenticated || !user) {
      setError('Authentication required');
      return;
    }

    if (!newUser.name || !newUser.role || !newUser.ward || !newUser.email) {
      setError('Please fill in all fields');
      return;
    }

    try {
      setIsLoading(true);
      setError('');

      const userData = {
        name: newUser.name,
        role: newUser.role,
        ward: newUser.ward,
        email: newUser.email
      };
      
      const response = await post(config.API_ENDPOINTS.ADD_USER, userData);
      
      if (response.ok) {
        const data = await response.json();
        
        if (data.success) {
          // Refresh the users list to show the new user
          await fetchUsers();
          // Clear the form
          setNewUser({ name: '', role: '', ward: '', email: '' });
          // Show success message
          setSuccessMessage(data.message || 'User added successfully!');
          setError('');
        } else {
          setError(data.message || 'Failed to add user');
        }
      } else {
        try {
          const errorData = await response.json();
          setError(errorData.message || `Failed to add user: ${response.status}`);
        } catch (parseError) {
          setError(`Failed to add user: ${response.status} ${response.statusText}`);
        }
      }
    } catch (error) {
      setError(`Failed to add user: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsLoading(false);
    }
  };

  // Calculate simple progress percentage from start and end dates
  const calculateProgress = (startDate: string, endDate: string): number => {
    const start = new Date(startDate).getTime();
    const end = new Date(endDate).getTime();
    const now = Date.now();
    if (!start || !end || end <= start) return 0;
    const clamped = Math.max(start, Math.min(now, end));
    const pct = Math.round(((clamped - start) / (end - start)) * 100);
    return Math.max(0, Math.min(100, pct));
  };

  // Ensure bishop auth; then load groups when Groups tab opens
  useEffect(() => {
    if (!isAuthenticated || !user) return;
    if (activeTab !== 'groups') return;
    (async () => {
      try {
        const resp = await apiService.getGroups();

        // Normalize possible shapes: {success, data}, array, {groups}, {assignments}, nested {data: {data: []}}
        const extractArray = (payload: any): any[] | null => {
          if (!payload) return null;
          if (Array.isArray(payload)) return payload;
          if (payload.data && Array.isArray(payload.data)) return payload.data;
          if (Array.isArray(payload?.data?.data)) return payload.data.data;
          if (Array.isArray(payload.groups)) return payload.groups;
          if (Array.isArray(payload.assignments)) return payload.assignments;
          if (payload.success !== undefined && Array.isArray(payload.data)) return payload.data;
          return null;
        };

        const rawArray = extractArray(resp);
        if (!rawArray) {
          console.error('Unexpected groups response format', resp);
          setGroups([]);
          return;
        }

        const mapped: Group[] = rawArray.map((g: any) => ({
          id: g.groupid ?? g.id,
          name: g.groupname ?? g.name ?? 'Group',
          type: g.groupname ?? g.type ?? 'Group',
          participants: g.currentstudents ?? g.participants ?? 0,
          progress: calculateProgress(g.startdate ?? g.startDate, g.enddate ?? g.endDate),
          instructor: (g.instructor && (g.instructor.instructorname || g.instructor.name)) || g.instructorName || g.instructor || 'Unknown',
          startDate: g.startdate ?? g.startDate ?? '',
        }));
        setGroups(mapped);
      } catch (e) {
        console.error('Failed to load groups', e);
      }
    })();
  }, [activeTab, isAuthenticated, user]);
  

  // Build filter options from unique group names
  const uniqueGroupNames = Array.from(new Set(groups.map(g => g.name)));
  const filteredGroups = groups.filter(group => selectedWard === 'all' || group.name === selectedWard);

  const filteredParticipants = participants.filter(participant =>
    participant.name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-white p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-3xl shadow-2xl p-8 mb-8 border border-teal-200 shadow-teal-100">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-4xl font-bold text-gray-800 mb-4">Bishop Dashboard</h1>
              <p className="text-gray-600 text-lg">Manage users, track progress, and monitor self-reliance groups</p>
            </div>
            {user && (
              <div className="mt-4 text-sm text-gray-500">
                Logged in as: <span className="font-medium text-teal-600">{user.name}</span> 
                (Role: <span className="font-medium text-teal-600">{user.role}</span>)
                (Ward: <span className="font-medium text-teal-600">{user.ward}</span>)
              </div>
            )}
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex space-x-2 mb-8">
          {[
            { id: 'users', label: 'User Management' },
            { id: 'groups', label: 'Group Progress' },
            { id: 'View participants', label: 'View Participants' },
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
            
            {/* Error Message */}
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm mb-6">
                {error}
                <button
                  onClick={() => setError('')}
                  className="ml-2 text-red-600 hover:text-red-800 font-medium"
                >
                  ✕
                </button>
              </div>
            )}

            {/* Success Message */}
            {successMessage && (
              <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg text-sm mb-6">
                {successMessage}
                <button
                  onClick={() => setSuccessMessage('')}
                  className="ml-2 text-green-600 hover:text-green-800 font-medium"
                >
                  ✕
                </button>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
              <input
                type="text"
                placeholder="Enter Full Name"
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
                  <option key={role.value} value={role.value}>{role.label}</option>
                ))}
              </select>
              <select
                value={newUser.ward}
                onChange={(e) => setNewUser({...newUser, ward: e.target.value})}
                className="px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-teal-400 focus:ring-4 focus:ring-teal-50 transition-all duration-200"
              >
                <option value="">{user?.ward ? `Select ${user.ward}` : 'Select Ward'}</option>
                {user?.ward && <option value={user.ward}>{user.ward}</option>}
                {/*<option value="">Select Ward</option>
                {wards.map(ward => (
                  <option key={ward} value={ward}>{ward}</option>
                ))}*/}
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
              disabled={isLoading}
              className="bg-teal-500 hover:bg-teal-600 text-white font-semibold py-3 px-8 rounded-xl transition-all duration-200 transform hover:-translate-y-1 hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
            >
              {isLoading ? 'Adding User...' : 'Add User'}
            </button>

            <div className="mt-8">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-semibold text-gray-800">Current Users</h3>
                <div className="flex items-center gap-3 w-full max-w-md ml-auto">
                  <input
                    type="text"
                    placeholder="Search by name..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="flex-1 px-3 py-2 border-2 border-gray-200 rounded-lg focus:border-teal-400 focus:ring-4 focus:ring-teal-50 transition-all duration-200"
                  />
                  <button
                    onClick={fetchUsers}
                    disabled={isLoading}
                    className="bg-teal-500 hover:bg-teal-600 text-white font-semibold py-2 px-4 rounded-lg transition-all duration-200 disabled:opacity-50"
                    title="Refresh user list"
                  >
                    {isLoading ? 'Refreshing...' : 'Refresh List'}
                  </button>
                </div>
              </div>
              
              {isLoading ? (
                <div className="text-center py-8">
                  <div className="w-8 h-8 border-4 border-teal-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                  <p className="text-gray-600">Loading users...</p>
                </div>
              ) : users.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-gray-500">No users found. Add a user to get started.</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-gray-200">
                        <th
                          className="text-left py-3 px-4 text-gray-700 font-semibold cursor-pointer select-none"
                          onClick={() => {
                            if (sortKey === 'name') {
                              setSortOrder(prev => (prev === 'asc' ? 'desc' : 'asc'));
                            } else {
                              setSortKey('name');
                              setSortOrder('asc');
                            }
                          }}
                          title="Sort by Name"
                        >
                          Name {sortKey === 'name' ? (sortOrder === 'asc' ? '▲' : '▼') : ''}
                        </th>
                        <th
                          className="text-left py-3 px-4 text-gray-700 font-semibold cursor-pointer select-none"
                          onClick={() => {
                            if (sortKey === 'role') {
                              setSortOrder(prev => (prev === 'asc' ? 'desc' : 'asc'));
                            } else {
                              setSortKey('role');
                              setSortOrder('asc');
                            }
                          }}
                          title="Sort by Role"
                        >
                          Role {sortKey === 'role' ? (sortOrder === 'asc' ? '▲' : '▼') : ''}
                        </th>
                        <th className="text-left py-3 px-4 text-gray-700 font-semibold">Ward</th>
                        <th className="text-left py-3 px-4 text-gray-700 font-semibold">Email</th>
                        <th className="text-left py-3 px-4 text-gray-700 font-semibold">Created</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredAndSortedUsers.map(user => (
                        <tr key={user.id} className="border-b border-gray-100 hover:bg-gray-50">
                          <td className="py-3 px-4 text-gray-800">{user.name}</td>
                          <td className="py-3 px-4 text-gray-800">
                            {roles.find(r => r.value === user.role)?.label || user.role}
                          </td>
                          <td className="py-3 px-4 text-gray-800">{user.ward}</td>
                          <td className="py-3 px-4 text-gray-800">{user.email}</td>
                          <td className="py-3 px-4 text-gray-800">
                            {new Date(user.created_at).toLocaleDateString()}
                          </td>
                        </tr>
                      ))}
                      {filteredAndSortedUsers.length === 0 && (
                        <tr>
                          <td colSpan={5} className="py-6 px-4 text-center text-gray-500">No users match your search.</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              )}
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
                {uniqueGroupNames.map(name => (
                  <option key={name} value={name}>{name}</option>
                ))}
              </select>
            </div>
            
            {groups.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-500">No groups found. Groups will appear here when created.</p>
              </div>
            ) : (
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
            )}
          </div>
        )}

          {activeTab === 'View participants' && (
          <div className="bg-white rounded-3xl shadow-3xl p-8 border border-teal-200 shadow-teal-100">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">View Participants</h2>
            <div className="mb-6">
              <label className="block text-sm text-gray-600 mb-2">Search by student email</label>
              <div className="flex gap-3">
                <input
                  type="email"
                  placeholder="Enter student email"
                  value={emailQuery}
                  onChange={(e) => setEmailQuery(e.target.value)}
                  className="flex-1 px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-teal-400 focus:ring-4 focus:ring-teal-50 transition-all duration-200"
                />
                <button
                  onClick={async () => {
                    setParticipantsError('');
                    setParticipantReport(null);
                    if (!emailQuery) return;
                    try {
                      setParticipantsLoading(true);
                      const resp = await apiService.searchParticipantsByEmail(emailQuery);
                      const first = Array.isArray(resp) ? resp[0] : resp;
                      if (first?.success && first?.data) {
                        setParticipantReport(first.data);
                      } else if (first?.data) {
                        setParticipantReport(first.data);
                      } else {
                        setParticipantsError('No participant found for that email');
                      }
                    } catch (err: any) {
                      setParticipantsError(err?.message || 'Failed to search participant');
                    } finally {
                      setParticipantsLoading(false);
                    }
                  }}
                  className="bg-teal-500 hover:bg-teal-600 text-white font-semibold px-5 rounded-xl"
                >
                  {participantsLoading ? 'Searching...' : 'Search'}
                </button>
              </div>
              {participantsError && (
                <div className="mt-3 text-red-600 text-sm">{participantsError}</div>
              )}
            </div>

            {!participantReport ? (
              <div className="text-center py-8">
                <p className="text-gray-500">No participants found. Enter a student email to search.</p>
              </div>
            ) : (
              <div className="space-y-6">
                {/* Summary cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="rounded-xl border border-teal-200 p-4 bg-teal-50">
                    <div className="text-sm text-teal-700">Present</div>
                    <div className="text-2xl font-bold text-teal-700">{participantReport.summaryCounts?.present ?? 0}</div>
                  </div>
                  <div className="rounded-xl border border-amber-200 p-4 bg-amber-50">
                    <div className="text-sm text-amber-700">Excused / Late / Makeup</div>
                    <div className="text-2xl font-bold text-amber-700">{(participantReport.summaryCounts?.excused ?? 0) + (participantReport.summaryCounts?.late ?? 0) + (participantReport.summaryCounts?.makeup ?? 0)}</div>
                  </div>
                  <div className="rounded-xl border border-rose-200 p-4 bg-rose-50">
                    <div className="text-sm text-rose-700">Absent</div>
                    <div className="text-2xl font-bold text-rose-700">{participantReport.summaryCounts?.absent ?? 0}</div>
                  </div>
                </div>

                {/* Details cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="rounded-2xl border p-5">
                    <div className="text-sm text-gray-500 mb-2">Student</div>
                    <div className="text-lg font-semibold text-gray-800">{participantReport.student?.studentname}</div>
                    <div className="text-sm text-gray-600">{participantReport.student?.studentemail}</div>
                    <div className="text-xs text-gray-500 mt-1">Status: {participantReport.student?.status}</div>
                  </div>

                  <div className="rounded-2xl border p-5">
                    <div className="text-sm text-gray-500 mb-2">Group</div>
                    <div className="text-lg font-semibold text-gray-800">{participantReport.group?.groupname}</div>
                    <div className="text-sm text-gray-600">{participantReport.group?.groupdescription}</div>
                    <div className="text-xs text-gray-500 mt-1">{participantReport.group?.startdate} → {participantReport.group?.enddate}</div>
                  </div>

                  <div className="rounded-2xl border p-5">
                    <div className="text-sm text-gray-500 mb-2">Instructor</div>
                    <div className="text-lg font-semibold text-gray-800">{participantReport.instructor?.instructorname}</div>
                    <div className="text-sm text-gray-600">{participantReport.instructor?.instructoremail}</div>
                  </div>
                </div>

                {/* Weekly attendance table */}
                <div className="rounded-2xl border">
                  <div className="px-5 py-4 border-b bg-gray-50 rounded-t-2xl text-gray-700 font-semibold">Attendance by Week</div>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-gray-200">
                          <th className="text-left py-3 px-4 text-gray-700 font-semibold">Week</th>
                          <th className="text-left py-3 px-4 text-gray-700 font-semibold">Status</th>
                          <th className="text-left py-3 px-4 text-gray-700 font-semibold">Date</th>
                          <th className="text-left py-3 px-4 text-gray-700 font-semibold">Notes</th>
                        </tr>
                      </thead>
                      <tbody>
                        {(participantReport.attendanceByWeek || []).map((wk: any) => {
                          const status = wk.status || '—';
                          const color = status === 'present' ? 'text-teal-700' : status === 'absent' ? 'text-rose-700' : 'text-amber-700';
                          return (
                            <tr key={wk.weeknumber} className="border-b border-gray-100">
                              <td className="py-3 px-4 text-gray-800">Week {wk.weeknumber}</td>
                              <td className={`py-3 px-4 font-medium ${color}`}>{status}</td>
                              <td className="py-3 px-4 text-gray-800">{wk.attendancedate || '—'}</td>
                              <td className="py-3 px-4 text-gray-500">{wk.notes || '—'}</td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Bishop; 
import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { apiService } from '../services/api';
import type { GroupData } from '../services/api';

interface Group {
  id: string;
  name: string;
  description: string;
  participants: number;
  progress: number;
  instructorName: string;
  instructorEmail: string;
  startDate: string;
  endDate: string;
  status: 'active' | 'completed' | 'pending';
  weeksElapsed: number;
  totalWeeks: number;
  enrollmentPotential: number;
  maxStudents: number;
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
  const { user, isAuthenticated, logout } = useAuth();
  const [activeTab, setActiveTab] = useState<'groups' | 'progress' | 'reports'>('groups');
  const [groups, setGroups] = useState<Group[]>([]);
  const [loading, setLoading] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editingGroup, setEditingGroup] = useState<Group | null>(null);

  const [progressReports, setProgressReports] = useState<ProgressReport[]>([
    { id: '1', groupId: '1', date: '2024-03-15', attendance: 10, assignments: 8, completedAssignments: 7, notes: 'Good participation, some assignments pending', submittedBy: 'John Smith' },
    { id: '2', groupId: '2', date: '2024-03-10', attendance: 6, assignments: 6, completedAssignments: 5, notes: 'Class progressing well, financial concepts well received', submittedBy: 'Sarah Johnson' },
  ]);

  const [newGroup, setNewGroup] = useState({ 
    instructorname: '', 
    instructoremail: '', 
    groupname: '', 
    groupdescription: '', 
    startdate: '', 
    enddate: '',
    participants: '' 
  });
  const [newReport, setNewReport] = useState({ groupId: '', attendance: '', assignments: '', completedAssignments: '', notes: '' });

  // Convert date from YYYY-MM-DD to DD-MM-YYYY format
  const convertDateFormat = (dateString: string): string => {
    if (!dateString) return '';
    const date = new Date(dateString);
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    return `${day}-${month}-${year}`;
  };

  // Convert date from DD-MM-YYYY to YYYY-MM-DD format for form inputs
  const convertDateToFormFormat = (dateString: string): string => {
    if (!dateString) return '';
    
    // Backend returns dates in YYYY-MM-DD format, which is perfect for HTML date inputs
    // Just ensure it's a valid date string
    if (dateString.match(/^\d{4}-\d{2}-\d{2}$/)) {
      return dateString;
    }
    
    // If it's in DD-MM-YYYY format, convert it
    if (dateString.includes('-') && dateString.split('-')[0].length === 2) {
      const [day, month, year] = dateString.split('-');
      if (day && month && year) {
        return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
      }
    }
    
    // Try to parse as ISO date string
    try {
      const date = new Date(dateString);
      if (!isNaN(date.getTime())) {
        return date.toISOString().split('T')[0];
      }
    } catch (error) {
      console.error('Error parsing date:', dateString, error);
    }
    
    return '';
  };

  // Open edit form with group data
  const handleEditGroup = (group: Group) => {
    const convertedStartDate = convertDateToFormFormat(group.startDate);
    const convertedEndDate = convertDateToFormFormat(group.endDate);
    
    setEditingGroup(group);
    setNewGroup({
      instructorname: group.instructorName,
      instructoremail: group.instructorEmail,
      groupname: group.name,
      groupdescription: group.description,
      startdate: convertedStartDate,
      enddate: convertedEndDate,
      participants: group.maxStudents.toString()
    });
    setIsEditing(true);
  };

  // Cancel editing
  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditingGroup(null);
    setNewGroup({
      instructorname: '',
      instructoremail: '',
      groupname: '',
      groupdescription: '',
      startdate: '',
      enddate: '',
      participants: ''
    });
  };

  // Update existing group
  const handleUpdateGroup = async () => {
    if (!editingGroup || !newGroup.instructorname || !newGroup.instructoremail || !newGroup.groupname || 
        !newGroup.groupdescription || !newGroup.startdate || !newGroup.enddate || !newGroup.participants) {
      alert('Please fill in all required fields');
      return;
    }

    try {
      const groupData = {
        instructorname: newGroup.instructorname,
        instructoremail: newGroup.instructoremail,
        groupname: newGroup.groupname,
        groupdescription: newGroup.groupdescription,
        startdate: convertDateFormat(newGroup.startdate),
        enddate: convertDateFormat(newGroup.enddate)
      };

      console.log('Attempting to update group with ID:', editingGroup.id);
      console.log('Update data:', groupData);

      const response = await apiService.updateGroup(editingGroup.id, groupData);
      
      if (response.success && response.data) {
        // Update the group in the local state
        const updatedGroups = groups.map(group => 
          group.id === editingGroup.id 
            ? {
                ...group,
                name: response.data!.groupname,
                description: response.data!.groupdescription || 'No description available',
                instructorName: newGroup.instructorname, // Use form data since response doesn't include instructor details
                instructorEmail: newGroup.instructoremail, // Use form data since response doesn't include instructor details
                startDate: response.data!.startdate,
                endDate: response.data!.enddate,
                maxStudents: parseInt(newGroup.participants)
              }
            : group
        );
        
        setGroups(updatedGroups);
        handleCancelEdit();
        alert('Group updated successfully!');
      } else {
        alert(response.message || 'Failed to update group');
      }
    } catch (error: any) {
      console.error('Error updating group:', error);
      
      // Handle specific error types
      if (error.message?.includes('404') || error.message?.includes('Not Found')) {
        alert('Group update is not supported yet. The backend endpoint for updating groups is not available. Please contact your administrator.');
        handleCancelEdit();
        return;
      }
      
      if (error.message?.includes('authentication') || error.message?.includes('unauthorized') || error.message?.includes('401')) {
        setAuthError('Authentication failed. Please log in again.');
        logout();
        return;
      }
      
      // Show more detailed error information
      const errorMessage = error.message || 'Unknown error occurred';
      alert(`Failed to update group: ${errorMessage}\n\nPlease check the console for more details or contact support.`);
    }
  };

  // Calculate weeks progress based on start date and end date
  const calculateWeeksProgress = (startDate: string, endDate: string): { weeksElapsed: number; totalWeeks: number; progressPercentage: number } => {
    const start = new Date(startDate);
    const now = new Date();
    const end = new Date(endDate);
    
    // Calculate difference in milliseconds
    const diffTime = now.getTime() - start.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    // If 2+ days into a week, count that week as completed
    const weeksElapsed = Math.max(0, Math.floor(diffDays / 7));
    
    // Calculate total weeks from start to end date
    const totalDiffTime = end.getTime() - start.getTime();
    const totalDiffDays = Math.ceil(totalDiffTime / (1000 * 60 * 60 * 24));
    const totalWeeks = Math.ceil(totalDiffDays / 7);
    
    const progressPercentage = Math.min(100, Math.round((weeksElapsed / totalWeeks) * 100));
    
    return { weeksElapsed, totalWeeks, progressPercentage };
  };

  // Check authentication and role on component mount and when auth state changes
  useEffect(() => {
    if (!isAuthenticated || !user) {
      setAuthError('Authentication required');
      return;
    }

    if (user.role !== 'eq') {
      setAuthError('Access denied. EQ role required.');
      return;
    }

    setAuthError(null);
  }, [isAuthenticated, user]);

  // Fetch groups when View Progress tab is active
  useEffect(() => {
    if (activeTab === 'progress' && !authError) {
      fetchGroups();
    }
  }, [activeTab, authError]);

  const fetchGroups = async () => {
    // Double-check authentication before making API call
    if (!isAuthenticated || !user || user.role !== 'eq') {
      setAuthError('Authentication required');
      return;
    }

    setLoading(true);
    try {
      const response = await apiService.getGroups();
      if (response.success && response.data) {
        // Transform the API response to match our local Group interface
        const transformedGroups: Group[] = response.data.map(group => {
          const weeksProgress = calculateWeeksProgress(group.startdate, group.enddate);
          const enrollmentPotential = group.maxstudents > 0 ? Math.round((group.currentstudents / group.maxstudents) * 100) : 0;
          
          return {
            id: group.groupid,
            name: group.groupname,
            description: group.groupdescription || 'No description available',
            participants: group.currentstudents,
            progress: weeksProgress.progressPercentage,
            instructorName: group.instructor.instructorname,
            instructorEmail: group.instructor.instructoremail,
            startDate: group.startdate,
            endDate: group.enddate,
            status: group.status as 'active' | 'completed' | 'pending',
            weeksElapsed: weeksProgress.weeksElapsed,
            totalWeeks: weeksProgress.totalWeeks,
            enrollmentPotential: enrollmentPotential,
            maxStudents: group.maxstudents
          };
        });
        setGroups(transformedGroups);
      }
    } catch (error: any) {
      console.error('Error fetching groups:', error);
      
      // Handle authentication errors specifically
      if (error.message?.includes('authentication') || error.message?.includes('unauthorized') || error.message?.includes('401')) {
        setAuthError('Authentication failed. Please log in again.');
        logout();
        return;
      }
      
      // Keep existing groups if fetch fails for other reasons
    } finally {
      setLoading(false);
    }
  };

  const handleAddGroup = async () => {
    // Double-check authentication before making API call
    if (!isAuthenticated || !user || user.role !== 'eq') {
      setAuthError('Authentication required');
      return;
    }

    if (newGroup.instructorname && newGroup.instructoremail && newGroup.groupname && 
        newGroup.groupdescription && newGroup.startdate && newGroup.enddate && newGroup.participants) {
      try {
        const groupData = {
          instructorname: newGroup.instructorname,
          instructoremail: newGroup.instructoremail,
          groupname: newGroup.groupname,
          groupdescription: newGroup.groupdescription,
          startdate: convertDateFormat(newGroup.startdate),
          enddate: convertDateFormat(newGroup.enddate)
        };

        const response = await apiService.assignGroup(groupData);
        
        if (response.success && response.group) {
          const group: Group = {
            id: response.group.groupid,
            name: response.group.groupname,
            description: response.group.groupdescription,
            participants: parseInt(newGroup.participants),
            progress: 0,
            instructorName: response.group.instructorname,
            instructorEmail: response.group.instructoremail,
            startDate: response.group.startdate,
            endDate: response.group.enddate,
            status: 'pending',
            weeksElapsed: 0, // Placeholder, will be calculated
            totalWeeks: 12, // Placeholder, will be calculated
            enrollmentPotential: 0, // Placeholder, will be calculated
            maxStudents: parseInt(newGroup.participants) // Assuming max students is the initial enrollment
          };
          setGroups([...groups, group]);
          setNewGroup({ 
            instructorname: '', 
            instructoremail: '', 
            groupname: '', 
            groupdescription: '', 
            startdate: '', 
            enddate: '',
            participants: '' 
          });
          alert('Group assigned successfully!');
        } else {
          alert(response.message || 'Failed to assign group');
        }
      } catch (error: any) {
        console.error('Error assigning group:', error);
        
        // Handle authentication errors specifically
        if (error.message?.includes('authentication') || error.message?.includes('unauthorized') || error.message?.includes('401')) {
          setAuthError('Authentication failed. Please log in again.');
          logout();
          return;
        }
        
        alert('Failed to assign group. Please try again.');
      }
    } else {
      alert('Please fill in all required fields');
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

  // Show authentication error if user is not properly authenticated
  if (authError) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-8">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-gray-800 mb-4">Access Denied</h1>
          <p className="text-gray-600 mb-6">{authError}</p>
          <button
            onClick={logout}
            className="bg-teal-500 hover:bg-teal-600 text-white font-semibold py-2 px-6 rounded-lg transition-colors duration-200"
          >
            Return to Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-3xl shadow-2xl p-8 mb-8 border border-teal-200 shadow-teal-100">
          <h1 className="text-4xl font-bold text-gray-800 mb-4">Elder's Quorum Dashboard</h1>
          <p className="text-gray-600 text-lg">Manage groups, track progress, and submit progress reports</p>
          {user && (
            <div className="mt-4 text-sm text-gray-500">
              Logged in as: <span className="font-medium text-teal-600">{user.name}</span> 
              (Role: <span className="font-medium text-teal-600">{user.role}</span>)
              (Ward: <span className="font-medium text-teal-600">{user.ward}</span>)
            </div>
          )}
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
            <h2 className="text-2xl font-bold text-gray-800 mb-8">
              {isEditing ? 'Edit Group' : 'Assign New Group'}
            </h2>
            
            {/* Form Section */}
            <div className="bg-gray-50 rounded-2xl p-8 mb-8">
              <h3 className="text-xl font-semibold text-gray-800 mb-6">Group Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Group Name</label>
                  <input
                    type="text"
                    placeholder="Enter group name"
                    value={newGroup.groupname}
                    onChange={(e) => setNewGroup({...newGroup, groupname: e.target.value})}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-teal-400 focus:ring-4 focus:ring-teal-50 transition-all duration-200"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Expected Participants</label>
                  <input
                    type="number"
                    placeholder="Number of participants"
                    value={newGroup.participants}
                    onChange={(e) => setNewGroup({...newGroup, participants: e.target.value})}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-teal-400 focus:ring-4 focus:ring-teal-50 transition-all duration-200"
                  />
                </div>
              </div>
              
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">Group Description</label>
                <textarea
                  placeholder="Describe the purpose and goals of this group"
                  value={newGroup.groupdescription}
                  onChange={(e) => setNewGroup({...newGroup, groupdescription: e.target.value})}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-teal-400 focus:ring-4 focus:ring-teal-50 transition-all duration-200"
                  rows={4}
                />
              </div>

              <h3 className="text-xl font-semibold text-gray-800 mb-6">Instructor Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Instructor Name</label>
                  <input
                    type="text"
                    placeholder="Enter instructor's full name"
                    value={newGroup.instructorname}
                    onChange={(e) => setNewGroup({...newGroup, instructorname: e.target.value})}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-teal-400 focus:ring-4 focus:ring-teal-50 transition-all duration-200"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Instructor Email</label>
                  <input
                    type="email"
                    placeholder="Enter instructor's email"
                    value={newGroup.instructoremail}
                    onChange={(e) => setNewGroup({...newGroup, instructoremail: e.target.value})}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-teal-400 focus:ring-4 focus:ring-teal-50 transition-all duration-200"
                  />
                </div>
              </div>

              <h3 className="text-xl font-semibold text-gray-800 mb-6">Schedule Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Start Date</label>
                  <input
                    type="date"
                    value={newGroup.startdate}
                    onChange={(e) => setNewGroup({...newGroup, startdate: e.target.value})}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-teal-400 focus:ring-4 focus:ring-teal-50 transition-all duration-200"
                  />
                  {isEditing && editingGroup && (
                    <p className="text-xs text-gray-500 mt-1">
                      Current: {editingGroup.startDate}
                    </p>
                  )}
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-2">End Date</label>
                  <input
                    type="date"
                    value={newGroup.enddate}
                    onChange={(e) => setNewGroup({...newGroup, enddate: e.target.value})}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-teal-400 focus:ring-4 focus:ring-teal-50 transition-all duration-200"
                  />
                  {isEditing && editingGroup && (
                    <p className="text-xs text-gray-500 mt-1">
                      Current: {editingGroup.endDate}
                    </p>
                  )}
                </div>
              </div>

              <div className="text-center space-x-4">
                {isEditing ? (
                  <>
                    <button
                      onClick={handleUpdateGroup}
                      className="bg-teal-500 hover:bg-teal-600 text-white font-semibold py-4 px-12 rounded-xl transition-all duration-200 transform hover:-translate-y-1 hover:shadow-lg text-lg"
                    >
                      Update Group
                    </button>
                    <button
                      onClick={handleCancelEdit}
                      className="bg-gray-500 hover:bg-gray-600 text-white font-semibold py-4 px-12 rounded-xl transition-all duration-200 transform hover:-translate-y-1 hover:shadow-lg text-lg"
                    >
                      Cancel
                    </button>
                  </>
                ) : (
                  <button
                    onClick={handleAddGroup}
                    className="bg-teal-500 hover:bg-teal-600 text-white font-semibold py-4 px-12 rounded-xl transition-all duration-200 transform hover:-translate-y-1 hover:shadow-lg text-lg"
                  >
                    Assign Group
                  </button>
                )}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'progress' && (
          <div className="bg-white rounded-3xl shadow-2xl p-8 border border-teal-200 shadow-teal-100">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-800">Group Progress Overview</h2>
              <div className="flex space-x-3">
                <button
                  onClick={fetchGroups}
                  disabled={loading}
                  className="bg-teal-500 hover:bg-teal-600 disabled:bg-gray-400 text-white font-semibold py-2 px-4 rounded-xl transition-all duration-200"
                >
                  {loading ? 'Loading...' : 'Refresh'}
                </button>
                <button
                  onClick={() => setActiveTab('groups')}
                  className="bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded-xl transition-all duration-200"
                >
                  Manage Groups
                </button>
              </div>
            </div>
            
            <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-sm text-blue-700">
                💡 <strong>Tip:</strong> Click the edit button (✏️) on any group card to edit it, then switch to the "Group Management" tab to see the edit form.
              </p>
            </div>
            
            {loading ? (
              <div className="text-center py-12">
                <div className="text-gray-500">Loading groups...</div>
              </div>
            ) : groups.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-gray-500">No groups found. Create a group first.</div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {groups.map(group => (
                  <div key={group.id} className="bg-gray-50 rounded-xl p-6 border border-gray-200 relative">
                    {/* Edit Button */}
                    <button
                      onClick={() => handleEditGroup(group)}
                      className="absolute top-4 right-4 bg-teal-500 hover:bg-teal-600 text-white p-2 rounded-lg transition-all duration-200 transform hover:scale-105"
                      title="Edit Group"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                    </button>
                    
                    <h3 className="text-lg font-semibold text-gray-800 mb-2 pr-12">{group.name}</h3>
                    <p className="text-gray-600 text-sm mb-4">{group.description}</p>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600">Weeks Progress</span>
                        <span className="text-2xl font-bold text-green-600">{group.weeksElapsed}/{group.totalWeeks}</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-3">
                        <div 
                          className="bg-green-500 h-3 rounded-full transition-all duration-300"
                          style={{ width: `${group.progress}%` }}
                        ></div>
                      </div>
                      
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600">Enrollment</span>
                        <span className="text-lg font-semibold text-teal-600">{group.participants}/{group.maxStudents}</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-green-500 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${group.participants === group.maxStudents ? 100 : group.enrollmentPotential}%` }}
                        ></div>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4 pt-3">
                        <div className="text-center">
                          <div className="text-2xl font-bold text-gray-800">{group.participants}</div>
                          <div className="text-xs text-gray-600">Current Students</div>
                        </div>
                        <div className="text-center">
                          <div className="text-2xl font-bold text-teal-600">{group.instructorName}</div>
                          <div className="text-xs text-gray-600">Instructor</div>
                        </div>
                      </div>
                      <div className="pt-2 text-center">
                        <div className="text-sm text-gray-600">
                          {group.startDate} - {group.endDate}
                        </div>
                        <div className="text-xs text-gray-500">Duration</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
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
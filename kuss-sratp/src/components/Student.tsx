import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { apiService } from '../services/api';

interface Group {
  id: string;
  name: string;
  description: string;
  startDate: string;
  endDate: string;
  totalWeeks: number;
  currentWeek: number;
  maxStudents: number;
  currentStudents: number;
  instructor: string;
  status: 'open' | 'full' | 'in-progress' | 'completed';
  category: 'financial-literacy' | 'career-development' | 'education' | 'health-wellness';
  meetingTime: string;
  meetingDay: string;
  location: string;
}

interface AvailableGroup {
  groupid: string;
  groupname: string;
  groupdescription: string | null;
  startdate: string;
  enddate: string;
  maxstudents: number;
  currentstudents: number;
  status: string;
  category: string;
  instructor: {
    instructorname: string;
    instructoremail: string;
  };
}

interface JoinGroupRequest {
  groupid: string;
  studentid: string;
}

interface JoinGroupResponse {
  success: boolean;
  message: string;
  error?: string;
}

interface JoinGroupModalData {
  groupid: string;
  studentname: string;
  studentemail: string;
  studentphone: string;
  notes: string;
}

interface EnrolledGroup {
  studentid: string;
  studentname: string;
  studentemail: string;
  studentphone?: string;
  groupid: string;
  instructorid: string;
  notes?: string;
  status: string;
  enrollment_date: string;
  group: {
    groupid: string;
    groupname: string;
    groupdescription: string | null;
    startdate: string;
    enddate: string;
    instructor: {
      instructorid: string;
      instructorname: string;
      instructoremail: string;
      instructorspecialization?: string;
    };
  };
}

interface StudentGroup {
  id: string;
  groupId: string;
  studentId: string;
  joinDate: string;
  status: 'active' | 'completed' | 'dropped';
  progress: number;
  attendance: AttendanceRecord[];
}

interface AttendanceRecord {
  id: string;
  groupId: string;
  studentId: string;
  weekNumber: number;
  date: string;
  status: 'confirmed' | 'missed' | 'pending';
  studentNotes?: string;
}

interface Student {
  studentid: string;
  studentname: string;
  studentemail: string;
  ward: string;
  enrollment_date: string;
  groups: StudentGroup[];
}

const Student: React.FC = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const [activeTab, setActiveTab] = useState<'available' | 'my-groups' | 'attendance' | 'progress'>('available');
  const [selectedGroup, setSelectedGroup] = useState<string>('');
  const [selectedWeek, setSelectedWeek] = useState<number>(1);
  const [attendanceNote, setAttendanceNote] = useState('');
  const [loading, setLoading] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [attendanceData, setAttendanceData] = useState<any[]>([]);
  const [attendanceLoading, setAttendanceLoading] = useState(false);

  const [availableGroups, setAvailableGroups] = useState<Group[]>([]);
  const [currentStudent, setCurrentStudent] = useState<Student | null>(null);

  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [showJoinModal, setShowJoinModal] = useState(false);
  const [selectedGroupForJoin, setSelectedGroupForJoin] = useState<Group | null>(null);
  const [joinFormData, setJoinFormData] = useState<JoinGroupModalData>({
    groupid: '',
    studentname: '',
    studentemail: '',
    studentphone: '',
    notes: ''
  });
  const [joiningGroup, setJoiningGroup] = useState(false);
  const [formErrors, setFormErrors] = useState<{
    studentname?: string;
    studentemail?: string;
    studentphone?: string;
  }>({});
  const [isFormValid, setIsFormValid] = useState(false);
  const [enrolledGroups, setEnrolledGroups] = useState<EnrolledGroup[]>([]);
  const [enrolledGroupsLoading, setEnrolledGroupsLoading] = useState(false);

  // Check authentication and role on component mount
  useEffect(() => {
    if (!isAuthenticated || !user) {
      setAuthError('Authentication required');
      return;
    }

    if (user.role !== 'student') {
      setAuthError('Access denied. Student role required.');
      return;
    }

    setAuthError(null);
  }, [isAuthenticated, user]);

  // Fetch enrolled groups when my-groups tab is active
  useEffect(() => {
    if (activeTab === 'my-groups' && isAuthenticated && user?.role === 'student' && user?.id) {
      fetchEnrolledGroups();
    }
  }, [activeTab, isAuthenticated, user?.role, user?.id]);

  // Fetch attendance data when group is selected
  useEffect(() => {
    if (selectedGroup && user?.id) {
      fetchAttendanceData(selectedGroup);
    }
  }, [selectedGroup, user?.id]);

  // Fetch enrolled groups
  const fetchEnrolledGroups = async () => {
    if (!user?.id) return;
    
    setEnrolledGroupsLoading(true);
    try {
      const response = await apiService.getStudentEnrollment(user.id.toString());
      if (response.success && response.data) {
        setEnrolledGroups(response.data);
      }
    } catch (error) {
      console.error('Error fetching enrolled groups:', error);
    } finally {
      setEnrolledGroupsLoading(false);
    }
  };

  // Fetch attendance data for selected group
  const fetchAttendanceData = async (groupId: string) => {
    if (!groupId || !user?.id) return;
    
    setAttendanceLoading(true);
    try {
      const response = await apiService.getAttendance(groupId);
      if (response.success && response.data) {
        setAttendanceData(response.data);
      }
    } catch (error) {
      console.error('Error fetching attendance data:', error);
    } finally {
      setAttendanceLoading(false);
    }
  };

  // Open join group modal
  const openJoinModal = (group: Group) => {
    setSelectedGroupForJoin(group);
    setJoinFormData({
      groupid: group.id,
      studentname: '', // Will be filled by the student
      studentemail: '', // Will be filled by the student
      studentphone: '', // Will be filled by the student
      notes: ''
    });
    setFormErrors({});
    setIsFormValid(false);
    setShowJoinModal(true);
  };

  // Close join group modal
  const closeJoinModal = () => {
    setShowJoinModal(false);
    setSelectedGroupForJoin(null);
    setJoinFormData({
      groupid: '',
      studentname: '',
      studentemail: '',
      studentphone: '',
      notes: ''
    });
    setJoiningGroup(false);
    setFormErrors({});
    setIsFormValid(false);
  };

  // Validate individual field
  const validateField = (field: keyof JoinGroupModalData, value: string): string | undefined => {
    switch (field) {
      case 'studentname':
        if (!value.trim()) {
          return 'Student name is required';
        }
        if (value.trim().length < 2) {
          return 'Student name must be at least 2 characters long';
        }
        if (value.trim().length > 50) {
          return 'Student name must be less than 50 characters';
        }
        if (!/^[a-zA-Z\s'-]+$/.test(value.trim())) {
          return 'Student name can only contain letters, spaces, hyphens, and apostrophes';
        }
        return undefined;
      
      case 'studentemail':
        if (!value.trim()) {
          return 'Student email is required';
        }
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(value.trim())) {
          return 'Please enter a valid email address';
        }
        if (value.trim().length > 100) {
          return 'Email address is too long';
        }
        return undefined;
      
      case 'studentphone':
        if (value.trim()) {
          const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
          if (!phoneRegex.test(value.trim().replace(/[\s\-\(\)]/g, ''))) {
            return 'Please enter a valid phone number';
          }
          if (value.trim().replace(/[\s\-\(\)]/g, '').length < 10) {
            return 'Phone number must be at least 10 digits';
          }
          if (value.trim().replace(/[\s\-\(\)]/g, '').length > 15) {
            return 'Phone number is too long';
          }
        }
        return undefined;
      
      default:
        return undefined;
    }
  };

  // Validate entire form
  const validateForm = (): boolean => {
    const errors: {
      studentname?: string;
      studentemail?: string;
      studentphone?: string;
    } = {};

    // Validate required fields
    const nameError = validateField('studentname', joinFormData.studentname);
    const emailError = validateField('studentemail', joinFormData.studentemail);
    const phoneError = validateField('studentphone', joinFormData.studentphone);

    if (nameError) errors.studentname = nameError;
    if (emailError) errors.studentemail = emailError;
    if (phoneError) errors.studentphone = phoneError;

    setFormErrors(errors);
    const isValid = Object.keys(errors).length === 0;
    setIsFormValid(isValid);
    return isValid;
  };

  // Handle input changes with validation
  const handleInputChange = (field: keyof JoinGroupModalData, value: string) => {
    setJoinFormData(prev => ({ ...prev, [field]: value }));
    
    // Clear error when user starts typing
    if (formErrors[field as keyof typeof formErrors]) {
      setFormErrors(prev => ({ ...prev, [field]: undefined }));
    }
    
    // Validate field in real-time
    const error = validateField(field, value);
    if (error) {
      setFormErrors(prev => ({ ...prev, [field]: error }));
    }
    
    // Check if form is now valid
    const updatedFormData = { ...joinFormData, [field]: value };
    const nameError = field === 'studentname' ? error : validateField('studentname', updatedFormData.studentname);
    const emailError = field === 'studentemail' ? error : validateField('studentemail', updatedFormData.studentemail);
    const phoneError = field === 'studentphone' ? error : validateField('studentphone', updatedFormData.studentphone);
    
    const hasErrors = [nameError, emailError, phoneError].some(err => err !== undefined);
    setIsFormValid(!hasErrors);
  };

  // Handle join group submission
  const handleJoinGroupSubmit = async () => {
    // Validate form before submission
    if (!validateForm()) {
      alert('Please fix the errors in the form before submitting.');
      return;
    }

    setJoiningGroup(true);
    try {
      const response = await apiService.joinGroupWithDetails(joinFormData);
      if (response.success) {
        alert(response.message || 'Successfully joined group!');
        closeJoinModal();
        
        // Refresh available groups and current student data
        const updatedGroups = await apiService.getAvailableGroups();
        if (updatedGroups.success && updatedGroups.data) {
          const transformedGroups: Group[] = updatedGroups.data.map((group: any) => ({
            id: group.groupid,
            name: group.groupname,
            description: group.groupdescription || 'No description available',
            startDate: group.startdate,
            endDate: group.enddate,
            totalWeeks: 12,
            currentWeek: 0,
            maxStudents: group.maxstudents,
            currentStudents: group.currentstudents,
            instructor: group.instructor?.instructorname || 'TBD',
            status: group.currentstudents >= group.maxstudents ? 'full' : 'open',
            category: group.category || 'education',
            meetingTime: 'TBD',
            meetingDay: 'TBD',
            location: 'TBD'
          }));
          setAvailableGroups(transformedGroups);
        }
        
        // Refresh enrolled groups if we're on the my-groups tab
        if (activeTab === 'my-groups') {
          fetchEnrolledGroups();
        }
      } else {
        alert(response.message || 'Failed to join group');
      }
    } catch (error: any) {
      console.error('Error joining group:', error);
      alert(error.message || 'Failed to join group due to an error');
    } finally {
      setJoiningGroup(false);
    }
  };

  useEffect(() => {
    const fetchAvailableGroups = async () => {
      if (!isAuthenticated || user?.role !== 'student') return;
      
      setLoading(true);
      try {
        const response = await apiService.getAvailableGroups();
        if (response.success && response.data) {
          // Transform backend data to match frontend interface
          const transformedGroups: Group[] = response.data.map((group: any) => ({
            id: group.groupid,
            name: group.groupname,
            description: group.groupdescription || 'No description available',
            startDate: group.startdate,
            endDate: group.enddate,
            totalWeeks: 12, // Default value, adjust based on your needs
            currentWeek: 0, // Default value, adjust based on your needs
            maxStudents: group.maxstudents,
            currentStudents: group.currentstudents,
            instructor: group.instructor?.instructorname || 'TBD',
            status: group.currentstudents >= group.maxstudents ? 'full' : 'open',
            category: group.category || 'education',
            meetingTime: 'TBD', // Remove meeting time as requested
            meetingDay: 'TBD', // Remove meeting day as requested
            location: 'TBD' // Remove location as requested
          }));
          setAvailableGroups(transformedGroups);
        }
      } catch (error) {
        console.error('Error fetching available groups:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchAvailableGroups();
    const interval = setInterval(fetchAvailableGroups, 30000); // Pull every 30 seconds
    return () => clearInterval(interval);
  }, [isAuthenticated, user?.role]);

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

  const filteredGroups = availableGroups.filter(group => {
    if (filterCategory !== 'all' && group.category !== filterCategory) return false;
    if (searchTerm && !group.name.toLowerCase().includes(searchTerm.toLowerCase()) && 
        !group.description.toLowerCase().includes(searchTerm.toLowerCase())) return false;
    return true;
  });

  const handleJoinGroup = async (groupId: string) => {
    if (!user?.id) {
      alert('Please log in to join a group.');
      return;
    }

    const group = availableGroups.find(g => g.id === groupId);
    if (group && group.status === 'open') {
      try {
        const joinRequest: JoinGroupRequest = {
          groupid: groupId,
          studentid: user.id.toString()
        };
        const response: JoinGroupResponse = await apiService.joinGroup(joinRequest);
        if (response.success) {
          alert(response.message);
          // Refresh available groups to update spots
          const updatedGroups = await apiService.getAvailableGroups();
          setAvailableGroups(updatedGroups.data);
        } else {
          alert(response.message || 'Failed to join group.');
        }
      } catch (error) {
        console.error('Error joining group:', error);
        alert('Failed to join group due to an error.');
      }
    }
  };

  const handleLeaveGroup = async (groupId: string) => {
    if (!user?.id) {
      alert('Please log in to leave a group.');
      return;
    }

    try {
      const response: JoinGroupResponse = await apiService.leaveGroup({ groupid: groupId, studentid: user.id.toString() });
      if (response.success) {
        alert(response.message);
        // Refresh available groups to update spots
        const updatedGroups = await apiService.getAvailableGroups();
        setAvailableGroups(updatedGroups.data);
      } else {
        alert(response.message || 'Failed to leave group.');
      }
    } catch (error) {
      console.error('Error leaving group:', error);
      alert('Failed to leave group due to an error.');
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'financial-literacy': return 'bg-green-100 text-green-800';
      case 'career-development': return 'bg-blue-100 text-blue-800';
      case 'education': return 'bg-purple-100 text-purple-800';
      case 'health-wellness': return 'bg-pink-100 text-pink-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open': return 'bg-green-100 text-green-800';
      case 'full': return 'bg-red-100 text-red-800';
      case 'in-progress': return 'bg-blue-100 text-blue-800';
      case 'completed': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getAttendanceStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed': return 'bg-green-100 text-green-800';
      case 'missed': return 'bg-red-100 text-red-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-600';
    }
  };

  const getWeekDates = (startDate: string, weekNumber: number) => {
    const start = new Date(startDate);
    const weekStart = new Date(start);
    weekStart.setDate(start.getDate() + (weekNumber - 1) * 7);
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekStart.getDate() + 6);
    return { start: weekStart.toISOString().split('T')[0], end: weekEnd.toISOString().split('T')[0] };
  };

  // Get attendance status for a specific week
  const getWeekAttendanceStatus = (weekNumber: number) => {
    if (!Array.isArray(attendanceData) || attendanceData.length === 0) return null;
    
    const weekAttendance = attendanceData.find(att => 
      att.weeknumber === weekNumber && 
      att.studentid === user?.id
    );
    
    return weekAttendance;
  };

  // Get overall attendance summary
  const getAttendanceSummary = () => {
    if (!Array.isArray(attendanceData) || attendanceData.length === 0) {
      return { present: 0, absent: 0, late: 0, excused: 0, total: 0, percentage: 0 };
    }
    
    const studentAttendance = attendanceData.filter(att => att.studentid === user?.id);
    const present = studentAttendance.filter(att => att.status === 'present').length;
    const absent = studentAttendance.filter(att => att.status === 'absent').length;
    const late = studentAttendance.filter(att => att.status === 'late').length;
    const excused = studentAttendance.filter(att => att.status === 'excused').length;
    const total = studentAttendance.length;
    const percentage = total > 0 ? Math.round((present / total) * 100) : 0;
    
    return { present, absent, late, excused, total, percentage };
  };

  const confirmAttendance = async (groupId: string, weekNumber: number) => {
    if (!user?.id) {
      alert('Please log in to confirm attendance.');
      return;
    }

    try {
      const response = await apiService.markAttendance({
        studentid: user.id.toString(),
        groupid: groupId,
        weeknumber: weekNumber,
        status: 'present',
        notes: attendanceNote
      });
      
      if (response.success) {
        alert(response.message || 'Attendance confirmed successfully!');
        // Refresh attendance data
        await fetchAttendanceData(groupId);
        setAttendanceNote('');
      } else {
        alert(response.message || 'Failed to confirm attendance.');
      }
    } catch (error) {
      console.error('Error confirming attendance:', error);
      alert('Failed to confirm attendance due to an error.');
    }
  };

  return (
    <div className="min-h-screen bg-white p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-3xl shadow-2xl p-8 mb-8 border border-teal-200 shadow-teal-100">
          <h1 className="text-4xl font-bold text-gray-800 mb-4">Student Dashboard</h1>
          <p className="text-gray-600 text-lg">Browse groups, join programs, and track your self-reliance journey</p>
          <div className="mt-4 p-4 bg-teal-50 rounded-xl border border-teal-200">
            <p className="text-teal-800 font-medium">Welcome back, {user?.name || user?.email || 'Student'}!</p>
            <p className="text-teal-700 text-sm">Role: {user?.role} | Email: {user?.email}</p>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex space-x-2 mb-8">
          {[
            { id: 'available', label: 'Available Groups' },
            { id: 'my-groups', label: 'My Groups' },
            { id: 'attendance', label: 'Attendance' },
            { id: 'progress', label: 'My Progress' }
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
        {activeTab === 'available' && (
          <div className="space-y-6">
            {/* Filters and Search */}
            <div className="bg-white rounded-3xl shadow-2xl p-6 border border-teal-200 shadow-teal-100">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1">
                  <input
                    type="text"
                    placeholder="Search groups..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-teal-400 focus:ring-4 focus:ring-teal-50 transition-all duration-200"
                  />
                </div>
                <select
                  value={filterCategory}
                  onChange={(e) => setFilterCategory(e.target.value)}
                  className="px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-teal-400 focus:ring-4 focus:ring-teal-50 transition-all duration-200"
                >
                  <option value="all">All Categories</option>
                  <option value="financial-literacy">Financial Literacy</option>
                  <option value="career-development">Career Development</option>
                  <option value="education">Education</option>
                  <option value="health-wellness">Health & Wellness</option>
                </select>
              </div>
            </div>

            {/* Available Groups */}
            {loading ? (
              <div className="text-center py-12">
                <div className="w-16 h-16 border-4 border-teal-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                <p className="text-gray-600 text-lg">Loading available groups...</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredGroups.map(group => {
                  const isJoined = currentStudent?.groups?.some((sg: StudentGroup) => sg.groupId === group.id);
                  const isFull = group.status === 'full';
                  
                  return (
                    <div key={group.id} className="bg-white rounded-3xl shadow-2xl p-6 border border-teal-200 shadow-teal-100">
                      <div className="flex justify-between items-start mb-3">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getCategoryColor(group.category)}`}>
                          {group.category.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                        </span>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(group.status)}`}>
                          {group.status.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                        </span>
                      </div>
                      
                      <h3 className="text-lg font-semibold text-gray-800 mb-2">{group.name}</h3>
                      <p className="text-gray-600 text-sm mb-4">{group.description}</p>
                      
                      <div className="space-y-2 text-sm mb-4">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Duration:</span>
                          <span className="font-medium text-gray-800">{group.totalWeeks} weeks</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Start Date:</span>
                          <span className="font-medium text-gray-800">{group.startDate}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">End Date:</span>
                          <span className="font-medium text-gray-800">{group.endDate}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Spots:</span>
                          <span className="font-medium text-gray-800">{group.currentStudents}/{group.maxStudents}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Instructor:</span>
                          <span className="font-medium text-gray-800">{group.instructor}</span>
                        </div>
                      </div>
                      
                      {isJoined ? (
                        <button
                          onClick={() => handleLeaveGroup(group.id)}
                          className="w-full bg-red-500 hover:bg-red-600 text-white font-semibold py-2 px-4 rounded-lg transition-colors"
                        >
                          Leave Group
                        </button>
                      ) : (
                        <button
                          onClick={() => openJoinModal(group)}
                          
                          className={`w-full font-semibold py-2 px-4 rounded-lg transition-colors ${
                            isFull
                              ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                              : 'bg-teal-500 hover:bg-teal-600 text-white'
                          }`}
                        >
                          {isFull ? 'Group Full' : 'Join Group'}
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {activeTab === 'my-groups' && (
          <div className="bg-white rounded-3xl shadow-2xl p-8 border border-teal-200 shadow-teal-100">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-800">My Enrolled Groups</h2>
              <button
                onClick={fetchEnrolledGroups}
                disabled={enrolledGroupsLoading}
                className="bg-teal-500 hover:bg-teal-600 disabled:bg-gray-400 text-white font-semibold py-2 px-4 rounded-lg transition-colors"
              >
                {enrolledGroupsLoading ? 'Loading...' : 'Refresh'}
              </button>
            </div>
            
            {enrolledGroupsLoading ? (
              <div className="text-center py-12">
                <div className="w-16 h-16 border-4 border-teal-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                <p className="text-gray-600 text-lg">Loading your enrolled groups...</p>
              </div>
            ) : enrolledGroups.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-600 text-lg mb-4">You haven't joined any groups yet.</p>
                <p className="text-gray-500">Browse available groups and join one to get started!</p>
                <button
                  onClick={() => setActiveTab('available')}
                  className="mt-4 bg-teal-500 hover:bg-teal-600 text-white font-semibold py-2 px-6 rounded-lg transition-colors"
                >
                  Browse Available Groups
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {enrolledGroups.map(enrollment => (
                  <div key={enrollment.studentid} className="bg-gray-50 rounded-xl p-6 border border-gray-200">
                    <div className="flex justify-between items-start mb-3">
                      <h3 className="text-lg font-semibold text-gray-800">{enrollment.group.groupname}</h3>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        enrollment.status === 'enrolled' ? 'bg-green-100 text-green-800' :
                        enrollment.status === 'active' ? 'bg-blue-100 text-blue-800' :
                        enrollment.status === 'completed' ? 'bg-gray-100 text-gray-800' :
                        'bg-yellow-100 text-yellow-800'
                      }`}>
                        {enrollment.status}
                      </span>
                    </div>
                    
                    <p className="text-gray-600 text-sm mb-4">
                      {enrollment.group.groupdescription || 'No description available'}
                    </p>
                    
                    <div className="space-y-2 text-sm mb-4">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Instructor:</span>
                        <span className="font-medium text-teal-600">{enrollment.group.instructor.instructorname}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Start Date:</span>
                        <span className="font-medium text-gray-800">{enrollment.group.startdate}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">End Date:</span>
                        <span className="font-medium text-gray-800">{enrollment.group.enddate}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Enrolled:</span>
                        <span className="font-medium text-gray-800">
                          {new Date(enrollment.enrollment_date).toLocaleDateString()}
                        </span>
                      </div>
                      {enrollment.group.instructor.instructorspecialization && (
                        <div className="flex justify-between">
                          <span className="text-gray-600">Specialization:</span>
                          <span className="font-medium text-gray-800">{enrollment.group.instructor.instructorspecialization}</span>
                        </div>
                      )}
                    </div>
                    
                    <div className="mt-4">
                      <button
                        onClick={() => {
                          setSelectedGroup(enrollment.groupid);
                          setActiveTab('attendance');
                        }}
                        className="w-full bg-teal-500 hover:bg-teal-600 text-white font-semibold py-2 px-4 rounded-lg transition-colors"
                      >
                        Manage Attendance
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'attendance' && (
          <div className="bg-white rounded-3xl shadow-2xl p-8 border border-teal-200 shadow-teal-100">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
              <h2 className="text-2xl font-bold text-gray-800">Attendance Management</h2>
              <div className="flex space-x-4">
                <select
                  value={selectedGroup}
                  onChange={(e) => setSelectedGroup(e.target.value)}
                  className="px-4 py-2 border-2 border-gray-200 rounded-xl focus:border-teal-400 focus:ring-4 focus:ring-teal-50 transition-all duration-200"
                >
                  <option value="">Select Group</option>
                  {enrolledGroups.map((enrollment) => (
                    <option key={enrollment.groupid} value={enrollment.groupid}>
                      {enrollment.group.groupname}
                    </option>
                  ))}
                </select>
                {selectedGroup && (
                  <select
                    value={selectedWeek}
                    onChange={(e) => setSelectedWeek(parseInt(e.target.value))}
                    className="px-4 py-2 border-2 border-gray-200 rounded-xl focus:border-teal-400 focus:ring-4 focus:ring-teal-50 transition-all duration-200"
                  >
                    {Array.from({ length: 12 }, (_, i) => i + 1).map(week => (
                      <option key={week} value={week}>Week {week}</option>
                    ))}
                  </select>
                )}
              </div>
            </div>

            {selectedGroup && (
              <div className="space-y-6">
                {(() => {
                  const enrollment = enrolledGroups.find(e => e.groupid === selectedGroup);
                  if (!enrollment) return null;
                  
                  const weekDates = getWeekDates(enrollment.group.startdate, selectedWeek);
                  const currentAttendance = getWeekAttendanceStatus(selectedWeek);
                  const attendanceSummary = getAttendanceSummary();
                  
                  return (
                    <>
                      {/* Week Information */}
                      <div className="bg-blue-50 rounded-xl p-4 border border-blue-200">
                        <h3 className="font-semibold text-blue-800 mb-2">Week {selectedWeek} Information</h3>
                        <div className="text-sm text-blue-700">
                          <span>Date Range: {weekDates.start} to {weekDates.end}</span>
                        </div>
                      </div>

                      {/* Overall Attendance Summary */}
                      <div className="bg-teal-50 rounded-xl p-6 border border-teal-200">
                        <h3 className="font-semibold text-teal-800 mb-4">Your Overall Attendance</h3>
                        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                          <div className="text-center">
                            <div className="text-2xl font-bold text-teal-600">{attendanceSummary.percentage}%</div>
                            <div className="text-sm text-teal-700">Attendance Rate</div>
                          </div>
                          <div className="text-center">
                            <div className="text-2xl font-bold text-green-600">{attendanceSummary.present}</div>
                            <div className="text-sm text-green-700">Present</div>
                          </div>
                          <div className="text-center">
                            <div className="text-2xl font-bold text-red-600">{attendanceSummary.absent}</div>
                            <div className="text-sm text-red-700">Absent</div>
                          </div>
                          <div className="text-center">
                            <div className="text-2xl font-bold text-orange-600">{attendanceSummary.late}</div>
                            <div className="text-sm text-orange-700">Late</div>
                          </div>
                          <div className="text-center">
                            <div className="text-2xl font-bold text-yellow-600">{attendanceSummary.excused}</div>
                            <div className="text-sm text-yellow-700">Excused</div>
                          </div>
                        </div>
                      </div>

                      <div className="bg-gray-50 rounded-xl p-6">
                        <h3 className="font-semibold text-gray-800 mb-4">Confirm Your Attendance</h3>
                        
                        <div className="mb-4">
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Add notes or comments for this week (optional):
                          </label>
                          <textarea
                            value={attendanceNote}
                            onChange={(e) => setAttendanceNote(e.target.value)}
                            placeholder="Share your thoughts, questions, or progress for this week..."
                            className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-teal-400 focus:ring-4 focus:ring-teal-50 transition-all duration-200"
                            rows={3}
                          />
                        </div>

                        <div className="flex items-center justify-between p-4 bg-white rounded-lg border border-gray-200">
                          <div>
                            <div className="font-medium text-gray-800">Current Status</div>
                            <div className="text-sm text-gray-600">
                              {currentAttendance ? (
                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getAttendanceStatusColor(currentAttendance.status)}`}>
                                  {currentAttendance.status}
                                </span>
                              ) : (
                                <span className="px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
                                  Not confirmed
                                </span>
                              )}
                            </div>
                          </div>
                          
                          <button
                            onClick={() => confirmAttendance(selectedGroup, selectedWeek)}
                            className="bg-teal-500 hover:bg-teal-600 text-white font-semibold py-2 px-6 rounded-lg transition-colors"
                          >
                            Confirm Attendance
                          </button>
                        </div>

                        {currentAttendance && currentAttendance.studentNotes && (
                          <div className="mt-4 p-4 bg-teal-50 rounded-lg border border-teal-200">
                            <div className="text-sm font-medium text-teal-800 mb-1">Your Notes:</div>
                            <div className="text-sm text-teal-700">{currentAttendance.studentNotes}</div>
                          </div>
                        )}
                      </div>

                      <div className="bg-gray-50 rounded-xl p-6">
                        <h3 className="font-semibold text-gray-800 mb-4">Attendance History</h3>
                        {attendanceLoading ? (
                          <div className="text-center py-8">
                            <p className="text-gray-600">Loading attendance history...</p>
                          </div>
                        ) : attendanceData.length === 0 ? (
                          <div className="text-center py-8">
                            <p className="text-gray-600">No attendance records found for this group.</p>
                          </div>
                        ) : (
                          <div className="space-y-3">
                            {Array.from({ length: 12 }, (_, i) => i + 1).map(week => {
                              const weekAttendance = getWeekAttendanceStatus(week);
                              return (
                                <div key={week} className="flex items-center justify-between p-3 bg-white rounded-lg border border-gray-200">
                                  <div>
                                    <div className="font-medium text-gray-800">Week {week}</div>
                                    <div className="text-sm text-gray-600">
                                      {weekAttendance ? weekAttendance.attendancedate : 'Not marked'}
                                    </div>
                                  </div>
                                  <div className="flex items-center space-x-3">
                                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                      weekAttendance ? getAttendanceStatusColor(weekAttendance.status) : 'bg-gray-100 text-gray-600'
                                    }`}>
                                      {weekAttendance ? weekAttendance.status : 'Not marked'}
                                    </span>
                                    {weekAttendance && weekAttendance.notes && (
                                      <span className="text-xs text-gray-500">Has notes</span>
                                    )}
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    </>
                  );
                })()}
              </div>
            )}
          </div>
        )}

        {activeTab === 'progress' && (
          <div className="bg-white rounded-3xl shadow-2xl p-8 border border-teal-200 shadow-teal-100">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">My Progress Overview</h2>
            
            {currentStudent?.groups.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-600 text-lg mb-4">No progress to display yet.</p>
                <p className="text-gray-500">Join a group to start tracking your progress!</p>
              </div>
            ) : (
              <div className="space-y-8">
                {/* Overall Progress Summary */}
                <div className="bg-gray-50 rounded-xl p-6">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4">Overall Progress</h3>
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="text-center">
                      <div className="text-3xl font-bold text-teal-600">
                        {currentStudent?.groups.length}
                      </div>
                      <div className="text-sm text-gray-600">Active Groups</div>
                    </div>
                    <div className="text-center">
                      <div className="text-3xl font-bold text-teal-600">
                        {Math.round((currentStudent?.groups?.reduce((sum: number, sg: StudentGroup) => sum + sg.progress, 0) || 0) / (currentStudent?.groups?.length || 1))}
                      </div>
                      <div className="text-sm text-gray-600">Average Progress</div>
                    </div>
                    <div className="text-center">
                      <div className="text-3xl font-bold text-teal-600">
                        {currentStudent?.groups?.reduce((sum: number, sg: StudentGroup) => sum + sg.attendance.filter((a: AttendanceRecord) => a.status === 'confirmed').length, 0) || 0}
                      </div>
                      <div className="text-sm text-gray-600">Weeks Attended</div>
                    </div>
                    <div className="text-center">
                      <div className="text-3xl font-bold text-teal-600">
                        {currentStudent?.groups?.filter((sg: StudentGroup) => sg.status === 'completed').length || 0}
                      </div>
                      <div className="text-sm text-gray-600">Completed</div>
                    </div>
                  </div>
                </div>

                {/* Individual Group Progress */}
                <div className="space-y-6">
                  <h3 className="text-lg font-semibold text-gray-800">Group Progress Details</h3>
                  {currentStudent?.groups?.map((studentGroup: StudentGroup) => {
                    const group = availableGroups.find(g => g.id === studentGroup.groupId);
                    if (!group) return null;
                    
                    const confirmedWeeks = studentGroup.attendance.filter((a: AttendanceRecord) => a.status === 'confirmed').length;
                    const totalWeeks = group.totalWeeks;
                    const progressPercentage = Math.round((confirmedWeeks / totalWeeks) * 100);
                    
                    return (
                      <div key={studentGroup.id} className="bg-gray-50 rounded-xl p-6 border border-gray-200">
                        <div className="flex justify-between items-start mb-4">
                          <div>
                            <h4 className="text-lg font-semibold text-gray-800">{group.name}</h4>
                            <p className="text-sm text-gray-600">{group.description}</p>
                          </div>
                          <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                            studentGroup.status === 'active' ? 'bg-green-100 text-green-800' :
                            studentGroup.status === 'completed' ? 'bg-blue-100 text-blue-800' :
                            'bg-yellow-100 text-yellow-800'
                          }`}>
                            {studentGroup.status}
                          </span>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                          <div className="text-center">
                            <div className="text-2xl font-bold text-teal-600">{progressPercentage}%</div>
                            <div className="text-sm text-gray-600">Progress</div>
                          </div>
                          <div className="text-center">
                            <div className="text-2xl font-bold text-teal-600">{confirmedWeeks}/{totalWeeks}</div>
                            <div className="text-sm text-gray-600">Weeks Attended</div>
                          </div>
                          <div className="text-center">
                            <div className="text-2xl font-bold text-teal-600">{group.currentWeek}</div>
                            <div className="text-sm text-gray-600">Current Week</div>
                          </div>
                        </div>
                        
                        <div className="mb-4">
                          <div className="w-full bg-gray-200 rounded-full h-3">
                            <div 
                              className="bg-teal-500 h-3 rounded-full transition-all duration-300"
                              style={{ width: `${progressPercentage}%` }}
                            ></div>
                          </div>
                        </div>
                        
                        <div className="text-sm text-gray-600">
                          <span>Started: {studentGroup.joinDate}</span>
                          <span className="mx-2">•</span>
                          <span>Next: {group.meetingDay}s {group.meetingTime}</span>
                          <span className="mx-2">•</span>
                          <span>Location: {group.location}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Join Group Modal */}
      {showJoinModal && selectedGroupForJoin && (
        <div className="fixed inset-0 bg-white/60 backdrop-blur-[1px] flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto border-2 border-teal-200">
            <div className="p-8">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-800">Join Group</h2>
                <button
                  onClick={closeJoinModal}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="mb-6 p-4 bg-teal-50 rounded-xl border border-teal-200">
                <h3 className="font-semibold text-teal-800 mb-2">Group Information</h3>
                <p className="text-teal-700 text-sm">{selectedGroupForJoin.name}</p>
                <p className="text-teal-600 text-xs">{selectedGroupForJoin.description}</p>
              </div>

              <div className="mb-6 p-4 bg-blue-50 rounded-xl border border-blue-200">
                <h3 className="font-semibold text-blue-800 mb-2">📝 Please Fill In Your Details</h3>
                <p className="text-blue-700 text-sm">
                  Please provide your information below. The system will verify your details against the registered users database.
                </p>
              </div>

              <form onSubmit={(e) => { e.preventDefault(); handleJoinGroupSubmit(); }}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Student Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={joinFormData.studentname}
                      onChange={(e) => handleInputChange('studentname', e.target.value)}
                      placeholder="Enter your full name as registered"
                      className={`w-full px-4 py-3 border-2 rounded-xl focus:ring-4 focus:ring-teal-50 transition-all duration-200 ${
                        formErrors.studentname 
                          ? 'border-red-400 focus:border-red-400' 
                          : 'border-gray-200 focus:border-teal-400'
                      }`}
                      required
                    />
                    {formErrors.studentname ? (
                      <p className="text-xs text-red-500 mt-1">{formErrors.studentname}</p>
                    ) : (
                      <p className="text-xs text-gray-500 mt-1">Must match your registered name exactly</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Student Email <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="email"
                      value={joinFormData.studentemail}
                      onChange={(e) => handleInputChange('studentemail', e.target.value)}
                      placeholder="Enter your registered email address"
                      className={`w-full px-4 py-3 border-2 rounded-xl focus:ring-4 focus:ring-teal-50 transition-all duration-200 ${
                        formErrors.studentemail 
                          ? 'border-red-400 focus:border-red-400' 
                          : 'border-gray-200 focus:border-teal-400'
                      }`}
                      required
                    />
                    {formErrors.studentemail ? (
                      <p className="text-xs text-red-500 mt-1">{formErrors.studentemail}</p>
                    ) : (
                      <p className="text-xs text-gray-500 mt-1">Must match your registered email exactly</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      value={joinFormData.studentphone}
                      onChange={(e) => handleInputChange('studentphone', e.target.value)}
                      placeholder="Enter your phone number"
                      className={`w-full px-4 py-3 border-2 rounded-xl focus:ring-4 focus:ring-teal-50 transition-all duration-200 ${
                        formErrors.studentphone 
                          ? 'border-red-400 focus:border-red-400' 
                          : 'border-gray-200 focus:border-teal-400'
                      }`}
                    />
                    {formErrors.studentphone ? (
                      <p className="text-xs text-red-500 mt-1">{formErrors.studentphone}</p>
                    ) : (
                      <p className="text-xs text-gray-500 mt-1">Optional - for contact purposes</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Additional Notes
                    </label>
                    <textarea
                      value={joinFormData.notes}
                      onChange={(e) => setJoinFormData({...joinFormData, notes: e.target.value})}
                      placeholder="Any special requirements, accommodations, or notes..."
                      rows={3}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-teal-400 focus:ring-4 focus:ring-teal-50 transition-all duration-200"
                    />
                    <p className="text-xs text-gray-500 mt-1">Optional - share any relevant information</p>
                  </div>
                </div>

                <div className="flex space-x-3 mt-8">
                  <button
                    type="button"
                    onClick={closeJoinModal}
                    className="flex-1 bg-gray-500 hover:bg-gray-600 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-200"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    
                    className={`flex-1 font-semibold py-3 px-6 rounded-xl transition-all duration-200 ${
                      joiningGroup || !isFormValid
                        ? 'bg-gray-400 text-gray-500 cursor-not-allowed'
                        : 'bg-teal-500 hover:bg-teal-600 text-white'
                    }`}
                  >
                    {joiningGroup ? 'Joining...' : 'Join Group'}
                  </button>
                </div>
                
                {Object.keys(formErrors).length > 0 && (
                  <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <p className="text-sm text-yellow-700">
                      ⚠️ <strong>Please fix the form errors above before submitting.</strong>
                    </p>
                  </div>
                )}
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Student;

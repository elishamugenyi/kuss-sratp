import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { apiService } from '../services/api';

interface InstructorGroup {
  groupid: string;
  groupname: string;
  groupdescription: string | null;
  startdate: string;
  enddate: string;
  maxstudents: number;
  currentstudents: number;
  status: string;
  created_at: string;
  students: {
    studentid: string;
    studentname: string;
    studentemail: string;
    status: string;
  }[];
}

interface InstructorStudent {
  studentid: string;
  studentname: string;
  studentemail: string;
  studentphone: string | null;
  groupid: string;
  instructorid: string;
  notes: string | null;
  status: string;
  enrollment_date: string;
  attendance: {
    id: string;
    weeknumber: number;
    status: string;
    attendancedate: string;
    notes: string | null;
  }[];
}

interface AttendanceRecord {
  id: string;
  studentid: string;
  groupid: string;
  weeknumber: number;
  attendancedate: string;
  status: 'present' | 'absent' | 'late' | 'excused' | 'makeup';
  notes?: string;
  recorded_by: string;
  created_at: string;
  updated_at: string;
  student?: {
    studentid: string;
    studentname: string;
    studentemail: string;
    studentphone: string;
    status: string;
  };
}

interface StudentWithAttendance {
  studentid: string;
  studentname: string;
  studentemail: string;
  studentphone: string | null;
  groupid: string;
  instructorid: string;
  notes: string | null;
  status: string;
  enrollment_date: string;
  attendance?: AttendanceRecord[]; // Make attendance optional
  hasAttendance?: boolean; // Make hasAttendance optional
}

interface StudentNote {
  id: string;
  groupId: string;
  studentId: string;
  date: string;
  type: 'general' | 'encouragement' | 'concern' | 'achievement';
  content: string;
  isPrivate: boolean;
}

const Instructor: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'groups' | 'attendance' | 'communication'>('groups');
  const [selectedGroup, setSelectedGroup] = useState<string>('');
  const [selectedWeek, setSelectedWeek] = useState<number>(1);

  const { user } = useAuth();
  const [groups, setGroups] = useState<InstructorGroup[]>([]);
  const [students, setStudents] = useState<StudentWithAttendance[]>([]);
  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [expandedStudent, setExpandedStudent] = useState<string | null>(null);
  const [showMultiWeekView, setShowMultiWeekView] = useState(false);

  const [studentNotes, setStudentNotes] = useState<StudentNote[]>([
    {
      id: '1',
      groupId: '1',
      studentId: '1',
      date: '2024-03-15',
      type: 'achievement',
      content: 'Excellent progress on budgeting assignment. Shows great understanding of financial principles.',
      isPrivate: false
    },
    {
      id: '2',
      groupId: '1',
      studentId: '3',
      date: '2024-03-14',
      type: 'concern',
      content: 'Student has missed 3 consecutive weeks. May need additional support or check-in.',
      isPrivate: true
    }
  ]);

  const [newNote, setNewNote] = useState({
    groupId: '',
    studentId: '',
    type: 'general',
    content: '',
    isPrivate: false
  });

  useEffect(() => {
    const fetchGroups = async () => {
      if (user?.id) {
        try {
          console.log('Fetching groups for instructor ID:', user.id);
          const response = await apiService.getInstructorGroups(user.id.toString());
          if (response.success && response.data) {
            setGroups(response.data);
          } else {
            console.error('Failed to fetch groups:', response.error);
          }
        } catch (error) {
          console.error('Error fetching groups:', error);
        }
      }
    };
    fetchGroups();
  }, [user?.id]);

  useEffect(() => {
    const fetchStudents = async () => {
      if (selectedGroup && user?.id) {
        try {
          const response = await apiService.getInstructorStudents(user.id.toString(), selectedGroup);
          console.log('Students API response:', response); // Debug log
          if (response.success && response.data) {
            console.log('Setting students data:', response.data); // Debug log
            setStudents(response.data);
            // Reset attendance records when group changes
            setAttendanceRecords([]);
            
            // Also try to fetch attendance data for the current week
            try {
              const attendanceResponse = await apiService.getStudentsWithAttendanceForWeek(selectedGroup, selectedWeek);
              console.log('Initial attendance fetch response:', attendanceResponse);
              if (attendanceResponse.success && attendanceResponse.data) {
                if (attendanceResponse.data.attendanceRecords) {
                  setAttendanceRecords(attendanceResponse.data.attendanceRecords);
                  
                  // Merge attendance data with students
                  const mergedStudents = mergeAttendanceWithStudents(response.data, attendanceResponse.data.attendanceRecords);
                  console.log('Initial merge of students with attendance:', mergedStudents);
                  setStudents(mergedStudents);
                }
              }
            } catch (attendanceError) {
              console.log('Initial attendance fetch failed (this is normal):', attendanceError);
            }
          }
        } catch (error) {
          console.error('Error fetching students:', error);
        }
      } else {
        // Clear students when no group is selected
        setStudents([]);
        setAttendanceRecords([]);
      }
    };
    fetchStudents();
  }, [selectedGroup, user?.id]);

  // Load attendance data when attendance tab is active and group is selected
  useEffect(() => {
    if (activeTab === 'attendance' && selectedGroup && user?.id) {
      // Small delay to ensure the tab transition is complete
      const timer = setTimeout(() => {
        fetchAttendanceData();
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [activeTab, selectedGroup, user?.id]);

  // Only fetch attendance data when explicitly needed, not automatically
  const fetchAttendanceData = async () => {
    if (!selectedGroup || !user?.id) return;
    
    try {
      setLoading(true);
      
      // Try to get attendance data
      try {
        const response = await apiService.getStudentsWithAttendanceForWeek(selectedGroup, selectedWeek);
        console.log('Attendance API response:', response); // Debug log
        
        if (response.success && response.data) {
          // Update students with attendance data if available
          if (response.data.students) {
            console.log('Setting students with attendance data:', response.data.students); // Debug log
            setStudents(response.data.students);
          }
          if (response.data.attendanceRecords) {
            console.log('Setting attendance records:', response.data.attendanceRecords); // Debug log
            setAttendanceRecords(response.data.attendanceRecords);
            
            // Merge attendance data with existing students
            if (students.length > 0) {
              const mergedStudents = mergeAttendanceWithStudents(students, response.data.attendanceRecords);
              console.log('Merged students with attendance:', mergedStudents);
              setStudents(mergedStudents);
            }
          }
        }
      } catch (attendanceError) {
        console.error('Error fetching attendance data:', attendanceError);
        // If attendance fetch fails, we still have students loaded
      }
    } catch (error) {
      console.error('Error in fetchAttendanceData:', error);
    } finally {
      setLoading(false);
    }
  };

  const selectedGroupData = groups.find(g => g.groupid === selectedGroup);
  const weeks = selectedGroupData?.maxstudents ? Array.from({ length: Math.min(selectedGroupData.maxstudents, 12) }, (_, i) => i + 1) : Array.from({ length: 12 }, (_, i) => i + 1);

  const getWeekDates = (startDate: string, weekNumber: number) => {
    try {
      const start = new Date(startDate);
      if (isNaN(start.getTime())) {
        throw new Error('Invalid start date');
      }
      const weekStart = new Date(start);
      weekStart.setDate(start.getDate() + (weekNumber - 1) * 7);
      const weekEnd = new Date(weekStart);
      weekEnd.setDate(weekStart.getDate() + 6);
      return { start: weekStart.toISOString().split('T')[0], end: weekEnd.toISOString().split('T')[0] };
    } catch (error) {
      console.error('Error calculating week dates:', error);
      return { start: 'Invalid date', end: 'Invalid date' };
    }
  };

  const getAttendanceStatus = (studentId: string, weekNumber: number): string => {
    const record = attendanceRecords.find(r => r.groupid === selectedGroup && r.studentid === studentId && r.weeknumber === weekNumber);
    return record ? record.status : 'not-marked';
  };

  const getAttendanceStatusForStudent = (student: StudentWithAttendance, weekNumber: number): string => {
    try {
      if (!student) return 'not-marked';
      
      // Debug logging
      console.log('Student data:', student);
      console.log('Student attendance:', student.attendance);
      console.log('Attendance records state:', attendanceRecords);
      
      // Check if student.attendance is an array and has data
      if (!Array.isArray(student.attendance) || student.attendance.length === 0) {
        console.log('Student attendance is not an array or empty, checking attendanceRecords');
        // If no attendance data, check if we have attendance records in the separate state
        const record = attendanceRecords.find(r => 
          r.groupid === selectedGroup && 
          r.studentid === student.studentid && 
          r.weeknumber === weekNumber
        );
        console.log('Found record in attendanceRecords:', record);
        return record ? record.status : 'not-marked';
      }
      
      // If student has attendance data, use it
      const record = student.attendance.find(a => a && a.weeknumber === weekNumber);
      console.log('Found record in student.attendance:', record);
      return record ? record.status : 'not-marked';
    } catch (error) {
      console.error('Error getting attendance status:', error);
      return 'not-marked';
    }
  };

  // Helper function to merge attendance data with students
  const mergeAttendanceWithStudents = (studentsData: any[], attendanceData: any[]) => {
    if (!Array.isArray(studentsData) || !Array.isArray(attendanceData)) {
      return studentsData;
    }
    
    return studentsData.map(student => {
      const studentAttendance = attendanceData.filter(att => 
        att.studentid === student.studentid && 
        att.groupid === selectedGroup
      );
      
      return {
        ...student,
        attendance: studentAttendance
      };
    });
  };



  const updateAttendance = async (studentId: string, weekNumber: number, status: 'present' | 'absent' | 'late' | 'excused' | 'makeup') => {
    try {
      if (!selectedGroup || !user?.id || !studentId || !weekNumber) return;
      
      const response = await apiService.markAttendance({
        studentid: studentId,
        groupid: selectedGroup,
        weeknumber: weekNumber,
        status,
        attendancedate: new Date().toISOString().split('T')[0]
      });
      
      if (response.success) {
        // Refresh attendance data
        await fetchAttendanceData();
      }
    } catch (error) {
      console.error('Error updating attendance:', error);
    }
  };

  const markAllPresent = async () => {
    if (!selectedGroup || !user?.id || !Array.isArray(students) || students.length === 0) return;
    
    try {
      const attendanceData = students
        .filter(student => student && student.studentid)
        .map(student => ({
          studentid: student.studentid,
          status: 'present' as const,
          notes: 'Bulk marked present'
        }));
      
      if (attendanceData.length === 0) {
        console.warn('No valid students to mark attendance for');
        return;
      }
      
      const response = await apiService.markAttendanceForWeek(selectedGroup, selectedWeek, attendanceData);
      if (response.success) {
        await fetchAttendanceData();
      }
    } catch (error) {
      console.error('Error marking all present:', error);
    }
  };

  const markAllAbsent = async () => {
    if (!selectedGroup || !user?.id || !Array.isArray(students) || students.length === 0) return;
    
    try {
      const attendanceData = students
        .filter(student => student && student.studentid)
        .map(student => ({
          studentid: student.studentid,
          status: 'absent' as const,
          notes: 'Bulk marked absent'
        }));
      
      if (attendanceData.length === 0) {
        console.warn('No valid students to mark attendance for');
        return;
      }
      
      const response = await apiService.markAttendanceForWeek(selectedGroup, selectedWeek, attendanceData);
      if (response.success) {
        await fetchAttendanceData();
      }
    } catch (error) {
      console.error('Error marking all absent:', error);
    }
  };

  const markAllExcused = async () => {
    if (!selectedGroup || !user?.id || !Array.isArray(students) || students.length === 0) return;
    
    try {
      const attendanceData = students
        .filter(student => student && student.studentid)
        .map(student => ({
          studentid: student.studentid,
          status: 'excused' as const,
          notes: 'Bulk marked excused'
        }));
      
      if (attendanceData.length === 0) {
        console.warn('No valid students to mark attendance for');
        return;
      }
      
      const response = await apiService.markAttendanceForWeek(selectedGroup, selectedWeek, attendanceData);
      if (response.success) {
        await fetchAttendanceData();
      }
    } catch (error) {
      console.error('Error marking all excused:', error);
    }
  };

  const clearAllAttendance = async () => {
    if (!selectedGroup || !user?.id || !Array.isArray(students) || students.length === 0) return;
    
    try {
      // For clearing, we'll mark all as absent with a note
      const attendanceData = students
        .filter(student => student && student.studentid)
        .map(student => ({
          studentid: student.studentid,
          status: 'absent' as const,
          notes: 'Attendance cleared'
        }));
      
      if (attendanceData.length === 0) {
        console.warn('No valid students to clear attendance for');
        return;
      }
      
      const response = await apiService.markAttendanceForWeek(selectedGroup, selectedWeek, attendanceData);
      if (response.success) {
        await fetchAttendanceData();
      }
    } catch (error) {
      console.error('Error clearing attendance:', error);
    }
  };

  const toggleStudentAttendanceHistory = (studentId: string) => {
    try {
      if (!studentId) return;
      setExpandedStudent(expandedStudent === studentId ? null : studentId);
    } catch (error) {
      console.error('Error toggling student attendance history:', error);
    }
  };

  const updateAttendanceWithNotes = async (studentId: string, weekNumber: number, currentStatus: string, notes: string) => {
    try {
      if (!selectedGroup || !user?.id || !notes.trim() || !studentId) return;
      
      const status = currentStatus === 'not-marked' ? 'present' : currentStatus;
      const response = await apiService.markAttendance({
        studentid: studentId,
        groupid: selectedGroup,
        weeknumber: weekNumber,
        status: status as 'present' | 'absent' | 'late' | 'excused' | 'makeup',
        attendancedate: new Date().toISOString().split('T')[0],
        notes: notes.trim()
      });
      
      if (response.success) {
        await fetchAttendanceData();
      }
    } catch (error) {
      console.error('Error updating attendance with notes:', error);
    }
  };

  const exportAttendanceData = () => {
    try {
      if (!selectedGroup || !selectedGroupData || !Array.isArray(students) || students.length === 0) return;
      
      const csvData = [
        ['Student Name', 'Email', 'Phone', 'Week', 'Status', 'Date', 'Notes'],
        ...students
          .filter(student => student && student.studentname && student.studentemail)
          .map(student => [
            student.studentname || 'Unknown',
            student.studentemail || 'No email',
            student.studentphone || 'N/A',
            selectedWeek,
            getAttendanceStatusForStudent(student, selectedWeek),
            new Date().toISOString().split('T')[0],
            student.attendance?.find(a => a && a.weeknumber === selectedWeek)?.notes || ''
          ])
      ];
      
      if (csvData.length <= 1) {
        console.warn('No valid data to export');
        return;
      }
      
      const csvContent = csvData.map(row => row.map(cell => `"${cell}"`).join(',')).join('\n');
      const blob = new Blob([csvContent], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `attendance_${selectedGroupData.groupname || 'group'}_week_${selectedWeek}.csv`;
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error exporting attendance data:', error);
    }
  };

  const handleAddNote = () => {
    if (newNote.groupId && newNote.studentId && newNote.content) {
      const note: StudentNote = {
        id: Date.now().toString(),
        groupId: newNote.groupId,
        studentId: newNote.studentId,
        date: new Date().toISOString().split('T')[0],
        type: newNote.type as any,
        content: newNote.content,
        isPrivate: newNote.isPrivate
      };
      setStudentNotes([...studentNotes, note]);
      setNewNote({ groupId: '', studentId: '', type: 'general', content: '', isPrivate: false });
    }
  };

  const getStatusColor = (status: string | undefined) => {
    try {
      if (!status || status === 'not-marked') return 'bg-gray-100 text-gray-600';
      
      switch (status) {
        case 'present': return 'bg-green-100 text-green-800';
        case 'absent': return 'bg-red-100 text-red-800';
        case 'late': return 'bg-orange-100 text-orange-800';
        case 'excused': return 'bg-yellow-100 text-yellow-800';
        case 'makeup': return 'bg-blue-100 text-blue-800';
        default: return 'bg-gray-100 text-gray-600';
      }
    } catch (error) {
      console.error('Error getting status color:', error);
      return 'bg-gray-100 text-gray-600';
    }
  };

  const getNoteTypeColor = (type: string) => {
    switch (type) {
      case 'achievement': return 'bg-green-100 text-green-800';
      case 'concern': return 'bg-red-100 text-red-800';
      case 'encouragement': return 'bg-blue-100 text-blue-800';
      case 'general': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="min-h-screen bg-white p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-3xl shadow-2xl p-8 mb-8 border border-teal-200 shadow-teal-100">
          <h1 className="text-4xl font-bold text-gray-800 mb-4">Instructor Dashboard</h1>
          <p className="text-gray-600 text-lg">Manage your assigned groups, track attendance, and communicate with students</p>
          {user && (
            <div className="mt-4 text-sm text-gray-500">
              Logged in as: <span className="font-medium text-teal-600">{user.name}</span> 
            </div>
          )}
        </div>

        {/* Navigation Tabs */}
        <div className="flex space-x-2 mb-8">
          {[
            { id: 'groups', label: 'My Groups' },
            { id: 'attendance', label: 'Attendance' },
            { id: 'communication', label: 'Communication' }
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
            <h2 className="text-2xl font-bold text-gray-800 mb-6">My Assigned Groups</h2>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Groups Section */}
              <div className="bg-gray-50 rounded-xl p-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">My Groups</h3>
                {groups.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-gray-500">No groups assigned yet.</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {groups.map(group => (
                      <div key={group.groupid} className="bg-white rounded-lg p-4 border border-gray-200 hover:border-teal-300 transition-colors cursor-pointer">
                        <div className="flex justify-between items-start mb-2">
                          <h4 className="font-semibold text-gray-800">{group.groupname}</h4>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            group.status === 'active' ? 'bg-green-100 text-green-800' :
                            group.status === 'completed' ? 'bg-blue-100 text-blue-800' :
                            'bg-yellow-100 text-yellow-800'
                          }`}>
                            {group.status}
                          </span>
                        </div>
                        <p className="text-gray-600 text-sm mb-3">
                          {group.groupdescription || 'No description available'}
                        </p>
                        <div className="grid grid-cols-2 gap-2 text-xs text-gray-600 mb-3">
                          <div>Start: {new Date(group.startdate).toLocaleDateString()}</div>
                          <div>End: {new Date(group.enddate).toLocaleDateString()}</div>
                          <div>Students: {group.currentstudents}/{group.maxstudents}</div>
                          <div>Created: {new Date(group.created_at).toLocaleDateString()}</div>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-teal-500 h-2 rounded-full transition-all duration-300"
                            style={{ width: `${(group.currentstudents / group.maxstudents) * 100}%` }}
                          ></div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Students Section */}
              <div className="bg-gray-50 rounded-xl p-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Group Students</h3>
                <div className="mb-4">
                  <select
                    value={selectedGroup}
                    onChange={(e) => setSelectedGroup(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:border-teal-400 focus:ring-2 focus:ring-teal-50"
                  >
                    <option value="">Select a group to view students</option>
                    {groups.map(group => (
                      <option key={group.groupid} value={group.groupid}>{group.groupname}</option>
                    ))}
                  </select>
                </div>
                
                {!selectedGroup ? (
                  <div className="text-center py-8">
                    <p className="text-gray-500">Select a group to view enrolled students</p>
                  </div>
                ) : students.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-gray-500">No students enrolled in this group yet.</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {students.map(student => (
                      <div key={student.studentid} className="bg-white rounded-lg p-3 border border-gray-200">
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <h5 className="font-medium text-gray-800">{student.studentname}</h5>
                            <p className="text-sm text-gray-600">{student.studentemail}</p>
                          </div>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            student.status === 'enrolled' ? 'bg-green-100 text-green-800' :
                            student.status === 'active' ? 'bg-blue-100 text-blue-800' :
                            student.status === 'completed' ? 'bg-gray-100 text-gray-800' :
                            'bg-yellow-100 text-yellow-800'
                          }`}>
                            {student.status}
                          </span>
                        </div>
                        <div className="grid grid-cols-2 gap-2 text-xs text-gray-600">
                          <div>Phone: {student.studentphone || 'N/A'}</div>
                          <div>Enrolled: {new Date(student.enrollment_date).toLocaleDateString()}</div>
                          <div>Attendance: {student.attendance?.length || 0} records</div>
                          {student.notes && <div className="col-span-2">Notes: {student.notes}</div>}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'attendance' && (
          <div className="bg-white rounded-3xl shadow-2xl p-8 border border-teal-200 shadow-teal-100">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
              <h2 className="text-2xl font-bold text-gray-800">Attendance Management</h2>
              <div className="flex space-x-4">
                {selectedGroup && (
                  <button
                    onClick={fetchAttendanceData}
                    className="px-4 py-2 bg-teal-500 hover:bg-teal-600 text-white rounded-xl transition-all duration-200"
                  >
                    Load Attendance Data
                  </button>
                )}
                <select
                  value={selectedGroup}
                  onChange={(e) => setSelectedGroup(e.target.value)}
                  className="px-4 py-2 border-2 border-gray-200 rounded-xl focus:border-teal-400 focus:ring-4 focus:ring-teal-50 transition-all duration-200"
                >
                  <option value="">Select Group</option>
                  {groups.map(group => (
                    <option key={group.groupid} value={group.groupid}>{group.groupname}</option>
                  ))}
                </select>
                {selectedGroup && (
                  <select
                    value={selectedWeek}
                    onChange={(e) => setSelectedWeek(parseInt(e.target.value))}
                    className="px-4 py-2 border-2 border-gray-200 rounded-xl focus:border-teal-400 focus:ring-4 focus:ring-teal-50 transition-all duration-200"
                  >
                    {weeks.map(week => (
                      <option key={week} value={week}>Week {week}</option>
                    ))}
                  </select>
                )}
                {selectedGroup && (
                  <>
                    <button
                      onClick={exportAttendanceData}
                      className="px-4 py-2 bg-teal-500 hover:bg-teal-600 text-white rounded-xl transition-all duration-200"
                    >
                      Export Data
                    </button>
                    <button
                      onClick={() => setShowMultiWeekView(!showMultiWeekView)}
                      className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-xl transition-all duration-200"
                    >
                      {showMultiWeekView ? 'Hide' : 'Show'} Multi-Week View
                    </button>
                  </>
                )}
              </div>
            </div>

            {!selectedGroup ? (
              <div className="text-center py-12">
                <div className="text-gray-500 text-lg">Please select a group to manage attendance</div>
              </div>
            ) : !selectedGroupData ? (
              <div className="text-center py-12">
                <div className="text-gray-500 text-lg">Loading group information...</div>
              </div>
            ) : students.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-gray-500 text-lg">No students found in this group</div>
              </div>
            ) : !selectedGroupData.startdate ? (
              <div className="text-center py-12">
                <div className="text-gray-500 text-lg">Group information is incomplete. Please contact support.</div>
              </div>
            ) : (
              <div className="space-y-6">
                <div className="bg-blue-50 rounded-xl p-4 border border-blue-200">
                  <h3 className="font-semibold text-blue-800 mb-2">Week {selectedWeek} Information</h3>
                  <div className="text-sm text-blue-700">
                    <span>Date Range: {(() => {
                      try {
                        if (selectedGroupData?.startdate) {
                          const dates = getWeekDates(selectedGroupData.startdate, selectedWeek);
                          return `${dates.start} to ${dates.end}`;
                        }
                        return 'N/A';
                      } catch (error) {
                        console.error('Error calculating dates:', error);
                        return 'Error calculating dates';
                      }
                    })()}</span>
                  </div>
                </div>


                {/* Bulk Attendance Actions */}
                <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
                  <h3 className="font-semibold text-gray-800 mb-4">Bulk Attendance Actions</h3>
                  <div className="flex flex-wrap gap-3">
                    <button
                      onClick={() => markAllPresent()}
                      className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white text-sm rounded-lg transition-colors"
                    >
                      Mark All Present
                    </button>
                    <button
                      onClick={() => markAllAbsent()}
                      className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white text-sm rounded-lg transition-colors"
                    >
                      Mark All Absent
                    </button>
                    <button
                      onClick={() => markAllExcused()}
                      className="px-4 py-2 bg-yellow-500 hover:bg-yellow-600 text-white text-sm rounded-lg transition-colors"
                    >
                      Mark All Excused
                    </button>
                    <button
                      onClick={() => clearAllAttendance()}
                      className="px-4 py-2 bg-gray-500 hover:bg-gray-600 text-white text-sm rounded-lg transition-colors"
                    >
                      Clear All
                    </button>
                  </div>
                </div>

                {loading ? (
                  <div className="text-center py-12">
                    <div className="text-gray-500 text-lg">Loading attendance data...</div>
                  </div>
                ) : !Array.isArray(students) || students.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="text-gray-500 text-lg">No students found in this group</div>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-gray-200">
                          <th className="text-left py-3 px-4 text-gray-700 font-semibold">Student</th>
                          <th className="text-left py-3 px-4 text-gray-700 font-semibold">Email</th>
                          <th className="text-left py-3 px-4 text-gray-700 font-semibold">Week {selectedWeek}</th>
                          <th className="text-left py-3 px-4 text-gray-700 font-semibold">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {students.filter(student => student && student.studentid && student.studentname).map(student => (
                          <tr key={student.studentid} className="border-b border-gray-100 hover:bg-gray-50">
                            <td className="py-3 px-4">
                              <div>
                                <div className="font-medium text-gray-800">{student.studentname}</div>
                                <div className="text-sm text-gray-600">{student.studentphone || 'No phone'}</div>
                              </div>
                            </td>
                            <td className="py-3 px-4 text-gray-800">{student.studentemail}</td>
                            <td className="py-3 px-4">
                              <div className="flex items-center space-x-2">
                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(getAttendanceStatusForStudent(student, selectedWeek))}`}>
                                  {getAttendanceStatusForStudent(student, selectedWeek)}
                                </span>
                                <button
                                  onClick={() => toggleStudentAttendanceHistory(student.studentid)}
                                  className="text-blue-600 hover:text-blue-800 text-xs underline"
                                >
                                  View History
                                </button>
                              </div>
                            </td>
                            <td className="py-3 px-4">
                              <div className="space-y-2">
                                <div className="flex flex-wrap gap-1">
                                  <button
                                    onClick={() => updateAttendance(student.studentid, selectedWeek, 'present')}
                                    className="px-2 py-1 bg-green-500 hover:bg-green-600 text-white text-xs rounded-lg transition-colors"
                                  >
                                    Present
                                  </button>
                                  <button
                                    onClick={() => updateAttendance(student.studentid, selectedWeek, 'absent')}
                                    className="px-2 py-1 bg-red-500 hover:bg-red-600 text-white text-xs rounded-lg transition-colors"
                                  >
                                    Absent
                                  </button>
                                  <button
                                    onClick={() => updateAttendance(student.studentid, selectedWeek, 'late')}
                                    className="px-2 py-1 bg-orange-500 hover:bg-orange-600 text-white text-xs rounded-lg transition-colors"
                                  >
                                    Late
                                  </button>
                                  <button
                                    onClick={() => updateAttendance(student.studentid, selectedWeek, 'excused')}
                                    className="px-2 py-1 bg-yellow-500 hover:bg-yellow-600 text-white text-xs rounded-lg transition-colors"
                                  >
                                    Excused
                                  </button>
                                  <button
                                    onClick={() => updateAttendance(student.studentid, selectedWeek, 'makeup')}
                                    className="px-2 py-1 bg-blue-500 hover:bg-blue-600 text-white text-xs rounded-lg transition-colors"
                                  >
                                    Makeup
                                  </button>
                                </div>
                                <input
                                  type="text"
                                  placeholder="Add notes..."
                                  className="w-full px-2 py-1 text-xs border border-gray-300 rounded focus:border-teal-400 focus:ring-1 focus:ring-teal-50"
                                  onKeyPress={(e) => {
                                    if (e.key === 'Enter') {
                                      const target = e.target as HTMLInputElement;
                                      updateAttendanceWithNotes(student.studentid, selectedWeek, getAttendanceStatusForStudent(student, selectedWeek), target.value);
                                      target.value = '';
                                    }
                                  }}
                                />
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}

                {/* Attendance History for Expanded Students */}
                {expandedStudent && (
                  <div className="bg-white rounded-xl p-6 border border-gray-200">
                    <h3 className="font-semibold text-gray-800 mb-4">
                      Attendance History for {Array.isArray(students) ? students.find(s => s && s.studentid === expandedStudent)?.studentname || 'Unknown Student' : 'Unknown Student'}
                    </h3>
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead>
                          <tr className="border-b border-gray-200">
                            <th className="text-left py-2 px-3 text-gray-700 font-semibold text-sm">Week</th>
                            <th className="text-left py-2 px-3 text-gray-700 font-semibold text-sm">Date</th>
                            <th className="text-left py-2 px-3 text-gray-700 font-semibold text-sm">Status</th>
                            <th className="text-left py-2 px-3 text-gray-700 font-semibold text-sm">Notes</th>
                            <th className="text-left py-2 px-3 text-gray-700 font-semibold text-sm">Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {Array.from({ length: 12 }, (_, i) => i + 1).map(week => {
                            try {
                              const student = Array.isArray(students) ? students.find(s => s && s.studentid === expandedStudent) : null;
                              const attendance = student?.attendance?.find(a => a && a.weeknumber === week);
                              return (
                                <tr key={week} className="border-b border-gray-100">
                                  <td className="py-2 px-3 text-sm text-gray-800">Week {week}</td>
                                  <td className="py-2 px-3 text-sm text-gray-600">
                                    {attendance?.attendancedate || 'Not marked'}
                                  </td>
                                  <td className="py-2 px-3">
                                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(attendance?.status)}`}>
                                      {attendance?.status || 'not-marked'}
                                    </span>
                                  </td>
                                  <td className="py-2 px-3 text-sm text-gray-600">
                                    {attendance?.notes || '-'}
                                  </td>
                                  <td className="py-2 px-3">
                                    <div className="flex space-x-1">
                                      <button
                                        onClick={() => updateAttendance(expandedStudent, week, 'present')}
                                        className="px-2 py-1 bg-green-500 hover:bg-green-600 text-white text-xs rounded-lg transition-colors"
                                      >
                                        Present
                                      </button>
                                      <button
                                        onClick={() => updateAttendance(expandedStudent, week, 'absent')}
                                        className="px-2 py-1 bg-red-500 hover:bg-red-600 text-white text-xs rounded-lg transition-colors"
                                      >
                                        Absent
                                      </button>
                                      <button
                                        onClick={() => updateAttendance(expandedStudent, week, 'late')}
                                        className="px-2 py-1 bg-orange-500 hover:bg-orange-600 text-white text-xs rounded-lg transition-colors"
                                      >
                                        Late
                                      </button>
                                      <button
                                        onClick={() => updateAttendance(expandedStudent, week, 'excused')}
                                        className="px-2 py-1 bg-yellow-500 hover:bg-yellow-600 text-white text-xs rounded-lg transition-colors"
                                      >
                                        Excused
                                      </button>
                                      <button
                                        onClick={() => updateAttendance(expandedStudent, week, 'makeup')}
                                        className="px-2 py-1 bg-blue-500 hover:bg-blue-600 text-white text-xs rounded-lg transition-colors"
                                      >
                                        Makeup
                                      </button>
                                    </div>
                                  </td>
                                </tr>
                              );
                            } catch (error) {
                              console.error('Error rendering attendance history row:', error);
                              return (
                                <tr key={week} className="border-b border-gray-100">
                                  <td className="py-2 px-3 text-sm text-gray-800">Week {week}</td>
                                  <td className="py-2 px-3 text-sm text-gray-600">Error</td>
                                  <td className="py-2 px-3">
                                    <span className="px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
                                      Error
                                    </span>
                                  </td>
                                  <td className="py-2 px-3 text-sm text-gray-600">-</td>
                                  <td className="py-2 px-3">-</td>
                                </tr>
                              );
                            }
                          })}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                <div className="bg-gray-50 rounded-xl p-6">
                  <h3 className="font-semibold text-gray-800 mb-4">Weekly Summary</h3>
                  <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-green-600">
                        {Array.isArray(students) ? students.filter(s => s && getAttendanceStatusForStudent(s, selectedWeek) === 'present').length : 0}
                      </div>
                      <div className="text-sm text-gray-600">Present</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-red-600">
                        {Array.isArray(students) ? students.filter(s => s && getAttendanceStatusForStudent(s, selectedWeek) === 'absent').length : 0}
                      </div>
                      <div className="text-sm text-gray-600">Absent</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-orange-600">
                        {Array.isArray(students) ? students.filter(s => s && getAttendanceStatusForStudent(s, selectedWeek) === 'late').length : 0}
                      </div>
                      <div className="text-sm text-gray-600">Late</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-yellow-600">
                        {Array.isArray(students) ? students.filter(s => s && getAttendanceStatusForStudent(s, selectedWeek) === 'excused').length : 0}
                      </div>
                      <div className="text-sm text-gray-600">Excused</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-blue-600">
                        {Array.isArray(students) ? students.filter(s => s && getAttendanceStatusForStudent(s, selectedWeek) === 'makeup').length : 0}
                      </div>
                      <div className="text-sm text-gray-600">Makeup</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-gray-600">
                        {Array.isArray(students) ? students.filter(s => s && getAttendanceStatusForStudent(s, selectedWeek) === 'not-marked').length : 0}
                      </div>
                      <div className="text-sm text-gray-600">Not Marked</div>
                    </div>
                  </div>
                  
                  {/* Attendance Rate */}
                  <div className="mt-6 pt-6 border-t border-gray-200">
                    <div className="text-center">
                      <div className="text-3xl font-bold text-teal-600">
                        {Array.isArray(students) && students.length > 0 ? Math.round((students.filter(s => s && getAttendanceStatusForStudent(s, selectedWeek) === 'present').length / students.length) * 100) : 0}%
                      </div>
                      <div className="text-sm text-gray-600">Attendance Rate</div>
                    </div>
                  </div>
                </div>

                {/* Multi-Week Attendance View */}
                {showMultiWeekView && (
                  <div className="bg-white rounded-xl p-6 border border-gray-200">
                    <h3 className="font-semibold text-gray-800 mb-4">Multi-Week Attendance Overview</h3>
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead>
                          <tr className="border-b border-gray-200">
                            <th className="text-left py-2 px-3 text-gray-700 font-semibold text-sm">Student</th>
                            {Array.from({ length: 12 }, (_, i) => i + 1).map(week => (
                              <th key={week} className="text-center py-2 px-1 text-gray-700 font-semibold text-sm">
                                W{week}
                              </th>
                            ))}
                            <th className="text-center py-2 px-3 text-gray-700 font-semibold text-sm">Total</th>
                          </tr>
                        </thead>
                        <tbody>
                          {Array.isArray(students) ? students.filter(student => student && student.studentid && student.studentname).map(student => (
                            <tr key={student.studentid} className="border-b border-gray-100">
                              <td className="py-2 px-3 text-sm font-medium text-gray-800">
                                {student.studentname || 'Unknown'}
                              </td>
                              {Array.from({ length: 12 }, (_, i) => i + 1).map(week => {
                                try {
                                  const status = getAttendanceStatusForStudent(student, week);
                                  const getStatusColor = (status: string) => {
                                    switch (status) {
                                      case 'present': return 'bg-green-100 text-green-800';
                                      case 'absent': return 'bg-red-100 text-red-800';
                                      case 'late': return 'bg-orange-100 text-orange-800';
                                      case 'excused': return 'bg-yellow-100 text-yellow-800';
                                      case 'makeup': return 'bg-blue-100 text-blue-800';
                                      default: return 'bg-gray-100 text-gray-600';
                                    }
                                  };
                                  return (
                                    <td key={week} className="py-2 px-1 text-center">
                                      <span className={`px-1 py-1 rounded text-xs font-medium ${getStatusColor(status)}`}>
                                        {status === 'present' ? 'P' : status === 'absent' ? 'A' : status === 'late' ? 'L' : status === 'excused' ? 'E' : status === 'makeup' ? 'M' : '-'}
                                      </span>
                                    </td>
                                  );
                                } catch (error) {
                                  console.error('Error rendering week status:', error);
                                  return (
                                    <td key={week} className="py-2 px-1 text-center">
                                      <span className="px-1 py-1 rounded text-xs font-medium bg-gray-100 text-gray-600">-</span>
                                    </td>
                                  );
                                }
                              })}
                              <td className="py-2 px-3 text-center text-sm font-medium text-gray-800">
                                {Array.isArray(student.attendance) ? student.attendance.filter(a => a && a.status === 'present').length : 0}
                              </td>
                            </tr>
                          )) : null}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {activeTab === 'communication' && (
          <div className="bg-white rounded-3xl shadow-2xl p-8 border border-teal-200 shadow-teal-100">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">Student Communication</h2>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Add New Note */}
              <div className="bg-gray-50 rounded-xl p-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Add Note/Communication</h3>
                <div className="space-y-4">
                  <select
                    value={newNote.groupId}
                    onChange={(e) => setNewNote({...newNote, groupId: e.target.value})}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-teal-400 focus:ring-4 focus:ring-teal-50 transition-all duration-200"
                  >
                    <option value="">Select Group</option>
                    {groups.map(group => (
                      <option key={group.groupid} value={group.groupid}>{group.groupname}</option>
                    ))}
                  </select>
                  
                  {newNote.groupId && (
                    <select
                      value={newNote.studentId}
                      onChange={(e) => setNewNote({...newNote, studentId: e.target.value})}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-teal-400 focus:ring-4 focus:ring-teal-50 transition-all duration-200"
                    >
                      <option value="">Select Student</option>
                      {groups.find(g => g.groupid === newNote.groupId)?.students.map(student => (
                        <option key={student.studentid} value={student.studentid}>{student.studentname}</option>
                      ))}
                    </select>
                  )}
                  
                  <select
                    value={newNote.type}
                    onChange={(e) => setNewNote({...newNote, type: e.target.value as any})}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-teal-400 focus:ring-4 focus:ring-teal-50 transition-all duration-200"
                  >
                    <option value="general">General Note</option>
                    <option value="encouragement">Encouragement</option>
                    <option value="concern">Concern</option>
                    <option value="achievement">Achievement</option>
                  </select>
                  
                  <textarea
                    placeholder="Enter your note or communication..."
                    value={newNote.content}
                    onChange={(e) => setNewNote({...newNote, content: e.target.value})}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-teal-400 focus:ring-4 focus:ring-teal-50 transition-all duration-200"
                    rows={4}
                  />
                  
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="private"
                      checked={newNote.isPrivate}
                      onChange={(e) => setNewNote({...newNote, isPrivate: e.target.checked})}
                      className="rounded border-gray-300 text-teal-600 focus:ring-teal-500"
                    />
                    <label htmlFor="private" className="text-sm text-gray-700">Private note (only visible to instructors)</label>
                  </div>
                  
                  <button
                    onClick={handleAddNote}
                    className="w-full bg-teal-500 hover:bg-teal-600 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-200"
                  >
                    Add Note
                  </button>
                </div>
              </div>

              {/* View Notes */}
              <div className="bg-gray-50 rounded-xl p-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Recent Notes</h3>
                <div className="space-y-4 max-h-96 overflow-y-auto">
                  {studentNotes.map(note => {
                    const student = students.find(s => s.studentid === note.studentId);
                    const group = groups.find(g => g.groupid === note.groupId);
                    return (
                      <div key={note.id} className="bg-white rounded-lg p-4 border border-gray-200">
                        <div className="flex justify-between items-start mb-2">
                          <div className="flex items-center space-x-2">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getNoteTypeColor(note.type)}`}>
                              {note.type}
                            </span>
                            {note.isPrivate && (
                              <span className="px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                                Private
                              </span>
                            )}
                          </div>
                          <span className="text-xs text-gray-500">{note.date}</span>
                        </div>
                        <div className="text-sm text-gray-600 mb-2">
                          <span className="font-medium">Student:</span> {student?.studentname} | <span className="font-medium">Group:</span> {group?.groupname}
                        </div>
                        <p className="text-gray-800 text-sm">{note.content}</p>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Instructor;

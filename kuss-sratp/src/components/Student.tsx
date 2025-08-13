import { useState } from 'react';

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
  id: string;
  name: string;
  email: string;
  ward: string;
  joinDate: string;
  currentGroups: StudentGroup[];
}

const Student: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'available' | 'my-groups' | 'attendance' | 'progress'>('available');
  const [selectedGroup, setSelectedGroup] = useState<string>('');
  const [selectedWeek, setSelectedWeek] = useState<number>(1);
  const [attendanceNote, setAttendanceNote] = useState('');

  const [availableGroups, setAvailableGroups] = useState<Group[]>([
    {
      id: '1',
      name: 'Financial Literacy Fundamentals',
      description: 'Learn essential money management skills including budgeting, saving, investing, and debt management.',
      startDate: '2024-04-01',
      endDate: '2024-06-24',
      totalWeeks: 12,
      currentWeek: 0,
      maxStudents: 15,
      currentStudents: 8,
      instructor: 'David Wilson',
      status: 'open',
      category: 'financial-literacy',
      meetingTime: '7:00 PM',
      meetingDay: 'Tuesday',
      location: 'Stake Center - Room 201'
    },
    {
      id: '2',
      name: 'Career Development & Job Search',
      description: 'Develop professional skills, resume writing, interview preparation, and career planning strategies.',
      startDate: '2024-04-15',
      endDate: '2024-07-08',
      totalWeeks: 12,
      currentWeek: 0,
      maxStudents: 12,
      currentStudents: 12,
      instructor: 'Sarah Johnson',
      status: 'full',
      category: 'career-development',
      meetingTime: '6:30 PM',
      meetingDay: 'Thursday',
      location: 'Stake Center - Room 203'
    },
    {
      id: '3',
      name: 'Education Planning & Scholarships',
      description: 'Navigate educational opportunities, scholarship applications, and academic planning for higher education.',
      startDate: '2024-05-01',
      endDate: '2024-07-22',
      totalWeeks: 12,
      currentWeek: 0,
      maxStudents: 10,
      currentStudents: 5,
      instructor: 'Michael Brown',
      status: 'open',
      category: 'education',
      meetingTime: '7:30 PM',
      meetingDay: 'Monday',
      location: 'Stake Center - Room 205'
    },
    {
      id: '4',
      name: 'Health & Wellness Management',
      description: 'Focus on physical health, mental wellness, stress management, and healthy lifestyle choices.',
      startDate: '2024-04-08',
      endDate: '2024-06-30',
      totalWeeks: 12,
      currentWeek: 0,
      maxStudents: 18,
      currentStudents: 14,
      instructor: 'Emily Davis',
      status: 'open',
      category: 'health-wellness',
      meetingTime: '6:00 PM',
      meetingDay: 'Wednesday',
      location: 'Stake Center - Room 207'
    }
  ]);

  const [currentStudent, setCurrentStudent] = useState<Student>({
    id: 'student-1',
    name: 'John Smith',
    email: 'john.smith@email.com',
    ward: 'Ward 1',
    joinDate: '2024-01-15',
    currentGroups: [
      {
        id: 'sg-1',
        groupId: '1',
        studentId: 'student-1',
        joinDate: '2024-03-01',
        status: 'active',
        progress: 75,
        attendance: [
          { id: 'att-1', groupId: '1', studentId: 'student-1', weekNumber: 1, date: '2024-04-01', status: 'confirmed' },
          { id: 'att-2', groupId: '1', studentId: 'student-1', weekNumber: 2, date: '2024-04-08', status: 'confirmed' },
          { id: 'att-3', groupId: '1', studentId: 'student-1', weekNumber: 3, date: '2024-04-15', status: 'confirmed' },
          { id: 'att-4', groupId: '1', studentId: 'student-1', weekNumber: 4, date: '2024-04-22', status: 'confirmed' },
          { id: 'att-5', groupId: '1', studentId: 'student-1', weekNumber: 5, date: '2024-04-29', status: 'confirmed' },
          { id: 'att-6', groupId: '1', studentId: 'student-1', weekNumber: 6, date: '2024-05-06', status: 'confirmed' },
          { id: 'att-7', groupId: '1', studentId: 'student-1', weekNumber: 7, date: '2024-05-13', status: 'confirmed' },
          { id: 'att-8', groupId: '1', studentId: 'student-1', weekNumber: 8, date: '2024-05-20', status: 'pending' },
        ]
      }
    ]
  });

  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');

  const filteredGroups = availableGroups.filter(group => {
    if (filterCategory !== 'all' && group.category !== filterCategory) return false;
    if (searchTerm && !group.name.toLowerCase().includes(searchTerm.toLowerCase()) && 
        !group.description.toLowerCase().includes(searchTerm.toLowerCase())) return false;
    return true;
  });

  const handleJoinGroup = (groupId: string) => {
    const group = availableGroups.find(g => g.id === groupId);
    if (group && group.status === 'open') {
      // In a real app, this would be an API call
      const newStudentGroup: StudentGroup = {
        id: `sg-${Date.now()}`,
        groupId,
        studentId: currentStudent.id,
        joinDate: new Date().toISOString().split('T')[0],
        status: 'active',
        progress: 0,
        attendance: []
      };
      
      setCurrentStudent({
        ...currentStudent,
        currentGroups: [...currentStudent.currentGroups, newStudentGroup]
      });

      // Update group availability
      setAvailableGroups(availableGroups.map(g => 
        g.id === groupId 
          ? { ...g, currentStudents: g.currentStudents + 1, status: g.currentStudents + 1 >= g.maxStudents ? 'full' : 'open' }
          : g
      ));
    }
  };

  const handleLeaveGroup = (groupId: string) => {
    setCurrentStudent({
      ...currentStudent,
      currentGroups: currentStudent.currentGroups.filter(sg => sg.groupId !== groupId)
    });

    // Update group availability
    setAvailableGroups(availableGroups.map(g => 
      g.id === groupId 
        ? { ...g, currentStudents: g.currentStudents - 1, status: 'open' }
        : g
    ));
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

  const confirmAttendance = (groupId: string, weekNumber: number) => {
    const studentGroup = currentStudent.currentGroups.find(sg => sg.groupId === groupId);
    if (studentGroup) {
      const existingAttendance = studentGroup.attendance.find(a => a.weekNumber === weekNumber);
      
      if (existingAttendance) {
        // Update existing attendance
        setCurrentStudent({
          ...currentStudent,
          currentGroups: currentStudent.currentGroups.map(sg => 
            sg.groupId === groupId 
              ? {
                  ...sg,
                  attendance: sg.attendance.map(a => 
                    a.weekNumber === weekNumber 
                      ? { ...a, status: 'confirmed', studentNotes: attendanceNote }
                      : a
                  )
                }
              : sg
          )
        });
      } else {
        // Add new attendance record
        const newAttendance: AttendanceRecord = {
          id: `att-${Date.now()}`,
          groupId,
          studentId: currentStudent.id,
          weekNumber,
          date: new Date().toISOString().split('T')[0],
          status: 'confirmed',
          studentNotes: attendanceNote
        };

        setCurrentStudent({
          ...currentStudent,
          currentGroups: currentStudent.currentGroups.map(sg => 
            sg.groupId === groupId 
              ? { ...sg, attendance: [...sg.attendance, newAttendance] }
              : sg
          )
        });
      }
      
      setAttendanceNote('');
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
            <p className="text-teal-800 font-medium">Welcome back, {currentStudent.name}!</p>
            <p className="text-teal-700 text-sm">Ward: {currentStudent.ward} | Member since: {currentStudent.joinDate}</p>
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
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredGroups.map(group => {
                const isJoined = currentStudent.currentGroups.some(sg => sg.groupId === group.id);
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
                        <span className="text-gray-600">Meeting:</span>
                        <span className="font-medium text-gray-800">{group.meetingDay}s {group.meetingTime}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Location:</span>
                        <span className="font-medium text-gray-800">{group.location}</span>
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
                        onClick={() => handleJoinGroup(group.id)}
                        disabled={isFull}
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
          </div>
        )}

        {activeTab === 'my-groups' && (
          <div className="bg-white rounded-3xl shadow-2xl p-8 border border-teal-200 shadow-teal-100">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">My Enrolled Groups</h2>
            
            {currentStudent.currentGroups.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-600 text-lg mb-4">You haven't joined any groups yet.</p>
                <p className="text-gray-500">Browse available groups and join one to get started!</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {currentStudent.currentGroups.map(studentGroup => {
                  const group = availableGroups.find(g => g.id === studentGroup.groupId);
                  if (!group) return null;
                  
                  return (
                    <div key={studentGroup.id} className="bg-gray-50 rounded-xl p-6 border border-gray-200">
                      <div className="flex justify-between items-start mb-3">
                        <h3 className="text-lg font-semibold text-gray-800">{group.name}</h3>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          studentGroup.status === 'active' ? 'bg-green-100 text-green-800' :
                          studentGroup.status === 'completed' ? 'bg-blue-100 text-blue-800' :
                          'bg-yellow-100 text-yellow-800'
                        }`}>
                          {studentGroup.status}
                        </span>
                      </div>
                      
                      <div className="space-y-2 text-sm mb-4">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Progress:</span>
                          <span className="font-medium text-teal-600">{studentGroup.progress}%</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Current Week:</span>
                          <span className="font-medium text-gray-800">{group.currentWeek}/{group.totalWeeks}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Next Meeting:</span>
                          <span className="font-medium text-gray-800">{group.meetingDay}s {group.meetingTime}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Location:</span>
                          <span className="font-medium text-gray-800">{group.location}</span>
                        </div>
                      </div>
                      
                      <div className="mt-4">
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-teal-500 h-2 rounded-full transition-all duration-300"
                            style={{ width: `${studentGroup.progress}%` }}
                          ></div>
                        </div>
                      </div>
                      
                      <button
                        onClick={() => {
                          setSelectedGroup(studentGroup.groupId);
                          setActiveTab('attendance');
                        }}
                        className="w-full mt-4 bg-teal-500 hover:bg-teal-600 text-white font-semibold py-2 px-4 rounded-lg transition-colors"
                      >
                        Manage Attendance
                      </button>
                    </div>
                  );
                })}
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
                  {currentStudent.currentGroups.map(sg => {
                    const group = availableGroups.find(g => g.id === sg.groupId);
                    return group ? (
                      <option key={sg.groupId} value={sg.groupId}>{group.name}</option>
                    ) : null;
                  })}
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
                  const studentGroup = currentStudent.currentGroups.find(sg => sg.groupId === selectedGroup);
                  const group = availableGroups.find(g => g.id === selectedGroup);
                  if (!studentGroup || !group) return null;
                  
                  const weekDates = getWeekDates(group.startDate, selectedWeek);
                  const currentAttendance = studentGroup.attendance.find(a => a.weekNumber === selectedWeek);
                  
                  return (
                    <>
                      <div className="bg-blue-50 rounded-xl p-4 border border-blue-200">
                        <h3 className="font-semibold text-blue-800 mb-2">Week {selectedWeek} Information</h3>
                        <div className="text-sm text-blue-700">
                          <span>Date Range: {weekDates.start} to {weekDates.end}</span>
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
                        <div className="space-y-3">
                          {studentGroup.attendance.map(attendance => (
                            <div key={attendance.id} className="flex items-center justify-between p-3 bg-white rounded-lg border border-gray-200">
                              <div>
                                <div className="font-medium text-gray-800">Week {attendance.weekNumber}</div>
                                <div className="text-sm text-gray-600">{attendance.date}</div>
                              </div>
                              <div className="flex items-center space-x-3">
                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getAttendanceStatusColor(attendance.status)}`}>
                                  {attendance.status}
                                </span>
                                {attendance.studentNotes && (
                                  <span className="text-xs text-gray-500">Has notes</span>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
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
            
            {currentStudent.currentGroups.length === 0 ? (
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
                        {currentStudent.currentGroups.length}
                      </div>
                      <div className="text-sm text-gray-600">Active Groups</div>
                    </div>
                    <div className="text-center">
                      <div className="text-3xl font-bold text-teal-600">
                        {Math.round(currentStudent.currentGroups.reduce((sum, sg) => sum + sg.progress, 0) / currentStudent.currentGroups.length)}
                      </div>
                      <div className="text-sm text-gray-600">Average Progress</div>
                    </div>
                    <div className="text-center">
                      <div className="text-3xl font-bold text-teal-600">
                        {currentStudent.currentGroups.reduce((sum, sg) => sum + sg.attendance.filter(a => a.status === 'confirmed').length, 0)}
                      </div>
                      <div className="text-sm text-gray-600">Weeks Attended</div>
                    </div>
                    <div className="text-center">
                      <div className="text-3xl font-bold text-teal-600">
                        {currentStudent.currentGroups.filter(sg => sg.status === 'completed').length}
                      </div>
                      <div className="text-sm text-gray-600">Completed</div>
                    </div>
                  </div>
                </div>

                {/* Individual Group Progress */}
                <div className="space-y-6">
                  <h3 className="text-lg font-semibold text-gray-800">Group Progress Details</h3>
                  {currentStudent.currentGroups.map(studentGroup => {
                    const group = availableGroups.find(g => g.id === studentGroup.groupId);
                    if (!group) return null;
                    
                    const confirmedWeeks = studentGroup.attendance.filter(a => a.status === 'confirmed').length;
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
    </div>
  );
};

export default Student;

import { useState } from 'react';

interface Student {
  id: string;
  name: string;
  email: string;
  phone: string;
  ward: string;
  joinDate: string;
}

interface Group {
  id: string;
  name: string;
  startDate: string;
  endDate: string;
  totalWeeks: number;
  currentWeek: number;
  students: Student[];
  instructor: string;
  status: 'active' | 'completed' | 'pending';
}

interface AttendanceRecord {
  id: string;
  groupId: string;
  studentId: string;
  weekNumber: number;
  date: string;
  status: 'present' | 'absent' | 'excused';
  notes?: string;
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

  const [groups, setGroups] = useState<Group[]>([
    {
      id: '1',
      name: 'Financial Literacy Group A',
      startDate: '2024-01-15',
      endDate: '2024-04-08',
      totalWeeks: 12,
      currentWeek: 8,
      students: [
        { id: '1', name: 'John Smith', email: 'john.smith@email.com', phone: '555-0101', ward: 'Ward 1', joinDate: '2024-01-15' },
        { id: '2', name: 'Sarah Johnson', email: 'sarah.j@email.com', phone: '555-0102', ward: 'Ward 1', joinDate: '2024-01-15' },
        { id: '3', name: 'Michael Brown', email: 'michael.b@email.com', phone: '555-0103', ward: 'Ward 2', joinDate: '2024-01-15' },
        { id: '4', name: 'Emily Davis', email: 'emily.d@email.com', phone: '555-0104', ward: 'Ward 1', joinDate: '2024-01-15' },
      ],
      instructor: 'David Wilson',
      status: 'active'
    },
    {
      id: '2',
      name: 'Career Development Group B',
      startDate: '2024-02-01',
      endDate: '2024-04-23',
      totalWeeks: 12,
      currentWeek: 6,
      students: [
        { id: '5', name: 'Robert Miller', email: 'robert.m@email.com', phone: '555-0105', ward: 'Ward 2', joinDate: '2024-02-01' },
        { id: '6', name: 'Lisa Wilson', email: 'lisa.w@email.com', phone: '555-0106', ward: 'Ward 3', joinDate: '2024-02-01' },
      ],
      instructor: 'David Wilson',
      status: 'active'
    }
  ]);

  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>([
    { id: '1', groupId: '1', studentId: '1', weekNumber: 1, date: '2024-01-15', status: 'present' },
    { id: '2', groupId: '1', studentId: '2', weekNumber: 1, date: '2024-01-15', status: 'present' },
    { id: '3', groupId: '1', studentId: '3', weekNumber: 1, date: '2024-01-15', status: 'absent' },
    { id: '4', groupId: '1', studentId: '4', weekNumber: 1, date: '2024-01-15', status: 'present' },
  ]);

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

  const selectedGroupData = groups.find(g => g.id === selectedGroup);
  const weeks = selectedGroupData ? Array.from({ length: selectedGroupData.totalWeeks }, (_, i) => i + 1) : [];

  const getWeekDates = (startDate: string, weekNumber: number) => {
    const start = new Date(startDate);
    const weekStart = new Date(start);
    weekStart.setDate(start.getDate() + (weekNumber - 1) * 7);
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekStart.getDate() + 6);
    return { start: weekStart.toISOString().split('T')[0], end: weekEnd.toISOString().split('T')[0] };
  };

  const getAttendanceStatus = (studentId: string, weekNumber: number) => {
    const record = attendanceRecords.find(r => r.groupId === selectedGroup && r.studentId === studentId && r.weekNumber === weekNumber);
    return record ? record.status : 'not-marked';
  };

  const updateAttendance = (studentId: string, weekNumber: number, status: 'present' | 'absent' | 'excused') => {
    const existingRecord = attendanceRecords.find(r => r.groupId === selectedGroup && r.studentId === studentId && r.weekNumber === weekNumber);
    
    if (existingRecord) {
      setAttendanceRecords(attendanceRecords.map(r => 
        r.id === existingRecord.id ? { ...r, status, date: new Date().toISOString().split('T')[0] } : r
      ));
    } else {
      const newRecord: AttendanceRecord = {
        id: Date.now().toString(),
        groupId: selectedGroup,
        studentId,
        weekNumber,
        date: new Date().toISOString().split('T')[0],
        status
      };
      setAttendanceRecords([...attendanceRecords, newRecord]);
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

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'present': return 'bg-green-100 text-green-800';
      case 'absent': return 'bg-red-100 text-red-800';
      case 'excused': return 'bg-yellow-100 text-yellow-800';
      case 'not-marked': return 'bg-gray-100 text-gray-600';
      default: return 'bg-gray-100 text-gray-600';
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
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {groups.map(group => (
                <div key={group.id} className="bg-gray-50 rounded-xl p-6 border border-gray-200">
                  <div className="flex justify-between items-start mb-3">
                    <h3 className="text-lg font-semibold text-gray-800">{group.name}</h3>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      group.status === 'active' ? 'bg-green-100 text-green-800' :
                      group.status === 'completed' ? 'bg-blue-100 text-blue-800' :
                      'bg-yellow-100 text-yellow-800'
                    }`}>
                      {group.status}
                    </span>
                  </div>
                  <div className="space-y-2 text-sm mb-4">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Start Date:</span>
                      <span className="font-medium text-gray-800">{group.startDate}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">End Date:</span>
                      <span className="font-medium text-gray-800">{group.endDate}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Current Week:</span>
                      <span className="font-medium text-teal-600">{group.currentWeek}/{group.totalWeeks}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Students:</span>
                      <span className="font-medium text-gray-800">{group.students.length}</span>
                    </div>
                  </div>
                  <div className="mt-4">
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-teal-500 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${(group.currentWeek / group.totalWeeks) * 100}%` }}
                      ></div>
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      setSelectedGroup(group.id);
                      setActiveTab('attendance');
                    }}
                    className="w-full mt-4 bg-teal-500 hover:bg-teal-600 text-white font-semibold py-2 px-4 rounded-lg transition-colors"
                  >
                    Manage Attendance
                  </button>
                </div>
              ))}
            </div>
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
                  {groups.map(group => (
                    <option key={group.id} value={group.id}>{group.name}</option>
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
              </div>
            </div>

            {selectedGroup && selectedGroupData && (
              <div className="space-y-6">
                <div className="bg-blue-50 rounded-xl p-4 border border-blue-200">
                  <h3 className="font-semibold text-blue-800 mb-2">Week {selectedWeek} Information</h3>
                  <div className="text-sm text-blue-700">
                    <span>Date Range: {getWeekDates(selectedGroupData.startDate, selectedWeek).start} to {getWeekDates(selectedGroupData.startDate, selectedWeek).end}</span>
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-gray-200">
                        <th className="text-left py-3 px-4 text-gray-700 font-semibold">Student</th>
                        <th className="text-left py-3 px-4 text-gray-700 font-semibold">Ward</th>
                        <th className="text-left py-3 px-4 text-gray-700 font-semibold">Week {selectedWeek}</th>
                        <th className="text-left py-3 px-4 text-gray-700 font-semibold">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {selectedGroupData.students.map(student => (
                        <tr key={student.id} className="border-b border-gray-100 hover:bg-gray-50">
                          <td className="py-3 px-4">
                            <div>
                              <div className="font-medium text-gray-800">{student.name}</div>
                              <div className="text-sm text-gray-600">{student.email}</div>
                            </div>
                          </td>
                          <td className="py-3 px-4 text-gray-800">{student.ward}</td>
                          <td className="py-3 px-4">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(getAttendanceStatus(student.id, selectedWeek))}`}>
                              {getAttendanceStatus(student.id, selectedWeek)}
                            </span>
                          </td>
                          <td className="py-3 px-4">
                            <div className="flex space-x-2">
                              <button
                                onClick={() => updateAttendance(student.id, selectedWeek, 'present')}
                                className="px-3 py-1 bg-green-500 hover:bg-green-600 text-white text-xs rounded-lg transition-colors"
                              >
                                Present
                              </button>
                              <button
                                onClick={() => updateAttendance(student.id, selectedWeek, 'absent')}
                                className="px-3 py-1 bg-red-500 hover:bg-red-600 text-white text-xs rounded-lg transition-colors"
                              >
                                Absent
                              </button>
                              <button
                                onClick={() => updateAttendance(student.id, selectedWeek, 'excused')}
                                className="px-3 py-1 bg-yellow-500 hover:bg-yellow-600 text-white text-xs rounded-lg transition-colors"
                              >
                                Excused
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="bg-gray-50 rounded-xl p-6">
                  <h3 className="font-semibold text-gray-800 mb-4">Weekly Summary</h3>
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-green-600">
                        {selectedGroupData.students.filter(s => getAttendanceStatus(s.id, selectedWeek) === 'present').length}
                      </div>
                      <div className="text-sm text-gray-600">Present</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-red-600">
                        {selectedGroupData.students.filter(s => getAttendanceStatus(s.id, selectedWeek) === 'absent').length}
                      </div>
                      <div className="text-sm text-gray-600">Absent</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-yellow-600">
                        {selectedGroupData.students.filter(s => getAttendanceStatus(s.id, selectedWeek) === 'excused').length}
                      </div>
                      <div className="text-sm text-gray-600">Excused</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-gray-600">
                        {selectedGroupData.students.filter(s => getAttendanceStatus(s.id, selectedWeek) === 'not-marked').length}
                      </div>
                      <div className="text-sm text-gray-600">Not Marked</div>
                    </div>
                  </div>
                </div>
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
                      <option key={group.id} value={group.id}>{group.name}</option>
                    ))}
                  </select>
                  
                  {newNote.groupId && (
                    <select
                      value={newNote.studentId}
                      onChange={(e) => setNewNote({...newNote, studentId: e.target.value})}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-teal-400 focus:ring-4 focus:ring-teal-50 transition-all duration-200"
                    >
                      <option value="">Select Student</option>
                      {groups.find(g => g.id === newNote.groupId)?.students.map(student => (
                        <option key={student.id} value={student.id}>{student.name}</option>
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
                    const student = groups.flatMap(g => g.students).find(s => s.id === note.studentId);
                    const group = groups.find(g => g.id === note.groupId);
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
                          <span className="font-medium">Student:</span> {student?.name} | <span className="font-medium">Group:</span> {group?.name}
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

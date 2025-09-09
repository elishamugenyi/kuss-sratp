export const config = {
  API_BASE_URL: 'http://localhost:3000',
  API_ENDPOINTS: {
    SIGNUP: '/signup',
    LOGIN: '/auth/login',
    ADD_USER: '/auth/add_user',
    LOGOUT: '/auth/logout',
    ASSIGN_GROUP: '/group/assign',
    GET_GROUPS: '/group/assignments',
    UPDATE_GROUP: '/group/assignment',
    JOIN_GROUP: '/group/join',
    MY_ENROLLMENTS: '/group/my-enrollment',
    MY_GROUPS: '/group/my-groups',
    MY_STUDENTS: '/group/my-students',
    
    // =====================================================
    // ATTENDANCE MANAGEMENT ENDPOINTS
    // =====================================================
    MARK_ATTENDANCE: '/group/attendance',
    GET_ATTENDANCE: '/group/attendance',
    GET_ATTENDANCE_BY_WEEK: '/group/attendance',
    GET_STUDENTS_WITH_ATTENDANCE: '/group/attendance',
    MARK_ATTENDANCE_FOR_WEEK: '/group/attendance',
    UPDATE_ATTENDANCE_RECORD: '/group/attendance',

    // =====================================================
    // VIEW PARTICIPANTS ENDPOINTS
    // =====================================================
    VIEW_PARTICIPANTS: '/group/my-group-details',
    
    // Legacy attendance endpoints (keeping for backward compatibility)
    ATTENDANCE: '/group/attendance',
    GET_ALL_ATTENDANCE_FOR_GROUP: '/group/attendance',

    // =====================================================
    // STAKES ENDPOINTS
    // =====================================================
    STAKE_REPORTS: '/group/stake_reports'
  },
} as const;


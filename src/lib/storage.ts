// State Management & Reactive Data Layer for ULearn Marketplace
import {
  User,
  UserRole,
  Course,
  Category,
  CourseEnrollment,
  LiveSession,
  Order,
  TransactionLedger,
  TeacherPayout,
  Certificate,
  Review,
  PlatformSetting,
  AuditLog,
  NotificationItem,
  Quiz,
  QuizAttempt,
  AssignmentSubmission,
  TeacherWorkingMode,
  MembershipStatus,
  AcademyTeacherPermissions,
  AcademyMembership
} from './types';
import {
  initialCategories,
  initialUsers,
  initialCourses,
  initialEnrollments,
  initialCertificates,
  initialLiveSessions,
  initialOrders,
  initialLedger,
  initialPayouts,
  initialReviews,
  initialPlatformSetting,
  initialAuditLogs,
  initialNotifications,
  initialMemberships
} from './seed-data';
import {
  hashPassword,
  verifyPassword,
  generateSalt,
  validatePasswordStrength,
  isValidEmail
} from './crypto-auth';

const STORAGE_KEY = 'ulearn_state_v4';
const CURRENT_USER_KEY = 'ulearn_current_user_id';

export interface AppState {
  users: User[];
  currentUserId: string;
  isAuthenticated: boolean;
  hasExplicitLogin?: boolean;
  sessionExpiry?: number;
  categories: Category[];
  courses: Course[];
  enrollments: CourseEnrollment[];
  certificates: Certificate[];
  liveSessions: LiveSession[];
  orders: Order[];
  ledger: TransactionLedger[];
  payouts: TeacherPayout[];
  reviews: Review[];
  settings: PlatformSetting;
  auditLogs: AuditLog[];
  notifications: NotificationItem[];
  memberships: AcademyMembership[];
}

function getInitialState(): AppState {
  return {
    users: initialUsers,
    currentUserId: '', // Guest has no user profile
    isAuthenticated: false, // Default visitor enters as a Guest
    hasExplicitLogin: false,
    categories: initialCategories,
    courses: initialCourses,
    enrollments: initialEnrollments,
    certificates: initialCertificates,
    liveSessions: initialLiveSessions,
    orders: initialOrders,
    ledger: initialLedger,
    payouts: initialPayouts,
    reviews: initialReviews,
    settings: initialPlatformSetting,
    auditLogs: initialAuditLogs,
    notifications: initialNotifications,
    memberships: initialMemberships,
  };
}

export function loadState(): AppState {
  if (typeof window === 'undefined') {
    return getInitialState();
  }

  try {
    // Clear legacy state if present
    if (localStorage.getItem('ulearn_state_v1')) {
      try { localStorage.removeItem('ulearn_state_v1'); } catch (e) {}
    }
    if (localStorage.getItem('ulearn_state_v2')) {
      try { localStorage.removeItem('ulearn_state_v2'); } catch (e) {}
    }
    if (localStorage.getItem('ulearn_state_v3')) {
      try { localStorage.removeItem('ulearn_state_v3'); } catch (e) {}
    }

    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      const state = getInitialState();
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
      return state;
    }
    const parsed = JSON.parse(raw);
    const combinedState: AppState = { ...getInitialState(), ...parsed };

    // Ensure seed users are always available
    const existingIds = new Set(combinedState.users.map(u => u.id));
    for (const initUser of initialUsers) {
      if (!existingIds.has(initUser.id)) {
        combinedState.users.push(initUser);
      }
    }

    // Ensure seed memberships are always available
    if (!combinedState.memberships || combinedState.memberships.length === 0) {
      combinedState.memberships = initialMemberships;
    } else {
      const existingMemIds = new Set(combinedState.memberships.map(m => m.id));
      for (const initMem of initialMemberships) {
        if (!existingMemIds.has(initMem.id)) {
          combinedState.memberships.push(initMem);
        }
      }
    }

    // Check session expiration if sessionExpiry exists
    if (combinedState.sessionExpiry && Date.now() > combinedState.sessionExpiry) {
      combinedState.isAuthenticated = false;
      combinedState.hasExplicitLogin = false;
      combinedState.currentUserId = '';
    }

    // Default to guest (unauthenticated) if user hasn't explicitly logged in
    if (!combinedState.hasExplicitLogin) {
      combinedState.isAuthenticated = false;
      combinedState.currentUserId = '';
    }

    return combinedState;
  } catch (err) {
    console.error('Failed to parse localStorage state:', err);
    return getInitialState();
  }
}

export function saveState(state: AppState): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    window.dispatchEvent(new Event('ulearn_state_changed'));
  } catch (err) {
    console.error('Failed to save state to localStorage:', err);
  }
}

// -------------------------------------------------------------
// USER & ROLE AUTHENTICATION (RBAC & CREDENTIAL SECURITY)
// -------------------------------------------------------------

export function getCurrentUser(state: AppState): User {
  if (state.currentUserId) {
    const user = state.users.find(u => u.id === state.currentUserId);
    if (user) return user;
  }
  const defaultStudent = state.users.find(u => u.role === 'STUDENT');
  return defaultStudent || state.users[0];
}

export function switchUser(role: UserRole): User {
  const state = loadState();
  const targetUser = state.users.find(u => u.role === role);
  if (targetUser) {
    state.currentUserId = targetUser.id;
    state.isAuthenticated = true;
    state.sessionExpiry = Date.now() + (24 * 60 * 60 * 1000);
    saveState(state);
    return targetUser;
  }
  return state.users[0];
}

export function isUserAuthenticated(state?: AppState): boolean {
  const s = state || loadState();
  if (!s.isAuthenticated) return false;
  if (s.sessionExpiry && Date.now() > s.sessionExpiry) return false;
  return true;
}

export interface RegisterUserInput {
  name: string;
  email: string;
  password: string;
  role: UserRole;
}

/**
 * Registers a new user with cryptographic password hashing,
 * uniqueness verification, strength checking, and role setup.
 */
export async function registerUser(input: RegisterUserInput): Promise<{ success: boolean; user?: User; error?: string }> {
  const { name, email, password, role } = input;

  if (!name || !name.trim()) {
    return { success: false, error: 'Full name is required.' };
  }
  if (!email || !isValidEmail(email)) {
    return { success: false, error: 'A valid email address is required.' };
  }

  const strength = validatePasswordStrength(password);
  if (!strength.isValid) {
    return { success: false, error: strength.errors[0] || 'Password does not meet security requirements.' };
  }

  const state = loadState();
  const existing = state.users.find(u => u.email.toLowerCase() === email.trim().toLowerCase());
  if (existing) {
    return { success: false, error: 'An account with this email address already exists. Please log in instead.' };
  }

  const salt = generateSalt();
  const passwordHash = await hashPassword(password, salt);
  
  // Teacher and Academy accounts start with PENDING_APPROVAL for verification
  const isBusinessRole = role === 'TEACHER' || role === 'ACADEMY' || role === 'SELLER' || role === 'COACH' || role === 'BRAND';
  const status = isBusinessRole ? 'PENDING_APPROVAL' : 'ACTIVE';

  const newUser: User = {
    id: `usr-${role.toLowerCase()}-${Date.now()}`,
    name: name.trim(),
    email: email.trim().toLowerCase(),
    role: role,
    status: status,
    salt,
    passwordHash,
    avatarUrl: `https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80`,
    headline: `${role.charAt(0).toUpperCase() + role.slice(1).toLowerCase()} Account at ULearn`,
    bio: `Active ${role.toLowerCase()} account created on ${new Date().toLocaleDateString()}.`,
    isEmailVerified: true,
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  if (role === 'STUDENT' || role === 'MEMBER') {
    newUser.studentProfile = {
      id: `sp-${Date.now()}`,
      userId: newUser.id,
      headline: `${name.trim()} - Dedicated Learner`,
      bio: 'Student pursuing technical mastery on ULearn.',
      interests: ['Web Development', 'Artificial Intelligence', 'Cloud Engineering'],
      learningPoints: 100,
      streakDays: 1,
      badges: ['New Scholar'],
    };
    newUser.memberProfile = {
      id: `mp-${Date.now()}`,
      userId: newUser.id,
      interests: ['Web Development', 'Artificial Intelligence'],
      learningGoals: ['Complete certification tracks'],
      ordersCount: 0,
      enrolledProgramsCount: 0,
    };
  } else if (role === 'TEACHER' || role === 'SELLER' || role === 'COACH') {
    newUser.teacherProfile = {
      id: `tp-${Date.now()}`,
      userId: newUser.id,
      user: null as any,
      headline: `${name.trim()} - Course Instructor`,
      bio: 'Educator creating courses and curriculum on ULearn.',
      expertise: ['Curriculum Engineering'],
      experienceYears: 1,
      verificationStatus: 'PENDING',
      totalEarningsCents: 0,
      pendingBalanceCents: 0,
      payoutConfig: {
        method: 'BANK_TRANSFER',
        accountDetails: 'Pending verification',
      },
    };
  } else if (role === 'ACADEMY' || role === 'ACADEMY_ADMIN' || role === 'BRAND') {
    newUser.academyProfile = {
      id: `ap-${Date.now()}`,
      userId: newUser.id,
      academyName: `${name.trim()} Academy`,
      headline: 'Enterprise Educational Institute',
      bio: 'Academy administering cohorts, certifications, and multi-instructor training on ULearn.',
      accreditation: 'Under Verification',
      campusLocation: 'Online Campus',
      websiteUrl: 'https://ulearn.com',
      contactEmail: email.trim().toLowerCase(),
      establishedYear: new Date().getFullYear(),
      totalStudents: 0,
      verificationStatus: 'PENDING',
    };
  }

  state.users.push(newUser);
  state.currentUserId = newUser.id;
  state.isAuthenticated = true;
  state.hasExplicitLogin = true;
  state.sessionExpiry = Date.now() + (24 * 60 * 60 * 1000); // 24h
  saveState(state);

  return { success: true, user: newUser };
}

/**
 * Authenticates a user with email and password.
 * Retrieves role strictly from the trusted database (role cannot be selected during login).
 */
export async function loginWithCredentials(
  email: string, 
  password: string, 
  rememberMe: boolean = false
): Promise<{ success: boolean; user?: User; error?: string }> {
  if (!email || !email.trim()) {
    return { success: false, error: 'Please enter your email address.' };
  }
  if (!password) {
    return { success: false, error: 'Please enter your password.' };
  }

  const state = loadState();
  const user = state.users.find(u => u.email.toLowerCase() === email.trim().toLowerCase());
  if (!user) {
    return { success: false, error: 'Invalid email or password. Please check your credentials or register.' };
  }

  // If user has salt and passwordHash, perform cryptographic verification
  if (user.passwordHash && user.salt) {
    const isMatch = await verifyPassword(password, user.salt, user.passwordHash);
    if (!isMatch) {
      return { success: false, error: 'Invalid email or password. Please check your credentials.' };
    }
  }

  if (user.status === 'SUSPENDED') {
    return { success: false, error: 'This account has been suspended. Please contact platform administration.' };
  }

  state.currentUserId = user.id;
  state.isAuthenticated = true;
  state.hasExplicitLogin = true;
  const expiryDays = rememberMe ? 7 : 1;
  state.sessionExpiry = Date.now() + (expiryDays * 24 * 60 * 60 * 1000);
  saveState(state);

  return { success: true, user };
}

/**
 * Fast login method for demo personas or backward compatibility
 */
export function loginUser(email: string, role?: UserRole): { success: boolean; user?: User; error?: string } {
  const state = loadState();
  let user: User | undefined;
  if (email && email.trim()) {
    user = state.users.find(u => u.email.toLowerCase() === email.trim().toLowerCase());
  }
  if (!user && role) {
    user = state.users.find(u => u.role === role);
  }
  if (!user) {
    return { 
      success: false, 
      error: 'No account found matching this email. Pick one of the verified role profiles or register a new account.' 
    };
  }
  state.currentUserId = user.id;
  state.isAuthenticated = true;
  state.hasExplicitLogin = true;
  state.sessionExpiry = Date.now() + (24 * 60 * 60 * 1000);
  saveState(state);
  return { success: true, user };
}

export function logoutUser(): void {
  const state = loadState();
  state.isAuthenticated = false;
  state.hasExplicitLogin = false;
  state.currentUserId = 'usr-student';
  state.sessionExpiry = 0;
  saveState(state);
}

/**
 * Resets a user's password cryptographically
 */
export async function resetPassword(email: string, newPassword: string): Promise<{ success: boolean; error?: string }> {
  const strength = validatePasswordStrength(newPassword);
  if (!strength.isValid) {
    return { success: false, error: strength.errors[0] || 'Password does not meet security requirements.' };
  }
  const state = loadState();
  const idx = state.users.findIndex(u => u.email.toLowerCase() === email.trim().toLowerCase());
  if (idx === -1) {
    return { success: false, error: 'No account registered with this email address.' };
  }

  const salt = generateSalt();
  const passwordHash = await hashPassword(newPassword, salt);
  state.users[idx].salt = salt;
  state.users[idx].passwordHash = passwordHash;
  state.users[idx].updatedAt = new Date().toISOString();
  saveState(state);
  return { success: true };
}

/**
 * Approves a pending business account (Seller, Coach, or Brand)
 */
export function approveUser(userId: string): { success: boolean; error?: string } {
  const state = loadState();
  const user = state.users.find(u => u.id === userId);
  if (!user) return { success: false, error: 'User not found' };
  user.status = 'ACTIVE';
  if (user.sellerProfile) user.sellerProfile.verificationStatus = 'VERIFIED';
  if (user.coachProfile) user.coachProfile.verificationStatus = 'VERIFIED';
  if (user.brandProfile) user.brandProfile.verificationStatus = 'VERIFIED';
  saveState(state);
  return { success: true };
}

/**
 * Maps any role to its authorized dashboard route
 */
export function getUserRoleDashboard(role: UserRole): string {
  switch (role) {
    case 'STUDENT':
    case 'MEMBER':
      return '/my-learning';
    case 'TEACHER':
    case 'SELLER':
    case 'COACH':
      return '/teacher/dashboard';
    case 'ACADEMY':
    case 'ACADEMY_ADMIN':
    case 'BRAND':
      return '/academy/dashboard';
    case 'ADMIN':
      return '/admin/dashboard';
    default:
      return '/my-learning';
  }
}

/**
 * Validates whether a user's role grants access to a specific dashboard
 */
export function canAccessDashboard(
  userRole: UserRole, 
  targetDashboard: UserRole
): boolean {
  if (userRole === 'ADMIN') return true; // Platform Administrator can inspect all dashboards
  if (targetDashboard === 'ADMIN') return false; // Non-admin cannot access admin dashboard
  
  if (targetDashboard === 'STUDENT' || targetDashboard === 'MEMBER') {
    return userRole === 'STUDENT' || userRole === 'MEMBER';
  }
  if (targetDashboard === 'TEACHER' || targetDashboard === 'SELLER' || targetDashboard === 'COACH') {
    return userRole === 'TEACHER' || userRole === 'SELLER' || userRole === 'COACH';
  }
  if (targetDashboard === 'ACADEMY' || targetDashboard === 'ACADEMY_ADMIN' || targetDashboard === 'BRAND') {
    return userRole === 'ACADEMY' || userRole === 'ACADEMY_ADMIN' || userRole === 'BRAND';
  }
  return false;
}

export function updateUserProfile(userId: string, updates: Partial<User>): User {
  const state = loadState();
  const idx = state.users.findIndex(u => u.id === userId);
  if (idx !== -1) {
    // Prevent ordinary profile edits from tampering with role, id, or salt
    const { role, id, salt, passwordHash, ...safeUpdates } = updates;
    state.users[idx] = {
      ...state.users[idx],
      ...safeUpdates,
      id: userId,
      updatedAt: new Date().toISOString(),
    };
    saveState(state);
    return state.users[idx];
  }
  return state.users[0];
}

export function resetUserToDefault(userId: string): User {
  const initial = initialUsers.find(u => u.id === userId);
  if (!initial) return getCurrentUser(loadState());
  return updateUserProfile(userId, initial);
}

// -------------------------------------------------------------
// COURSE CATALOG & BUILDER
// -------------------------------------------------------------

export function getCourses(state: AppState, filters?: {
  categoryId?: string;
  level?: string;
  search?: string;
  teacherId?: string;
  isFree?: boolean;
}): Course[] {
  let list = state.courses;

  if (filters?.teacherId) {
    list = list.filter(c => c.teacherId === filters.teacherId);
  }
  if (filters?.categoryId && filters.categoryId !== 'all') {
    list = list.filter(c => c.categoryId === filters.categoryId);
  }
  if (filters?.level && filters.level !== 'all') {
    list = list.filter(c => c.level === filters.level);
  }
  if (filters?.isFree !== undefined) {
    list = list.filter(c => c.isFree === filters.isFree);
  }
  if (filters?.search) {
    const q = filters.search.toLowerCase();
    list = list.filter(c =>
      c.title.toLowerCase().includes(q) ||
      c.subtitle?.toLowerCase().includes(q) ||
      c.teacher.name.toLowerCase().includes(q) ||
      c.categoryName.toLowerCase().includes(q)
    );
  }

  return list;
}

export function getCourseById(state: AppState, courseId: string): Course | undefined {
  return state.courses.find(c => c.id === courseId);
}

export function saveCourse(course: Course): Course {
  const state = loadState();
  const index = state.courses.findIndex(c => c.id === course.id);
  if (index >= 0) {
    state.courses[index] = course;
  } else {
    state.courses.unshift(course);
  }
  saveState(state);
  return course;
}

// -------------------------------------------------------------
// CHECKOUT & ENROLLMENT (SANDBOX PAYMENT & FINANCIAL LEDGER)
// -------------------------------------------------------------

export function enrollCourse(courseId: string, customPriceCents?: number): { success: boolean; enrollment?: CourseEnrollment; message?: string } {
  const state = loadState();
  const user = getCurrentUser(state);
  const course = state.courses.find(c => c.id === courseId);

  if (!course) {
    return { success: false, message: 'Course not found' };
  }

  const existing = state.enrollments.find(e => e.userId === user.id && e.courseId === courseId);
  if (existing) {
    return { success: true, enrollment: existing, message: 'Already enrolled in this course.' };
  }

  const finalPriceCents = customPriceCents !== undefined 
    ? customPriceCents 
    : (course.isFree ? 0 : (course.discountPriceCents ?? course.priceCents));

  // Dynamic Commission calculation
  const commissionPercent = state.settings.commissionPercent;
  const platformFeeCents = Math.round((finalPriceCents * commissionPercent) / 100);
  const teacherShareCents = finalPriceCents - platformFeeCents;

  const orderNumber = `ORD-${Date.now().toString().slice(-6)}`;
  const orderId = `ord-${Date.now()}`;

  // 1. Create Order
  const newOrder: Order = {
    id: orderId,
    orderNumber,
    userId: user.id,
    userName: user.name,
    totalAmountCents: finalPriceCents,
    discountCents: (course.priceCents - finalPriceCents),
    status: 'COMPLETED',
    paymentProvider: 'SANDBOX',
    providerTxId: `sbx_tx_${Math.random().toString(36).substring(2, 9)}`,
    createdAt: new Date().toISOString(),
    items: [
      {
        id: `item-${Date.now()}`,
        courseId: course.id,
        courseTitle: course.title,
        priceCents: finalPriceCents,
        commissionPercent,
        platformFeeCents,
        teacherShareCents,
      },
    ],
  };

  // 2. Immutable Ledger Row
  const newLedgerEntry: TransactionLedger = {
    id: `led-${Date.now()}`,
    orderId,
    orderNumber,
    buyerName: user.name,
    courseTitle: course.title,
    grossAmountCents: finalPriceCents,
    platformFeeCents,
    teacherShareCents,
    commissionPercent,
    teacherId: course.teacherId,
    status: 'SETTLED',
    createdAt: new Date().toISOString(),
  };

  // 3. Create Enrollment Record
  const newEnrollment: CourseEnrollment = {
    id: `enr-${Date.now()}`,
    userId: user.id,
    courseId: course.id,
    course,
    enrolledAt: new Date().toISOString(),
    progressPercent: 0,
    certificateIssued: false,
    lessonProgress: {},
  };

  // Increment student count
  course.studentCount = (course.studentCount || 0) + 1;

  state.orders.unshift(newOrder);
  state.ledger.unshift(newLedgerEntry);
  state.enrollments.unshift(newEnrollment);

  // Add Notification
  state.notifications.unshift({
    id: `notif-${Date.now()}`,
    title: 'Course Enrolled Successfully',
    message: `You now have full lifetime access to "${course.title}".`,
    type: 'ENROLLMENT',
    isRead: false,
    actionUrl: `/learn/${course.id}`,
    createdAt: new Date().toISOString(),
  });

  saveState(state);
  return { success: true, enrollment: newEnrollment };
}

// -------------------------------------------------------------
// LEARNING PROGRESS & VIDEO RESUME
// -------------------------------------------------------------

export function updateLessonProgress(
  courseId: string,
  lessonId: string,
  isCompleted: boolean,
  watchedSecs: number,
  lastPosition?: number
): CourseEnrollment | undefined {
  const state = loadState();
  const user = getCurrentUser(state);
  const enrollment = state.enrollments.find(e => e.userId === user.id && e.courseId === courseId);

  if (!enrollment) return undefined;

  const current = enrollment.lessonProgress[lessonId] || {
    lessonId,
    isCompleted: false,
    watchedSecs: 0,
    lastPosition: 0,
    updatedAt: new Date().toISOString(),
  };

  current.isCompleted = isCompleted;
  current.watchedSecs = Math.max(current.watchedSecs, watchedSecs);
  if (lastPosition !== undefined) {
    current.lastPosition = lastPosition;
  }
  current.updatedAt = new Date().toISOString();

  enrollment.lessonProgress[lessonId] = current;

  // Calculate total lessons in course
  const totalLessons = enrollment.course.sections.reduce(
    (acc, sec) => acc + sec.lessons.length,
    0
  );

  const completedCount = Object.values(enrollment.lessonProgress).filter(p => p.isCompleted).length;
  enrollment.progressPercent = totalLessons > 0 ? Math.round((completedCount / totalLessons) * 100) : 100;

  // Auto-issue Certificate when 100% completed
  if (enrollment.progressPercent >= 100 && !enrollment.certificateIssued) {
    enrollment.certificateIssued = true;
    enrollment.completedAt = new Date().toISOString();

    const certNo = `UL-${new Date().getFullYear()}-${Math.floor(10000 + Math.random() * 90000)}`;
    state.certificates.unshift({
      id: `cert-${Date.now()}`,
      certificateNo: certNo,
      userId: user.id,
      recipientName: user.name,
      courseId: enrollment.course.id,
      courseTitle: enrollment.course.title,
      instructorName: enrollment.course.teacher.name,
      issueDate: new Date().toISOString().split('T')[0],
      verifyUrl: `https://ulearn.example/verify/${certNo}`,
    });

    state.notifications.unshift({
      id: `notif-cert-${Date.now()}`,
      title: 'Congratulations! Certificate Earned',
      message: `You completed "${enrollment.course.title}". Your official verified certificate is ready!`,
      type: 'INFO',
      isRead: false,
      actionUrl: '/certificates',
      createdAt: new Date().toISOString(),
    });
  }

  saveState(state);
  return enrollment;
}

// -------------------------------------------------------------
// QUIZ ATTEMPT & AUTO-GRADING
// -------------------------------------------------------------

export function submitQuiz(
  quiz: Quiz,
  selectedOptionIds: Record<string, string> // questionId -> optionId
): { attempt: QuizAttempt; passed: boolean; scorePercent: number } {
  const state = loadState();
  const user = getCurrentUser(state);

  let correctCount = 0;
  const totalQuestions = quiz.questions.length;

  quiz.questions.forEach(q => {
    const selectedOptId = selectedOptionIds[q.id];
    const correctOpt = q.options.find(o => o.isCorrect);
    if (correctOpt && correctOpt.id === selectedOptId) {
      correctCount++;
    }
  });

  const scorePercent = totalQuestions > 0 ? Math.round((correctCount / totalQuestions) * 100) : 100;
  const passed = scorePercent >= quiz.passingScore;

  const attempt: QuizAttempt = {
    id: `attempt-${Date.now()}`,
    quizId: quiz.id,
    userId: user.id,
    score: scorePercent,
    isPassed: passed,
    completedAt: new Date().toISOString(),
    answers: Object.entries(selectedOptionIds).map(([qId, oId]) => ({
      id: `ans-${Math.random()}`,
      attemptId: `attempt-${Date.now()}`,
      questionId: qId,
      question: quiz.questions.find(q => q.id === qId)!,
      optionId: oId,
      option: quiz.questions.find(q => q.id === qId)!.options.find(o => o.id === oId)!,
    })),
  };

  saveState(state);
  return { attempt, passed, scorePercent };
}

// -------------------------------------------------------------
// TEACHER PAYOUT REQUESTS & ADMIN APPROVALS
// -------------------------------------------------------------

export function requestPayout(teacherId: string, amountCents: number, method: string): { success: boolean; payout?: TeacherPayout; message?: string } {
  const state = loadState();
  const teacherUser = state.users.find(u => u.id === teacherId);

  if (amountCents < state.settings.minPayoutCents) {
    return { success: false, message: `Minimum payout threshold is $${(state.settings.minPayoutCents / 100).toFixed(2)}.` };
  }

  const newPayout: TeacherPayout = {
    id: `pay-${Date.now()}`,
    teacherId,
    teacherName: teacherUser?.name || 'Instructor',
    amountCents,
    status: 'REQUESTED',
    method,
    requestedAt: new Date().toISOString(),
  };

  state.payouts.unshift(newPayout);

  state.auditLogs.unshift({
    id: `audit-${Date.now()}`,
    actorName: teacherUser?.name || 'Instructor',
    actorRole: 'TEACHER',
    action: 'REQUEST_PAYOUT',
    resourceType: 'TeacherPayout',
    resourceId: newPayout.id,
    details: `Requested withdrawal of $${(amountCents / 100).toFixed(2)} via ${method}.`,
    createdAt: new Date().toISOString(),
  });

  saveState(state);
  return { success: true, payout: newPayout };
}

export function reviewPayout(payoutId: string, approve: boolean, notes?: string): boolean {
  const state = loadState();
  const admin = getCurrentUser(state);
  const payout = state.payouts.find(p => p.id === payoutId);

  if (!payout) return false;

  payout.status = approve ? 'PAID' : 'REJECTED';
  payout.notes = notes || (approve ? 'Approved and disbursed via ACH transfer.' : 'Declined. Please contact support.');
  payout.processedAt = new Date().toISOString();
  if (approve) {
    payout.referenceCode = `ACH-${Math.floor(1000000 + Math.random() * 9000000)}`;
  }

  state.auditLogs.unshift({
    id: `audit-${Date.now()}`,
    actorName: admin.name,
    actorRole: admin.role,
    action: approve ? 'APPROVE_PAYOUT' : 'REJECT_PAYOUT',
    resourceType: 'TeacherPayout',
    resourceId: payout.id,
    details: `${approve ? 'Approved' : 'Rejected'} payout of $${(payout.amountCents / 100).toFixed(2)}. Notes: ${payout.notes}`,
    createdAt: new Date().toISOString(),
  });

  saveState(state);
  return true;
}

// -------------------------------------------------------------
// ADMIN COMMISSION CONFIGURATION
// -------------------------------------------------------------

export function updatePlatformCommission(commissionPercent: number): boolean {
  const state = loadState();
  const admin = getCurrentUser(state);
  const oldRate = state.settings.commissionPercent;
  state.settings.commissionPercent = commissionPercent;

  state.auditLogs.unshift({
    id: `audit-${Date.now()}`,
    actorName: admin.name,
    actorRole: admin.role,
    action: 'UPDATE_COMMISSION',
    resourceType: 'PlatformSetting',
    resourceId: 'global',
    details: `Adjusted platform marketplace commission from ${oldRate}% to ${commissionPercent}%.`,
    createdAt: new Date().toISOString(),
  });

  saveState(state);
  return true;
}

// -------------------------------------------------------------
// TEACHER & ACADEMY RELATIONSHIP ENGINE (RBAC & MEMBERSHIP POLICIES)
// -------------------------------------------------------------

export function getMemberships(state?: AppState): AcademyMembership[] {
  const s = state || loadState();
  return s.memberships || [];
}

export function getTeacherMemberships(teacherId: string, state?: AppState): AcademyMembership[] {
  const s = state || loadState();
  return (s.memberships || []).filter(m => m.teacherId === teacherId);
}

export function getAcademyMemberships(academyUserIdOrId: string, state?: AppState): AcademyMembership[] {
  const s = state || loadState();
  return (s.memberships || []).filter(
    m => m.academyUserId === academyUserIdOrId || m.academyId === academyUserIdOrId
  );
}

export function getAcademies(state?: AppState): User[] {
  const s = state || loadState();
  return s.users.filter(u => (u.role === 'ACADEMY' || u.role === 'ACADEMY_ADMIN') && u.academyProfile);
}

export function getAcademyById(academyIdOrUserId: string, state?: AppState): User | undefined {
  const s = state || loadState();
  return s.users.find(
    u => (u.role === 'ACADEMY' || u.role === 'ACADEMY_ADMIN') &&
         (u.id === academyIdOrUserId || u.academyProfile?.id === academyIdOrUserId)
  );
}

/**
 * Submits an academy join request from an authenticated teacher.
 * Backend security checks:
 * 1. Caller must be an active teacher.
 * 2. Target must be a valid registered academy.
 * 3. Prevents self-application (academy cannot apply to itself).
 * 4. Prevents duplicate active/pending memberships.
 * 5. Does not alter teacher's global role or independent identity.
 */
export function submitAcademyJoinRequest(params: {
  teacherId: string;
  academyId: string;
  applicationMessage?: string;
  roleTitle?: string;
}): { success: boolean; membership?: AcademyMembership; error?: string } {
  const { teacherId, academyId, applicationMessage, roleTitle } = params;
  const state = loadState();

  const teacher = state.users.find(u => u.id === teacherId);
  if (!teacher) {
    return { success: false, error: 'Teacher account not found.' };
  }
  const isTeacherRole = teacher.role === 'TEACHER' || teacher.role === 'SELLER' || teacher.role === 'COACH';
  if (!isTeacherRole) {
    return { success: false, error: 'Only registered teachers and educators can submit academy join applications.' };
  }

  const academy = getAcademyById(academyId, state);
  if (!academy) {
    return { success: false, error: 'Selected academy does not exist.' };
  }

  // Prevent self-application
  if (teacher.id === academy.id) {
    return { success: false, error: 'An academy cannot submit a teacher application to itself.' };
  }

  // Duplicate membership checks
  const existingActive = (state.memberships || []).find(
    m => m.teacherId === teacher.id &&
         (m.academyId === academy.academyProfile?.id || m.academyUserId === academy.id) &&
         (m.status === 'APPROVED' || m.status === 'PENDING')
  );

  if (existingActive) {
    if (existingActive.status === 'APPROVED') {
      return { success: false, error: 'You are already an affiliated teacher with this academy.' };
    }
    if (existingActive.status === 'PENDING') {
      return { success: false, error: 'You already have a pending join application submitted to this academy.' };
    }
  }

  const newMembership: AcademyMembership = {
    id: `mem-${Date.now()}`,
    academyId: academy.academyProfile?.id || academy.id,
    academyUserId: academy.id,
    academyName: academy.academyProfile?.academyName || academy.name,
    academyLogoUrl: academy.avatarUrl,
    teacherId: teacher.id,
    teacherName: teacher.name,
    teacherEmail: teacher.email,
    teacherAvatarUrl: teacher.avatarUrl,
    teacherHeadline: teacher.headline || teacher.teacherProfile?.headline || 'Educator',
    status: 'PENDING',
    roleTitle: roleTitle?.trim() || 'Instructor',
    appliedAt: new Date().toISOString(),
    applicationMessage: applicationMessage?.trim() || '',
    permissions: {
      canCreateCourses: false,
      canEditAcademyCourses: false,
      canViewStudents: false,
      canManageAssignments: false,
      canHostLiveSessions: false,
    },
    assignedCourseIds: [],
  };

  if (!state.memberships) {
    state.memberships = [];
  }
  state.memberships.unshift(newMembership);

  // Notify Academy Administrator
  state.notifications.unshift({
    id: `notif-app-${Date.now()}`,
    title: 'New Teacher Application Received',
    message: `${teacher.name} has submitted an application to join ${newMembership.academyName}.`,
    type: 'INFO',
    isRead: false,
    actionUrl: '/academy/dashboard',
    createdAt: new Date().toISOString(),
  });

  // Audit Log
  state.auditLogs.unshift({
    id: `audit-${Date.now()}`,
    actorName: teacher.name,
    actorRole: teacher.role,
    action: 'TEACHER_JOIN_REQUEST',
    resourceType: 'AcademyMembership',
    resourceId: newMembership.id,
    details: `Teacher ${teacher.name} applied to join ${newMembership.academyName} as ${newMembership.roleTitle}.`,
    createdAt: new Date().toISOString(),
  });

  saveState(state);
  return { success: true, membership: newMembership };
}

/**
 * Reviews a teacher's join application (Approve or Reject).
 * Backend security checks:
 * 1. Only the authorized academy administrator or platform ADMIN can approve or reject.
 * 2. Teachers cannot approve their own requests.
 * 3. Sets custom permissions on approval.
 */
export function reviewAcademyJoinRequest(params: {
  reviewerUserId: string;
  membershipId: string;
  decision: 'APPROVE' | 'REJECT';
  permissions?: Partial<AcademyTeacherPermissions>;
  roleTitle?: string;
  rejectionReason?: string;
  assignedCourseIds?: string[];
}): { success: boolean; membership?: AcademyMembership; error?: string } {
  const { reviewerUserId, membershipId, decision, permissions, roleTitle, rejectionReason, assignedCourseIds } = params;
  const state = loadState();

  const membership = (state.memberships || []).find(m => m.id === membershipId);
  if (!membership) {
    return { success: false, error: 'Membership application not found.' };
  }

  const reviewer = state.users.find(u => u.id === reviewerUserId);
  if (!reviewer) {
    return { success: false, error: 'Reviewer account not found.' };
  }

  // Security check: must be the academy owner or platform ADMIN
  const isAcademyOwner = reviewer.id === membership.academyUserId || reviewer.academyProfile?.id === membership.academyId;
  const isPlatformAdmin = reviewer.role === 'ADMIN';
  if (!isAcademyOwner && !isPlatformAdmin) {
    return { success: false, error: 'Unauthorized: Only the designated academy administrator can review faculty applications.' };
  }

  // Prevent self-approval
  if (reviewer.id === membership.teacherId) {
    return { success: false, error: 'Security Violation: Teachers cannot approve their own membership applications.' };
  }

  if (decision === 'APPROVE') {
    membership.status = 'APPROVED';
    membership.reviewedAt = new Date().toISOString();
    membership.reviewerId = reviewer.id;
    if (roleTitle?.trim()) {
      membership.roleTitle = roleTitle.trim();
    }
    membership.permissions = {
      canCreateCourses: true,
      canEditAcademyCourses: true,
      canViewStudents: true,
      canManageAssignments: true,
      canHostLiveSessions: true,
      ...(permissions || {}),
    };
    if (assignedCourseIds) {
      membership.assignedCourseIds = assignedCourseIds;
    }

    // Notify teacher
    state.notifications.unshift({
      id: `notif-app-apr-${Date.now()}`,
      title: 'Academy Application Approved! 🎉',
      message: `Congratulations! Your request to join ${membership.academyName} has been approved as ${membership.roleTitle}.`,
      type: 'INFO',
      isRead: false,
      actionUrl: '/teacher/dashboard',
      createdAt: new Date().toISOString(),
    });

    state.auditLogs.unshift({
      id: `audit-${Date.now()}`,
      actorName: reviewer.name,
      actorRole: reviewer.role,
      action: 'APPROVE_TEACHER_APPLICATION',
      resourceType: 'AcademyMembership',
      resourceId: membership.id,
      details: `Approved ${membership.teacherName} to join ${membership.academyName}.`,
      createdAt: new Date().toISOString(),
    });
  } else {
    membership.status = 'REJECTED';
    membership.reviewedAt = new Date().toISOString();
    membership.reviewerId = reviewer.id;
    membership.rejectionReason = rejectionReason || 'Application could not be approved at this time.';

    // Notify teacher
    state.notifications.unshift({
      id: `notif-app-rej-${Date.now()}`,
      title: 'Academy Application Update',
      message: `Your application to ${membership.academyName} was not accepted: ${membership.rejectionReason}`,
      type: 'INFO',
      isRead: false,
      actionUrl: '/teacher/dashboard',
      createdAt: new Date().toISOString(),
    });

    state.auditLogs.unshift({
      id: `audit-${Date.now()}`,
      actorName: reviewer.name,
      actorRole: reviewer.role,
      action: 'REJECT_TEACHER_APPLICATION',
      resourceType: 'AcademyMembership',
      resourceId: membership.id,
      details: `Declined application of ${membership.teacherName} to join ${membership.academyName}.`,
      createdAt: new Date().toISOString(),
    });
  }

  saveState(state);
  return { success: true, membership };
}

/**
 * Updates an affiliated teacher's permissions inside the academy.
 */
export function updateTeacherPermissions(params: {
  academyUserId: string;
  membershipId: string;
  permissions: Partial<AcademyTeacherPermissions>;
  roleTitle?: string;
  assignedCourseIds?: string[];
}): { success: boolean; membership?: AcademyMembership; error?: string } {
  const { academyUserId, membershipId, permissions, roleTitle, assignedCourseIds } = params;
  const state = loadState();

  const membership = (state.memberships || []).find(m => m.id === membershipId);
  if (!membership) {
    return { success: false, error: 'Membership record not found.' };
  }

  const caller = state.users.find(u => u.id === academyUserId);
  if (!caller || (caller.id !== membership.academyUserId && caller.role !== 'ADMIN')) {
    return { success: false, error: 'Unauthorized: Only the academy administrator can modify faculty permissions.' };
  }

  membership.permissions = {
    ...membership.permissions,
    ...permissions,
  };
  if (roleTitle?.trim()) {
    membership.roleTitle = roleTitle.trim();
  }
  if (assignedCourseIds) {
    membership.assignedCourseIds = assignedCourseIds;
  }

  saveState(state);
  return { success: true, membership };
}

/**
 * Removes an affiliated teacher from an academy.
 * Preserves teacher's user account, profile, and independently owned content!
 */
export function removeTeacherFromAcademy(params: {
  academyUserId: string;
  membershipId: string;
  reason?: string;
}): { success: boolean; error?: string } {
  const { academyUserId, membershipId, reason } = params;
  const state = loadState();

  const membership = (state.memberships || []).find(m => m.id === membershipId);
  if (!membership) {
    return { success: false, error: 'Membership record not found.' };
  }

  const caller = state.users.find(u => u.id === academyUserId);
  if (!caller || (caller.id !== membership.academyUserId && caller.role !== 'ADMIN')) {
    return { success: false, error: 'Unauthorized: Only the academy administrator can remove affiliated teachers.' };
  }

  membership.status = 'CANCELLED';
  membership.leftAt = new Date().toISOString();
  membership.rejectionReason = reason || 'Removed by academy administration.';

  // Notify teacher
  state.notifications.unshift({
    id: `notif-rem-${Date.now()}`,
    title: 'Academy Affiliation Ended',
    message: `You are no longer affiliated with ${membership.academyName}. Your personal teacher account and independent courses remain fully intact.`,
    type: 'INFO',
    isRead: false,
    actionUrl: '/teacher/dashboard',
    createdAt: new Date().toISOString(),
  });

  state.auditLogs.unshift({
    id: `audit-${Date.now()}`,
    actorName: caller.name,
    actorRole: caller.role,
    action: 'REMOVE_TEACHER_FROM_ACADEMY',
    resourceType: 'AcademyMembership',
    resourceId: membership.id,
    details: `Removed ${membership.teacherName} from ${membership.academyName}. Reason: ${reason || 'Admin action'}`,
    createdAt: new Date().toISOString(),
  });

  saveState(state);
  return { success: true };
}

/**
 * Allows a teacher to voluntarily leave an academy.
 * Preserves teacher's user account, profile, and independent courses!
 */
export function leaveAcademy(params: {
  teacherId: string;
  membershipId: string;
  reason?: string;
}): { success: boolean; error?: string } {
  const { teacherId, membershipId, reason } = params;
  const state = loadState();

  const membership = (state.memberships || []).find(m => m.id === membershipId);
  if (!membership) {
    return { success: false, error: 'Membership record not found.' };
  }

  if (membership.teacherId !== teacherId) {
    return { success: false, error: 'Unauthorized: You can only cancel your own academy membership.' };
  }

  membership.status = 'CANCELLED';
  membership.leftAt = new Date().toISOString();
  membership.rejectionReason = reason || 'Teacher resigned membership voluntarily.';

  // Notify academy
  state.notifications.unshift({
    id: `notif-left-${Date.now()}`,
    title: 'Faculty Member Left Academy',
    message: `${membership.teacherName} has left ${membership.academyName}.`,
    type: 'INFO',
    isRead: false,
    actionUrl: '/academy/dashboard',
    createdAt: new Date().toISOString(),
  });

  saveState(state);
  return { success: true };
}

/**
 * Updates a teacher's preferred working mode (Independent vs Academy Affiliated).
 */
export function setTeacherWorkingMode(
  teacherId: string, 
  mode: TeacherWorkingMode
): { success: boolean; error?: string } {
  const state = loadState();
  const user = state.users.find(u => u.id === teacherId);
  if (!user || !user.teacherProfile) {
    return { success: false, error: 'Teacher profile not found.' };
  }

  user.teacherProfile.preferredWorkingMode = mode;
  saveState(state);
  return { success: true };
}

/**
 * Validates course permissions & ownership:
 * - Independent courses belong strictly to their teacher.
 * - Academy-owned courses belong to the academy and can only be modified by authorized faculty or academy admin.
 */
export function canTeacherManageCourse(
  userId: string,
  courseId: string,
  state?: AppState
): {
  canEdit: boolean;
  canDelete: boolean;
  isOwner: boolean;
  isAcademyAdmin: boolean;
  isAffiliatedInstructor: boolean;
  reason?: string;
} {
  const s = state || loadState();
  const user = s.users.find(u => u.id === userId);
  const course = s.courses.find(c => c.id === courseId);

  if (!user || !course) {
    return {
      canEdit: false,
      canDelete: false,
      isOwner: false,
      isAcademyAdmin: false,
      isAffiliatedInstructor: false,
      reason: 'User or course not found.'
    };
  }

  // Platform admin can do anything
  if (user.role === 'ADMIN') {
    return {
      canEdit: true,
      canDelete: true,
      isOwner: true,
      isAcademyAdmin: true,
      isAffiliatedInstructor: true,
    };
  }

  // 1. Independent Course
  if (!course.isAcademyOwned) {
    if (course.teacherId === user.id) {
      return {
        canEdit: true,
        canDelete: true,
        isOwner: true,
        isAcademyAdmin: false,
        isAffiliatedInstructor: false,
      };
    }
    return {
      canEdit: false,
      canDelete: false,
      isOwner: false,
      isAcademyAdmin: false,
      isAffiliatedInstructor: false,
      reason: 'This course is independently owned by another educator.'
    };
  }

  // 2. Academy-Owned Course
  const isAcademyAdmin = course.organizationId === user.id ||
    (user.academyProfile && (course.organizationId === user.academyProfile.id || course.academyId === user.academyProfile.id));

  if (isAcademyAdmin) {
    return {
      canEdit: true,
      canDelete: true,
      isOwner: false,
      isAcademyAdmin: true,
      isAffiliatedInstructor: false,
    };
  }

  // Check if caller is an approved faculty member in this academy with edit permission
  const membership = (s.memberships || []).find(
    m => m.teacherId === user.id &&
         (m.academyUserId === course.organizationId || m.academyId === course.organizationId) &&
         m.status === 'APPROVED'
  );

  if (membership) {
    const hasEditPermission = membership.permissions.canEditAcademyCourses;
    const isAssigned = (membership.assignedCourseIds || []).includes(course.id) || course.teacherId === user.id;

    if (hasEditPermission && isAssigned) {
      return {
        canEdit: true,
        canDelete: false, // Affiliated teachers cannot delete academy courses!
        isOwner: false,
        isAcademyAdmin: false,
        isAffiliatedInstructor: true,
      };
    }

    return {
      canEdit: false,
      canDelete: false,
      isOwner: false,
      isAcademyAdmin: false,
      isAffiliatedInstructor: true,
      reason: 'You do not have permission from the academy administrator to edit this course.'
    };
  }

  return {
    canEdit: false,
    canDelete: false,
    isOwner: false,
    isAcademyAdmin: false,
    isAffiliatedInstructor: false,
    reason: 'This course belongs to an academy you are not affiliated with.'
  };
}

/**
 * Deletes a course after validating strict ownership & authorization.
 */
export function deleteCourse(userId: string, courseId: string): { success: boolean; error?: string } {
  const state = loadState();
  const perm = canTeacherManageCourse(userId, courseId, state);

  if (!perm.canDelete) {
    return {
      success: false,
      error: perm.reason || 'You are not authorized to delete this course.'
    };
  }

  const idx = state.courses.findIndex(c => c.id === courseId);
  if (idx === -1) {
    return { success: false, error: 'Course not found.' };
  }

  const deletedCourse = state.courses[idx];
  state.courses.splice(idx, 1);

  state.auditLogs.unshift({
    id: `audit-${Date.now()}`,
    actorName: (state.users.find(u => u.id === userId)?.name) || 'User',
    actorRole: (state.users.find(u => u.id === userId)?.role) || 'TEACHER',
    action: 'DELETE_COURSE',
    resourceType: 'Course',
    resourceId: courseId,
    details: `Deleted course "${deletedCourse.title}".`,
    createdAt: new Date().toISOString(),
  });

  saveState(state);
  return { success: true };
}

/**
 * Updates academy profile details (branding, departments, opportunities, campus, accreditation).
 */
export function updateAcademyProfile(
  academyUserId: string,
  updates: Partial<NonNullable<User['academyProfile']>>
): { success: boolean; error?: string } {
  const state = loadState();
  const academy = state.users.find(u => u.id === academyUserId);

  if (!academy || !academy.academyProfile) {
    return { success: false, error: 'Academy profile not found.' };
  }

  academy.academyProfile = {
    ...academy.academyProfile,
    ...updates,
  };
  academy.updatedAt = new Date().toISOString();

  saveState(state);
  return { success: true };
}

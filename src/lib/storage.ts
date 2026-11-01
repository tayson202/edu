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
  AssignmentSubmission
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
  initialNotifications
} from './seed-data';
import {
  hashPassword,
  verifyPassword,
  generateSalt,
  validatePasswordStrength,
  isValidEmail
} from './crypto-auth';

const STORAGE_KEY = 'ulearn_state_v1';
const CURRENT_USER_KEY = 'ulearn_current_user_id';

export interface AppState {
  users: User[];
  currentUserId: string;
  isAuthenticated: boolean;
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
}

function getInitialState(): AppState {
  return {
    users: initialUsers,
    currentUserId: 'usr-student', // default to student for interactive exploration
    isAuthenticated: true,
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
  };
}

export function loadState(): AppState {
  if (typeof window === 'undefined') {
    return getInitialState();
  }

  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      const state = getInitialState();
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
      return state;
    }
    const parsed = JSON.parse(raw);
    const combinedState: AppState = { ...getInitialState(), ...parsed };

    // Ensure new initial seed users (MEMBER, SELLER, COACH, BRAND) are always available
    const existingIds = new Set(combinedState.users.map(u => u.id));
    for (const initUser of initialUsers) {
      if (!existingIds.has(initUser.id)) {
        combinedState.users.push(initUser);
      }
    }

    // Check session expiration if sessionExpiry exists
    if (combinedState.sessionExpiry && Date.now() > combinedState.sessionExpiry) {
      combinedState.isAuthenticated = false;
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
  const user = state.users.find(u => u.id === state.currentUserId);
  return user || state.users[0];
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
  
  // Seller, Coach, and Brand accounts start with PENDING_APPROVAL for business features
  const isBusinessRole = role === 'SELLER' || role === 'COACH' || role === 'BRAND';
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
    headline: `${role.charAt(0).toUpperCase() + role.slice(1).toLowerCase()} Member at ULearn`,
    bio: `Active ${role.toLowerCase()} account created on ${new Date().toLocaleDateString()}.`,
    isEmailVerified: true,
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  if (role === 'MEMBER') {
    newUser.memberProfile = {
      id: `mp-${Date.now()}`,
      userId: newUser.id,
      interests: ['General Learning'],
      learningGoals: ['Explore marketplace programs & products'],
      ordersCount: 0,
      enrolledProgramsCount: 0,
    };
  } else if (role === 'SELLER') {
    newUser.sellerProfile = {
      id: `slp-${Date.now()}`,
      userId: newUser.id,
      storeName: `${name.trim()}'s Digital Studio`,
      payoutEmail: email.trim().toLowerCase(),
      totalProducts: 0,
      totalSalesCents: 0,
      averageRating: 5.0,
      verificationStatus: 'PENDING',
    };
  } else if (role === 'COACH') {
    newUser.coachProfile = {
      id: `cp-${Date.now()}`,
      userId: newUser.id,
      specialty: 'Professional Coaching & Mentorship',
      hourlyRateCents: 15000,
      totalClients: 0,
      totalSessionsCompleted: 0,
      verificationStatus: 'PENDING',
    };
  } else if (role === 'BRAND') {
    newUser.brandProfile = {
      id: `bp-${Date.now()}`,
      userId: newUser.id,
      brandName: `${name.trim()} Brand Solutions`,
      legalEntityName: `${name.trim()} LLC`,
      industry: 'Enterprise Technology & Education',
      officialWebsite: 'https://ulearn.com',
      productLinesCount: 0,
      partnershipTier: 'STANDARD',
      verificationStatus: 'PENDING',
    };
  }

  state.users.push(newUser);
  state.currentUserId = newUser.id;
  state.isAuthenticated = true;
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
  state.sessionExpiry = Date.now() + (24 * 60 * 60 * 1000);
  saveState(state);
  return { success: true, user };
}

export function logoutUser(): void {
  const state = loadState();
  state.isAuthenticated = false;
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
    case 'MEMBER':
    case 'STUDENT':
      return '/dashboard/member';
    case 'SELLER':
    case 'TEACHER':
      return '/dashboard/seller';
    case 'COACH':
      return '/dashboard/coach';
    case 'BRAND':
    case 'ACADEMY_ADMIN':
      return '/dashboard/brand';
    case 'ADMIN':
      return '/admin/dashboard';
    default:
      return '/dashboard/member';
  }
}

/**
 * Validates whether a user's role grants access to a specific dashboard
 */
export function canAccessDashboard(userRole: UserRole, targetDashboard: 'MEMBER' | 'SELLER' | 'COACH' | 'BRAND' | 'ADMIN'): boolean {
  if (userRole === 'ADMIN') return true; // Platform Administrator can inspect all dashboards
  
  if (targetDashboard === 'MEMBER') {
    return userRole === 'MEMBER' || userRole === 'STUDENT';
  }
  if (targetDashboard === 'SELLER') {
    return userRole === 'SELLER' || userRole === 'TEACHER';
  }
  if (targetDashboard === 'COACH') {
    return userRole === 'COACH';
  }
  if (targetDashboard === 'BRAND') {
    return userRole === 'BRAND' || userRole === 'ACADEMY_ADMIN';
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

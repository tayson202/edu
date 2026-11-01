// Shared TypeScript Type Definitions for ULearn Marketplace

export type UserRole = 
  | 'MEMBER' 
  | 'SELLER' 
  | 'COACH' 
  | 'BRAND' 
  // Legacy aliases for backward compatibility
  | 'STUDENT' 
  | 'TEACHER' 
  | 'ACADEMY_ADMIN' 
  | 'ADMIN';

export type AccountStatus = 'ACTIVE' | 'PENDING_APPROVAL' | 'SUSPENDED';
export type VerificationStatus = 'PENDING' | 'VERIFIED' | 'REJECTED';
export type CourseStatus = 'DRAFT' | 'PENDING_REVIEW' | 'PUBLISHED' | 'ARCHIVED';
export type CourseLevel = 'ALL_LEVELS' | 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED';
export type LessonType = 'VIDEO' | 'TEXT' | 'DOCUMENT' | 'QUIZ';
export type OrderStatus = 'PENDING' | 'COMPLETED' | 'FAILED' | 'REFUNDED';
export type PayoutStatus = 'REQUESTED' | 'PROCESSING' | 'PAID' | 'REJECTED';

export interface MemberProfile {
  id: string;
  userId: string;
  interests: string[];
  learningGoals: string[];
  ordersCount: number;
  enrolledProgramsCount: number;
}

export interface SellerProfile {
  id: string;
  userId: string;
  storeName: string;
  payoutEmail: string;
  totalProducts: number;
  totalSalesCents: number;
  averageRating: number;
  verificationStatus: VerificationStatus;
}

export interface CoachProfile {
  id: string;
  userId: string;
  specialty: string;
  hourlyRateCents: number;
  bookingUrl?: string;
  totalClients: number;
  totalSessionsCompleted: number;
  verificationStatus: VerificationStatus;
}

export interface BrandProfile {
  id: string;
  userId: string;
  brandName: string;
  legalEntityName: string;
  industry: string;
  officialWebsite: string;
  productLinesCount: number;
  partnershipTier: 'STANDARD' | 'PREMIUM' | 'ENTERPRISE';
  verificationStatus: VerificationStatus;
}

export interface AcademyProfile {
  id: string;
  userId: string;
  academyName: string;
  headline: string;
  bio: string;
  accreditation: string;
  campusLocation: string;
  websiteUrl: string;
  contactEmail: string;
  establishedYear: number;
  totalStudents: number;
  verificationStatus: VerificationStatus;
}

export interface AdminProfile {
  id: string;
  userId: string;
  department: string;
  securityClearance: 'LEVEL_1' | 'LEVEL_2' | 'LEVEL_3' | 'ROOT_SYSTEM_ADMIN';
  emergencyContact: string;
  auditSignerKey: string;
  autoApprovePayoutsUnderCents: number;
  twoFactorEnabled: boolean;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  status?: AccountStatus;
  passwordHash?: string;
  salt?: string;
  avatarUrl: string;
  headline?: string;
  bio?: string;
  phone?: string;
  location?: string;
  websiteUrl?: string;
  isEmailVerified: boolean;
  isActive: boolean;
  createdAt: string;
  updatedAt?: string;
  memberProfile?: MemberProfile;
  sellerProfile?: SellerProfile;
  coachProfile?: CoachProfile;
  brandProfile?: BrandProfile;
  studentProfile?: StudentProfile;
  teacherProfile?: TeacherProfile;
  academyProfile?: AcademyProfile;
  adminProfile?: AdminProfile;
}

export interface TeacherProfile {
  id: string;
  userId: string;
  user: User;
  headline: string;
  bio: string;
  expertise: string[];
  experienceYears: number;
  websiteUrl?: string;
  linkedinUrl?: string;
  verificationStatus: VerificationStatus;
  verificationNotes?: string;
  totalEarningsCents: number;
  pendingBalanceCents: number;
  payoutConfig?: {
    method: 'BANK_TRANSFER' | 'PAYPAL' | 'STRIPE_CONNECT';
    accountDetails: string;
  };
}

export interface StudentProfile {
  id: string;
  userId: string;
  headline?: string;
  bio?: string;
  interests: string[];
  learningPoints: number;
  streakDays: number;
  lastLearnedAt?: string;
  badges: string[];
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  icon: string;
  description: string;
  courseCount?: number;
}

export interface LessonAttachment {
  id: string;
  name: string;
  fileUrl: string;
  fileSizeMb: number;
  fileType: string;
}

export interface Lesson {
  id: string;
  sectionId: string;
  title: string;
  type: LessonType;
  durationSecs: number;
  videoUrl?: string;
  textContent?: string;
  isFreePreview: boolean;
  orderIndex: number;
  attachments?: LessonAttachment[];
}

export interface CourseSection {
  id: string;
  courseId: string;
  title: string;
  orderIndex: number;
  lessons: Lesson[];
}

export interface QuizOption {
  id: string;
  text: string;
  isCorrect: boolean;
}

export interface QuizQuestion {
  id: string;
  prompt: string;
  explanation: string;
  orderIndex: number;
  options: QuizOption[];
}

export interface Quiz {
  id: string;
  courseId: string;
  title: string;
  description: string;
  passingScore: number;
  timeLimitMins: number;
  questions: QuizQuestion[];
}

export interface QuizAnswer {
  id: string;
  attemptId: string;
  questionId: string;
  question: QuizQuestion;
  optionId: string;
  option: QuizOption;
}

export interface QuizAttempt {
  id: string;
  quizId: string;
  userId: string;
  score: number;
  isPassed: boolean;
  passed?: boolean;
  completedAt: string;
  answers?: QuizAnswer[];
}

export interface Assignment {
  id: string;
  courseId: string;
  title: string;
  instructions: string;
  dueDate?: string;
  maxPoints: number;
}

export interface AssignmentSubmission {
  id: string;
  assignmentId: string;
  userId: string;
  userName: string;
  content: string;
  fileUrl?: string;
  score?: number;
  feedback?: string;
  submittedAt: string;
  gradedAt?: string;
}

export interface Course {
  id: string;
  teacherId: string;
  teacher: {
    id: string;
    name: string;
    headline: string;
    avatarUrl: string;
    ratingAvg: number;
    studentCount: number;
    verificationStatus: VerificationStatus;
  };
  organizationId?: string;
  organizationName?: string;
  categoryId: string;
  categoryName: string;
  title: string;
  slug: string;
  subtitle: string;
  description: string;
  thumbnailUrl: string;
  previewVideoUrl?: string;
  level: CourseLevel;
  language: string;
  priceCents: number;
  discountPriceCents?: number;
  isFree: boolean;
  status: CourseStatus;
  prerequisites: string[];
  learningObjectives: string[];
  totalDurationSecs: number;
  ratingAvg: number;
  ratingCount: number;
  studentCount: number;
  publishedAt?: string;
  sections: CourseSection[];
  quizzes?: Quiz[];
  assignments?: Assignment[];
}

export interface LessonProgress {
  lessonId: string;
  isCompleted: boolean;
  watchedSecs: number;
  lastPosition: number;
  updatedAt: string;
}

export interface CourseEnrollment {
  id: string;
  userId: string;
  courseId: string;
  course: Course;
  enrolledAt: string;
  completedAt?: string;
  progressPercent: number;
  certificateIssued: boolean;
  lessonProgress: Record<string, LessonProgress>;
}

export interface LiveSession {
  id: string;
  teacherId: string;
  teacherName: string;
  title: string;
  description: string;
  scheduledAt: string;
  durationMins: number;
  maxCapacity: number;
  bookedCount: number;
  priceCents: number;
  meetingUrl?: string;
  status: 'SCHEDULED' | 'LIVE' | 'COMPLETED' | 'CANCELLED';
}

export interface LiveBooking {
  id: string;
  sessionId: string;
  session: LiveSession;
  userId: string;
  amountPaid: number;
  status: 'CONFIRMED' | 'ATTENDED' | 'CANCELLED';
  bookedAt: string;
}

export interface OrderItem {
  id: string;
  courseId: string;
  courseTitle: string;
  priceCents: number;
  commissionPercent: number;
  platformFeeCents: number;
  teacherShareCents: number;
}

export interface Order {
  id: string;
  orderNumber: string;
  userId: string;
  userName: string;
  totalAmountCents: number;
  discountCents: number;
  status: OrderStatus;
  paymentProvider: 'SANDBOX' | 'STRIPE' | 'PAYPAL';
  providerTxId: string;
  createdAt: string;
  items: OrderItem[];
}

export interface TransactionLedger {
  id: string;
  orderId: string;
  orderNumber: string;
  buyerName: string;
  courseTitle: string;
  grossAmountCents: number;
  platformFeeCents: number;
  teacherShareCents: number;
  commissionPercent: number;
  teacherId: string;
  status: 'SETTLED' | 'REFUNDED';
  createdAt: string;
}

export interface TeacherPayout {
  id: string;
  teacherId: string;
  teacherName: string;
  amountCents: number;
  status: PayoutStatus;
  method: string;
  referenceCode?: string;
  notes?: string;
  requestedAt: string;
  processedAt?: string;
}

export interface Certificate {
  id: string;
  certificateNo: string;
  userId: string;
  recipientName: string;
  courseId: string;
  courseTitle: string;
  instructorName: string;
  issueDate: string;
  verifyUrl: string;
}

export interface Review {
  id: string;
  courseId: string;
  userId: string;
  userName: string;
  userAvatar: string;
  rating: number;
  comment: string;
  createdAt: string;
}

export interface PlatformSetting {
  platformName: string;
  commissionPercent: number;
  minPayoutCents: number;
  refundWindowDays: number;
  aiFreeQuotaPerMonth: number;
  allowNewRegistrations: boolean;
}

export interface AuditLog {
  id: string;
  actorName: string;
  actorRole: UserRole;
  action: string;
  resourceType: string;
  resourceId: string;
  details: string;
  createdAt: string;
}

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  type: 'INFO' | 'ENROLLMENT' | 'EARNING' | 'LIVE_REMINDER' | 'SYSTEM';
  isRead: boolean;
  actionUrl?: string;
  createdAt: string;
}

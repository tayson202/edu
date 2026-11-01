# ULearn — Modern Educational Marketplace & AI Learning Platform

[![Next.js](https://img.shields.io/badge/Next.js-14-black?style=flat&logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?style=flat&logo=typescript)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/TailwindCSS-3.4-38B2AC?style=flat&logo=tailwind-css)](https://tailwindcss.com/)
[![Prisma ORM](https://img.shields.io/badge/Prisma-Relational_ORM-2D3748?style=flat&logo=prisma)](https://www.prisma.io/)
[![Status](https://img.shields.io/badge/Status-Phase_1_MVP_Complete-emerald)](https://github.com/tayson202/UL)

**ULearn** is an all-in-one, commercially viable educational marketplace connecting independent teachers, students, and accredited academies. It enables anyone to create courses, author modular curriculum, sell educational content, host live classes, and withdraw net earnings through a transparent, double-entry financial ledger.

Students can discover courses, stream video lessons with progress resumption, take auto-graded interactive assessments, submit capstone assignments, claim verifiable digital certificates, and receive grounded answers from an **AI Personal Tutor** with lesson citations.

---

## 🌟 Key Architecture & Capabilities

### 1. Multi-Role RBAC System
- **Student Persona**: Personalized dashboard, course discovery, video streaming, interactive quizzes, certificate repository, gamification streaks and learning points.
- **Teacher / Creator Studio**: Course authoring, section & lesson builder, dynamic pricing & discount configuration, sales analytics, transparent ledger, payout claims, and AI teaching tools.
- **Academy / Organization Portal**: Multi-instructor faculty roster, syndicated bootcamps and cohort management, enterprise seat licensing, and institutional reports.
- **Platform Administrator Console**: Platform KPI metrics, dynamic marketplace commission rate configurator, instructor KYC verification queue, payout approval workflows, and immutable audit logs.
- **Interactive Persona Switcher**: Seamlessly switch between active roles directly from the top navigation bar to test all user journeys.

### 2. Commercial Financial Ledger & Payout System
- **Configurable Platform Commission**: Dynamically controlled by platform administrators (default: 15% platform share, 85% creator net earnings).
- **Double-Entry Transaction Ledger**: Every purchase creates an immutable record tracking gross sale, platform infrastructure fee, and teacher net share.
- **Escrow & Payout Approvals**: Teachers can submit withdrawal claims once their balance exceeds the minimum threshold ($50.00), reviewed and disbursed via ACH, PayPal, or Stripe Connect.

### 3. Interactive LMS Student Portal
- **Video Player**: Resumes from last saved timestamp, debounces progress tracking, and automatically records lesson completion.
- **Assessment Engine**: Timed quizzes with multiple-choice questions, explanation rationales, passing score thresholds, and instant auto-grading.
- **Capstone Assignments**: Submit code repositories or written solutions with teacher grading and feedback loops.
- **Verifiable Certificates**: Issued automatically upon 100% curriculum completion, featuring official serial numbers and cryptographic verification stamps.

### 4. AI-Powered Learning Assistant Suite
- **Grounded AI Personal Tutor**: In-player conversational assistant answering student questions strictly grounded in course transcripts with direct lesson & timestamp citations.
- **AI Course Generator**: Synthesizes course titles, subtitles, learning objectives, and modular section syllabi with 1 click.
- **AI Quiz Generator**: Generates balanced question banks, distractors, and pedagogical rationales based on lesson transcripts.
- **AI Study Assistant**: Produces revision summaries and personalized multi-day study schedules.

---

## 📁 Project Architecture & Folder Layout

```
ulearn-marketplace/
├── prisma/
│   └── schema.prisma             # Fully normalized relational schema with constraints & indexes
├── public/                       # Static media, icons, and branding
├── src/
│   ├── app/                      # Next.js App Router
│   │   ├── (auth)/               # Authentication & account creation
│   │   ├── courses/              # Marketplace catalog with faceted search & filtering
│   │   │   └── [id]/             # Course detail, curriculum accordion, and sandbox checkout modal
│   │   ├── learn/
│   │   │   └── [courseId]/       # LMS Student Portal with video player, quizzes, & AI tutor
│   │   ├── my-learning/          # Student dashboard, learning streak, live sessions, & certificates
│   │   ├── teacher/
│   │   │   ├── dashboard/        # Creator studio with sales metrics & course management
│   │   │   ├── builder/          # Drag-and-drop course builder & AI syllabus generator
│   │   │   └── earnings/         # Double-entry ledger, gross/net breakdown, & payout claims
│   │   ├── academy/
│   │   │   └── dashboard/        # Organization console with multi-instructor faculty roster
│   │   ├── admin/
│   │   │   └── dashboard/        # Platform governance, dynamic commissions, & payout approvals
│   │   ├── live/                 # Live interactive masterclasses schedule & seat booking
│   │   ├── certificates/         # Official verified completion credential viewer & print PDF
│   │   ├── pricing/              # Commercial tiers for teachers, students, & institutions
│   │   ├── globals.css           # Modern design tokens, glassmorphism, & typography
│   │   ├── layout.tsx            # Root layout with responsive Navbar and Footer
│   │   └── page.tsx              # Marketplace homepage with live search & featured courses
│   ├── components/               # Reusable Component Design System
│   │   ├── layout/               # Navbar (role switcher, search, notifications) & Footer
│   │   ├── marketplace/          # CourseCard with ratings, price, duration, & preview trigger
│   │   └── ai/                   # AITutorDrawer (grounded citations) & AICourseGeneratorModal
│   ├── lib/                      # Core business logic & storage
│   │   ├── types.ts              # Complete TypeScript interfaces for all domain entities
│   │   ├── seed-data.ts          # Realistic seed data (courses, instructors, ledger, quizzes)
│   │   ├── storage.ts            # Reactive state management, persistence, & simulated actions
│   │   └── ai-service.ts         # Generative AI adapters with grounded citation pipelines
│   └── types/                    # Shared DTO definitions
├── .env.example                  # Environment template with sandbox defaults
├── package.json                  # Dependencies & scripts
├── tailwind.config.js            # Curated color tokens, dark mode, & shadows
└── tsconfig.json                 # Strict TypeScript configuration
```

---

## 🗄️ Relational Database Model (Prisma)

The database schema (`prisma/schema.prisma`) includes fully normalized entities:

- **Users & Roles**: `User`, `TeacherProfile`, `StudentProfile`, `Organization`, `OrganizationMember`
- **Curriculum**: `Category`, `Course`, `CourseSection`, `Lesson`, `LessonAttachment`
- **Learning & Progress**: `CourseEnrollment`, `LessonProgress`, `Certificate`
- **Assessments**: `Quiz`, `QuizQuestion`, `QuizOption`, `QuizAttempt`, `QuizAttemptAnswer`, `Assignment`, `AssignmentSubmission`
- **Live Tutoring**: `LiveSession`, `LiveBooking`
- **Monetization & Accounting**: `Order`, `OrderItem`, `TransactionLedger`, `TeacherPayout`, `Coupon`, `PlatformSetting`
- **Trust & Governance**: `Review`, `AuditLog`, `Notification`, `AIUsageRecord`

---

## 🚀 Getting Started

### Prerequisites
- [Node.js](https://nodejs.org/) (v18 or higher recommended)
- Git

### 1. Clone & Setup
```bash
git clone https://github.com/tayson202/UL.git
cd UL
npm install
```

### 2. Configure Environment Variables
Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```

### 3. Run Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser to experience the platform.

---

## 🧪 Testing the User Flows (Walkthrough)

1. **Role Switcher**: Click the **Role:** pill in the top navigation bar to toggle between:
   - **Student (Alex Morgan)**: Browse courses, resume enrolled lessons, take quizzes, and earn certificates.
   - **Teacher (Dr. Sarah Chen)**: Access Teacher Studio, review gross sales vs 85% net earnings, request payouts, and use the AI Course Generator.
   - **Academy (Apex Academy)**: Inspect multi-instructor faculty rosters and syndicated cohort programs.
   - **Admin (Elena Vance)**: Reconfigure the platform commission rate (15%), approve teacher payout claims, and review audit logs.
2. **Interactive LMS**: Navigate to `/learn/course-nextjs-ai` to test video playback, check off completed lessons, run the auto-graded assessment quiz, and open the Grounded AI Tutor.
3. **Course Builder**: Navigate to `/teacher/builder` to create sections and lessons, or click **Generate with AI** to synthesize an entire syllabus with 1 click.
4. **Sandbox Checkout**: Browse `/courses`, select a course, and click **Enroll Now** to verify the real-time financial ledger fee allocation.

---

## 📄 License
This project is licensed under the MIT License.

# EduFlow (EduSphere) — System Architecture, Database Schema & Implementation Plan

## 1. Executive Summary & Vision
**EduFlow** is a modular, multi-tenant educational marketplace and learning operating system connecting independent educators, students, academies, and corporate organizations. It combines a dynamic course marketplace, rich interactive LMS, live cohort classes, marketplace financial ledger with teacher payouts, and native AI pedagogical assistants.

---

## 2. Technical Stack & Architecture

### Core Stack
- **Frontend**: Next.js 14 (App Router), TypeScript, Tailwind CSS, Lucide Icons, Shadcn-inspired tokenized UI primitives.
- **Backend**: NestJS (Modular Architecture, TypeORM / Prisma, class-validator, Passport JWT + RBAC guards).
- **Database**: PostgreSQL with normalized relational tables, transactional ledger, JSONB support for dynamic quiz metadata & AI configs.
- **Video & Storage**: S3-compatible cloud storage (signed URLs for course assets), HLS video streaming adapter (Mux / Cloudflare Stream).
- **AI Engine**: OpenAI / Gemini API service adapter with system prompt grounding, token quota tracking, and lesson vector embeddings.
- **Payments & Ledger**: Stripe Connect marketplace model (platform fee deduction, automated/manual teacher payouts, ledger immutability).

---

## 3. Database Schema & Relational Blueprint

```sql
-- Core Identity & RBAC
CREATE TYPE user_role AS ENUM ('STUDENT', 'TEACHER', 'ORG_ADMIN', 'PLATFORM_ADMIN');
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role user_role DEFAULT 'STUDENT',
    avatar_url TEXT,
    full_name VARCHAR(120) NOT NULL,
    bio TEXT,
    headline VARCHAR(255),
    is_verified BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Teacher & Academy Profiles
CREATE TABLE teacher_profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE UNIQUE,
    expertise_tags TEXT[],
    total_students INT DEFAULT 0,
    average_rating NUMERIC(3,2) DEFAULT 0.00,
    stripe_account_id VARCHAR(100),
    payout_enabled BOOLEAN DEFAULT FALSE,
    custom_commission_rate NUMERIC(4,2) DEFAULT 15.00
);

-- Course Catalog & Hierarchies
CREATE TYPE course_level AS ENUM ('BEGINNER', 'INTERMEDIATE', 'ADVANCED', 'ALL_LEVELS');
CREATE TYPE publish_status AS ENUM ('DRAFT', 'PENDING_REVIEW', 'PUBLISHED', 'ARCHIVED');

CREATE TABLE courses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    teacher_id UUID REFERENCES users(id) ON DELETE RESTRICT,
    title VARCHAR(255) NOT NULL,
    slug VARCHAR(255) UNIQUE NOT NULL,
    subtitle TEXT,
    description TEXT,
    thumbnail_url TEXT,
    promo_video_url TEXT,
    price NUMERIC(10,2) DEFAULT 0.00,
    discount_price NUMERIC(10,2),
    level course_level DEFAULT 'ALL_LEVELS',
    category VARCHAR(80) NOT NULL,
    status publish_status DEFAULT 'DRAFT',
    total_duration_minutes INT DEFAULT 0,
    is_featured BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE course_sections (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    course_id UUID REFERENCES courses(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    sort_order INT NOT NULL DEFAULT 1
);

CREATE TABLE lessons (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    section_id UUID REFERENCES course_sections(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    lesson_type VARCHAR(20) DEFAULT 'VIDEO', -- 'VIDEO', 'DOCUMENT', 'QUIZ'
    content_url TEXT,
    duration_seconds INT DEFAULT 0,
    is_preview_free BOOLEAN DEFAULT FALSE,
    sort_order INT NOT NULL DEFAULT 1
);

-- Enrollments & Progress
CREATE TABLE enrollments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    course_id UUID REFERENCES courses(id) ON DELETE RESTRICT,
    progress_percentage NUMERIC(5,2) DEFAULT 0.00,
    completed_at TIMESTAMP WITH TIME ZONE,
    enrolled_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    certificate_id UUID,
    UNIQUE(user_id, course_id)
);

CREATE TABLE lesson_progress (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    enrollment_id UUID REFERENCES enrollments(id) ON DELETE CASCADE,
    lesson_id UUID REFERENCES lessons(id) ON DELETE CASCADE,
    is_completed BOOLEAN DEFAULT FALSE,
    last_position_seconds INT DEFAULT 0,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(enrollment_id, lesson_id)
);

-- Marketplace Financial Ledger
CREATE TABLE transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    buyer_id UUID REFERENCES users(id),
    course_id UUID REFERENCES courses(id),
    gross_amount NUMERIC(10,2) NOT NULL,
    platform_fee NUMERIC(10,2) NOT NULL,
    teacher_net NUMERIC(10,2) NOT NULL,
    payment_status VARCHAR(50) DEFAULT 'COMPLETED', -- 'PENDING', 'COMPLETED', 'REFUNDED'
    stripe_payment_intent_id VARCHAR(120),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- AI Quotas & Interactive Assistant
CREATE TABLE ai_usage_ledger (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id),
    feature_type VARCHAR(50) NOT NULL, -- 'COURSE_BUILDER', 'STUDENT_TUTOR', 'QUIZ_GEN'
    tokens_used INT DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

---

## 4. Production Folder Architecture (Full-Stack Next.js + NestJS)

```text
eduflow-platform/
├── apps/
│   ├── web/                         # Next.js 14 App Router
│   │   ├── src/
│   │   │   ├── app/
│   │   │   │   ├── (auth)/          # /login, /register, /forgot-password
│   │   │   │   ├── (marketplace)/   # /courses, /courses/[slug], /teachers/[id]
│   │   │   │   ├── (student)/       # /learn/[courseId], /dashboard, /certificates
│   │   │   │   ├── (teacher)/       # /teacher/courses/new, /teacher/analytics
│   │   │   │   └── (admin)/         # /admin/moderation, /admin/finance
│   │   │   ├── components/
│   │   │   │   ├── ui/              # Button, Card, Dialog, Badge, Tabs, Progress
│   │   │   │   ├── marketplace/     # CourseCard, FilterDrawer, TeacherBanner
│   │   │   │   ├── lms/             # VideoPlayer, CurriculumTree, AiTutorPanel
│   │   │   │   └── teacher/         # CourseBuilder, RevenueLedgerTable
│   │   │   └── lib/                 # api-client, hooks, auth, state
│   │
│   └── api/                         # NestJS Backend API
│       ├── src/
│       │   ├── modules/
│       │   │   ├── auth/            # JWT, Role Guard, Passport
│       │   │   ├── courses/         # CRUD, Sections, Curricula, Review
│       │   │   ├── lms/             # Progress tracking, Video streaming tickets
│       │   │   ├── payments/        # Webhooks, Stripe Connect, Ledger service
│       │   │   ├── ai/              # Prompt pipelines, Tutor RAG grounding
│       │   │   └── admin/           # Moderation, Commission config, Payouts
│       │   └── common/              # Filters, Interceptors, Guards
```

---

## 5. Phased Rollout Plan

- **Phase 1 (MVP - Interactive Deliverables)**:
  1. **Course Marketplace & Discovery**: Mobile-optimized browsing, search, multi-faceted filtering, course preview and instant checkout flow.
  2. **Active Learning Portal & Video LMS**: Interactive lesson viewer with video player, lesson completion tracker, course syllabus, and integrated AI Tutor Assistant drawer.
  3. **Teacher Studio & Course Creator**: Complete course creation pipeline, drag-and-drop syllabus organizer, pricing & discount controls, and live earnings ledger.
  4. **Admin Oversight & Financial Controls**: Platform commission configuration, instructor verification queue, and real-time revenue analytics.
- **Phase 2 (Growth)**: Live 1-on-1 cohort bookings via WebRTC/Zoom, automated AI quiz generator, teacher coupon engine.
- **Phase 3 (Enterprise Scale)**: Multi-instructor academies, SSO for university campuses, corporate learning analytics.

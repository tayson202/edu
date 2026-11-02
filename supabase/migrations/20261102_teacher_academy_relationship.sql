-- ==============================================================
-- SUPABASE POSTGRESQL MIGRATION: TEACHER-ACADEMY RELATIONSHIP & RLS
-- Project: ULearn Marketplace
-- Enhances: Independent Teacher & Academy Flexible Relational Schema
-- ==============================================================

-- 1. Create Enums for Membership and Working Modes
-- Safely add 'TEACHER' and 'ACADEMY' to user_role enum if not already present
ALTER TYPE user_role ADD VALUE IF NOT EXISTS 'TEACHER';
ALTER TYPE user_role ADD VALUE IF NOT EXISTS 'ACADEMY';

DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'membership_status') THEN
    CREATE TYPE membership_status AS ENUM ('PENDING', 'APPROVED', 'REJECTED', 'CANCELLED');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'teacher_working_mode') THEN
    CREATE TYPE teacher_working_mode AS ENUM ('INDEPENDENT', 'ACADEMY_AFFILIATED');
  END IF;
END $$;

-- 2. Add working mode to teacher profile
ALTER TABLE public.profiles 
  ADD COLUMN IF NOT EXISTS preferred_working_mode teacher_working_mode DEFAULT 'INDEPENDENT';

-- 3. Academy Memberships Table (Relational Junction between Teacher and Academy)
CREATE TABLE IF NOT EXISTS public.academy_memberships (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  academy_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  teacher_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  status membership_status NOT NULL DEFAULT 'PENDING',
  role_title TEXT NOT NULL DEFAULT 'Instructor',
  application_message TEXT,
  rejection_reason TEXT,
  permissions JSONB NOT NULL DEFAULT '{
    "canCreateCourses": false,
    "canEditAcademyCourses": false,
    "canViewStudents": false,
    "canManageAssignments": false,
    "canHostLiveSessions": false
  }'::jsonb,
  assigned_course_ids JSONB DEFAULT '[]'::jsonb,
  applied_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  reviewed_at TIMESTAMPTZ,
  reviewer_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  left_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  -- Prevent duplicate active or pending memberships for the same teacher and academy
  CONSTRAINT uq_teacher_academy UNIQUE (academy_id, teacher_id)
);

-- Indexing for high-speed permission and roster queries
CREATE INDEX IF NOT EXISTS idx_memberships_teacher ON public.academy_memberships(teacher_id);
CREATE INDEX IF NOT EXISTS idx_memberships_academy ON public.academy_memberships(academy_id);
CREATE INDEX IF NOT EXISTS idx_memberships_status ON public.academy_memberships(status);
CREATE INDEX IF NOT EXISTS idx_memberships_active ON public.academy_memberships(teacher_id, academy_id) WHERE status = 'APPROVED';

-- Trigger: Automatically update updated_at timestamp
DROP TRIGGER IF EXISTS tr_memberships_updated_at ON public.academy_memberships;
CREATE TRIGGER tr_memberships_updated_at
  BEFORE UPDATE ON public.academy_memberships
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ==============================================================
-- 4. SECURITY & PRIVILEGE ESCALATION TRIGGERS
-- ==============================================================

-- A. Prevent teachers from approving their own join requests or escalating permissions
CREATE OR REPLACE FUNCTION protect_membership_escalation()
RETURNS TRIGGER AS $$
DECLARE
  caller_id UUID;
  caller_role user_role;
BEGIN
  caller_id := auth.uid();

  -- Get caller's role
  SELECT role INTO caller_role FROM public.profiles WHERE id = caller_id;

  -- Platform Admin can always manage memberships
  IF caller_role = 'ADMIN' THEN
    RETURN NEW;
  END IF;

  -- If status or permissions are being updated
  IF (OLD.status <> NEW.status OR OLD.permissions <> NEW.permissions OR OLD.assigned_course_ids <> NEW.assigned_course_ids) THEN
    
    -- Case 1: Teacher voluntarily leaving or cancelling request
    IF caller_id = OLD.teacher_id THEN
      -- A teacher can ONLY transition from PENDING -> CANCELLED or APPROVED -> CANCELLED
      IF NEW.status = 'CANCELLED' AND (OLD.status = 'PENDING' OR OLD.status = 'APPROVED') THEN
        -- Ensure permissions were not elevated
        NEW.permissions := OLD.permissions;
        NEW.assigned_course_ids := OLD.assigned_course_ids;
        NEW.left_at := NOW();
        RETURN NEW;
      ELSE
        RAISE EXCEPTION 'Access Denied: Teachers cannot approve their own requests or alter permissions.';
      END IF;
    END IF;

    -- Case 2: Academy administrator reviewing/modifying
    IF caller_id = OLD.academy_id THEN
      -- Academy owner is authorized to approve, reject, or assign permissions
      NEW.reviewed_at := NOW();
      NEW.reviewer_id := caller_id;
      RETURN NEW;
    END IF;

    -- Unauthorized caller
    RAISE EXCEPTION 'Access Denied: You are not authorized to review or modify this academy membership.';
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS tr_protect_membership_escalation ON public.academy_memberships;
CREATE TRIGGER tr_protect_membership_escalation
  BEFORE UPDATE ON public.academy_memberships
  FOR EACH ROW EXECUTE FUNCTION protect_membership_escalation();

-- ==============================================================
-- 5. ROW LEVEL SECURITY (RLS) POLICIES FOR ACADEMY MEMBERSHIPS
-- ==============================================================

ALTER TABLE public.academy_memberships ENABLE ROW LEVEL SECURITY;

-- 1. SELECT Policy:
-- Teachers can view their own memberships.
-- Academy admins can view memberships associated with their academy.
-- Platform admins can view all.
DROP POLICY IF EXISTS "Users can view relevant academy memberships" ON public.academy_memberships;
CREATE POLICY "Users can view relevant academy memberships"
  ON public.academy_memberships FOR SELECT
  USING (
    auth.uid() = teacher_id OR
    auth.uid() = academy_id OR
    public.get_current_role() = 'ADMIN'
  );

-- 2. INSERT Policy:
-- Only authenticated teachers can submit applications.
-- Must be for themselves (teacher_id = auth.uid()).
-- Status must start as 'PENDING'.
-- Permissions must be initially false.
DROP POLICY IF EXISTS "Teachers can submit join requests" ON public.academy_memberships;
CREATE POLICY "Teachers can submit join requests"
  ON public.academy_memberships FOR INSERT
  WITH CHECK (
    auth.uid() = teacher_id AND
    auth.uid() <> academy_id AND
    status = 'PENDING' AND
    public.get_current_role() IN ('TEACHER', 'SELLER', 'COACH', 'ADMIN')
  );

-- 3. UPDATE Policy:
-- Authorized academy admin can update status and permissions.
-- Teachers can only update to CANCELLED.
DROP POLICY IF EXISTS "Authorized users can update memberships" ON public.academy_memberships;
CREATE POLICY "Authorized users can update memberships"
  ON public.academy_memberships FOR UPDATE
  USING (
    auth.uid() = academy_id OR
    auth.uid() = teacher_id OR
    public.get_current_role() = 'ADMIN'
  );

-- 4. DELETE Policy:
-- Hard deletes restricted; lifecycle is managed via CANCELLED status.
DROP POLICY IF EXISTS "Admins can delete membership rows" ON public.academy_memberships;
CREATE POLICY "Admins can delete membership rows"
  ON public.academy_memberships FOR DELETE
  USING (public.get_current_role() = 'ADMIN');

-- ==============================================================
-- 6. COURSE OWNERSHIP & ACCESS CONTROL POLICIES
-- ==============================================================

-- Add academy ownership fields to products/courses if not already present
ALTER TABLE public.products
  ADD COLUMN IF NOT EXISTS is_academy_owned BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS academy_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL;

-- Function to check if a teacher has active course-editing permissions in an academy
CREATE OR REPLACE FUNCTION public.can_teacher_edit_academy_course(check_course_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
  v_academy_id UUID;
  v_is_academy_owned BOOLEAN;
  v_has_perm BOOLEAN;
BEGIN
  SELECT academy_id, is_academy_owned 
  INTO v_academy_id, v_is_academy_owned 
  FROM public.products 
  WHERE id = check_course_id;

  IF NOT v_is_academy_owned OR v_academy_id IS NULL THEN
    RETURN false;
  END IF;

  SELECT (permissions->>'canEditAcademyCourses')::boolean
  INTO v_has_perm
  FROM public.academy_memberships
  WHERE academy_id = v_academy_id
    AND teacher_id = auth.uid()
    AND status = 'APPROVED';

  RETURN COALESCE(v_has_perm, false);
END;
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER;

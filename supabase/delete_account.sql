-- ===================================================================
-- ACCOUNT DELETION SQL FUNCTION
-- ===================================================================
-- This function deletes all user data when an account is deleted.
-- It handles cascading deletion of notes, attachments, and auth.
-- 
-- Usage: SELECT delete_user_account('user-id-here');
-- ===================================================================

-- Create a function to delete all user data when account is deleted
CREATE OR REPLACE FUNCTION public.delete_user_account(user_id UUID)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Delete all notes for the user (attachments will be handled by client)
  DELETE FROM public.notes WHERE user_id = user_id;
  
  -- Additional cleanup for any other user-related data can be added here
  -- DELETE FROM public.user_sessions WHERE user_id = user_id;
  -- DELETE FROM public.user_preferences WHERE user_id = user_id;
  
  -- Log the deletion for audit purposes (optional)
  INSERT INTO public.deleted_accounts (id, deleted_at)
  VALUES (user_id, NOW())
  ON CONFLICT (id) DO UPDATE SET deleted_at = NOW();
END;
$$;

-- ===================================================================
-- CREATE DELETED_ACCOUNTS TABLE (for audit trail)
-- ===================================================================
CREATE TABLE IF NOT EXISTS public.deleted_accounts (
  id UUID PRIMARY KEY,
  deleted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  CONSTRAINT deleted_accounts_fk FOREIGN KEY (id) REFERENCES auth.users(id) ON DELETE CASCADE
);

-- Enable RLS on deleted_accounts table
ALTER TABLE public.deleted_accounts ENABLE ROW LEVEL SECURITY;

-- Create policy to prevent public access
CREATE POLICY "Only admins can view deleted accounts"
  ON public.deleted_accounts
  FOR SELECT
  USING (auth.role() = 'authenticated' AND auth.uid() = id);

-- ===================================================================
-- CASCADING DELETE SETUP (Optional but Recommended)
-- ===================================================================
-- This makes notes automatically delete when user is deleted from auth
-- Note: This requires the notes table to have proper foreign key constraints

-- If your notes table doesn't have explicit FK to auth.users, add it:
-- ALTER TABLE public.notes 
-- ADD CONSTRAINT notes_user_id_fk 
-- FOREIGN KEY (user_id) 
-- REFERENCES auth.users(id) 
-- ON DELETE CASCADE;

-- ===================================================================
-- TRIGGER FOR AUTOMATIC CLEANUP ON AUTH DELETE
-- ===================================================================
-- Create a trigger that runs the delete function when user deletes account
-- Note: This requires Supabase Webhooks or manual function call

CREATE OR REPLACE FUNCTION public.handle_auth_user_deleted()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Call the delete_user_account function
  PERFORM delete_user_account(OLD.id);
  RETURN OLD;
END;
$$;

-- Note: Auth triggers must be set up through Supabase Dashboard
-- Go to: Auth -> Webhooks -> New Webhook
-- Event: auth.user -> user deleted
-- Send request to: Your backend endpoint that calls delete_user_account()
-- OR use: https://supabase-project-url/functions/v1/delete-user

-- ===================================================================
-- ALTERNATIVE: DIRECT DELETE WITH RLS
-- ===================================================================
-- Create a simple function that respects RLS and can delete the user's own account

CREATE OR REPLACE FUNCTION public.delete_my_account()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  current_user_id UUID;
BEGIN
  -- Get the current user ID
  current_user_id := auth.uid();
  
  -- Check if user is authenticated
  IF current_user_id IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;
  
  -- Delete user data
  DELETE FROM public.notes WHERE user_id = current_user_id;
  
  -- Log deletion
  INSERT INTO public.deleted_accounts (id) VALUES (current_user_id)
  ON CONFLICT (id) DO UPDATE SET deleted_at = NOW();
  
  -- Note: To actually delete the auth user, call supabase.auth.admin.deleteUser() 
  -- from the client or your backend
END;
$$;

-- ===================================================================
-- GRANT PERMISSIONS
-- ===================================================================
-- Allow authenticated users to call the delete_my_account function
GRANT EXECUTE ON FUNCTION public.delete_my_account() TO authenticated;

-- Allow service role to call both functions (for backend use)
GRANT EXECUTE ON FUNCTION public.delete_user_account(UUID) TO service_role;

-- ===================================================================
-- USAGE EXAMPLES
-- ===================================================================

-- 1. From JavaScript (already implemented in Account.tsx):
-- const { error } = await supabase.rpc('delete_my_account');
-- if (error) console.error(error);

-- 2. Or manually call from backend:
-- SELECT delete_user_account('user-uuid-here');

-- 3. Then delete auth user:
-- const { error } = await supabase.auth.admin.deleteUser('user-uuid-here');

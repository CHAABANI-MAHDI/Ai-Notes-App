import { createClient } from '@supabase/supabase-js';

// Replaced with your provided placeholder URL and Key
const SUPABASE_URL = "https://hxwzyalylnhbtkkzbvdn.supabase.co";
const SUPABASE_PUBLIC_KEY = "sb_publishable_N0YcAMrR4eRp_k8nWqu_SA_lSYCy6FL";

export const supabase = createClient(SUPABASE_URL, SUPABASE_PUBLIC_KEY);

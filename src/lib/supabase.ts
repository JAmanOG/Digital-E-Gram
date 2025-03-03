import { createClient } from '@supabase/supabase-js';
import type { Database } from '../types/database';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  throw new Error('Missing Supabase credentials');
}

// Create a single supabase client for the entire app
export const supabase = createClient<Database>(
  supabaseUrl, 
  supabaseKey,
  {
    auth: {
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: true
    }
  }
);

// Test connection function
export const testSupabaseConnection = async () => {
  try {
    // First check if the services table exists
    const { error: tableCheckError } = await supabase
      .from('services')
      .select('id')
      .limit(1);
    
    if (tableCheckError) {
      if (tableCheckError.message.includes('does not exist')) {
        console.error('Services table does not exist. Database might not be initialized.');
        return false;
      }
      console.error('Supabase connection test failed:', tableCheckError);
      return false;
    }
    
    console.log('Supabase connection successful');
    return true;
  } catch (error) {
    console.error('Supabase connection test error:', error);
    return false;
  }
};
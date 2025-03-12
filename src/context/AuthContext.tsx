import { createContext, useContext, useEffect, useState } from 'react';
import { supabase, testSupabaseConnection } from '../lib/supabase';
import type { Profile } from '../types/database';
import toast from 'react-hot-toast';

type AuthContextType = {
  user: Profile | null;
  loading: boolean;
  connectionStatus: 'checking' | 'connected' | 'error';
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, name: string, role: string) => Promise<void>;
  signOut: () => Promise<void>;
  updateProfile: (data: Partial<Profile>) => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);


export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  // const [connectionStatus, setConnectionStatus] = useState<'checking' | 'connected' | 'error'>('checking');
  const [connectionStatus, setConnectionStatus] = useState<'checking' | 'connected' | 'error'>('connected');

  useEffect(() => {
    // Test Supabase connection first
    const checkConnection = async () => {
      try {
        const isConnected = await testSupabaseConnection();
        if (isConnected) {
          setConnectionStatus('connected');
          await checkSession();
        } else {
          setConnectionStatus('error');
          toast.error('Unable to connect to the database. Please try again later.');
          setLoading(false);
        }
      } catch (error) {
        console.error('Connection check error:', error);
        setConnectionStatus('error');
        toast.error('Unable to connect to the database. Please try again later.');
        setLoading(false);
      }
    };

    // Check active sessions and sets the user
    const checkSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user) {
          await fetchProfile(session.user.id);
        }
      } catch (error) {
        console.error('Session check error:', error);
      } finally {
        setLoading(false);
      }
    };

    // checkConnection();

    // Listen for changes on auth state
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      try {
        if (session?.user) {
          await fetchProfile(session.user.id);
        } else {
          setUser(null);
        }
      } catch (error) {
        console.error('Auth state change error:', error);
      } finally {
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchProfile = async (userId: string) => {
    try {
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();
      
      if (error) {
        console.error('Error fetching profile:', error);
        return;
      }
      
      if (profile) {
        setUser(profile);
      }
    } catch (error) {
      console.error('Error in fetchProfile:', error);
    }
  };

  const updateProfile = async (data: Partial<Profile>) => {
    if (!user) {
      toast.error('You must be logged in to update your profile');
      return;
    }

    if (connectionStatus !== 'connected') {
      toast.error('Cannot connect to the server. Please try again later.');
      return;
    }

    try {
      const { error } = await supabase
        .from('profiles')
        .update(data)
        .eq('id', user.id);
      
      if (error) {
        console.error('Error updating profile:', error);
        toast.error('Failed to update profile');
        return;
      }
      
      // Refresh the profile data
      await fetchProfile(user.id);
      toast.success('Profile updated successfully');
    } catch (error) {
      console.error('Error in updateProfile:', error);
      toast.error('Failed to update profile');
    }
  };

  const signUp = async (email: string, password: string, name: string, role: string) => {
    if (connectionStatus !== 'connected') {
      toast.error('Cannot connect to the server. Please try again later.');
      return;
    }

    try {
      // First check if the user already exists
      const { data: existingUser, error: checkError } = await supabase
        .from('profiles')
        .select('email')
        .eq('email', email)
        .maybeSingle();

      if (checkError && !checkError.message.includes('No rows found')) {
        console.error('Error checking existing user:', checkError);
        toast.error('Error checking user account. Please try again.');
        return;
      }

      if (existingUser) {
        toast.error('An account with this email already exists');
        return;
      }

      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name,
            role,
          },
          emailRedirectTo: window.location.origin + '/login',
        },
      });
      
      if (error) {
        console.error('Signup error:', error);
        
        // More user-friendly error messages
        if (error.message.includes('network')) {
          toast.error('Network error. Please check your connection and try again.');
        } else if (error.message.includes('password')) {
          toast.error('Password should be at least 6 characters long.');
        } else {
          toast.error(error.message || 'Failed to create account');
        }
        return;
      }
      
      // If user is created but needs email confirmation
      if (data.user && !data.session) {
        toast.success('Account created! Please check your email to confirm your account.');
      } else if (data.user && data.session) {
        // If email confirmation is disabled, user is automatically signed in
        toast.success('Account created successfully!');
      }
    } catch (error: any) {
      console.error('Error in signUp:', error);
      
      // Handle network errors more gracefully
      if (error.name === 'AuthRetryableFetchError') {
        toast.error('Network error. Please check your connection and try again.');
      } else {
        toast.error('Failed to create account. Please try again later.');
      }
    }
  };

  const signIn = async (email: string, password: string) => {
    if (connectionStatus !== 'connected') {
      toast.error('Cannot connect to the server. Please try again later.');
      return;
    }

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      
      if (error) {
        console.error('Signin error:', error);
        
        // More user-friendly error messages
        if (error.message.includes('Invalid login credentials')) {
          toast.error('Invalid email or password');
        } else if (error.message.includes('network')) {
          toast.error('Network error. Please check your connection and try again.');
        } else {
          toast.error(error.message || 'Failed to sign in');
        }
        return;
      }
      
      if (data.user) {
        toast.success('Signed in successfully!');
      }
    } catch (error: any) {
      console.error('Error in signIn:', error);
      
      // Handle network errors more gracefully
      if (error.name === 'AuthRetryableFetchError') {
        toast.error('Network error. Please check your connection and try again.');
      } else {
        toast.error('Failed to sign in. Please try again later.');
      }
    }
  };

  const signOut = async () => {
    if (connectionStatus !== 'connected') {
      toast.error('Cannot connect to the server. Please try again later.');
      return;
    }

    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.error('Signout error:', error);
        toast.error(error.message || 'Failed to sign out');
        return;
      }
      toast.success('Signed out successfully');
    } catch (error) {
      console.error('Error in signOut:', error);
      toast.error('Failed to sign out. Please try again.');
    }
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      loading, 
      connectionStatus, 
      signIn, 
      signUp, 
      signOut,
      updateProfile
    }}>
      {children}
    </AuthContext.Provider>
  );
}

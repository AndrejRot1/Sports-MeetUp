
import React, { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/lib/supabase';

const AuthContext = createContext();

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { toast } = useToast();
  
  useEffect(() => {
    // Check for existing session
    const getSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        setUser(session.user);
      }
      setLoading(false);
    };

    getSession();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (session?.user) {
          setUser(session.user);
        } else {
          setUser(null);
        }
        setLoading(false);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const register = async (userData) => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email: userData.email,
        password: userData.password,
        options: {
          data: {
            full_name: userData.name,
            name: userData.name,
            username: userData.username,
            age: userData.age,
            gender: userData.gender,
            favorite_sports: Array.isArray(userData.favoriteSports) ? userData.favoriteSports.slice(0, 3) : []
          }
        }
      });

      if (error) throw error;

      // Create/Upsert profile row as well
      if (data.user) {
        await supabase.from('profiles').upsert({
          id: data.user.id,
          full_name: userData.name,
          username: userData.username,
          age: userData.age,
          gender: userData.gender,
          favorite_sports: Array.isArray(userData.favoriteSports) ? userData.favoriteSports.slice(0,3) : []
        }, { onConflict: 'id' });
      }

      toast({
        title: "Registration Successful",
        description: "Please check your email to verify your account.",
        duration: 7000,
      });
      
      return { success: true };
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Registration Failed",
        description: error.message,
      });
      return { success: false, error: error.message };
    }
  };

  const login = async (email, password) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      // Ensure profile row exists after login
      if (data.user) {
        await supabase.from('profiles').upsert({ id: data.user.id }, { onConflict: 'id' });
      }

      toast({
        title: "Login Successful",
        description: `Welcome back!`,
      });
      
      return { success: true };
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Login Failed",
        description: error.message,
      });
      return { success: false, error: error.message };
    }
  };

  const logout = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      
      setUser(null);
      navigate('/login');
      toast({
        title: "Logged Out",
        description: "You have been successfully logged out.",
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Logout Failed",
        description: error.message,
      });
    }
  };

  const verifyEmail = async (token) => {
    try {
      const { data, error } = await supabase.auth.verifyOtp({
        token_hash: token,
        type: 'email'
      });

      if (error) throw error;

      toast({
        title: "Email Verified",
        description: "Your email has been successfully verified.",
      });
      
      return { success: true };
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Verification Failed",
        description: error.message,
      });
      return { success: false, error: error.message };
    }
  };

  const updateProfile = async (updates) => {
    try {
      if (!user) throw new Error('You must be logged in');
      
      const payload = {};
      const metadata = {};

      if (typeof updates.email === 'string' && updates.email !== user.email) {
        payload.email = updates.email;
      }
      if (typeof updates.password === 'string' && updates.password.length >= 6) {
        payload.password = updates.password;
      }

      if (typeof updates.name === 'string') metadata.full_name = updates.name;
      if (typeof updates.username === 'string') metadata.username = updates.username;
      if (typeof updates.age !== 'undefined') metadata.age = updates.age;
      if (typeof updates.gender === 'string') metadata.gender = updates.gender;
      if (Array.isArray(updates.favoriteSports)) metadata.favorite_sports = updates.favoriteSports.slice(0, 3);

      const { data, error } = await supabase.auth.updateUser({
        ...payload,
        data: Object.keys(metadata).length ? metadata : undefined,
      });

      if (error) throw error;

      // Mirror changes into profiles table
      const profileUpdate = {
        id: data.user.id,
        full_name: metadata.full_name,
        username: metadata.username,
        age: metadata.age,
        gender: metadata.gender,
        favorite_sports: metadata.favorite_sports,
      };

      // Remove undefined keys
      Object.keys(profileUpdate).forEach((k) => profileUpdate[k] === undefined && delete profileUpdate[k]);
      await supabase.from('profiles').upsert(profileUpdate, { onConflict: 'id' });

      setUser(data.user);
      
      toast({
        title: "Profile Updated",
        description: "Your profile has been successfully updated.",
      });
      
      return { success: true };
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Update Failed",
        description: error.message,
      });
      return { success: false, error: error.message };
    }
  };

  const value = {
    user,
    loading,
    register,
    login,
    logout,
    verifyEmail,
    updateProfile
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

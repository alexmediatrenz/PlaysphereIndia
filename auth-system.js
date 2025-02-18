import React, { createContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useToast } from '@/components/ui/use-toast';

export const AuthContext = createContext(null);

const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setLoading(false);
        return;
      }

      const response = await axios.get('/api/auth/me', {
        headers: { Authorization: `Bearer ${token}` }
      });

      setUser(response.data);
    } catch (err) {
      localStorage.removeItem('token');
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const login = async (credentials) => {
    try {
      const response = await axios.post('/api/auth/login', credentials);
      const { token, user } = response.data;

      localStorage.setItem('token', token);
      setUser(user);
      
      toast({
        title: 'Welcome back!',
        description: `Logged in as ${user.name}`,
      });

      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed');
      toast({
        title: 'Login Failed',
        description: err.response?.data?.message || 'An error occurred',
        variant: 'destructive',
      });
      throw err;
    }
  };

  const register = async (userData) => {
    try {
      const response = await axios.post('/api/auth/register', userData);
      const { token, user } = response.data;

      localStorage.setItem('token', token);
      setUser(user);

      toast({
        title: 'Welcome to PlaySphere!',
        description: 'Your account has been created successfully.',
      });

      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed');
      toast({
        title: 'Registration Failed',
        description: err.response?.data?.message || 'An error occurred',
        variant: 'destructive',
      });
      throw err;
    }
  };

  const logout = async () => {
    try {
      await axios.post('/api/auth/logout');
      localStorage.removeItem('token');
      setUser(null);
      navigate('/login');
      
      toast({
        title: 'Logged out',
        description: 'Come back soon!',
      });
    } catch (err) {
      setError(err.message);
      toast({
        title: 'Logout Failed',
        description: err.message,
        variant: 'destructive',
      });
    }
  };

  const sendOTP = async (phoneNumber) => {
    try {
      await axios.post('/api/auth/send-otp', { phoneNumber });
      toast({
        title: 'OTP Sent',
        description: 'Please check your phone for the verification code.',
      });
    } catch (err) {
      toast({
        title: 'Failed to send OTP',
        description: err.response?.data?.message || 'An error occurred',
        variant: 'destructive',
      });
      throw err;
    }
  };

  const verifyOTP = async (phoneNumber, otp) => {
    try {
      const response = await axios.post('/api/auth/verify-otp', {
        phoneNumber,
        otp,
      });
      
      const { token, user } = response.data;
      localStorage.setItem('token', token);
      setUser(user);
      
      toast({
        title: 'Phone Verified',
        description: 'Your phone number has been verified successfully.',
      });

      return true;
    } catch (err) {
      toast({
        title: 'Verification Failed',
        description: err.response?.data?.message || 'Invalid OTP',
        variant: 'destructive',
      });
      throw err;
    }
  };

  const value = {
    user,
    loading,
    error,
    login,
    register,
    logout,
    sendOTP,
    verifyOTP,
  };

  if (loading) {
    return <div>Loading...</div>; // Replace with proper loading component
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthProvider;

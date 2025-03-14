// utils/auth.ts
"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Cookies from 'js-cookie';

// Hook to check if user is authenticated
export function useAuth() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [userId, setUserId] = useState<string | null>(null);
  const [username, setUsername] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    // Check for authentication
    const checkAuth = () => {
      const tokenFromCookie = Cookies.get('token');
      const tokenFromSession = sessionStorage.getItem('token');
      
      // If token exists in either cookie or sessionStorage
      if (tokenFromCookie || tokenFromSession) {
        // If token exists in cookie but not in sessionStorage, restore session
        if (tokenFromCookie && !tokenFromSession) {
          sessionStorage.setItem('token', tokenFromCookie);
          
          // Try to get user ID from cookie
          const userIdFromCookie = Cookies.get('user_id');
          if (userIdFromCookie) {
            sessionStorage.setItem('id_user', userIdFromCookie);
          }
        }
        
        // Get user data from sessionStorage
        const storedUserId = sessionStorage.getItem('id_user');
        const storedUsername = sessionStorage.getItem('username');
        
        setIsAuthenticated(true);
        setUserId(storedUserId);
        setUsername(storedUsername);
      } else {
        setIsAuthenticated(false);
      }
      
      setIsLoading(false);
    };
    
    checkAuth();
  }, [router]);
  
  // Function to log out
  const logout = () => {
    // Clear sessionStorage
    sessionStorage.clear();
    
    // Clear cookies
    Cookies.remove('token');
    Cookies.remove('user_id');
    
    // Update state
    setIsAuthenticated(false);
    setUserId(null);
    setUsername(null);
    
    // Redirect to login
    router.push('/login');
  };
  
  return { isAuthenticated, isLoading, userId, username, logout };
}

// Check if we're running on the client side
export const isClient = typeof window !== 'undefined';

// Get token (works only on client)
export const getToken = (): string | null => {
  if (!isClient) return null;
  return sessionStorage.getItem('token') || Cookies.get('token') || null;
};

// Get user ID (works only on client)
export const getUserId = (): string | null => {
  if (!isClient) return null;
  return sessionStorage.getItem('id_user') || Cookies.get('user_id') || null;
};
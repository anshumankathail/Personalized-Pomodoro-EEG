// hooks/use-auth.ts
'use client';
import { useContext } from 'react';
import { AuthContext } from '@/components/auth-provider';

export const useAuth = () => useContext(AuthContext);

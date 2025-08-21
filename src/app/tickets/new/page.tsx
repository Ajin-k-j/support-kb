'use client';

import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function NewTicket() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  if (loading) return <div className="text-center py-5">Loading...</div>;
  if (!user) return null;

  return (
    <div className="container">
      <h2 className="mb-4">Create New Ticket</h2>
      <p>Placeholder for ticket creation form. Coming soon!</p>
    </div>
  );
}
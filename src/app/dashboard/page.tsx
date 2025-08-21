'use client';

import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { signOut } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { listenToUserTickets } from '@/lib/firestore';
import { TicketData } from '@/types';
import TicketTable from '@/components/TicketTable';
import Link from 'next/link';

export default function Dashboard() {
  const { user, userData, loading } = useAuth();
  const router = useRouter();
  const [tickets, setTickets] = useState<TicketData[]>([]);

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  useEffect(() => {
    if (user) {
      const unsubscribe = listenToUserTickets(user.uid, setTickets);
      return () => unsubscribe();
    }
  }, [user]);

  if (loading) return <div className="text-center py-5">Loading...</div>;
  if (!user) return null;

  const handleLogout = async () => {
    await signOut(auth);
    router.push('/login');
  };

  return (
    <div className="container">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>Welcome, {userData?.displayName || 'User'}!</h2>
        <div className="d-flex gap-3">
          <Link href="/tickets/new" className="btn btn-primary">Create New Ticket</Link>
          <button onClick={handleLogout} className="btn btn-outline-secondary">Log Out</button>
        </div>
      </div>
      <TicketTable tickets={tickets} />
    </div>
  );
}
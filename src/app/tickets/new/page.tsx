'use client';

import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { createTicket } from '@/lib/firestore';
import { listenToAllUsers } from '@/lib/users';
import Loader from '@/components/Loader';
import { UserData, InvestigationEntry } from '@/types';
import TicketForm from '@/components/TicketForm';
import { TicketFormValues } from '@/lib/schemas';

export default function NewTicket() {
  const { user, userData, loading } = useAuth();
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [allUsers, setAllUsers] = useState<UserData[]>([]);

  useEffect(() => {
    if (!loading && !user) router.push('/login');
  }, [user, loading, router]);

  useEffect(() => {
    if (user) {
      const unsubscribe = listenToAllUsers(setAllUsers);
      return () => unsubscribe();
    }
  }, [user]);

  if (loading || !user) return <div className="text-center py-5"><Loader /></div>;

  const handleSubmit = async (data: TicketFormValues, assignedUsers: string[], investigationLog: InvestigationEntry[]) => {
    try {
      setError(null);
      setIsSubmitting(true);
      await createTicket({
        ...data,
        assignedTo: user.uid,
        assignedUsers,
        supportingLinks: data.supportingLinks?.split('\n').map(l => l.trim()).filter(Boolean) || [],
        investigationLog,
      });
      router.push('/dashboard');
    } catch (err: any) {
      setError('Failed to create ticket: ' + err.message);
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container py-2">
      <h2 className="mb-3 text-gray-800">Create New Ticket</h2>
      {error && <div className="alert alert-danger mb-3">{error}</div>}
      <TicketForm
        allUsers={allUsers}
        currentUserUid={user.uid}
        currentUserName={userData?.displayName || user.displayName || undefined}
        currentUserEmail={userData?.email || user.email || undefined}
        currentUserRole={userData?.role}
        ticketOwnerId={user.uid}
        isSubmitting={isSubmitting}
        onSubmit={handleSubmit}
        onCancel={() => router.push('/dashboard')}
        isEditing={false}
      />
    </div>
  );
}
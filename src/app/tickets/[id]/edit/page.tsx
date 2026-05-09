'use client';

import { use, useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { doc, getDocs, updateDoc, serverTimestamp, collection, query, where } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { listenToAllUsers } from '@/lib/users';
import { TicketData, UserData, InvestigationEntry } from '@/types';
import Loader from '@/components/Loader';
import TicketForm from '@/components/TicketForm';
import { TicketFormValues } from '@/lib/schemas';

import RoleGuard from '@/components/RoleGuard';

export default function EditTicket({ params }: { params: Promise<{ id: string }> }) {
    const { id: ticketNumber } = use(params);
    const { user, userData, loading: authLoading } = useAuth();
    const router = useRouter();
    
    const [ticket, setTicket] = useState<TicketData | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [allUsers, setAllUsers] = useState<UserData[]>([]);

    useEffect(() => {
        if (user) {
            const unsubscribe = listenToAllUsers(setAllUsers);
            return () => unsubscribe();
        }
    }, [user]);

    useEffect(() => {
        if (user && ticketNumber) {
            const fetchTicketByNumber = async () => {
                try {
                    const q = query(collection(db, 'ticketResolutions'), where("ticketNumber", "==", ticketNumber));
                    const querySnapshot = await getDocs(q);
                    if (!querySnapshot.empty) {
                        const ticketDoc = querySnapshot.docs[0];
                        setTicket({ id: ticketDoc.id, ...ticketDoc.data() } as TicketData);
                    } else {
                        setError(`Ticket with ID "${ticketNumber}" not found.`);
                    }
                } catch (err: any) {
                    setError('Failed to fetch ticket: ' + err.message);
                }
            };
            fetchTicketByNumber();
        }
    }, [user, ticketNumber]);

    if (authLoading || !ticket || !user) return <div className="text-center py-5"><Loader /></div>;

    const handleSubmit = async (data: TicketFormValues, assignedUsers: string[], investigationLog: InvestigationEntry[]) => {
        if (!ticket) {
            setError('Cannot update ticket: original ticket data not found.');
            return;
        }
        try {
            setError(null);
            setIsSubmitting(true);
            const docRef = doc(db, 'ticketResolutions', ticket.id);
            const updateData = {
                ...data,
                supportingLinks: data.supportingLinks?.split('\n').map(l => l.trim()).filter(Boolean) || [],
                assignedUsers,
                investigationLog,
                lastModified: serverTimestamp(),
            };
            await updateDoc(docRef, updateData as any);
            router.push(`/tickets/${ticket.ticketNumber}`);
        } catch (err: any) {
            setError('Failed to update ticket: ' + err.message);
            setIsSubmitting(false);
        }
    };

    return (
      <RoleGuard>
        <div className="container py-2">
            <h2 className="mb-3 text-gray-800">Edit Ticket: {ticket.ticketNumber}</h2>
            {error && <div className="alert alert-danger mb-3">{error}</div>}
            
            <TicketForm
                initialData={{
                    ticketNumber: ticket.ticketNumber,
                    title: ticket.title,
                    category: ticket.category,
                    status: ticket.status as any,
                    businessImpact: ticket.businessImpact as any,
                    aiSummary: ticket.aiSummary,
                    customerDescription: ticket.customerDescription,
                    supportDescription: ticket.supportDescription,
                    supportingLinks: ticket.supportingLinks?.join('\n') || '',
                }}
                initialAssignedUsers={ticket.assignedUsers}
                initialInvestigationLog={ticket.investigationLog}
                allUsers={allUsers}
                currentUserUid={user.uid}
                currentUserName={userData?.displayName || user.displayName || undefined}
                currentUserEmail={userData?.email || user.email || undefined}
                currentUserRole={userData?.role}
                ticketOwnerId={ticket.assignedTo}
                isSubmitting={isSubmitting}
                onSubmit={handleSubmit}
                onCancel={() => router.push(`/tickets/${ticketNumber}`)}
                isEditing={true}
            />
        </div>
      </RoleGuard>
    );
}
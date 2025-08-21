import { db } from '@/lib/firebase';
import { collection, query, where, onSnapshot, Unsubscribe } from 'firebase/firestore';
import { TicketData } from '@/types';

export function listenToUserTickets(userId: string, callback: (tickets: TicketData[]) => void): Unsubscribe {
  const ticketsRef = collection(db, 'ticketResolutions');
  const q = query(ticketsRef, where('assignedTo', '==', userId));
  return onSnapshot(q, (snapshot) => {
    const tickets: TicketData[] = [];
    snapshot.forEach((doc) => {
      tickets.push({ id: doc.id, ...doc.data() } as TicketData);
    });
    callback(tickets);
  }, (error) => {
    console.error('Error fetching tickets:', error);
  });
}
import { db } from '@/lib/firebase';
// Added 'doc' and 'getDocs' to the import list
import { collection, query, where, onSnapshot, Unsubscribe, addDoc, updateDoc, doc, getDocs } from 'firebase/firestore';
import { TicketData } from '@/types';

export function listenToUserTickets(userId: string, callback: (tickets: TicketData[]) => void): Unsubscribe {
  const ticketsRef = collection(db, 'ticketResolutions');
  const q = query(ticketsRef, where('assignedUsers', 'array-contains', userId));
  return onSnapshot(q, (snapshot) => {
    const tickets: TicketData[] = [];
    snapshot.forEach((doc) => {
      const data = doc.data();
      tickets.push({
        id: doc.id,
        ...data,
        createdAt: data.createdAt ? (data.createdAt.toDate ? data.createdAt.toDate().toISOString() : data.createdAt) : new Date().toISOString(),
        lastModified: data.lastModified ? (data.lastModified.toDate ? data.lastModified.toDate().toISOString() : data.lastModified) : new Date().toISOString(),
      } as TicketData);
    });
    callback(tickets);
  }, (error) => {
    console.error('Error fetching tickets:', error);
  });
}

export async function createTicket(ticket: Omit<TicketData, 'id' | 'createdAt' | 'lastModified'>): Promise<string> {
  const now = new Date().toISOString();
  const ticketData = {
    ...ticket,
    createdAt: now,
    lastModified: now,
  };
  const docRef = await addDoc(collection(db, 'ticketResolutions'), ticketData);
  return docRef.id;
}

export async function updateTicket(id: string, ticket: Partial<TicketData>): Promise<void> {
  const now = new Date().toISOString();
  const ticketData = {
    ...ticket,
    lastModified: now,
  };
  const docRef = doc(db, 'ticketResolutions', id);
  await updateDoc(docRef, ticketData);
}

// NEW: Function to get all ticket IDs for static generation
export async function getAllTicketIds() {
  const ticketsRef = collection(db, 'ticketResolutions');
  const snapshot = await getDocs(ticketsRef);
  return snapshot.docs.map(doc => ({
    id: doc.id,
  }));
}

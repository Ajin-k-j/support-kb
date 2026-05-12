import { db } from '@/lib/firebase';
// Added 'doc' and 'getDocs' to the import list
import { collection, query, where, onSnapshot, Unsubscribe, addDoc, updateDoc, doc, getDocs, getDoc } from 'firebase/firestore';
import { TicketData, KBData, CodeSnippetData } from '@/types';

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

export function listenToUserKBs(userId: string, callback: (kbs: KBData[]) => void): Unsubscribe {
  const kbRef = collection(db, 'knowledgeBase');
  const q = query(kbRef, where('creatorId', '==', userId));
  return onSnapshot(q, (snapshot) => {
    const kbs: KBData[] = [];
    snapshot.forEach((doc) => {
      const data = doc.data();
      kbs.push({ id: doc.id, ...data } as KBData);
    });
    callback(kbs);
  });
}

export function listenToAllKBs(callback: (kbs: KBData[]) => void): Unsubscribe {
  const kbRef = collection(db, 'knowledgeBase');
  return onSnapshot(kbRef, (snapshot) => {
    const kbs: KBData[] = [];
    snapshot.forEach((doc) => {
      const data = doc.data();
      kbs.push({ id: doc.id, ...data } as KBData);
    });
    callback(kbs);
  });
}

export function listenToUserCodeSnippets(userId: string, callback: (codes: CodeSnippetData[]) => void): Unsubscribe {
  const codeRef = collection(db, 'codeSnippets');
  const q = query(codeRef, where('creatorId', '==', userId));
  return onSnapshot(q, (snapshot) => {
    const codes: CodeSnippetData[] = [];
    snapshot.forEach((doc) => {
      const data = doc.data();
      codes.push({ id: doc.id, ...data } as CodeSnippetData);
    });
    callback(codes);
  });
}

export function listenToAllCodeSnippets(callback: (codes: CodeSnippetData[]) => void): Unsubscribe {
  const codeRef = collection(db, 'codeSnippets');
  return onSnapshot(codeRef, (snapshot) => {
    const codes: CodeSnippetData[] = [];
    snapshot.forEach((doc) => {
      const data = doc.data();
      codes.push({ id: doc.id, ...data } as CodeSnippetData);
    });
    callback(codes);
  });
}

export async function createKBEntry(kb: Omit<KBData, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
  const now = new Date().toISOString();
  const kbData = { ...kb, createdAt: now, updatedAt: now };
  const docRef = await addDoc(collection(db, 'knowledgeBase'), kbData);
  return docRef.id;
}

export async function updateKBEntry(id: string, kb: Partial<KBData>): Promise<void> {
  const now = new Date().toISOString();
  const kbData = { ...kb, updatedAt: now };
  const docRef = doc(db, 'knowledgeBase', id);
  await updateDoc(docRef, kbData);
}

export async function getKBEntry(id: string): Promise<KBData | null> {
  const docRef = doc(db, 'knowledgeBase', id);
  const docSnap = await getDoc(docRef);
  if (docSnap.exists()) {
    return { id: docSnap.id, ...docSnap.data() } as KBData;
  }
  return null;
}

export async function createCodeSnippet(code: Omit<CodeSnippetData, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
  const now = new Date().toISOString();
  const codeData = { ...code, createdAt: now, updatedAt: now };
  const docRef = await addDoc(collection(db, 'codeSnippets'), codeData);
  return docRef.id;
}

export async function updateCodeSnippet(id: string, code: Partial<CodeSnippetData>): Promise<void> {
  const now = new Date().toISOString();
  const codeData = { ...code, updatedAt: now };
  const docRef = doc(db, 'codeSnippets', id);
  await updateDoc(docRef, codeData);
}

export async function getCodeSnippet(id: string): Promise<CodeSnippetData | null> {
  const docRef = doc(db, 'codeSnippets', id);
  const docSnap = await getDoc(docRef);
  if (docSnap.exists()) {
    return { id: docSnap.id, ...docSnap.data() } as CodeSnippetData;
  }
  return null;
}

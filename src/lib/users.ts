import { db } from '@/lib/firebase';
import { collection, onSnapshot, Unsubscribe } from 'firebase/firestore';
import { UserData } from '@/types';

export function listenToAllUsers(callback: (users: UserData[]) => void): Unsubscribe {
  const usersRef = collection(db, 'users');
  return onSnapshot(usersRef, (snapshot) => {
    const users: UserData[] = [];
    snapshot.forEach((doc) => {
      users.push({ uid: doc.id, ...doc.data() } as UserData);
    });
    callback(users);
  }, (error) => {
    console.error('Error fetching users:', error);
  });
}
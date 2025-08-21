'use client';

import { useAuth } from '@/context/AuthContext';
import { signOut } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function Nav() {
  const { user, userData, loading } = useAuth();
  const router = useRouter();

  const handleLogout = async () => {
    await signOut(auth);
    router.push('/login');
  };

  return (
    <header className="shadow">
      <nav className="container d-flex justify-content-between align-items-center py-3">
        <Link href="/" className="h4 fw-bold text-white text-decoration-none">Support KB</Link>
        <div className="d-flex gap-3 align-items-center">
          {loading ? (
            <span>Loading...</span>
          ) : user ? (
            <>
              <span className="fs-6 text-white">Hello, {userData?.displayName || 'User'}</span>
              <button onClick={handleLogout} className="btn btn-outline-secondary">Log Out</button>
            </>
          ) : (
            <>
              <Link href="/login" className="btn btn-outline-secondary">Login</Link>
              <Link href="/signup" className="btn btn-primary">Sign Up</Link>
            </>
          )}
        </div>
      </nav>
    </header>
  );
}
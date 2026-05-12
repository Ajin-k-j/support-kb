'use client';

import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { createKBEntry } from '@/lib/firestore';
import Loader from '@/components/Loader';
import KBForm from '@/components/KBForm';
import { KBFormValues } from '@/lib/schemas';

export default function NewKB() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!loading && !user) router.push('/login');
  }, [user, loading, router]);

  if (loading || !user) return <div className="text-center py-5"><Loader /></div>;

  const handleSubmit = async (data: KBFormValues) => {
    try {
      setError(null);
      setIsSubmitting(true);
      await createKBEntry({
        ...data,
        tags: data.tags ? data.tags.split(',').map(t => t.trim()).filter(Boolean) : [],
        createdBy: {
          uid: user.uid,
          email: user.email || '',
          displayName: user.displayName || 'Unknown User'
        },
      });
      router.push('/dashboard');
    } catch (err: any) {
      setError('Failed to create KB entry: ' + err.message);
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container py-2">
      <h2 className="mb-3 text-gray-800">Create New Knowledge Base Entry</h2>
      {error && <div className="alert alert-danger mb-3">{error}</div>}
      <KBForm
        isSubmitting={isSubmitting}
        onSubmit={handleSubmit}
        onCancel={() => router.push('/dashboard')}
        isEditing={false}
      />
    </div>
  );
}

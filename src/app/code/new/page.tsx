'use client';

import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { createCodeSnippet } from '@/lib/firestore';
import Loader from '@/components/Loader';
import CodeForm from '@/components/CodeForm';
import { CodeFormValues } from '@/lib/schemas';

export default function NewCode() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!loading && !user) router.push('/login');
  }, [user, loading, router]);

  if (loading || !user) return <div className="text-center py-5"><Loader /></div>;

  const handleSubmit = async (data: CodeFormValues) => {
    try {
      setError(null);
      setIsSubmitting(true);
      await createCodeSnippet({
        ...data,
        tags: data.tags ? data.tags.split(',').map(t => t.trim()).filter(Boolean) : [],
        creatorId: user.uid,
      });
      router.push('/dashboard');
    } catch (err: any) {
      setError('Failed to create Code Snippet: ' + err.message);
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container py-2">
      <h2 className="mb-3 text-gray-800">Create New Code Snippet</h2>
      {error && <div className="alert alert-danger mb-3">{error}</div>}
      <CodeForm
        isSubmitting={isSubmitting}
        onSubmit={handleSubmit}
        onCancel={() => router.push('/dashboard')}
        isEditing={false}
      />
    </div>
  );
}

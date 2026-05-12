'use client';

import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect, useState, use } from 'react';
import { getKBEntry, updateKBEntry } from '@/lib/firestore';
import { KBData } from '@/types';
import Loader from '@/components/Loader';
import KBForm from '@/components/KBForm';
import { KBFormValues } from '@/lib/schemas';

export default function EditKB({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [kb, setKb] = useState<KBData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!authLoading && !user) router.push('/login');
  }, [user, authLoading, router]);

  useEffect(() => {
    const fetchKB = async () => {
      try {
        const data = await getKBEntry(id);
        setKb(data);
      } catch (err) {
        console.error("Error fetching KB:", err);
        setError("Failed to fetch KB entry.");
      } finally {
        setLoading(false);
      }
    };
    if (user) fetchKB();
  }, [id, user]);

  if (authLoading || loading) return <div className="text-center py-5"><Loader /></div>;
  if (!kb) return <div className="container py-5 text-center">KB Entry not found.</div>;

  const handleSubmit = async (data: KBFormValues) => {
    try {
      setError(null);
      setIsSubmitting(true);
      await updateKBEntry(id, {
        ...data,
        tags: data.tags ? data.tags.split(',').map(t => t.trim()).filter(Boolean) : [],
      });
      router.push(`/kb/${id}`);
    } catch (err: any) {
      setError('Failed to update KB entry: ' + err.message);
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container py-2">
      <h2 className="mb-3 text-gray-800">Edit Knowledge Base Entry</h2>
      {error && <div className="alert alert-danger mb-3">{error}</div>}
      <KBForm
        initialData={{
            subject: kb.subject,
            content: kb.content,
            resolution: kb.resolution,
            tags: kb.tags ? kb.tags.join(', ') : ''
        }}
        isSubmitting={isSubmitting}
        onSubmit={handleSubmit}
        onCancel={() => router.push(`/kb/${id}`)}
        isEditing={true}
      />
    </div>
  );
}

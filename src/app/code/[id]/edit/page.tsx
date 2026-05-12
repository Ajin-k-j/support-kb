'use client';

import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect, useState, use } from 'react';
import { getCodeSnippet, updateCodeSnippet } from '@/lib/firestore';
import { CodeSnippetData } from '@/types';
import Loader from '@/components/Loader';
import CodeForm from '@/components/CodeForm';
import { CodeFormValues } from '@/lib/schemas';

export default function EditCode({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [code, setCode] = useState<CodeSnippetData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!authLoading && !user) router.push('/login');
  }, [user, authLoading, router]);

  useEffect(() => {
    const fetchCode = async () => {
      try {
        const data = await getCodeSnippet(id);
        setCode(data);
      } catch (err) {
        console.error("Error fetching Code:", err);
        setError("Failed to fetch Code Snippet.");
      } finally {
        setLoading(false);
      }
    };
    if (user) fetchCode();
  }, [id, user]);

  if (authLoading || loading) return <div className="text-center py-5"><Loader /></div>;
  if (!code) return <div className="container py-5 text-center">Code Snippet not found.</div>;

  const handleSubmit = async (data: CodeFormValues) => {
    try {
      setError(null);
      setIsSubmitting(true);
      await updateCodeSnippet(id, {
        ...data,
        tags: data.tags ? data.tags.split(',').map(t => t.trim()).filter(Boolean) : [],
      });
      router.push(`/code/${id}`);
    } catch (err: any) {
      setError('Failed to update Code Snippet: ' + err.message);
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container py-2">
      <h2 className="mb-3 text-gray-800">Edit Code Snippet</h2>
      {error && <div className="alert alert-danger mb-3">{error}</div>}
      <CodeForm
        initialData={{
            subject: code.subject,
            content: code.content,
            language: code.language,
            useCase: code.useCase,
            tags: code.tags ? code.tags.join(', ') : ''
        }}
        isSubmitting={isSubmitting}
        onSubmit={handleSubmit}
        onCancel={() => router.push(`/code/${id}`)}
        isEditing={true}
      />
    </div>
  );
}

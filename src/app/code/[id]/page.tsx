'use client';

import { useEffect, useState, use } from 'react';
import { getCodeSnippet } from '@/lib/firestore';
import { CodeSnippetData } from '@/types';
import Loader from '@/components/Loader';
import MarkdownRenderer from '@/components/MarkdownRenderer';
import { Box, Paper, Typography, Chip, Button } from '@mui/material';
import Link from 'next/link';

export default function ViewCode({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [code, setCode] = useState<CodeSnippetData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCode = async () => {
      try {
        const data = await getCodeSnippet(id);
        setCode(data);
      } catch (err) {
        console.error("Error fetching Code Snippet:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchCode();
  }, [id]);

  if (loading) return <Box sx={{ display: 'flex', justifyContent: 'center', p: 5 }}><Loader /></Box>;
  if (!code) return <div className="container py-5 text-center">Code Snippet not found.</div>;

  return (
    <div className="container py-4">
      <Paper sx={{ p: 4, mb: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h4" component="h1">{code.subject}</Typography>
          <Link href={`/code/${code.id}/edit`} passHref>
             <Button variant="outlined">Edit</Button>
          </Link>
        </Box>
        <Box sx={{ display: 'flex', gap: 1, mb: 3, alignItems: 'center' }}>
            <Chip label={code.language} color="primary" />
            {code.tags && code.tags.map(tag => <Chip key={tag} label={tag} size="small" variant="outlined" />)}
        </Box>
        
        {code.useCase && (
            <Box sx={{ mb: 4 }}>
                <Typography variant="overline" color="text.secondary">Use Case</Typography>
                <Typography variant="body1">{code.useCase}</Typography>
            </Box>
        )}

        <Typography variant="overline" color="text.secondary">Code Snippet</Typography>
        <Box className="mt-1">
           <MarkdownRenderer content={code.content} defaultLanguage={code.language} />
        </Box>
      </Paper>
    </div>
  );
}

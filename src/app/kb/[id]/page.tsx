'use client';

import { useEffect, useState, use } from 'react';
import { getKBEntry } from '@/lib/firestore';
import { KBData } from '@/types';
import Loader from '@/components/Loader';
import MarkdownRenderer from '@/components/MarkdownRenderer';
import { Box, Paper, Typography, Chip, Button } from '@mui/material';
import Link from 'next/link';

export default function ViewKB({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [kb, setKb] = useState<KBData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchKB = async () => {
      try {
        const data = await getKBEntry(id);
        setKb(data);
      } catch (err) {
        console.error("Error fetching KB:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchKB();
  }, [id]);

  if (loading) return <Box sx={{ display: 'flex', justifyContent: 'center', p: 5 }}><Loader /></Box>;
  if (!kb) return <div className="container py-5 text-center">KB Entry not found.</div>;

  return (
    <div className="container py-4">
      <Paper sx={{ p: 4, mb: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h4" component="h1">{kb.subject}</Typography>
          <Link href={`/kb/${kb.id}/edit`} passHref>
             <Button variant="outlined">Edit</Button>
          </Link>
        </Box>
        <Box sx={{ display: 'flex', gap: 1, mb: 3 }}>
            {kb.tags && kb.tags.map(tag => <Chip key={tag} label={tag} size="small" />)}
        </Box>
        <Typography variant="overline" color="text.secondary">Content</Typography>
        <Box className="border rounded p-3 mb-4 bg-light">
           <MarkdownRenderer content={kb.content} />
        </Box>
        
        {kb.resolution && (
            <>
                <Typography variant="overline" color="text.secondary">Resolution</Typography>
                <Box className="border rounded p-3 bg-light">
                   <MarkdownRenderer content={kb.resolution} />
                </Box>
            </>
        )}
      </Paper>
    </div>
  );
}

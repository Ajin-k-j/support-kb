
'use client';

import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { collection, onSnapshot, query } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { createTicket } from '@/lib/firestore';
import { listenToAllUsers } from '@/lib/users';
import { EditorContent, useEditor, Editor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { Table } from '@tiptap/extension-table';
import { TableRow } from '@tiptap/extension-table-row';
import { TableCell } from '@tiptap/extension-table-cell';
import { TableHeader } from '@tiptap/extension-table-header';
import { CodeBlock } from '@tiptap/extension-code-block';
import Image from '@tiptap/extension-image';
import Loader from '@/components/Loader';
import { UserData, InvestigationEntry } from '@/types';
import {
  Button, TextField, Select, MenuItem, FormControl, InputLabel, Chip, Box, Typography, IconButton, Paper, Avatar
} from '@mui/material';
import {
  FormatBold, FormatItalic, FormatListBulleted, FormatListNumbered,
  Code as CodeIcon, TableChart as TableIcon, Image as ImageIcon,
} from '@mui/icons-material';

const ticketSchema = z.object({
  ticketNumber: z.string().min(1, 'Ticket ID is required').regex(/^[a-zA-Z0-9]+$/, 'Ticket ID must be alphanumeric'),
  title: z.string().min(1, 'Title is required'),
  customerDescription: z.string().optional(),
  supportDescription: z.string().optional(),
  category: z.string().min(1, 'Category is required'),
  status: z.enum(['Open', 'InProgress', 'Pending', 'Resolved', 'Closed']),
  businessImpact: z.enum(['Low', 'Medium', 'High', 'Critical']),
  supportingLinks: z.string().optional(),
});

type TicketForm = z.infer<typeof ticketSchema>;

const Toolbar = ({ editor }: { editor: Editor | null }) => {
  if (!editor) return null;

  const addImage = () => {
    const url = prompt('Enter image URL');
    if (url) {
      editor.chain().focus().setImage({ src: url }).run();
    }
  };

  const addTable = () => {
    const rows = prompt('Enter number of rows:', '3');
    if (!rows) return;
    const cols = prompt('Enter number of columns:', '3');
    if (!cols) return;

    const numRows = parseInt(rows, 10);
    const numCols = parseInt(cols, 10);

    if (!isNaN(numRows) && !isNaN(numCols) && numRows > 0 && numCols > 0) {
      editor.chain().focus().insertTable({ rows: numRows, cols: numCols, withHeaderRow: true }).run();
    } else {
      alert('Please enter valid, positive numbers for rows and columns.');
    }
  };

  return (
    <Box sx={{ p: 0.5, borderBottom: '1px solid #dee2e6' }}>
      <IconButton size="small" onClick={() => editor.chain().focus().toggleBold().run()} color={editor.isActive('bold') ? 'primary' : 'default'}><FormatBold fontSize="small" /></IconButton>
      <IconButton size="small" onClick={() => editor.chain().focus().toggleItalic().run()} color={editor.isActive('italic') ? 'primary' : 'default'}><FormatItalic fontSize="small" /></IconButton>
      <IconButton size="small" onClick={() => editor.chain().focus().toggleBulletList().run()} color={editor.isActive('bulletList') ? 'primary' : 'default'}><FormatListBulleted fontSize="small" /></IconButton>
      <IconButton size="small" onClick={() => editor.chain().focus().toggleOrderedList().run()} color={editor.isActive('orderedList') ? 'primary' : 'default'}><FormatListNumbered fontSize="small" /></IconButton>
      <IconButton size="small" onClick={addTable}><TableIcon fontSize="small" /></IconButton>
      <IconButton size="small" onClick={() => editor.chain().focus().toggleCodeBlock().run()} color={editor.isActive('codeBlock') ? 'primary' : 'default'}><CodeIcon fontSize="small" /></IconButton>
      <IconButton size="small" onClick={addImage}><ImageIcon fontSize="small" /></IconButton>
    </Box>
  );
};

export default function NewTicket() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [allUsers, setAllUsers] = useState<UserData[]>([]);
  const [assignedUsers, setAssignedUsers] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [investigationLog, setInvestigationLog] = useState<InvestigationEntry[]>([]);
  const [logType, setLogType] = useState('');
  const [categories, setCategories] = useState<string[]>([]);
  const [logTypes, setLogTypes] = useState<string[]>([]);
  const [isLoadingTypes, setIsLoadingTypes] = useState(true);
  const [typeError, setTypeError] = useState<string | null>(null);

  const { register, handleSubmit, formState: { errors }, setValue } = useForm<TicketForm>({
    resolver: zodResolver(ticketSchema),
    defaultValues: {
      status: 'Open',
      businessImpact: 'Low',
      category: '',
      supportingLinks: '',
    },
  });

  const editorConfig = {
    extensions: [
      StarterKit,
      Table.configure({ resizable: true }),
      TableRow,
      TableCell,
      TableHeader,
      CodeBlock,
      Image.configure({ inline: true }),
    ],
    content: '',
    immediatelyRender: false,
  };

  const customerEditor = useEditor({ ...editorConfig, onUpdate: ({ editor }) => setValue('customerDescription', editor.getHTML()) });
  const supportEditor = useEditor({ ...editorConfig, onUpdate: ({ editor }) => setValue('supportDescription', editor.getHTML()) });
  const logEditor = useEditor({ ...editorConfig });

  useEffect(() => {
    if (!loading && !user) router.push('/login');
  }, [user, loading, router]);

  useEffect(() => {
    if (user) {
      setAssignedUsers([user.uid]);
      const unsubscribe = listenToAllUsers(setAllUsers);
      return () => unsubscribe();
    }
  }, [user]);

  useEffect(() => {
    const unsubscribeCategories = onSnapshot(
      query(collection(db, 'ticketCategories')),
      (snapshot) => {
        const cats = snapshot.docs.map((doc) => doc.data().name as string);
        setCategories(cats);
        if (cats.length > 0 && !categories.includes('')) setValue('category', cats[0]);
        setIsLoadingTypes(false);
      },
      (err) => {
        console.error('Error fetching categories:', err);
        setTypeError('Failed to fetch categories');
        setIsLoadingTypes(false);
      }
    );

    const unsubscribeLogTypes = onSnapshot(
      query(collection(db, 'investigationLogTypes')),
      (snapshot) => {
        const types = snapshot.docs.map((doc) => doc.data().name as string);
        setLogTypes(types);
        if (types.length > 0) setLogType(types[0]);
        setIsLoadingTypes(false);
      },
      (err) => {
        console.error('Error fetching log types:', err);
        setTypeError('Failed to fetch log types');
        setIsLoadingTypes(false);
      }
    );

    return () => {
      unsubscribeCategories();
      unsubscribeLogTypes();
    };
  }, [setValue]);

  if (loading || isLoadingTypes) return <div className="text-center py-5"><Loader /></div>;
  if (!user) return null;
  if (typeError) return <div className="container py-5"><div className="alert alert-danger">{typeError}</div></div>;

  const filteredUsers = allUsers.filter(u => u.displayName?.toLowerCase().includes(searchTerm.toLowerCase()) && !assignedUsers.includes(u.uid));
  const addUser = (uid: string) => { setAssignedUsers([...assignedUsers, uid]); setSearchTerm(''); };
  const removeUser = (uid: string) => setAssignedUsers(assignedUsers.filter(id => id !== uid));

  const addLogEntry = () => {
    if (logEditor && logType) {
      const description = logEditor.getHTML();
      if (description && description !== '<p></p>') {
        setInvestigationLog([...investigationLog, {
          type: logType,
          description,
          timestamp: new Date().toISOString(),
          userId: user.uid,
        }]);
        logEditor.commands.clearContent();
      }
    }
  };

  const removeLogEntry = (index: number) => setInvestigationLog(investigationLog.filter((_, i) => i !== index));

  const onSubmit = async (data: TicketForm) => {
    try {
      setError(null);
      setIsSubmitting(true);
      await createTicket({
        ...data,
        assignedTo: user.uid,
        assignedUsers,
        supportingLinks: data.supportingLinks?.split('\n').map(l => l.trim()).filter(Boolean) || [],
        investigationLog,
      });
      router.push('/dashboard');
    } catch (err: any) {
      setError('Failed to create ticket: ' + err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container py-2">
      <style jsx global>{`
        .ProseMirror { outline: none; padding: 12px; min-height: 150px; line-height: 1.5; }
        .ProseMirror table { border-collapse: collapse; width: 100%; }
        .ProseMirror td, .ProseMirror th { border: 1px solid #ccc; padding: 4px; }
        .ProseMirror pre { background: #f5f5f5; padding: 8px; border-radius: 4px; }
        .ProseMirror p { margin: 0; }
      `}</style>
      <h2 className="mb-3 text-gray-800">Create New Ticket</h2>
      <form onSubmit={handleSubmit(onSubmit)} className="card p-3 shadow-sm border-0 rounded-lg">
        {error && <div className="alert alert-danger mb-3">{error}</div>}

        {/* Section: Ticket Details */}
        <div className="mb-4 border-bottom pb-3">
          <h3 className="mb-2 text-gray-700 font-weight-semibold">Ticket Details</h3>
          <div className="row g-3">
            <div className="col-md-6">
              <label className="form-label text-gray-600">Ticket ID</label>
              <input {...register('ticketNumber')} className="form-control rounded-lg" style={{ padding: '0.75rem' }} />
              {errors.ticketNumber && <div className="text-danger text-sm">{errors.ticketNumber.message}</div>}
            </div>
            <div className="col-md-6">
              <label className="form-label text-gray-600">Title</label>
              <input {...register('title')} className="form-control rounded-lg" style={{ padding: '0.75rem' }} />
              {errors.title && <div className="text-danger text-sm">{errors.title.message}</div>}
            </div>
          </div>
          <div className="row g-3 mt-2">
            <div className="col-md-4">
              <FormControl fullWidth size="small">
                <InputLabel>Category</InputLabel>
                <Select {...register('category')} label="Category" defaultValue={categories[0] || ''} sx={{ borderRadius: '0.5rem' }}>
                  {categories.map((cat) => (
                    <MenuItem key={cat} value={cat}>{cat}</MenuItem>
                  ))}
                </Select>
                {errors.category && <Typography color="error" variant="caption">{errors.category.message}</Typography>}
              </FormControl>
            </div>
            <div className="col-md-4">
              <FormControl fullWidth size="small">
                <InputLabel>Status</InputLabel>
                <Select {...register('status')} label="Status" defaultValue="Open" sx={{ borderRadius: '0.5rem' }}>
                  <MenuItem value="Open">Open</MenuItem>
                  <MenuItem value="InProgress">In Progress</MenuItem>
                  <MenuItem value="Pending">Pending</MenuItem>
                  <MenuItem value="Resolved">Resolved</MenuItem>
                  <MenuItem value="Closed">Closed</MenuItem>
                </Select>
                {errors.status && <Typography color="error" variant="caption">{errors.status.message}</Typography>}
              </FormControl>
            </div>
            <div className="col-md-4">
              <FormControl fullWidth size="small">
                <InputLabel>Business Impact</InputLabel>
                <Select {...register('businessImpact')} label="Business Impact" defaultValue="Low" sx={{ borderRadius: '0.5rem' }}>
                  <MenuItem value="Low">Low</MenuItem>
                  <MenuItem value="Medium">Medium</MenuItem>
                  <MenuItem value="High">High</MenuItem>
                  <MenuItem value="Critical">Critical</MenuItem>
                </Select>
                {errors.businessImpact && <Typography color="error" variant="caption">{errors.businessImpact.message}</Typography>}
              </FormControl>
            </div>
          </div>
          <div className="mt-3">
            <label className="form-label text-gray-600">Customer Description</label>
            <div className="border rounded bg-white"><Toolbar editor={customerEditor} /><EditorContent editor={customerEditor} /></div>
          </div>
          <div className="mt-3">
            <label className="form-label text-gray-600">Support Description</label>
            <div className="border rounded bg-white"><Toolbar editor={supportEditor} /><EditorContent editor={supportEditor} /></div>
          </div>
        </div>

        {/* Section: Collaboration */}
        <div className="mb-4 border-bottom pb-3">
          <h3 className="mb-2 text-gray-700 font-weight-semibold">Collaboration</h3>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2 }}>
            {assignedUsers.map(uid => {
              const u = allUsers.find(us => us.uid === uid);
              return u ? <Chip key={uid} label={u.displayName || 'Unknown User'} onDelete={() => removeUser(uid)} sx={{ bgcolor: '#e0e7ff', color: '#111827', '& .MuiChip-deleteIcon': { color: '#4f46e5' } }} /> : null;
            })}
          </Box>
          <TextField label="Search users..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} fullWidth variant="outlined" size="small" sx={{ borderRadius: '0.5rem' }} />
          <Box sx={{ maxHeight: 128, overflowY: 'auto', bgcolor: '#ffffff', border: '1px solid #e5e7eb', borderRadius: 1, mt: 1 }}>
            {filteredUsers.map(u => (
              <Box key={u.uid} sx={{ p: 1, '&:hover': { bgcolor: '#f3f4f6', cursor: 'pointer' } }} onClick={() => addUser(u.uid)}>
                {u.displayName || 'Unknown User'}
              </Box>
            ))}
          </Box>
        </div>

        {/* Section: Supporting Links */}
        <div className="mb-4 border-bottom pb-3">
          <label className="form-label text-gray-600">Supporting Links (one per line, optional)</label>
          <textarea {...register('supportingLinks')} className="form-control rounded-lg" rows={3} style={{ padding: '0.75rem', minHeight: '100px', resize: 'vertical' }}></textarea>
        </div>

        {/* Section: Investigation Log */}
        <div className="mb-4">
          <div className="d-flex justify-content-between align-items-center mb-2">
            <h3 className="mb-0 text-gray-700 font-weight-semibold">Investigation Log</h3>
            <div className="d-flex gap-3 align-items-center">
              <FormControl size="small" sx={{ minWidth: 120 }}>
                <InputLabel>Type</InputLabel>
                <Select value={logType} onChange={(e) => setLogType(e.target.value)} label="Type">
                  {logTypes.map((type) => (
                    <MenuItem key={type} value={type}>{type}</MenuItem>
                  ))}
                </Select>
              </FormControl>
              <button type="button" onClick={addLogEntry} className="btn btn-primary rounded-lg">Add Entry</button>
            </div>
          </div>
          <div className="border rounded bg-white">
            <Toolbar editor={logEditor} />
            <EditorContent editor={logEditor} />
          </div>
          <div className="mt-3">
            {investigationLog.map((entry, index) => (
              <div key={index} className="mb-2 p-2 border rounded bg-gray-50 d-flex justify-content-between align-items-start">
                <div>
                  <p className="text-sm text-gray-600"><strong>{entry.type}</strong> by {allUsers.find(u => u.uid === entry.userId)?.displayName || '...'} at {new Date(entry.timestamp).toLocaleString()}</p>
                  <p className="text-sm" dangerouslySetInnerHTML={{ __html: entry.description }} style={{ lineHeight: '1.4' }}></p>
                </div>
                <button type="button" onClick={() => removeLogEntry(index)} className="btn btn-sm btn-outline-danger">Remove</button>
              </div>
            ))}
          </div>
        </div>

        {/* Section: Action Buttons */}
        <div className="d-flex justify-content-end gap-3">
          <button type="button" onClick={() => router.push('/dashboard')} className="btn btn-outline-secondary rounded-lg" style={{ padding: '0.75rem 1.5rem' }}>Close</button>
          <button type="submit" className="btn btn-primary rounded-lg" disabled={isSubmitting} style={{ padding: '0.75rem 1.5rem', background: 'linear-gradient(to right, #4f46e5, #6366f1)', color: '#ffffff' }}>
            {isSubmitting ? <Loader /> : 'Save Entry'}
          </button>
        </div>
      </form>
    </div>
  );
}
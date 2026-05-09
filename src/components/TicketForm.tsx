'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect, useState } from 'react';
import { EditorContent, useEditor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { Table } from '@tiptap/extension-table';
import { TableRow } from '@tiptap/extension-table-row';
import { TableCell } from '@tiptap/extension-table-cell';
import { TableHeader } from '@tiptap/extension-table-header';
import { CodeBlock } from '@tiptap/extension-code-block';
import Image from '@tiptap/extension-image';
import { useRouter } from 'next/navigation';

import Loader from '@/components/Loader';
import EditorToolbar from '@/components/EditorToolbar';
import { ticketSchema, TicketFormValues } from '@/lib/schemas';
import { UserData, InvestigationEntry } from '@/types';
import { db } from '@/lib/firebase';
import { collection, onSnapshot, query, getDocs } from 'firebase/firestore';

import {
  Button, TextField, Select, MenuItem, FormControl, InputLabel, Chip, Box, Typography, Paper
} from '@mui/material';

interface TicketFormProps {
  initialData?: Partial<TicketFormValues>;
  initialAssignedUsers?: string[];
  initialInvestigationLog?: InvestigationEntry[];
  allUsers: UserData[];
  currentUserUid: string;
  currentUserEmail?: string;
  currentUserName?: string;
  currentUserRole?: 'hduser' | 'admin' | null;
  ticketOwnerId?: string;
  isSubmitting: boolean;
  onSubmit: (data: TicketFormValues, assignedUsers: string[], investigationLog: InvestigationEntry[]) => void;
  onCancel: () => void;
  isEditing?: boolean;
}

export default function TicketForm({
  initialData,
  initialAssignedUsers = [],
  initialInvestigationLog = [],
  allUsers,
  currentUserUid,
  currentUserEmail,
  currentUserName,
  currentUserRole,
  ticketOwnerId,
  isSubmitting,
  onSubmit,
  onCancel,
  isEditing = false,
}: TicketFormProps) {
  const router = useRouter();
  const [isMounted, setIsMounted] = useState(false);
  const [assignedUsers, setAssignedUsers] = useState<string[]>(initialAssignedUsers);
  const [searchTerm, setSearchTerm] = useState('');
  const [investigationLog, setInvestigationLog] = useState<InvestigationEntry[]>(initialInvestigationLog);
  const [logType, setLogType] = useState('');
  const [categories, setCategories] = useState<string[]>([]);
  const [logTypes, setLogTypes] = useState<string[]>([]);
  const [isLoadingTypes, setIsLoadingTypes] = useState(true);
  const [typeError, setTypeError] = useState<string | null>(null);
  const [isCollabActive, setIsCollabActive] = useState(false);

  const { register, handleSubmit, formState: { errors }, setValue, watch, reset } = useForm<TicketFormValues>({
    resolver: zodResolver(ticketSchema),
    defaultValues: {
      status: 'Open',
      businessImpact: 'Low',
      category: '',
      supportingLinks: '',
      aiSummary: '',
      ...initialData,
    },
  });

  const selectedCategory = watch('category');
  const selectedStatus = watch('status');
  const selectedBusinessImpact = watch('businessImpact');

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
    immediatelyRender: false,
  };

  const customerEditor = useEditor({
    ...editorConfig,
    content: initialData?.customerDescription || '',
    onUpdate: ({ editor }) => setValue('customerDescription', editor.getHTML()),
  });

  const supportEditor = useEditor({
    ...editorConfig,
    content: initialData?.supportDescription || '',
    onUpdate: ({ editor }) => setValue('supportDescription', editor.getHTML()),
  });

  const logEditor = useEditor({ ...editorConfig, content: '' });

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (initialData) {
      reset({ ...initialData });
      if (customerEditor && customerEditor.getHTML() !== initialData.customerDescription) {
         customerEditor.commands.setContent(initialData.customerDescription || '');
      }
      if (supportEditor && supportEditor.getHTML() !== initialData.supportDescription) {
         supportEditor.commands.setContent(initialData.supportDescription || '');
      }
    }
  }, [initialData, reset, customerEditor, supportEditor]);

  useEffect(() => {
    if (initialAssignedUsers.length > 0) {
        setAssignedUsers(initialAssignedUsers);
    } else if (!isEditing && currentUserUid) {
        setAssignedUsers([currentUserUid]);
    }
  }, [initialAssignedUsers, currentUserUid, isEditing]);

  useEffect(() => {
    if (initialInvestigationLog.length > 0) {
        setInvestigationLog(initialInvestigationLog);
    }
  }, [initialInvestigationLog]);

  useEffect(() => {
    const unsubscribeCategories = onSnapshot(query(collection(db, 'ticketCategories')),
      (snapshot) => {
        const cats = snapshot.docs.map((doc) => doc.data().name as string);
        setCategories(cats);
        if (cats.length > 0 && !selectedCategory) setValue('category', cats[0]);
      },
      (err) => { console.error('Error fetching categories:', err); setTypeError('Failed to fetch categories'); }
    );

    const unsubscribeLogTypes = onSnapshot(query(collection(db, 'investigationLogTypes')),
      (snapshot) => {
        const types = snapshot.docs.map((doc) => doc.data().name as string);
        setLogTypes(types);
        if (types.length > 0 && !logType) setLogType(types[0]);
      },
      (err) => { console.error('Error fetching log types:', err); setTypeError('Failed to fetch log types'); }
    );

    Promise.all([
      getDocs(query(collection(db, 'ticketCategories'))),
      getDocs(query(collection(db, 'investigationLogTypes')))
    ]).finally(() => setIsLoadingTypes(false));

    return () => {
      unsubscribeCategories();
      unsubscribeLogTypes();
    };
  }, [setValue, selectedCategory, logType]);

  if (isLoadingTypes || !isMounted) return <div className="text-center py-5"><Loader /></div>;
  if (typeError) return <div className="container py-5"><div className="alert alert-danger">{typeError}</div></div>;

  const filteredUsers = allUsers.filter(u => u.displayName?.toLowerCase().includes(searchTerm.toLowerCase()) && !assignedUsers.includes(u.uid));
  const addUser = (uid: string) => { setAssignedUsers([...assignedUsers, uid]); setSearchTerm(''); };
  const removeUser = (uid: string) => setAssignedUsers(assignedUsers.filter(id => id !== uid));

  const addLogEntry = () => {
    if (logEditor && logType) {
      const description = logEditor.getHTML();
      if (description && description !== '<p></p>') {
        setInvestigationLog([...investigationLog, {
          type: logType as InvestigationEntry['type'],
          description,
          timestamp: new Date().toISOString(),
          userId: currentUserUid,
          userName: currentUserName || 'Unknown',
          userEmail: currentUserEmail || 'Unknown',
        }]);
        logEditor.commands.clearContent();
      }
    }
  };

  const removeLogEntry = (index: number) => setInvestigationLog(investigationLog.filter((_, i) => i !== index));

  const handleFormSubmit = (data: TicketFormValues) => {
    onSubmit(data, assignedUsers, investigationLog);
  };

  const canDeleteLog = (entry: InvestigationEntry) => {
    return currentUserRole === 'admin' || currentUserUid === ticketOwnerId || entry.userId === currentUserUid;
  };

  return (
    <>
      <style jsx global>{`
        .ProseMirror { outline: none; padding: 12px; min-height: 150px; line-height: 1.5; }
        .ProseMirror table { border-collapse: collapse; width: 100%; }
        .ProseMirror td, .ProseMirror th { border: 1px solid #ccc; padding: 4px; }
        .ProseMirror pre { background: #f5f5f5; padding: 8px; border-radius: 4px; }
        .ProseMirror p { margin: 0; }
      `}</style>
      
      <form onSubmit={handleSubmit(handleFormSubmit)} className="card p-3 shadow-sm border-0 rounded-lg">
        <div className="mb-4 border-bottom pb-3">
          <h3 className="mb-2 text-gray-700 font-weight-semibold">Ticket Details</h3>
          <div className="row g-3">
            <div className="col-md-6">
              <TextField 
                fullWidth 
                {...register('ticketNumber')} 
                label="Ticket ID" 
                error={!!errors.ticketNumber} 
                helperText={errors.ticketNumber?.message} 
                InputProps={{ readOnly: isEditing }} 
              />
            </div>
            <div className="col-md-6">
              <TextField fullWidth {...register('title')} label="Title" error={!!errors.title} helperText={errors.title?.message} />
            </div>
          </div>
          <div className="row g-3 mt-2">
            <div className="col-md-4">
              <FormControl fullWidth>
                <InputLabel>Category</InputLabel>
                <Select {...register('category')} label="Category" value={selectedCategory || ''}>
                  {categories.map((cat) => ( <MenuItem key={cat} value={cat}>{cat}</MenuItem> ))}
                </Select>
              </FormControl>
            </div>
            <div className="col-md-4">
              <FormControl fullWidth>
                <InputLabel>Status</InputLabel>
                <Select {...register('status')} label="Status" value={selectedStatus || 'Open'}>
                  <MenuItem value="Open">Open</MenuItem>
                  <MenuItem value="InProgress">In Progress</MenuItem>
                  <MenuItem value="Pending">Pending</MenuItem>
                  <MenuItem value="Resolved">Resolved</MenuItem>
                  <MenuItem value="Closed">Closed</MenuItem>
                </Select>
              </FormControl>
            </div>
            <div className="col-md-4">
              <FormControl fullWidth>
                <InputLabel>Business Impact</InputLabel>
                <Select {...register('businessImpact')} label="Business Impact" value={selectedBusinessImpact || 'Low'}>
                  <MenuItem value="Low">Low</MenuItem>
                  <MenuItem value="Medium">Medium</MenuItem>
                  <MenuItem value="High">High</MenuItem>
                  <MenuItem value="Critical">Critical</MenuItem>
                </Select>
              </FormControl>
            </div>
          </div>
          <div className="mt-3">
            <TextField 
              fullWidth 
              multiline 
              rows={3} 
              {...register('aiSummary')} 
              label="AI Summary (Optional)" 
              placeholder="Provide an AI-generated or brief summary of the issue..." 
            />
          </div>
          <div className="mt-3">
            <label className="form-label text-gray-600">Customer Description</label>
            <div className="border rounded bg-white"><EditorToolbar editor={customerEditor} /><EditorContent editor={customerEditor} /></div>
          </div>
          <div className="mt-3">
            <label className="form-label text-gray-600">Support Description</label>
            <div className="border rounded bg-white"><EditorToolbar editor={supportEditor} /><EditorContent editor={supportEditor} /></div>
          </div>
        </div>

        <div className="mb-4 border-bottom pb-3">
          <h3 className="mb-2 text-gray-700 font-weight-semibold">Collaboration</h3>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2 }}>
            {assignedUsers.map(uid => {
              const u = allUsers.find(us => us.uid === uid);
              return u ? <Chip key={uid} label={u.displayName || 'Unknown User'} onDelete={() => removeUser(uid)} sx={{ bgcolor: '#e0e7ff', color: '#111827', '& .MuiChip-deleteIcon': { color: '#4f46e5' } }} /> : null;
            })}
          </Box>
          <TextField
            label="Search and add users..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onFocus={() => setIsCollabActive(true)}
            fullWidth
            variant="outlined"
            size="small"
          />
          {isCollabActive && (
            <Paper sx={{ maxHeight: 128, overflowY: 'auto', border: '1px solid #e5e7eb', mt: 1 }}>
              {filteredUsers.map(u => (
                <MenuItem key={u.uid} onClick={() => addUser(u.uid)}>
                   {u.displayName || 'Unknown User'}
                </MenuItem>
              ))}
              {filteredUsers.length === 0 && searchTerm && <Typography sx={{p: 2, color: 'text.secondary'}}>No users found.</Typography>}
            </Paper>
          )}
        </div>

        <div className="mb-4 border-bottom pb-3">
          <label className="form-label text-gray-600">Supporting Links (one per line, optional)</label>
          <textarea {...register('supportingLinks')} className="form-control rounded-lg" rows={3} style={{ padding: '0.75rem', minHeight: '100px', resize: 'vertical' }}></textarea>
        </div>

        <div className="mb-4">
          <div className="d-flex justify-content-between align-items-center mb-2">
            <h3 className="mb-0 text-gray-700 font-weight-semibold">Investigation Log</h3>
            <div className="d-flex gap-3 align-items-center">
              <FormControl size="small" sx={{ minWidth: 120 }}>
                <InputLabel>Type</InputLabel>
                <Select value={logType} onChange={(e) => setLogType(e.target.value)} label="Type">
                  {logTypes.map((type) => ( <MenuItem key={type} value={type}>{type}</MenuItem> ))}
                </Select>
              </FormControl>
              <button type="button" onClick={addLogEntry} className="btn btn-primary rounded-lg">Add Entry</button>
            </div>
          </div>
          <div className="border rounded bg-white">
            <EditorToolbar editor={logEditor} />
            <EditorContent editor={logEditor} />
          </div>

          <div className="mt-3">
            {[...investigationLog].reverse().map((entry, index) => {
              const originalIndex = investigationLog.length - 1 - index;
              return (
                <div key={originalIndex} className="mb-2 p-3 border rounded bg-gray-50 position-relative">
                  <div className="d-flex justify-content-between align-items-start mb-2">
                    <p className="text-sm text-gray-600 mb-0">
                      <strong>{entry.type}</strong> by {entry.userName || allUsers.find(u => u.uid === entry.userId)?.displayName || '...'} 
                      {entry.userEmail ? ` (${entry.userEmail})` : ''} at {new Date(entry.timestamp).toLocaleString()}
                    </p>
                    <div className="d-flex gap-2">
                      <button 
                        type="button" 
                        onClick={() => {
                            const tempDiv = document.createElement("div");
                            tempDiv.innerHTML = entry.description;
                            navigator.clipboard.writeText(tempDiv.innerText || tempDiv.textContent || "");
                            alert('Log copied to clipboard!');
                        }} 
                        className="btn btn-sm btn-outline-secondary"
                        title="Copy to clipboard"
                      >
                        Copy
                      </button>
                      {canDeleteLog(entry) && (
                        <button type="button" onClick={() => removeLogEntry(originalIndex)} className="btn btn-sm btn-outline-danger">Remove</button>
                      )}
                    </div>
                  </div>
                  <div className="prose-mirror-content border-top pt-2" dangerouslySetInnerHTML={{ __html: entry.description }} />
                </div>
              );
            })}
          </div>
        </div>
        
        <div className="d-flex justify-content-end gap-3">
          <button type="button" onClick={onCancel} className="btn btn-outline-secondary rounded-lg" style={{ padding: '0.75rem 1.5rem' }}>{isEditing ? 'Cancel' : 'Close'}</button>
          <button type="submit" className="btn btn-primary rounded-lg" disabled={isSubmitting} style={{ padding: '0.75rem 1.5rem', background: 'linear-gradient(to right, #4f46e5, #6366f1)', color: '#ffffff' }}>
            {isSubmitting ? <Loader /> : (isEditing ? 'Save Changes' : 'Save Entry')}
          </button>
        </div>
      </form>
    </>
  );
}

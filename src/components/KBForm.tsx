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

import Loader from '@/components/Loader';
import EditorToolbar from '@/components/EditorToolbar';
import { kbSchema, KBFormValues } from '@/lib/schemas';
import { TextField } from '@mui/material';

interface KBFormProps {
  initialData?: Partial<KBFormValues>;
  isSubmitting: boolean;
  onSubmit: (data: KBFormValues) => void;
  onCancel: () => void;
  isEditing?: boolean;
}

export default function KBForm({
  initialData,
  isSubmitting,
  onSubmit,
  onCancel,
  isEditing = false,
}: KBFormProps) {
  const [isMounted, setIsMounted] = useState(false);

  const { register, handleSubmit, formState: { errors }, setValue, reset } = useForm<KBFormValues>({
    resolver: zodResolver(kbSchema),
    defaultValues: {
      subject: '',
      tags: '',
      ...initialData,
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
    immediatelyRender: false,
  };

  const contentEditor = useEditor({
    ...editorConfig,
    content: initialData?.content || '',
    onUpdate: ({ editor }) => setValue('content', editor.getHTML()),
  });

  const resolutionEditor = useEditor({
    ...editorConfig,
    content: initialData?.resolution || '',
    onUpdate: ({ editor }) => setValue('resolution', editor.getHTML()),
  });

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (initialData) {
      reset({ ...initialData });
      if (contentEditor && contentEditor.getHTML() !== initialData.content) {
         contentEditor.commands.setContent(initialData.content || '');
      }
      if (resolutionEditor && resolutionEditor.getHTML() !== initialData.resolution) {
         resolutionEditor.commands.setContent(initialData.resolution || '');
      }
    }
  }, [initialData, reset, contentEditor, resolutionEditor]);

  if (!isMounted) return <div className="text-center py-5"><Loader /></div>;

  return (
    <>
      <style jsx global>{`
        .ProseMirror { outline: none; padding: 12px; min-height: 150px; line-height: 1.5; }
        .ProseMirror table { border-collapse: collapse; width: 100%; }
        .ProseMirror td, .ProseMirror th { border: 1px solid #ccc; padding: 4px; }
        .ProseMirror pre { background: #f5f5f5; padding: 8px; border-radius: 4px; }
        .ProseMirror p { margin: 0; }
      `}</style>
      
      <form onSubmit={handleSubmit(onSubmit)} className="card p-3 shadow-sm border-0 rounded-lg">
        <div className="mb-4 border-bottom pb-3">
          <h3 className="mb-2 text-gray-700 font-weight-semibold">Knowledge Base Entry</h3>
          <div className="row g-3">
            <div className="col-12">
              <TextField 
                fullWidth 
                {...register('subject')} 
                label="Subject" 
                error={!!errors.subject} 
                helperText={errors.subject?.message} 
              />
            </div>
            <div className="col-12">
              <TextField 
                fullWidth 
                {...register('tags')} 
                label="Tags (comma separated)" 
                error={!!errors.tags} 
                helperText={errors.tags?.message} 
                placeholder="e.g. error, database, login"
              />
            </div>
          </div>

          <div className="mt-3">
            <label className="form-label text-gray-600">Content <span className="text-danger">*</span></label>
            <div className="border rounded bg-white">
                <EditorToolbar editor={contentEditor} />
                <EditorContent editor={contentEditor} />
            </div>
            {errors.content && <div className="text-danger mt-1 text-sm">{errors.content.message}</div>}
          </div>

          <div className="mt-3">
            <label className="form-label text-gray-600">Resolution (Optional)</label>
            <div className="border rounded bg-white">
                <EditorToolbar editor={resolutionEditor} />
                <EditorContent editor={resolutionEditor} />
            </div>
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

'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect, useState } from 'react';
import { EditorContent, useEditor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { CodeBlock } from '@tiptap/extension-code-block';

import Loader from '@/components/Loader';
import EditorToolbar from '@/components/EditorToolbar';
import { codeSchema, CodeFormValues } from '@/lib/schemas';
import { TextField } from '@mui/material';

interface CodeFormProps {
  initialData?: Partial<CodeFormValues>;
  isSubmitting: boolean;
  onSubmit: (data: CodeFormValues) => void;
  onCancel: () => void;
  isEditing?: boolean;
}

export default function CodeForm({
  initialData,
  isSubmitting,
  onSubmit,
  onCancel,
  isEditing = false,
}: CodeFormProps) {
  const [isMounted, setIsMounted] = useState(false);

  const { register, handleSubmit, formState: { errors }, setValue, watch, reset } = useForm<CodeFormValues>({
    resolver: zodResolver(codeSchema),
    defaultValues: {
      subject: '',
      language: 'typescript',
      tags: '',
      useCase: '',
      ...initialData,
    },
  });

  const editorConfig = {
    extensions: [
      StarterKit,
      CodeBlock,
    ],
    immediatelyRender: false,
  };

  const contentEditor = useEditor({
    ...editorConfig,
    content: initialData?.content || '',
    onUpdate: ({ editor }) => setValue('content', editor.getHTML()),
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
    }
  }, [initialData, reset, contentEditor]);

  if (!isMounted) return <div className="text-center py-5"><Loader /></div>;

  return (
    <>
      <style jsx global>{`
        .ProseMirror { outline: none; padding: 12px; min-height: 150px; line-height: 1.5; }
        .ProseMirror pre { background: #1e1e1e; color: #d4d4d4; padding: 12px; border-radius: 4px; font-family: monospace; }
        .ProseMirror p { margin: 0; }
      `}</style>
      
      <form onSubmit={handleSubmit(onSubmit)} className="card p-3 shadow-sm border-0 rounded-lg">
        <div className="mb-4 border-bottom pb-3">
          <h3 className="mb-2 text-gray-700 font-weight-semibold">Code Snippet</h3>
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
            <div className="col-md-6">
              <TextField 
                fullWidth 
                {...register('language')} 
                label="Language" 
                error={!!errors.language} 
                helperText={errors.language?.message || "e.g. typescript, python"} 
              />
            </div>
            <div className="col-md-6">
              <TextField 
                fullWidth 
                {...register('tags')} 
                label="Tags (comma separated)" 
                error={!!errors.tags} 
                helperText={errors.tags?.message} 
              />
            </div>
            <div className="col-12">
               <TextField 
                fullWidth 
                {...register('useCase')} 
                label="Use Case" 
                error={!!errors.useCase} 
                helperText={errors.useCase?.message} 
                multiline
                rows={2}
              />
            </div>
          </div>

          <div className="mt-3">
            <label className="form-label text-gray-600">Code Content <span className="text-danger">*</span></label>
            <div className="border rounded bg-white">
                <EditorToolbar editor={contentEditor} />
                <EditorContent editor={contentEditor} />
            </div>
            {errors.content && <div className="text-danger mt-1 text-sm">{errors.content.message}</div>}
          </div>
        </div>

        <div className="d-flex justify-content-end gap-3">
          <button type="button" onClick={onCancel} className="btn btn-outline-secondary rounded-lg" style={{ padding: '0.75rem 1.5rem' }}>{isEditing ? 'Cancel' : 'Close'}</button>
          <button type="submit" className="btn btn-primary rounded-lg" disabled={isSubmitting} style={{ padding: '0.75rem 1.5rem', background: 'linear-gradient(to right, #4f46e5, #6366f1)', color: '#ffffff' }}>
            {isSubmitting ? <Loader /> : (isEditing ? 'Save Changes' : 'Save Snippet')}
          </button>
        </div>
      </form>
    </>
  );
}

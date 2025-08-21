'use client';

import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useAuth } from '@/context/AuthContext';
import { sendPasswordResetEmail } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import Link from 'next/link';

const resetSchema = z.object({
  email: z.string().email('Invalid email address'),
});

type ResetForm = z.infer<typeof resetSchema>;

export default function ForgotPassword() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const { register, handleSubmit, formState: { errors } } = useForm<ResetForm>({
    resolver: zodResolver(resetSchema),
  });

  useEffect(() => {
    if (!loading && user) {
      router.push('/dashboard');
    }
  }, [user, loading, router]);

  if (loading) return <div className="text-center py-5">Loading...</div>;
  if (user) return null;

  const onSubmit = async (data: ResetForm) => {
    try {
      setError(null);
      setSuccess(null);
      await sendPasswordResetEmail(auth, data.email);
      setSuccess('Password reset email sent. Check your inbox.');
    } catch (err: any) {
      setError(err.message);
    }
  };

  return (
    <div className="container">
      <div className="row justify-content-center">
        <div className="col-md-6">
          <div className="card shadow-sm p-4">
            <h2 className="text-center mb-4">Reset Password</h2>
            {error && <div className="alert alert-danger">{error}</div>}
            {success && <div className="alert alert-success">{success}</div>}
            <form onSubmit={handleSubmit(onSubmit)} className="d-flex flex-column gap-3">
              <div>
                <label className="form-label">Email</label>
                <input
                  {...register('email')}
                  className="form-control"
                  placeholder="Enter your email"
                />
                {errors.email && <div className="text-danger mt-1">{errors.email.message}</div>}
              </div>
              <button type="submit" className="btn btn-primary">Send Reset Email</button>
            </form>
            <p className="text-center mt-3">
              Back to <Link href="/login" className="text-primary text-decoration-underline">Log In</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
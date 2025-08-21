'use client';

import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useAuth } from '@/context/AuthContext';
import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import Link from 'next/link';

const signupSchema = z.object({
  displayName: z.string().min(1, 'Display name is required'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

type SignupForm = z.infer<typeof signupSchema>;

export default function Signup() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const { register, handleSubmit, formState: { errors } } = useForm<SignupForm>({
    resolver: zodResolver(signupSchema),
  });

  useEffect(() => {
    if (!loading && user) {
      router.push('/dashboard');
    }
  }, [user, loading, router]);

  if (loading) return <div className="text-center py-5">Loading...</div>;
  if (user) return null;

  const onSubmit = async (data: SignupForm) => {
    try {
      setError(null);
      const { user } = await createUserWithEmailAndPassword(auth, data.email, data.password);
      await updateProfile(user, { displayName: data.displayName });
      router.push('/dashboard');
    } catch (err: any) {
      setError(err.message);
    }
  };

  return (
    <div className="container">
      <div className="row justify-content-center">
        <div className="col-md-6">
          <div className="card shadow-sm p-4">
            <h2 className="text-center mb-4">Sign Up</h2>
            {error && <div className="alert alert-danger">{error}</div>}
            <form onSubmit={handleSubmit(onSubmit)} className="d-flex flex-column gap-3">
              <div>
                <label className="form-label">Display Name</label>
                <input
                  {...register('displayName')}
                  className="form-control"
                  placeholder="Enter your name"
                />
                {errors.displayName && <div className="text-danger mt-1">{errors.displayName.message}</div>}
              </div>
              <div>
                <label className="form-label">Email</label>
                <input
                  {...register('email')}
                  className="form-control"
                  placeholder="Enter your email"
                />
                {errors.email && <div className="text-danger mt-1">{errors.email.message}</div>}
              </div>
              <div>
                <label className="form-label">Password</label>
                <input
                  {...register('password')}
                  type="password"
                  className="form-control"
                  placeholder="Enter your password"
                />
                {errors.password && <div className="text-danger mt-1">{errors.password.message}</div>}
              </div>
              <button type="submit" className="btn btn-primary">Sign Up</button>
            </form>
            <p className="text-center mt-3">
              Already have an account? <Link href="/login" className="text-primary text-decoration-underline">Log in</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
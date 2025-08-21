'use client';

import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useAuth } from '@/context/AuthContext';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import Link from 'next/link';

const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

type LoginForm = z.infer<typeof loginSchema>;

export default function Login() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const { register, handleSubmit, formState: { errors } } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
  });

  useEffect(() => {
    if (!loading && user) {
      router.push('/dashboard');
    }
  }, [user, loading, router]);

  if (loading) return <div className="text-center py-5">Loading...</div>;
  if (user) return null;

  const onSubmit = async (data: LoginForm) => {
    try {
      setError(null);
      await signInWithEmailAndPassword(auth, data.email, data.password);
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
            <h2 className="text-center mb-4">Log In</h2>
            {error && <div className="alert alert-danger">{error}</div>}
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
              <button type="submit" className="btn btn-primary">Log In</button>
            </form>
            <p className="text-center mt-3">
              <Link href="/forgot-password" className="text-primary text-decoration-underline">Forgot Password?</Link>
            </p>
            <p className="text-center mt-2">
              Don&apos;t have an account? <Link href="/signup" className="text-primary text-decoration-underline">Sign Up</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
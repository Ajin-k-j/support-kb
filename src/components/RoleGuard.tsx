'use client';

import { useAuth } from '@/context/AuthContext';
import { Box, Typography, CircularProgress, Paper, Container } from '@mui/material';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function RoleGuard({ children, requireAdmin = false }: { children: React.ReactNode, requireAdmin?: boolean }) {
  const { user, userData, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  if (loading || !user) {
    return <Box sx={{ display: 'flex', justifyContent: 'center', p: 5 }}><CircularProgress /></Box>;
  }

  // If we don't have userData yet, wait for it
  if (!userData) {
    return <Box sx={{ display: 'flex', justifyContent: 'center', p: 5 }}><CircularProgress /></Box>;
  }

  // Check if user is null role
  if (!userData.role) {
    return (
      <Container maxWidth="sm" sx={{ mt: 10 }}>
        <Paper elevation={3} sx={{ p: 5, textAlign: 'center', borderRadius: 3 }}>
          <Typography variant="h4" gutterBottom color="primary" sx={{ fontWeight: 'bold' }}>
            Account Pending Approval
          </Typography>
          <Typography variant="body1" color="text.secondary" paragraph>
            Welcome to the Support Knowledge Base! Your account has been created successfully.
          </Typography>
          <Typography variant="body1" color="text.secondary" paragraph>
            However, it is currently waiting for an administrator to review and assign you a role before you can access the system.
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 3, fontStyle: 'italic' }}>
            Please contact your system administrator if you believe this is an error.
          </Typography>
        </Paper>
      </Container>
    );
  }

  // Check if admin is required
  if (requireAdmin && userData.role !== 'admin') {
    return (
      <Container maxWidth="sm" sx={{ mt: 10 }}>
        <Paper elevation={3} sx={{ p: 5, textAlign: 'center', borderRadius: 3 }}>
          <Typography variant="h4" gutterBottom color="error" sx={{ fontWeight: 'bold' }}>
            Access Denied
          </Typography>
          <Typography variant="body1" color="text.secondary">
            You do not have the required permissions to view this page.
          </Typography>
        </Paper>
      </Container>
    );
  }

  return <>{children}</>;
}

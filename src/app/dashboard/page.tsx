'use client';

import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { listenToUserTickets } from '@/lib/firestore';
import { listenToAllUsers } from '@/lib/users';
import { TicketData, UserData } from '@/types';
import TicketTable from '@/components/TicketTable';
import Loader from '@/components/Loader';

import { Box, Typography, Button, Paper } from '@mui/material';
import { Add as AddIcon } from '@mui/icons-material';
import Link from 'next/link';

export default function Dashboard() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [tickets, setTickets] = useState<TicketData[]>([]);
  const [allUsers, setAllUsers] = useState<UserData[]>([]);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  useEffect(() => {
    if (user) {
      const unsubscribeTickets = listenToUserTickets(user.uid, setTickets);
      const unsubscribeUsers = listenToAllUsers(setAllUsers);
      
      return () => {
        unsubscribeTickets();
        unsubscribeUsers();
      };
    }
  }, [user]);

  if (!isClient || loading || (user && allUsers.length === 0)) {
     return <Box sx={{ display: 'flex', justifyContent: 'center', p: 5 }}><Loader /></Box>;
  }
  
  if (!user) return null;

  return (
    // CHANGE: Removed maxWidth and mx properties to make the layout full-width.
    <Box sx={{ p: 3 }}>
      <Paper elevation={2} sx={{ p: 3, borderRadius: 2 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h4" component="h1">
            My Ticket Entries
          </Typography>
          <Link href="/tickets/new" passHref>
            <Button variant="contained" startIcon={<AddIcon />}>
              Create New Ticket
            </Button>
          </Link>
        </Box>
        <TicketTable tickets={tickets} allUsers={allUsers} />
      </Paper>
    </Box>
  );
}
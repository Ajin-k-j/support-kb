'use client';

import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { listenToUserTickets, listenToUserKBs, listenToUserCodeSnippets } from '@/lib/firestore';
import { listenToAllUsers } from '@/lib/users';
import { TicketData, UserData, KBData, CodeSnippetData } from '@/types';
import TicketTable from '@/components/TicketTable';
import KBTable from '@/components/KBTable';
import CodeTable from '@/components/CodeTable';
import Loader from '@/components/Loader';

import { Box, Typography, Button, Paper, Tabs, Tab } from '@mui/material';
import { Add as AddIcon } from '@mui/icons-material';
import Link from 'next/link';

import RoleGuard from '@/components/RoleGuard';

export default function Dashboard() {
  const { user, loading } = useAuth();
  const router = useRouter();
  
  const [tickets, setTickets] = useState<TicketData[]>([]);
  const [kbs, setKbs] = useState<KBData[]>([]);
  const [codes, setCodes] = useState<CodeSnippetData[]>([]);
  const [allUsers, setAllUsers] = useState<UserData[]>([]);
  
  const [isClient, setIsClient] = useState(false);
  const [tabIndex, setTabIndex] = useState(0);

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (user) {
      const unsubscribeTickets = listenToUserTickets(user.uid, setTickets);
      const unsubscribeKBs = listenToUserKBs(user.uid, setKbs);
      const unsubscribeCodes = listenToUserCodeSnippets(user.uid, setCodes);
      const unsubscribeUsers = listenToAllUsers(setAllUsers);
      
      return () => {
        unsubscribeTickets();
        unsubscribeKBs();
        unsubscribeCodes();
        unsubscribeUsers();
      };
    }
  }, [user]);

  if (!isClient || loading || (user && allUsers.length === 0)) {
     return <Box sx={{ display: 'flex', justifyContent: 'center', p: 5 }}><Loader /></Box>;
  }
  
  if (!user) return null;

  return (
    <RoleGuard>
      <Box sx={{ p: 3 }}>
        <Paper elevation={2} sx={{ p: 3, borderRadius: 2 }}>
          
          <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
            <Tabs value={tabIndex} onChange={(_, newValue) => setTabIndex(newValue)}>
              <Tab label="My Tickets" />
              <Tab label="My Knowledge Base" />
              <Tab label="My Code Snippets" />
            </Tabs>
          </Box>

          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
            <Typography variant="h4" component="h1">
              {tabIndex === 0 && 'My Ticket Entries'}
              {tabIndex === 1 && 'My Knowledge Base'}
              {tabIndex === 2 && 'My Code Snippets'}
            </Typography>
            
            {tabIndex === 0 && (
              <Link href="/tickets/new" passHref>
                <Button variant="contained" startIcon={<AddIcon />}>Create New Ticket</Button>
              </Link>
            )}
            {tabIndex === 1 && (
              <Link href="/kb/new" passHref>
                <Button variant="contained" startIcon={<AddIcon />}>Create New KB</Button>
              </Link>
            )}
            {tabIndex === 2 && (
              <Link href="/code/new" passHref>
                <Button variant="contained" startIcon={<AddIcon />}>Create New Snippet</Button>
              </Link>
            )}
          </Box>
          
          {tabIndex === 0 && <TicketTable tickets={tickets} allUsers={allUsers} />}
          {tabIndex === 1 && <KBTable kbs={kbs} />}
          {tabIndex === 2 && <CodeTable codes={codes} />}
          
        </Paper>
      </Box>
    </RoleGuard>
  );
}
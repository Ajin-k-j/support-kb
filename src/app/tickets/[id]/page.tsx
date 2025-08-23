'use client';

import { useEffect, useState, use } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { collection, query, where, getDocs, doc, onSnapshot, Timestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { listenToAllUsers } from '@/lib/users';
import Loader from '@/components/Loader';
import { TicketData, UserData } from '@/types';

import {
    Paper, Typography, Chip, Box, Avatar, Tooltip,
    List, ListItem, ListItemIcon, ListItemText, Button, Link as MuiLink,
    Accordion, AccordionSummary, AccordionDetails
} from '@mui/material';
import {
    Edit as EditIcon, Link as LinkIcon, ExpandMore as ExpandMoreIcon
} from '@mui/icons-material';

export default function TicketView({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);

    // useAuth is still needed to conditionally show the "Edit" button
    const { user, loading: authLoading } = useAuth();
    const router = useRouter();
    const [ticket, setTicket] = useState<TicketData | null>(null);
    const [allUsers, setAllUsers] = useState<UserData[]>([]);
    const [error, setError] = useState<string | null>(null);
    const [expandedAccordions, setExpandedAccordions] = useState<string[]>([]);

    // **CHANGE 1:** This effect now ONLY fetches user data if a user is logged in.
    // It no longer blocks the page for non-logged-in users.
    useEffect(() => {
        if (user) {
            const unsubscribe = listenToAllUsers(setAllUsers);
            return () => unsubscribe();
        }
    }, [user]);
    
    // Set the initially expanded accordion when the ticket data loads
    useEffect(() => {
        if (ticket?.investigationLog && ticket.investigationLog.length > 0) {
            const newestEntryTimestamp = ticket.investigationLog[ticket.investigationLog.length - 1].timestamp;
            setExpandedAccordions([newestEntryTimestamp]);
        }
    }, [ticket]); 

    // **CHANGE 2:** This effect now fetches the ticket data for EVERYONE.
    // The dependency on `user` has been removed.
    useEffect(() => {
        if (id) {
            const ticketsRef = collection(db, 'ticketResolutions');
            const q = query(ticketsRef, where("ticketNumber", "==", id));

            getDocs(q).then(querySnapshot => {
                if (querySnapshot.empty) {
                    setError('Ticket not found');
                    return;
                }
                const ticketDoc = querySnapshot.docs[0];
                const ticketRef = doc(db, 'ticketResolutions', ticketDoc.id);

                const unsubscribe = onSnapshot(ticketRef, (doc) => {
                    if (doc.exists()) {
                        setTicket({ id: doc.id, ...doc.data() } as TicketData);
                    } else {
                        setError('Ticket not found');
                    }
                }, (err) => {
                    setError('Failed to fetch ticket: ' + err.message);
                });
                return unsubscribe;
            }).catch(err => {
                setError('Error querying for ticket: ' + err.message);
            });
        }
    }, [id]);

    const getStatusChipColor = (status: string) => {
        switch (status) {
            case 'Open': return 'info';
            case 'InProgress': return 'warning';
            case 'Resolved':
            case 'Closed': return 'success';
            default: return 'default';
        }
    };

    const formatUrl = (url: string) => {
        if (!url.startsWith('http://') && !url.startsWith('https://')) {
            return `//${url}`;
        }
        return url;
    };
    
    const handleAccordionChange = (panelId: string) => (event: React.SyntheticEvent, isExpanded: boolean) => {
        setExpandedAccordions(prev => isExpanded ? [...prev, panelId] : prev.filter(id => id !== panelId));
    };
    
    const formatDate = (dateValue: any): string => {
        if (!dateValue) return 'N/A';
        if (dateValue instanceof Timestamp) {
            return dateValue.toDate().toLocaleString();
        }
        const date = new Date(dateValue);
        return isNaN(date.getTime()) ? 'Invalid Date' : date.toLocaleString();
    };


    if (authLoading || (!ticket && !error)) {
        return <Box sx={{ display: 'flex', justifyContent: 'center', p: 5 }}><Loader /></Box>;
    }
    if (error) return <Typography color="error" sx={{ textAlign: 'center', p: 5 }}>{error}</Typography>;
    if (!ticket) return null; // Should not happen if error case is handled, but good for safety

    return (
        <div className="container py-2">
             <style jsx global>{`
                .prose-mirror-content p { margin: 0; line-height: 1.5; }
                .prose-mirror-content table { border-collapse: collapse; width: 100%; }
                .prose-mirror-content td, .prose-mirror-content th { border: 1px solid #ccc; padding: 4px; }
                .prose-mirror-content pre { background: #f5f5f5; padding: 8px; border-radius: 4px; white-space: pre-wrap; }
            `}</style>
            <div className="d-flex justify-content-between align-items-center mb-3">
                 <h2 className="mb-0 text-gray-800">View Ticket</h2>
                 {/* **CHANGE 3:** The Edit button is now only shown to logged-in users */}
                 {user && (
                    <Button
                        variant="contained"
                        startIcon={<EditIcon />}
                        onClick={() => router.push(`/tickets/${ticket.ticketNumber}/edit`)}
                    >
                        Edit Ticket
                    </Button>
                 )}
            </div>

            <div className="card p-3 shadow-sm border-0 rounded-lg">
                <div className="mb-4 border-bottom pb-3">
                    <h3 className="mb-3 text-gray-700 font-weight-semibold">Ticket Details</h3>
                    <div className="row g-3 mb-4">
                        <div className="col-md-6"><label className="form-label text-gray-500 small text-uppercase">Ticket ID</label><p className="fw-bold">{ticket.ticketNumber}</p></div>
                        <div className="col-md-6"><label className="form-label text-gray-500 small text-uppercase">Title</label><p>{ticket.title}</p></div>
                    </div>
                     <div className="row g-3">
                         <div className="col-md-4"><Paper variant="outlined" sx={{ p: 2, height: '100%' }}><Typography variant="overline" color="text.secondary" display="block">Status</Typography><Box><Chip label={ticket.status} color={getStatusChipColor(ticket.status)} /></Box></Paper></div>
                         <div className="col-md-4"><Paper variant="outlined" sx={{ p: 2, height: '100%' }}><Typography variant="overline" color="text.secondary" display="block">Business Impact</Typography><Typography variant="h6">{ticket.businessImpact}</Typography></Paper></div>
                         <div className="col-md-4"><Paper variant="outlined" sx={{ p: 2, height: '100%' }}><Typography variant="overline" color="text.secondary" display="block">Category</Typography><Typography variant="h6">{ticket.category}</Typography></Paper></div>
                     </div>
                     <div className="row g-3 mt-3">
                        <div className="col-md-6"><Paper variant="outlined" sx={{ p: 2, height: '100%' }}><Typography variant="overline" color="text.secondary" display="block">Created On</Typography><Typography variant="body1">{formatDate(ticket.createdAt)}</Typography></Paper></div>
                        <div className="col-md-6"><Paper variant="outlined" sx={{ p: 2, height: '100%' }}><Typography variant="overline" color="text.secondary" display="block">Last Modified</Typography><Typography variant="body1">{formatDate(ticket.lastModified)}</Typography></Paper></div>
                     </div>
                     <div className="mt-4"><label className="form-label text-gray-600 fw-bold">Customer Description</label><div className="border rounded p-3 bg-white prose-mirror-content" dangerouslySetInnerHTML={{ __html: ticket.customerDescription || '<em>No description provided.</em>' }} /></div>
                     <div className="mt-3"><label className="form-label text-gray-600 fw-bold">Support Description</label><div className="border rounded p-3 bg-white prose-mirror-content" dangerouslySetInnerHTML={{ __html: ticket.supportDescription || '<em>No description provided.</em>' }} /></div>
                </div>

                <div className="mb-4 border-bottom pb-3">
                    <h3 className="mb-3 text-gray-700 font-weight-semibold">Collaboration</h3>
                     <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                         {ticket.assignedUsers.map(uid => {
                             const assignedUser = allUsers.find(u => u.uid === uid);
                             return (<Tooltip title={assignedUser?.displayName || 'Unknown User'} key={uid}><Chip avatar={<Avatar src={assignedUser?.photoURL}>{assignedUser?.displayName?.charAt(0)}</Avatar>} label={assignedUser?.displayName || 'Unknown'} variant="outlined" /></Tooltip>);
                         })}
                     </Box>
                </div>

                <div className="mb-4 border-bottom pb-3">
                    <h3 className="mb-3 text-gray-700 font-weight-semibold">Supporting Links</h3>
                     <List dense>
                         {ticket.supportingLinks?.length > 0 ? ticket.supportingLinks.map((link, i) => (<ListItem key={i} disablePadding><ListItemIcon sx={{minWidth: 32}}><LinkIcon fontSize="small" /></ListItemIcon><ListItemText primary={<MuiLink href={formatUrl(link)} target="_blank" rel="noopener noreferrer" underline="hover">{link}</MuiLink>} /></ListItem>)) : <Typography variant="body2" color="text.secondary">No links provided.</Typography>}
                     </List>
                </div>
                
                <div className="mb-4">
                    <h3 className="mb-3 text-gray-700 font-weight-semibold">Investigation Log</h3>
                    {ticket.investigationLog?.length > 0 ? [...ticket.investigationLog].reverse().map((entry) => {
                        const logUser = allUsers.find(u => u.uid === entry.userId);
                        return (
                            <Accordion 
                                key={entry.timestamp} 
                                expanded={expandedAccordions.includes(entry.timestamp)}
                                onChange={handleAccordionChange(entry.timestamp)}
                                sx={{ boxShadow: 'none', border: '1px solid rgba(0, 0, 0, 0.125)', '&:not(:last-child)': { borderBottom: 0 }, '&:before': { display: 'none' } }}
                            >
                                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, width: '100%' }}>
                                        <Chip label={entry.type} size="small" variant="outlined" color={entry.type === 'Action' ? 'primary' : 'default'} />
                                        <Box sx={{ flexGrow: 1 }} />
                                        <Typography variant="caption" color="text.secondary" sx={{ml: 2, minWidth: 'fit-content'}}>By {logUser?.displayName || '...'} on {new Date(entry.timestamp).toLocaleDateString()}</Typography>
                                    </Box>
                                </AccordionSummary>
                                <AccordionDetails sx={{ borderTop: '1px solid rgba(0, 0, 0, 0.125)' }}><Box className="prose-mirror-content" dangerouslySetInnerHTML={{ __html: entry.description }}/></AccordionDetails>
                            </Accordion>
                        )
                    }) : <Typography color="text.secondary">No log entries yet.</Typography>}
                </div>
                
                <div className="d-flex justify-content-end gap-2 mt-3">
                    {/* The Edit button is also conditionally rendered here for logged-in users */}
                    {user && (
                        <Button
                            variant="outlined"
                            color="primary"
                            startIcon={<EditIcon />}
                            onClick={() => router.push(`/tickets/${ticket.ticketNumber}/edit`)}
                        >
                            Edit Ticket
                        </Button>
                    )}
                    <Button variant="outlined" onClick={() => router.push('/dashboard')}>
                        Back to Dashboard
                    </Button>
                </div>
            </div>
        </div>
    );
}
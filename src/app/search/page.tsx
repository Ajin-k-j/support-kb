// app/search/page.tsx

'use client';

import { useEffect, useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { collection, onSnapshot, query, Timestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { listenToAllUsers } from '@/lib/users';
import { TicketData, UserData } from '@/types';
import Fuse from 'fuse.js';

import {
    Box,
    Paper,
    TextField,
    Typography,
    InputAdornment,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    CircularProgress,
    Chip,
    AvatarGroup,
    Avatar,
    Tooltip,
    Link as MuiLink,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';

// Helper to format Firestore Timestamps or date strings
const formatDate = (dateValue: any): string => {
    if (!dateValue) return 'N/A';
    if (dateValue instanceof Timestamp) {
        return dateValue.toDate().toLocaleString();
    }
    const date = new Date(dateValue);
    return isNaN(date.getTime()) ? 'Invalid Date' : date.toLocaleString();
};

// **NEW:** Set of common words to ignore during search for better accuracy
const stopWords = new Set([
    'a', 'an', 'and', 'the', 'is', 'in', 'it', 'of', 'for', 'on', 'with', 
    'to', 'was', 'were', 'that', 'this', 'at', 'by', 'from', 'but', 'as', 
    'if', 'or', 'so', 'then', 'about', 'be', 'are', 'not', 'its'
]);


import RoleGuard from '@/components/RoleGuard';

export default function SearchPage() {
    const { user, loading: authLoading } = useAuth();
    const router = useRouter();

    const [allTickets, setAllTickets] = useState<TicketData[]>([]);
    const [allUsers, setAllUsers] = useState<UserData[]>([]);
    const [categories, setCategories] = useState<string[]>([]);
    const [filteredResults, setFilteredResults] = useState<TicketData[]>([]);

    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [categoryFilter, setCategoryFilter] = useState('');
    const [statusFilter, setStatusFilter] = useState('');
    const [impactFilter, setImpactFilter] = useState('');
    const [userFilter, setUserFilter] = useState('');
    const [sortBy, setSortBy] = useState('lastModified');

    const userMap = useMemo(() => new Map(allUsers.map(u => [u.uid, u])), [allUsers]);

    // Authentication and initial data fetching (no changes here)
    useEffect(() => {
        if (user) {
            const unsubTickets = onSnapshot(query(collection(db, 'ticketResolutions')), snapshot => {
                const ticketsData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as TicketData));
                setAllTickets(ticketsData);
                setLoading(false);
            });
            const unsubUsers = listenToAllUsers(setAllUsers);
            const unsubCategories = onSnapshot(query(collection(db, 'ticketCategories')), snapshot => {
                setCategories(snapshot.docs.map(doc => doc.data().name as string));
            });
            return () => {
                unsubTickets();
                unsubUsers();
                unsubCategories();
            };
        }
    }, [user, authLoading, router]);

    // **IMPROVED:** Core search, filter, and sort logic
    useEffect(() => {
        if (loading) return;

        let results: TicketData[] = [...allTickets];

        // 1. Apply dropdown filters first
        if (categoryFilter) results = results.filter(t => t.category === categoryFilter);
        if (statusFilter) results = results.filter(t => t.status === statusFilter);
        if (impactFilter) results = results.filter(t => t.businessImpact === impactFilter);
        if (userFilter) results = results.filter(t => t.assignedUsers?.includes(userFilter));
        
        // 2. Process search term into unique keywords, ignoring stop words
        const keywords = [...new Set(
            searchTerm.trim().toLowerCase()
                .split(/[\s,.-]+/) // Split by spaces and common punctuation
                .filter(word => word.length > 2 && !stopWords.has(word))
        )];

        if (keywords.length > 0) {
            // 3. If keywords exist, perform advanced ranking search
            const fuseOptions = {
                keys: [
                    { name: 'customerDescription', weight: 1.0 },
                    { name: 'supportDescription', weight: 1.0 },
                    { name: 'title', weight: 0.8 },
                    { name: 'aiSummary', weight: 0.8 },
                    { name: 'investigationLog.description', weight: 0.7 },
                    { name: 'ticketNumber', weight: 0.5 },
                ],
                threshold: 0.4,
                minMatchCharLength: 2,
                ignoreLocation: true,
            };
            
            const fuse = new Fuse(results, fuseOptions);
            const rankedResults = new Map<string, { item: TicketData; score: number }>();

            // Search for each keyword and aggregate scores
            keywords.forEach(keyword => {
                const searchResults = fuse.search(keyword);
                searchResults.forEach(({ item }) => {
                    const existing = rankedResults.get(item.id);
                    if (existing) {
                        existing.score += 1; // Increment score for each keyword match
                    } else {
                        rankedResults.set(item.id, { item, score: 1 });
                    }
                });
            });

            // Sort by the aggregated score (highest score first)
            results = Array.from(rankedResults.values())
                .sort((a, b) => b.score - a.score)
                .map(res => res.item);

        } else {
            // 4. If no search term, just apply date sorting to the filtered list
            results.sort((a, b) => {
                const dateAValue = sortBy === 'createdAt' ? a.createdAt : a.lastModified;
                const dateBValue = sortBy === 'createdAt' ? b.createdAt : b.lastModified;
                // Handle cases where date might be missing
                const dateA = dateAValue ? new Date(formatDate(dateAValue)).getTime() : 0;
                const dateB = dateBValue ? new Date(formatDate(dateBValue)).getTime() : 0;
                return dateB - dateA; // Newest first
            });
        }

        setFilteredResults(results);

    }, [searchTerm, allTickets, categoryFilter, statusFilter, impactFilter, userFilter, sortBy, loading]);

    if (authLoading || loading) {
        return <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}><CircularProgress /></Box>;
    }

    return (
      <RoleGuard>
        <Box sx={{ p: { xs: 2, md: 4 }, maxWidth: '1200px', mx: 'auto' }}>
            <Typography variant="h4" component="h1" sx={{ mb: 3, fontWeight: 'bold' }}>
                Knowledge Search
            </Typography>

            <Paper sx={{ p: 3, mb: 4, boxShadow: 3 }}>
                <TextField
                    fullWidth
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Search ticket descriptions, logs, and more..."
                    InputProps={{
                        startAdornment: (
                            <InputAdornment position="start"><SearchIcon /></InputAdornment>
                        ),
                    }}
                />
                <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', md: 'repeat(5, 1fr)' }, gap: 2, mt: 3 }}>
                    <FormControl fullWidth><InputLabel>Category</InputLabel><Select value={categoryFilter} label="Category" onChange={e => setCategoryFilter(e.target.value)}><MenuItem value=""><em>All Categories</em></MenuItem>{categories.map(c => <MenuItem key={c} value={c}>{c}</MenuItem>)}</Select></FormControl>
                    <FormControl fullWidth><InputLabel>Status</InputLabel><Select value={statusFilter} label="Status" onChange={e => setStatusFilter(e.target.value)}><MenuItem value=""><em>All Statuses</em></MenuItem><MenuItem value="Open">Open</MenuItem><MenuItem value="InProgress">In Progress</MenuItem><MenuItem value="Pending">Pending</MenuItem><MenuItem value="Resolved">Resolved</MenuItem><MenuItem value="Closed">Closed</MenuItem></Select></FormControl>
                    <FormControl fullWidth><InputLabel>Impact</InputLabel><Select value={impactFilter} label="Impact" onChange={e => setImpactFilter(e.target.value)}><MenuItem value=""><em>All Impacts</em></MenuItem><MenuItem value="Low">Low</MenuItem><MenuItem value="Medium">Medium</MenuItem><MenuItem value="High">High</MenuItem><MenuItem value="Critical">Critical</MenuItem></Select></FormControl>
                    <FormControl fullWidth><InputLabel>Assigned User</InputLabel><Select value={userFilter} label="Assigned User" onChange={e => setUserFilter(e.target.value)}><MenuItem value=""><em>All Users</em></MenuItem>{allUsers.map(u => <MenuItem key={u.uid} value={u.uid}>{u.displayName}</MenuItem>)}</Select></FormControl>
                    <FormControl fullWidth><InputLabel>Sort By</InputLabel><Select value={sortBy} label="Sort By" onChange={e => setSortBy(e.target.value)}><MenuItem value="lastModified">Last Modified</MenuItem><MenuItem value="createdAt">Created Date</MenuItem></Select></FormControl>
                </Box>
            </Paper>

            <Box>
                {searchTerm.trim() ? (
                    <>
                        <Typography variant="h6" sx={{ mb: 2 }}>{filteredResults.length} results found</Typography>
                        {filteredResults.length > 0 ? (
                             <Box sx={{ display: 'grid', gap: 2, gridTemplateColumns: '1fr' }}>
                                {filteredResults.map(ticket => (
                                    <Paper key={ticket.id} sx={{ p: 2, transition: 'box-shadow 0.2s', '&:hover': { boxShadow: 4 } }}>
                                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                            <Box>
                                                <MuiLink component={Link} href={`/tickets/${ticket.ticketNumber}`} underline="hover" sx={{ fontWeight: 'bold', fontSize: '1.1rem' }}>
                                                    {ticket.title}
                                                </MuiLink>
                                                <Typography variant="body2" color="text.secondary">{ticket.ticketNumber} • {ticket.category}</Typography>
                                            </Box>
                                            <AvatarGroup max={4} sx={{ '& .MuiAvatar-root': { width: 32, height: 32 } }}>
                                                {ticket.assignedUsers?.map(uid => {
                                                    const u = userMap.get(uid);
                                                    return u ? <Tooltip key={uid} title={u.displayName}><Avatar src={u.photoURL} /></Tooltip> : null;
                                                })}
                                            </AvatarGroup>
                                        </Box>
                                        <Typography variant="body2" color="text.secondary" sx={{ mt: 1, fontStyle: 'italic' }}>
                                            Last updated: {formatDate(ticket.lastModified)}
                                        </Typography>
                                    </Paper>
                                ))}
                            </Box>
                        ) : (
                            <Typography sx={{ textAlign: 'center', mt: 8, color: 'text.secondary' }}>No results match your search and filter criteria.</Typography>
                        )}
                    </>
                ) : (
                    <Typography sx={{ textAlign: 'center', mt: 8, color: 'text.secondary' }}>Start typing to search for tickets.</Typography>
                )}
            </Box>
        </Box>
      </RoleGuard>
    );
}
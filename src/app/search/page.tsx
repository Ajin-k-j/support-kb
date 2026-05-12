// app/search/page.tsx

'use client';

import { useEffect, useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { collection, onSnapshot, query, Timestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { listenToAllUsers } from '@/lib/users';
import { listenToAllKBs, listenToAllCodeSnippets } from '@/lib/firestore';
import { TicketData, UserData, KBData, CodeSnippetData } from '@/types';
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

const stopWords = new Set([
    'a', 'an', 'and', 'the', 'is', 'in', 'it', 'of', 'for', 'on', 'with', 
    'to', 'was', 'were', 'that', 'this', 'at', 'by', 'from', 'but', 'as', 
    'if', 'or', 'so', 'then', 'about', 'be', 'are', 'not', 'its'
]);

import RoleGuard from '@/components/RoleGuard';

type SearchItem = {
    id: string;
    type: 'Ticket' | 'KB' | 'Code';
    title: string;
    description: string;
    tags: string[];
    createdAt: any;
    lastModified: any;
    raw: any;
};

export default function SearchPage() {
    const { user, loading: authLoading } = useAuth();
    const router = useRouter();

    const [allTickets, setAllTickets] = useState<TicketData[]>([]);
    const [allKBs, setAllKBs] = useState<KBData[]>([]);
    const [allCodes, setAllCodes] = useState<CodeSnippetData[]>([]);
    const [allUsers, setAllUsers] = useState<UserData[]>([]);
    const [categories, setCategories] = useState<string[]>([]);
    
    const [filteredResults, setFilteredResults] = useState<SearchItem[]>([]);

    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    
    const [contentTypeFilter, setContentTypeFilter] = useState('All');
    const [categoryFilter, setCategoryFilter] = useState('');
    const [statusFilter, setStatusFilter] = useState('');
    const [impactFilter, setImpactFilter] = useState('');
    const [userFilter, setUserFilter] = useState('');
    const [sortBy, setSortBy] = useState('lastModified');

    const userMap = useMemo(() => new Map(allUsers.map(u => [u.uid, u])), [allUsers]);

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
            const unsubKBs = listenToAllKBs(setAllKBs);
            const unsubCodes = listenToAllCodeSnippets(setAllCodes);

            return () => {
                unsubTickets();
                unsubUsers();
                unsubCategories();
                unsubKBs();
                unsubCodes();
            };
        }
    }, [user, authLoading, router]);

    const unifiedData = useMemo(() => {
        const items: SearchItem[] = [];
        
        allTickets.forEach(t => {
            items.push({
                id: t.id,
                type: 'Ticket',
                title: t.title || t.ticketNumber,
                description: `${t.customerDescription || ''} ${t.supportDescription || ''} ${t.aiSummary || ''}`,
                tags: [t.category, t.status, t.businessImpact].filter(Boolean) as string[],
                createdAt: t.createdAt,
                lastModified: t.lastModified,
                raw: t,
            });
        });

        allKBs.forEach(kb => {
            items.push({
                id: kb.id,
                type: 'KB',
                title: kb.subject,
                description: `${kb.content || ''} ${kb.resolution || ''}`,
                tags: kb.tags || [],
                createdAt: kb.createdAt,
                lastModified: kb.updatedAt,
                raw: kb,
            });
        });

        allCodes.forEach(code => {
            items.push({
                id: code.id,
                type: 'Code',
                title: code.subject,
                description: `${code.content || ''} ${code.useCase || ''}`,
                tags: [code.language, ...(code.tags || [])].filter(Boolean),
                createdAt: code.createdAt,
                lastModified: code.updatedAt,
                raw: code,
            });
        });

        return items;
    }, [allTickets, allKBs, allCodes]);

    useEffect(() => {
        if (loading) return;

        let results: SearchItem[] = [...unifiedData];

        if (contentTypeFilter !== 'All') {
            results = results.filter(item => item.type === contentTypeFilter);
        }

        // Apply ticket-specific filters if type isn't restricted or is specifically Ticket
        if (contentTypeFilter === 'All' || contentTypeFilter === 'Ticket') {
            if (categoryFilter) results = results.filter(t => t.type !== 'Ticket' || t.raw.category === categoryFilter);
            if (statusFilter) results = results.filter(t => t.type !== 'Ticket' || t.raw.status === statusFilter);
            if (impactFilter) results = results.filter(t => t.type !== 'Ticket' || t.raw.businessImpact === impactFilter);
            if (userFilter) results = results.filter(t => t.type !== 'Ticket' || t.raw.assignedUsers?.includes(userFilter));
        }

        const keywords = [...new Set(
            searchTerm.trim().toLowerCase()
                .split(/[\s,.-]+/)
                .filter(word => word.length > 2 && !stopWords.has(word))
        )];

        if (keywords.length > 0) {
            const fuseOptions = {
                keys: [
                    { name: 'title', weight: 1.0 },
                    { name: 'description', weight: 0.8 },
                    { name: 'tags', weight: 0.6 },
                ],
                threshold: 0.4,
                minMatchCharLength: 2,
                ignoreLocation: true,
            };
            
            const fuse = new Fuse(results, fuseOptions);
            const rankedResults = new Map<string, { item: SearchItem; score: number }>();

            keywords.forEach(keyword => {
                const searchResults = fuse.search(keyword);
                searchResults.forEach(({ item }) => {
                    const existing = rankedResults.get(item.id);
                    if (existing) {
                        existing.score += 1;
                    } else {
                        rankedResults.set(item.id, { item, score: 1 });
                    }
                });
            });

            results = Array.from(rankedResults.values())
                .sort((a, b) => b.score - a.score)
                .map(res => res.item);

        } else {
            results.sort((a, b) => {
                const dateAValue = sortBy === 'createdAt' ? a.createdAt : a.lastModified;
                const dateBValue = sortBy === 'createdAt' ? b.createdAt : b.lastModified;
                const dateA = dateAValue ? new Date(formatDate(dateAValue)).getTime() : 0;
                const dateB = dateBValue ? new Date(formatDate(dateBValue)).getTime() : 0;
                return dateB - dateA;
            });
        }

        setFilteredResults(results);

    }, [searchTerm, unifiedData, contentTypeFilter, categoryFilter, statusFilter, impactFilter, userFilter, sortBy, loading]);

    if (authLoading || loading) {
        return <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}><CircularProgress /></Box>;
    }

    return (
      <RoleGuard>
        <Box sx={{ p: { xs: 2, md: 4 }, maxWidth: '1200px', mx: 'auto' }}>
            <Typography variant="h4" component="h1" sx={{ mb: 3, fontWeight: 'bold' }}>
                Unified Search
            </Typography>

            <Paper sx={{ p: 3, mb: 4, boxShadow: 3 }}>
                <TextField
                    fullWidth
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Search across tickets, knowledge base, and code snippets..."
                    InputProps={{
                        startAdornment: (
                            <InputAdornment position="start"><SearchIcon /></InputAdornment>
                        ),
                    }}
                />
                <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', md: 'repeat(6, 1fr)' }, gap: 2, mt: 3 }}>
                    <FormControl fullWidth><InputLabel>Content Type</InputLabel><Select value={contentTypeFilter} label="Content Type" onChange={e => setContentTypeFilter(e.target.value)}><MenuItem value="All"><em>All</em></MenuItem><MenuItem value="Ticket">Tickets</MenuItem><MenuItem value="KB">Knowledge Base</MenuItem><MenuItem value="Code">Code Snippets</MenuItem></Select></FormControl>
                    <FormControl fullWidth disabled={contentTypeFilter === 'KB' || contentTypeFilter === 'Code'}><InputLabel>Category</InputLabel><Select value={categoryFilter} label="Category" onChange={e => setCategoryFilter(e.target.value)}><MenuItem value=""><em>All Categories</em></MenuItem>{categories.map(c => <MenuItem key={c} value={c}>{c}</MenuItem>)}</Select></FormControl>
                    <FormControl fullWidth disabled={contentTypeFilter === 'KB' || contentTypeFilter === 'Code'}><InputLabel>Status</InputLabel><Select value={statusFilter} label="Status" onChange={e => setStatusFilter(e.target.value)}><MenuItem value=""><em>All Statuses</em></MenuItem><MenuItem value="Open">Open</MenuItem><MenuItem value="InProgress">In Progress</MenuItem><MenuItem value="Pending">Pending</MenuItem><MenuItem value="Resolved">Resolved</MenuItem><MenuItem value="Closed">Closed</MenuItem></Select></FormControl>
                    <FormControl fullWidth disabled={contentTypeFilter === 'KB' || contentTypeFilter === 'Code'}><InputLabel>Impact</InputLabel><Select value={impactFilter} label="Impact" onChange={e => setImpactFilter(e.target.value)}><MenuItem value=""><em>All Impacts</em></MenuItem><MenuItem value="Low">Low</MenuItem><MenuItem value="Medium">Medium</MenuItem><MenuItem value="High">High</MenuItem><MenuItem value="Critical">Critical</MenuItem></Select></FormControl>
                    <FormControl fullWidth disabled={contentTypeFilter === 'KB' || contentTypeFilter === 'Code'}><InputLabel>Assigned User</InputLabel><Select value={userFilter} label="Assigned User" onChange={e => setUserFilter(e.target.value)}><MenuItem value=""><em>All Users</em></MenuItem>{allUsers.map(u => <MenuItem key={u.uid} value={u.uid}>{u.displayName}</MenuItem>)}</Select></FormControl>
                    <FormControl fullWidth><InputLabel>Sort By</InputLabel><Select value={sortBy} label="Sort By" onChange={e => setSortBy(e.target.value)}><MenuItem value="lastModified">Last Modified</MenuItem><MenuItem value="createdAt">Created Date</MenuItem></Select></FormControl>
                </Box>
            </Paper>

            <Box>
                {searchTerm.trim() ? (
                    <>
                        <Typography variant="h6" sx={{ mb: 2 }}>{filteredResults.length} results found</Typography>
                        {filteredResults.length > 0 ? (
                             <Box sx={{ display: 'grid', gap: 2, gridTemplateColumns: '1fr' }}>
                                {filteredResults.map(item => (
                                    <Paper key={item.id} sx={{ p: 2, transition: 'box-shadow 0.2s', '&:hover': { boxShadow: 4 } }}>
                                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                                            <Box>
                                                <MuiLink 
                                                    component={Link} 
                                                    href={item.type === 'Ticket' ? `/tickets/${item.raw.ticketNumber}` : item.type === 'KB' ? `/kb/${item.id}` : `/code/${item.id}`} 
                                                    underline="hover" 
                                                    sx={{ fontWeight: 'bold', fontSize: '1.1rem' }}
                                                >
                                                    {item.title}
                                                </MuiLink>
                                            </Box>
                                            <Chip label={item.type} size="small" color={item.type === 'Ticket' ? 'primary' : item.type === 'KB' ? 'success' : 'secondary'} />
                                        </Box>
                                        <Box sx={{ display: 'flex', gap: 1, mb: 1 }}>
                                            {item.tags.map(t => <Chip key={t} label={t} size="small" variant="outlined" />)}
                                        </Box>
                                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                            <Typography variant="body2" color="text.secondary" sx={{ fontStyle: 'italic' }}>
                                                Last updated: {formatDate(item.lastModified)}
                                            </Typography>
                                            {item.type === 'Ticket' && item.raw.assignedUsers && (
                                                <AvatarGroup max={4} sx={{ '& .MuiAvatar-root': { width: 24, height: 24 } }}>
                                                    {item.raw.assignedUsers.map((uid: string) => {
                                                        const u = userMap.get(uid);
                                                        return u ? <Tooltip key={uid} title={u.displayName}><Avatar src={u.photoURL} /></Tooltip> : null;
                                                    })}
                                                </AvatarGroup>
                                            )}
                                        </Box>
                                    </Paper>
                                ))}
                            </Box>
                        ) : (
                            <Typography sx={{ textAlign: 'center', mt: 8, color: 'text.secondary' }}>No results match your search and filter criteria.</Typography>
                        )}
                    </>
                ) : (
                    <Typography sx={{ textAlign: 'center', mt: 8, color: 'text.secondary' }}>Start typing to search across the platform.</Typography>
                )}
            </Box>
        </Box>
      </RoleGuard>
    );
}
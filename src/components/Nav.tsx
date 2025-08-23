'use client';

import { useAuth } from '@/context/AuthContext';
import { signOut } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState, MouseEvent } from 'react'; // Removed useEffect
import {
    AppBar, Toolbar, Typography, Box, Button,
    Avatar, Menu, MenuItem, ListItemIcon, Divider, Skeleton
} from '@mui/material';
import {
    Search as SearchIcon, AdminPanelSettings as AdminPanelSettingsIcon,
    Logout as LogoutIcon, ArrowDropDown as ArrowDropDownIcon
} from '@mui/icons-material';

// A custom SVG Icon for your app logo
const AppLogoIcon = () => (
    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" xmlns="http://www.w3.org/2000/svg" style={{ color: '#4f46e5' }}>
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
    </svg>
);

export default function Nav() {
    const { user, userData, loading } = useAuth();
    const router = useRouter();
    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
    const dropdownOpen = Boolean(anchorEl);

    // **FIX 1:** The `isClient` state and its useEffect are no longer needed.
    // The `loading` state from useAuth is the single source of truth.

    const handleMenu = (event: MouseEvent<HTMLElement>) => {
        setAnchorEl(event.currentTarget);
    };

    const handleClose = () => {
        setAnchorEl(null);
    };

    const handleLogout = async () => {
        handleClose();
        await signOut(auth);
        router.push('/login');
    };

    return (
        <AppBar position="sticky" sx={{ bgcolor: 'white', color: 'text.primary', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
            <Toolbar sx={{ display: 'flex', justifyContent: 'space-between', height: '4rem' }}>
                {/* Left Side: Logo and Title */}
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                    <AppLogoIcon />
                    {/* **FIX 2:** Simplified the href logic. It will be '/' on the server and update on the client if the user is logged in. */}
                    <Link href={user ? '/dashboard' : '/'} passHref style={{ textDecoration: 'none', color: 'inherit' }}>
                        <Typography variant="h6" component="div" sx={{ fontWeight: 'bold' }}>
                            Support KB
                        </Typography>
                    </Link>
                </Box>

                {/* Right Side: Links and User Profile */}
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Button
                        variant="text"
                        color="inherit"
                        startIcon={<SearchIcon />}
                        onClick={() => router.push('/search')}
                        sx={{ textTransform: 'none', color: 'text.secondary', '&:hover': { bgcolor: 'action.hover' } }}
                    >
                        Global Search
                    </Button>

                    {/* **FIX 3:** Simplified the conditional rendering logic */}
                    {loading ? (
                        // This Skeleton is rendered on the server and the initial client render, ensuring a match.
                        <Skeleton variant="rectangular" width={120} height={32} sx={{ borderRadius: '999px' }} />
                    ) : user && userData ? (
                        // This part renders only on the client after loading is false and user is confirmed.
                        <>
                            <Button
                                onClick={handleMenu}
                                sx={{
                                    display: 'flex', alignItems: 'center', gap: 1, textTransform: 'none',
                                    color: 'text.primary', borderRadius: '999px', p: '4px 12px 4px 4px',
                                    '&:hover': { bgcolor: 'action.hover' }
                                }}
                            >
                                <Avatar alt={userData.displayName || ''} src={userData.photoURL} sx={{ width: 32, height: 32 }} />
                                <Typography sx={{ display: { xs: 'none', md: 'block' } }}>{userData.displayName}</Typography>
                                <ArrowDropDownIcon />
                            </Button>
                            <Menu
                                anchorEl={anchorEl}
                                open={dropdownOpen}
                                onClose={handleClose}
                                transformOrigin={{ horizontal: 'right', vertical: 'top' }}
                                anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
                                PaperProps={{
                                    elevation: 0,
                                    sx: {
                                        overflow: 'visible', filter: 'drop-shadow(0px 2px 8px rgba(0,0,0,0.15))', mt: 1.5,
                                        '&:before': {
                                            content: '""', display: 'block', position: 'absolute', top: 0, right: 14,
                                            width: 10, height: 10, bgcolor: 'background.paper', transform: 'translateY(-50%) rotate(45deg)', zIndex: 0,
                                        },
                                    },
                                }}
                            >
                                {userData.isAdmin && (
                                    <MenuItem onClick={() => { handleClose(); router.push('/admin/dashboard'); }}>
                                        <ListItemIcon><AdminPanelSettingsIcon fontSize="small" /></ListItemIcon>
                                        Admin Panel
                                    </MenuItem>
                                )}
                                {userData.isAdmin && <Divider />}
                                <MenuItem onClick={handleLogout}>
                                    <ListItemIcon><LogoutIcon fontSize="small" /></ListItemIcon>
                                    Sign Out
                                </MenuItem>
                            </Menu>
                        </>
                    ) : (
                        // This part renders for logged-out users after loading is false.
                        <Box sx={{ display: 'flex', gap: 1 }}>
                            <Button variant="outlined" size="small" onClick={() => router.push('/login')}>Login</Button>
                            <Button variant="contained" size="small" onClick={() => router.push('/signup')}>Sign Up</Button>
                        </Box>
                    )}
                </Box>
            </Toolbar>
        </AppBar>
    );
}
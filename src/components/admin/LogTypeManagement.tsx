'use client';

import { useState, useEffect } from 'react';
import { collection, onSnapshot, addDoc, deleteDoc, doc, query, orderBy } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import {
    Box, TextField, Button, List, ListItem, ListItemText, IconButton,
    Typography, Paper, Alert
} from '@mui/material';
import { Add as AddIcon, Delete as DeleteIcon } from '@mui/icons-material';

interface LogType {
    id: string;
    name: string;
}

export default function LogTypeManagement() {
    const [logTypes, setLogTypes] = useState<LogType[]>([]);
    const [newLogTypeName, setNewLogTypeName] = useState('');
    const [error, setError] = useState('');

    useEffect(() => {
        // We'll store these in a new collection called 'investigationLogTypes'
        const q = query(collection(db, 'investigationLogTypes'), orderBy('name'));
        const unsubscribe = onSnapshot(q, (snapshot) => {
            const types = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as LogType));
            setLogTypes(types);
        });
        return () => unsubscribe();
    }, []);

    const handleAddLogType = async () => {
        if (!newLogTypeName.trim()) {
            setError('Log type name cannot be empty.');
            return;
        }
        if (logTypes.some(t => t.name.toLowerCase() === newLogTypeName.trim().toLowerCase())) {
            setError('This log type already exists.');
            return;
        }
        setError('');
        await addDoc(collection(db, 'investigationLogTypes'), { name: newLogTypeName.trim() });
        setNewLogTypeName('');
    };

    const handleDeleteLogType = async (id: string) => {
        if (window.confirm('Are you sure you want to delete this log type?')) {
            await deleteDoc(doc(db, 'investigationLogTypes', id));
        }
    };

    return (
        <Paper variant="outlined" sx={{ p: 2, maxWidth: '600px' }}>
            <Typography variant="h6" gutterBottom>Manage Investigation Log Types</Typography>
            {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
            <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
                <TextField
                    label="New Log Type Name"
                    variant="outlined"
                    size="small"
                    fullWidth
                    value={newLogTypeName}
                    onChange={(e) => setNewLogTypeName(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleAddLogType()}
                />
                <Button
                    variant="contained"
                    startIcon={<AddIcon />}
                    onClick={handleAddLogType}
                    disabled={!newLogTypeName.trim()}
                >
                    Add
                </Button>
            </Box>
            <List>
                {logTypes.map((type) => (
                    <ListItem
                        key={type.id}
                        secondaryAction={
                            <IconButton edge="end" aria-label="delete" onClick={() => handleDeleteLogType(type.id)}>
                                <DeleteIcon />
                            </IconButton>
                        }
                        sx={{ '&:hover': { bgcolor: 'action.hover' }, borderRadius: 1 }}
                    >
                        <ListItemText primary={type.name} />
                    </ListItem>
                ))}
            </List>
        </Paper>
    );
}
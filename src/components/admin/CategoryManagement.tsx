'use client';

import { useState, useEffect } from 'react';
import { collection, onSnapshot, addDoc, deleteDoc, doc, query, orderBy } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import {
    Box, TextField, Button, List, ListItem, ListItemText, IconButton,
    Typography, Paper, Alert
} from '@mui/material';
import { Add as AddIcon, Delete as DeleteIcon } from '@mui/icons-material';

interface Category {
    id: string;
    name: string;
}

export default function CategoryManagement() {
    const [categories, setCategories] = useState<Category[]>([]);
    const [newCategoryName, setNewCategoryName] = useState('');
    const [error, setError] = useState('');

    useEffect(() => {
        const q = query(collection(db, 'categories'), orderBy('name'));
        const unsubscribe = onSnapshot(q, (snapshot) => {
            const cats = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Category));
            setCategories(cats);
        });
        return () => unsubscribe();
    }, []);

    const handleAddCategory = async () => {
        if (!newCategoryName.trim()) {
            setError('Category name cannot be empty.');
            return;
        }
        if (categories.some(cat => cat.name.toLowerCase() === newCategoryName.trim().toLowerCase())) {
            setError('This category already exists.');
            return;
        }
        setError('');
        await addDoc(collection(db, 'categories'), { name: newCategoryName.trim() });
        setNewCategoryName('');
    };

    const handleDeleteCategory = async (id: string) => {
        if (window.confirm('Are you sure you want to delete this category? This action cannot be undone.')) {
            await deleteDoc(doc(db, 'categories', id));
        }
    };

    return (
        <Paper variant="outlined" sx={{ p: 2, maxWidth: '600px' }}>
            <Typography variant="h6" gutterBottom>Manage Ticket Categories</Typography>
            {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
            <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
                <TextField
                    label="New Category Name"
                    variant="outlined"
                    size="small"
                    fullWidth
                    value={newCategoryName}
                    onChange={(e) => setNewCategoryName(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleAddCategory()}
                />
                <Button
                    variant="contained"
                    startIcon={<AddIcon />}
                    onClick={handleAddCategory}
                    disabled={!newCategoryName.trim()}
                >
                    Add
                </Button>
            </Box>
            <List>
                {categories.map((cat) => (
                    <ListItem
                        key={cat.id}
                        secondaryAction={
                            <IconButton edge="end" aria-label="delete" onClick={() => handleDeleteCategory(cat.id)}>
                                <DeleteIcon />
                            </IconButton>
                        }
                        sx={{ '&:hover': { bgcolor: 'action.hover' }, borderRadius: 1 }}
                    >
                        <ListItemText primary={cat.name} />
                    </ListItem>
                ))}
            </List>
        </Paper>
    );
}
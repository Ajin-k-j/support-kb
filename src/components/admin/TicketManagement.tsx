'use client';

import { useState, useEffect, useMemo, memo } from 'react';
import { collection, onSnapshot, query, writeBatch, doc, serverTimestamp, Timestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { listenToAllUsers } from '@/lib/users';
import { TicketData, UserData } from '@/types';
import { DataGrid, GridColDef, GridRowId, GridToolbar } from '@mui/x-data-grid';
import Papa from 'papaparse';
import {
  Box,
  Button,
  Paper,
  Input,
  Link as MuiLink,
  AvatarGroup,
  Avatar,
  Tooltip,
  Chip,
  IconButton,
} from '@mui/material';
import { Download as DownloadIcon, Delete as DeleteIcon, UploadFile as UploadFileIcon, Edit as EditIcon, Visibility as VisibilityIcon } from '@mui/icons-material';
import Link from 'next/link';
import Loader from '@/components/Loader';

// Helper function to create a downloadable file
const downloadFile = (content: string, fileName: string, mimeType: string) => {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = fileName;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};

function TicketManagement() {
  const [tickets, setTickets] = useState<TicketData[]>([]); // Initialize as empty array
  const [userMap, setUserMap] = useState<Map<string, UserData>>(new Map());
  const [loading, setLoading] = useState(true);
  const [selectionModel, setSelectionModel] = useState<GridRowId[]>([]);
  const [isClient, setIsClient] = useState(false);
  const [error, setError] = useState<string | null>(null); // Track errors

  useEffect(() => {
    setIsClient(true); // Ensure client-side rendering
  }, []);

  useEffect(() => {
    const unsubscribeUsers = listenToAllUsers((users) => {
      console.log('Users fetched:', users);
      setUserMap(new Map(users.map((u) => [u.uid, u])));
    }, (err) => {
      console.error('Error fetching users:', err);
      setError('Failed to fetch users');
      setLoading(false);
    });

    const unsubscribeTickets = onSnapshot(
      query(collection(db, 'ticketResolutions')),
      (snapshot) => {
        const ticketData = snapshot.docs.map((doc) => {
          const data = doc.data() || {};
          return {
            id: doc.id,
            ticketNumber: data.ticketNumber ?? '',
            title: data.title ?? 'No Title',
            status: data.status ?? 'Unknown',
            category: data.category ?? 'Uncategorized',
            assignedUsers: Array.isArray(data.assignedUsers) ? data.assignedUsers : [],
            lastModified: data.lastModified
              ? data.lastModified instanceof Timestamp
                ? data.lastModified.toDate().toISOString()
                : String(data.lastModified)
              : '',
            createdAt: data.createdAt
              ? data.createdAt instanceof Timestamp
                ? data.createdAt.toDate().toISOString()
                : String(data.createdAt)
              : '',
            customerDescription: data.customerDescription ?? '',
            supportDescription: data.supportDescription ?? '',
            investigationLog: Array.isArray(data.investigationLog) ? data.investigationLog : [],
            businessImpact: data.businessImpact ?? 'Low',
            supportingLinks: Array.isArray(data.supportingLinks) ? data.supportingLinks : [],
            assignedTo: data.assignedTo ?? undefined,
          } as TicketData;
        });
        console.log('Tickets fetched:', ticketData);
        setTickets(ticketData);
        setLoading(false);
      },
      (err) => {
        console.error('Firestore ticket fetch error:', err);
        setError('Failed to fetch tickets');
        setLoading(false);
      }
    );

    return () => {
      unsubscribeUsers();
      unsubscribeTickets();
    };
  }, []);

  const handleDeleteSelected = async () => {
    if (selectionModel.length === 0) {
      alert('Please select tickets to delete.');
      return;
    }
    if (window.confirm(`Are you sure you want to delete ${selectionModel.length} selected ticket(s)?`)) {
      try {
        const batch = writeBatch(db);
        selectionModel.forEach((id) => {
          batch.delete(doc(db, 'ticketResolutions', id as string));
        });
        await batch.commit();
        alert('Selected tickets have been deleted.');
        setSelectionModel([]);
      } catch (error) {
        console.error('Error deleting tickets:', error);
        alert('Failed to delete tickets.');
      }
    }
  };

  const handleDownload = () => {
    if (selectionModel.length === 0) {
      alert('Please select tickets to download.');
      return;
    }
    const selectedTickets = tickets.filter((t) => selectionModel.includes(t.id));
    const dataToExport = selectedTickets.map((t) => ({
      ...t,
      assignedUsers: (t.assignedUsers || []).map((uid) => userMap.get(uid)?.displayName || uid).join(', '),
      investigationLog: JSON.stringify(t.investigationLog || []),
      createdAt: t.createdAt ? new Date(t.createdAt).toLocaleString() : '',
      lastModified: t.lastModified ? new Date(t.lastModified).toLocaleString() : '',
    }));

    const csv = Papa.unparse(dataToExport);
    downloadFile(csv, 'tickets.csv', 'text/csv;charset=utf-8;');
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const content = e.target?.result;
        const ticketsToUpload: Omit<TicketData, 'id'>[] = JSON.parse(content as string);

        if (!Array.isArray(ticketsToUpload)) throw new Error('JSON must be an array of ticket objects.');

        if (window.confirm(`Are you sure you want to upload ${ticketsToUpload.length} tickets?`)) {
          const batch = writeBatch(db);
          ticketsToUpload.forEach((ticket) => {
            const newTicketRef = doc(collection(db, 'ticketResolutions'));
            batch.set(newTicketRef, {
              ...ticket,
              createdAt: serverTimestamp(),
              lastModified: serverTimestamp(),
            });
          });
          await batch.commit();
          alert(`${ticketsToUpload.length} tickets uploaded successfully.`);
        }
      } catch (error: any) {
        alert(`Error uploading file: ${error.message}`);
      }
    };
    reader.readAsText(file);
    event.target.value = ''; // Reset input
  };

  const getStatusChipColor = (status: string) => {
    switch (status) {
      case 'Open':
        return 'info';
      case 'InProgress':
        return 'warning';
      case 'Resolved':
      case 'Closed':
        return 'success';
      default:
        return 'default';
    }
  };

  const columns: GridColDef[] = useMemo(
    () => [
      {
        field: 'ticketNumber',
        headerName: 'Ticket ID',
        width: 150,
        renderCell: (params) => (
          params.value ? (
            <MuiLink component={Link} href={`/tickets/${params.row.id}/edit`} underline="hover">
              {params.value}
            </MuiLink>
          ) : (
            'N/A'
          )
        ),
      },
      { field: 'title', headerName: 'Title', flex: 1, minWidth: 250 },
      {
        field: 'status',
        headerName: 'Status',
        width: 120,
        renderCell: (params) => (
          <Chip label={params.value} color={getStatusChipColor(params.value)} size="small" />
        ),
      },
      { field: 'category', headerName: 'Category', width: 130 },
      {
        field: 'assignedUsers',
        headerName: 'Assigned To',
        width: 180,
        sortable: false,
        align: 'center',
        headerAlign: 'center',
        renderCell: (params) => (
          <AvatarGroup max={4} sx={{ justifyContent: 'center', '& .MuiAvatar-root': { width: 28, height: 28, fontSize: '0.8rem' } }}>
            {params.value?.map((uid: string) => {
              const user = userMap.get(uid);
              return (
                <Tooltip title={user?.displayName || 'Unknown'} key={uid}>
                  <Avatar src={user?.photoURL}>{user?.displayName?.charAt(0)}</Avatar>
                </Tooltip>
              );
            })}
          </AvatarGroup>
        ),
      },
      {
        field: 'lastModified',
        headerName: 'Last Modified',
        width: 200,
        type: 'dateTime',
        valueGetter: (value) => (value ? new Date(value) : null),
      },
      {
        field: 'customerDescription',
        headerName: 'Customer Desc.',
        flex: 1,
        minWidth: 200,
        sortable: false,
      },
      {
        field: 'supportDescription',
        headerName: 'Support Desc.',
        flex: 1,
        minWidth: 200,
        sortable: false,
      },
      {
        field: 'actions',
        headerName: 'Actions',
        width: 120,
        sortable: false,
        align: 'center',
        headerAlign: 'center',
        renderCell: (params) => (
          <Box>
            <Tooltip title="View Ticket">
              <IconButton component={Link} href={`/tickets/${params.row.ticketNumber}`} size="small">
                <VisibilityIcon fontSize="small" />
              </IconButton>
            </Tooltip>
            <Tooltip title="Edit Ticket">
              <IconButton component={Link} href={`/tickets/${params.row.id}/edit`} size="small">
                <EditIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          </Box>
        ),
      },
    ],
    [userMap]
  );

  if (!isClient || loading || error) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 5, flexDirection: 'column', alignItems: 'center' }}>
        {error ? (
          <Box sx={{ color: 'error.main', mb: 2 }}>{error}</Box>
        ) : (
          <Loader />
        )}
      </Box>
    );
  }

  return (
    <Box>
      <Box sx={{ mb: 2, display: 'flex', flexWrap: 'wrap', gap: 2, alignItems: 'center' }}>
        <Button
          variant="contained"
          color="secondary"
          startIcon={<DownloadIcon />}
          onClick={handleDownload}
          disabled={selectionModel.length === 0}
        >
          Export CSV
        </Button>
        <Button
          variant="contained"
          color="error"
          startIcon={<DeleteIcon />}
          onClick={handleDeleteSelected}
          disabled={selectionModel.length === 0}
        >
          Delete Selected
        </Button>
        <Button component="label" variant="outlined" startIcon={<UploadFileIcon />}>
          Upload JSON
          <Input type="file" accept=".json" onChange={handleFileUpload} sx={{ display: 'none' }} />
        </Button>
      </Box>

      <Paper>
        <DataGrid
          rows={tickets || []} // Fallback to empty array
          columns={columns}
          loading={loading}
          checkboxSelection
          onRowSelectionModelChange={(newSelectionModel) => setSelectionModel(newSelectionModel as GridRowId[])}
          rowSelectionModel={selectionModel}
          slots={{ toolbar: GridToolbar }}
          slotProps={{
            toolbar: {
              showQuickFilter: true,
            },
          }}
          initialState={{
            pagination: {
              paginationModel: { page: 0, pageSize: 10 },
            },
            columns: {
              columnVisibilityModel: {
                customerDescription: false,
                supportDescription: false,
              },
            },
          }}
          pageSizeOptions={[5, 10, 25]}
          disableRowSelectionOnClick
          autoHeight
        />
      </Paper>
    </Box>
  );
}

export default memo(TicketManagement);
'use client';

// CHANGE: Imported 'useMemo' and 'memo' from React
import { useMemo, memo } from 'react';
import { TicketData, UserData } from '@/types';
import { DataGrid, GridColDef, GridToolbar } from '@mui/x-data-grid';
import Link from 'next/link';
import { Box, Chip, Tooltip, Avatar, AvatarGroup, IconButton, Paper, Link as MuiLink } from '@mui/material';
import { Edit as EditIcon, Visibility as VisibilityIcon } from '@mui/icons-material';

type TicketTableProps = {
  tickets: TicketData[];
  allUsers: UserData[];
};

// CHANGE: Renamed the component to start with an uppercase letter for memo
function TicketTableComponent({ tickets, allUsers }: TicketTableProps) {
  
  const userMap = new Map(allUsers.map(user => [user.uid, user]));

  const getStatusChipColor = (status: string) => {
    switch (status) {
        case 'Open': return 'info';
        case 'InProgress': return 'warning';
        case 'Resolved':
        case 'Closed': return 'success';
        default: return 'default';
    }
  };

  // CHANGE: Wrapped the columns array in useMemo to prevent it from being
  // recreated on every render, which helps stabilize the DataGrid.
  const columns: GridColDef[] = useMemo(() => [
    {
      field: 'ticketNumber',
      headerName: 'Ticket ID',
      width: 150,
      renderCell: (params) => (
        <MuiLink component={Link} href={`/tickets/${params.value}`} underline="hover">
          {params.value}
        </MuiLink>
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
    {
      field: 'assignedUsers',
      headerName: 'Assigned',
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
      valueGetter: (value) => value ? new Date(value) : null,
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
                <IconButton component={Link} href={`/tickets/${params.row.ticketNumber}/edit`} size="small">
                    <EditIcon fontSize="small" />
                </IconButton>
            </Tooltip>
        </Box>
      ),
    }
  ], [userMap]); // Dependency ensures columns update only if users change

  return (
    <Paper>
      <DataGrid
        rows={tickets}
        columns={columns}
        initialState={{
          pagination: {
            paginationModel: { page: 0, pageSize: 10 },
          },
          columns: {
            columnVisibilityModel: {
                customerDescription: false,
                supportDescription: false,
            }
          }
        }}
        pageSizeOptions={[5, 10, 25]}
        disableRowSelectionOnClick
        slots={{ toolbar: GridToolbar }}
        slotProps={{
            toolbar: {
                showQuickFilter: true,
            },
        }}
        autoHeight
      />
    </Paper>
  );
}

// CHANGE: Export the memoized version of the component
export default memo(TicketTableComponent);
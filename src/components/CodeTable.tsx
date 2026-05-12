'use client';

import { useMemo, memo } from 'react';
import { CodeSnippetData } from '@/types';
import { DataGrid, GridColDef, GridToolbar } from '@mui/x-data-grid';
import Link from 'next/link';
import { Box, Tooltip, IconButton, Paper, Link as MuiLink, Chip } from '@mui/material';
import { Edit as EditIcon, Visibility as VisibilityIcon } from '@mui/icons-material';

type CodeTableProps = {
  codes: CodeSnippetData[];
};

function CodeTableComponent({ codes }: CodeTableProps) {
  const columns: GridColDef[] = useMemo(() => [
    {
      field: 'id',
      headerName: 'Snippet ID',
      width: 150,
      renderCell: (params) => (
        <MuiLink component={Link} href={`/code/${params.value}`} underline="hover">
          {params.value}
        </MuiLink>
      ),
    },
    { field: 'subject', headerName: 'Subject', flex: 1, minWidth: 250 },
    {
      field: 'language',
      headerName: 'Language',
      width: 150,
      renderCell: (params) => (
        <Chip label={params.value} color="primary" size="small" variant="outlined" />
      ),
    },
    {
      field: 'tags',
      headerName: 'Tags',
      width: 200,
      valueGetter: (value) => value ? (value as string[]).join(', ') : '',
    },
    {
      field: 'updatedAt',
      headerName: 'Last Modified',
      width: 200,
      type: 'dateTime',
      valueGetter: (value) => value ? new Date(value) : null,
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
            <Tooltip title="View Snippet">
                <IconButton component={Link} href={`/code/${params.row.id}`} size="small">
                    <VisibilityIcon fontSize="small" />
                </IconButton>
            </Tooltip>
            <Tooltip title="Edit Snippet">
                <IconButton component={Link} href={`/code/${params.row.id}/edit`} size="small">
                    <EditIcon fontSize="small" />
                </IconButton>
            </Tooltip>
        </Box>
      ),
    }
  ], []);

  return (
    <Paper>
      <DataGrid
        rows={codes}
        columns={columns}
        initialState={{
          pagination: {
            paginationModel: { page: 0, pageSize: 10 },
          },
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

export default memo(CodeTableComponent);

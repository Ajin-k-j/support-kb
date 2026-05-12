'use client';

import { useState, useEffect, useRef } from 'react';
import { collection, onSnapshot, query, writeBatch, doc, serverTimestamp, Timestamp, setDoc, deleteDoc, updateDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { listenToAllUsers } from '@/lib/users';
import { listenToAllKBs, listenToAllCodeSnippets } from '@/lib/firestore';
import { TicketData, UserData, InvestigationEntry, KBData, CodeSnippetData } from '@/types';
import Papa from 'papaparse';
import 'bootstrap/dist/css/bootstrap.min.css';
import RoleGuard from '@/components/RoleGuard';

// Declare the bootstrap global variable to TypeScript.
declare const bootstrap: any;

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

type ItemType = { id: string; name: string };

export default function AdminPage() {
  const [tickets, setTickets] = useState<TicketData[]>([]);
  const [filteredTickets, setFilteredTickets] = useState<TicketData[]>([]);
  const [kbs, setKbs] = useState<KBData[]>([]);
  const [codes, setCodes] = useState<CodeSnippetData[]>([]);
  const [userMap, setUserMap] = useState<Map<string, UserData>>(new Map());
  const [allUsers, setAllUsers] = useState<UserData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isClient, setIsClient] = useState(false);
  const [selectedTickets, setSelectedTickets] = useState<string[]>([]);
  const [selectedKbs, setSelectedKbs] = useState<string[]>([]);
  const [selectedCodes, setSelectedCodes] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [impactFilter, setImpactFilter] = useState('');
  const [sortField, setSortField] = useState<keyof TicketData | ''>('');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [newLogType, setNewLogType] = useState('');
  const [newCategory, setNewCategory] = useState('');
  const [logTypes, setLogTypes] = useState<ItemType[]>([]);
  const [categories, setCategories] = useState<ItemType[]>([]);
  const [editItem, setEditItem] = useState<{ id: string; name: string; type: 'category' | 'logType' } | null>(null);
  const [newName, setNewName] = useState('');
  const [activeTab, setActiveTab] = useState<'table' | 'kbs' | 'codes' | 'logTypes' | 'categories' | 'users'>('table');
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setIsClient(true);
    import('bootstrap/dist/js/bootstrap.bundle.min.js');
  }, []);

  useEffect(() => {
    if (editItem && modalRef.current) {
      setNewName(editItem.name);
      const modal = new bootstrap.Modal(modalRef.current);
      modal.show();
    }
  }, [editItem]);

  useEffect(() => {
    const unsubscribeUsers = listenToAllUsers((users) => {
        if (users) {
            setAllUsers(users);
            setUserMap(new Map(users.map((u) => [u.uid, u])));
        } else {
            setError('Failed to fetch users');
            setLoading(false);
        }
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
        setTickets(ticketData);
        setFilteredTickets(ticketData);
        setLoading(false);
      },
      (err) => {
        console.error('Firestore ticket fetch error:', err);
        setError('Failed to fetch tickets');
        setLoading(false);
      }
    );

    const unsubscribeLogTypes = onSnapshot(
      query(collection(db, 'investigationLogTypes')),
      (snapshot) => {
        const types = snapshot.docs.map((doc) => ({ id: doc.id, name: doc.data().name as string }));
        setLogTypes(types);
      },
      (err) => console.error('Error fetching log types:', err)
    );

    const unsubscribeCategories = onSnapshot(
      query(collection(db, 'ticketCategories')),
      (snapshot) => {
        const cats = snapshot.docs.map((doc) => ({ id: doc.id, name: doc.data().name as string }));
        setCategories(cats);
      },
      (err) => console.error('Error fetching categories:', err)
    );

    const unsubscribeKBs = listenToAllKBs(setKbs);
    const unsubscribeCodes = listenToAllCodeSnippets(setCodes);

    return () => {
      unsubscribeUsers();
      unsubscribeTickets();
      unsubscribeLogTypes();
      unsubscribeCategories();
      unsubscribeKBs();
      unsubscribeCodes();
    };
  }, []);

  useEffect(() => {
    let result = [...tickets];
    if (searchTerm) {
      result = result.filter(
        (t) =>
          t.ticketNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
          t.title.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    if (statusFilter) {
      result = result.filter((t) => t.status === statusFilter);
    }
    if (categoryFilter) {
      result = result.filter((t) => t.category === categoryFilter);
    }
    if (impactFilter) {
      result = result.filter((t) => t.businessImpact === impactFilter);
    }
    if (sortField) {
      result.sort((a, b) => {
        if (sortField === 'lastModified') {
          const aDate = a.lastModified ? new Date(a.lastModified).getTime() : 0;
          const bDate = b.lastModified ? new Date(b.lastModified).getTime() : 0;
          return sortOrder === 'asc' ? aDate - bDate : bDate - aDate;
        }
        
        const aValue = a[sortField];
        const bValue = b[sortField];

        if (typeof aValue === 'string' && typeof bValue === 'string') {
            return sortOrder === 'asc'
            ? aValue.localeCompare(bValue)
            : bValue.localeCompare(aValue);
        }
        return 0;
      });
    }
    setFilteredTickets(result);
  }, [tickets, searchTerm, statusFilter, categoryFilter, impactFilter, sortField, sortOrder]);

  const handleDeleteSelected = async () => {
    if (selectedTickets.length === 0) {
      alert('Please select tickets to delete.');
      return;
    }
    if (window.confirm(`Are you sure you want to delete ${selectedTickets.length} selected ticket(s)?`)) {
      try {
        const batch = writeBatch(db);
        selectedTickets.forEach((id) => {
          batch.delete(doc(db, 'ticketResolutions', id));
        });
        await batch.commit();
        alert('Selected tickets have been deleted.');
        setSelectedTickets([]);
      } catch (error) {
        console.error('Error deleting tickets:', error);
        alert('Failed to delete tickets.');
      }
    }
  };

  const handleDeleteSelectedKbs = async () => {
    if (selectedKbs.length === 0) return alert('Please select KB entries to delete.');
    if (window.confirm(`Delete ${selectedKbs.length} selected KB(s)?`)) {
      try {
        const batch = writeBatch(db);
        selectedKbs.forEach((id) => batch.delete(doc(db, 'knowledgeBase', id)));
        await batch.commit();
        alert('Selected KBs deleted.');
        setSelectedKbs([]);
      } catch (error) {
        console.error('Error deleting KBs:', error);
        alert('Failed to delete KBs.');
      }
    }
  };

  const handleDeleteSelectedCodes = async () => {
    if (selectedCodes.length === 0) return alert('Please select Code Snippets to delete.');
    if (window.confirm(`Delete ${selectedCodes.length} selected Code Snippet(s)?`)) {
      try {
        const batch = writeBatch(db);
        selectedCodes.forEach((id) => batch.delete(doc(db, 'codeSnippets', id)));
        await batch.commit();
        alert('Selected Code Snippets deleted.');
        setSelectedCodes([]);
      } catch (error) {
        console.error('Error deleting Codes:', error);
        alert('Failed to delete Codes.');
      }
    }
  };

  const handleDownloadCSV = () => {
    if (selectedTickets.length === 0) {
      alert('Please select tickets to download.');
      return;
    }
    const selectedTicketsData = filteredTickets.filter((t) => selectedTickets.includes(t.id));
    const dataToExport = selectedTicketsData.map((t) => ({
      ...t,
      assignedUsers: (t.assignedUsers || []).map((uid) => userMap.get(uid)?.displayName || uid).join(', '),
      investigationLog: JSON.stringify(t.investigationLog || []),
      createdAt: t.createdAt ? new Date(t.createdAt).toLocaleString() : '',
      lastModified: t.lastModified ? new Date(t.lastModified).toLocaleString() : '',
      supportingLinks: (t.supportingLinks || []).join(', '),
      customerDescription: t.customerDescription,
      supportDescription: t.supportDescription,
    }));

    const csv = Papa.unparse(dataToExport);
    downloadFile(csv, 'tickets.csv', 'text/csv;charset=utf-8;');
  };

  const handleDownloadJSON = () => {
    if (selectedTickets.length === 0) {
      alert('Please select tickets to download.');
      return;
    }
    const selectedTicketsData = filteredTickets.filter((t) => selectedTickets.includes(t.id));
    const dataToExport = selectedTicketsData.map((t) => ({
      ...t,
      assignedUsers: (t.assignedUsers || []).map((uid) => userMap.get(uid)?.displayName || uid).join(', '),
      investigationLog: t.investigationLog || [],
      createdAt: t.createdAt ? new Date(t.createdAt).toLocaleString() : '',
      lastModified: t.lastModified ? new Date(t.lastModified).toLocaleString() : '',
      supportingLinks: t.supportingLinks || [],
      customerDescription: t.customerDescription,
      supportDescription: t.supportDescription,
    }));

    const json = JSON.stringify(dataToExport, null, 2);
    downloadFile(json, 'tickets.json', 'application/json;charset=utf-8;');
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
    event.target.value = '';
  };

  const handleCheckboxChange = (id: string) => {
    setSelectedTickets((prev) =>
      prev.includes(id) ? prev.filter((ticketId) => ticketId !== id) : [...prev, id]
    );
  };

  const handleAddLogType = async () => {
    if (!newLogType.trim()) {
      alert('Please enter a valid investigation log type.');
      return;
    }
    try {
      await setDoc(doc(collection(db, 'investigationLogTypes')), { name: newLogType.trim() });
      setNewLogType('');
      alert('Investigation log type added successfully.');
    } catch (error) {
      console.error('Error adding log type:', error);
      alert('Failed to add investigation log type.');
    }
  };

  const handleAddCategory = async () => {
    if (!newCategory.trim()) {
      alert('Please enter a valid category.');
      return;
    }
    try {
      await setDoc(doc(collection(db, 'ticketCategories')), { name: newCategory.trim() });
      setNewCategory('');
      alert('Category added successfully.');
    } catch (error) {
      console.error('Error adding category:', error);
      alert('Failed to add category.');
    }
  };

  const handleSaveEdit = async () => {
    if (editItem && newName.trim() && modalRef.current) {
      try {
        await setDoc(doc(db, editItem.type === 'category' ? 'ticketCategories' : 'investigationLogTypes', editItem.id), { name: newName.trim() });
        alert('Updated successfully.');
        const modal = bootstrap.Modal.getInstance(modalRef.current);
        modal?.hide();
        setEditItem(null);
      } catch (error) {
        console.error('Error updating item:', error);
        alert('Failed to update.');
      }
    }
  };

  const handleDeleteItem = async (id: string, type: 'category' | 'logType') => {
    if (window.confirm(`Are you sure you want to delete this ${type}?`)) {
      try {
        await deleteDoc(doc(db, type === 'category' ? 'ticketCategories' : 'investigationLogTypes', id));
        alert('Deleted successfully.');
      } catch (error) {
        console.error('Error deleting item:', error);
        alert('Failed to delete.');
      }
    }
  };

  const handleRoleChange = async (userId: string, newRole: 'hduser' | 'admin' | null) => {
    try {
      await updateDoc(doc(db, 'users', userId), { role: newRole });
      alert('User role updated successfully.');
    } catch (error) {
      console.error('Error updating user role:', error);
      alert('Failed to update user role.');
    }
  };

  const getStatusClass = (status: string) => {
    switch (status) {
      case 'Open':
        return 'badge bg-info text-dark';
      case 'InProgress':
        return 'badge bg-warning text-dark';
      case 'Resolved':
      case 'Closed':
        return 'badge bg-success';
      default:
        return 'badge bg-secondary';
    }
  };

  if (!isClient || loading || error) {
    return (
      <div className="container py-5 text-center">
        {error ? (
          <div className="alert alert-danger">{error}</div>
        ) : (
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        )}
      </div>
    );
  }

  return (
    <RoleGuard requireAdmin={true}>
      <div className="container py-2">
        <style jsx global>{`
          .ticket-table { width: 100%; border-collapse: collapse; }
          .ticket-table th, .ticket-table td { border: 1px solid #dee2e6; padding: 8px; text-align: left; }
          .ticket-table th { background-color: #f8f9fa; font-weight: 600; }
          .ticket-table tbody tr:hover { background-color: #f1f3f5; }
          .badge { padding: 4px 8px; border-radius: 12px; }
          .action-links a { margin-right: 8px; color: #4f46e5; text-decoration: none; }
          .action-links a:hover { text-decoration: underline; }
          .filter-group { display: flex; flex-wrap: wrap; gap: 10px; align-items: center; }
        `}</style>
        <h2 className="mb-3 text-gray-800">Admin Panel</h2>

        {/* Tab Navigation */}
        <div className="mb-3">
          <div className="btn-group" role="group">
            <button
              className={`btn ${activeTab === 'table' ? 'btn-primary' : 'btn-outline-primary'} rounded-start`}
              onClick={() => setActiveTab('table')}
            >
              Tickets
            </button>
            <button
              className={`btn ${activeTab === 'kbs' ? 'btn-primary' : 'btn-outline-primary'}`}
              onClick={() => setActiveTab('kbs')}
            >
              Knowledge Base
            </button>
            <button
              className={`btn ${activeTab === 'codes' ? 'btn-primary' : 'btn-outline-primary'}`}
              onClick={() => setActiveTab('codes')}
            >
              Code Snippets
            </button>
            <button
              className={`btn ${activeTab === 'users' ? 'btn-primary' : 'btn-outline-primary'}`}
              onClick={() => setActiveTab('users')}
            >
              Users
              {allUsers.filter(u => !u.role).length > 0 && (
                <span className="badge bg-danger ms-2 rounded-pill">
                  {allUsers.filter(u => !u.role).length}
                </span>
              )}
            </button>
            <button
              className={`btn ${activeTab === 'logTypes' ? 'btn-primary' : 'btn-outline-primary'}`}
              onClick={() => setActiveTab('logTypes')}
            >
              Log Types
            </button>
            <button
              className={`btn ${activeTab === 'categories' ? 'btn-primary' : 'btn-outline-primary'} rounded-end`}
              onClick={() => setActiveTab('categories')}
            >
              Categories
            </button>
          </div>
        </div>

        {/* Edit Modal */}
        <div ref={modalRef} className="modal fade" id="editModal" tabIndex={-1} aria-labelledby="editModalLabel" aria-hidden="true">
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h1 className="modal-title fs-5" id="editModalLabel">Edit {editItem?.type === 'category' ? 'Category' : 'Log Type'}</h1>
                <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close" onClick={() => setEditItem(null)}></button>
              </div>
              <div className="modal-body">
                <input
                  type="text"
                  className="form-control"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                />
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" data-bs-dismiss="modal" onClick={() => setEditItem(null)}>Close</button>
                <button type="button" className="btn btn-primary" onClick={handleSaveEdit}>Save changes</button>
              </div>
            </div>
          </div>
        </div>

        {/* Tickets Tab */}
        {activeTab === 'table' && (
          <div className="card p-3 shadow-sm border-0 rounded-lg">
            {/* Filters and Sorting */}
            <div className="mb-3">
              <h5 className="mb-2 text-gray-700">Filters & Sorting</h5>
              <div className="filter-group">
                <input
                  type="text"
                  className="form-control rounded-lg"
                  placeholder="Search by Ticket ID or Title"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  style={{ maxWidth: '200px' }}
                />
                <select
                  className="form-select rounded-lg"
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  style={{ maxWidth: '150px' }}
                >
                  <option value="">All Statuses</option>
                  <option value="Open">Open</option>
                  <option value="InProgress">In Progress</option>
                  <option value="Pending">Pending</option>
                  <option value="Resolved">Resolved</option>
                  <option value="Closed">Closed</option>
                </select>
                <select
                  className="form-select rounded-lg"
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                  style={{ maxWidth: '150px' }}
                >
                  <option value="">All Categories</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.name}>{cat.name}</option>
                  ))}
                </select>
                <select
                  className="form-select rounded-lg"
                  value={impactFilter}
                  onChange={(e) => setImpactFilter(e.target.value)}
                  style={{ maxWidth: '150px' }}
                >
                  <option value="">All Impacts</option>
                  <option value="Low">Low</option>
                  <option value="Medium">Medium</option>
                  <option value="High">High</option>
                  <option value="Critical">Critical</option>
                </select>
                <select
                  className="form-select rounded-lg"
                  value={sortField}
                  onChange={(e) => setSortField(e.target.value as keyof TicketData)}
                  style={{ maxWidth: '150px' }}
                >
                  <option value="">Sort By</option>
                  <option value="ticketNumber">Ticket ID</option>
                  <option value="title">Title</option>
                  <option value="status">Status</option>
                  <option value="category">Category</option>
                  <option value="lastModified">Last Modified</option>
                  <option value="businessImpact">Business Impact</option>
                </select>
                <select
                  className="form-select rounded-lg"
                  value={sortOrder}
                  onChange={(e) => setSortOrder(e.target.value as 'asc' | 'desc')}
                  style={{ maxWidth: '100px' }}
                >
                  <option value="asc">Ascending</option>
                  <option value="desc">Descending</option>
                </select>
              </div>
            </div>

            {/* Actions */}
            <div className="mb-3 d-flex flex-wrap gap-2 align-items-center">
              <button
                className="btn btn-secondary rounded-lg"
                onClick={handleDownloadCSV}
                disabled={selectedTickets.length === 0}
              >
                Export CSV
              </button>
              <button
                className="btn btn-secondary rounded-lg"
                onClick={handleDownloadJSON}
                disabled={selectedTickets.length === 0}
              >
                Export JSON
              </button>
              <button
                className="btn btn-danger rounded-lg"
                onClick={handleDeleteSelected}
                disabled={selectedTickets.length === 0}
              >
                Delete Selected
              </button>
              <label className="btn btn-outline-primary rounded-lg">
                Upload JSON
                <input
                  type="file"
                  accept=".json"
                  onChange={handleFileUpload}
                  style={{ display: 'none' }}
                />
              </label>
            </div>

            {/* Ticket Table */}
            <table className="ticket-table">
              <thead>
                <tr>
                  <th style={{ width: '50px' }}>
                    <input
                      type="checkbox"
                      checked={selectedTickets.length === filteredTickets.length && filteredTickets.length > 0}
                      onChange={() =>
                        setSelectedTickets(
                          selectedTickets.length === filteredTickets.length ? [] : filteredTickets.map((t) => t.id)
                        )
                      }
                    />
                  </th>
                  <th>Ticket ID</th>
                  <th>Title</th>
                  <th>Status</th>
                  <th>Category</th>
                  <th>Assigned To</th>
                  <th>Last Modified</th>
                  <th>Business Impact</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredTickets.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="text-center">
                      No tickets found
                    </td>
                  </tr>
                ) : (
                  filteredTickets.map((ticket) => (
                    <tr key={ticket.id}>
                      <td>
                        <input
                          type="checkbox"
                          checked={selectedTickets.includes(ticket.id)}
                          onChange={() => handleCheckboxChange(ticket.id)}
                        />
                      </td>
                      <td>
                        <a href={`/tickets/${ticket.ticketNumber}`} className="text-decoration-none">
                          {ticket.ticketNumber || 'N/A'}
                        </a>
                      </td>
                      <td>{ticket.title}</td>
                      <td>
                        <span className={getStatusClass(ticket.status)}>{ticket.status}</span>
                      </td>
                      <td>{ticket.category}</td>
                      <td>
                        {(ticket.assignedUsers || [])
                          .map((uid) => userMap.get(uid)?.displayName || uid)
                          .join(', ')}
                      </td>
                      <td>{ticket.lastModified ? new Date(ticket.lastModified).toLocaleString() : ''}</td>
                      <td>{ticket.businessImpact}</td>
                      <td className="action-links">
                        <a href={`/tickets/${ticket.ticketNumber}`} title="View Ticket">
                          View
                        </a>
                        <a href={`/tickets/${ticket.ticketNumber}/edit`} title="Edit Ticket">
                          Edit
                        </a>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* KBs Tab */}
        {activeTab === 'kbs' && (
          <div className="card p-3 shadow-sm border-0 rounded-lg">
            <h5 className="mb-2 text-gray-700">Knowledge Base Entries</h5>
            <div className="mb-3 d-flex flex-wrap gap-2 align-items-center">
              <button
                className="btn btn-danger rounded-lg"
                onClick={handleDeleteSelectedKbs}
                disabled={selectedKbs.length === 0}
              >
                Delete Selected
              </button>
            </div>
            <table className="ticket-table">
              <thead>
                <tr>
                  <th style={{ width: '50px' }}>
                    <input
                      type="checkbox"
                      checked={selectedKbs.length === kbs.length && kbs.length > 0}
                      onChange={() => setSelectedKbs(selectedKbs.length === kbs.length ? [] : kbs.map(k => k.id))}
                    />
                  </th>
                  <th>ID</th>
                  <th>Subject</th>
                  <th>Tags</th>
                  <th>Last Modified</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {kbs.length === 0 ? (
                  <tr><td colSpan={6} className="text-center">No KB entries found</td></tr>
                ) : (
                  kbs.map((kb) => (
                    <tr key={kb.id}>
                      <td>
                        <input
                          type="checkbox"
                          checked={selectedKbs.includes(kb.id)}
                          onChange={() => setSelectedKbs(prev => prev.includes(kb.id) ? prev.filter(id => id !== kb.id) : [...prev, kb.id])}
                        />
                      </td>
                      <td><a href={`/kb/${kb.id}`}>{kb.id}</a></td>
                      <td>{kb.subject}</td>
                      <td>{kb.tags?.join(', ')}</td>
                      <td>{kb.updatedAt ? new Date(kb.updatedAt).toLocaleString() : ''}</td>
                      <td className="action-links">
                        <a href={`/kb/${kb.id}`}>View</a>
                        <a href={`/kb/${kb.id}/edit`}>Edit</a>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* Codes Tab */}
        {activeTab === 'codes' && (
          <div className="card p-3 shadow-sm border-0 rounded-lg">
            <h5 className="mb-2 text-gray-700">Code Snippets</h5>
            <div className="mb-3 d-flex flex-wrap gap-2 align-items-center">
              <button
                className="btn btn-danger rounded-lg"
                onClick={handleDeleteSelectedCodes}
                disabled={selectedCodes.length === 0}
              >
                Delete Selected
              </button>
            </div>
            <table className="ticket-table">
              <thead>
                <tr>
                  <th style={{ width: '50px' }}>
                    <input
                      type="checkbox"
                      checked={selectedCodes.length === codes.length && codes.length > 0}
                      onChange={() => setSelectedCodes(selectedCodes.length === codes.length ? [] : codes.map(k => k.id))}
                    />
                  </th>
                  <th>ID</th>
                  <th>Subject</th>
                  <th>Language</th>
                  <th>Tags</th>
                  <th>Last Modified</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {codes.length === 0 ? (
                  <tr><td colSpan={7} className="text-center">No Code Snippets found</td></tr>
                ) : (
                  codes.map((code) => (
                    <tr key={code.id}>
                      <td>
                        <input
                          type="checkbox"
                          checked={selectedCodes.includes(code.id)}
                          onChange={() => setSelectedCodes(prev => prev.includes(code.id) ? prev.filter(id => id !== code.id) : [...prev, code.id])}
                        />
                      </td>
                      <td><a href={`/code/${code.id}`}>{code.id}</a></td>
                      <td>{code.subject}</td>
                      <td><span className="badge bg-primary">{code.language}</span></td>
                      <td>{code.tags?.join(', ')}</td>
                      <td>{code.updatedAt ? new Date(code.updatedAt).toLocaleString() : ''}</td>
                      <td className="action-links">
                        <a href={`/code/${code.id}`}>View</a>
                        <a href={`/code/${code.id}/edit`}>Edit</a>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* Users Tab */}
        {activeTab === 'users' && (
          <div className="card p-3 shadow-sm border-0 rounded-lg">
            <h5 className="mb-3 text-gray-700">User Management</h5>
            <table className="ticket-table">
              <thead>
                <tr>
                  <th>Display Name</th>
                  <th>Email</th>
                  <th>Current Role</th>
                  <th>Assign Role</th>
                </tr>
              </thead>
              <tbody>
                {allUsers.map((u) => (
                  <tr key={u.uid}>
                    <td>{u.displayName || 'N/A'}</td>
                    <td>{u.email}</td>
                    <td>
                      {!u.role ? (
                        <span className="badge bg-secondary">Pending Approval</span>
                      ) : u.role === 'admin' ? (
                        <span className="badge bg-danger">Admin</span>
                      ) : (
                        <span className="badge bg-primary">HD User</span>
                      )}
                    </td>
                    <td>
                      <select
                        className="form-select form-select-sm"
                        style={{ maxWidth: '150px' }}
                        value={u.role || ''}
                        onChange={(e) => handleRoleChange(u.uid, e.target.value as 'hduser' | 'admin' | null || null)}
                      >
                        <option value="">Pending (Null)</option>
                        <option value="hduser">HD User</option>
                        <option value="admin">Admin</option>
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Log Types Tab */}
        {activeTab === 'logTypes' && (
          <div className="card p-3 shadow-sm border-0 rounded-lg">
            <h5 className="mb-2 text-gray-700">Manage Investigation Log Types</h5>
            <div className="d-flex gap-2 mb-3">
              <input
                type="text"
                className="form-control rounded-lg"
                placeholder="New Log Type"
                value={newLogType}
                onChange={(e) => setNewLogType(e.target.value)}
                style={{ maxWidth: '200px' }}
              />
              <button className="btn btn-primary rounded-lg" onClick={handleAddLogType}>
                Add Log Type
              </button>
            </div>
            <ul className="list-group">
              {logTypes.map((item) => (
                <li key={item.id} className="list-group-item d-flex justify-content-between align-items-center">
                  {item.name}
                  <div>
                    <button className="btn btn-sm btn-primary me-2" onClick={() => setEditItem({ id: item.id, name: item.name, type: 'logType' })}>
                      Edit
                    </button>
                    <button className="btn btn-sm btn-danger" onClick={() => handleDeleteItem(item.id, 'logType')}>
                      Delete
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Categories Tab */}
        {activeTab === 'categories' && (
          <div className="card p-3 shadow-sm border-0 rounded-lg">
            <h5 className="mb-2 text-gray-700">Manage Ticket Categories</h5>
            <div className="d-flex gap-2 mb-3">
              <input
                type="text"
                className="form-control rounded-lg"
                placeholder="New Category"
                value={newCategory}
                onChange={(e) => setNewCategory(e.target.value)}
                style={{ maxWidth: '200px' }}
              />
              <button className="btn btn-primary rounded-lg" onClick={handleAddCategory}>
                Add Category
              </button>
            </div>
            <ul className="list-group">
              {categories.map((item) => (
                <li key={item.id} className="list-group-item d-flex justify-content-between align-items-center">
                  {item.name}
                  <div>
                    <button className="btn btn-sm btn-primary me-2" onClick={() => setEditItem({ id: item.id, name: item.name, type: 'category' })}>
                      Edit
                    </button>
                    <button className="btn btn-sm btn-danger" onClick={() => handleDeleteItem(item.id, 'category')}>
                      Delete
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </RoleGuard>
  );
}

'use client';

import { TicketData } from '@/types';

interface TicketTableProps {
  tickets: TicketData[];
}

export default function TicketTable({ tickets }: TicketTableProps) {
  return (
    <div className="table-responsive">
      <table className="table table-striped table-hover">
        <thead>
          <tr>
            <th>Ticket ID</th>
            <th>Title</th>
            <th>Category</th>
            <th>Status</th>
            <th>Last Modified</th>
          </tr>
        </thead>
        <tbody>
          {tickets.length === 0 ? (
            <tr>
              <td colSpan={5} className="text-center">No tickets assigned to you.</td>
            </tr>
          ) : (
            tickets.map((ticket) => (
              <tr key={ticket.id}>
                <td>{ticket.id}</td>
                <td>{ticket.title}</td>
                <td>{ticket.category}</td>
                <td>{ticket.status}</td>
                <td>{new Date(ticket.lastModified).toLocaleDateString()}</td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
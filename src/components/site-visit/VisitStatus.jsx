import React from 'react';
import { Clock, PlayCircle, CheckCircle2, XCircle } from 'lucide-react';

export default function VisitStatus({ status }) {
  switch (status) {
    case 'in_progress':
      return <div className="flex items-center gap-2" style={{ color: '#0284c7', fontWeight: 500 }}><PlayCircle size={16} /> <span>In Progress</span></div>;
    case 'completed':
      return <div className="flex items-center gap-2" style={{ color: 'var(--success)', fontWeight: 500 }}><CheckCircle2 size={16} /> <span>Completed</span></div>;
    case 'cancelled':
      return <div className="flex items-center gap-2" style={{ color: 'var(--danger)', fontWeight: 500 }}><XCircle size={16} /> <span>Cancelled</span></div>;
    case 'pending':
    default:
      return <div className="flex items-center gap-2" style={{ color: 'var(--warning)', fontWeight: 500 }}><Clock size={16} /> <span>Pending</span></div>;
  }
}

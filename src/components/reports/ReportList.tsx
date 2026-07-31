'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { FileText, ChevronRight, CheckCircle, Clock, XCircle, ChevronLeft, ArrowUpDown, ArrowUp, ArrowDown } from 'lucide-react';

interface Report {
  id: number;
  encryptedId: string;
  unitCode: string | null;
  reportDate: string;
  status: string;
  operatorName: string | null;
}

interface ReportListProps {
  reports: Report[];
  role: string;
}

const PAGE_SIZE = 10;

export function ReportList({ reports, role }: ReportListProps) {
  const [page, setPage] = useState(1);
  const [sortField, setSortField] = useState<'reportDate' | 'unitCode' | 'status'>('reportDate');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');

  const toggleSort = (field: typeof sortField) => {
    if (sortField === field) {
      setSortDir(sortDir === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDir('desc');
    }
    setPage(1);
  };

  const sorted = useMemo(() => {
    return [...reports].sort((a, b) => {
      const aVal = a[sortField] ?? '';
      const bVal = b[sortField] ?? '';
      const cmp = String(aVal).localeCompare(String(bVal));
      return sortDir === 'asc' ? cmp : -cmp;
    });
  }, [reports, sortField, sortDir]);

  const totalPages = Math.max(1, Math.ceil(sorted.length / PAGE_SIZE));
  const paged = sorted.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Approved':
        return (
          <span className="flex items-center gap-1 text-xs px-2 py-1 bg-green-900/50 text-green-400 rounded-full border border-green-700">
            <CheckCircle size={12} />
            Approved
          </span>
        );
      case 'Submitted':
        return (
          <span className="flex items-center gap-1 text-xs px-2 py-1 bg-blue-900/50 text-blue-400 rounded-full border border-blue-700">
            <Clock size={12} />
            Pending Leader
          </span>
        );
      case 'PendingSupervisor':
        return (
          <span className="flex items-center gap-1 text-xs px-2 py-1 bg-yellow-900/50 text-yellow-400 rounded-full border border-yellow-700">
            <Clock size={12} />
            Pending Supervisor
          </span>
        );
      case 'Rejected':
        return (
          <span className="flex items-center gap-1 text-xs px-2 py-1 bg-red-900/50 text-red-400 rounded-full border border-red-700">
            <XCircle size={12} />
            Rejected
          </span>
        );
      default:
        return (
          <span className="text-xs px-2 py-1 bg-gray-700 text-gray-300 rounded-full">
            {status}
          </span>
        );
    }
  };

  const SortIcon = ({ field }: { field: typeof sortField }) => {
    if (sortField !== field) return <ArrowUpDown size={14} className="text-gray-500" />;
    return sortDir === 'asc'
      ? <ArrowUp size={14} className="text-primary" />
      : <ArrowDown size={14} className="text-primary" />;
  };

  if (reports.length === 0) {
    return (
      <div className="bg-gray-800 rounded-xl p-8 border border-gray-700 text-center">
        <FileText size={48} className="text-gray-600 mx-auto mb-4" />
        <p className="text-gray-400">No reports yet.</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 text-sm text-gray-400">
        <span>Sort by:</span>
        <button onClick={() => toggleSort('reportDate')} className="flex items-center gap-1 px-2 py-1 rounded-lg hover:bg-gray-800 transition-colors">
          Date <SortIcon field="reportDate" />
        </button>
        <button onClick={() => toggleSort('unitCode')} className="flex items-center gap-1 px-2 py-1 rounded-lg hover:bg-gray-800 transition-colors">
          Unit <SortIcon field="unitCode" />
        </button>
        <button onClick={() => toggleSort('status')} className="flex items-center gap-1 px-2 py-1 rounded-lg hover:bg-gray-800 transition-colors">
          Status <SortIcon field="status" />
        </button>
      </div>

      {paged.map((report) => (
        <Link
          key={report.id}
          href={`/reports/${report.encryptedId}`}
          className="block bg-gray-800 rounded-xl p-4 border border-gray-700 hover:border-gray-600 transition-colors"
        >
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <p className="font-medium text-lg text-white">{report.unitCode || 'Unknown Unit'}</p>
                {getStatusBadge(report.status)}
              </div>
              <div className="flex items-center gap-4 text-sm text-gray-400">
                <span>{report.operatorName}</span>
                <span>•</span>
                <span>{new Date(report.reportDate).toLocaleDateString('en-ID', { 
                  day: 'numeric', 
                  month: 'short', 
                  year: 'numeric' 
                })}</span>
              </div>
            </div>
            <ChevronRight className="text-gray-500" size={20} />
          </div>
        </Link>
      ))}

      {totalPages > 1 && (
        <div className="flex items-center justify-between pt-2">
          <p className="text-sm text-gray-500">
            {sorted.length} reports • Page {page} of {totalPages}
          </p>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setPage(Math.max(1, page - 1))}
              disabled={page === 1}
              className="p-2 rounded-lg bg-gray-800 border border-gray-700 text-gray-300 hover:bg-gray-700 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronLeft size={16} />
            </button>
            <button
              onClick={() => setPage(Math.min(totalPages, page + 1))}
              disabled={page === totalPages}
              className="p-2 rounded-lg bg-gray-800 border border-gray-700 text-gray-300 hover:bg-gray-700 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

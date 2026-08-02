'use client';

import { useState } from 'react';
import { CheckCircle, Clock, XCircle, User, Calendar, FileText, AlertTriangle, X, MapPin, Droplets, Hash, Gauge } from 'lucide-react';

const CONDITION_LABELS: Record<string, string> = { G: 'Baik', B: 'Buruk', U: 'Ganti' };
const CONDITION_COLORS: Record<string, string> = { G: 'bg-green-600', B: 'bg-yellow-500', U: 'bg-red-600' };

const ACTION_LABELS: Record<string, string> = {
  '1': 'Tindakan Sekarang',
  '2': 'Tindakan saat Ganti Shift',
  '3': 'Tindakan pada PS Berikutnya',
  '4': 'Tindakan pada Jadwal Backlog',
};

interface FluidAddition {
  fluidType: string;
  quantity: number;
}

interface ReportResult {
  category: string | null;
  description: string | null;
  condition: string;
  conditionCode: string | null;
  photoUrl: string | null;
  notes: string | null;
  actionCode: string | null;
}

interface ReportDetailProps {
  report: {
    id: number;
    status: string;
    reportDate: string;
    hm: number | null;
    serialNumber: string | null;
    woJono: string | null;
    zone: string | null;
    inspectionStart: string | null;
    rejectionReason: string | null;
    gpsLatitude: number | null;
    gpsLongitude: number | null;
    gpsAccuracy: number | null;
    gpsTimestamp: string | null;
    createdAt: Date | string;
    updatedAt: Date | string;
  };
  unit: {
    unitCode: string;
    modelName: string;
  };
  operator: {
    fullName: string;
  };
  results: ReportResult[];
  fluidAdditions: FluidAddition[];
}

export function ReportDetail({ report, unit, operator, results, fluidAdditions }: ReportDetailProps) {
  const [previewPhoto, setPreviewPhoto] = useState<{ src: string; alt: string } | null>(null);

  const getStatusBadge = () => {
    switch (report.status) {
      case 'Approved':
        return (
          <span className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-full font-medium">
            <CheckCircle size={18} />
            Disetujui
          </span>
        );
      case 'Submitted':
        return (
          <span className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-full font-medium">
            <Clock size={18} />
            Menunggu Instruktur
          </span>
        );
      case 'PendingSupervisor':
        return (
          <span className="flex items-center gap-2 bg-yellow-600 text-white px-4 py-2 rounded-full font-medium">
            <Clock size={18} />
            Menunggu Dosen
          </span>
        );
      case 'Rejected':
        return (
          <span className="flex items-center gap-2 bg-red-600 text-white px-4 py-2 rounded-full font-medium">
            <XCircle size={18} />
            Ditolak
          </span>
        );
      default:
        return (
          <span className="flex items-center gap-2 bg-gray-600 text-white px-4 py-2 rounded-full font-medium">
            {report.status}
          </span>
        );
    }
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('id-ID', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  };

  const formatDateTime = (dateStr: Date | string) => {
    return new Date(dateStr).toLocaleString('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const hasUnitExtra = report.serialNumber || report.woJono || report.zone || report.inspectionStart || report.hm;

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="bg-gray-800 p-6 rounded-xl border border-gray-700">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h2 className="text-2xl font-bold text-white">{unit?.unitCode || 'Unit Tidak Diketahui'}</h2>
            <p className="text-gray-400">{unit?.modelName}</p>
          </div>
          {getStatusBadge()}
        </div>

        <div className="grid grid-cols-2 gap-4 text-sm mt-6">
          <div className="flex items-center gap-3">
            <User className="text-gray-400" size={18} />
            <div>
              <p className="text-gray-400">Inspektor</p>
              <p className="text-white font-medium">{operator?.fullName}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Calendar className="text-gray-400" size={18} />
            <div>
              <p className="text-gray-400">Tanggal</p>
              <p className="text-white font-medium">{formatDate(report.reportDate)}</p>
            </div>
          </div>
        </div>

        {hasUnitExtra && (
          <div className="mt-4 p-3 bg-gray-700/50 rounded-lg grid grid-cols-2 md:grid-cols-3 gap-3 text-sm">
            {report.hm != null && (
              <div>
                <p className="text-gray-400 flex items-center gap-1"><Gauge size={12} /> HM</p>
                <p className="text-white font-medium">{report.hm.toLocaleString()}</p>
              </div>
            )}
            {report.serialNumber && (
              <div>
                <p className="text-gray-400 flex items-center gap-1"><Hash size={12} /> Serial Number</p>
                <p className="text-white font-medium">{report.serialNumber}</p>
              </div>
            )}
            {report.woJono && (
              <div>
                <p className="text-gray-400">WO/JO No</p>
                <p className="text-white font-medium">{report.woJono}</p>
              </div>
            )}
            {report.zone && (
              <div>
                <p className="text-gray-400">Zone</p>
                <p className="text-white font-medium">{report.zone}</p>
              </div>
            )}
            {report.inspectionStart && (
              <div>
                <p className="text-gray-400">Mulai Inspeksi</p>
                <p className="text-white font-medium">{report.inspectionStart}</p>
              </div>
            )}
          </div>
        )}

        {report.gpsLatitude && report.gpsLongitude && (
          <div className="mt-4 p-3 bg-gray-700/50 rounded-lg">
            <div className="flex items-center gap-2 text-gray-300 mb-2">
              <MapPin size={16} className="text-green-400" />
              <p className="text-sm font-medium">Lokasi GPS</p>
            </div>
            <div className="grid grid-cols-2 gap-2 text-xs text-gray-400">
              <p>Lat: {report.gpsLatitude.toFixed(6)}</p>
              <p>Lng: {report.gpsLongitude.toFixed(6)}</p>
              {report.gpsAccuracy && <p>Akurasi: ±{report.gpsAccuracy.toFixed(0)}m</p>}
              {report.gpsTimestamp && <p>Waktu: {formatDateTime(report.gpsTimestamp)}</p>}
            </div>
          </div>
        )}

        {report.rejectionReason && (
          <div className="mt-4 p-4 bg-red-900/30 border border-red-700 rounded-lg">
            <div className="flex items-center gap-2 text-red-400 mb-2">
              <AlertTriangle size={16} />
              <p className="font-medium">Alasan Penolakan</p>
            </div>
            <p className="text-red-300">{report.rejectionReason}</p>
          </div>
        )}

        <div className="mt-4 pt-4 border-t border-gray-700 text-xs text-gray-500">
          <p>Dibuat: {formatDateTime(report.createdAt)}</p>
          <p>Diperbarui: {formatDateTime(report.updatedAt)}</p>
        </div>
      </div>

      {fluidAdditions && fluidAdditions.length > 0 && (
        <div className="bg-gray-800 p-6 rounded-xl border border-gray-700">
          <h3 className="text-lg font-bold text-white flex items-center gap-2 mb-4">
            <Droplets className="text-blue-400" size={20} />
            Penambahan Fluida
          </h3>
          <div className="space-y-2">
            {fluidAdditions.map((fluid, idx) => (
              <div key={idx} className="flex items-center justify-between p-3 bg-gray-700/50 rounded-lg">
                <span className="text-white">{fluid.fluidType}</span>
                <span className="text-gray-300 font-medium">{fluid.quantity} L</span>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="space-y-4">
        <h3 className="text-lg font-bold text-white flex items-center gap-2">
          <FileText className="text-primary" size={20} />
          Hasil Inspeksi
        </h3>
        {results.map((res, idx) => (
          <div key={idx} className="bg-gray-800 p-4 rounded-xl border border-gray-700">
            <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
              <div className="flex-1">
                <p className="text-xs text-gray-500 mb-1">{res.category}</p>
                <p className="text-white font-medium">{res.description}</p>
                {(res.notes || res.actionCode) && (
                  <div className="mt-2 space-y-1">
                    {res.notes && <p className="text-xs text-gray-400">Catatan: {res.notes}</p>}
                    {res.actionCode && ACTION_LABELS[res.actionCode] && (
                      <p className="text-xs text-yellow-400">Aksi: {ACTION_LABELS[res.actionCode]}</p>
                    )}
                  </div>
                )}
              </div>
              <span
                className={`px-4 py-2 font-bold rounded-lg text-center min-w-[3rem] text-white ${
                  CONDITION_COLORS[res.conditionCode || ''] || (res.condition === 'OK' ? 'bg-green-600' : 'bg-red-600')
                }`}
              >
                {CONDITION_LABELS[res.conditionCode || ''] || (res.condition === 'OK' ? 'Baik' : 'Buruk')}
              </span>
            </div>
            {res.photoUrl && res.photoUrl !== 'base64_photo_mock' && (
              <div className="mt-4">
                <p className="text-xs text-gray-400 mb-2">Bukti Foto:</p>
                <button
                  type="button"
                  onClick={() => setPreviewPhoto({ src: res.photoUrl!, alt: `Bukti ${res.description}` })}
                  className="block"
                >
                  <img
                    src={res.photoUrl}
                    alt={`Bukti ${res.description}`}
                    className="w-full max-w-xs h-48 object-cover rounded-lg border border-gray-600 cursor-pointer hover:opacity-80 transition-opacity"
                  />
                </button>
              </div>
            )}
          </div>
        ))}
      </div>

      {previewPhoto && (
        <div
          className="fixed inset-0 z-[200] bg-black/90 backdrop-blur-sm flex items-center justify-center p-4 cursor-pointer"
          onClick={() => setPreviewPhoto(null)}
        >
          <button
            onClick={() => setPreviewPhoto(null)}
            className="absolute top-4 right-4 p-2 bg-gray-800 rounded-full hover:bg-gray-700 transition-colors z-10"
          >
            <X size={24} className="text-white" />
          </button>
          <img
            src={previewPhoto.src}
            alt={previewPhoto.alt}
            className="max-w-full max-h-[90vh] object-contain rounded-lg"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
    </div>
  );
}

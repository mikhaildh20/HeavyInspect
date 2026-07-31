'use client';

import { useState } from 'react';
import { CheckCircle, Clock, XCircle, User, Calendar, FileText, AlertTriangle, X, MapPin, Droplets, Pen } from 'lucide-react';

interface Signature {
  data: string | null;
  name: string;
  role: string;
}

interface FluidAddition {
  fluidType: string;
  quantity: number;
}

interface ReportResult {
  category: string | null;
  description: string | null;
  condition: string;
  photoUrl: string | null;
  notes: string | null;
}

interface ReportDetailProps {
  report: {
    id: number;
    status: string;
    reportDate: string;
    operatorSig: string | null;
    leaderSig: string | null;
    supervisorSig: string | null;
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
  leader: {
    fullName: string;
  } | null;
  supervisor: {
    fullName: string;
  } | null;
  results: ReportResult[];
  fluidAdditions: FluidAddition[];
}

export function ReportDetail({ report, unit, operator, leader, supervisor, results, fluidAdditions }: ReportDetailProps) {
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

  const signatures: Signature[] = [
    { data: report.operatorSig, name: operator?.fullName || '-', role: 'Mahasiswa' },
    { data: report.leaderSig, name: leader?.fullName || '-', role: 'Instruktur' },
    { data: report.supervisorSig, name: supervisor?.fullName || '-', role: 'Dosen' },
  ];

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

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Header Card */}
      <div className="bg-gray-800 p-6 rounded-xl border border-gray-700">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h2 className="text-2xl font-bold text-white">{unit?.unitCode || 'Unit Tidak Diketahui'}</h2>
            <p className="text-gray-400">{unit?.modelName}</p>
          </div>
          {getStatusBadge()}
        </div>

        {/* Info Grid */}
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

        {/* GPS Data */}
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

        {/* Rejection Reason */}
        {report.rejectionReason && (
          <div className="mt-4 p-4 bg-red-900/30 border border-red-700 rounded-lg">
            <div className="flex items-center gap-2 text-red-400 mb-2">
              <AlertTriangle size={16} />
              <p className="font-medium">Alasan Penolakan</p>
            </div>
            <p className="text-red-300">{report.rejectionReason}</p>
          </div>
        )}

        {/* Timestamps */}
        <div className="mt-4 pt-4 border-t border-gray-700 text-xs text-gray-500">
          <p>Dibuat: {formatDateTime(report.createdAt)}</p>
          <p>Diperbarui: {formatDateTime(report.updatedAt)}</p>
        </div>
      </div>

      {/* Signatures */}
      <div className="bg-gray-800 p-6 rounded-xl border border-gray-700">
        <h3 className="text-lg font-bold text-white flex items-center gap-2 mb-4">
          <Pen className="text-primary" size={20} />
          Tanda Tangan
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {signatures.map((sig, idx) => (
            <div
              key={idx}
              className={`p-4 rounded-lg text-center ${
                sig.data ? 'bg-green-900/20 border border-green-700/50' : 'bg-gray-700/50 border border-gray-600'
              }`}
            >
              <p className="text-xs text-gray-400 mb-2">{sig.role}</p>
              {sig.data ? (
                <img
                  src={sig.data}
                  alt={`TTD ${sig.role}`}
                  className="h-20 mx-auto object-contain bg-white/5 rounded-lg p-1"
                />
              ) : (
                <div className="h-20 flex items-center justify-center text-gray-500 text-sm">
                  Belum ditandatangani
                </div>
              )}
              <p className={`text-sm font-medium mt-2 ${sig.data ? 'text-green-400' : 'text-gray-500'}`}>
                {sig.name}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Fluid Additions */}
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

      {/* Inspection Results */}
      <div className="space-y-4">
        <h3 className="text-lg font-bold text-white flex items-center gap-2">
          <FileText className="text-primary" size={20} />
          Hasil Inspeksi
        </h3>
        {results.map((res, idx) => (
          <div key={idx} className="bg-gray-800 p-4 rounded-xl border border-gray-700">
            <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
              <div className="flex-1">
                <p className="text-xs text-gray-500 mb-1">Parameter {res.category}</p>
                <p className="text-white font-medium">{res.description}</p>
                <p className="text-sm text-gray-400 mt-1">
                  Kondisi: {res.notes === 'G' ? 'Baik' : res.notes === 'B' ? 'Buruk' : res.condition}
                </p>
              </div>
              <span
                className={`px-4 py-2 font-bold rounded-lg text-center w-16 ${
                  res.condition === 'OK' ? 'bg-green-600 text-white' : 'bg-red-600 text-white'
                }`}
              >
                {res.condition === 'OK' ? 'G' : 'B'}
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

      {/* Photo Preview Modal */}
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

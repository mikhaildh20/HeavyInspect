'use client';

import { useState } from 'react';
import { SignaturePad } from './SignaturePad';
import { approveP2HReport, rejectP2HReport } from '@/actions/p2h';
import { useRouter } from 'next/navigation';
import { CheckCircle, XCircle, Clock, AlertTriangle, MapPin, Droplets, X, Gauge, Hash, Pen } from 'lucide-react';

const CONDITION_LABELS: Record<string, string> = { G: 'Baik', B: 'Buruk', U: 'Ganti' };
const CONDITION_COLORS: Record<string, string> = { G: 'bg-green-600', B: 'bg-yellow-500', U: 'bg-red-600' };

const ACTION_LABELS: Record<string, string> = {
  '1': 'Tindakan Sekarang',
  '2': 'Tindakan saat Ganti Shift',
  '3': 'Tindakan pada PS Berikutnya',
  '4': 'Tindakan pada Jadwal Backlog',
};

interface ReviewFormProps {
  report: any;
  unit: any;
  operator: any;
  results: any[];
  fluidAdditions?: any[];
  role: string;
}

export function ReviewForm({ report, unit, operator, results, fluidAdditions = [], role }: ReviewFormProps) {
  const router = useRouter();
  const [signature, setSignature] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState('');
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [modal, setModal] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [previewPhoto, setPreviewPhoto] = useState<{ src: string; alt: string } | null>(null);

  const canLeaderApprove = role === 'leader' && report.status === 'Submitted';
  const canSupervisorApprove = role === 'supervisor' && report.status === 'PendingSupervisor' && report.leaderSig;
  const canApprove = canLeaderApprove || canSupervisorApprove;
  
  const canReject = (role === 'leader' && report.status === 'Submitted') ||
                    (role === 'supervisor' && report.status === 'PendingSupervisor');

  const handleApprove = async () => {
    if (!signature) return;
    setIsSubmitting(true);
    try {
      await approveP2HReport(report.id, signature);
      setModal({ type: 'success', message: 'Laporan berhasil disetujui!' });
    } catch (e: any) {
      setModal({ type: 'error', message: e.message || 'Terjadi kesalahan' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReject = async () => {
    if (!rejectReason.trim()) return;
    setIsSubmitting(true);
    try {
      await rejectP2HReport(report.id, rejectReason);
      setModal({ type: 'success', message: 'Laporan telah ditolak dan dikembalikan ke Mahasiswa.' });
    } catch (e: any) {
      setModal({ type: 'error', message: e.message || 'Terjadi kesalahan' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const getStatusBadge = () => {
    switch (report.status) {
      case 'Submitted':
        return (
          <span className="flex items-center gap-2 bg-blue-600 text-white px-3 py-1 rounded-full text-sm font-medium">
            <Clock size={14} />
            Menunggu Instruktur
          </span>
        );
      case 'PendingSupervisor':
        return (
          <span className="flex items-center gap-2 bg-yellow-600 text-white px-3 py-1 rounded-full text-sm font-medium">
            <Clock size={14} />
            Menunggu Dosen
          </span>
        );
      case 'Approved':
        return (
          <span className="flex items-center gap-2 bg-green-600 text-white px-3 py-1 rounded-full text-sm font-medium">
            <CheckCircle size={14} />
            Disetujui
          </span>
        );
      case 'Rejected':
        return (
          <span className="flex items-center gap-2 bg-red-600 text-white px-3 py-1 rounded-full text-sm font-medium">
            <XCircle size={14} />
            Ditolak
          </span>
        );
      default:
        return (
          <span className="bg-gray-600 text-white px-3 py-1 rounded-full text-sm font-medium">
            {report.status}
          </span>
        );
    }
  };

  const formatDateTime = (dateStr: Date | string) => {
    return new Date(dateStr).toLocaleString('id-ID', {
      day: 'numeric', month: 'long', year: 'numeric',
      hour: '2-digit', minute: '2-digit',
    });
  };

  const hasUnitExtra = report.serialNumber || report.woJono || report.zone || report.inspectionStart || report.hm;

  return (
    <>
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="bg-gray-800 p-6 rounded-xl border border-gray-700">
        <h2 className="text-lg font-bold text-white mb-4">Informasi Laporan</h2>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-gray-400">Unit</p>
            <p className="text-white font-medium">{unit?.unitCode}</p>
            <p className="text-gray-500 text-xs">{unit?.modelName}</p>
          </div>
          <div>
            <p className="text-gray-400">Inspektor</p>
            <p className="text-white font-medium">{operator?.fullName}</p>
          </div>
          <div>
            <p className="text-gray-400">Tanggal</p>
            <p className="text-white font-medium">{new Date(report.reportDate).toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}</p>
          </div>
          <div>
            <p className="text-gray-400">Status</p>
            {getStatusBadge()}
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

        {report.rejectionReason && (
          <div className="mt-4 p-3 bg-red-900/30 border border-red-700 rounded-lg">
            <p className="text-red-400 text-sm font-medium">Alasan Penolakan:</p>
            <p className="text-red-300">{report.rejectionReason}</p>
          </div>
        )}

        <div className="mt-4 pt-4 border-t border-gray-700">
          <p className="text-sm font-medium text-gray-300 mb-3 flex items-center gap-2">
            <Pen size={14} /> Status Tanda Tangan
          </p>
          <div className="grid grid-cols-3 gap-2 text-xs">
            <div className={`p-2 rounded ${report.operatorSig ? 'bg-green-900/30 border border-green-700' : 'bg-gray-700'}`}>
              <p className="text-gray-400">Mahasiswa</p>
              <p className={report.operatorSig ? 'text-green-400' : 'text-gray-500'}>
                {report.operatorSig ? '✓ Signed' : 'Belum'}
              </p>
            </div>
            <div className={`p-2 rounded ${report.leaderSig ? 'bg-green-900/30 border border-green-700' : 'bg-gray-700'}`}>
              <p className="text-gray-400">Instruktur</p>
              <p className={report.leaderSig ? 'text-green-400' : 'text-gray-500'}>
                {report.leaderSig ? '✓ Signed' : 'Belum'}
              </p>
            </div>
            <div className={`p-2 rounded ${report.supervisorSig ? 'bg-green-900/30 border border-green-700' : 'bg-gray-700'}`}>
              <p className="text-gray-400">Dosen</p>
              <p className={report.supervisorSig ? 'text-green-400' : 'text-gray-500'}>
                {report.supervisorSig ? '✓ Signed' : 'Belum'}
              </p>
            </div>
          </div>
        </div>

        {(report.operatorSig || report.leaderSig || report.supervisorSig) && (
          <div className="mt-4 pt-4 border-t border-gray-700">
            <p className="text-sm font-medium text-gray-300 mb-3">Tanda Tangan</p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {[
                { data: report.operatorSig, name: operator?.fullName || '-', role: 'Mahasiswa' },
                { data: report.leaderSig, name: '-', role: 'Instruktur' },
                { data: report.supervisorSig, name: '-', role: 'Dosen' },
              ].map((sig, idx) => (
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
        )}
      </div>

      {report.gpsLatitude && report.gpsLongitude && (
        <div className="bg-gray-800 p-4 rounded-xl border border-gray-700">
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

      {fluidAdditions.length > 0 && (
        <div className="bg-gray-800 p-4 rounded-xl border border-gray-700">
          <div className="flex items-center gap-2 text-gray-300 mb-3">
            <Droplets size={16} className="text-blue-400" />
            <p className="text-sm font-medium">Penambahan Fluida</p>
          </div>
          <div className="space-y-2">
            {fluidAdditions.map((fluid: any, idx: number) => (
              <div key={idx} className="flex items-center justify-between p-2 bg-gray-700/50 rounded-lg text-sm">
                <span className="text-white">{fluid.fluidType}</span>
                <span className="text-gray-300 font-medium">{fluid.quantity} L</span>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="space-y-4">
        <h3 className="text-lg font-bold text-white">Hasil Inspeksi</h3>
        {results.map((res: any, idx: number) => (
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
              <span className={`px-4 py-2 font-bold rounded-lg text-center min-w-[3rem] text-white ${
                CONDITION_COLORS[res.conditionCode || ''] || (res.condition === 'OK' ? 'bg-green-600' : 'bg-red-600')
              }`}>
                {CONDITION_LABELS[res.conditionCode || ''] || (res.condition === 'OK' ? 'Baik' : 'Buruk')}
              </span>
            </div>
            {res.photoUrl && res.photoUrl !== 'base64_photo_mock' && (
              <div className="mt-3">
                <p className="text-xs text-gray-400 mb-1">Bukti Foto:</p>
                <button
                  type="button"
                  onClick={() => setPreviewPhoto({ src: res.photoUrl, alt: `Bukti ${res.description}` })}
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

      {canApprove && (
        <div className="bg-gray-800 p-6 rounded-xl border border-gray-700 mt-8">
          <label className="block text-lg font-bold text-white mb-4">
            Tanda Tangan {role === 'leader' ? 'Instruktur' : 'Dosen'}
          </label>
          <SignaturePad onSign={setSignature} />
          
          <div className="flex gap-4 mt-6">
            {canReject && (
              <button 
                onClick={() => setShowRejectModal(true)}
                disabled={isSubmitting}
                className="flex-1 btn-glove bg-danger text-white hover:bg-red-600"
              >
                <XCircle size={20} className="mr-2" />
                Tolak
              </button>
            )}
            <button 
              onClick={handleApprove}
              disabled={!signature || isSubmitting}
              className={`flex-1 btn-glove text-lg ${!signature || isSubmitting ? 'bg-gray-700 text-gray-500 cursor-not-allowed' : 'bg-success text-white hover:bg-green-600'}`}
            >
              <CheckCircle size={20} className="mr-2" />
              {isSubmitting ? 'Memproses...' : 'Setujui'}
            </button>
          </div>
        </div>
      )}

      {!canApprove && report.status !== 'Approved' && report.status !== 'Rejected' && (
        <div className="bg-gray-800 p-6 rounded-xl border border-gray-700 mt-8 text-center">
          <AlertTriangle size={32} className="text-yellow-500 mx-auto mb-3" />
          <p className="text-gray-400">
            {role === 'supervisor' && report.status === 'Submitted' && 
              'Menunggu persetujuan Instruktur terlebih dahulu.'}
            {role === 'leader' && report.status === 'PendingSupervisor' && 
              'Laporan sedang menunggu persetujuan Dosen.'}
            {!canApprove && report.status !== 'Submitted' && report.status !== 'PendingSupervisor' &&
              'Laporan ini tidak memerlukan tanda tangan Anda saat ini.'}
          </p>
        </div>
      )}

      {showRejectModal && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
          <div className="bg-gray-800 rounded-xl border border-gray-700 p-6 w-full max-w-md">
            <h3 className="text-lg font-bold text-white mb-4">Tolak Laporan</h3>
            <p className="text-gray-400 text-sm mb-4">
              Laporan akan dikembalikan ke Mahasiswa untuk perbaikan.
            </p>
            <textarea
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              placeholder="Masukkan alasan penolakan..."
              className="w-full bg-gray-900 border border-gray-600 rounded-lg text-white p-3 h-24 resize-none focus:border-danger focus:ring-1 focus:ring-danger outline-none"
              required
            />
            <div className="flex gap-4 mt-4">
              <button
                onClick={() => {
                  setShowRejectModal(false);
                  setRejectReason('');
                }}
                className="flex-1 btn-glove bg-gray-700 text-white border border-gray-600"
              >
                Batal
              </button>
              <button
                onClick={handleReject}
                disabled={!rejectReason.trim() || isSubmitting}
                className={`flex-1 btn-glove ${!rejectReason.trim() || isSubmitting ? 'bg-gray-700 text-gray-500 cursor-not-allowed' : 'bg-danger text-white'}`}
              >
                {isSubmitting ? 'Memproses...' : 'Tolak'}
              </button>
            </div>
          </div>
        </div>
      )}
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

    {modal && (
      <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
        <div className="mx-4 w-full max-w-sm rounded-2xl bg-gray-800 border border-gray-700 p-6 shadow-2xl">
          <div className="flex flex-col items-center text-center">
            <div className={`flex h-14 w-14 items-center justify-center rounded-full mb-4 ${
              modal.type === 'success' ? 'bg-green-500/10' : 'bg-red-500/10'
            }`}>
              {modal.type === 'success' ? <CheckCircle className="h-7 w-7 text-green-500" /> : <XCircle className="h-7 w-7 text-red-500" />}
            </div>
            <h3 className="text-lg font-semibold text-white mb-2">
              {modal.type === 'success' ? 'Berhasil!' : 'Gagal!'}
            </h3>
            <p className="text-sm text-gray-400 mb-6">{modal.message}</p>
            <button
              onClick={() => {
                setModal(null);
                if (modal.type === 'success') {
                  router.push('/dashboard');
                  router.refresh();
                }
              }}
              className={`w-full rounded-lg px-4 py-2.5 text-sm font-medium text-white transition-colors ${
                modal.type === 'success' ? 'bg-green-600 hover:bg-green-700' : 'bg-red-600 hover:bg-red-700'
              }`}
            >
              {modal.type === 'success' ? 'Kembali ke Dashboard' : 'Tutup'}
            </button>
          </div>
        </div>
      </div>
    )}
    </>
  );
}

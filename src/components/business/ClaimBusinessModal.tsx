import React, { useState } from 'react';
import { X, Building2, ShieldCheck, Upload, CheckCircle2, ArrowRight } from 'lucide-react';
import { Business } from '../../types';

interface ClaimBusinessModalProps {
  business: Business | null;
  isOpen: boolean;
  onClose: () => void;
  onSubmitClaim: (claimData: {
    businessId: string;
    businessName: string;
    applicantName: string;
    applicantPhone: string;
    applicantEmail: string;
    pacraNo: string;
    tpin: string;
  }) => void;
}

export const ClaimBusinessModal: React.FC<ClaimBusinessModalProps> = ({
  business,
  isOpen,
  onClose,
  onSubmitClaim,
}) => {
  const [applicantName, setApplicantName] = useState('Michael Mumba');
  const [applicantPhone, setApplicantPhone] = useState('+260 97 748 1920');
  const [applicantEmail, setApplicantEmail] = useState('m.mumba8@gmail.com');
  const [pacraNo, setPacraNo] = useState('PACRA-1200921448');
  const [tpin, setTpin] = useState('1004928172');
  const [submitted, setSubmitted] = useState(false);

  if (!isOpen || !business) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmitClaim({
      businessId: business.id,
      businessName: business.name,
      applicantName,
      applicantPhone,
      applicantEmail,
      pacraNo,
      tpin,
    });
    setSubmitted(true);
    setTimeout(() => {
      setSubmitted(false);
      onClose();
    }, 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/75 backdrop-blur-xs animate-in fade-in">
      <div className="bg-white rounded-2xl max-w-lg w-full border border-stone-200 shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="p-6 bg-stone-900 text-white flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-emerald-400" />
              <span className="text-base font-bold font-display text-white">
                Claim & Verify Business
              </span>
            </div>
            <p className="text-xs text-stone-400 mt-1">
              Submit statutory ownership documentation for <strong>{business.name}</strong>
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-stone-400 hover:text-white p-1 rounded transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {submitted ? (
          <div className="p-8 text-center space-y-3">
            <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <h4 className="text-base font-bold text-stone-900">
              Application Submitted to Bwana Staff
            </h4>
            <p className="text-xs text-stone-600 leading-relaxed max-w-sm mx-auto">
              Your PACRA certificate and ZRA TPIN have been routed to our verification queue. Once approved, the verified badge ✓ will activate on your listing.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
            <div>
              <label className="block font-medium text-stone-700 mb-1">Your Full Name (Owner / Director)</label>
              <input
                type="text"
                required
                value={applicantName}
                onChange={(e) => setApplicantName(e.target.value)}
                className="w-full px-3 py-2 border border-stone-300 rounded-lg text-xs"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block font-medium text-stone-700 mb-1">Phone Number (+260)</label>
                <input
                  type="text"
                  required
                  value={applicantPhone}
                  onChange={(e) => setApplicantPhone(e.target.value)}
                  className="w-full px-3 py-2 border border-stone-300 rounded-lg text-xs font-mono"
                />
              </div>
              <div>
                <label className="block font-medium text-stone-700 mb-1">Business Email</label>
                <input
                  type="email"
                  required
                  value={applicantEmail}
                  onChange={(e) => setApplicantEmail(e.target.value)}
                  className="w-full px-3 py-2 border border-stone-300 rounded-lg text-xs"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block font-medium text-stone-700 mb-1">PACRA Registration No.</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. PACRA-1200921448"
                  value={pacraNo}
                  onChange={(e) => setPacraNo(e.target.value)}
                  className="w-full px-3 py-2 border border-stone-300 rounded-lg text-xs font-mono"
                />
              </div>
              <div>
                <label className="block font-medium text-stone-700 mb-1">ZRA TPIN (Tax Number)</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. 1004928172"
                  value={tpin}
                  onChange={(e) => setTpin(e.target.value)}
                  className="w-full px-3 py-2 border border-stone-300 rounded-lg text-xs font-mono"
                />
              </div>
            </div>

            {/* Document upload simulation */}
            <div className="p-3 bg-stone-50 border border-dashed border-stone-300 rounded-xl text-center space-y-1">
              <Upload className="w-5 h-5 text-stone-400 mx-auto" />
              <div className="text-xs font-semibold text-stone-700">Attach PACRA Certificate & Utility Bill</div>
              <div className="text-[11px] text-stone-400">PDF, PNG or JPG up to 10MB</div>
              <div className="text-[11px] text-emerald-700 font-mono pt-1">
                ✓ PACRA_Certificate_2026.pdf (Ready for validation)
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="px-3 py-2 text-stone-600 hover:text-stone-900"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-semibold flex items-center gap-1.5 shadow-2xs"
              >
                <span>Submit Verification Claim</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

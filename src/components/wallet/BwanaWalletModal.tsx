import React, { useState, useEffect } from 'react';
import {
  X,
  Wallet,
  PiggyBank,
  TrendingUp,
  CreditCard,
  Plus,
  ArrowUpRight,
  ArrowDownLeft,
  ShieldCheck,
  Building,
  CheckCircle,
  Clock,
  Sparkles,
  Calculator,
  Lock
} from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { INITIAL_WALLET_TRANSACTIONS } from '../../data/mockData';
import { BwanaWalletTransaction } from '../../types';
import {
  subscribeToWalletTransactions,
  createWalletTransactionInFirestore
} from '../../services/firebase';

interface BwanaWalletModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const BwanaWalletModal: React.FC<BwanaWalletModalProps> = ({
  isOpen,
  onClose,
}) => {
  const { walletBalance, addToWalletBalance } = useCart();
  const [activeTab, setActiveTab] = useState<'balance' | 'savings' | 'micro_loans' | 'boz_compliance'>('balance');

  // Top up state
  const [topupAmount, setTopupAmount] = useState('100');
  const [topupProvider, setTopupProvider] = useState<'mtn' | 'airtel'>('mtn');
  const [isProcessing, setIsProcessing] = useState(false);
  const [topupSuccess, setTopupSuccess] = useState(false);

  // Savings pots state
  const [rentSavings, setRentSavings] = useState(450);
  const [schoolFeesSavings, setSchoolFeesSavings] = useState(800);
  const [savePotsAmount, setSavePotsAmount] = useState('50');
  const [savePotsTarget, setSavePotsTarget] = useState<'rent' | 'school'>('rent');

  // Micro loan calculator
  const [dailySavingsDays, setDailySavingsDays] = useState(30);

  // Transactions list
  const [transactions, setTransactions] = useState<BwanaWalletTransaction[]>(INITIAL_WALLET_TRANSACTIONS);

  // Synchronize with live Firestore transactions ledger
  useEffect(() => {
    const unsub = subscribeToWalletTransactions((liveTxs) => {
      if (liveTxs && liveTxs.length > 0) {
        setTransactions(liveTxs);
      }
    });
    return () => {
      if (typeof unsub === 'function') unsub();
    };
  }, []);

  if (!isOpen) return null;

  const handleTopup = (e: React.FormEvent) => {
    e.preventDefault();
    const val = parseFloat(topupAmount);
    if (isNaN(val) || val <= 0) return;

    setIsProcessing(true);
    setTimeout(() => {
      addToWalletBalance(val);
      const newTx: BwanaWalletTransaction = {
        id: `tx-${Date.now()}`,
        userId: 'usr-reg-01',
        type: 'topup',
        amount: val,
        fee: 0,
        netAmount: val,
        status: 'completed',
        reference: `${topupProvider.toUpperCase()}-MOMO-${Math.floor(100000 + Math.random() * 900000)}`,
        description: `${topupProvider.toUpperCase()} Mobile Money Top-up to Bwana Balance`,
        createdAt: new Date().toISOString(),
      };
      setTransactions([newTx, ...transactions]);
      createWalletTransactionInFirestore(newTx).catch((err) => {
        console.warn('Failed to save transaction to Firestore:', err);
      });
      setIsProcessing(false);
      setTopupSuccess(true);
      setTimeout(() => setTopupSuccess(false), 3000);
    }, 1000);
  };

  const handleAddToSavings = (e: React.FormEvent) => {
    e.preventDefault();
    const val = parseFloat(savePotsAmount);
    if (isNaN(val) || val <= 0) return;

    if (savePotsTarget === 'rent') {
      setRentSavings(rentSavings + val);
    } else {
      setSchoolFeesSavings(schoolFeesSavings + val);
    }
    setSavePotsAmount('50');
  };

  // Micro loan formula: Save K10/day for 30 days = K350 eligible, 60 days = K850, 90 days = K1,500
  const calculateLoanEligibility = (days: number) => {
    if (days >= 90) return 1500;
    if (days >= 60) return 850;
    if (days >= 30) return 350;
    return Math.floor(days * 10);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/80 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-2xl w-full max-w-3xl overflow-hidden shadow-2xl my-8 flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-6 bg-stone-950 text-white flex items-center justify-between border-b border-stone-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 font-bold">
              <Wallet className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-bold font-display text-white">Bwana Wallet & Ecosystem</h3>
                <span className="text-[11px] font-mono bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 px-2 py-0.5 rounded font-bold">
                  Phase 4 Financial Layer
                </span>
              </div>
              <p className="text-xs text-stone-400">
                Keep Change, Savings Pots & Trust Account Float (Kitwe & Lusaka)
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg text-stone-400 hover:text-white hover:bg-stone-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Bar */}
        <div className="flex border-b border-stone-200 dark:border-stone-800 bg-stone-50 dark:bg-stone-950 px-6">
          <button
            onClick={() => setActiveTab('balance')}
            className={`py-3 px-4 text-xs font-bold border-b-2 transition-colors cursor-pointer ${
              activeTab === 'balance'
                ? 'border-emerald-600 text-emerald-700 dark:text-emerald-400'
                : 'border-transparent text-stone-500 hover:text-stone-800 dark:hover:text-stone-300'
            }`}
          >
            💰 Wallet & Transactions
          </button>
          <button
            onClick={() => setActiveTab('savings')}
            className={`py-3 px-4 text-xs font-bold border-b-2 transition-colors cursor-pointer ${
              activeTab === 'savings'
                ? 'border-emerald-600 text-emerald-700 dark:text-emerald-400'
                : 'border-transparent text-stone-500 hover:text-stone-800 dark:hover:text-stone-300'
            }`}
          >
            🐷 Bwana Savings Pots
          </button>
          <button
            onClick={() => setActiveTab('micro_loans')}
            className={`py-3 px-4 text-xs font-bold border-b-2 transition-colors cursor-pointer ${
              activeTab === 'micro_loans'
                ? 'border-emerald-600 text-emerald-700 dark:text-emerald-400'
                : 'border-transparent text-stone-500 hover:text-stone-800 dark:hover:text-stone-300'
            }`}
          >
            📈 Micro-Loan Eligibility
          </button>
          <button
            onClick={() => setActiveTab('boz_compliance')}
            className={`py-3 px-4 text-xs font-bold border-b-2 transition-colors cursor-pointer ${
              activeTab === 'boz_compliance'
                ? 'border-emerald-600 text-emerald-700 dark:text-emerald-400'
                : 'border-transparent text-stone-500 hover:text-stone-800 dark:hover:text-stone-300'
            }`}
          >
            🏛️ BOZ E-Money Roadmap
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto flex-1 space-y-6">
          {/* TAB 1: WALLET BALANCE & TRANSACTIONS */}
          {activeTab === 'balance' && (
            <div className="space-y-6">
              {/* Balance Card */}
              <div className="p-5 bg-gradient-to-br from-stone-950 to-stone-900 border border-stone-800 rounded-2xl text-white flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-lg">
                <div>
                  <span className="text-xs uppercase tracking-wider text-stone-400 font-semibold block">
                    Available Bwana Balance (Float)
                  </span>
                  <div className="text-3xl sm:text-4xl font-mono font-extrabold text-emerald-400 mt-1">
                    ZMW {walletBalance.toFixed(2)}
                  </div>
                  <div className="text-[11px] text-stone-400 flex items-center gap-2 mt-1">
                    <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                    <span>Held in Zanaco / Kazang Trust Float Account</span>
                  </div>
                </div>

                <div className="text-right sm:text-left">
                  <div className="text-xs text-stone-300 font-semibold">1% Auto-Split Ledger Active</div>
                  <div className="text-[11px] text-stone-400">Every K100 purchase = K99 seller, K1 Bwana</div>
                </div>
              </div>

              {/* Top Up Form */}
              <form onSubmit={handleTopup} className="p-4 bg-stone-50 dark:bg-stone-950 border border-stone-200 dark:border-stone-800 rounded-xl space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-stone-700 dark:text-stone-300 flex items-center gap-1.5">
                  <Plus className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Instant MoMo Float Top-Up</span>
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-stone-500 mb-1">Provider</label>
                    <select
                      value={topupProvider}
                      onChange={(e) => setTopupProvider(e.target.value as 'mtn' | 'airtel')}
                      className="w-full px-3 py-2 text-xs rounded-lg border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-900"
                    >
                      <option value="mtn">MTN Mobile Money</option>
                      <option value="airtel">Airtel Money</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-stone-500 mb-1">Amount (ZMW)</label>
                    <input
                      type="number"
                      min={10}
                      step={10}
                      value={topupAmount}
                      onChange={(e) => setTopupAmount(e.target.value)}
                      className="w-full px-3 py-2 text-xs font-mono font-bold rounded-lg border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-900"
                    />
                  </div>
                  <div className="flex items-end">
                    <button
                      type="submit"
                      disabled={isProcessing}
                      className="w-full py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-bold transition-all shadow cursor-pointer"
                    >
                      {isProcessing ? 'Prompting MoMo...' : `Top-Up K${topupAmount}`}
                    </button>
                  </div>
                </div>
                {topupSuccess && (
                  <p className="text-xs text-emerald-600 font-semibold flex items-center gap-1">
                    <CheckCircle className="w-3.5 h-3.5" />
                    <span>Top-up successful! ZMW {topupAmount} added to balance.</span>
                  </p>
                )}
              </form>

              {/* Transactions Ledger */}
              <div className="space-y-2">
                <h4 className="text-xs font-bold uppercase tracking-wider text-stone-500">
                  Transaction Ledger & 1% Commission Splits
                </h4>
                {transactions.map((tx) => (
                  <div
                    key={tx.id}
                    className="p-3 bg-white dark:bg-stone-800/80 border border-stone-200 dark:border-stone-700 rounded-xl flex items-center justify-between text-xs"
                  >
                    <div>
                      <div className="font-bold text-stone-900 dark:text-white flex items-center gap-1.5">
                        <span>{tx.description}</span>
                        <span className="text-[10px] bg-stone-100 dark:bg-stone-700 px-1 rounded font-mono text-stone-500">
                          {tx.reference}
                        </span>
                      </div>
                      <div className="text-[11px] text-stone-400 mt-0.5">
                        {new Date(tx.createdAt).toLocaleDateString()} · Status: {tx.status}
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <span className={`text-xs font-mono font-bold ${tx.amount > 0 ? 'text-emerald-600' : 'text-stone-900 dark:text-stone-100'}`}>
                        {tx.amount > 0 ? `+K${tx.amount.toFixed(2)}` : `-K${Math.abs(tx.amount).toFixed(2)}`}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 2: BWANA SAVINGS POTS */}
          {activeTab === 'savings' && (
            <div className="space-y-6">
              <div className="p-4 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 rounded-xl text-xs text-emerald-900 dark:text-emerald-200">
                <div className="font-bold flex items-center gap-1.5 text-sm">
                  <PiggyBank className="w-4 h-4 text-emerald-600" />
                  <span>Bwana Savings Pots (Save for Rent & School Fees)</span>
                </div>
                <p className="mt-1 text-stone-600 dark:text-stone-400 leading-relaxed">
                  Lock daily small amounts from your sales or purchases. Earn simulated interest on float backed by partner commercial trust accounts.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-4 bg-stone-50 dark:bg-stone-950 border border-stone-200 dark:border-stone-800 rounded-xl space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-stone-700 dark:text-stone-300">🏠 Rent Savings Pot</span>
                    <span className="text-xs font-mono bg-emerald-100 dark:bg-emerald-900/60 text-emerald-700 dark:text-emerald-300 px-2 py-0.5 rounded font-bold">
                      Goal: K2,000
                    </span>
                  </div>
                  <div className="text-2xl font-mono font-bold text-stone-900 dark:text-white">
                    ZMW {rentSavings.toFixed(2)}
                  </div>
                  <div className="w-full bg-stone-200 dark:bg-stone-800 h-2 rounded-full overflow-hidden">
                    <div className="bg-emerald-500 h-full" style={{ width: `${(rentSavings / 2000) * 100}%` }} />
                  </div>
                  <div className="text-[11px] text-stone-500 text-right">
                    {((rentSavings / 2000) * 100).toFixed(0)}% reached
                  </div>
                </div>

                <div className="p-4 bg-stone-50 dark:bg-stone-950 border border-stone-200 dark:border-stone-800 rounded-xl space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-stone-700 dark:text-stone-300">🎓 School Fees Pot</span>
                    <span className="text-xs font-mono bg-amber-100 dark:bg-amber-900/60 text-amber-700 dark:text-amber-300 px-2 py-0.5 rounded font-bold">
                      Goal: K1,500
                    </span>
                  </div>
                  <div className="text-2xl font-mono font-bold text-stone-900 dark:text-white">
                    ZMW {schoolFeesSavings.toFixed(2)}
                  </div>
                  <div className="w-full bg-stone-200 dark:bg-stone-800 h-2 rounded-full overflow-hidden">
                    <div className="bg-amber-500 h-full" style={{ width: `${(schoolFeesSavings / 1500) * 100}%` }} />
                  </div>
                  <div className="text-[11px] text-stone-500 text-right">
                    {((schoolFeesSavings / 1500) * 100).toFixed(0)}% reached
                  </div>
                </div>
              </div>

              {/* Add to Pot */}
              <form onSubmit={handleAddToSavings} className="p-4 bg-stone-50 dark:bg-stone-950 border border-stone-200 dark:border-stone-800 rounded-xl flex flex-col sm:flex-row gap-3">
                <div className="flex-1">
                  <label className="block text-[11px] font-semibold text-stone-500 mb-1">Target Pot</label>
                  <select
                    value={savePotsTarget}
                    onChange={(e) => setSavePotsTarget(e.target.value as 'rent' | 'school')}
                    className="w-full px-3 py-2 text-xs rounded-lg border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-900"
                  >
                    <option value="rent">Rent Savings Pot</option>
                    <option value="school">School Fees Pot</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-stone-500 mb-1">Amount (ZMW)</label>
                  <input
                    type="number"
                    min={10}
                    step={10}
                    value={savePotsAmount}
                    onChange={(e) => setSavePotsAmount(e.target.value)}
                    className="w-full px-3 py-2 text-xs font-mono font-bold rounded-lg border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-900"
                  />
                </div>
                <div className="flex items-end">
                  <button
                    type="submit"
                    className="w-full py-2 px-4 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-bold transition-all shadow cursor-pointer"
                  >
                    Transfer to Savings
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* TAB 3: MICRO-LOAN ELIGIBILITY TIER CALCULATOR */}
          {activeTab === 'micro_loans' && (
            <div className="space-y-6">
              <div className="p-4 bg-stone-950 text-white rounded-xl border border-stone-800 flex items-center justify-between">
                <div>
                  <div className="text-xs font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1">
                    <Calculator className="w-3.5 h-3.5" />
                    <span>Micro-Loan Tier Progression</span>
                  </div>
                  <div className="text-sm font-semibold text-stone-200 mt-0.5">
                    "Save K10/day for 30 days = K350 loan eligible"
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-[11px] text-stone-400 block">Eligible Credit</span>
                  <span className="text-2xl font-mono font-extrabold text-emerald-400">
                    ZMW {calculateLoanEligibility(dailySavingsDays)}
                  </span>
                </div>
              </div>

              <div className="p-4 bg-stone-50 dark:bg-stone-950 border border-stone-200 dark:border-stone-800 rounded-xl space-y-4">
                <div>
                  <div className="flex justify-between text-xs font-bold text-stone-700 dark:text-stone-300 mb-2">
                    <span>Consistent Daily Saving Days:</span>
                    <span className="font-mono text-emerald-600 dark:text-emerald-400">{dailySavingsDays} Days</span>
                  </div>
                  <input
                    type="range"
                    min={5}
                    max={120}
                    step={5}
                    value={dailySavingsDays}
                    onChange={(e) => setDailySavingsDays(parseInt(e.target.value))}
                    className="w-full"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                  <div className={`p-3 rounded-xl border ${dailySavingsDays >= 30 ? 'bg-emerald-50 dark:bg-emerald-950/60 border-emerald-300 text-emerald-800 dark:text-emerald-200' : 'bg-stone-100 dark:bg-stone-800 border-stone-200 dark:border-stone-700 opacity-60'}`}>
                    <div className="font-bold">Tier 1: Starter</div>
                    <div className="text-[11px] mt-1">30 days consistent saving</div>
                    <div className="text-base font-mono font-bold mt-2">ZMW 350 Loan</div>
                  </div>
                  <div className={`p-3 rounded-xl border ${dailySavingsDays >= 60 ? 'bg-emerald-50 dark:bg-emerald-950/60 border-emerald-300 text-emerald-800 dark:text-emerald-200' : 'bg-stone-100 dark:bg-stone-800 border-stone-200 dark:border-stone-700 opacity-60'}`}>
                    <div className="font-bold">Tier 2: Trader Growth</div>
                    <div className="text-[11px] mt-1">60 days consistent saving</div>
                    <div className="text-base font-mono font-bold mt-2">ZMW 850 Loan</div>
                  </div>
                  <div className={`p-3 rounded-xl border ${dailySavingsDays >= 90 ? 'bg-emerald-50 dark:bg-emerald-950/60 border-emerald-300 text-emerald-800 dark:text-emerald-200' : 'bg-stone-100 dark:bg-stone-800 border-stone-200 dark:border-stone-700 opacity-60'}`}>
                    <div className="font-bold">Tier 3: Wholesaler Restock</div>
                    <div className="text-[11px] mt-1">90 days consistent saving</div>
                    <div className="text-base font-mono font-bold mt-2">ZMW 1,500 Loan</div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: BOZ E-MONEY COMPLIANCE ROADMAP */}
          {activeTab === 'boz_compliance' && (
            <div className="space-y-4">
              <div className="p-4 bg-stone-900 text-white rounded-xl border border-stone-800 flex items-center justify-between">
                <div>
                  <div className="text-xs font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
                    <Building className="w-4 h-4" />
                    <span>Bank of Zambia (BOZ) E-Money Issuer Regulatory Path</span>
                  </div>
                  <div className="text-xs text-stone-300 mt-1">
                    Phased license architecture: Aggregator model (now) → Direct E-Money Issuer (Phase 4)
                  </div>
                </div>
                <span className="text-xs font-mono font-bold bg-emerald-500/20 text-emerald-300 px-2.5 py-1 rounded-full border border-emerald-500/40">
                  Compliant Path
                </span>
              </div>

              <div className="space-y-3 text-xs">
                <div className="p-3 bg-stone-50 dark:bg-stone-950 border border-stone-200 dark:border-stone-800 rounded-xl">
                  <div className="font-bold text-stone-900 dark:text-white flex items-center gap-1.5">
                    <CheckCircle className="w-4 h-4 text-emerald-600" />
                    <span>Stage 1 (Weeks 1-10): Aggregator Model (No BOZ License Needed)</span>
                  </div>
                  <p className="text-stone-600 dark:text-stone-400 mt-1 leading-relaxed">
                    Operate as a registered commercial marketplace routing funds via licensed payment processors (Flutterwave, DPO, MTN MoMo, Airtel Money API). Zero regulatory license hurdle.
                  </p>
                </div>

                <div className="p-3 bg-stone-50 dark:bg-stone-950 border border-stone-200 dark:border-stone-800 rounded-xl">
                  <div className="font-bold text-stone-900 dark:text-white flex items-center gap-1.5">
                    <CheckCircle className="w-4 h-4 text-emerald-600" />
                    <span>Stage 2 (Months 3-4): Commercial Bank Trust Account Partnership</span>
                  </div>
                  <p className="text-stone-600 dark:text-stone-400 mt-1 leading-relaxed">
                    Partner with Zanaco or Kazang for an escrow trust account holding merchant floats and user change balances, ensuring 100% solvency and PACRA/ZRA reporting readiness.
                  </p>
                </div>

                <div className="p-3 bg-stone-50 dark:bg-stone-950 border border-stone-200 dark:border-stone-800 rounded-xl">
                  <div className="font-bold text-stone-900 dark:text-white flex items-center gap-1.5">
                    <Clock className="w-4 h-4 text-amber-600" />
                    <span>Stage 3 (Months 5-6): Formal BOZ E-Money Issuer Application</span>
                  </div>
                  <p className="text-stone-600 dark:text-stone-400 mt-1 leading-relaxed">
                    Submit application to Bank of Zambia using live transaction volume, audited escrow statements, and 500+ verified Kitwe & Lusaka merchant network as empirical proof.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-stone-50 dark:bg-stone-950 border-t border-stone-200 dark:border-stone-800 flex items-center justify-between text-xs text-stone-500">
          <span>Bwana Wallet Protocol · 1% Split Auto-Execution</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-stone-200 dark:bg-stone-800 hover:bg-stone-300 text-stone-800 dark:text-stone-200 rounded-lg font-semibold cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

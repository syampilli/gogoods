import { useState, useEffect } from 'react';
import { Wallet as WalletIcon, Plus, ArrowUpRight,
         ArrowDownLeft, RefreshCw, IndianRupee } from 'lucide-react';
import API from '../api/axios';
import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';

export default function WalletPage() {
  const { t } = useTranslation();
  const [wallet,  setWallet]  = useState(null);
  const [amount,  setAmount]  = useState('');
  const [loading, setLoading] = useState(false);
  const [adding,  setAdding]  = useState(false);

  const fetchWallet = async () => {
    setLoading(true);
    try {
      const { data } = await API.get('/wallet');
      setWallet(data);
    } catch {
      toast.error('Failed to load wallet');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchWallet(); }, []);

  const handleAddMoney = async () => {
    const amt = parseFloat(amount);
    if (!amt || amt <= 0) return toast.error('Enter valid amount');
    if (amt > 50000)      return toast.error('Max ₹50,000 per transaction');
    setAdding(true);
    try {
      const { data } = await API.post('/wallet/add', { amount: amt });
      setWallet(data);
      setAmount('');
      toast.success(`₹${amt} added to wallet!`);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to add money');
    } finally {
      setAdding(false);
    }
  };

  const quickAmounts = [100, 500, 1000, 2000, 5000];

  const formatDate = (d) => new Date(d).toLocaleString('en-IN', {
    day:'2-digit', month:'short', year:'numeric',
    hour:'2-digit', minute:'2-digit'
  });

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 py-8 px-4">
      <div className="max-w-2xl mx-auto space-y-6">

        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            💰 My Wallet
          </h1>
          <p className="text-gray-400 text-sm mt-1">
            Manage your balance and transactions
          </p>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="w-10 h-10 border-4 border-blue-600
                            border-t-transparent rounded-full animate-spin"/>
          </div>
        ) : (
          <>
            {/* Balance card */}
            <div className="relative bg-blue-600 rounded-3xl p-6
                            overflow-hidden shadow-xl">
              <div className="absolute top-0 right-0 w-40 h-40
                              bg-white/5 rounded-full -translate-y-1/2
                              translate-x-1/4"/>
              <div className="absolute bottom-0 left-0 w-28 h-28
                              bg-white/5 rounded-full translate-y-1/2
                              -translate-x-1/4"/>
              <div className="relative z-10">
                <div className="flex items-center gap-2 mb-3">
                  <WalletIcon size={20} className="text-blue-200"/>
                  <span className="text-blue-200 text-sm font-medium">
                    Available Balance
                  </span>
                  <button onClick={fetchWallet}
                    className="ml-auto text-blue-300 hover:text-white">
                    <RefreshCw size={14}/>
                  </button>
                </div>
                <p className="text-4xl font-bold text-white mb-1">
                  ₹{(wallet?.balance || 0).toLocaleString('en-IN')}
                </p>
                <p className="text-blue-200 text-sm">
                  {wallet?.transactions?.length || 0} transactions
                </p>
              </div>
            </div>

            {/* Add money */}
            <div className="bg-white dark:bg-gray-900 rounded-2xl border
                            border-gray-100 dark:border-gray-800 p-5 shadow-sm">
              <h2 className="font-bold text-gray-900 dark:text-white mb-4">
                Add Money
              </h2>

              {/* Quick amounts */}
              <div className="flex flex-wrap gap-2 mb-4">
                {quickAmounts.map(a => (
                  <button key={a} onClick={() => setAmount(a.toString())}
                    className={`px-3 py-1.5 rounded-xl text-sm font-semibold
                                transition-all border
                      ${amount === a.toString()
                        ? 'bg-blue-600 text-white border-blue-600'
                        : 'bg-gray-50 dark:bg-gray-800 text-gray-600 dark:text-gray-300 border-gray-200 dark:border-gray-700 hover:border-blue-400'}`}>
                    ₹{a}
                  </button>
                ))}
              </div>

              <div className="flex gap-3">
                <div className="relative flex-1">
                  <IndianRupee size={16}
                    className="absolute left-3 top-1/2 -translate-y-1/2
                               text-gray-400"/>
                  <input
                    type="number"
                    value={amount}
                    onChange={e => setAmount(e.target.value)}
                    placeholder="Enter amount"
                    className="w-full pl-9 pr-3 py-3 bg-gray-50 dark:bg-gray-800
                               border border-gray-200 dark:border-gray-700
                               rounded-xl text-gray-900 dark:text-white
                               placeholder-gray-400 focus:outline-none
                               focus:ring-2 focus:ring-blue-500 transition-all"
                  />
                </div>
                <button onClick={handleAddMoney} disabled={adding}
                  className="flex items-center gap-2 px-5 py-3 bg-blue-600
                             hover:bg-blue-700 disabled:bg-blue-400 text-white
                             font-bold rounded-xl transition-all">
                  {adding
                    ? <div className="w-4 h-4 border-2 border-white/30
                                      border-t-white rounded-full animate-spin"/>
                    : <><Plus size={16}/> Add</>}
                </button>
              </div>
            </div>

            {/* Transaction history */}
            <div className="bg-white dark:bg-gray-900 rounded-2xl border
                            border-gray-100 dark:border-gray-800 shadow-sm
                            overflow-hidden">
              <div className="px-5 py-4 border-b border-gray-100
                              dark:border-gray-800">
                <h2 className="font-bold text-gray-900 dark:text-white">
                  Transaction History
                </h2>
              </div>

              {!wallet?.transactions?.length ? (
                <div className="px-5 py-12 text-center">
                  <WalletIcon size={36} className="mx-auto text-gray-300
                                                   dark:text-gray-600 mb-3"/>
                  <p className="text-gray-400 dark:text-gray-500 text-sm">
                    No transactions yet
                  </p>
                </div>
              ) : (
                <div className="divide-y divide-gray-50 dark:divide-gray-800">
                  {wallet.transactions.map((t, i) => (
                    <div key={i} className="flex items-center gap-4 px-5 py-4
                                            hover:bg-gray-50 dark:hover:bg-gray-800
                                            transition-colors">
                      <div className={`w-10 h-10 rounded-2xl flex items-center
                                       justify-center flex-shrink-0
                        ${t.type === 'credit'
                          ? 'bg-green-50 dark:bg-green-900/20'
                          : 'bg-red-50 dark:bg-red-900/20'}`}>
                        {t.type === 'credit'
                          ? <ArrowDownLeft size={18} className="text-green-600"/>
                          : <ArrowUpRight  size={18} className="text-red-500"/>}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-gray-900
                                      dark:text-white truncate">
                          {t.description}
                        </p>
                        <p className="text-xs text-gray-400 mt-0.5">
                          {formatDate(t.createdAt)}
                        </p>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <p className={`font-bold text-sm
                          ${t.type === 'credit'
                            ? 'text-green-600 dark:text-green-400'
                            : 'text-red-500 dark:text-red-400'}`}>
                          {t.type === 'credit' ? '+' : '-'}₹{t.amount}
                        </p>
                        <p className="text-xs text-gray-400">
                          Bal: ₹{t.balance}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
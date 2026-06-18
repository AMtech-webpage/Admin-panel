import React, { useState, useEffect, useMemo } from 'react';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import {
  Search,
  Ban,
  Check,
  Coins,
  Database,
  Settings,
  Clock,
  ArrowUpRight,
  ArrowDownLeft,
  AlertCircle,
  Terminal,
  Plus,
  X,
  Copy,
  FileText,
  RefreshCw,
  Eye,
  ChevronRight,
  Shield,
  Trash2,
  TrendingUp,
  UserCheck,
  CheckCircle,
  AlertTriangle,
  ExternalLink,
  Users,
  Wallet,
  Activity,
  UserMinus,
  Briefcase,
  HelpCircle,
  Moon,
  ToggleLeft
} from 'lucide-react';

// Interfaces based on actual schema declarations
interface Profile {
  id: string;
  username: string;
  email: string;
  balance: number;
  total_earned: number;
  is_banned: boolean;
  wallet_address: string;
  ip_address: string;
  created_at: string;
}

interface Transaction {
  id: string | number;
  user_id: string;
  amount: number;
  type: string; // 'ad_view' | 'micro_task' | 'referral_bonus' | 'admin_adjustment' | 'withdrawal_payout'
  description: string;
  created_at: string;
}

interface WithdrawalRequest {
  id: string | number;
  user_id: string;
  amount: number;
  payment_method: string;
  wallet_address: string;
  status: 'pending' | 'completed' | 'rejected';
  created_at: string;
  completed_at?: string;
}

// Initial simulation datasets matching real database rows for "Extreme"
const INITIAL_MOCK_PROFILES: Profile[] = [
  {
    id: "8f4b50c0-1bb3-4f9e-bbb8-9eeff92f4da8",
    username: "cryptoking99",
    email: "king99@usdtmail.xyz",
    balance: 142.8550,
    total_earned: 480.0000,
    is_banned: false,
    wallet_address: "TX9zV2U6K7Hn9kQ6Wv5Yd8Xt3Jm2p7R8sP",
    ip_address: "185.122.45.10",
    created_at: "2026-01-14T08:12:00Z"
  },
  {
    id: "a0f3d4b2-c119-488b-9e45-f3fa5b3c4320",
    username: "usdt_miner",
    email: "miner_usdt@gmail.com",
    balance: 12.5000,
    total_earned: 45.0000,
    is_banned: false,
    wallet_address: "TP6Rst8Y6XvF4f9QeWm3Gv2Ks8LdLmN7xK",
    ip_address: "84.112.190.43",
    created_at: "2026-03-22T14:45:10Z"
  },
  {
    id: "d3c1b0a2-e421-4f90-a3cf-b8d9aaee849c",
    username: "satoshi_fan",
    email: "satoshi_legacy@protonmail.com",
    balance: 0.0000,
    total_earned: 1200.0000,
    is_banned: true,
    wallet_address: "TR7NHqeVgCqiJpUJxo3NRP7w782iR1A2p1",
    ip_address: "192.168.1.115",
    created_at: "2025-11-09T03:00:00Z"
  },
  {
    id: "f3e2d1c0-a9b8-47c6-8d5e-bd3c2a1b0fee",
    username: "extreme_winner",
    email: "winner@extreme-usdt.com",
    balance: 524.3000,
    total_earned: 1980.5000,
    is_banned: false,
    wallet_address: "TYG3j8Ym6WfE1gX9Tv4Rs7LmNk2Pp5Q3xS",
    ip_address: "37.140.222.8",
    created_at: "2026-02-18T10:05:00Z"
  },
  {
    id: "7b8a9c2d-3f4e-5a6b-7c8d-9e0f1a2b3c4d",
    username: "sophia_sol",
    email: "sophia.solana@web3.io",
    balance: 45.0500,
    total_earned: 190.5000,
    is_banned: false,
    wallet_address: "TD9eK2X7F8mQs9Jn6Rz1Wb5Tv3Yd4Mn8pX",
    ip_address: "172.56.21.99",
    created_at: "2026-04-05T19:22:30Z"
  },
  {
    id: "1a2b3c4d-5e6f-7a8b-9c0d-1e2f3a4b5c6d",
    username: "alex_crypto",
    email: "alexcrypto@yahoo.com",
    balance: 3.1500,
    total_earned: 3.1500,
    is_banned: false,
    wallet_address: "TL9nK2R5Y4tW3eQ9Px8Fv7Sc6Md5Lm2n7S",
    ip_address: "102.84.19.123",
    created_at: "2026-06-15T11:40:00Z"
  }
];

const INITIAL_MOCK_TRANSACTIONS: Transaction[] = [
  // cryptoking99
  { id: "tx-1", user_id: "8f4b50c0-1bb3-4f9e-bbb8-9eeff92f4da8", amount: 0.0500, type: "ad_view", description: "Watched short dynamic video ad #40292 (+0.05 USDT)", created_at: "2026-06-18T05:12:00Z" },
  { id: "tx-2", user_id: "8f4b50c0-1bb3-4f9e-bbb8-9eeff92f4da8", amount: 0.1000, type: "micro_task", description: "Completed Telegram group join verification (+0.10 USDT)", created_at: "2026-06-17T20:45:00Z" },
  { id: "tx-3", user_id: "8f4b50c0-1bb3-4f9e-bbb8-9eeff92f4da8", amount: 15.0000, type: "referral_bonus", description: "Referral reward from sophia_sol upgrade (+15.00 USDT)", created_at: "2026-06-16T14:30:00Z" },
  { id: "tx-4", user_id: "8f4b50c0-1bb3-4f9e-bbb8-9eeff92f4da8", amount: -50.0000, type: "withdrawal_payout", description: "Processed withdraw request #W-893 (-50.00 USDT)", created_at: "2026-06-10T12:00:00Z" },

  // satoshi_fan
  { id: "tx-5", user_id: "d3c1b0a2-e421-4f90-a3cf-b8d9aaee849c", amount: 1200.0000, type: "admin_adjustment", description: "Promo seed deposit balance manually inserted", created_at: "2025-11-10T09:00:00Z" },

  // extreme_winner
  { id: "tx-6", user_id: "f3e2d1c0-a9b8-47c6-8d5e-bd3c2a1b0fee", amount: 250.0000, type: "referral_bonus", description: "Affiliate high-roller pool bonus level 2", created_at: "2026-06-15T09:12:00Z" },
  { id: "tx-7", user_id: "f3e2d1c0-a9b8-47c6-8d5e-bd3c2a1b0fee", amount: 0.0500, type: "ad_view", description: "Watched extreme stream ad block #14 (+0.05 USDT)", created_at: "2026-06-18T07:11:00Z" },
];

const INITIAL_MOCK_WITHDRAWALS: WithdrawalRequest[] = [
  // extreme_winner pending
  {
    id: "w-w1",
    user_id: "f3e2d1c0-a9b8-47c6-8d5e-bd3c2a1b0fee",
    amount: 250.0000,
    payment_method: "USDT (TRC-20)",
    wallet_address: "TYG3j8Ym6WfE1gX9Tv4Rs7LmNk2Pp5Q3xS",
    status: "pending",
    created_at: "2026-06-18T02:00:00Z"
  },
  // cryptoking99 completed
  {
    id: "w-w2",
    user_id: "8f4b50c0-1bb3-4f9e-bbb8-9eeff92f4da8",
    amount: 50.0000,
    payment_method: "USDT (TRC-20)",
    wallet_address: "TX9zV2U6K7Hn9kQ6Wv5Yd8Xt3Jm2p7R8sP",
    status: "completed",
    created_at: "2026-06-10T08:15:00Z",
    completed_at: "2026-06-10T12:00:00Z"
  }
];

export default function App() {
  // Try loading connection variables from environment or fallback
  const initialUrl = (import.meta as any).env?.VITE_SUPABASE_URL || localStorage.getItem('EXTREME_SUPABASE_URL') || '';
  const initialKey = (import.meta as any).env?.VITE_SUPABASE_ANON_KEY || localStorage.getItem('EXTREME_SUPABASE_ANON_KEY') || '';

  // Config credentials state
  const [supabaseUrl, setSupabaseUrl] = useState<string>(initialUrl);
  const [supabaseAnonKey, setSupabaseAnonKey] = useState<string>(initialKey);
  const [showConfig, setShowConfig] = useState<boolean>(!initialUrl || !initialKey);

  // Active database status state
  const [dbClient, setDbClient] = useState<SupabaseClient | null>(null);
  const [connectionState, setConnectionState] = useState<'DISCONNECTED' | 'CONNECTED' | 'ERROR'>('DISCONNECTED');
  const [connectionError, setConnectionError] = useState<string>('');

  // Primary Workspace state stores
  const [profiles, setProfiles] = useState<Profile[]>(INITIAL_MOCK_PROFILES);
  const [transactions, setTransactions] = useState<Transaction[]>(INITIAL_MOCK_TRANSACTIONS);
  const [withdrawals, setWithdrawals] = useState<WithdrawalRequest[]>(INITIAL_MOCK_WITHDRAWALS);

  // Active UI context
  const [selectedUserId, setSelectedUserId] = useState<string | null>(INITIAL_MOCK_PROFILES[0].id);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [activeTab, setActiveTab] = useState<'withdrawals' | 'transactions' | 'sql_guide'>('transactions');
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);

  // Action states
  const [adjustmentAmount, setAdjustmentAmount] = useState<string>('');
  const [adjustmentDescription, setAdjustmentDescription] = useState<string>('');
  const [adjustmentType, setAdjustmentType] = useState<string>('admin_adjustment');
  const [actionLoading, setActionLoading] = useState<boolean>(false);

  // Notifications
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);

  // Create mock user state values
  const [newUsername, setNewUsername] = useState<string>('');
  const [newEmail, setNewEmail] = useState<string>('');
  const [newBalance, setNewBalance] = useState<string>('');
  const [showAddUserModal, setShowAddUserModal] = useState<boolean>(false);

  // Trigger auto-dismiss dynamic toasts
  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  // Attempt standard initialization function for real Supabase
  const initializeSupabase = async (urlToUse = supabaseUrl, keyToUse = supabaseAnonKey) => {
    if (!urlToUse || !keyToUse) {
      setConnectionState('DISCONNECTED');
      setDbClient(null);
      return false;
    }

    try {
      setConnectionError('');
      // Basic sanitize
      const sanitizedUrl = urlToUse.trim();
      const sanitizedKey = keyToUse.trim();
      
      const client = createClient(sanitizedUrl, sanitizedKey);
      setDbClient(client);

      // Verify connection by reading first row or simple ping
      const { data, error } = await client
        .from('profiles')
        .select('*')
        .limit(1);

      if (error) {
        throw new Error(error.message);
      }

      setConnectionState('CONNECTED');
      localStorage.setItem('EXTREME_SUPABASE_URL', sanitizedUrl);
      localStorage.setItem('EXTREME_SUPABASE_ANON_KEY', sanitizedKey);
      setToast({ message: "Successfully connected to your Live Supabase Database!", type: "success" });
      setShowConfig(false);
      return true;
    } catch (err: any) {
      console.error("Supabase initialization error:", err);
      setConnectionState('ERROR');
      setConnectionError(err.message || 'Failed connecting to profiles table. Verify if your table schema is built or if RLS allows selecting.');
      setToast({ message: `Database error: ${err.message || "Failed client connection"}`, type: "error" });
      return false;
    }
  };

  // Run on mount to auto-initialize if env exists
  useEffect(() => {
    if (initialUrl && initialKey) {
      initializeSupabase(initialUrl, initialKey);
    }
  }, []);

  // Fetch profiles and records automatically from DB if connected
  const performFetch = async () => {
    if (connectionState !== 'CONNECTED' || !dbClient) {
      // Mock Refresh
      setIsRefreshing(true);
      setTimeout(() => {
        setIsRefreshing(false);
        setToast({ message: "Simulated sandbox records refreshed successfully.", type: "info" });
      }, 640);
      return;
    }

    setIsRefreshing(true);
    try {
      // Fetch all public profiles
      const { data: dbProfiles, error: pError } = await dbClient
        .from('profiles')
        .select('*')
        .order('username', { ascending: true });

      if (pError) throw pError;
      
      if (dbProfiles) {
        setProfiles(dbProfiles);
        
        // Ensure a selected user matches the updated database items or select first
        if (dbProfiles.length > 0 && !dbProfiles.some(p => p.id === selectedUserId)) {
          setSelectedUserId(dbProfiles[0].id);
        }
      }

      // Fetch all transactions
      const { data: dbTxs, error: tError } = await dbClient
        .from('transactions')
        .select('*')
        .order('created_at', { ascending: false });

      if (tError) throw tError;
      if (dbTxs) setTransactions(dbTxs);

      // Fetch all withdrawal requests
      const { data: dbWithdrawals, error: wError } = await dbClient
        .from('withdrawal_requests')
        .select('*')
        .order('created_at', { ascending: false });

      if (wError) throw wError;
      if (dbWithdrawals) setWithdrawals(dbWithdrawals);

      setToast({ message: "Fetched real-time data from Supabase successfully!", type: "success" });
    } catch (err: any) {
      console.error("Critical fetch error:", err);
      setToast({ message: `Fetch failed: ${err.message}`, type: "error" });
    } finally {
      setIsRefreshing(false);
    }
  };

  // Re-run fetches when connection status establishes
  useEffect(() => {
    if (connectionState === 'CONNECTED' && dbClient) {
      performFetch();
    }
  }, [connectionState]);

  // Handle manually changing credentials in the Admin Panel UI
  const handleConnect = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!supabaseUrl || !supabaseAnonKey) {
      setToast({ message: "Please specify both the database endpoint URL and API anonymous key.", type: "error" });
      return;
    }
    await initializeSupabase(supabaseUrl, supabaseAnonKey);
  };

  const handleDisconnect = () => {
    setDbClient(null);
    setConnectionState('DISCONNECTED');
    localStorage.removeItem('EXTREME_SUPABASE_URL');
    localStorage.removeItem('EXTREME_SUPABASE_ANON_KEY');
    setProfiles(INITIAL_MOCK_PROFILES);
    setTransactions(INITIAL_MOCK_TRANSACTIONS);
    setWithdrawals(INITIAL_MOCK_WITHDRAWALS);
    setSelectedUserId(INITIAL_MOCK_PROFILES[0].id);
    setToast({ message: "Disconnected. Reverted to secure offline Sandbox simulation state.", type: "info" });
  };

  // Calculate high-end dashboard statistics
  const metrics = useMemo(() => {
    const totalUsers = profiles.length;
    const activeBalance = profiles.reduce((sum, u) => sum + Number(u.balance || 0), 0);
    const pendingWithdrawalsCount = withdrawals.filter(w => w.status === 'pending').length;
    const bannedUsersCount = profiles.filter(u => u.is_banned).length;
    const totalWithdrawn = withdrawals
      .filter(w => w.status === 'completed')
      .reduce((sum, w) => sum + Number(w.amount || 0), 0);

    return {
      totalUsers,
      activeBalance,
      pendingWithdrawalsCount,
      bannedUsersCount,
      totalWithdrawn
    };
  }, [profiles, withdrawals]);

  // Filter sidebar users alphabetically and matching query instantly search input bar
  const filteredUsers = useMemo(() => {
    const query = searchQuery.toLowerCase().trim();
    if (!query) {
      return [...profiles].sort((a, b) => a.username.localeCompare(b.username));
    }
    return profiles.filter(user => 
      user.username.toLowerCase().includes(query) ||
      user.email.toLowerCase().includes(query) ||
      user.id.toLowerCase().includes(query)
    ).sort((a, b) => a.username.localeCompare(b.username));
  }, [profiles, searchQuery]);

  // Extract selected user data details
  const selectedUser = useMemo(() => {
    if (!selectedUserId) return null;
    return profiles.find(u => u.id === selectedUserId) || null;
  }, [profiles, selectedUserId]);

  const selectedUserTransactions = useMemo(() => {
    if (!selectedUserId) return [];
    return transactions.filter(t => t.user_id === selectedUserId)
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  }, [transactions, selectedUserId]);

  const selectedUserWithdrawals = useMemo(() => {
    if (!selectedUserId) return [];
    return withdrawals.filter(w => w.user_id === selectedUserId)
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  }, [withdrawals, selectedUserId]);

  // --- ACTIONS ---

  // Action: Ban/Unban user profile instantly
  const handleToggleBan = async () => {
    if (!selectedUser) return;
    const updatedBanStatus = !selectedUser.is_banned;
    setActionLoading(true);

    try {
      if (connectionState === 'CONNECTED' && dbClient) {
        const { error } = await dbClient
          .from('profiles')
          .update({ is_banned: updatedBanStatus })
          .eq('id', selectedUser.id);

        if (error) throw error;
      }

      // Update state instantly (supports mock updates/automatic feed UI state)
      setProfiles(prev => prev.map(p => {
        if (p.id === selectedUser.id) {
          return { ...p, is_banned: updatedBanStatus };
        }
        return p;
      }));

      setToast({
        message: `Account associated with '${selectedUser.username}' has been successfully ${updatedBanStatus ? 'BANNED' : 'UNBANNED'}.`,
        type: 'success'
      });
    } catch (err: any) {
      console.error(err);
      setToast({ message: `Ban operation failed: ${err.message}`, type: 'error' });
    } finally {
      setActionLoading(false);
    }
  };

  // Action: Approve USDT payout request
  const handleApproveWithdrawal = async (reqId: string | number, amount: number) => {
    if (!selectedUser) return;
    setActionLoading(true);

    try {
      if (connectionState === 'CONNECTED' && dbClient) {
        // Step 1: Update status in withdrawal_requests to completed
        const { error: wError } = await dbClient
          .from('withdrawal_requests')
          .update({ 
            status: 'completed',
            completed_at: new Date().toISOString()
          })
          .eq('id', reqId);

        if (wError) throw wError;

        // Step 2: Deduct amount from user's current profile balance in live DB as per common Web3 flow
        const updatedBalance = Math.max(0, Number(selectedUser.balance) - Number(amount));
        const { error: pError } = await dbClient
          .from('profiles')
          .update({ balance: updatedBalance })
          .eq('id', selectedUser.id);

        if (pError) throw pError;

        // Step 3: Insert positive ledger transaction showing status deduction complete
        const { error: tError } = await dbClient
          .from('transactions')
          .insert([{
            user_id: selectedUser.id,
            amount: -amount,
            type: 'withdrawal_payout',
            description: `Admin approved payout of ${amount.toFixed(4)} USDT and deducted from wallet. Wallet: ${selectedUser.wallet_address.substring(0, 8)}...`,
            created_at: new Date().toISOString()
          }]);

        if (tError) throw tError;
      }

      // Sync state dynamically in state array
      setWithdrawals(prev => prev.map(w => {
        if (w.id === reqId) {
          return { ...w, status: 'completed', completed_at: new Date().toISOString() };
        }
        return w;
      }));

      setProfiles(prev => prev.map(p => {
        if (p.id === selectedUser.id) {
          const nextBal = Math.max(0, p.balance - amount);
          return { ...p, balance: nextBal };
        }
        return p;
      }));

      // Append ledger item locally to preview immediately
      const newTx: Transaction = {
        id: `tx-gen-${Date.now()}`,
        user_id: selectedUser.id,
        amount: -amount,
        type: 'withdrawal_payout',
        description: `Admin approved payout of ${amount.toFixed(4)} USDT and deducted from wallet balance. Address: ${selectedUser.wallet_address.substring(0, 8)}...`,
        created_at: new Date().toISOString()
      };
      setTransactions(prev => [newTx, ...prev]);

      setToast({ message: `Payout request processed. ${amount.toFixed(4)} USDT has been payout approved!`, type: 'success' });
    } catch (err: any) {
      console.error(err);
      setToast({ message: `Payout approval failed: ${err.message}`, type: 'error' });
    } finally {
      setActionLoading(false);
    }
  };

  // Action: Add manual transaction adjustment Ledger bonus/penalty
  const handleAddAdjustment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUser) return;

    const amountNum = parseFloat(adjustmentAmount);
    if (isNaN(amountNum) || amountNum === 0) {
      setToast({ message: "Please specify a non-zero numerical token amount (e.g., +25.5 or -10).", type: "error" });
      return;
    }

    const desc = adjustmentDescription.trim() || `Manual admin adjustment of ${amountNum} USDT`;
    setActionLoading(true);

    try {
      const calculatedNewBalance = Math.max(0, Number(selectedUser.balance) + amountNum);
      const calculatedTotalEarned = amountNum > 0 
        ? Number(selectedUser.total_earned) + amountNum 
        : Number(selectedUser.total_earned);

      if (connectionState === 'CONNECTED' && dbClient) {
        // Step 1: Insert ledger tx
        const { error: txErr } = await dbClient
          .from('transactions')
          .insert([{
            user_id: selectedUser.id,
            amount: amountNum,
            type: adjustmentType,
            description: desc,
            created_at: new Date().toISOString()
          }]);

        if (txErr) throw txErr;

        // Step 2: Update database profile balance
        const { error: profErr } = await dbClient
          .from('profiles')
          .update({ 
            balance: calculatedNewBalance,
            total_earned: calculatedTotalEarned
          })
          .eq('id', selectedUser.id);

        if (profErr) throw profErr;
      }

      // Mirror transactions & profiles state immediately for visual reactivity is key
      const generatedId = `tx-adj-${Date.now()}`;
      const newTx: Transaction = {
        id: generatedId,
        user_id: selectedUser.id,
        amount: amountNum,
        type: adjustmentType,
        description: desc,
        created_at: new Date().toISOString()
      };

      setTransactions(prev => [newTx, ...prev]);
      setProfiles(prev => prev.map(p => {
        if (p.id === selectedUser.id) {
          return {
            ...p,
            balance: calculatedNewBalance,
            total_earned: calculatedTotalEarned
          };
        }
        return p;
      }));

      setAdjustmentAmount('');
      setAdjustmentDescription('');
      setToast({
        message: `Ledger updated. Added ${amountNum > 0 ? '+' : ''}${amountNum} USDT transaction. User balance modified to ${calculatedNewBalance.toFixed(4)} USDT.`,
        type: 'success'
      });
    } catch (err: any) {
      console.error(err);
      setToast({ message: `Adjustment failed: ${err.message}`, type: 'error' });
    } finally {
      setActionLoading(false);
    }
  };

  // Safe manual test triggers to enrich the platform playground (Sandbox features)
  const generateSimulatedTaskView = () => {
    if (!selectedUser) {
      setToast({ message: "Please select a user to simulate an ad watch action.", type: "error" });
      return;
    }
    const rate = 0.05; // 80% of dynamic ad revenue task block is standard payout
    const updatedBalance = Number(selectedUser.balance) + rate;
    const updatedEarned = Number(selectedUser.total_earned) + rate;

    // Local injection
    setProfiles(prev => prev.map(p => {
      if (p.id === selectedUser.id) {
        return { ...p, balance: updatedBalance, total_earned: updatedEarned };
      }
      return p;
    }));

    const taskTx: Transaction = {
      id: `tx-task-${Date.now()}`,
      user_id: selectedUser.id,
      amount: rate,
      type: 'ad_view',
      description: "User completed reward stream: 'Premium Mobile Video Ad' (+0.0500 USDT, keeping 80%)",
      created_at: new Date().toISOString()
    };
    setTransactions(prev => [taskTx, ...prev]);
    setToast({ message: `User ${selectedUser.username} finished watching dynamic video ad (+0.0500 USDT)`, type: 'success' });
  };

  const createSimulatedUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUsername || !newEmail) {
      setToast({ message: "Username and Email are mandatory fields.", type: "error" });
      return;
    }

    const startingBalance = parseFloat(newBalance) || 0.0;
    const generatedUuid = `usr-${Math.random().toString(36).substring(2, 11)}-${Math.random().toString(36).substring(2, 6)}`;
    
    const newUser: Profile = {
      id: generatedUuid,
      username: newUsername.trim().toLowerCase(),
      email: newEmail.trim().toLowerCase(),
      balance: startingBalance,
      total_earned: startingBalance,
      is_banned: false,
      wallet_address: "T" + Math.random().toString(36).substring(2, 10).toUpperCase() + "xtR9bQsKmYd3eM8pV4Lh",
      ip_address: `${Math.floor(Math.random() * 210) + 12}.${Math.floor(Math.random() * 254)}.${Math.floor(Math.random() * 254)}.${Math.floor(Math.random() * 254)}`,
      created_at: new Date().toISOString()
    };

    setProfiles(prev => [newUser, ...prev]);
    setSelectedUserId(newUser.id);
    
    // Inject seed transactional log if starting balance is specified
    if (startingBalance > 0) {
      const initialTx: Transaction = {
        id: `tx-init-${Date.now()}`,
        user_id: newUser.id,
        amount: startingBalance,
        type: 'admin_adjustment',
        description: 'New user manual onboarding initial seed deposit',
        created_at: new Date().toISOString()
      };
      setTransactions(prev => [initialTx, ...prev]);
    }

    setNewUsername('');
    setNewEmail('');
    setNewBalance('');
    setShowAddUserModal(false);
    setToast({ message: `Simulated User profile created: @${newUser.username}`, type: 'success' });
  };

  // Helper utility copy string values
  const copyToClipboard = (text: string, subject: string) => {
    navigator.clipboard.writeText(text);
    setToast({ message: `${subject} copied to clipboard!`, type: 'info' });
  };

  // SQL table schema copy snippet generator helper
  const sqlSchemaSnippet = `
-- 1. PROFILES TABLE (Stores user identity, balances and status details)
CREATE TABLE public.profiles (
  id UUID REFERENCES auth.users NOT NULL PRIMARY KEY,
  username TEXT UNIQUE,
  email TEXT,
  balance NUMERIC(16,4) DEFAULT 0.0000,
  total_earned NUMERIC(16,4) DEFAULT 0.0000,
  is_banned BOOLEAN DEFAULT false,
  wallet_address TEXT,
  ip_address TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. TRANSACTIONS TABLE (Audit ledger of user task payments/deductions)
CREATE TABLE public.transactions (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  amount NUMERIC(16,4) NOT NULL,
  type TEXT NOT NULL, -- 'ad_view', 'micro_task', 'referral_bonus', 'admin_adjustment', 'withdrawal_payout'
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. WITHDRAWAL REQUESTS TABLE (Withdrawal queue requests for Admin payout)
CREATE TABLE public.withdrawal_requests (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  amount NUMERIC(16,4) NOT NULL,
  payment_method TEXT DEFAULT 'USDT (TRC-20)',
  wallet_address TEXT NOT NULL,
  status TEXT DEFAULT 'pending', -- 'pending', 'completed', 'rejected'
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  completed_at TIMESTAMP WITH TIME ZONE
);

-- 4. DATABASE TRIGGERS (Securely sync newly created accounts from Auth.users into profiles)
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, username, email, balance, total_earned, is_banned, created_at)
  VALUES (
    new.id,
    COALESCE(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1)),
    new.email,
    0.0000,
    0.0000,
    false,
    now()
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
`;

  return (
    <div className="min-h-screen bg-[#070b12] text-gray-100 flex flex-col font-sans selection:bg-cyan-500 selection:text-black">
      
      {/* Dynamic Toast Alerts banner widget */}
      {toast && (
        <div className={`fixed top-4 right-4 z-[999] flex items-center gap-3 px-4 py-3 rounded-xl border glow-neon-lg transition-all transform scale-100 animate-pulse duration-300 ${
          toast.type === 'success' ? 'bg-[#06201b]/95 border-emerald-500/40 text-emerald-300' :
          toast.type === 'error' ? 'bg-[#290d11]/95 border-red-500/40 text-red-300' :
          'bg-[#0a1d37]/95 border-cyan-500/40 text-cyan-200'
        }`}>
          {toast.type === 'success' ? <CheckCircle className="h-5 w-5 text-emerald-400 shrink-0" /> :
           toast.type === 'error' ? <AlertCircle className="h-5 w-5 text-red-400 shrink-0" /> :
           <Activity className="h-5 w-5 text-cyan-400 shrink-0" />}
          <div className="text-sm font-semibold max-w-sm">{toast.message}</div>
          <button id="close_toast_btn" onClick={() => setToast(null)} className="hover:text-white ml-2 transition-colors">
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* Primary Brand Navbar Header with real-time status indicators */}
      <header className="border-b border-[#141f35] bg-[#090f1e] px-6 py-4 sticky top-0 z-50 flex flex-col md:flex-row justify-between items-center gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-gradient-to-tr from-cyan-600 to-blue-700 rounded-lg shadow-md max-w-max">
            <Shield className="h-6 w-6 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold tracking-tight text-white font-display">
                EXTREME <span className="text-cyan-400 font-normal text-sm font-sans px-2 py-0.5 bg-cyan-950/80 border border-cyan-800/60 rounded">ADMIN CORE</span>
              </h1>
              <div className="text-[10px] font-mono text-gray-500 mt-1 uppercase">usdt-task.xyz</div>
            </div>
            <p className="text-xs text-gray-400">High-End Private Administration Deep-Dive Profile & Ledger Inspector</p>
          </div>
        </div>

        {/* Database Connection status container */}
        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto justify-end">
          <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold ring-1 ${
            connectionState === 'CONNECTED' 
              ? 'bg-emerald-950/70 text-emerald-450 ring-emerald-500/30' 
              : connectionState === 'ERROR'
              ? 'bg-red-950/70 text-red-400 ring-red-500/30'
              : 'bg-amber-950/70 text-amber-450 ring-amber-500/30'
          }`}>
            <span className={`h-2.5 w-2.5 rounded-full ${
              connectionState === 'CONNECTED' ? 'bg-emerald-400 animate-pulse' :
              connectionState === 'ERROR' ? 'bg-red-500' : 'bg-amber-400 animate-pulse'
            }`}></span>
            <span>
              {connectionState === 'CONNECTED' ? 'LIVE DB CLIENT' : 
               connectionState === 'ERROR' ? 'CONNECTION BREAK' : 'SANDBOX SIMULATOR'}
            </span>
          </div>

          <button
            id="toggle_config_btn"
            onClick={() => setShowConfig(!showConfig)}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#101b30] hover:bg-[#18294a] text-xs font-semibold text-gray-300 hover:text-white border border-[#1b2b48] transition-all"
          >
            <Settings className="h-4 w-4" />
            <span>Connect Live DB</span>
          </button>

          <button
            id="refresh_app_btn"
            onClick={performFetch}
            disabled={isRefreshing}
            className="p-1.5 rounded-lg bg-[#101b30] hover:bg-[#18294a] text-gray-450 hover:text-white border border-[#1b2b48] transition-all"
            title="Refresh list"
          >
            <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </header>

      {/* Supabase Connection Setup Box Panel - Sliding/Collapsible overlay container */}
      {showConfig && (
        <div className="bg-[#0b1328] border-b border-cyan-850 p-6 transition-all duration-300">
          <div className="max-w-4xl mx-auto">
            <div className="flex justify-between items-center mb-4">
              <div className="flex items-center gap-2">
                <Database className="h-5 w-5 text-cyan-400" />
                <h3 className="font-bold text-white font-display">Configure Real-Time Supabase Target Link</h3>
              </div>
              <button
                id="close_config_btn"
                onClick={() => setShowConfig(false)}
                className="text-gray-450 hover:text-white transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <p className="text-xs text-gray-400 mb-4 max-w-2xl leading-relaxed">
              Connect this portal dynamically to your active reward system. Enter your production Supabase URL and key credentials below. They are saved entirely client-side. The system will auto-read <code className="text-cyan-300 bg-cyan-950 font-mono px-1 rounded">public.profiles</code>, <code className="text-cyan-300 bg-cyan-950 font-mono px-1 rounded">public.transactions</code>, and <code className="text-cyan-300 bg-cyan-950 font-mono px-1 rounded">public.withdrawal_requests</code>.
            </p>

            <form onSubmit={handleConnect} className="grid grid-cols-1 md:grid-cols-2 gap-4 items-end">
              <div>
                <label className="block text-[11px] font-mono text-gray-400 uppercase tracking-wider mb-1.5">Supabase API URL Target</label>
                <input
                  id="supa_url_input"
                  type="url"
                  placeholder="https://gzkxybyepwosizlkrghx.supabase.co"
                  value={supabaseUrl}
                  onChange={(e) => setSupabaseUrl(e.target.value)}
                  className="w-full bg-[#030712] border border-[#1b2f4c] focus:border-cyan-500 rounded-lg py-2 px-3 text-sm font-mono text-cyan-300 placeholder-gray-600 outline-none transition-colors"
                />
              </div>

              <div>
                <label className="block text-[11px] font-mono text-gray-400 uppercase tracking-wider mb-1.5">Supabase API Anonymous KEY (Service-Role Preferable for admin)</label>
                <input
                  id="supa_key_input"
                  type="password"
                  placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3N1ZXIiOiJ..."
                  value={supabaseAnonKey}
                  onChange={(e) => setSupabaseAnonKey(e.target.value)}
                  className="w-full bg-[#030712] border border-[#1b2f4c] focus:border-cyan-500 rounded-lg py-2 px-3 text-sm font-mono text-cyan-300 placeholder-gray-600 outline-none transition-colors"
                />
              </div>

              <div className="md:col-span-2 flex flex-wrap gap-3 mt-2 justify-between">
                <div className="flex gap-2">
                  <button
                    id="connect_db_btn"
                    type="submit"
                    className="bg-gradient-to-r from-cyan-600 to-blue-700 hover:from-cyan-500 hover:to-blue-600 text-white font-semibold text-xs px-5 py-2.5 rounded-lg transition-all transform hover:scale-[1.02]"
                  >
                    Authenticate Database
                  </button>
                  {connectionState === 'CONNECTED' && (
                    <button
                      id="disconnect_db_btn"
                      type="button"
                      onClick={handleDisconnect}
                      className="bg-red-950/80 hover:bg-red-900/90 text-red-300 font-semibold text-xs px-4 py-2.5 rounded-lg border border-red-800/40 transition-all"
                    >
                      Disconnect Client
                    </button>
                  )}
                </div>

                <div className="flex items-center gap-1.5 text-xs text-gray-400 bg-slate-900 px-3 py-1.5 rounded-lg border border-slate-800">
                  <AlertTriangle className="h-4 w-4 text-amber-400 shrink-0" />
                  <span>Tables Missing? Check the <strong className="text-cyan-400 font-normal">"SQL Setup Schema"</strong> tab inside user workspace details to copy exact table scripts!</span>
                </div>
              </div>
            </form>

            {connectionError && (
              <div className="mt-4 p-3 rounded-lg bg-red-950/40 border border-red-900/40 text-red-300 text-xs font-mono flex items-start gap-2.5">
                <AlertCircle className="h-4 w-4 text-red-400 shrink-0 mt-0.5" />
                <p>{connectionError}</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Aggregate Statistics Ribbon Section */}
      <section className="bg-[#050810] border-b border-[#11192b] px-6 py-4 grid grid-cols-2 md:grid-cols-5 gap-4">
        
        <div className="bg-[#0c1221] border border-[#13203c] rounded-xl p-3 glow-neon">
          <div className="flex justify-between items-center text-xs text-gray-450 uppercase mb-1">
            <span>Administered Users</span>
            <Users className="h-4 w-4 text-cyan-400" />
          </div>
          <div className="text-lg font-bold text-white font-display">
            {metrics.totalUsers} <span className="text-xs font-normal text-gray-450">Active</span>
          </div>
          <p className="text-[10px] text-gray-500">Signups fully cataloged</p>
        </div>

        <div className="bg-[#0c1221] border border-[#13203c] rounded-xl p-3 glow-neon">
          <div className="flex justify-between items-center text-xs text-gray-450 uppercase mb-1">
            <span>Usable Funds Balance</span>
            <Wallet className="h-4 w-4 text-cyan-400" />
          </div>
          <div className="text-lg font-bold text-cyan-300 font-display">
            {metrics.activeBalance.toFixed(4)} <span className="text-xs font-normal text-cyan-400 font-sans">USDT</span>
          </div>
          <p className="text-[10px] text-gray-500">Held across user wallets</p>
        </div>

        <div className="bg-[#0c1221] border border-[#13203c] rounded-xl p-3 glow-neon">
          <div className="flex justify-between items-center text-xs text-gray-450 uppercase mb-1">
            <span>Banned Accounts</span>
            <Ban className="h-4 w-4 text-red-500 text-opacity-80" />
          </div>
          <div className="text-lg font-bold text-red-400 font-display">
            {metrics.bannedUsersCount} <span className="text-xs font-normal text-gray-500 font-sans">profiles</span>
          </div>
          <p className="text-[10px] text-gray-500">Fraud accounts blacklisted</p>
        </div>

        <div className="bg-[#0c1221] border border-[#13203c] rounded-xl p-3 glow-neon">
          <div className="flex justify-between items-center text-xs text-gray-450 uppercase mb-1">
            <span>Payout Requests Queue</span>
            <Clock className="h-4 w-4 text-amber-400" />
          </div>
          <div className={`text-lg font-bold font-display ${metrics.pendingWithdrawalsCount > 0 ? 'text-amber-400' : 'text-gray-400'}`}>
            {metrics.pendingWithdrawalsCount} <span className="text-xs font-normal text-gray-500 font-sans">Pending</span>
          </div>
          <p className="text-[10px] text-gray-500">Awaiting direct verification</p>
        </div>

        <div className="col-span-2 md:col-span-1 bg-[#0c1221] border border-[#13203c] rounded-xl p-3 glow-neon">
          <div className="flex justify-between items-center text-xs text-gray-450 uppercase mb-1">
            <span>Cumulative Withdrawals</span>
            <Coins className="h-4 w-4 text-emerald-400" />
          </div>
          <div className="text-lg font-bold text-emerald-400 font-display">
            {metrics.totalWithdrawn.toFixed(4)} <span className="text-xs font-normal text-emerald-500 font-sans">USDT</span>
          </div>
          <p className="text-[10px] text-gray-500">20% system commission cut paid</p>
        </div>

      </section>

      {/* Main Dual-Pane Workspace */}
      <main className="flex-1 flex flex-col lg:flex-row overflow-hidden">
        
        {/* LEFT PANE - Scrollable User List (1/3 Width) */}
        <section className="w-full lg:w-1/3 border-r border-[#141f35] bg-[#080d1a] flex flex-col overflow-y-auto max-h-[400px] lg:max-h-none lg:h-full">
          
          {/* Instant filter and search header */}
          <div className="p-4 border-b border-[#141f35] bg-[#0c1326] sticky top-0 z-10 flex flex-col gap-3">
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                <Search className="h-4 w-4 text-gray-500" />
              </span>
              <input
                id="sidebar_search_input"
                type="text"
                placeholder="Filter by name, email, uuid..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-[#050811] border border-[#182a47] focus:border-cyan-500 rounded-lg pl-9 pr-4 py-2 text-sm text-gray-200 outline-none transition-colors placeholder-gray-500"
              />
              {searchQuery && (
                <button
                  id="clear_search_btn"
                  onClick={() => setSearchQuery('')}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center hover:text-white text-gray-500"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>

            <div className="flex justify-between items-center">
              <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                System Catalog ({filteredUsers.length})
              </span>
              
              {/* Trigger manual user creator */}
              <button
                id="open_adduser_btn"
                onClick={() => setShowAddUserModal(true)}
                className="flex items-center gap-1 text-[11px] font-bold text-cyan-400 hover:text-cyan-300 transition-colors"
              >
                <Plus className="h-3 w-3" />
                <span>Simulate SignUp</span>
              </button>
            </div>
          </div>

          {/* Scrolling profile items column */}
          <div className="flex-1 divide-y divide-[#121c32]">
            {filteredUsers.length === 0 ? (
              <div className="p-8 text-center bg-transparent">
                <AlertCircle className="h-8 w-8 text-amber-500 mx-auto mb-2 text-opacity-50" />
                <p className="text-sm font-semibold text-gray-400 font-display">No profiles found</p>
                <p className="text-xs text-gray-550 mt-1">Try resetting filters or registering a simulated user above.</p>
              </div>
            ) : (
              filteredUsers.map((user) => {
                const isSelected = selectedUserId === user.id;
                const hasPending = withdrawals.some(w => w.user_id === user.id && w.status === 'pending');
                
                return (
                  <button
                    id={`user_item_${user.id}`}
                    key={user.id}
                    onClick={() => {
                      setSelectedUserId(user.id);
                      // Auto-switch tabs to show dynamic activities
                      if (activeTab === 'sql_guide') setActiveTab('transactions');
                    }}
                    className={`w-full text-left p-4 transition-all relative flex flex-col gap-2 ${
                      isSelected 
                        ? 'bg-[#0f1b34] border-l-4 border-cyan-500 text-white' 
                        : 'hover:bg-[#0c1324] text-gray-300'
                    }`}
                  >
                    <div className="flex justify-between items-start">
                      <div className="font-semibold text-sm truncate max-w-[170px] flex items-center gap-1">
                        <span className={isSelected ? 'text-cyan-350' : 'text-white'}>@{user.username}</span>
                        {user.is_banned && (
                          <span className="px-1.5 py-0.5 rounded text-[9px] font-extrabold bg-red-950/70 border border-red-800/60 text-red-400 uppercase tracking-wider shrink-0 ml-1">
                            Banned
                          </span>
                        )}
                        {hasPending && (
                          <span className="h-2 w-2 rounded-full bg-amber-400 shrink-0 ml-1" title="Pending Payout Approval!"/>
                        )}
                      </div>
                      
                      {/* Active balance layout formatter */}
                      <span className="text-xs font-bold font-mono tracking-wider text-cyan-455">
                        {Number(user.balance).toFixed(4)} <span className="text-[9px] font-sans text-gray-500">USDT</span>
                      </span>
                    </div>

                    <div className="flex justify-between items-center text-xs text-gray-450">
                      <span className="truncate max-w-[190px] text-gray-500">{user.email}</span>
                      <span className="text-[10px] text-gray-500 font-mono italic">
                        IP: {user.ip_address}
                      </span>
                    </div>
                  </button>
                );
              })
            )}
          </div>
          
          {/* Bottom helper metadata panel */}
          <div className="p-3 bg-[#050811] border-t border-[#13203b] text-center text-[10px] text-gray-550 flex justify-between items-center">
            <span>Platform Database: Extreme</span>
            <span>Est. Node Ingress: OK</span>
          </div>

        </section>

        {/* RIGHT PANE - Deep-Dive Workspace & Raw Data Inspector (2/3 Width) */}
        <section className="w-full lg:w-2/3 bg-[#060912] flex flex-col overflow-y-auto h-full p-4 lg:p-6">
          
          {selectedUser ? (
            <div className="space-y-6 max-w-5xl">
              
              {/* HEADER AREA: Selected user identity and action togglers */}
              <div className="bg-[#0c1221] border border-[#142340] rounded-2xl p-5 shadow-lg relative overflow-hidden">
                
                {/* Visual ambient accent glow decor */}
                <div className={`absolute top-0 right-0 w-32 h-32 rounded-full mix-blend-screen filter blur-3xl opacity-10 ${
                  selectedUser.is_banned ? 'bg-red-500' : 'bg-cyan-500'
                }`}></div>

                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 relative z-10">
                  <div>
                    <div className="flex items-center gap-3">
                      <h2 className="text-2xl font-bold font-display text-white">
                        @{selectedUser.username}
                      </h2>
                      {selectedUser.is_banned ? (
                        <span className="px-2.5 py-1 rounded-md text-xs font-bold bg-red-950 text-red-300 border border-red-900/60 shadow-lg glow-red">
                          BANNED USER
                        </span>
                      ) : (
                        <span className="px-2.5 py-1 rounded-md text-xs font-bold bg-emerald-950 text-emerald-300 border border-emerald-900/60">
                          SECURE ACCOUNT
                        </span>
                      )}
                    </div>

                    <div className="mt-2 space-y-1">
                      <p className="text-xs text-gray-400 flex items-center gap-1">
                        <span className="text-gray-500 font-mono">UID:</span> 
                        <code className="bg-[#050811] px-1.5 py-0.5 rounded text-cyan-300 font-mono text-[11px] selection:bg-cyan-500 selection:text-black">
                          {selectedUser.id}
                        </code>
                        <button
                          id="copy_uuid_btn"
                          onClick={() => copyToClipboard(selectedUser.id, "User ID")}
                          className="p-1 hover:text-white text-gray-550 transition-colors"
                          title="Copy User ID"
                        >
                          <Copy className="h-3.5 w-3.5" />
                        </button>
                      </p>
                      <p className="text-xs text-gray-400 flex items-center gap-1">
                        <span className="text-gray-500 font-mono">Mail:</span> 
                        <span className="text-gray-300">{selectedUser.email}</span>
                      </p>
                      <p className="text-xs text-gray-400 flex items-center gap-1">
                        <span className="text-gray-500 font-mono">Joined:</span> 
                        <span className="text-gray-350">{new Date(selectedUser.created_at).toLocaleString()}</span>
                      </p>
                    </div>
                  </div>

                  {/* Administrative Toggles panel - Ban & Sandbox Actions */}
                  <div className="flex flex-wrap gap-2 pt-2 md:pt-0">
                    
                    {/* Sandbox feature helper: Watched Ad simulator */}
                    <button
                      id="simulate_ad_btn"
                      onClick={generateSimulatedTaskView}
                      className="flex items-center gap-1.5 px-3.5 py-2 bg-[#0d1c3a] hover:bg-[#142854] text-xs font-semibold text-cyan-325 rounded-xl border border-[#1b325f] transition-all transform hover:scale-[1.02]"
                      title="Trigger custom ad-watch log to simulate earning (+0.05 USDT)"
                    >
                      <Plus className="h-4 w-4" />
                      <span>Simulate Ad Watch</span>
                    </button>

                    {/* BAN/UNBAN TOGGLE: executes raw database edits or local simulation update */}
                    <button
                      id="ban_toggle_btn"
                      onClick={handleToggleBan}
                      disabled={actionLoading}
                      className={`flex items-center gap-1.5 px-4 py-2 text-xs font-bold rounded-xl border transition-all transform hover:scale-[1.02] ${
                        selectedUser.is_banned
                          ? 'bg-emerald-950/80 hover:bg-emerald-900 border-emerald-800 text-emerald-300'
                          : 'bg-red-950/80 hover:bg-red-900 border-red-800 text-red-300'
                      }`}
                    >
                      <Ban className="h-4 w-4 shrink-0" />
                      <span>{selectedUser.is_banned ? 'UNBAN ACCOUNT' : 'BAN USER'}</span>
                    </button>

                  </div>
                </div>

                {/* Sub audit telemetry indicators */}
                <div className="mt-4 pt-4 border-t border-[#141e33] flex flex-wrap gap-x-6 gap-y-2 text-xs text-gray-500 font-mono">
                  <div>
                    <span>REGISTRATION IP:</span> <strong className="text-gray-300 font-normal">{selectedUser.ip_address}</strong>
                  </div>
                  <div>
                    <span>WITHDRAWAL ALIAS WALLET (TRC20):</span> <strong className="text-cyan-350 font-normal">{selectedUser.wallet_address}</strong>
                  </div>
                </div>

              </div>

              {/* SECTION: Ledger Status & Balance adjustment */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                
                {/* Balance & Earned USDT Stats summary card */}
                <div className="bg-[#0b1326] border border-[#122245] rounded-2xl p-4 md:col-span-1 flex flex-col justify-between glow-neon relative overflow-hidden">
                  <div>
                    <span className="text-[10px] font-mono font-bold text-gray-400 uppercase tracking-wider block mb-1">Current User Balance</span>
                    <div className="text-3xl font-bold text-cyan-300 font-display tracking-tight flex items-baseline">
                      <span>{Number(selectedUser.balance).toFixed(4)}</span>
                      <span className="text-xs font-normal text-cyan-500 font-sans ml-1 text-opacity-80">USDT</span>
                    </div>
                  </div>

                  <div className="mt-4 pt-3 border-t border-[#132244] flex justify-between items-center text-xs">
                    <span className="text-gray-500">Total Earned Life:</span>
                    <strong className="text-gray-350 font-bold font-mono">
                      {Number(selectedUser.total_earned).toFixed(4)} USDT
                    </strong>
                  </div>
                </div>

                {/* Direct Ledger Admin Multipliers / Balance Adjustment box */}
                <div className="bg-[#0b1326] border border-[#122245] rounded-2xl p-4 md:col-span-2">
                  <div className="flex items-center gap-1.5 mb-2.5">
                    <TrendingUp className="h-4 w-4 text-cyan-400" />
                    <h3 className="font-bold text-xs uppercase tracking-wider text-white">Manual Ledger Correction (Dbl-entry transaction)</h3>
                  </div>

                  <form onSubmit={handleAddAdjustment} className="space-y-3">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[10px] text-gray-550 mb-1">Correction Variable Amount (Negative for Deducting penalty)</label>
                        <input
                          id="ledger_amount_input"
                          type="text"
                          placeholder="e.g. +25.0000 or -5.0000"
                          value={adjustmentAmount}
                          onChange={(e) => setAdjustmentAmount(e.target.value)}
                          className="w-full bg-[#040812] border border-[#172a49] focus:border-cyan-500 rounded-lg py-1.5 px-3 text-xs font-mono text-cyan-300 placeholder-gray-650 outline-none"
                        />
                      </div>

                      <div>
                        <label className="block text-[10px] text-gray-550 mb-1">Accounting Reason Details</label>
                        <input
                          id="ledger_desc_input"
                          type="text"
                          placeholder="e.g. Referral compensation pay"
                          value={adjustmentDescription}
                          onChange={(e) => setAdjustmentDescription(e.target.value)}
                          className="w-full bg-[#040812] border border-[#172a49] focus:border-cyan-500 rounded-lg py-1.5 px-3 text-xs text-gray-300 placeholder-gray-650 outline-none"
                        />
                      </div>
                    </div>

                    <div className="flex justify-between items-center pt-1.5">
                      <div className="flex gap-4">
                        <label className="flex items-center gap-1.5 text-xs text-gray-400 cursor-pointer">
                          <input
                            type="radio"
                            name="tx_type"
                            checked={adjustmentType === 'admin_adjustment'}
                            onChange={() => setAdjustmentType('admin_adjustment')}
                            className="text-cyan-500 focus:ring-cyan-500"
                          />
                          <span>Adjustment</span>
                        </label>
                        <label className="flex items-center gap-1.5 text-xs text-gray-400 cursor-pointer">
                          <input
                            type="radio"
                            name="tx_type"
                            checked={adjustmentType === 'referral_bonus'}
                            onChange={() => setAdjustmentType('referral_bonus')}
                            className="text-cyan-500 focus:ring-cyan-500"
                          />
                          <span>Ref Bonus</span>
                        </label>
                        <label className="flex items-center gap-1.5 text-xs text-gray-400 cursor-pointer">
                          <input
                            type="radio"
                            name="tx_type"
                            checked={adjustmentType === 'micro_task'}
                            onChange={() => setAdjustmentType('micro_task')}
                            className="text-cyan-500 focus:ring-cyan-500"
                          />
                          <span>Task Comp</span>
                        </label>
                      </div>

                      <button
                        id="submit_ledger_adj_btn"
                        type="submit"
                        disabled={actionLoading}
                        className="bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs px-4 py-1.5 rounded-lg transition-all"
                      >
                        Adjust Balance
                      </button>
                    </div>
                  </form>
                </div>

              </div>

              {/* Tab Navigation Workspace details */}
              <div className="border-b border-[#142340] flex space-x-6">
                <button
                  id="tab_transactions_btn"
                  onClick={() => setActiveTab('transactions')}
                  className={`pb-3 text-sm font-semibold relative ${
                    activeTab === 'transactions' ? 'text-cyan-400' : 'text-gray-450 hover:text-white'
                  }`}
                >
                  Ledger Transactions ({selectedUserTransactions.length})
                  {activeTab === 'transactions' && <span className="absolute bottom-0 left-0 w-full h-0.5 bg-cyan-400 rounded-full"></span>}
                </button>

                <button
                  id="tab_withdrawals_btn"
                  onClick={() => setActiveTab('withdrawals')}
                  className={`pb-3 text-sm font-semibold relative flex items-center gap-1.5 ${
                    activeTab === 'withdrawals' ? 'text-cyan-400' : 'text-gray-450 hover:text-white'
                  }`}
                >
                  Withdrawals queue ({selectedUserWithdrawals.length})
                  {selectedUserWithdrawals.some(w => w.status === 'pending') && (
                    <span className="h-2 w-2 rounded-full bg-amber-400 animate-pulse" />
                  )}
                  {activeTab === 'withdrawals' && <span className="absolute bottom-0 left-0 w-full h-0.5 bg-cyan-400 rounded-full"></span>}
                </button>

                <button
                  id="tab_sql_guide_btn"
                  onClick={() => setActiveTab('sql_guide')}
                  className={`pb-3 text-sm font-semibold relative ${
                    activeTab === 'sql_guide' ? 'text-cyan-400' : 'text-gray-450 hover:text-white'
                  }`}
                >
                  SQL Setup Schema
                  {activeTab === 'sql_guide' && <span className="absolute bottom-0 left-0 w-full h-0.5 bg-cyan-400 rounded-full"></span>}
                </button>
              </div>

              {/* TAB CONTAINER BODY */}
              <div className="min-h-[180px]">
                
                {/* TAB 1: LEDGER TRANSACTIONS */}
                {activeTab === 'transactions' && (
                  <div className="bg-[#0b1326] border border-[#122245] rounded-2xl overflow-hidden shadow-sm">
                    {selectedUserTransactions.length === 0 ? (
                      <div className="p-8 text-center text-gray-500 text-xs">
                        No transaction logs on record for this user profile.
                      </div>
                    ) : (
                      <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse text-xs">
                          <thead>
                            <tr className="bg-[#040811] text-gray-400 font-mono text-[10px] uppercase border-b border-[#142240]">
                              <th className="p-3">Reference/ID</th>
                              <th className="p-3">Category</th>
                              <th className="p-3">Audit Logger</th>
                              <th className="p-3">Amount</th>
                              <th className="p-3 text-right">Timestamp</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-[#132243]">
                            {selectedUserTransactions.map((tx) => (
                              <tr key={tx.id} className="hover:bg-[#0f1b34]/40 transition-colors">
                                <td className="p-3 font-mono text-gray-500 scale-95 origin-left">
                                  {tx.id}
                                </td>
                                <td className="p-3">
                                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                                    tx.type === 'ad_view' ? 'bg-cyan-950 text-cyan-300 border border-cyan-900/60' :
                                    tx.type === 'micro_task' ? 'bg-indigo-950 text-indigo-300 border border-indigo-900/60' :
                                    tx.type === 'referral_bonus' ? 'bg-emerald-950 text-emerald-300 border border-emerald-900/60' :
                                    tx.type === 'withdrawal_payout' ? 'bg-purple-950 text-purple-300 border border-purple-900/60' :
                                    'bg-slate-8 w00 text-gray-300'
                                  }`}>
                                    {tx.type}
                                  </span>
                                </td>
                                <td className="p-3 max-w-xs truncate text-gray-300">
                                  {tx.description}
                                </td>
                                <td className={`p-3 font-mono font-bold ${tx.amount > 0 ? 'text-emerald-400' : 'text-purple-400'}`}>
                                  {tx.amount > 0 ? '+' : ''}{Number(tx.amount).toFixed(4)} USDT
                                </td>
                                <td className="p-3 text-right text-gray-500 font-mono">
                                  {new Date(tx.created_at).toLocaleString()}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                )}

                {/* TAB 2: WITHDRAWAL REQUESTS & ACTIONS */}
                {activeTab === 'withdrawals' && (
                  <div className="bg-[#0b1326] border border-[#122245] rounded-2xl overflow-hidden shadow-sm">
                    {selectedUserWithdrawals.length === 0 ? (
                      <div className="p-8 text-center text-gray-500 text-xs">
                        No withdraw payouts requested by this profile yet.
                      </div>
                    ) : (
                      <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse text-xs">
                          <thead>
                            <tr className="bg-[#040811] text-gray-400 font-mono text-[10px] uppercase border-b border-[#142240]">
                              <th className="p-3">Req ID</th>
                              <th className="p-3">Chain / Protocol</th>
                              <th className="p-3">USDT Size</th>
                              <th className="p-3">Address</th>
                              <th className="p-3">Status</th>
                              <th className="p-3 text-right">Actions</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-[#132243]">
                            {selectedUserWithdrawals.map((req) => (
                              <tr key={req.id} className="hover:bg-[#0f1b34]/40 transition-colors">
                                <td className="p-3 font-mono text-gray-500 font-bold">
                                  #{req.id}
                                </td>
                                <td className="p-3 font-semibold text-gray-300">
                                  {req.payment_method}
                                </td>
                                <td className="p-3 font-mono font-extrabold text-white text-sm">
                                  {Number(req.amount).toFixed(4)} USDT
                                </td>
                                <td className="p-3 font-mono text-[11px] text-gray-400">
                                  <div className="flex items-center gap-1">
                                    <span>{req.wallet_address.substring(0, 12)}...{req.wallet_address.substring(req.wallet_address.length - 8)}</span>
                                    <button
                                      id={`copy_wallet_row_btn_${req.id}`}
                                      onClick={() => copyToClipboard(req.wallet_address, "Wallet Address")}
                                      className="p-1 hover:text-white text-gray-600"
                                      title="Copy full TRON/BEP20 address"
                                    >
                                      <Copy className="h-3 w-3" />
                                    </button>
                                  </div>
                                </td>
                                <td className="p-3">
                                  <span className={`px-2 py-0.5 rounded text-[9px] uppercase tracking-wider font-extrabold ${
                                    req.status === 'completed' ? 'bg-emerald-950 text-emerald-300 border border-emerald-900/60' :
                                    req.status === 'reject' ? 'bg-red-950 text-red-300 border border-red-900/60' :
                                    'bg-amber-950 text-amber-300 border border-amber-900/60 animate-pulse'
                                  }`}>
                                    {req.status}
                                  </span>
                                </td>
                                <td className="p-3 text-right">
                                  {req.status === 'pending' ? (
                                    <button
                                      id={`approve_with_btn_${req.id}`}
                                      onClick={() => handleApproveWithdrawal(req.id, req.amount)}
                                      disabled={actionLoading}
                                      className="bg-emerald-600 hover:bg-emerald-500 font-bold text-[10px] text-white px-3 py-1 rounded transition-all glow-neon transform active:scale-95"
                                    >
                                      Approve Payout
                                    </button>
                                  ) : (
                                    <span className="text-gray-500 text-[10px] italic">
                                      Disbursed {req.completed_at ? new Date(req.completed_at).toLocaleDateString() : ''}
                                    </span>
                                  )}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                )}

                {/* TAB 3: SQL SCHEMA GUIDE (Gives users exact copy codes for Supabase setup) */}
                {activeTab === 'sql_guide' && (
                  <div className="bg-[#0b1326] border border-[#122245] rounded-2xl p-4">
                    <div className="flex justify-between items-center mb-2">
                      <div className="flex items-center gap-1.5 text-cyan-400">
                        <Terminal className="h-4.5 w-4.5" />
                        <h4 className="font-semibold text-xs uppercase font-mono tracking-wider">Execute on Supabase Database SQL Editor</h4>
                      </div>
                      <button
                        id="copy_sql_btn"
                        onClick={() => copyToClipboard(sqlSchemaSnippet, "Supabase migration setup Script")}
                        className="flex items-center gap-1.5 text-[11px] font-bold text-cyan-400 hover:text-cyan-300 transition-colors"
                      >
                        <Copy className="h-3.5 w-3.5" />
                        <span>Copy setup Script</span>
                      </button>
                    </div>

                    <p className="text-xs text-gray-400 mb-3 leading-relaxed">
                      Copy and execute this script directly in your <strong className="text-cyan-455">Supabase Workspace &gt; SQL Editor</strong> block to instantiate all necessary reward schema profiles and ledger logs. Note this automatically syncs newly created auth signups!
                    </p>

                    <pre className="p-3 rounded-lg bg-[#040810] border border-[#152445] text-cyan-300 font-mono text-[10px] max-h-[220px] overflow-y-auto whitespace-pre-wrap select-all">
                      {sqlSchemaSnippet}
                    </pre>
                  </div>
                )}

              </div>

              {/* SECTION: RAW REAL-TIME PROFILE JSON DATA INSPECTOR */}
              <div className="bg-[#050811] border border-[#11192e] rounded-2xl p-5 relative">
                <div className="flex justify-between items-center mb-3">
                  <div className="flex items-center gap-2">
                    <FileText className="h-4.5 w-4.5 text-cyan-450" />
                    <div>
                      <h3 className="font-bold text-xs uppercase tracking-wider text-white font-display">Row Level Raw inspector (<code className="text-[10px] text-cyan-400">public.profiles</code>)</h3>
                      <p className="text-[10px] text-gray-500">Absolutely everything stored in the database is visible below</p>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <button
                      id="copy_raw_json_btn"
                      onClick={() => copyToClipboard(JSON.stringify(selectedUser, null, 2), "Raw Profile JSON Data")}
                      className="p-1.5 hover:text-white hover:bg-[#10192e] text-gray-500 rounded-lg border border-[#14223f] transition-all flex items-center gap-1 text-[11px] font-semibold"
                      title="Copy raw JSON payload"
                    >
                      <Copy className="h-3.5 w-3.5" />
                      <span>Copy Payload</span>
                    </button>
                  </div>
                </div>

                <div className="relative rounded-xl border border-[#111d33] bg-[#02050b] overflow-hidden">
                  <div className="absolute top-2 right-3 font-mono text-[8px] text-gray-600 select-none">
                    SCHEMA: profiles
                  </div>
                  <pre id="raw_data_view" className="p-4 font-mono text-xs text-cyan-400 overflow-x-auto max-h-[300px] whitespace-pre-wrap leading-relaxed select-all">
                    {JSON.stringify(selectedUser, null, 2)}
                  </pre>
                </div>
              </div>

            </div>
          ) : (
            
            // Empty State view when database profiles count has settled on null
            <div className="h-full flex flex-col justify-center items-center py-20 px-8 text-center max-w-lg mx-auto">
              <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 glow-neon-lg mb-6 pulse-glow">
                <Database className="h-10 w-10 text-cyan-455" />
              </div>
              <h3 className="text-xl font-bold text-white font-display">Select a Profile to audit</h3>
              <p className="text-sm text-gray-500 mt-2 leading-relaxed">
                Choose one of the Watch-to-Earn reward earners in the system sidebar alphabetically listed. This will query both withdrawal requests lists and transaction history ledger blocks simultaneously in parallel.
              </p>

              <div className="mt-8 p-4 bg-[#0a1122]/90 border border-cyan-900/40 rounded-xl w-full">
                <span className="text-xs font-bold text-cyan-400 uppercase tracking-widest block mb-2">Sandbox Playground Commands</span>
                <button
                  id="empty_state_add_btn"
                  onClick={() => setShowAddUserModal(true)}
                  className="bg-gradient-to-r from-cyan-600 to-blue-700 hover:from-cyan-500 hover:to-blue-600 text-white font-bold text-xs px-5 py-2.5 rounded-lg transition-all w-full"
                >
                  Create Simulated Earner Row (+ Profile)
                </button>
              </div>
            </div>
          )}

        </section>

      </main>

      {/* MODAL CONTAINER - Simulate SignUp Registration */}
      {showAddUserModal && (
        <div id="adduser_modal" className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs">
          <div className="bg-[#0c1221] border border-[#1e3256] rounded-2xl max-w-md w-full p-6 shadow-2xl relative">
            <button
              id="close_adduser_modal"
              onClick={() => setShowAddUserModal(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-white hover:bg-[#1a2d53] p-1.5 rounded-lg transition-all"
            >
              <X className="h-5 w-5" />
            </button>

            <div className="flex items-center gap-2 mb-4">
              <UserCheck className="h-5 w-5 text-cyan-400" />
              <h3 className="text-lg font-bold text-white font-display">Simulate Watch-to-Earn SignUp</h3>
            </div>

            <p className="text-xs text-gray-400 mb-4 leading-relaxed">
              Register a mock profile immediately. This injects user credentials, wallet strings, and a dynamic randomly selected device IP address directly into local React state arrays.
            </p>

            <form onSubmit={createSimulatedUser} className="space-y-4">
              <div>
                <label className="block text-[11px] font-mono text-gray-400 uppercase tracking-wider mb-1.5">Username handle</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3 flex items-center font-mono text-gray-500 text-sm">@</span>
                  <input
                    id="new_username_input"
                    type="text"
                    required
                    placeholder="satoshi_watch"
                    value={newUsername}
                    onChange={(e) => setNewUsername(e.target.value)}
                    className="w-full bg-[#040810] border border-[#1b2f4c] focus:border-cyan-500 rounded-lg pl-8 pr-3 py-2 text-sm text-white focus:ring-0 outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-mono text-gray-400 uppercase tracking-wider mb-1.5">Email Address</label>
                <input
                  id="new_email_input"
                  type="email"
                  required
                  placeholder="satoshi@rewards.com"
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  className="w-full bg-[#040810] border border-[#1b2f4c] focus:border-cyan-500 rounded-lg py-2 px-3 text-sm text-white focus:ring-0 outline-none"
                />
              </div>

              <div>
                <label className="block text-[11px] font-mono text-gray-400 uppercase tracking-wider mb-1.5">Initial Seed Balance (Optional USDT)</label>
                <input
                  id="new_balance_input"
                  type="number"
                  step="0.0001"
                  placeholder="e.g. 10.5000"
                  value={newBalance}
                  onChange={(e) => setNewBalance(e.target.value)}
                  className="w-full bg-[#040810] border border-[#1b2f4c] focus:border-cyan-500 rounded-lg py-2 px-3 text-sm text-cyan-300 font-mono focus:ring-0 outline-none"
                />
              </div>

              <div className="pt-2 flex gap-3">
                <button
                  id="simulate_signup_submit_btn"
                  type="submit"
                  className="flex-1 bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-sm py-2.5 rounded-lg transition-all"
                >
                  Create Profile Row
                </button>
                <button
                  id="cancel_signup_btn"
                  type="button"
                  onClick={() => setShowAddUserModal(false)}
                  className="bg-[#14213d] hover:bg-[#1a2d52] text-gray-300 text-sm px-4 py-2.5 rounded-lg transition-all"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Simple Footer Bar */}
      <footer className="bg-[#040710] border-t border-[#10192b] px-6 py-4 flex flex-col sm:flex-row justify-between items-center gap-3 text-xs text-gray-550">
        <div className="flex items-center gap-1.5">
          <Shield className="h-4 w-4 text-cyan-500" />
          <span>Extreme Reward Protocol and Admin Portal Framework © 2026. All rights secured.</span>
        </div>
        <div className="flex items-center gap-4 font-mono text-[10px]">
          <span>Ingress Port: <strong className="text-cyan-400 font-normal">3000</strong></span>
          <span>Status: <strong className="text-emerald-400 font-normal">Active TLS</strong></span>
        </div>
      </footer>

    </div>
  );
}

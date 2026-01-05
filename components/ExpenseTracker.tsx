
import React, { useState, useEffect, useMemo, forwardRef, useImperativeHandle, useRef } from 'react';
import { Plus, Trash2, ShoppingBag, Utensils, Bus, MoreHorizontal, Cloud, CloudOff, LogOut, LogIn, Users, ChevronUp, ChevronDown, Pencil, Receipt, Calculator, Delete, ArrowRight, ArrowLeft, Info, Save, Settings, Wallet, AlertTriangle, ArrowRightLeft, CheckCircle2, Download, RotateCcw, Check, X, Globe, BarChart3 } from 'lucide-react';
import { Expense, UserProfile, TripSettings } from '../types';
import { syncService } from '../services/firebase';

type Language = 'zh' | 'en';

const TRANSLATIONS = {
    zh: {
        appName: 'SenTrip Pay',
        totalExpense: '總支出',
        checkDetails: '查看分帳',
        viewStats: '消費統計',
        statSpent: '個人消費 (花了)',
        statAdvanced: '代墊金額 (墊了)',
        settleDetails: '結算明細',
        settleAll: '全部結清',
        allSettled: '目前沒有需要結算的款項。',
        owe: '應付',
        receive: '應收',
        settled: '已結清',
        unsettled: '未結清',
        delete: '刪除',
        edit: '編輯',
        save: '儲存',
        cancel: '取消',
        confirmDelete: '確定刪除？',
        confirmSettle: '⚠️ 確定要結清所有帳務嗎？\n結清後將無法再編輯這些項目的金額。',
        confirmReset: '⚠️即將重置應用程式\n\n此動作將：\n1. 斷開雲端同步連線\n2. 清空所有本機儲存資料\n3. 回復至初始狀態\n\n若資料未同步至雲端，將會永久遺失。\n\n確定要繼續嗎？',
        confirmLogout: '確定要登出同步模式嗎？',
        noExpenses: '暫無支出紀錄',
        addExpense: '新增支出',
        editExpense: '編輯支出',
        amount: '金額',
        title: '項目名稱',
        titlePlaceholder: '輸入項目名稱 (如: 晚餐、計程車)',
        category: '類別',
        date: '日期',
        payer: '付款者',
        splitType: '分帳方式',
        splitAvg: '平分',
        splitSelf: '個人',
        splitInd: '個別',
        splitDetails: '分帳詳情',
        members: '成員管理',
        addMember: '新增成員',
        newMemberPlaceholder: '輸入新成員名字',
        removeMemberError: '無法移除（至少需一位成員或已有紀錄）',
        sync: '雲端同步',
        syncConnected: '已連線',
        syncOffline: '離線',
        syncError: '連線失敗',
        syncConnect: '連線同步',
        syncDisconnect: '中斷連線',
        groupId: '群組 ID',
        pin: 'PIN 碼',
        settings: '行程設定',
        startDate: '開始日期',
        endDate: '結束日期',
        currency: '行程幣別',
        currencyChangeWarn: '需結清所有款項才能變更幣別',
        language: '語言 / Language',
        resetApp: '重置應用程式',
        exportCSV: '匯出支出紀錄 (.csv)',
        exchange: '匯率換算',
        calculator: '計算機',
        exchangeRate: '匯率設定',
        inputForeign: '輸入外幣金額',
        recordIt: '記一筆',
        categories: {
            food: '餐飲',
            shopping: '購物',
            transport: '交通',
            other: '其他'
        },
        csvHeaders: ["日期", "項目", "類別", "金額", "幣別", "先付者", "分帳方式", "分帳詳情", "狀態"],
        syncHint: '輸入相同的群組 ID 與 PIN 碼，即可在多裝置間即時同步帳務。',
        memberHint: '注意：移除成員需該成員無任何消費紀錄。',
        settingsHint: '修改日期將重新計算所有支出的天數歸屬。\n若處於同步模式，設定將同步至雲端。',
        unknown: '未知'
    },
    en: {
        appName: 'SenTrip Pay',
        totalExpense: 'Total Expense',
        checkDetails: 'Debts',
        viewStats: 'Stats',
        statSpent: 'Spent',
        statAdvanced: 'Advanced',
        settleDetails: 'Settlement',
        settleAll: 'Settle All',
        allSettled: 'All expenses are settled.',
        owe: 'Owes',
        receive: 'Receives',
        settled: 'Settled',
        unsettled: 'Open',
        delete: 'Delete',
        edit: 'Edit',
        save: 'Save',
        cancel: 'Cancel',
        confirmDelete: 'Are you sure you want to delete?',
        confirmSettle: '⚠️ Settle all outstanding debts?\nYou cannot edit amounts after settling.',
        confirmReset: '⚠️ Factory Reset\n\nThis will:\n1. Disconnect cloud sync\n2. Clear local storage\n3. Reset to initial state\n\nUnsynced data will be lost.\n\nContinue?',
        confirmLogout: 'Log out of sync mode?',
        noExpenses: 'No expenses yet',
        addExpense: 'New Expense',
        editExpense: 'Edit Expense',
        amount: 'Amount',
        title: 'Title',
        titlePlaceholder: 'Item name (e.g. Dinner, Taxi)',
        category: 'Category',
        date: 'Date',
        payer: 'Payer',
        splitType: 'Split By',
        splitAvg: 'Equal',
        splitSelf: 'Self',
        splitInd: 'Custom',
        splitDetails: 'Split Details',
        members: 'Members',
        addMember: 'Add Member',
        newMemberPlaceholder: 'New member name',
        removeMemberError: 'Cannot remove (Need 1+ member or has records)',
        sync: 'Cloud Sync',
        syncConnected: 'Synced',
        syncOffline: 'Offline',
        syncError: 'Error',
        syncConnect: 'Connect',
        syncDisconnect: 'Disconnect',
        groupId: 'Group ID',
        pin: 'PIN Code',
        settings: 'Trip Settings',
        startDate: 'Start Date',
        endDate: 'End Date',
        currency: 'Currency',
        currencyChangeWarn: 'Settle all expenses before changing currency',
        language: 'Language',
        resetApp: 'Reset App',
        exportCSV: 'Export CSV',
        exchange: 'Exchange',
        calculator: 'Calculator',
        exchangeRate: 'Exchange Rate',
        inputForeign: 'Foreign Amount',
        recordIt: 'Record',
        categories: {
            food: 'Food',
            shopping: 'Shop',
            transport: 'Trans',
            other: 'Other'
        },
        csvHeaders: ["Date", "Item", "Category", "Amount", "Currency", "Payer", "Method", "Details", "Status"],
        syncHint: 'Enter the same Group ID & PIN to sync across devices.',
        memberHint: 'Note: Can only remove members with no records.',
        settingsHint: 'Changing dates recalculates day labels.\nSettings sync to cloud if connected.',
        unknown: 'Unknown'
    }
};

const CATEGORIES_DEF = [
  { id: 'food', icon: Utensils, color: 'text-orange-600', bg: 'bg-orange-50' },
  { id: 'shopping', icon: ShoppingBag, color: 'text-purple-600', bg: 'bg-purple-50' },
  { id: 'transport', icon: Bus, color: 'text-blue-600', bg: 'bg-blue-50' },
  { id: 'other', icon: MoreHorizontal, color: 'text-gray-600', bg: 'bg-gray-50' },
] as const;

// Sorted by Code ASC
const SUPPORTED_CURRENCIES = [
    { code: 'EUR', label: 'Euro' },
    { code: 'JPY', label: 'Yen' },
    { code: 'KRW', label: 'Won' },
    { code: 'MYR', label: 'Ringgit' },
    { code: 'THB', label: 'Baht' },
    { code: 'TWD', label: 'TWD' },
    { code: 'USD', label: 'USD' },
];

const DEFAULT_RATES: Record<string, number> = {
    EUR: 34.5,
    JPY: 0.21,
    KRW: 0.024,
    MYR: 7.35,
    THB: 0.94,
    TWD: 1,
    USD: 31.5,
};

interface Props {
    tripSettings: TripSettings;
    onSettingsSync: (settings: TripSettings) => void;
    onUpdateLocalSettings: (settings: TripSettings) => void;
}

const ExpenseTracker = forwardRef<{ pushSettings: (settings: TripSettings) => Promise<void> }, Props>(({ tripSettings, onSettingsSync, onUpdateLocalSettings }, ref) => {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [users, setUsers] = useState<UserProfile[]>([{ id: 'u1', name: 'User' }]);
  
  // Language State
  const [language, setLanguage] = useState<Language>(() => {
      const saved = localStorage.getItem('bkk_app_language');
      return (saved === 'en' || saved === 'zh') ? saved : 'zh';
  });

  const t = TRANSLATIONS[language];

  // Save Language Preference
  useEffect(() => {
      localStorage.setItem('bkk_app_language', language);
  }, [language]);

  // UI States
  const [showUserManage, setShowUserManage] = useState(false);
  const [showDebtDetails, setShowDebtDetails] = useState(false);
  const [showStats, setShowStats] = useState(false);
  
  // Accordion State
  const [expandedExpenseId, setExpandedExpenseId] = useState<string | null>(null);

  const [isFormExpanded, setIsFormExpanded] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [tempSettings, setTempSettings] = useState<TripSettings>(tripSettings);

  // Sync States
  const [isSyncMode, setIsSyncMode] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<string>('');
  const [groupId, setGroupId] = useState('');
  const [pin, setPin] = useState('');
  const [tempGroupId, setTempGroupId] = useState('');
  const [tempPin, setTempPin] = useState('');
  const [showAuth, setShowAuth] = useState(false);
  const [firebaseError, setFirebaseError] = useState(false);
  const [newUserName, setNewUserName] = useState('');

  // User Edit States
  const [editingUserId, setEditingUserId] = useState<string | null>(null);
  const [editNameVal, setEditNameVal] = useState('');

  // Tool States
  const [showExchange, setShowExchange] = useState(false);
  const [calcCurrency, setCalcCurrency] = useState<string>('USD'); // Default placeholder
  const [calcAmount, setCalcAmount] = useState('');
  const [showSimpleCalc, setShowSimpleCalc] = useState(false);
  const [simpleCalcDisplay, setSimpleCalcDisplay] = useState('');
  
  const [exchangeRates, setExchangeRates] = useState<Record<string, number>>(() => {
      const saved = localStorage.getItem('bkk_exchange_rates');
      return saved ? { ...DEFAULT_RATES, ...JSON.parse(saved) } : DEFAULT_RATES;
  });

  // --- Avatar Logic: Handle duplicates (e.g. A1, A2) ---
  const avatarLabels = useMemo(() => {
      const map: Record<string, string> = {};
      const charCounts: Record<string, number> = {};
      const charIndices: Record<string, number> = {};

      // First pass: Count occurrences of first char
      users.forEach(u => {
          const char = (u.name[0] || '?').toUpperCase();
          charCounts[char] = (charCounts[char] || 0) + 1;
      });

      // Second pass: Assign labels
      users.forEach(u => {
          const char = (u.name[0] || '?').toUpperCase();
          if (charCounts[char] > 1) {
              const index = (charIndices[char] || 0) + 1;
              charIndices[char] = index;
              map[u.id] = `${char}${index}`;
          } else {
              map[u.id] = char;
          }
      });
      return map;
  }, [users]);

  // --- History API Logic for Mobile Back Button ---
  const historyEnabled = useRef(true);

  const closeAllWidgets = () => { 
      setShowSimpleCalc(false); 
      setShowExchange(false); 
      setShowUserManage(false); 
      setShowAuth(false); 
      setShowSettings(false); 
      setExpandedExpenseId(null); 
      setIsFormExpanded(false); 
      setShowDebtDetails(false); 
      setShowStats(false);
  };

  const goBack = () => {
      if (historyEnabled.current) {
        window.history.back();
      } else {
        closeAllWidgets();
      }
  };

  const openModal = (hash: string, openLogic: () => void) => {
      try {
        if (historyEnabled.current) {
            window.history.pushState({ modal: hash }, '', `#${hash}`);
        }
        openLogic();
      } catch (e) {
        console.warn("History pushState blocked (sandbox mode). Falling back to modal-only mode.");
        historyEnabled.current = false;
        openLogic();
      }
  };

  useEffect(() => {
      const handlePopState = () => {
          closeAllWidgets();
      };
      window.addEventListener('popstate', handlePopState);
      return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  useEffect(() => {
      localStorage.setItem('bkk_exchange_rates', JSON.stringify(exchangeRates));
  }, [exchangeRates]);

  const currentRate = exchangeRates[calcCurrency] || 1;
  const tripCurrency = tripSettings.currency || 'TWD';

  // Initialize calc currency to something other than trip currency if possible
  useEffect(() => {
      if (calcCurrency === tripCurrency) {
          const next = SUPPORTED_CURRENCIES.find(c => c.code !== tripCurrency)?.code || 'USD';
          setCalcCurrency(next);
      }
  }, [tripCurrency]);

  const handleRateChange = (currency: string, val: string) => {
      const num = parseFloat(val);
      setExchangeRates(prev => ({ ...prev, [currency]: isNaN(num) ? 0 : num }));
  };

  const calculatedBaseAmount = useMemo(() => {
      const val = parseFloat(calcAmount);
      if (isNaN(val)) return 0;
      return Math.round(val * currentRate);
  }, [calcAmount, currentRate]);

  useImperativeHandle(ref, () => ({
    pushSettings: async (newSettings: TripSettings) => {
      if (isSyncMode && syncService.isReady() && groupId && pin) {
        try {
            await syncService.updateSettings(groupId, pin, newSettings);
        } catch (e: any) {
            console.error(e);
            alert(`Sync Failed: ${e.message}`);
        }
      }
    }
  }));

  const TRIP_DATES = useMemo(() => {
    const dates = [];
    const start = new Date(tripSettings.startDate);
    const end = new Date(tripSettings.endDate);
    const temp = new Date(start);
    let limit = 0;
    while (temp <= end && limit < 60) { // Allowed up to 60 days range
      const m = String(temp.getMonth() + 1).padStart(2, '0');
      const d = String(temp.getDate()).padStart(2, '0');
      dates.push({ label: `D${limit + 1} (${m}/${d})`, value: `${temp.getFullYear()}-${m}-${d}` });
      temp.setDate(temp.getDate() + 1);
      limit++;
    }
    return dates;
  }, [tripSettings]);

  const getTodayString = () => {
    const d = new Date();
    const str = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    return TRIP_DATES.some(t => t.value === str) ? str : (TRIP_DATES[0]?.value || '');
  };

  const getTripDayId = (dateStr: string): number => {
    const startLocal = new Date(tripSettings.startDate);
    const [y, m, d] = dateStr.split('-').map(Number);
    const diffDays = Math.ceil((new Date(y, m - 1, d).getTime() - startLocal.getTime()) / (1000 * 60 * 60 * 24));
    return diffDays >= 0 ? diffDays + 1 : 0;
  };

  const [editingId, setEditingId] = useState<string | null>(null);
  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState<Expense['category']>('food');
  const [selectedDate, setSelectedDate] = useState<string>(getTodayString()); 
  const [payer, setPayer] = useState<string>('u1'); 
  const [splitType, setSplitType] = useState<'split' | 'self' | 'individual'>('split');
  const [selectedParticipants, setSelectedParticipants] = useState<string[]>([]);
  const [customAmounts, setCustomAmounts] = useState<Record<string, string>>({});
  const [filterDate, setFilterDate] = useState<string | 'all'>('all');
  const [filterPayer, setFilterPayer] = useState<string | 'all'>('all');
  
  const hasUnsettledExpenses = useMemo(() => expenses.some(e => !e.isSettled), [expenses]);

  useEffect(() => {
    if (!syncService.isReady()) setFirebaseError(true);
    const savedLocal = localStorage.getItem('bkk_expenses_2025');
    if (savedLocal) try { setExpenses(JSON.parse(savedLocal)); } catch (e) {}
    const savedUsers = localStorage.getItem('bkk_users_2025');
    if (savedUsers) try { 
        const parsed = JSON.parse(savedUsers);
        if (Array.isArray(parsed) && parsed.length > 0) {
            setUsers(parsed); setPayer(parsed[0].id); setSelectedParticipants(parsed.map(u => u.id));
        }
    } catch (e) {}
    const savedSession = localStorage.getItem('bkk_sync_session');
    if (savedSession) try {
        const { g, p } = JSON.parse(savedSession);
        if (g && p) { setGroupId(g); setPin(p); setTempGroupId(g); setTempPin(p); setIsSyncMode(true); }
    } catch (e) {}
  }, []);

  useEffect(() => {
    let active = true;
    let unsubscribeRef: (() => void) | null = null;

    const setupSync = async () => {
        if (isSyncMode && groupId && pin && syncService.isReady()) {
            // Don't show "Verifying" instantly to prevent flash, wait for real status
            try {
                const unsub = await syncService.subscribe(groupId, pin, 
                    (status) => { 
                        if (active) {
                            // If status is empty (success), show "Synced"
                            // If status is "Verifying...", only show if it takes time or first load
                            if (status === "") {
                                setConnectionStatus(t.syncConnected);
                            } else {
                                setConnectionStatus(status); 
                            }
                        }
                    },
                    (data) => {
                        if (!active) return;
                        setExpenses(data.expenses);
                        if (data.users && data.users.length > 0) setUsers(data.users);
                        if (data.settings) onSettingsSync(data.settings);
                    }
                );
                if (active) {
                    unsubscribeRef = unsub;
                } else {
                    unsub(); // Cleanup if unmounted before init finished
                }
            } catch (e) { 
                if (active) setConnectionStatus(`❌ ${t.syncError}`); 
            }
        } else {
            setConnectionStatus('');
        }
    };
    setupSync();
    
    return () => {
        active = false;
        if (unsubscribeRef) unsubscribeRef();
    };
  }, [isSyncMode, groupId, pin, onSettingsSync, language]);

  useEffect(() => {
    if (!isSyncMode) localStorage.setItem('bkk_expenses_2025', JSON.stringify(expenses));
    localStorage.setItem('bkk_users_2025', JSON.stringify(users));
  }, [expenses, users, isSyncMode]);

  const stats = useMemo(() => {
      const userPaidForOthers: Record<string, number> = {};
      const userConsumedTotal: Record<string, number> = {};
      const unsettledNet: Record<string, number> = {};
      
      users.forEach(u => {
          userPaidForOthers[u.id] = 0;
          userConsumedTotal[u.id] = 0;
          unsettledNet[u.id] = 0;
      });

      expenses.forEach(e => {
          const totalAmt = Number(e.amount);
          let payerShare = 0;

          if (e.splitType === 'split') {
              const participants = e.involvedUsers?.length > 0 ? e.involvedUsers : users.map(u => u.id);
              const share = totalAmt / participants.length;
              participants.forEach(uid => {
                  if (userConsumedTotal[uid] !== undefined) {
                      userConsumedTotal[uid] += share;
                      if (!e.isSettled) unsettledNet[uid] -= share;
                  }
                  if (uid === e.paidBy) payerShare = share;
              });
          } else if (e.splitType === 'self') {
              if (userConsumedTotal[e.paidBy] !== undefined) {
                  userConsumedTotal[e.paidBy] += totalAmt;
                  if (!e.isSettled) unsettledNet[e.paidBy] -= totalAmt;
              }
              payerShare = totalAmt;
          } else if (e.splitType === 'individual' && e.individualAmounts) {
              Object.entries(e.individualAmounts).forEach(([uid, amt]) => {
                  const val = Number(amt);
                  if (userConsumedTotal[uid] !== undefined) {
                      userConsumedTotal[uid] += val;
                      if (!e.isSettled) unsettledNet[uid] -= val;
                  }
                  if (uid === e.paidBy) payerShare = val;
              });
          }

          if (userPaidForOthers[e.paidBy] !== undefined) {
              // userPaidForOthers represents "Advance Payment" (Total Paid - Own Share)
              userPaidForOthers[e.paidBy] += (totalAmt - payerShare);
          }
          if (!e.isSettled && unsettledNet[e.paidBy] !== undefined) {
              unsettledNet[e.paidBy] += totalAmt;
          }
      });

      const payers = users.map(u => ({ id: u.id, name: u.name, balance: unsettledNet[u.id] })).filter(x => x.balance < -0.1).sort((a,b) => a.balance - b.balance);
      const receivers = users.map(u => ({ id: u.id, name: u.name, balance: unsettledNet[u.id] })).filter(x => x.balance > 0.1).sort((a,b) => b.balance - a.balance);
      
      const suggestedSettlements: { from: string, to: string, amount: number }[] = [];
      let pi = 0, ri = 0;
      const tempPayers = payers.map(p => ({...p, balance: Math.abs(p.balance)}));
      const tempReceivers = receivers.map(r => ({...r}));

      while(pi < tempPayers.length && ri < tempReceivers.length) {
          const amount = Math.min(tempPayers[pi].balance, tempReceivers[ri].balance);
          suggestedSettlements.push({ from: tempPayers[pi].name, to: tempReceivers[ri].name, amount });
          tempPayers[pi].balance -= amount;
          tempReceivers[ri].balance -= amount;
          if(tempPayers[pi].balance < 0.1) pi++;
          if(tempReceivers[ri].balance < 0.1) ri++;
      }

      const totalCost = expenses.reduce((acc, e) => acc + Number(e.amount), 0);
      return { totalCost, userPaidForOthers, userConsumedTotal, suggestedSettlements, allSettled: !expenses.some(e => !e.isSettled) };
  }, [expenses, users]);

  const filteredExpenses = useMemo(() => {
    return expenses.filter(e => (filterDate === 'all' || e.date === filterDate) && (filterPayer === 'all' || e.paidBy === filterPayer));
  }, [expenses, filterDate, filterPayer]);

  const handleLogin = async () => {
      if (!tempGroupId || !tempPin) return;

      const gId = tempGroupId;
      const pCode = tempPin;
      
      setGroupId(gId); setPin(pCode); setIsSyncMode(true); 
      
      // Close modal using history back
      goBack();
      
      localStorage.setItem('bkk_sync_session', JSON.stringify({ g: gId, p: pCode }));

      // Auto-initialize cloud if empty
      if (syncService.isReady()) {
         try {
             // We check if the group exists on the cloud
             const hasData = await syncService.checkDataExists(gId, pCode);
             if (!hasData) {
                 console.log("Initializing new cloud group with local data...");
                 // Push local users and settings to initialize the group
                 await syncService.updateUsers(gId, pCode, users);
                 await syncService.updateSettings(gId, pCode, tripSettings);
                 // Also push current expenses if any
                 if (expenses.length > 0) {
                     for (const exp of expenses) {
                         await syncService.addExpense(gId, pCode, exp);
                     }
                 }
             }
         } catch (e) {
             console.error("Auto-initialization failed", e);
         }
      }
  };

  const handleLogout = () => {
      if (!window.confirm(t.confirmLogout)) return;
      setIsSyncMode(false); setGroupId(''); setPin(''); setConnectionStatus('');
      localStorage.removeItem('bkk_sync_session');
      setExpenses(localStorage.getItem('bkk_expenses_2025') ? JSON.parse(localStorage.getItem('bkk_expenses_2025')!) : []);
  };

  const handleAddUser = async () => {
      if (!newUserName.trim() || users.find(u => u.name === newUserName.trim())) return;
      const newUsers = [...users, { id: `u_${Date.now()}`, name: newUserName.trim() }];
      setUsers(newUsers); setNewUserName('');
      if (isSyncMode && syncService.isReady()) {
          try { await syncService.updateUsers(groupId, pin, newUsers); } 
          catch(e: any) { console.error(e); alert(`${t.addMember} Failed: ${e.message}`); }
      }
  };

  const handleRemoveUser = async (id: string) => {
      if (users.length <= 1 || expenses.some(e => e.paidBy === id || e.involvedUsers?.includes(id))) { alert(t.removeMemberError); return; }
      const newUsers = users.filter(u => u.id !== id);
      setUsers(newUsers); if (payer === id) setPayer(newUsers[0].id);
      if (isSyncMode && syncService.isReady()) {
          try { await syncService.updateUsers(groupId, pin, newUsers); } 
          catch(e: any) { console.error(e); alert(`${t.delete} Failed: ${e.message}`); }
      }
  };
  
  const handleUpdateUser = async () => {
        if (!editingUserId || !editNameVal.trim()) return;
        
        const newUsers = users.map(u => u.id === editingUserId ? { ...u, name: editNameVal.trim() } : u);
        setUsers(newUsers);
        setEditingUserId(null);
        setEditNameVal('');
        
        if (isSyncMode && syncService.isReady()) {
            try { await syncService.updateUsers(groupId, pin, newUsers); } 
            catch(e: any) { console.error(e); alert(`${t.edit} Failed: ${e.message}`); }
        }
  };

  const startEditUser = (user: UserProfile) => {
      setEditingUserId(user.id);
      setEditNameVal(user.name);
  };

  const clearFormInputs = () => { 
      setTitle(''); setAmount(''); setEditingId(null); 
      setSplitType('split'); setCustomAmounts({}); 
      setSelectedParticipants(users.map(u => u.id)); 
      setSelectedDate(getTodayString()); 
  };

  // Only used for backdrop click to reset without leaving history if not needed, 
  // but for consistency we should probably use goBack for backdrop too if it's considered a "Close" action.
  // Actually, resetForm is usually called when we want to close.
  const closeForm = () => {
     goBack();
  };

  const handleEdit = (expense: Expense, e: React.MouseEvent) => {
      if (e) e.stopPropagation();
      setTitle(expense.title); setAmount(expense.amount.toString()); setCategory(expense.category);
      if (expense.date) setSelectedDate(expense.date); setPayer(expense.paidBy); setSplitType(expense.splitType);
      setSelectedParticipants(expense.involvedUsers || []);
      if (expense.individualAmounts) {
          const ca: Record<string, string> = {};
          Object.entries(expense.individualAmounts).forEach(([uid, amt]) => ca[uid] = amt.toString());
          setCustomAmounts(ca);
      }
      setEditingId(expense.id); 
      openModal('edit', () => setIsFormExpanded(true));
      const container = document.getElementById('expense-scroll-container');
      if (container) container.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const toggleParticipant = (uid: string) => setSelectedParticipants(prev => prev.includes(uid) ? prev.filter(id => id !== uid) : [...prev, uid]);

  const handleSave = async () => {
    if (!title || !amount) return;
    const totalVal = parseFloat(amount);
    if (isNaN(totalVal) || totalVal <= 0) return;
    const currentPayerId = payer || users[0].id;
    let finalInvolved = selectedParticipants.length > 0 ? selectedParticipants : [currentPayerId];
    let individualAmountsMap: Record<string, number> | undefined = undefined;

    if (splitType === 'self') finalInvolved = [currentPayerId];
    else if (splitType === 'individual') {
        individualAmountsMap = {}; let sum = 0;
        finalInvolved.forEach(uid => { const val = parseFloat(customAmounts[uid] || '0'); individualAmountsMap![uid] = val; sum += val; });
        if (Math.abs(sum - totalVal) > 0.5) { alert(`Sum mismatch`); return; }
    }

    // Fix: Create payload without undefined properties for Firebase
    const payload: Expense = {
      id: editingId || Date.now().toString(),
      title,
      amount: totalVal,
      category,
      dayId: getTripDayId(selectedDate),
      date: selectedDate,
      timestamp: editingId ? (expenses.find(e => e.id === editingId)?.timestamp || Date.now()) : Date.now(),
      paidBy: currentPayerId,
      involvedUsers: finalInvolved,
      splitType,
      isSettled: false,
      // individualAmounts is added below only if defined
    };

    if (individualAmountsMap) {
        payload.individualAmounts = individualAmountsMap;
    }

    // Optimistic Update
    setExpenses(prev => {
        if (editingId) return prev.map(e => e.id === editingId ? payload : e);
        return [payload, ...prev];
    });
    
    // Clear data and Close form
    clearFormInputs();
    goBack();

    if (isSyncMode && syncService.isReady()) {
        try {
            if (editingId) await syncService.updateExpense(groupId, pin, payload);
            else await syncService.addExpense(groupId, pin, payload);
        } catch (e: any) {
            console.error("Sync Error", e);
            alert(`Sync Failed: ${e.message || 'Permission Denied'}`);
        }
    }
  };

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (!window.confirm(t.confirmDelete)) return;
    
    // Optimistic Update
    setExpenses(prev => prev.filter(e => e.id !== id));
    
    // If we are currently editing the item we just deleted, clear the form and close it
    if (editingId === id) {
        clearFormInputs();
        goBack();
    }

    if (isSyncMode && syncService.isReady()) {
        try { await syncService.deleteExpense(groupId, pin, id); } 
        catch(e: any) { console.error(e); alert(`${t.delete} Failed: ${e.message}`); }
    }
  };

  const handleSettleUp = async (e: React.MouseEvent) => {
      e.stopPropagation();
      const unsettledIds = expenses.filter(e => !e.isSettled).map(e => e.id);
      if (unsettledIds.length === 0) return;
      if (!window.confirm(t.confirmSettle)) return;
      
      // Local Update Immediately
      setExpenses(prev => prev.map(e => ({ ...e, isSettled: true })));
      
      // Close detail view
      goBack();

      if (isSyncMode && syncService.isReady()) {
          try { await syncService.settleExpenses(groupId, pin, unsettledIds); } 
          catch(err: any) { console.error(err); alert(`${t.settleAll} Failed: ${err.message}`); }
      }
  };

  const handleExportCSV = () => {
    if (expenses.length === 0) {
        alert(t.noExpenses);
        return;
    }

    const headers = t.csvHeaders;
    const rows = expenses.map(e => {
        const payerName = users.find(u => u.id === e.paidBy)?.name || t.unknown;
        // @ts-ignore
        const categoryLabel = t.categories[e.category] || e.category;
        const status = e.isSettled ? t.settled : t.unsettled;
        const splitLabel = e.splitType === 'split' ? t.splitAvg : e.splitType === 'self' ? t.splitSelf : t.splitInd;
        
        // Format Details
        let details = "";
        if (e.splitType === 'self') {
            details = `${payerName}: ${e.amount}`;
        } else if (e.splitType === 'split') {
            const participants = e.involvedUsers?.length ? e.involvedUsers : users.map(u => u.id);
            const share = (e.amount / participants.length).toFixed(1);
            details = participants.map(uid => `${users.find(u => u.id === uid)?.name}: ${share}`).join(" | ");
        } else if (e.individualAmounts) {
            details = Object.entries(e.individualAmounts).map(([uid, amt]) => `${users.find(u => u.id === uid)?.name}: ${amt}`).join(" | ");
        }

        // Escape comma in title and details
        const safeTitle = `"${e.title.replace(/"/g, '""')}"`;
        const safeDetails = `"${details.replace(/"/g, '""')}"`;

        return [
            e.date || '',
            safeTitle,
            categoryLabel,
            e.amount,
            tripSettings.currency || 'THB',
            payerName,
            splitLabel,
            safeDetails,
            status
        ].join(",");
    });

    const csvContent = "\uFEFF" + [headers.join(","), ...rows].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `TripLedger_Export_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleFactoryReset = () => {
      if (window.confirm(t.confirmReset)) {
          // 1. Disconnect Sync
          setIsSyncMode(false);
          setGroupId('');
          setPin('');

          // 2. Clear Local Storage
          localStorage.removeItem('bkk_expenses_2025');
          localStorage.removeItem('bkk_users_2025');
          localStorage.removeItem('bkk_trip_settings');
          localStorage.removeItem('bkk_sync_session');
          localStorage.removeItem('bkk_exchange_rates');
          localStorage.removeItem('bkk_app_language');

          // 3. Force Reload to reset all states
          window.location.reload();
      }
  };

  const handleSimpleCalcInput = (val: string) => {
    if (val === 'C') setSimpleCalcDisplay('');
    else if (val === 'Del') setSimpleCalcDisplay(prev => prev.slice(0, -1));
    else if (val === '=') {
        try {
            // eslint-disable-next-line no-eval
            const result = eval(simpleCalcDisplay);
            setSimpleCalcDisplay(String(result));
        } catch (e) { setSimpleCalcDisplay('Error'); }
    } else setSimpleCalcDisplay(prev => prev + val);
  };

  const calcButtons = [
    { label: 'C', val: 'C', bg: 'bg-red-500/10 text-red-400 hover:bg-red-500/20' },
    { label: 'Del', val: 'Del', bg: 'bg-stone-700 hover:bg-stone-600', icon: Delete },
    { label: '/', val: '/', bg: 'bg-stone-700 hover:bg-stone-600' },
    { label: '*', val: '*', bg: 'bg-stone-700 hover:bg-stone-600' },
    { label: '7', val: '7' }, { label: '8', val: '8' }, { label: '9', val: '9' }, { label: '-', val: '-', bg: 'bg-stone-700 hover:bg-stone-600' },
    { label: '4', val: '4' }, { label: '5', val: '5' }, { label: '6', val: '6' }, { label: '+', val: '+', bg: 'bg-stone-700 hover:bg-stone-600' },
    { label: '1', val: '1' }, { label: '2', val: '2' }, { label: '3', val: '3' }, { label: '=', val: '=', bg: 'bg-orange-600 hover:bg-orange-500 text-white', tall: true },
    { label: '0', val: '0', wide: true }, { label: '.', val: '.' },
  ];

  const toggleWidget = (type: 'calc' | 'exchange' | 'users' | 'auth' | 'settings') => {
      const isCurrentlyOpen = (type === 'calc' && showSimpleCalc) || 
                              (type === 'exchange' && showExchange) || 
                              (type === 'users' && showUserManage) || 
                              (type === 'auth' && showAuth) || 
                              (type === 'settings' && showSettings);
      
      if (!isCurrentlyOpen) {
          // If we are opening a widget, we first close others by going back to root? 
          // No, simplified: just open it. The pushState will handle the history stack.
          // However, to prevent stack buildup if switching directly between widgets, we could close others first.
          // For simplicity in this "Fake Pages" request, we just pushState.
          
          if (type === 'calc') openModal('calc', () => setShowSimpleCalc(true));
          else if (type === 'exchange') openModal('exchange', () => setShowExchange(true));
          else if (type === 'users') openModal('users', () => setShowUserManage(true));
          else if (type === 'auth') openModal('auth', () => setShowAuth(true));
          else if (type === 'settings') {
             setTempSettings(tripSettings);
             openModal('settings', () => setShowSettings(true));
          }
      } else {
          // If closing, we go back in history to remove the hash
          goBack();
      }
  };

  const toggleExpand = (id: string) => {
      setExpandedExpenseId(prev => prev === id ? null : id);
  };

  return (
    <div className="flex flex-col h-full bg-[#FDFBF6] relative overflow-hidden">
        {/* Top Bar */}
        <header className="px-5 py-4 bg-white shadow-sm z-10 flex justify-between items-center">
            <h1 className="text-xl font-bold text-stone-800 tracking-wide flex items-center gap-2">
                <Wallet className="text-stone-800" size={24} />
                <span>{t.appName}</span>
            </h1>
            <div className="flex items-center gap-3">
                <button 
                    onClick={() => toggleWidget('auth')}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                        isSyncMode ? 'bg-green-50 text-green-700' : 'bg-stone-100 text-stone-500'
                    }`}
                >
                   {isSyncMode ? <Cloud size={14} /> : <CloudOff size={14} />}
                   <span>{connectionStatus || (isSyncMode ? t.syncConnected : t.syncOffline)}</span>
                </button>
                <button onClick={() => toggleWidget('settings')} className="text-stone-400 hover:text-stone-600">
                    <Settings size={20} />
                </button>
            </div>
        </header>

        {/* Summary Card */}
        <div className="px-4 mt-4">
            <div className="bg-stone-800 rounded-2xl p-5 text-white shadow-lg relative overflow-hidden">
                <div className="absolute -right-4 -top-4 text-stone-700 opacity-20 transform rotate-12">
                   <Receipt size={140} />
                </div>
                <div className="relative z-10">
                    <p className="text-stone-400 text-xs font-medium uppercase tracking-wider mb-1">{t.totalExpense}</p>
                    <div className="flex items-baseline gap-2">
                        <span className="text-3xl font-bold tracking-tight">
                            {stats.totalCost.toLocaleString()}
                        </span>
                        <span className="text-sm font-medium text-stone-400">{tripSettings.currency || 'THB'}</span>
                    </div>
                    
                    <div className="mt-4 pt-4 border-t border-white/10 flex justify-between items-center">
                        <div className="flex -space-x-2">
                            {users.slice(0,3).map(u => (
                                <div key={u.id} className="w-6 h-6 rounded-full bg-stone-600 border border-stone-800 flex items-center justify-center text-[10px]">
                                    {avatarLabels[u.id]}
                                </div>
                            ))}
                            {users.length > 3 && (
                                <div className="w-6 h-6 rounded-full bg-stone-700 border border-stone-800 flex items-center justify-center text-[10px]">+</div>
                            )}
                        </div>
                        <div className="flex gap-2">
                            <button 
                                onClick={() => openModal('stats', () => setShowStats(true))}
                                className="text-xs bg-white/10 hover:bg-white/20 px-3 py-1.5 rounded-full transition-colors flex items-center gap-1"
                            >
                                <BarChart3 size={14} />
                                {t.viewStats}
                            </button>
                            <button 
                                onClick={() => openModal('debt', () => setShowDebtDetails(true))}
                                className="text-xs bg-white/10 hover:bg-white/20 px-3 py-1.5 rounded-full transition-colors"
                            >
                                {t.checkDetails}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        {/* Tools & Filters */}
        <div className="px-4 mt-4 flex gap-2 overflow-x-auto no-scrollbar pb-2">
            <button 
                onClick={() => toggleWidget('calc')}
                className={`flex-shrink-0 p-2.5 rounded-xl border transition-colors ${showSimpleCalc ? 'bg-stone-800 text-white border-stone-800' : 'bg-white text-stone-600 border-stone-200'}`}
            >
                <Calculator size={18} />
            </button>
            <button 
                onClick={() => toggleWidget('exchange')}
                className={`flex-shrink-0 p-2.5 rounded-xl border transition-colors ${showExchange ? 'bg-stone-800 text-white border-stone-800' : 'bg-white text-stone-600 border-stone-200'}`}
            >
                <ArrowRightLeft size={18} />
            </button>
            <button 
                onClick={() => toggleWidget('users')}
                className={`flex-shrink-0 p-2.5 rounded-xl border transition-colors ${showUserManage ? 'bg-stone-800 text-white border-stone-800' : 'bg-white text-stone-600 border-stone-200'}`}
            >
                <Users size={18} />
            </button>
            <div className="w-px bg-stone-300 mx-1 h-8 self-center" />
            <select 
                value={filterDate}
                onChange={(e) => setFilterDate(e.target.value)}
                className="bg-white border border-stone-200 text-stone-700 text-sm rounded-xl px-3 outline-none focus:border-stone-400"
            >
                <option value="all">All Dates</option>
                {TRIP_DATES.map(d => (
                    <option key={d.value} value={d.value}>{d.label}</option>
                ))}
            </select>
        </div>

        {/* Expense List */}
        <div id="expense-scroll-container" className="flex-1 overflow-y-auto px-4 mt-2 pb-24 space-y-3">
            {filteredExpenses.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-48 text-stone-400">
                    <div className="bg-stone-100 p-4 rounded-full mb-3">
                        <Receipt size={24} />
                    </div>
                    <p className="text-sm">{t.noExpenses}</p>
                </div>
            ) : (
                filteredExpenses.map(expense => {
                    const CatDef = CATEGORIES_DEF.find(c => c.id === expense.category);
                    const CatIcon = CatDef?.icon || MoreHorizontal;
                    const catColor = CatDef?.color || 'text-gray-600';
                    const catBg = CatDef?.bg || 'bg-gray-50';
                    const payerName = users.find(u => u.id === expense.paidBy)?.name || t.unknown;
                    const isExpanded = expandedExpenseId === expense.id;

                    return (
                        <div 
                            key={expense.id}
                            onClick={() => toggleExpand(expense.id)}
                            className={`bg-white rounded-xl shadow-sm border border-stone-100 transition-all relative overflow-hidden ${expense.isSettled ? 'opacity-60 grayscale' : ''} ${isExpanded ? 'ring-1 ring-stone-200' : 'active:scale-[0.99]'}`}
                        >
                            {/* Card Header */}
                            <div className="p-4 flex items-center justify-between cursor-pointer">
                                <div className="flex items-center gap-3">
                                    <div className={`p-2.5 rounded-full ${catBg} ${catColor}`}>
                                        <CatIcon size={18} />
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-stone-800">{expense.title}</h3>
                                        <div className="flex items-center gap-1.5 mt-0.5">
                                            <span className="text-[10px] bg-stone-100 text-stone-600 px-1.5 py-0.5 rounded font-medium border border-stone-200">
                                                {t.payer}: {payerName.length > 24 ? payerName.slice(0, 24) + '...' : payerName}
                                            </span>
                                            <span className="text-xs text-stone-400">• {expense.date}</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <div className="font-bold text-lg text-stone-800">{expense.amount.toLocaleString()}</div>
                                    {expense.isSettled ? (
                                        <div className="flex items-center justify-end gap-1 text-green-600 text-[10px] font-medium mt-0.5">
                                            <CheckCircle2 size={10} /> <span>{t.settled}</span>
                                        </div>
                                    ) : (
                                        isExpanded ? <ChevronUp size={16} className="text-stone-300 ml-auto mt-1" /> : <ChevronDown size={16} className="text-stone-300 ml-auto mt-1" />
                                    )}
                                </div>
                            </div>

                            {/* Expanded Details (Accordion) */}
                            {isExpanded && (
                                <div className="bg-stone-50 border-t border-stone-100 p-4 animate-in slide-in-from-top-2">
                                    <div className="mb-4">
                                        <h4 className="text-xs font-bold text-stone-400 uppercase tracking-wider mb-2">{t.splitDetails}</h4>
                                        <div className="space-y-2">
                                            {(() => {
                                                let details = [];
                                                const payerName = users.find(u => u.id === expense.paidBy)?.name;
                                                
                                                if (expense.splitType === 'self') {
                                                    details.push({ id: expense.paidBy, name: payerName || 'Unknown', amount: expense.amount });
                                                } else {
                                                    let participants: string[] = [];
                                                    let amounts: Record<string, number> = {};
                                                    
                                                    if (expense.splitType === 'split') {
                                                        participants = expense.involvedUsers?.length ? expense.involvedUsers : users.map(u => u.id);
                                                        const share = expense.amount / participants.length;
                                                        participants.forEach(uid => amounts[uid] = share);
                                                    } else if (expense.splitType === 'individual' && expense.individualAmounts) {
                                                        participants = Object.keys(expense.individualAmounts);
                                                        amounts = expense.individualAmounts;
                                                    }

                                                    participants.forEach(uid => {
                                                        const uName = users.find(u => u.id === uid)?.name || 'Unknown';
                                                        details.push({ id: uid, name: uName, amount: Number(amounts[uid] || 0) });
                                                    });
                                                }

                                                return details.map((d, i) => (
                                                    <div key={i} className="flex justify-between items-center text-sm">
                                                        <div className="flex items-center gap-2 flex-1 min-w-0">
                                                            <div className="w-5 h-5 rounded-full bg-stone-200 flex items-center justify-center text-[8px] text-stone-500 font-bold flex-shrink-0">
                                                                {avatarLabels[d.id]}
                                                            </div>
                                                            <div className="flex items-center gap-1 overflow-hidden">
                                                                <span className="text-stone-600 truncate">
                                                                    {d.name.length > 24 ? d.name.slice(0, 24) + '...' : d.name}
                                                                </span>
                                                                {d.id === expense.paidBy && (
                                                                    <span className="ml-1 text-[9px] bg-stone-600 text-white px-1.5 py-0.5 rounded-full flex-shrink-0 font-medium">
                                                                        {t.payer}
                                                                    </span>
                                                                )}
                                                            </div>
                                                        </div>
                                                        <span className="font-medium text-stone-700 ml-2">{Number(d.amount).toFixed(1)}</span>
                                                    </div>
                                                ));
                                            })()}
                                        </div>
                                    </div>
                                    
                                    {!expense.isSettled && (
                                        <div className="flex gap-3 pt-2">
                                            <button 
                                                onClick={(e) => handleDelete(expense.id, e)}
                                                className="flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-red-500 hover:bg-red-50 border border-transparent hover:border-red-100 transition-colors text-xs font-bold"
                                            >
                                                <Trash2 size={14} /> {t.delete}
                                            </button>
                                            <button 
                                                onClick={(e) => handleEdit(expense, e)}
                                                className="flex-1 flex items-center justify-center gap-2 py-2 rounded-lg bg-stone-800 text-white hover:bg-stone-700 transition-colors text-xs font-bold"
                                            >
                                                <Pencil size={14} /> {t.edit}
                                            </button>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    );
                })
            )}
        </div>

        {/* Floating Action Button */}
        <button
            onClick={() => { clearFormInputs(); openModal('add', () => setIsFormExpanded(true)); }}
            className="fixed bottom-6 right-6 bg-stone-800 text-white p-4 rounded-full shadow-xl hover:bg-stone-700 transition-colors z-20"
        >
            <Plus size={24} />
        </button>

        {/* Add/Edit Form Sheet */}
        <div className={`fixed inset-x-0 bottom-0 bg-white rounded-t-3xl shadow-[0_-4px_30px_rgba(0,0,0,0.1)] transition-transform duration-300 z-30 flex flex-col max-h-[85vh] ${isFormExpanded ? 'translate-y-0' : 'translate-y-full'}`}>
            <div className="p-4 border-b border-stone-100 flex items-center justify-between">
                <button onClick={closeForm} className="text-stone-400 p-2"><ChevronDown size={24}/></button>
                <h3 className="font-bold text-lg">{editingId ? t.editExpense : t.addExpense}</h3>
                <button 
                    onClick={handleSave}
                    disabled={!title || !amount}
                    className="text-white bg-stone-800 px-4 py-1.5 rounded-full text-sm font-medium disabled:opacity-50"
                >
                    {t.save}
                </button>
            </div>
            
            <div className="overflow-y-auto p-5 space-y-6 pb-10">
                {/* Amount Input */}
                <div className="text-center">
                    <label className="text-xs font-bold text-stone-400 tracking-wider uppercase mb-2 block">{t.amount} ({tripSettings.currency || 'THB'})</label>
                    <input 
                        type="number" 
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        placeholder="0"
                        className="text-5xl font-bold text-center w-full outline-none placeholder-stone-200 text-stone-800 bg-transparent"
                    />
                </div>

                {/* Title Input */}
                <div className="bg-stone-50 p-3 rounded-xl border border-stone-100 flex items-center gap-3">
                    <Pencil size={18} className="text-stone-400" />
                    <input 
                        type="text" 
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        placeholder={t.titlePlaceholder}
                        className="bg-transparent w-full outline-none text-stone-800"
                    />
                </div>

                {/* Categories */}
                <div>
                    <label className="text-xs font-bold text-stone-400 tracking-wider uppercase mb-3 block">{t.category}</label>
                    <div className="grid grid-cols-4 gap-3">
                        {CATEGORIES_DEF.map(cat => {
                            const active = category === cat.id;
                            const Icon = cat.icon;
                            // @ts-ignore
                            const label = t.categories[cat.id];
                            return (
                                <button
                                    key={cat.id}
                                    onClick={() => setCategory(cat.id as any)}
                                    className={`flex flex-col items-center gap-2 p-3 rounded-xl border transition-all ${
                                        active ? `${cat.bg} ${cat.color} border-current` : 'bg-white border-stone-100 text-stone-400 hover:bg-stone-50'
                                    }`}
                                >
                                    <Icon size={20} />
                                    <span className="text-xs font-medium">{label}</span>
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* Date & Payer */}
                <div className="grid grid-cols-2 gap-4">
                    <div>
                         <label className="text-xs font-bold text-stone-400 tracking-wider uppercase mb-2 block">{t.date}</label>
                         <select 
                            value={selectedDate}
                            onChange={(e) => setSelectedDate(e.target.value)}
                            className="w-full bg-stone-50 border border-stone-100 rounded-xl px-3 py-3 text-sm outline-none"
                         >
                            {TRIP_DATES.map(d => (
                                <option key={d.value} value={d.value}>{d.label}</option>
                            ))}
                         </select>
                    </div>
                    <div>
                         <label className="text-xs font-bold text-stone-400 tracking-wider uppercase mb-2 block">{t.payer}</label>
                         <select 
                            value={payer}
                            onChange={(e) => setPayer(e.target.value)}
                            className="w-full bg-stone-50 border border-stone-100 rounded-xl px-3 py-3 text-sm outline-none"
                         >
                            {users.map(u => (
                                <option key={u.id} value={u.id}>{u.name}</option>
                            ))}
                         </select>
                    </div>
                </div>

                {/* Split Logic */}
                <div className="pt-2">
                    <div className="flex bg-stone-100 rounded-lg p-1 mb-4">
                        <button onClick={() => setSplitType('split')} className={`flex-1 py-1.5 text-xs font-medium rounded-md transition-all ${splitType === 'split' ? 'bg-white shadow-sm text-stone-800' : 'text-stone-500'}`}>{t.splitAvg}</button>
                        <button onClick={() => setSplitType('self')} className={`flex-1 py-1.5 text-xs font-medium rounded-md transition-all ${splitType === 'self' ? 'bg-white shadow-sm text-stone-800' : 'text-stone-500'}`}>{t.splitSelf}</button>
                        <button onClick={() => setSplitType('individual')} className={`flex-1 py-1.5 text-xs font-medium rounded-md transition-all ${splitType === 'individual' ? 'bg-white shadow-sm text-stone-800' : 'text-stone-500'}`}>{t.splitInd}</button>
                    </div>
                    
                    {splitType === 'split' && (
                        <div className="grid grid-cols-3 gap-2">
                            {users.map(u => (
                                <button
                                    key={u.id}
                                    onClick={() => toggleParticipant(u.id)}
                                    className={`px-3 py-2 rounded-lg border text-sm font-medium transition-colors ${
                                        selectedParticipants.includes(u.id) ? 'bg-stone-800 text-white border-stone-800' : 'bg-white text-stone-500 border-stone-200'
                                    }`}
                                >
                                    {u.name}
                                </button>
                            ))}
                        </div>
                    )}

                    {splitType === 'individual' && (
                        <div className="space-y-3">
                            {selectedParticipants.map(uid => {
                                const u = users.find(user => user.id === uid);
                                if(!u) return null;
                                return (
                                    <div key={uid} className="flex items-center gap-3">
                                        <span className="w-16 text-sm text-stone-600 truncate">{u.name}</span>
                                        <input 
                                            type="number"
                                            value={customAmounts[uid] || ''}
                                            onChange={(e) => setCustomAmounts(prev => ({...prev, [uid]: e.target.value}))}
                                            placeholder="0"
                                            className="flex-1 bg-stone-50 border border-stone-100 rounded-lg px-3 py-2 text-sm outline-none focus:border-stone-400"
                                        />
                                    </div>
                                );
                            })}
                             <div className="grid grid-cols-3 gap-2 mt-2">
                                {users.filter(u => !selectedParticipants.includes(u.id)).map(u => (
                                    <button key={u.id} onClick={() => toggleParticipant(u.id)} className="text-xs border border-dashed border-stone-300 rounded-lg py-1.5 text-stone-400 hover:bg-stone-50">+ {u.name}</button>
                                ))}
                             </div>
                        </div>
                    )}
                </div>
            </div>
        </div>

        {/* Overlay Backdrop */}
        {isFormExpanded && <div className="fixed inset-0 bg-black/20 z-20 backdrop-blur-[1px]" onClick={closeForm} />}

        {/* --- Widgets --- */}
        
        {/* Statistics Modal (New) */}
        {showStats && (
            <div className="absolute inset-0 z-50 bg-white flex flex-col animate-in slide-in-from-bottom-5">
                 <div className="p-4 border-b border-stone-100 flex items-center gap-3">
                     <button onClick={goBack}><ArrowLeft size={20} /></button>
                     <h2 className="font-bold text-lg">{t.viewStats}</h2>
                 </div>
                 <div className="p-5 overflow-y-auto space-y-4">
                     <div className="grid grid-cols-2 gap-4 text-xs font-bold text-stone-400 uppercase tracking-wider mb-2 px-3">
                        <div>{t.statSpent}</div>
                        <div className="text-right">{t.statAdvanced}</div>
                     </div>
                     {users.map(u => (
                         <div key={u.id} className="bg-stone-50 p-4 rounded-xl border border-stone-100 flex items-center justify-between">
                             <div className="flex items-center gap-3">
                                 <div className="w-10 h-10 rounded-full bg-white border border-stone-200 flex items-center justify-center text-stone-600 text-sm font-bold shadow-sm">
                                     {avatarLabels[u.id]}
                                 </div>
                                 <div className="flex flex-col">
                                     <span className="font-bold text-stone-800">{u.name}</span>
                                     <span className="text-sm font-medium text-stone-500">
                                         {Math.round(stats.userConsumedTotal[u.id] || 0).toLocaleString()}
                                     </span>
                                 </div>
                             </div>
                             <div className="text-right">
                                 <span className={`text-lg font-bold ${stats.userPaidForOthers[u.id] > 0 ? 'text-orange-600' : 'text-stone-300'}`}>
                                     {Math.round(stats.userPaidForOthers[u.id] || 0).toLocaleString()}
                                 </span>
                             </div>
                         </div>
                     ))}
                 </div>
            </div>
        )}

        {/* Debt Details Modal */}
        {showDebtDetails && (
            <div className="absolute inset-0 z-50 bg-white flex flex-col animate-in slide-in-from-bottom-5">
                 <div className="p-4 border-b border-stone-100 flex items-center gap-3">
                     <button onClick={goBack}><ArrowLeft size={20} /></button>
                     <h2 className="font-bold text-lg">{t.settleDetails}</h2>
                     <div className="flex-1" />
                     {!stats.allSettled && (
                         <button onClick={handleSettleUp} className="text-xs bg-stone-800 text-white px-3 py-1.5 rounded-full shadow-sm hover:bg-stone-700 active:scale-95 transition-all">{t.settleAll}</button>
                     )}
                 </div>
                 <div className="p-5 overflow-y-auto space-y-6">
                     <div>
                         <h3 className="text-xs font-bold text-stone-400 tracking-wider uppercase mb-3">{t.owe}/{t.receive}</h3>
                         {stats.suggestedSettlements.length === 0 ? (
                             <p className="text-stone-500 text-sm">{t.allSettled}</p>
                         ) : (
                             <div className="space-y-3">
                                 {stats.suggestedSettlements.map((s, i) => (
                                     <div key={i} className="flex items-center justify-between bg-stone-50 p-3 rounded-xl border border-stone-100">
                                         <div className="flex items-center gap-2">
                                             <span className="font-bold text-stone-800">{s.from}</span>
                                             <ArrowRight size={14} className="text-stone-400" />
                                             <span className="font-bold text-stone-800">{s.to}</span>
                                         </div>
                                         <div className="font-bold text-orange-600">{Math.round(s.amount).toLocaleString()}</div>
                                     </div>
                                 ))}
                             </div>
                         )}
                     </div>
                 </div>
            </div>
        )}

        {/* User Manage Modal */}
        {showUserManage && (
            <div className="absolute inset-0 z-50 bg-white flex flex-col animate-in slide-in-from-right-5">
                <div className="p-4 border-b border-stone-100 flex items-center gap-3">
                    <button onClick={goBack}><ArrowLeft size={20} /></button>
                    <h2 className="font-bold text-lg">{t.members}</h2>
                </div>
                <div className="p-5 overflow-y-auto">
                    <div className="flex gap-2 mb-6">
                        <input 
                            type="text" 
                            value={newUserName}
                            onChange={(e) => setNewUserName(e.target.value)}
                            maxLength={24}
                            placeholder={t.newMemberPlaceholder}
                            className="flex-1 bg-stone-50 border border-stone-200 rounded-xl px-4 py-2 text-sm outline-none"
                        />
                        <button onClick={handleAddUser} disabled={!newUserName} className="bg-stone-800 text-white px-4 rounded-xl disabled:opacity-50">
                            <Plus size={20} />
                        </button>
                    </div>
                    <div className="space-y-2">
                        {users.map(u => (
                            <div key={u.id} className="flex justify-between items-center p-3 bg-white border border-stone-100 rounded-xl shadow-sm">
                                {editingUserId === u.id ? (
                                    <div className="flex items-center gap-2 flex-1">
                                        <div className="w-8 h-8 rounded-full bg-stone-100 flex items-center justify-center text-stone-500 text-xs font-bold">
                                            {avatarLabels[u.id]}
                                        </div>
                                        <input 
                                            type="text"
                                            value={editNameVal}
                                            onChange={(e) => setEditNameVal(e.target.value)}
                                            maxLength={24}
                                            className="flex-1 bg-stone-50 border border-stone-300 rounded px-2 py-1 text-sm outline-none"
                                            autoFocus
                                        />
                                        <button onClick={handleUpdateUser} className="p-2 text-green-600 hover:bg-green-50 rounded-full">
                                            <Check size={16} />
                                        </button>
                                        <button onClick={() => setEditingUserId(null)} className="p-2 text-stone-400 hover:bg-stone-50 rounded-full">
                                            <X size={16} />
                                        </button>
                                    </div>
                                ) : (
                                    <>
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-full bg-stone-100 flex items-center justify-center text-stone-500 text-xs font-bold">
                                                {avatarLabels[u.id]}
                                            </div>
                                            <span className="font-medium">{u.name}</span>
                                        </div>
                                        <div className="flex items-center gap-1">
                                            <button onClick={() => startEditUser(u)} className="text-stone-300 hover:text-stone-600 p-2">
                                                <Pencil size={16} />
                                            </button>
                                            <button onClick={() => handleRemoveUser(u.id)} className="text-stone-300 hover:text-red-400 p-2">
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    </>
                                )}
                            </div>
                        ))}
                    </div>
                    <p className="text-xs text-stone-400 mt-4 text-center">{t.memberHint}</p>
                </div>
            </div>
        )}

        {/* Auth / Sync Modal */}
        {showAuth && (
            <div className="absolute inset-0 z-50 bg-white flex flex-col animate-in slide-in-from-right-5">
                <div className="p-4 border-b border-stone-100 flex items-center gap-3">
                    <button onClick={goBack}><ArrowLeft size={20} /></button>
                    <h2 className="font-bold text-lg">{t.sync}</h2>
                </div>
                <div className="p-6 flex flex-col items-center justify-center flex-1">
                    {firebaseError && (
                        <div className="w-full bg-red-50 text-red-600 p-3 rounded-xl mb-6 text-sm flex items-start gap-2">
                            <Info size={16} className="mt-0.5 flex-shrink-0" />
                            <span>請檢查 .env 設定或網路連線。</span>
                        </div>
                    )}

                    {!isSyncMode ? (
                        <div className="w-full space-y-4">
                            <div className="bg-blue-50 p-4 rounded-xl text-blue-800 text-sm mb-4">
                                {t.syncHint}
                            </div>
                            <div>
                                <label className="text-xs font-bold text-stone-400 uppercase mb-1 block">{t.groupId}</label>
                                <input 
                                    type="text" 
                                    value={tempGroupId}
                                    onChange={(e) => setTempGroupId(e.target.value)}
                                    placeholder="例如: bkk2025"
                                    className="w-full bg-stone-50 border border-stone-200 rounded-xl px-4 py-3 outline-none"
                                />
                            </div>
                            <div>
                                <label className="text-xs font-bold text-stone-400 uppercase mb-1 block">{t.pin}</label>
                                <input 
                                    type="password" 
                                    value={tempPin}
                                    onChange={(e) => setTempPin(e.target.value)}
                                    placeholder="****"
                                    className="w-full bg-stone-50 border border-stone-200 rounded-xl px-4 py-3 outline-none"
                                />
                            </div>
                            <button 
                                onClick={handleLogin}
                                disabled={!tempGroupId || !tempPin}
                                className="w-full bg-stone-800 text-white py-3 rounded-xl font-bold flex items-center justify-center gap-2 mt-4 hover:bg-stone-700 disabled:opacity-50 transition-colors"
                            >
                                <LogIn size={18} />
                                <span>{t.syncConnect}</span>
                            </button>
                        </div>
                    ) : (
                        <div className="w-full text-center space-y-6">
                            <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto">
                                <Cloud size={32} />
                            </div>
                            <div>
                                <h3 className="font-bold text-xl text-stone-800 mb-1">{t.syncConnected}</h3>
                                <p className="text-stone-500 text-sm">{t.groupId}: {groupId}</p>
                            </div>
                            <button 
                                onClick={handleLogout}
                                className="w-full bg-stone-100 text-stone-600 py-3 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-red-50 hover:text-red-600 transition-colors"
                            >
                                <LogOut size={18} />
                                <span>{t.syncDisconnect}</span>
                            </button>
                        </div>
                    )}
                </div>
            </div>
        )}

        {/* Settings Modal */}
        {showSettings && (
             <div className="absolute inset-0 z-50 bg-white flex flex-col animate-in slide-in-from-right-5">
                <div className="p-4 border-b border-stone-100 flex items-center gap-3">
                    <button onClick={goBack}><ArrowLeft size={20} /></button>
                    <h2 className="font-bold text-lg">{t.settings}</h2>
                </div>
                <div className="p-6 space-y-6 overflow-y-auto pb-10">
                    <div>
                        <label className="text-xs font-bold text-stone-400 uppercase mb-2 block">{t.startDate}</label>
                        <input 
                            type="date"
                            value={tempSettings.startDate}
                            onChange={(e) => setTempSettings(prev => ({ ...prev, startDate: e.target.value }))}
                            className="w-full bg-stone-50 border border-stone-200 rounded-xl px-4 py-3 outline-none"
                        />
                    </div>
                    <div>
                        <label className="text-xs font-bold text-stone-400 uppercase mb-2 block">{t.endDate}</label>
                        <input 
                            type="date"
                            value={tempSettings.endDate}
                            onChange={(e) => setTempSettings(prev => ({ ...prev, endDate: e.target.value }))}
                            className="w-full bg-stone-50 border border-stone-200 rounded-xl px-4 py-3 outline-none"
                        />
                    </div>

                    <div>
                        <label className="text-xs font-bold text-stone-400 uppercase mb-2 block">{t.currency}</label>
                        <select 
                            value={tempSettings.currency || 'THB'}
                            onChange={(e) => setTempSettings(prev => ({ ...prev, currency: e.target.value }))}
                            disabled={hasUnsettledExpenses}
                            className="w-full bg-stone-50 border border-stone-200 rounded-xl px-4 py-3 outline-none disabled:opacity-50 disabled:bg-stone-100"
                        >
                            {SUPPORTED_CURRENCIES.map(c => (
                                <option key={c.code} value={c.code}>{c.code} - {c.label}</option>
                            ))}
                        </select>
                        {hasUnsettledExpenses && (
                             <div className="flex items-center gap-1.5 text-red-500 mt-2 text-xs font-medium bg-red-50 p-2 rounded-lg">
                                <AlertTriangle size={14} />
                                <span>{t.currencyChangeWarn}</span>
                             </div>
                        )}
                    </div>

                    {/* Language Selector */}
                    <div>
                        <label className="text-xs font-bold text-stone-400 uppercase mb-2 block">{t.language}</label>
                        <div className="grid grid-cols-2 gap-3">
                            <button
                                onClick={() => setLanguage('zh')}
                                className={`flex items-center justify-center gap-2 px-4 py-3 rounded-xl border transition-all ${
                                    language === 'zh' ? 'bg-stone-800 text-white border-stone-800' : 'bg-white border-stone-200 text-stone-600'
                                }`}
                            >
                                <span className="text-sm font-bold">繁體中文</span>
                            </button>
                            <button
                                onClick={() => setLanguage('en')}
                                className={`flex items-center justify-center gap-2 px-4 py-3 rounded-xl border transition-all ${
                                    language === 'en' ? 'bg-stone-800 text-white border-stone-800' : 'bg-white border-stone-200 text-stone-600'
                                }`}
                            >
                                <span className="text-sm font-bold">English</span>
                            </button>
                        </div>
                    </div>

                    <button 
                        onClick={() => {
                            // Defensive: If unsettled, force currency to match original to prevent any potential UI state mismatch or undefined errors
                            const finalSettings = hasUnsettledExpenses 
                                ? { ...tempSettings, currency: tripSettings.currency || 'TWD' }
                                : { ...tempSettings, currency: tempSettings.currency || 'TWD' };
                            
                            onUpdateLocalSettings(finalSettings);
                            goBack();
                        }}
                        className="w-full bg-stone-800 text-white py-3 rounded-xl font-bold flex items-center justify-center gap-2"
                    >
                        <Save size={18} />
                        <span>{t.save}</span>
                    </button>
                    
                    <button 
                        onClick={handleExportCSV}
                        className="w-full bg-white text-stone-600 border border-stone-200 py-3 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-stone-50 transition-colors"
                    >
                        <Download size={18} />
                        <span>{t.exportCSV}</span>
                    </button>

                     <button 
                        onClick={handleFactoryReset}
                        className="w-full bg-white text-red-500 border border-red-200 py-3 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-red-50 transition-colors mt-6"
                    >
                        <RotateCcw size={18} />
                        <span>{t.resetApp}</span>
                    </button>

                    <p className="text-xs text-stone-400 text-center pb-0 whitespace-pre-line">
                        {t.settingsHint}
                    </p>

                    <div className="mt-8 mb-4 text-center">
                         <h4 className="text-sm font-bold text-stone-800 mb-2">SenTrip Pay</h4>
                         <p className="text-[10px] text-stone-400 leading-relaxed px-4">
                            SenTrip Pay comes from Settle Expenses Now —<br/>
                            built for trips, so you can pay fairly and enjoy the journey.
                         </p>
                    </div>
                </div>
            </div>
        )}

        {/* Calculator Widget */}
        {showSimpleCalc && (
            <div className="absolute inset-x-0 bottom-0 bg-stone-800 p-4 pb-8 z-50 rounded-t-3xl shadow-2xl animate-in slide-in-from-bottom-10">
                <div className="flex justify-between items-center mb-4 text-white">
                    <span className="text-sm font-bold opacity-50 uppercase">{t.calculator}</span>
                    <button onClick={goBack}><ChevronDown size={24}/></button>
                </div>
                <div className="bg-stone-900/50 p-4 rounded-xl mb-4 text-right">
                    <span className="text-3xl text-white font-mono tracking-widest">{simpleCalcDisplay || '0'}</span>
                </div>
                <div className="grid grid-cols-4 gap-3">
                    {calcButtons.map((btn) => (
                        <button
                            key={btn.val}
                            onClick={() => handleSimpleCalcInput(btn.val)}
                            className={`${btn.bg || 'bg-stone-700 text-white'} ${btn.wide ? 'col-span-2' : ''} ${btn.tall ? 'row-span-2 h-full' : 'h-14'} rounded-xl font-bold text-lg flex items-center justify-center active:scale-95 transition-transform`}
                        >
                            {btn.icon ? <btn.icon size={20} /> : btn.label}
                        </button>
                    ))}
                </div>
            </div>
        )}

        {/* Exchange Rate Widget */}
        {showExchange && (
            <div className="absolute inset-0 z-50 bg-white flex flex-col animate-in slide-in-from-right-5">
                <div className="p-4 border-b border-stone-100 flex items-center gap-3">
                    <button onClick={goBack}><ArrowLeft size={20} /></button>
                    <h2 className="font-bold text-lg">{t.exchange}</h2>
                </div>
                <div className="p-6 overflow-y-auto h-full pb-20">
                    <div className="bg-stone-50 rounded-2xl p-6 mb-6 text-center border border-stone-100">
                         <div className="flex items-center justify-center gap-2 mb-4 flex-wrap">
                            {SUPPORTED_CURRENCIES
                                .filter(c => c.code !== tripCurrency)
                                .map(c => (
                                <button 
                                    key={c.code}
                                    onClick={() => setCalcCurrency(c.code)}
                                    className={`px-4 py-1.5 rounded-full text-sm font-bold transition-colors ${calcCurrency === c.code ? 'bg-stone-800 text-white' : 'text-stone-400'}`}
                                >{c.code}</button>
                            ))}
                         </div>
                         <input 
                            type="number" 
                            value={calcAmount}
                            onChange={(e) => setCalcAmount(e.target.value)}
                            placeholder={t.inputForeign}
                            className="text-4xl font-bold text-center w-full bg-transparent outline-none mb-2"
                         />
                         <p className="text-stone-400 text-sm font-medium mb-4">
                             ≈ {calculatedBaseAmount.toLocaleString()} {tripCurrency}
                         </p>
                         <div className="flex justify-center">
                             <button 
                                onClick={() => { setAmount(calcAmount); setCategory('shopping'); goBack(); setTimeout(() => openModal('add', () => setIsFormExpanded(true)), 100); }}
                                className="flex items-center gap-2 text-xs bg-white border border-stone-200 px-3 py-1.5 rounded-full shadow-sm active:scale-95 transition-transform"
                             >
                                 <Plus size={14} /> {t.recordIt}
                             </button>
                         </div>
                    </div>

                    <div className="space-y-4">
                        <h3 className="text-xs font-bold text-stone-400 uppercase tracking-wider">{t.exchangeRate} ({t.unknown.replace('Unknown','to')} {tripCurrency})</h3>
                        {SUPPORTED_CURRENCIES
                            .filter(c => c.code !== tripCurrency)
                            .map(c => (
                            <div key={c.code} className="flex items-center justify-between p-3 border border-stone-100 rounded-xl">
                                <span className="font-bold text-stone-600">{c.code}</span>
                                <input 
                                    type="number" 
                                    value={exchangeRates[c.code] ?? ''}
                                    onChange={(e) => handleRateChange(c.code, e.target.value)}
                                    className="w-20 text-right font-mono bg-stone-50 rounded px-2 py-1 outline-none focus:bg-stone-100"
                                />
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        )}
    </div>
  );
});

export default ExpenseTracker;

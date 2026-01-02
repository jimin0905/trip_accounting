
import { initializeApp, FirebaseApp } from "firebase/app";
import { getDatabase, ref, set, remove, update, onValue, off, Database } from "firebase/database";
import { getAuth, signInAnonymously, Auth } from "firebase/auth";
import { Expense, UserProfile, TripSettings } from "../types";

// ==========================================
// Firebase Config Initialization
// ==========================================

let firebaseConfig: any = null;
let rawConfig = '';

try {
    // @ts-ignore
    if (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_FIREBASE_CONFIG) {
        // @ts-ignore
        rawConfig = import.meta.env.VITE_FIREBASE_CONFIG;
    }
} catch (e) {}

if (!rawConfig) {
    try {
        if (typeof process !== 'undefined' && process.env) {
            rawConfig = process.env.VITE_FIREBASE_CONFIG || process.env.FIREBASE_CONFIG || '';
        }
    } catch (e) {}
}

if (rawConfig) {
    try {
        let cleanConfig = rawConfig.trim();
        if ((cleanConfig.startsWith("'") && cleanConfig.endsWith("'")) || 
            (cleanConfig.startsWith('"') && cleanConfig.endsWith('"'))) {
            cleanConfig = cleanConfig.slice(1, -1);
        }

        try {
            firebaseConfig = JSON.parse(cleanConfig);
        } catch (jsonError) {
            // Try to fix loose JSON syntax (e.g. keys without quotes)
            const relaxed = cleanConfig.replace(/([{,]\s*)([a-zA-Z0-9_]+?)\s*:/g, '$1"$2":');
            firebaseConfig = JSON.parse(relaxed);
        }
    } catch (e) {
        console.error("Firebase Config Error: Failed to parse JSON.", e);
    }
} else {
    // Fallback: Construct config from individual env vars
    const getVar = (key: string) => {
        try {
            // @ts-ignore
            if (typeof import.meta !== 'undefined' && import.meta.env?.[`VITE_${key}`]) return import.meta.env[`VITE_${key}`];
            // @ts-ignore
            if (typeof process !== 'undefined' && process.env?.[`VITE_${key}`]) return process.env[`VITE_${key}`];
            // @ts-ignore
            if (typeof process !== 'undefined' && process.env?.[key]) return process.env[key];
        } catch(e) {}
        return undefined;
    };

    const apiKey = getVar('FIREBASE_API_KEY');
    if (apiKey) {
        firebaseConfig = {
            apiKey: apiKey,
            authDomain: getVar('FIREBASE_AUTH_DOMAIN'),
            databaseURL: getVar('FIREBASE_DATABASE_URL'),
            projectId: getVar('FIREBASE_PROJECT_ID'),
            storageBucket: getVar('FIREBASE_STORAGE_BUCKET'),
            messagingSenderId: getVar('FIREBASE_MESSAGING_SENDER_ID'),
            appId: getVar('FIREBASE_APP_ID')
        };
    }
}

let app: FirebaseApp | undefined;
let db: Database | undefined;
let auth: Auth | undefined;
let isInitialized = false;

try {
    if (firebaseConfig && (firebaseConfig.apiKey || firebaseConfig.databaseURL)) {
        app = initializeApp(firebaseConfig);
        db = getDatabase(app);
        auth = getAuth(app);
        isInitialized = true;
    }
} catch (e) {
    console.error("Firebase initialization failed:", e);
}

// Helper to catch and format permission errors
const handleFirebaseOperation = async (operation: () => Promise<void>) => {
    try {
        await operation();
    } catch (error: any) {
        if (error.code === 'PERMISSION_DENIED' || error.message?.includes('PERMISSION_DENIED')) {
            console.error("🔥 Firebase Permission Denied! Please check your Realtime Database Rules.");
            throw new Error("權限不足 (Permission Denied)。請至 Firebase Console 檢查 Database Rules 是否設為公開或已登入。");
        }
        throw error;
    }
};

const ensureAuth = async () => {
    if (!isInitialized || !auth) throw new Error("Firebase not initialized");
    if (auth.currentUser) return auth.currentUser;
    try {
        const userCredential = await signInAnonymously(auth);
        return userCredential.user;
    } catch (error: any) {
        console.error("Auth Error:", error);
        throw error;
    }
};

const getSecureBasePath = async (groupId: string, pin: string) => {
    if (!groupId || !pin) throw new Error("ID and PIN required");
    const raw = `${groupId.trim()}_${pin.trim()}_BKK_SECRET_SALT`;
    
    const simpleHash = (str: string) => {
        let hash = 0;
        for (let i = 0; i < str.length; i++) {
            const char = str.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash;
        }
        return `insecure_${Math.abs(hash)}`;
    };

    if (typeof crypto !== 'undefined' && crypto.subtle) {
        try {
            const msgBuffer = new TextEncoder().encode(raw);
            const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
            const hashArray = Array.from(new Uint8Array(hashBuffer));
            const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
            return `trips/${hashHex}`;
        } catch (e) {
            return `trips/${simpleHash(raw)}`;
        }
    } else {
        return `trips/${simpleHash(raw)}`;
    }
};

export const syncService = {
    isReady: () => isInitialized,

    subscribe: async (
        groupId: string, 
        pin: string, 
        onStatus: (status: string) => void, 
        callback: (data: { expenses: Expense[], users: UserProfile[], settings?: TripSettings }) => void
    ) => {
        if (!isInitialized || !db) return () => {};

        try {
            onStatus("🔒 驗證中...");
            await ensureAuth(); 

            const path = await getSecureBasePath(groupId, pin);
            const tripRef = ref(db, path);
            
            onStatus("☁️ 同步中...");
            
            const unsubscribe = onValue(tripRef, (snapshot) => {
                const val = snapshot.val() || {};
                
                const expensesRaw = val.expenses || {};
                const expenseList = Array.isArray(expensesRaw) 
                    ? expensesRaw 
                    : Object.values(expensesRaw) as Expense[];
                
                expenseList.sort((a, b) => b.timestamp - a.timestamp);

                const usersRaw = val.users || [];
                const usersList = Array.isArray(usersRaw)
                    ? usersRaw
                    : Object.values(usersRaw) as UserProfile[];

                const settings = val.settings as TripSettings | undefined;

                callback({ expenses: expenseList, users: usersList, settings });
                onStatus("");
            }, (error) => {
                console.error("Firebase Read Error", error);
                if (error.message.includes("permission_denied")) {
                    onStatus("⛔ 權限不足");
                    alert("讀取失敗：權限不足。請檢查 Firebase Rules。");
                } else {
                    onStatus("❌ 連線錯誤");
                }
            });

            return () => off(tripRef, 'value', unsubscribe);
        } catch (e) {
            console.error("Firebase Subscribe Error", e);
            onStatus("❌ 驗證失敗");
            return () => {};
        }
    },

    addExpense: async (groupId: string, pin: string, expense: Expense) => {
        if (!isInitialized || !db) return;
        await handleFirebaseOperation(async () => {
            await ensureAuth();
            const path = await getSecureBasePath(groupId, pin);
            await set(ref(db, `${path}/expenses/${expense.id}`), expense);
        });
    },

    updateExpense: async (groupId: string, pin: string, expense: Expense) => {
        if (!isInitialized || !db) return;
        await handleFirebaseOperation(async () => {
            await ensureAuth();
            const path = await getSecureBasePath(groupId, pin);
            await set(ref(db, `${path}/expenses/${expense.id}`), expense);
        });
    },

    deleteExpense: async (groupId: string, pin: string, expenseId: string) => {
        if (!isInitialized || !db) return;
        await handleFirebaseOperation(async () => {
            await ensureAuth();
            const path = await getSecureBasePath(groupId, pin);
            await remove(ref(db, `${path}/expenses/${expenseId}`));
        });
    },

    settleExpenses: async (groupId: string, pin: string, expenseIds: string[]) => {
        if (!isInitialized || !db) return;
        await handleFirebaseOperation(async () => {
            await ensureAuth();
            const path = await getSecureBasePath(groupId, pin);
            const updates: Record<string, any> = {};
            expenseIds.forEach(id => {
                updates[`${path}/expenses/${id}/isSettled`] = true;
            });
            await update(ref(db), updates);
        });
    },

    updateUsers: async (groupId: string, pin: string, users: UserProfile[]) => {
        if (!isInitialized || !db) return;
        await handleFirebaseOperation(async () => {
            await ensureAuth();
            const path = await getSecureBasePath(groupId, pin);
            await set(ref(db, `${path}/users`), users);
        });
    },

    updateSettings: async (groupId: string, pin: string, settings: TripSettings) => {
        if (!isInitialized || !db) return;
        await handleFirebaseOperation(async () => {
            await ensureAuth();
            const path = await getSecureBasePath(groupId, pin);
            await set(ref(db, `${path}/settings`), settings);
        });
    }
};

/**
 * FinCoach AI — Merkezi Type Tanımları
 * =====================================
 * Bu dosya tüm uygulama genelinde kullanılan veri modellerini
 * TypeScript Strict Mode ile tanımlar.
 *
 * Kullanım: import { Transaction, Goal, UserProfile } from '@/types'
 */

// ─────────────────────────────────────────────────────────────
// TEMEL FİNANSAL TİPLER
// ─────────────────────────────────────────────────────────────

/** İşlem türü: gelir veya gider */
export type TransactionType = 'income' | 'expense' | 'gelir' | 'gider';

/** Harcama kategorisi */
export type Category =
  | 'Market'
  | 'Yemek Siparişi'
  | 'Ulaşım'
  | 'Abonelik'
  | 'Fatura'
  | 'Alışveriş'
  | 'Sağlık'
  | 'Eğlence'
  | 'Restoran'
  | 'Maaş'
  | 'Diğer'
  | string;

/** Tekil finansal işlem */
export interface Transaction {
  id: string;
  /** İşlem başlığı (yeni format) */
  title?: string;
  /** İşlem başlığı (legacy Türkçe format) */
  baslik?: string;
  /** Tutar (pozitif sayı) */
  amount?: number;
  /** Tutar (legacy Türkçe format) */
  tutar?: number;
  /** ISO 8601 tarih stringi: "YYYY-MM-DD" */
  date?: string;
  /** Tarih (legacy Türkçe format) */
  tarih?: string;
  /** Kategori */
  category?: Category;
  /** Kategori (legacy Türkçe format) */
  kategori?: Category;
  /** İşlem türü */
  type?: TransactionType;
  /** Tür (legacy Türkçe format) */
  tur?: TransactionType;
  /** Mağaza / yer adı */
  merchant?: string;
  /** Mağaza (legacy Türkçe format) */
  magaza?: string;
  /** Açıklama */
  description?: string;
  /** Açıklama (legacy Türkçe format) */
  aciklama?: string;
  /** Kayıt kaynağı */
  source?: 'manual' | 'whatsapp_text' | 'whatsapp_receipt' | 'csv' | 'voice';
  /** Oluşturulma zamanı (ISO 8601) */
  createdAt?: string;
}

// ─────────────────────────────────────────────────────────────
// HEDEF TİPLERİ
// ─────────────────────────────────────────────────────────────

/** Hedef önceliği */
export type GoalPriority = 'low' | 'medium' | 'high';

/** Finansal hedef */
export interface Goal {
  id: string;
  /** Hedef başlığı */
  title?: string;
  /** Başlık (legacy format) */
  baslik?: string;
  /** Hedef tutarı */
  target?: number;
  /** Hedef (legacy format) */
  hedef?: number;
  /** Mevcut birikim */
  current?: number;
  /** Mevcut (legacy format) */
  mevcut?: number;
  /** Hedef bitiş tarihi */
  deadline?: string;
  /** Öncelik seviyesi */
  priority?: GoalPriority;
  /** Emoji ikonu */
  icon?: string;
  /** Renk hex kodu */
  color?: string;
  /** Oluşturulma zamanı */
  createdAt?: string;
}

// ─────────────────────────────────────────────────────────────
// BÜTÇE TİPLERİ
// ─────────────────────────────────────────────────────────────

/** Kategori bazlı bütçe limiti */
export interface BudgetLimit {
  category: Category;
  /** Aylık limit (TRY) */
  limit: number;
  /** Mevcut harcama (TRY) */
  spent?: number;
}

/** Bütçe limitleri haritası: { [kategori]: limit_tutarı } */
export type BudgetLimits = Record<string, number>;

// ─────────────────────────────────────────────────────────────
// KULLANICI PROFİLİ
// ─────────────────────────────────────────────────────────────

/** Kullanıcı profili */
export interface UserProfile {
  /** Görünen ad */
  name?: string;
  /** E-posta */
  email?: string;
  /** Aylık gelir (TRY) */
  monthlyIncome?: number;
  /** Banka adı */
  bankName?: string;
  /** Avatar URL */
  avatarUrl?: string;
  /** Para birimi */
  currency?: string;
  /** Telefon numarası */
  phone?: string;
}

// ─────────────────────────────────────────────────────────────
// ABONELIK TİPLERİ
// ─────────────────────────────────────────────────────────────

/** Abonelik periyodu */
export type SubscriptionPeriod = 'monthly' | 'yearly' | 'weekly';

/** Tekrarlayan abonelik */
export interface Subscription {
  id: string;
  name: string;
  amount: number;
  period: SubscriptionPeriod;
  category?: Category;
  nextDate?: string;
  color?: string;
  icon?: string;
  active?: boolean;
}

// ─────────────────────────────────────────────────────────────
// TAHMİN & ANALİTİK TİPLERİ
// ─────────────────────────────────────────────────────────────

/** Nakit akış tahmini sonucu */
export interface PredictionResult {
  predictedBalance: number;
  isWarning: boolean;
  advice: string;
  confidence?: number;
  projectedMonths?: Array<{ month: string; balance: number }>;
}

/** ESG / Karbon ayak izi hesabı sonucu */
export interface EcoScoreResult {
  score: number;
  footprint: number;
  status: 'excellent' | 'good' | 'warning' | 'critical';
  message: string;
  breakdown?: Record<string, number>;
}

/** İşlem anomali tespiti */
export interface AnomalyResult {
  transactionId: string;
  severity: 'low' | 'medium' | 'high';
  reason: string;
  amount: number;
}

// ─────────────────────────────────────────────────────────────
// GRAFİK & UI TİPLERİ
// ─────────────────────────────────────────────────────────────

/** Recharts için zaman serisi veri noktası */
export interface TimeSeriesPoint {
  month?: string;
  day?: string;
  week?: string;
  bakiye?: number;
  gelir?: number;
  gider?: number;
  [key: string]: string | number | undefined;
}

/** Pasta grafik veri noktası */
export interface PieDataPoint {
  name: string;
  value: number;
  color?: string;
}

/** Stat kart veri yapısı */
export interface StatCardData {
  label: string;
  value: number;
  icon: React.ComponentType<{ size?: number; color?: string }>;
  color: string;
  change?: number;
  isCurrency?: boolean;
}

// ─────────────────────────────────────────────────────────────
// ZUSTAND STORE TİPİ
// ─────────────────────────────────────────────────────────────

/** Uygulama global state şeması */
export interface AppState {
  transactions: Transaction[];
  goals: Goal[];
  budgetLimits: BudgetLimits;
  userProfile: UserProfile;
  subscriptions: Subscription[];
  addTransaction: (tx: Partial<Transaction>) => void;
  updateTransaction: (id: string, tx: Partial<Transaction>) => void;
  removeTransaction: (id: string) => void;
  addGoal: (goal: Partial<Goal>) => void;
  updateGoal: (id: string, goal: Partial<Goal>) => void;
  removeGoal: (id: string) => void;
  setBudgetLimit: (category: string, limit: number) => void;
  setUserProfile: (profile: Partial<UserProfile>) => void;
}

// ─────────────────────────────────────────────────────────────
// YARDIMCI TİPLER
// ─────────────────────────────────────────────────────────────

/** İsteğe bağlı id'li obje */
export type WithId<T> = T & { id: string };

/** Kısmi güncelleme tipi */
export type PartialUpdate<T> = Partial<Omit<T, 'id'>>;

/** API yanıt zarfı */
export interface ApiResponse<T> {
  data?: T;
  error?: string;
  ok: boolean;
}

export interface Transactions {
  id?: string;
  title: string;
  description: string;
  amount: string;
  operationDate: string;
  transactionType: TransactionType;
  category: string;
  paymentInfo: Payment;
  periodicTransaction?: Periodic;
}

export enum TransactionType {
  outgoing ="outgoing",
  income ="income"
}

export interface Payment {
  bankName: string;
  title: string;
  type: PaymentType;
}

export interface Periodic {
  hasPeriodicity: boolean
  paymentPlanType: PaymentPlan
  isActive: boolean
  periodicity: Periodicity;
  periodType: PeriodType;
  startDatePeriodicity: string;
  every: number;
  installment: Installment;
}

export enum PaymentType {
  debit = "debit",
  credit = "credit"
}

export enum Periodicity {
  daily = "daily",
  weekly = "weekly",
  biweekly = "biweekly",
  monthly = "monthly",
  bimonthly = "bimonthly",
  quarterly = "quarterly",
  semiannual = "semiannual",
  annual = "annual"
}

export enum PeriodType {
  day = "day",
  week = "week",
  month = "month",
  year = "year"
}

export interface Installment {
  total: number;
  current: number;
}

export interface Balance {
  totalAvailable: number;
  totalIncome: number;
  totalOutgoing: number;
}

export enum PaymentPlan {
  recurringPayment = "recurringPayment",
  installment = "installment"
}

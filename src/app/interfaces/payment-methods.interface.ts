import { PaymentType } from "./transactions.interface";

export interface PaymentMethod {
  accInfo: AccInfo;
  balanceInfo: BalanceInfo;
  accSettings: AccSettings;
}

export interface AccInfo{
  id?: string;
  bankName:string
  productName: string;
  titularName:string;
  paymentType: PaymentType;
}

export interface BalanceInfo{
  balance: string
  creditLine: number;
  cutoffDay: string;
  daysToPay: string;
}

export interface AccSettings{
  color:string;
}

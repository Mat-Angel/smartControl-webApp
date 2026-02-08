import { computed, inject, Injectable, effect, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map, Observable, of, tap } from 'rxjs';
import { Transactions } from '../interfaces/transactions.interface';
import { PaymentMethod } from '../interfaces/payment-methods.interface';
import { environment } from '../../environments/environment';
import { AuthService } from '../auth/services/auth.service';

interface FirebasePostResponse {
  name: string;
}

@Injectable({
  providedIn: 'root'
})

export class TransactionsDataService {
  private http = inject(HttpClient);
  private authService = inject(AuthService);

  private readonly _token = computed(() => this.authService.token());
  private readonly _userId = computed(() => this.authService.userId());

  private _paymentMethods = signal<PaymentMethod[]>([]);
  private _transactions = signal<Transactions[]>([]);
  private _automatedPayments = signal<Transactions[]>([]);

  private readonly baseUrl = environment.firebaseUrl;

  loadTransactions(token: string, userId: string): Observable<Transactions[]> {
    if (!userId || !token) return of([]);

    const url = `${this.baseUrl}${userId}/smartControl/transactions.json?auth=${token}`;
    if (this._transactions().length === 0) {
      return this.http.get<Record<string, Transactions> | null>(url).pipe(
        // Transformar el objeto de Firebase a un array
        map(resp => {
          if (!resp) return [];
          return Object.entries(resp).map(([id, data]) => ({ ...data, id: id, })) as Transactions[];   //"id" clave generada por Firebase
        }),
        tap(resp => {
          this._transactions.set(resp);
        })
      );

    }
    return of(this._transactions());
  }


  loadAutomatedPayments(token: string, userId: string): Observable<Transactions[]> {
    if (!userId || !token) return of([]);

    const url = `${this.baseUrl}${userId}/smartControl/automatedPayments.json?auth=${token}`;

    if (this._automatedPayments().length === 0) {
      return this.http.get<Record<string, Transactions> | null>(url).pipe(
        // Transformar el objeto de Firebase a un array
        map(resp => {
          if (!resp) return [];
          return Object.entries(resp).map(([id, data]) => ({ ...data, id: id, })) as Transactions[];   //"id" clave generada por Firebase
        }),
        tap(resp => {

          this._automatedPayments.set(resp);

        })
      );
    }

    return of(this._automatedPayments());
  }


  getTransactionById(transactionId: string): Observable<Transactions | null> {
    if (!this._token() || !this._userId()) return of(null);

    return this.http.get<Transactions | null>(`${this.baseUrl}${this._userId()}/smartControl/transactions/${transactionId}.json?auth=${this._token()}`)
  }


  getCardById(transactionId: string): Observable<PaymentMethod | null> {
    if (!this._token() || !this._userId()) return of(null);

    return this.http.get<PaymentMethod | null>(`${this.baseUrl}${this._userId()}/smartControl/paymentMethods/${transactionId}.json?auth=${this._token()}`)
  }


  getPaymentById(transactionId: string): Observable<Transactions | null> {
    if (!this._token() || !this._userId()) return of(null);

    return this.http.get<Transactions | null>(`${this.baseUrl}${this._userId()}/smartControl/automatedPayments/${transactionId}.json?auth=${this._token()}`)
  }


  saveTransaction(transaction: Transactions): Observable<FirebasePostResponse> {
    if (!this._token() || !this._userId()) return of();
    return this.http.post<FirebasePostResponse>(`${this.baseUrl}${this._userId()}/smartControl/transactions.json?auth=${this._token()}`, transaction)
      .pipe(
        tap(resp => {
          this._transactions.update(txs => [...txs, { ...transaction, id: resp.name }]
            .sort((a, b) => b.operationDate.localeCompare(a.operationDate))
          );
        })
      );
  }


  saveAutomatedPayment(transaction: Transactions): Observable<FirebasePostResponse> {
    if (!this._token() || !this._userId()) return of();

    return this.http.post<FirebasePostResponse>(`${this.baseUrl}${this._userId()}/smartControl/automatedPayments.json?auth=${this._token()}`, transaction)
      .pipe(
        tap(resp => {
          this._automatedPayments.update(txs => [...txs, { ...transaction, id: resp.name }]
            .sort((a, b) => b.operationDate.localeCompare(a.operationDate))
          );
        })
      );
  }


  updateTransaction(transaction: Transactions, transactionId: string) {
    if (!this._token() || !this._userId()) return of([]);

    return this.http.put(`${this.baseUrl}${this._userId()}/smartControl/transactions/${transactionId}.json?auth=${this._token()}`, transaction)
      .pipe(
        tap(resp => {
          this._transactions.update(txs => txs.map(t => t.id === transactionId ? transaction : t));
        })
      );
  }


  updateAutomatedPayment(transaction: Transactions, transactionId: string) {
    if (!this._token() || !this._userId()) return of([]);

    return this.http.put(`${this.baseUrl}${this._userId()}/smartControl/automatedPayments/${transactionId}.json?auth=${this._token()}`, transaction)
      .pipe(
        tap(resp => {
          this._automatedPayments.update(txs => txs.map(t => t.id === transactionId ? { ...transaction, id: transactionId } : t));

        })
      );
  }


  updateCard(card: PaymentMethod, cardId: string) {
    if (!this._token() || !this._userId()) return of([]);

    return this.http.put(`${this.baseUrl}${this._userId()}/smartControl/paymentMethods/${cardId}.json?auth=${this._token()}`, card)
      .pipe(
        tap(resp => {
          this._paymentMethods.update(crd => crd.map(t => t.accInfo.id === cardId ? card : t));

        })
      );
  }


  deleteTransaction(id: string) {
    if (!this._token() || !this._userId()) return of([]);

    return this.http.delete(`${this.baseUrl}${this._userId()}/smartControl/transactions/${id}.json?auth=${this._token()}`)
      .pipe(tap(() => {
        this._transactions.update(tx => tx.filter(t => t.id !== id));
      }));
  }


  deleteAutomatedPaymen(id: string) {
    if (!this._token() || !this._userId()) return of([]);
    return this.http.delete(`${this.baseUrl}${this._userId()}/smartControl/automatedPayments/${id}.json?auth=${this._token()}`)
      .pipe(tap(() => {
        this._automatedPayments.update(tx => tx.filter(t => t.id !== id));
      }));
  }


  deleteCard(id: string) {
    if (!this._token() || !this._userId()) return of([]);
    return this.http.delete(`${this.baseUrl}${this._userId()}/smartControl/paymentMethods/${id}.json?auth=${this._token()}`)
      .pipe(tap(() => {
        this._paymentMethods.update(tx => tx.filter(t => t.accInfo.id !== id));
      }));
  }


  loadCards(token: string, userId: string): Observable<PaymentMethod[]> {
    if (!userId || !token) return of([]);

    const url = `${this.baseUrl}${userId}/smartControl/paymentMethods.json?auth=${token}`;

    if (this._paymentMethods().length === 0) {
      return this.http.get<Record<string, PaymentMethod> | null>(url).pipe(
        // Transformar el objeto de Firebase a un array
        map(resp => {
          if (!resp) return [];
          return Object.entries(resp).map(([id, data]) => ({ ...data, accInfo: { ...data.accInfo, id }, })) as PaymentMethod[];   //"id" clave generada por Firebase
        }),
        tap(resp => {
          this._paymentMethods.set(resp);
        })
      );
    }
    return of(this._paymentMethods());
  }


  saveCard(card: PaymentMethod): Observable<FirebasePostResponse> {
    if (!this._token() || !this._userId()) return of();
    return this.http.post<FirebasePostResponse>(`${this.baseUrl}${this._userId()}/smartControl/paymentMethods.json?auth=${this._token()}`, card)
      .pipe(
        tap(resp => {
          this._paymentMethods.update(txs => [...txs, { ...card, id: resp.name }]
            .sort((a, b) => a.accInfo.bankName.localeCompare(b.accInfo.bankName))
          );
        })
      );

  }
}

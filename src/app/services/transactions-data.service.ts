import { computed, inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map, Observable, of, tap } from 'rxjs';
import { Transactions } from '../interfaces/transactions.interface';
import { PaymentMethod } from '../interfaces/payment-methods.interface';
import { environment } from '../../environments/environment';
import { AuthService } from '../auth/services/auth.service';

@Injectable({
  providedIn: 'root'
})
export class TransactionsDataService {
  private http = inject(HttpClient);
  private authService = inject(AuthService);

  private readonly _token = computed(() => this.authService.token());
  private readonly _userId = computed(() => this.authService.userId());

  baseUrl = environment.firebaseUrl;

  loadTransactions(token: string, userId: string): Observable<Transactions[]> {
    if (!userId || !token) return of([]);

    const url = `${this.baseUrl}${userId}/smartControl/transactions.json?auth=${token}`;
    return this.http.get<Record<string, Transactions> | null>(url).pipe(
      // Transformar el objeto de Firebase a un array
      map(resp => {
        if (!resp) return [];
        return Object.entries(resp).map(([id, data]) => ({ ...data, id: id, })) as Transactions[];   //"id" clave generada por Firebase
      }),
      //tap(resp => console.log('Transactions mapeadas:', resp))
    );
  }


  getTransactionById(transactionId: string): Observable<Transactions | null> {
    if (!this._token() || !this._userId()) return of(null);

    return this.http.get<Transactions | null>(`${this.baseUrl}${this._userId()}/smartControl/transactions/${transactionId}.json?auth=${this._token()}`)
      //.pipe(tap(resp => console.log('Transaction devuelta:', resp)));
  }


  saveTransaction(transaction: Transactions) {
    if (!this._token() || !this._userId()) return of([]);

    return this.http.post(`${this.baseUrl}${this._userId()}/smartControl/transactions.json?auth=${this._token()}`, transaction);
  }


  updateTransaction(transaction: Transactions, transactionId: string) {
    if (!this._token() || !this._userId()) return of([]);

    return this.http.put(`${this.baseUrl}${this._userId()}/smartControl/transactions/${transactionId}.json?auth=${this._token()}`, transaction);
  }


  deleteTransaction(id: string) {
    if (!this._token() || !this._userId()) return of([]);

    return this.http.delete(`${this.baseUrl}${this._userId()}/smartControl/transactions/${id}.json?auth=${this._token()}`);
  }


  loadCards(token: string, userId: string): Observable<PaymentMethod[]> {
    if (!userId || !token) return of([]);

    const url = `${this.baseUrl}${userId}/smartControl/paymentMethods.json?auth=${token}`;
    return this.http.get<Record<string, PaymentMethod> | null>(url).pipe(
      // Transformar el objeto de Firebase a un array
      map(resp => {
        if (!resp) return [];
        return Object.entries(resp).map(([id, data]) => ({ ...data, id: id, })) as PaymentMethod[];   //"id" clave generada por Firebase
      }),
      //tap(resp => console.log('Cards mapeadas:', resp))
    );
  }


  saveCard(transaction: PaymentMethod) {
    if (!this._token() || !this._userId()) return of([]);
    return this.http.post(`${this.baseUrl}${this._userId()}/smartControl/paymentMethods.json?auth=${this._token()}`, transaction);
  }
}

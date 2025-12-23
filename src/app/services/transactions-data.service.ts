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


  saveTransaction(transaction: Transactions) {
    if (!this._token() || !this._userId()) return of([]);

    return this.http.post(`${this.baseUrl}${this._userId()}/smartControl/transactions.json?auth=${this._token()}`, transaction);
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
      tap(resp => console.log('Cards mapeadas:', resp))
    );
  }


  saveCard(transaction: PaymentMethod) {
    if (!this._token() || !this._userId()) return of([]);
    return this.http.post(`${this.baseUrl}${this._userId()}/smartControl/paymentMethods.json?auth=${this._token()}`, transaction);
  }

  /*
    // Guardaren DB
    guardarMovimiento(movimiento: Transactions){
      const token = this.loginService.IdToken;
      this.httpClient.put('https://mat-angel.firebaseio.com/expenseControl/Lmovements.json?auth=' + token, movimientos).subscribe(
        response => console.log('Resultado de guardar movimientos: ', response),
        error => console.log('Error al guardar movimientos: ', error)
        )
        }

    /*
      modificarMovimiento(index: number, movimiento: Movimiento){
        const token = this.loginService.IdToken;
        let url: string;
        url = 'https://mat-angel.firebaseio.com/expenseControl/Lmovements/' + index + '.json?auth=' + token;
        this.httpClient.put(url, movimiento).subscribe(
          response => console.log('Resultado de modificar movimiento: ', response),
          error => console.log('Error al modificar movimiento: ', error)
        )
      }

      eliminarMovimiento(index: number){
        const token = this.loginService.IdToken;
        let url: string;
        url = 'https://mat-angel.firebaseio.com/expenseControl/Lmovements/' + index + '.json?auth=' + token;
        this.httpClient.delete(url).subscribe(
          response => console.log('Resultado de eliminar movimiento: ', response),
          error => console.log('Error al eliminar movimiento: ', error)
        )
      }
  */
}

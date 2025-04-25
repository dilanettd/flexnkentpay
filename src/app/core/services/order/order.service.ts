import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { catchError, Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import {
  IOrder,
  IMomoTransaction,
  IMomoPayment,
  IOrderPayment,
} from '../../models/order-model';
import { IFee } from '../../models/product.model';
import { handleHttpError } from '../errors';
import {
  IPaginatedOrders,
  IPaginatedTransactions,
} from '../../models/pagination.model';

@Injectable({
  providedIn: 'root',
})
export class OrderService {
  apiUrl = environment.API_URL;

  constructor(private http: HttpClient) {}

  // Create a new order
  createOrder(order: Partial<IOrder>): Observable<IOrder> {
    return this.http.post<IOrder>(`${this.apiUrl}/order`, order);
  }

  // Annuler une commande
  cancelOrder(orderId: string | number): Observable<any> {
    return this.http
      .delete<any>(`${this.apiUrl}/orders/${orderId}/cancel`)
      .pipe(catchError(handleHttpError));
  }

  getAllOrders(params: {
    keyword?: string;
    status?: string;
    date_from?: string;
    date_to?: string;
    min_amount?: number;
    max_amount?: number;
    sort_field?: string;
    sort_direction?: string;
    per_page?: number;
    page?: number;
  }): Observable<IPaginatedOrders> {
    return this.http
      .get<IPaginatedOrders>(`${this.apiUrl}/admin/orders`, {
        params: params as any,
      })
      .pipe(catchError(handleHttpError));
  }

  getAllTransactions(params: {
    keyword?: string;
    status?: string;
    provider_type?: string;
    min_amount?: number;
    max_amount?: number;
    date_from?: string;
    date_to?: string;
    sort_field?: string;
    sort_direction?: string;
    per_page?: number;
    page?: number;
  }): Observable<IPaginatedTransactions> {
    return this.http
      .get<IPaginatedTransactions>(`${this.apiUrl}/admin/transactions`, {
        params: params as any,
      })
      .pipe(catchError(handleHttpError));
  }

  // Get all orders for the authenticated user
  getUserOrders(): Observable<IOrder[]> {
    return this.http.get<IOrder[]>(`${this.apiUrl}/orders/user`);
  }

  // Get all orders for the authenticated seller
  getSellerOrders(): Observable<IOrder[]> {
    return this.http.get<IOrder[]>(`${this.apiUrl}/orders/seller`);
  }

  // Create a new payment for an order
  createOrderPayment(transaction: IMomoPayment): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/momo-transaction`, transaction);
  }

  // Get all MoMo transactions for the authenticated user
  getUserMomoTransactions(): Observable<IMomoTransaction[]> {
    return this.http.get<IMomoTransaction[]>(
      `${this.apiUrl}/momo-transactions/user`
    );
  }

  // Initier un paiement pour une commande
  initiatePayment(paymentData: any): Observable<any> {
    return this.http.post<any>(
      `${this.apiUrl}/order-payments/pay`,
      paymentData
    );
  }

  // Récupérer les paiements en attente
  getPendingPayments(): Observable<IOrderPayment[]> {
    return this.http.get<IOrderPayment[]>(
      `${this.apiUrl}/order-payments/pending`
    );
  }

  // Récupérer les paiements pour une commande spécifique
  getOrderPayments(orderId: string | number): Observable<IOrderPayment[]> {
    return this.http.get<IOrderPayment[]>(
      `${this.apiUrl}/order-payments/orders/${orderId}`
    );
  }

  // Récupérer les détails d'un paiement spécifique
  getPaymentDetails(paymentId: string | number): Observable<IOrderPayment> {
    return this.http.get<IOrderPayment>(
      `${this.apiUrl}/order-payments/${paymentId}`
    );
  }

  // NOUVELLES MÉTHODES POUR LES ROUTES DE GESTION DES FRAIS (FEES) - ADMIN SEULEMENT

  // Récupérer tous les frais
  getAllFees(): Observable<IFee[]> {
    return this.http.get<IFee[]>(`${this.apiUrl}/fees`);
  }

  // Créer un nouveau frais
  createFee(fee: Partial<IFee>): Observable<IFee> {
    return this.http.post<IFee>(`${this.apiUrl}/fees`, fee);
  }

  // Récupérer un frais spécifique
  getFee(type: string | number): Observable<IFee> {
    return this.http.get<IFee>(`${this.apiUrl}/fees/${type}`);
  }

  // Mettre à jour un frais
  updateFee(type: string | number, fee: Partial<IFee>): Observable<IFee> {
    return this.http.put<IFee>(`${this.apiUrl}/fees/${type}`, fee);
  }

  // Supprimer un frais
  deleteFee(type: string | number): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/fees/${type}`);
  }

  // Activer un frais
  activateFee(type: string | number): Observable<IFee> {
    return this.http.put<IFee>(`${this.apiUrl}/fees/${type}/activate`, {});
  }

  // Récupérer les frais actifs
  getActiveFees(): Observable<{ order_fee: IFee; penalty_fee: IFee }> {
    return this.http.get<{ order_fee: IFee; penalty_fee: IFee }>(
      `${this.apiUrl}/fees/active`
    );
  }
}

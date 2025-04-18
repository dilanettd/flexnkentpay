import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import {
  IOrder,
  IMomoTransaction,
  IMomoPayment,
  IOrderPayment,
} from '../../models/order-model';
import { IFee } from '../../models/product.model';

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

  // Get all orders for the authenticated user
  getUserOrders(): Observable<IOrder[]> {
    return this.http.get<IOrder[]>(`${this.apiUrl}/orders/user`);
  }

  // Get all orders for the authenticated seller
  getSellerOrders(): Observable<IOrder[]> {
    return this.http.get<IOrder[]>(`${this.apiUrl}/orders/seller`);
  }

  // Create a new MoMo transaction
  createMomoTransaction(
    transaction: Partial<IMomoTransaction>
  ): Observable<IMomoTransaction> {
    return this.http.post<IMomoTransaction>(
      `${this.apiUrl}/momo-transaction`,
      transaction
    );
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
  getFee(id: string | number): Observable<IFee> {
    return this.http.get<IFee>(`${this.apiUrl}/fees/${id}`);
  }

  // Mettre à jour un frais
  updateFee(id: string | number, fee: Partial<IFee>): Observable<IFee> {
    return this.http.put<IFee>(`${this.apiUrl}/fees/${id}`, fee);
  }

  // Supprimer un frais
  deleteFee(id: string | number): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/fees/${id}`);
  }

  // Activer un frais
  activateFee(id: string | number): Observable<IFee> {
    return this.http.put<IFee>(`${this.apiUrl}/fees/${id}/activate`, {});
  }

  // Récupérer les frais actifs
  getActiveFees(): Observable<IFee[]> {
    return this.http.get<IFee[]>(`${this.apiUrl}/fees/active`);
  }
}

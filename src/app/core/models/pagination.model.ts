import { IUser } from './auth.state.model';
import { IOrder, IMomoTransaction } from './order-model';

export interface IPaginationMeta {
  current_page: number;
  from: number;
  last_page: number;
  links: {
    url: string | null;
    label: string;
    active: boolean;
  }[];
  path: string;
  per_page: number;
  to: number;
  total: number;
}

export interface IPaginatedResponse<T> {
  data: T[];
  links: {
    first: string;
    last: string;
    prev: string | null;
    next: string | null;
  };
  meta: IPaginationMeta;
}

export interface IPaginatedUsers extends IPaginatedResponse<IUser> {}
export interface IPaginatedOrders extends IPaginatedResponse<IOrder> {}
export interface IPaginatedTransactions
  extends IPaginatedResponse<IMomoTransaction> {}

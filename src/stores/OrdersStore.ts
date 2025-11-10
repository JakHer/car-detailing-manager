import { makeAutoObservable, observable, reaction } from "mobx";
import type { Client, Car } from "./ClientsStore";
import { MOCK_ORDERS } from "../mocks/mocks";
import { parseLocalDate, parseLocalDateEnd } from "../utils/dateUtils";

export type OrderStatus =
  | "Nowe"
  | "Przyjęte"
  | "W toku"
  | "Czeka na odbiór"
  | "Zakończone"
  | "Anulowane";

export interface OrderServiceSnapshot {
  id: number;
  name: string;
  price: number;
}

export interface Order {
  id: number;
  client: Client;
  car?: Car;
  services: OrderServiceSnapshot[];
  status: OrderStatus;
  createdAt: string;
  updatedAt: string;
  notes?: string;
}

export class OrdersStore {
  orders = observable.array<Order>([]);
  searchTerm = "";
  statusFilter?: OrderStatus = undefined;
  dateFrom = "";
  dateTo = "";

  constructor() {
    makeAutoObservable(this, {}, { autoBind: true, deep: true });

    const stored = localStorage.getItem("orders");
    if (stored) {
      try {
        this.orders.replace(JSON.parse(stored));
      } catch {
        this.orders.clear();
      }
    } else {
      this.orders.replace(MOCK_ORDERS);
    }

    reaction(
      () => this.orders.map((o) => ({ ...o })),
      (orders) => localStorage.setItem("orders", JSON.stringify(orders))
    );
  }

  get filteredOrders() {
    const from = parseLocalDate(this.dateFrom);
    const to = parseLocalDateEnd(this.dateTo);

    return this.orders
      .filter((o) => {
        const matchSearch =
          o.client.name.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
          o.client.phone?.includes(this.searchTerm);

        const matchStatus =
          !this.statusFilter || o.status === this.statusFilter;

        const orderDate = new Date(o.createdAt);
        const matchDate =
          (!from || orderDate >= from) && (!to || orderDate <= to);

        return matchSearch && matchStatus && matchDate;
      })
      .slice()
      .sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
  }

  setFilters(
    filters: Partial<{
      searchTerm: string;
      statusFilter: OrderStatus | undefined;
      dateFrom: string;
      dateTo: string;
    }>
  ) {
    if (filters.searchTerm !== undefined) this.searchTerm = filters.searchTerm;
    if ("statusFilter" in filters) {
      this.statusFilter = filters.statusFilter;
    }
    if (filters.dateFrom !== undefined) this.dateFrom = filters.dateFrom;
    if (filters.dateTo !== undefined) this.dateTo = filters.dateTo;
  }

  addOrder(order: Omit<Order, "id" | "updatedAt"> & { createdAt: string }) {
    const newId =
      this.orders.length > 0
        ? Math.max(...this.orders.map((o) => o.id)) + 1
        : 1;

    const now = new Date().toISOString();
    this.orders.push({
      ...order,
      id: newId,
      updatedAt: now,
      services: order.services.map((s) => ({ ...s })),
      notes: order.notes || "",
      status: order.status || "Przyjęte",
    });
  }

  resetFilters() {
    this.searchTerm = "";
    this.statusFilter = undefined;
    this.dateFrom = "";
    this.dateTo = "";
  }

  setStatus(orderId: number, status: OrderStatus) {
    const order = this.orders.find((o) => o.id === orderId);
    if (order) {
      order.status = status;
      order.updatedAt = new Date().toISOString();
    }
  }

  updateOrder(
    orderId: number,
    updated: Partial<Omit<Order, "id">> & { createdAt?: string }
  ) {
    const order = this.orders.find((o) => o.id === orderId);
    if (!order) return;

    if (updated.client) order.client = updated.client;
    if (updated.car) order.car = updated.car;
    if (updated.services)
      order.services = updated.services.map((s) => ({ ...s }));
    if (updated.status) order.status = updated.status;
    if (updated.notes !== undefined) order.notes = updated.notes;
    if (updated.createdAt) order.createdAt = updated.createdAt;

    order.updatedAt = new Date().toISOString();
  }

  deleteOrder(orderId: number) {
    this.orders.replace(this.orders.filter((o) => o.id !== orderId));
  }
}

export const ordersStore = new OrdersStore();

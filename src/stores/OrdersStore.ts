import { makeAutoObservable, reaction } from "mobx";
import type { Client } from "./ClientsStore";
import { MOCK_ORDERS, MOCK_SERVICES } from "../mocks/mocks";

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
  services: OrderServiceSnapshot[];
  status: OrderStatus;
  createdAt: string;
  updatedAt: string;
  notes?: string;
}

export class OrdersStore {
  orders: Order[] = [];

  constructor() {
    makeAutoObservable(this);

    const stored = localStorage.getItem("orders");
    if (stored) {
      try {
        this.orders = JSON.parse(stored);
      } catch {
        this.orders = [];
      }
    } else {
      this.orders = MOCK_ORDERS;
    }

    reaction(
      () => this.orders.map((o) => ({ ...o })),
      (orders) => {
        localStorage.setItem("orders", JSON.stringify(orders));
      }
    );
  }

  addOrder(order: Omit<Order, "id" | "updatedAt"> & { createdAt: string }) {
    const newId =
      this.orders.length > 0
        ? Math.max(...this.orders.map((o) => o.id)) + 1
        : 1;

    const servicesSnapshot = order.services.map((s) => ({
      id: s.id,
      name: s.name,
      price: s.price,
    }));

    const now = new Date().toISOString();

    this.orders.push({
      ...order,
      id: newId,
      updatedAt: now,
      services: servicesSnapshot,
      notes: order.notes || "",
      status: order.status || "Przyjęte",
    });
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
    if (updated.services) {
      order.services = updated.services.map((s) => ({
        id: s.id,
        name: s.name,
        price: s.price,
      }));
    }
    if (updated.status) order.status = updated.status;
    if (updated.notes !== undefined) order.notes = updated.notes;
    if (updated.createdAt) order.createdAt = updated.createdAt;

    order.updatedAt = new Date().toISOString();
  }

  deleteOrder(orderId: number) {
    this.orders = this.orders.filter((o) => o.id !== orderId);
  }
}

export const ordersStore = new OrdersStore();

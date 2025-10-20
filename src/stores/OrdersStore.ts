import { makeAutoObservable, reaction } from "mobx";
import type { Client } from "./ClientsStore";

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
      this.orders = [
        {
          id: 1,
          client: { id: 1, name: "Jan Kowalski", phone: "" },
          services: [{ id: 1, name: "Mycie zewnętrzne", price: 100 }],
          status: "Przyjęte",
          createdAt: new Date("2025-10-15T10:00:00Z").toISOString(),
          updatedAt: new Date("2025-10-15T10:00:00Z").toISOString(),
          notes: "",
        },
        {
          id: 2,
          client: { id: 2, name: "Anna Nowak", phone: "" },
          services: [
            { id: 3, name: "Detailing wnętrza", price: 250 },
            { id: 4, name: "Woskowanie", price: 150 },
          ],
          status: "Zakończone",
          createdAt: new Date("2025-10-16T14:30:00Z").toISOString(),
          updatedAt: new Date("2025-10-16T14:30:00Z").toISOString(),
          notes: "",
        },
      ];
    }

    reaction(
      () => this.orders.map((o) => ({ ...o })),
      (orders) => {
        localStorage.setItem("orders", JSON.stringify(orders));
      }
    );
  }

  addOrder(order: Omit<Order, "id" | "createdAt" | "updatedAt">) {
    const newId =
      this.orders.length > 0
        ? Math.max(...this.orders.map((o) => o.id)) + 1
        : 1;
    const now = new Date().toISOString();

    const servicesSnapshot = order.services.map((s) => ({
      id: s.id,
      name: s.name,
      price: s.price,
    }));

    this.orders.push({
      ...order,
      id: newId,
      createdAt: now,
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
    updated: Partial<Omit<Order, "id" | "createdAt">>
  ) {
    const order = this.orders.find((o) => o.id === orderId);
    if (order) {
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
      order.updatedAt = new Date().toISOString();
    }
  }

  deleteOrder(orderId: number) {
    this.orders = this.orders.filter((o) => o.id !== orderId);
  }
}

export const ordersStore = new OrdersStore();

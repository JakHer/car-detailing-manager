import { makeAutoObservable } from "mobx";
import type { Client } from "./ClientsStore";
import type { Service } from "./ServicesStore";

export interface Order {
  id: number;
  client: Client;
  service: Service;
  status: "W toku" | "Zakończone";
}

export class OrdersStore {
  orders: Order[] = [
    {
      id: 1,
      client: {
        id: 1,
        name: "Jan Kowalski",
        phone: "",
      },
      service: { id: 1, name: "Mycie zewnętrzne", price: 100 },
      status: "W toku",
    },
    {
      id: 2,
      client: {
        id: 2,
        name: "Anna Nowak",
        phone: "",
      },
      service: { id: 3, name: "Detailing wnętrza", price: 250 },
      status: "Zakończone",
    },
  ];

  constructor() {
    makeAutoObservable(this);
  }

  addOrder(order: Omit<Order, "id">) {
    const newId =
      this.orders.length > 0
        ? Math.max(...this.orders.map((o) => o.id)) + 1
        : 1;
    this.orders.push({ ...order, id: newId });
  }

  toggleStatus(orderId: number) {
    const order = this.orders.find((o) => o.id === orderId);
    if (order) {
      order.status = order.status === "W toku" ? "Zakończone" : "W toku";
    }
  }
}

export const ordersStore = new OrdersStore();

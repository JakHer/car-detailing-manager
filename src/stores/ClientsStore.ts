import { makeAutoObservable, reaction } from "mobx";
import { MOCK_CLIENTS } from "../mocks/mocks";
import { ordersStore } from "./OrdersStore";

export interface Client {
  id: number;
  name: string;
  phone?: string;
  email?: string;
  notes?: string;
}

export class ClientsStore {
  clients: Client[] = [];

  constructor() {
    makeAutoObservable(this);

    const stored = localStorage.getItem("clients");
    if (stored) {
      try {
        this.clients = JSON.parse(stored);
      } catch {
        this.clients = [];
      }
    } else {
      this.clients = MOCK_CLIENTS;
    }

    reaction(
      () => this.clients.map((c) => ({ ...c })),
      (clients) => {
        localStorage.setItem("clients", JSON.stringify(clients));
      }
    );
  }
  get sortedClients() {
    return this.clients.slice().sort((a, b) => {
      const aLast = ordersStore.orders
        .filter((o) => o.client.id === a.id)
        .sort((x, y) => +new Date(y.createdAt) - +new Date(x.createdAt))[0];
      const bLast = ordersStore.orders
        .filter((o) => o.client.id === b.id)
        .sort((x, y) => +new Date(y.createdAt) - +new Date(x.createdAt))[0];

      const aTime = aLast ? new Date(aLast.createdAt).getTime() : 0;
      const bTime = bLast ? new Date(bLast.createdAt).getTime() : 0;

      return bTime - aTime;
    });
  }
  addClient(client: Omit<Client, "id">) {
    const newId =
      this.clients.length > 0
        ? Math.max(...this.clients.map((c) => c.id)) + 1
        : 1;
    this.clients.push({ ...client, id: newId });
  }

  updateClient(id: number, updated: Partial<Omit<Client, "id">>) {
    const client = this.clients.find((c) => c.id === id);
    if (client) {
      if (updated.name !== undefined) client.name = updated.name;
      if (updated.phone !== undefined) client.phone = updated.phone;
      if (updated.email !== undefined) client.email = updated.email;
      if (updated.notes !== undefined) client.notes = updated.notes;
    }
  }

  deleteClient(id: number) {
    this.clients = this.clients.filter((c) => c.id !== id);
  }
}

export const clientsStore = new ClientsStore();

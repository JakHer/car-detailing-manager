import { makeAutoObservable, reaction } from "mobx";
import { MOCK_CLIENTS } from "../mocks/mocks";
import { ordersStore } from "./OrdersStore";
import { parseLocalDate, parseLocalDateEnd } from "../utils/dateUtils";

export interface Client {
  id: number;
  name: string;
  phone?: string;
  email?: string;
  notes?: string;
}

export class ClientsStore {
  clients: Client[] = [];
  searchTerm = "";
  dateFrom = "";
  dateTo = "";

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

  setFilters(
    filters: Partial<{ searchTerm: string; dateFrom: string; dateTo: string }>
  ) {
    if (filters.searchTerm !== undefined) this.searchTerm = filters.searchTerm;
    if (filters.dateFrom !== undefined) this.dateFrom = filters.dateFrom;
    if (filters.dateTo !== undefined) this.dateTo = filters.dateTo;
  }

  resetFilters() {
    this.searchTerm = "";
    this.dateFrom = "";
    this.dateTo = "";
  }

  get filteredClients() {
    const from = parseLocalDate(this.dateFrom);
    const to = parseLocalDateEnd(this.dateTo);

    return this.sortedClients.filter((c) => {
      const matchesSearch =
        c.name.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        c.phone?.includes(this.searchTerm) ||
        c.email?.toLowerCase().includes(this.searchTerm.toLowerCase());

      const clientOrders = ordersStore.orders
        .filter((o) => o.client.id === c.id)
        .sort((a, b) => +new Date(a.createdAt) - +new Date(b.createdAt));

      const lastOrder = clientOrders.length
        ? new Date(clientOrders[clientOrders.length - 1].createdAt)
        : null;

      const matchesDate =
        (!from || (lastOrder && lastOrder >= from)) &&
        (!to || (lastOrder && lastOrder <= to));

      return matchesSearch && matchesDate;
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
    if (client) Object.assign(client, updated);
  }

  deleteClient(id: number) {
    this.clients = this.clients.filter((c) => c.id !== id);
  }
}

export const clientsStore = new ClientsStore();

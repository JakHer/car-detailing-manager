import { makeAutoObservable } from "mobx";

export interface Client {
  id: number;
  name: string;
  phone?: string;
  email?: string;
  notes?: string;
}

export class ClientsStore {
  clients: Client[] = [
    {
      id: 1,
      name: "Jan Kowalski",
      phone: "123-456-789",
      email: "jan@example.com",
      notes: "VIP klient",
    },
    {
      id: 2,
      name: "Anna Nowak",
      phone: "987-654-321",
      email: "anna@example.com",
    },
  ];

  constructor() {
    makeAutoObservable(this);
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

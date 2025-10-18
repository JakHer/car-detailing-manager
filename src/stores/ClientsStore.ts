import { makeAutoObservable } from "mobx";

export interface Client {
  id: number;
  name: string;
  phone?: string;
  email?: string;
}

export class ClientsStore {
  clients: Client[] = [
    {
      id: 1,
      name: "Jan Kowalski",
      phone: "123-456-789",
      email: "jan@example.com",
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
}

export const clientsStore = new ClientsStore();

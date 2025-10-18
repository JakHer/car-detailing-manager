import { makeAutoObservable } from "mobx";

export interface Service {
  id: number;
  name: string;
  price: number;
}

export class ServicesStore {
  services: Service[] = [
    { id: 1, name: "Mycie zewnętrzne", price: 100 },
    { id: 2, name: "Woskowanie", price: 200 },
    { id: 3, name: "Detailing wnętrza", price: 250 },
  ];

  constructor() {
    makeAutoObservable(this);
  }

  addService(service: Omit<Service, "id">) {
    const newId =
      this.services.length > 0
        ? Math.max(...this.services.map((s) => s.id)) + 1
        : 1;
    this.services.push({ ...service, id: newId });
  }
}

export const servicesStore = new ServicesStore();

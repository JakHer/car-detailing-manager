import { makeAutoObservable, reaction } from "mobx";

export interface Service {
  id: number;
  name: string;
  price: number;
}

export class ServicesStore {
  services: Service[] = [];

  constructor() {
    makeAutoObservable(this);

    const stored = localStorage.getItem("services");
    if (stored) {
      try {
        this.services = JSON.parse(stored);
      } catch {
        this.services = [];
      }
    } else {
      this.services = [
        { id: 1, name: "Mycie zewnętrzne", price: 100 },
        { id: 2, name: "Woskowanie", price: 200 },
        { id: 3, name: "Detailing wnętrza", price: 250 },
      ];
    }

    reaction(
      () => this.services.map((s) => ({ ...s })),
      (services) => {
        localStorage.setItem("services", JSON.stringify(services));
      }
    );
  }

  addService(service: Omit<Service, "id">) {
    const newId =
      this.services.length > 0
        ? Math.max(...this.services.map((s) => s.id)) + 1
        : 1;
    this.services.push({ ...service, id: newId });
  }

  updateService(serviceId: number, updated: Partial<Omit<Service, "id">>) {
    const service = this.services.find((s) => s.id === serviceId);
    if (service) {
      if (updated.name !== undefined) service.name = updated.name;
      if (updated.price !== undefined) service.price = updated.price;
    }
  }

  deleteService(serviceId: number) {
    this.services = this.services.filter((s) => s.id !== serviceId);
  }
}

export const servicesStore = new ServicesStore();

import { makeAutoObservable, runInAction } from "mobx";
import { supabase } from "../lib/supabaseClient";
import { ordersStore } from "./OrdersStore";
import NProgress from "nprogress";

export interface Car {
  id: string;
  client_id: string;
  make?: string;
  model?: string;
  license_plate?: string;
  color?: string;
  year?: number;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface Client {
  id: string;
  name: string;
  phone?: string;
  email?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
  cars: Car[];
}

type ClientInput = Pick<Client, "name" | "phone" | "email" | "notes">;
type CarInput = Pick<
  Car,
  "make" | "model" | "license_plate" | "color" | "year" | "notes"
>;

class ClientsStore {
  clients: Client[] = [];
  loading = false;
  searchTerm = "";
  dateFrom = "";
  dateTo = "";
  private debounceTimer: ReturnType<typeof setTimeout> | null = null;

  constructor() {
    makeAutoObservable(this);
    this.fetchAllClients();
  }

  private debouncedFetch = () => {
    if (this.debounceTimer) clearTimeout(this.debounceTimer);
    this.debounceTimer = setTimeout(() => {
      this.fetchAllClients();
    }, 300);
  };

  async fetchAllClients(): Promise<Client[]> {
    if (this.loading) return [];

    this.loading = true;
    NProgress.start();

    let query = supabase
      .from("clients")
      .select(
        `
        *,
        cars (
          id,
          make,
          model,
          license_plate,
          color,
          year,
          notes,
          created_at,
          updated_at
        )
      `
      )
      .order("created_at", { ascending: false });

    if (this.searchTerm) {
      query = query.or(
        `name.ilike.%${this.searchTerm}%,phone.ilike.%${this.searchTerm}%,email.ilike.%${this.searchTerm}%,notes.ilike.%${this.searchTerm}%`
      );
    }

    if (this.dateFrom) {
      const startOfDay = new Date(this.dateFrom);
      startOfDay.setHours(0, 0, 0, 0);
      query = query.gte("created_at", startOfDay.toISOString());
    }

    if (this.dateTo) {
      const endOfDay = new Date(this.dateTo);
      endOfDay.setHours(23, 59, 59, 999);
      query = query.lte("created_at", endOfDay.toISOString());
    }

    try {
      const { data, error } = await query;
      if (error) throw error;

      runInAction(() => {
        this.clients = (data ?? []).map((client: Client) => ({
          ...client,
          cars: client.cars ?? [],
        }));
      });

      return this.clients;
    } catch (error) {
      console.error("Fetch clients error:", error);
      runInAction(() => {
        this.clients = [];
      });
      throw error;
    } finally {
      runInAction(() => {
        this.loading = false;
      });
      NProgress.done();
    }
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
    this.debouncedFetch();
  }

  resetFilters() {
    this.searchTerm = "";
    this.dateFrom = "";
    this.dateTo = "";
    this.debouncedFetch();
  }

  get filteredClients() {
    return this.sortedClients;
  }

  async addClient(client: ClientInput): Promise<Client | null> {
    this.loading = true;
    NProgress.start();
    try {
      const { data, error } = await supabase
        .from("clients")
        .insert(client)
        .select(
          `
          *,
          cars (
            id,
            make,
            model,
            license_plate,
            color,
            year,
            notes,
            created_at,
            updated_at
          )
        `
        )
        .single();

      if (error) throw error;

      runInAction(() => {
        if (data) this.clients.unshift({ ...data, cars: data.cars ?? [] });
      });

      return { ...data, cars: data.cars ?? [] };
    } catch (error) {
      console.error("Add client error:", error);
      throw error;
    } finally {
      runInAction(() => {
        this.loading = false;
      });
      NProgress.done();
    }
  }

  async addCar(clientId: string, car: CarInput): Promise<Car | null> {
    this.loading = true;
    NProgress.start();
    try {
      const { data, error } = await supabase
        .from("cars")
        .insert({ ...car, client_id: clientId })
        .select()
        .single();

      if (error) throw error;

      await this.fetchAllClients();
      return data;
    } catch (error) {
      console.error("Add car error:", error);
      throw error;
    } finally {
      runInAction(() => {
        this.loading = false;
      });
      NProgress.done();
    }
  }

  async updateClient(
    id: string,
    updated: Partial<ClientInput>
  ): Promise<Client | null> {
    this.loading = true;
    NProgress.start();
    try {
      const { data, error } = await supabase
        .from("clients")
        .update(updated)
        .eq("id", id)
        .select(
          `
          *,
          cars (
            id,
            make,
            model,
            license_plate,
            color,
            year,
            notes,
            created_at,
            updated_at
          )
        `
        )
        .single();

      if (error) throw error;

      runInAction(() => {
        const index = this.clients.findIndex((c) => c.id === id);
        if (index !== -1 && data) {
          this.clients[index] = { ...data, cars: data.cars ?? [] };
        }
      });

      return { ...data, cars: data.cars ?? [] };
    } catch (error) {
      console.error("Update client error:", error);
      throw error;
    } finally {
      runInAction(() => {
        this.loading = false;
      });
      NProgress.done();
    }
  }

  async deleteClient(id: string): Promise<void> {
    this.loading = true;
    NProgress.start();
    try {
      const { error } = await supabase.from("clients").delete().eq("id", id);
      if (error) throw error;

      runInAction(() => {
        this.clients = this.clients.filter((c) => c.id !== id);
      });
    } catch (error) {
      console.error("Delete client error:", error);
      throw error;
    } finally {
      runInAction(() => {
        this.loading = false;
      });
      NProgress.done();
    }
  }

  async deleteCar(id: string): Promise<void> {
    this.loading = true;
    NProgress.start();
    try {
      const { error } = await supabase.from("cars").delete().eq("id", id);
      if (error) throw error;

      await this.fetchAllClients();
    } catch (error) {
      console.error("Delete car error:", error);
      throw error;
    } finally {
      runInAction(() => {
        this.loading = false;
      });
      NProgress.done();
    }
  }
}

export const clientsStore = new ClientsStore();

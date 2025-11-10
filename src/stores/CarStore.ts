import { makeAutoObservable, runInAction } from "mobx";
import { supabase } from "../lib/supabaseClient";
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

type CarInput = Pick<
  Car,
  "make" | "model" | "license_plate" | "color" | "year" | "notes"
>;

class CarStore {
  cars: Car[] = [];
  loading = false;
  searchTerm = "";
  dateFrom = "";
  dateTo = "";
  private debounceTimer: ReturnType<typeof setTimeout> | null = null;

  constructor() {
    makeAutoObservable(this);
    this.fetchAllCars();
  }

  private debouncedFetch = () => {
    if (this.debounceTimer) {
      clearTimeout(this.debounceTimer);
    }
    this.debounceTimer = setTimeout(() => {
      this.fetchAllCars();
    }, 300);
  };

  async fetchAllCars(): Promise<Car[]> {
    if (this.loading) return [];

    this.loading = true;
    NProgress.start();

    let query = supabase
      .from("cars")
      .select("*")
      .order("created_at", { ascending: false });

    if (this.searchTerm) {
      query = query.or(
        `make.ilike.%${this.searchTerm}%,model.ilike.%${this.searchTerm}%,license_plate.ilike.%${this.searchTerm}%,color.ilike.%${this.searchTerm}%,notes.ilike.%${this.searchTerm}%`
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
        this.cars = data ?? [];
      });

      return this.cars;
    } catch (error: unknown) {
      console.error("Fetch cars error:", error);
      runInAction(() => {
        this.cars = [];
      });
      throw error;
    } finally {
      runInAction(() => {
        this.loading = false;
      });
      NProgress.done();
    }
  }

  setSearchTerm(term: string) {
    this.searchTerm = term;
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

  get filteredCars() {
    return this.cars;
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

      runInAction(() => {
        if (data) this.cars.unshift(data);
      });

      if (this.searchTerm || this.dateFrom || this.dateTo) {
        await this.fetchAllCars();
      }

      return data;
    } catch (error: unknown) {
      console.error("Add car error:", error);
      throw error;
    } finally {
      runInAction(() => {
        this.loading = false;
      });
      NProgress.done();
    }
  }

  async updateCar(id: string, updated: Partial<CarInput>): Promise<Car | null> {
    this.loading = true;
    NProgress.start();
    try {
      const { data, error } = await supabase
        .from("cars")
        .update(updated)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;

      runInAction(() => {
        const index = this.cars.findIndex((c) => c.id === id);
        if (index !== -1 && data) {
          this.cars[index] = data;
        }
      });

      if (this.searchTerm || this.dateFrom || this.dateTo) {
        await this.fetchAllCars();
      }

      return data;
    } catch (error: unknown) {
      console.error("Update car error:", error);
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

      runInAction(() => {
        this.cars = this.cars.filter((c) => c.id !== id);
      });

      if (this.searchTerm || this.dateFrom || this.dateTo) {
        await this.fetchAllCars();
      }
    } catch (error: unknown) {
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

export const carStore = new CarStore();

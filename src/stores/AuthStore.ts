import { makeAutoObservable, runInAction } from "mobx";
import { supabase } from "../lib/supabaseClient";
import type { User } from "@supabase/supabase-js";
import { navigate } from "../utils/navigation";

class AuthStore {
  user: User | null = null;
  loading = true;

  constructor() {
    makeAutoObservable(this);
    this.initAuth();
  }

  async initAuth() {
    const {
      data: { session },
    } = await supabase.auth.getSession();

    runInAction(() => {
      this.user = session?.user ?? null;
      this.loading = false;
    });

    supabase.auth.onAuthStateChange((_event, session) => {
      runInAction(() => {
        this.user = session?.user ?? null;
      });
    });
  }

  async login(email: string, password: string) {
    this.loading = true;
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (error) throw error;

      runInAction(() => {
        this.user = data.user;
      });

      navigate("/");
    } catch (error) {
      console.error("Login error:", error);
      throw error;
    } finally {
      runInAction(() => {
        this.loading = false;
      });
    }
  }

  async logout() {
    await supabase.auth.signOut();
    runInAction(() => {
      this.user = null;
    });
    navigate("/login");
  }
}

export const authStore = new AuthStore();

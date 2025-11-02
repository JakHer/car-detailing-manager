import { makeAutoObservable, runInAction } from "mobx";
import { supabase } from "../lib/supabaseClient";
import type { User, PostgrestError } from "@supabase/supabase-js";
import { navigate } from "../utils/navigation";
import NProgress from "nprogress";
import debounce from "lodash.debounce";

NProgress.configure({
  showSpinner: false,
  trickleSpeed: 100,
});

export interface Profile {
  id: string;
  username: string;
  avatar_url?: string;
  role: "user" | "admin";
  email: string;
}

class AuthStore {
  user: User | null = null;
  profile: Profile | null = null;
  loading = true;
  profileLoading = false;
  private isFetchingProfile = false;

  constructor() {
    makeAutoObservable(this);
    this.initAuth();
  }

  private debouncedFetchProfile = debounce(this.fetchProfile.bind(this), 500);

  async initAuth() {
    NProgress.start();
    const {
      data: { session },
    } = await supabase.auth.getSession();

    runInAction(() => {
      this.user = session?.user ?? null;
      this.loading = false;
    });

    if (this.user && !this.isFetchingProfile) {
      await this.fetchProfile();
    }

    supabase.auth.onAuthStateChange((_event, session) => {
      runInAction(() => {
        this.user = session?.user ?? null;
      });
      if (this.user && !this.isFetchingProfile) {
        setTimeout(() => {
          if (
            !this.isFetchingProfile &&
            document.visibilityState === "visible"
          ) {
            this.debouncedFetchProfile();
          }
        }, 0);
      } else if (!this.user) {
        runInAction(() => {
          this.profile = null;
        });
      }
    });
    NProgress.done();
  }

  async fetchProfile(): Promise<Profile | null> {
    if (!this.user || this.isFetchingProfile) return null;

    this.isFetchingProfile = true;
    NProgress.start();
    this.profileLoading = true;
    try {
      const { data, error } = (await supabase
        .from("profiles")
        .select("*")
        .eq("id", this.user.id)
        .single()) as { data: Profile | null; error: PostgrestError | null };

      if (error) throw error;

      runInAction(() => {
        this.profile = data ?? null;
      });

      return data ?? null;
    } catch (error: unknown) {
      console.error("Fetch profile error:", error);
      runInAction(() => {
        this.profile = null;
      });
      throw error;
    } finally {
      runInAction(() => {
        this.profileLoading = false;
        this.isFetchingProfile = false;
      });
      NProgress.done();
    }
  }

  async upsertProfile(updates: Partial<Profile>): Promise<Profile | null> {
    if (!this.user) return null;

    NProgress.start();
    this.profileLoading = true;
    try {
      const isFirstAdmin = this.user.email === "admin@example.com";
      const finalUpdates = {
        id: this.user.id,
        email: this.user.email,
        ...updates,
        role: isFirstAdmin ? "admin" : "user",
      };

      const { data, error } = (await supabase
        .from("profiles")
        .upsert(finalUpdates)
        .select()
        .single()) as { data: Profile | null; error: PostgrestError | null };

      if (error) throw error;

      runInAction(() => {
        this.profile = data;
      });

      return data;
    } catch (error: unknown) {
      console.error("Upsert profile error:", error);
      throw error;
    } finally {
      runInAction(() => {
        this.profileLoading = false;
      });
      NProgress.done();
    }
  }

  async updateUserRole(userId: string, newRole: "user" | "admin") {
    NProgress.start();
    try {
      const { error } = (await supabase
        .from("profiles")
        .update({ role: newRole })
        .eq("id", userId)) as { error: PostgrestError | null };

      if (error) throw error;

      if (userId === this.user?.id) {
        await this.fetchProfile();
      }
    } catch (error: unknown) {
      console.error("Update user role error:", error);
      throw error;
    } finally {
      NProgress.done();
    }
  }

  async fetchAllProfiles(): Promise<Profile[]> {
    NProgress.start();
    try {
      const { data, error } = (await supabase.from("profiles").select("*")) as {
        data: Profile[];
        error: PostgrestError | null;
      };

      if (error) throw error;

      return data ?? [];
    } catch (error: unknown) {
      console.error("Fetch all profiles error:", error);
      throw error;
    } finally {
      NProgress.done();
    }
  }

  async login(email: string, password: string) {
    NProgress.start();
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

      await this.fetchProfile();
      if (!this.profile) {
        await this.upsertProfile({ username: email.split("@")[0] });
      }

      navigate("/");
    } catch (error: unknown) {
      console.error("Login error:", error);
      throw error;
    } finally {
      runInAction(() => {
        this.loading = false;
      });
      NProgress.done();
    }
  }

  async logout() {
    NProgress.start();
    try {
      await supabase.auth.signOut();
      runInAction(() => {
        this.user = null;
        this.profile = null;
      });
      navigate("/login");
    } catch (error: unknown) {
      console.error("Logout error:", error);
      throw error;
    } finally {
      NProgress.done();
    }
  }
}

export const authStore = new AuthStore();

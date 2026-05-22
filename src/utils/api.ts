const API_BASE = "/api";

export interface Editor {
  id: string;
  name: string;
  role: string;
  avatar: string;
  bio: string;
  status: "active" | "suspended";
  publications_count: number;
  reads: number;
  created_at?: string;
}

export interface Publication {
  id: string;
  slug: string;
  title: string;
  subtitle?: string;
  category: string;
  category_slug: string;
  author: string;
  editor_id: string;
  read_time: string;
  date: string;
  time: string;
  content: string[];
  status: "draft" | "published";
  read_count: number;
  image: string;
  is_featured: boolean;
  created_at?: string;
}

export interface Quote {
  id: string;
  quote_text: string;
  author: string;
  context?: string;
  wisdom_commentary: string;
  category: string;
  category_slug: string;
  date: string;
  status: "draft" | "published";
  created_at?: string;
}

export interface SystemSettings {
  open_registrations: boolean;
  drop_caps: boolean;
  live_tracking: boolean;
  maintenance: boolean;
}

export interface OverrideItem {
  slug: string;
  is_deleted: boolean;
  is_featured: boolean;
}

// Resilient API Helper
async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const url = `${API_BASE}${endpoint}`;
  
  const headers = new Headers(options.headers || {});
  if (!(options.body instanceof FormData) && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  const mergedOptions: RequestInit = {
    ...options,
    headers,
  };

  try {
    const res = await fetch(url, mergedOptions);
    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.message || `API request failed with status ${res.status}`);
    }

    return data;
  } catch (error: any) {
    // If connection failed or service unavailable, pass a specific network error
    if (error.message && (error.message.includes("Failed to fetch") || error.message.includes("NETWORK_OFFLINE") || error.message.includes("503"))) {
      throw new Error("NETWORK_OFFLINE");
    }
    throw error;
  }
}

export const api = {
  // Test connection
  checkHealth: async (): Promise<boolean> => {
    try {
      const data: any = await request("/global-parameters");
      return data.success;
    } catch {
      return false;
    }
  },

  // Editors operations
  editors: {
    login: async (id: string, passcode: string): Promise<any> => {
      return request("/auth-credential-validate", {
        method: "POST",
        body: JSON.stringify({ id, passcode }),
      });
    },
    list: async (): Promise<{ success: boolean; editors: Editor[] }> => {
      return request("/editorial-board-directory");
    },
    get: async (id: string): Promise<{ success: boolean; editor: Editor }> => {
      return request(`/editorial-board-directory/${id}`);
    },
    create: async (editorData: Omit<Editor, "publications_count" | "reads"> & { passcode: string }): Promise<any> => {
      return request("/editorial-board-directory", {
        method: "POST",
        body: JSON.stringify(editorData),
      });
    },
    update: async (id: string, editorData: Partial<Editor>): Promise<any> => {
      return request(`/editorial-board-directory/${id}`, {
        method: "PUT",
        body: JSON.stringify(editorData),
      });
    },
    updateStatus: async (id: string, status: "active" | "suspended"): Promise<any> => {
      return request(`/editorial-board-directory/${id}/status`, {
        method: "PUT",
        body: JSON.stringify({ status }),
      });
    },
  },

  // Publications operations
  publications: {
    list: async (filters?: { category?: string; status?: string }): Promise<{ success: boolean; publications: Publication[] }> => {
      let query = "";
      if (filters) {
        const params = new URLSearchParams();
        if (filters.category) params.append("category", filters.category);
        if (filters.status) params.append("status", filters.status);
        query = `?${params.toString()}`;
      }
      return request(`/platform-resource-loader${query}`);
    },
    get: async (idOrSlug: string): Promise<{ success: boolean; publication: Publication }> => {
      return request(`/platform-resource-loader/${idOrSlug}`);
    },
    create: async (pubData: Partial<Publication>): Promise<any> => {
      return request("/platform-resource-loader", {
        method: "POST",
        body: JSON.stringify(pubData),
      });
    },
    update: async (id: string, pubData: Partial<Publication>): Promise<any> => {
      return request(`/platform-resource-loader/${id}`, {
        method: "PUT",
        body: JSON.stringify(pubData),
      });
    },
    delete: async (id: string): Promise<any> => {
      return request(`/platform-resource-loader/${id}`, {
        method: "DELETE",
      });
    },
  },

  // Quotes operations
  quotes: {
    list: async (status?: string): Promise<{ success: boolean; quotes: Quote[] }> => {
      const query = status ? `?status=${status}` : "";
      return request(`/curated-wisdom-feed${query}`);
    },
    create: async (quoteData: Partial<Quote>): Promise<any> => {
      return request("/curated-wisdom-feed", {
        method: "POST",
        body: JSON.stringify(quoteData),
      });
    },
    update: async (id: string, quoteData: Partial<Quote>): Promise<any> => {
      return request(`/curated-wisdom-feed/${id}`, {
        method: "PUT",
        body: JSON.stringify(quoteData),
      });
    },
    delete: async (id: string): Promise<any> => {
      return request(`/curated-wisdom-feed/${id}`, {
        method: "DELETE",
      });
    },
  },

  // Settings & Overrides operations
  settings: {
    get: async (): Promise<{ success: boolean; settings: SystemSettings }> => {
      return request("/global-parameters");
    },
    update: async (settingsData: Partial<SystemSettings>): Promise<any> => {
      return request("/global-parameters", {
        method: "PUT",
        body: JSON.stringify(settingsData),
      });
    },
    getOverrides: async (): Promise<{ success: boolean; overrides: Record<string, OverrideItem> }> => {
      return request("/override-metrics");
    },
    updateOverride: async (slug: string, overrideData: { is_deleted?: boolean; is_featured?: boolean }): Promise<any> => {
      return request(`/override-metrics/${slug}`, {
        method: "PUT",
        body: JSON.stringify(overrideData),
      });
    },
  },
};


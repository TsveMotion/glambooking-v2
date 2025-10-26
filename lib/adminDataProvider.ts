import { DataProvider } from "@refinedev/core";

const API_URL = "/api/admin";

export const adminDataProvider: DataProvider = {
  getList: async ({ resource, pagination, sorters, filters }) => {
    const url = `${API_URL}/${resource}`;
    
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Failed to fetch ${resource}`);
    }
    
    const data = await response.json();
    
    // Transform data based on resource type
    switch (resource) {
      case "stats":
        return {
          data: [data], // Stats is a single object, wrap in array for Refine
          total: 1,
        };
      case "activity":
        return {
          data: data.activities || [],
          total: data.activities?.length || 0,
        };
      case "users":
        return {
          data: data.users || [],
          total: data.total || 0,
        };
      case "businesses":
        return {
          data: data.businesses || [],
          total: data.total || 0,
        };
      case "bookings":
        return {
          data: data.bookings || [],
          total: data.total || 0,
        };
      case "payments":
        return {
          data: data.payments || [],
          total: data.total || 0,
        };
      default:
        return {
          data: [],
          total: 0,
        };
    }
  },

  getOne: async ({ resource, id }) => {
    const url = `${API_URL}/${resource}/${id}`;
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`Failed to fetch ${resource} with id ${id}`);
    }
    
    const data = await response.json();
    return { data };
  },

  create: async ({ resource, variables }) => {
    const url = `${API_URL}/${resource}`;
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(variables),
    });
    
    if (!response.ok) {
      throw new Error(`Failed to create ${resource}`);
    }
    
    const data = await response.json();
    return { data };
  },

  update: async ({ resource, id, variables }) => {
    const url = `${API_URL}/${resource}/${id}`;
    const response = await fetch(url, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(variables),
    });
    
    if (!response.ok) {
      throw new Error(`Failed to update ${resource} with id ${id}`);
    }
    
    const data = await response.json();
    return { data };
  },

  deleteOne: async ({ resource, id }) => {
    const url = `${API_URL}/${resource}/${id}`;
    const response = await fetch(url, {
      method: "DELETE",
    });
    
    if (!response.ok) {
      throw new Error(`Failed to delete ${resource} with id ${id}`);
    }
    
    return { data: { id } };
  },

  getApiUrl: () => API_URL,
};

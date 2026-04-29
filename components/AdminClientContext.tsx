"use client";
import { createContext, useContext, useState, useEffect } from "react";

type ClientInfo = { id: string; name: string; avatar: string } | null;

type Ctx = {
  selectedClientId: string | null;
  selectedClient: ClientInfo;
  setSelectedClientId: (id: string | null) => void;
  setSelectedClient: (info: ClientInfo) => void;
};

const AdminClientCtx = createContext<Ctx>({
  selectedClientId: null,
  selectedClient: null,
  setSelectedClientId: () => {},
  setSelectedClient: () => {},
});

export function AdminClientProvider({ children }: { children: React.ReactNode }) {
  const [client, setClient] = useState<ClientInfo>(null);

  useEffect(() => {
    try {
      const stored = localStorage.getItem("adminSelectedClient");
      if (stored) setClient(JSON.parse(stored));
    } catch {}
  }, []);

  const setById = (id: string | null) => {
    if (!id) {
      setClient(null);
      localStorage.removeItem("adminSelectedClient");
    } else {
      // Keep current client if same ID, otherwise partial update
      setClient((prev) => {
        const next = prev?.id === id ? prev : { id, name: "", avatar: "" };
        localStorage.setItem("adminSelectedClient", JSON.stringify(next));
        return next;
      });
    }
  };

  const setFull = (info: ClientInfo) => {
    setClient(info);
    if (info) localStorage.setItem("adminSelectedClient", JSON.stringify(info));
    else localStorage.removeItem("adminSelectedClient");
  };

  return (
    <AdminClientCtx.Provider
      value={{
        selectedClientId: client?.id ?? null,
        selectedClient: client,
        setSelectedClientId: setById,
        setSelectedClient: setFull,
      }}
    >
      {children}
    </AdminClientCtx.Provider>
  );
}

export const useAdminClient = () => useContext(AdminClientCtx);

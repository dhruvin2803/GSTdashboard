import { useEffect, useState } from "react";
import AdminLayout from "../../layouts/AdminLayout";
import ClientFormModal from "../../components/ClientFormModal";
import ClientsTable from "../../components/ClientsTable";
import type { Client } from "../../types/type";

function Clients() {
  const [clients, setClients] = useState<Client[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingClient, setEditingClient] = useState<Client | null>(null);

  const loadClients = async () => {
    const token = localStorage.getItem("token");

    const res = await fetch("http://localhost:5000/admin/clients", {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (!res.ok) {
      console.error("Failed to load clients");
      return;
    }

    const data: Client[] = await res.json();
    setClients(data);
  };

  const deleteClient = async (id: number) => {
    const token = localStorage.getItem("token");

    const res = await fetch(
      `http://localhost:5000/admin/clients/${id}`,
      {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      }
    );

    if (!res.ok) {
      console.error("Failed to delete client");
      return;
    }

    loadClients();
  };

  useEffect(() => {
    loadClients();
  }, []);

  return (
    <AdminLayout title="Clients">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-xl font-semibold">Client Management</h1>
        <button
          onClick={() => setIsModalOpen(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          + Add Client
        </button>
      </div>

      <ClientsTable
        clients={clients}
        onDelete={deleteClient}
        onEdit={(client) => setEditingClient(client)}
      />

      {isModalOpen && (
        <ClientFormModal
          onClose={() => {
            setIsModalOpen(false);
            loadClients();
          }}
        />
      )}

      {editingClient && (
        <ClientFormModal
          client={editingClient}
          onClose={() => {
            setEditingClient(null);
            loadClients();
          }}
        />
      )}
    </AdminLayout>
  );
}

export default Clients;

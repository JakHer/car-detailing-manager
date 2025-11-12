import type { Client } from "../stores/ClientsStore";
import type { Order, OrderStatus } from "../stores/OrdersStore";
import type { Service } from "../stores/ServicesStore";

export const MOCK_CLIENTS: Client[] = [
  {
    id: "1",
    name: "Jan Kowalski",
    phone: "123-456-789",
    email: "jan@example.com",
    notes: "VIP klient",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    cars: [],
  },
  {
    id: "2",
    name: "Anna Nowak",
    phone: "987-654-321",
    email: "anna@example.com",
    notes: "",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    cars: [],
  },
];

export const MOCK_SERVICES: Service[] = [
  { id: 1, name: "Mycie zewnętrzne", price: 100 },
  { id: 2, name: "Woskowanie", price: 200 },
  { id: 3, name: "Detailing wnętrza", price: 250 },
];

export const MOCK_ORDERS: Order[] = [
  {
    id: 1,
    client: MOCK_CLIENTS[0],
    services: [MOCK_SERVICES[0]],
    status: "Przyjęte" as OrderStatus,
    createdAt: new Date("2025-10-15T10:00:00Z").toISOString(),
    updatedAt: new Date("2025-10-15T10:00:00Z").toISOString(),
    notes: "",
  },
  {
    id: 2,
    client: MOCK_CLIENTS[1],
    services: [MOCK_SERVICES[2], MOCK_SERVICES[1]],
    status: "Zakończone" as OrderStatus,
    createdAt: new Date("2025-10-16T14:30:00Z").toISOString(),
    updatedAt: new Date("2025-10-16T14:30:00Z").toISOString(),
    notes: "",
  },
];

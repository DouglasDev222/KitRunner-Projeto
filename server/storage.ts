import { 
  Event, 
  InsertEvent, 
  Customer, 
  InsertCustomer, 
  Kit, 
  InsertKit,
  Order,
  InsertOrder,
  CustomerIdentification,
  events,
  customers,
  orders,
  kits
} from "@shared/schema";
import { db } from "./db";
import { eq, and } from "drizzle-orm";

export interface IStorage {
  // Events
  getEvents(): Promise<Event[]>;
  getEvent(id: number): Promise<Event | undefined>;
  createEvent(event: InsertEvent): Promise<Event>;

  // Customers
  getCustomerByCredentials(cpf: string, birthDate: string): Promise<Customer | undefined>;
  createCustomer(customer: InsertCustomer): Promise<Customer>;

  // Orders
  createOrder(order: InsertOrder): Promise<Order>;
  getOrderByNumber(orderNumber: string): Promise<Order | undefined>;

  // Kits
  createKit(kit: InsertKit): Promise<Kit>;
  getKitsByOrderId(orderId: number): Promise<Kit[]>;
}

export class DatabaseStorage implements IStorage {
  async getEvents(): Promise<Event[]> {
    const result = await db.select().from(events);
    return result;
  }

  async getEvent(id: number): Promise<Event | undefined> {
    const [event] = await db.select().from(events).where(eq(events.id, id));
    return event || undefined;
  }

  async createEvent(insertEvent: InsertEvent): Promise<Event> {
    const [event] = await db
      .insert(events)
      .values(insertEvent)
      .returning();
    return event;
  }

  async getCustomerByCredentials(cpf: string, birthDate: string): Promise<Customer | undefined> {
    const cleanCpf = cpf.replace(/\D/g, '');
    const result = await db
      .select()
      .from(customers)
      .where(and(eq(customers.cpf, cleanCpf), eq(customers.birthDate, birthDate)));
    return result[0] || undefined;
  }

  async createCustomer(insertCustomer: InsertCustomer): Promise<Customer> {
    const [customer] = await db
      .insert(customers)
      .values(insertCustomer)
      .returning();
    return customer;
  }

  async createOrder(insertOrder: InsertOrder): Promise<Order> {
    const orderNumber = `KR${new Date().getFullYear()}${String(Date.now()).slice(-6)}`;
    const [order] = await db
      .insert(orders)
      .values({
        ...insertOrder,
        orderNumber,
      })
      .returning();
    return order;
  }

  async getOrderByNumber(orderNumber: string): Promise<Order | undefined> {
    const [order] = await db
      .select()
      .from(orders)
      .where(eq(orders.orderNumber, orderNumber));
    return order || undefined;
  }

  async createKit(insertKit: InsertKit): Promise<Kit> {
    const [kit] = await db
      .insert(kits)
      .values(insertKit)
      .returning();
    return kit;
  }

  async getKitsByOrderId(orderId: number): Promise<Kit[]> {
    const result = await db
      .select()
      .from(kits)
      .where(eq(kits.orderId, orderId));
    return result;
  }
}

export const storage = new DatabaseStorage();

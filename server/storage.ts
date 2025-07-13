import { 
  Event, 
  InsertEvent, 
  Customer, 
  InsertCustomer, 
  Address,
  InsertAddress,
  Kit, 
  InsertKit,
  Order,
  InsertOrder,
  Coupon,
  InsertCoupon,
  CustomerIdentification,
  events,
  customers,
  addresses,
  orders,
  kits,
  coupons
} from "@shared/schema";
import { db } from "./db";
import { eq, and, count, sum, desc } from "drizzle-orm";

export interface IStorage {
  // Events
  getEvents(): Promise<Event[]>;
  getEvent(id: number): Promise<Event | undefined>;
  createEvent(event: InsertEvent): Promise<Event>;

  // Customers
  getCustomerByCredentials(cpf: string, birthDate: string): Promise<Customer | undefined>;
  createCustomer(customer: InsertCustomer): Promise<Customer>;

  // Addresses
  createAddress(address: InsertAddress): Promise<Address>;
  getAddressesByCustomerId(customerId: number): Promise<Address[]>;
  getAddress(id: number): Promise<Address | undefined>;
  updateAddress(id: number, address: Partial<InsertAddress>): Promise<Address>;

  // Orders
  createOrder(order: InsertOrder): Promise<Order>;
  getOrderByNumber(orderNumber: string): Promise<Order | undefined>;
  getOrdersByCustomerId(customerId: number): Promise<Order[]>;

  // Kits
  createKit(kit: InsertKit): Promise<Kit>;
  getKitsByOrderId(orderId: number): Promise<Kit[]>;

  // Admin methods
  getAllCustomers(): Promise<Customer[]>;
  getAllOrders(): Promise<(Order & { customer: Customer; event: Event })[]>;
  getAllEvents(): Promise<Event[]>;
  getAdminStats(): Promise<{
    totalCustomers: number;
    totalOrders: number;
    activeEvents: number;
    totalRevenue: number;
  }>;

  // Coupons
  getCouponByCode(code: string): Promise<Coupon | undefined>;
  createCoupon(coupon: InsertCoupon): Promise<Coupon>;
  
  // Price calculation
  calculateDeliveryPrice(fromZipCode: string, toZipCode: string): Promise<number>;
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

  async createAddress(insertAddress: InsertAddress): Promise<Address> {
    const [address] = await db
      .insert(addresses)
      .values(insertAddress)
      .returning();
    return address;
  }

  async getAddressesByCustomerId(customerId: number): Promise<Address[]> {
    const result = await db
      .select()
      .from(addresses)
      .where(eq(addresses.customerId, customerId));
    return result;
  }

  async getAddress(id: number): Promise<Address | undefined> {
    const [address] = await db.select().from(addresses).where(eq(addresses.id, id));
    return address || undefined;
  }

  async updateAddress(id: number, updateData: Partial<InsertAddress>): Promise<Address> {
    const [address] = await db
      .update(addresses)
      .set(updateData)
      .where(eq(addresses.id, id))
      .returning();
    return address;
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

  async getOrdersByCustomerId(customerId: number): Promise<Order[]> {
    const result = await db
      .select()
      .from(orders)
      .where(eq(orders.customerId, customerId))
      .orderBy(orders.createdAt);
    return result;
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

  // Admin methods
  async getAllCustomers(): Promise<Customer[]> {
    const result = await db.select().from(customers).orderBy(desc(customers.createdAt));
    return result;
  }

  async getAllOrders(): Promise<(Order & { customer: Customer; event: Event })[]> {
    const result = await db.select({
      id: orders.id,
      orderNumber: orders.orderNumber,
      eventId: orders.eventId,
      customerId: orders.customerId,
      addressId: orders.addressId,
      kitQuantity: orders.kitQuantity,
      deliveryCost: orders.deliveryCost,
      extraKitsCost: orders.extraKitsCost,
      donationCost: orders.donationCost,
      discountAmount: orders.discountAmount,
      couponCode: orders.couponCode,
      totalCost: orders.totalCost,
      paymentMethod: orders.paymentMethod,
      status: orders.status,
      createdAt: orders.createdAt,
      customer: customers,
      event: events,
    })
    .from(orders)
    .leftJoin(customers, eq(orders.customerId, customers.id))
    .leftJoin(events, eq(orders.eventId, events.id))
    .orderBy(desc(orders.createdAt));
    
    return result as (Order & { customer: Customer; event: Event })[];
  }

  async getAllEvents(): Promise<Event[]> {
    const result = await db.select().from(events).orderBy(desc(events.createdAt));
    return result;
  }

  async getAdminStats(): Promise<{
    totalCustomers: number;
    totalOrders: number;
    activeEvents: number;
    totalRevenue: number;
  }> {
    const [customersCount] = await db.select({ count: count() }).from(customers);
    const [ordersCount] = await db.select({ count: count() }).from(orders);
    const [activeEventsCount] = await db.select({ count: count() }).from(events).where(eq(events.available, true));
    const [revenue] = await db.select({ total: sum(orders.totalCost) }).from(orders);

    return {
      totalCustomers: customersCount.count,
      totalOrders: ordersCount.count,
      activeEvents: activeEventsCount.count,
      totalRevenue: Number(revenue.total) || 0,
    };
  }

  // Coupons
  async getCouponByCode(code: string): Promise<Coupon | undefined> {
    const result = await db.select().from(coupons).where(eq(coupons.code, code));
    return result[0];
  }

  async createCoupon(insertCoupon: InsertCoupon): Promise<Coupon> {
    const result = await db.insert(coupons).values(insertCoupon).returning();
    return result[0];
  }

  // Price calculation - provisório
  async calculateDeliveryPrice(fromZipCode: string, toZipCode: string): Promise<number> {
    // Algoritmo provisório baseado na diferença dos CEPs
    const from = parseInt(fromZipCode.substring(0, 5));
    const to = parseInt(toZipCode.substring(0, 5));
    const distance = Math.abs(from - to);
    
    // Preço base + valor por distância (simulação)
    const basePrice = 15.00;
    const pricePerKm = 0.05;
    
    return basePrice + (distance * pricePerKm);
  }
}

export const storage = new DatabaseStorage();

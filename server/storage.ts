import { 
  Event, 
  InsertEvent, 
  Customer, 
  InsertCustomer, 
  Kit, 
  InsertKit,
  Order,
  InsertOrder,
  CustomerIdentification
} from "@shared/schema";

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

export class MemStorage implements IStorage {
  private events: Map<number, Event>;
  private customers: Map<number, Customer>;
  private orders: Map<number, Order>;
  private kits: Map<number, Kit>;
  private eventId: number;
  private customerId: number;
  private orderId: number;
  private kitId: number;

  constructor() {
    this.events = new Map();
    this.customers = new Map();
    this.orders = new Map();
    this.kits = new Map();
    this.eventId = 1;
    this.customerId = 1;
    this.orderId = 1;
    this.kitId = 1;

    // Seed some events
    this.seedEvents();
    this.seedCustomers();
  }

  private seedEvents() {
    const events = [
      {
        id: 1,
        name: "Maratona de São Paulo 2024",
        date: "2024-12-15",
        time: "06:00",
        location: "Parque Ibirapuera",
        city: "São Paulo",
        state: "SP",
        participants: 12000,
        available: true,
      },
      {
        id: 2,
        name: "Corrida de Rua Rio 2024",
        date: "2024-12-22",
        time: "07:00",
        location: "Copacabana",
        city: "Rio de Janeiro",
        state: "RJ",
        participants: 8000,
        available: true,
      },
      {
        id: 3,
        name: "Meia Maratona BH",
        date: "2024-12-28",
        time: "06:30",
        location: "Lagoa da Pampulha",
        city: "Belo Horizonte",
        state: "MG",
        participants: 5000,
        available: false,
      },
    ];

    events.forEach(event => {
      this.events.set(event.id, event);
    });
    this.eventId = 4;
  }

  private seedCustomers() {
    const customers = [
      {
        id: 1,
        name: "João Silva Santos",
        cpf: "12345678901",
        birthDate: "1990-05-15",
        address: "Rua das Flores, 123, Apto 45",
        neighborhood: "Jardim Paulista",
        city: "São Paulo",
        state: "SP",
        zipCode: "01234-567",
      },
      {
        id: 2,
        name: "Maria Oliveira Costa",
        cpf: "98765432100",
        birthDate: "1985-03-20",
        address: "Avenida Atlântica, 456, Apto 102",
        neighborhood: "Copacabana",
        city: "Rio de Janeiro",
        state: "RJ",
        zipCode: "22070-011",
      },
    ];

    customers.forEach(customer => {
      this.customers.set(customer.id, customer);
    });
    this.customerId = 3;
  }

  async getEvents(): Promise<Event[]> {
    return Array.from(this.events.values());
  }

  async getEvent(id: number): Promise<Event | undefined> {
    return this.events.get(id);
  }

  async createEvent(insertEvent: InsertEvent): Promise<Event> {
    const id = this.eventId++;
    const event: Event = { ...insertEvent, id };
    this.events.set(id, event);
    return event;
  }

  async getCustomerByCredentials(cpf: string, birthDate: string): Promise<Customer | undefined> {
    const cleanCpf = cpf.replace(/\D/g, '');
    return Array.from(this.customers.values()).find(
      (customer) => customer.cpf === cleanCpf && customer.birthDate === birthDate
    );
  }

  async createCustomer(insertCustomer: InsertCustomer): Promise<Customer> {
    const id = this.customerId++;
    const customer: Customer = { ...insertCustomer, id };
    this.customers.set(id, customer);
    return customer;
  }

  async createOrder(insertOrder: InsertOrder): Promise<Order> {
    const id = this.orderId++;
    const orderNumber = `KR${new Date().getFullYear()}${String(Date.now()).slice(-6)}`;
    const order: Order = { 
      ...insertOrder, 
      id, 
      orderNumber,
      createdAt: new Date()
    };
    this.orders.set(id, order);
    return order;
  }

  async getOrderByNumber(orderNumber: string): Promise<Order | undefined> {
    return Array.from(this.orders.values()).find(
      (order) => order.orderNumber === orderNumber
    );
  }

  async createKit(insertKit: InsertKit): Promise<Kit> {
    const id = this.kitId++;
    const kit: Kit = { ...insertKit, id };
    this.kits.set(id, kit);
    return kit;
  }

  async getKitsByOrderId(orderId: number): Promise<Kit[]> {
    return Array.from(this.kits.values()).filter(
      (kit) => kit.orderId === orderId
    );
  }
}

export const storage = new MemStorage();

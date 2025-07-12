import { pgTable, text, serial, integer, boolean, timestamp, decimal } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const events = pgTable("events", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  date: text("date").notNull(),
  time: text("time").notNull(),
  location: text("location").notNull(),
  city: text("city").notNull(),
  state: text("state").notNull(),
  participants: integer("participants").notNull(),
  available: boolean("available").notNull().default(true),
});

export const customers = pgTable("customers", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  cpf: text("cpf").notNull().unique(),
  birthDate: text("birth_date").notNull(),
  address: text("address").notNull(),
  neighborhood: text("neighborhood").notNull(),
  city: text("city").notNull(),
  state: text("state").notNull(),
  zipCode: text("zip_code").notNull(),
});

export const kits = pgTable("kits", {
  id: serial("id").primaryKey(),
  orderId: integer("order_id").notNull(),
  name: text("name").notNull(),
  cpf: text("cpf").notNull(),
  shirtSize: text("shirt_size").notNull(),
});

export const orders = pgTable("orders", {
  id: serial("id").primaryKey(),
  orderNumber: text("order_number").notNull().unique(),
  eventId: integer("event_id").notNull(),
  customerId: integer("customer_id").notNull(),
  kitQuantity: integer("kit_quantity").notNull(),
  baseCost: decimal("base_cost", { precision: 10, scale: 2 }).notNull(),
  additionalCost: decimal("additional_cost", { precision: 10, scale: 2 }).notNull().default("0"),
  totalCost: decimal("total_cost", { precision: 10, scale: 2 }).notNull(),
  paymentMethod: text("payment_method").notNull(),
  status: text("status").notNull().default("confirmed"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertEventSchema = createInsertSchema(events).omit({
  id: true,
});

export const insertCustomerSchema = createInsertSchema(customers).omit({
  id: true,
});

export const insertKitSchema = createInsertSchema(kits).omit({
  id: true,
});

export const insertOrderSchema = createInsertSchema(orders).omit({
  id: true,
  orderNumber: true,
  createdAt: true,
});

export const customerIdentificationSchema = z.object({
  cpf: z.string().min(11, "CPF deve ter 11 dígitos"),
  birthDate: z.string().min(1, "Data de nascimento é obrigatória"),
});

export const kitInformationSchema = z.object({
  name: z.string().min(1, "Nome é obrigatório"),
  cpf: z.string().min(11, "CPF deve ter 11 dígitos"),
  shirtSize: z.enum(["PP", "P", "M", "G", "GG", "XGG"], {
    required_error: "Tamanho da camiseta é obrigatório",
  }),
});

export const orderCreationSchema = z.object({
  eventId: z.number(),
  customerId: z.number(),
  kitQuantity: z.number().min(1).max(5),
  kits: z.array(kitInformationSchema),
  paymentMethod: z.enum(["credit", "debit", "pix"]),
});

export type Event = typeof events.$inferSelect;
export type InsertEvent = z.infer<typeof insertEventSchema>;
export type Customer = typeof customers.$inferSelect;
export type InsertCustomer = z.infer<typeof insertCustomerSchema>;
export type Kit = typeof kits.$inferSelect;
export type InsertKit = z.infer<typeof insertKitSchema>;
export type Order = typeof orders.$inferSelect;
export type InsertOrder = z.infer<typeof insertOrderSchema>;
export type CustomerIdentification = z.infer<typeof customerIdentificationSchema>;
export type KitInformation = z.infer<typeof kitInformationSchema>;
export type OrderCreation = z.infer<typeof orderCreationSchema>;

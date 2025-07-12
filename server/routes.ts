import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { customerIdentificationSchema, customerRegistrationSchema, orderCreationSchema } from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  // Get all events
  app.get("/api/events", async (req, res) => {
    try {
      const events = await storage.getEvents();
      res.json(events);
    } catch (error) {
      res.status(500).json({ message: "Erro ao buscar eventos" });
    }
  });

  // Get event by ID
  app.get("/api/events/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const event = await storage.getEvent(id);
      
      if (!event) {
        return res.status(404).json({ message: "Evento não encontrado" });
      }
      
      res.json(event);
    } catch (error) {
      res.status(500).json({ message: "Erro ao buscar evento" });
    }
  });

  // Identify customer
  app.post("/api/customers/identify", async (req, res) => {
    try {
      const { cpf, birthDate } = customerIdentificationSchema.parse(req.body);
      
      const customer = await storage.getCustomerByCredentials(cpf, birthDate);
      
      if (!customer) {
        return res.status(404).json({ 
          message: "Cliente não encontrado. Verifique o CPF e data de nascimento.",
          canRegister: true
        });
      }
      
      res.json(customer);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ 
          message: "Dados inválidos",
          errors: error.errors 
        });
      }
      res.status(500).json({ message: "Erro ao identificar cliente" });
    }
  });

  // Register new customer
  app.post("/api/customers/register", async (req, res) => {
    try {
      const registrationData = customerRegistrationSchema.parse(req.body);
      
      // Check if customer already exists
      const existingCustomer = await storage.getCustomerByCredentials(
        registrationData.cpf, 
        registrationData.birthDate
      );
      
      if (existingCustomer) {
        return res.status(409).json({ 
          message: "Cliente já cadastrado com este CPF e data de nascimento" 
        });
      }
      
      // Create customer
      const customer = await storage.createCustomer({
        name: registrationData.name,
        cpf: registrationData.cpf.replace(/\D/g, ''),
        birthDate: registrationData.birthDate,
        email: registrationData.email,
        phone: registrationData.phone
      });
      
      // Create addresses
      const addresses = [];
      for (const addressData of registrationData.addresses) {
        const address = await storage.createAddress({
          customerId: customer.id,
          ...addressData,
          zipCode: addressData.zipCode.replace(/\D/g, '')
        });
        addresses.push(address);
      }
      
      res.json({ customer, addresses });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ 
          message: "Dados inválidos",
          errors: error.errors 
        });
      }
      res.status(500).json({ message: "Erro ao registrar cliente" });
    }
  });

  // Get customer addresses
  app.get("/api/customers/:id/addresses", async (req, res) => {
    try {
      const customerId = parseInt(req.params.id);
      const addresses = await storage.getAddressesByCustomerId(customerId);
      res.json(addresses);
    } catch (error) {
      res.status(500).json({ message: "Erro ao buscar endereços" });
    }
  });

  // Update address
  app.put("/api/addresses/:id", async (req, res) => {
    try {
      const addressId = parseInt(req.params.id);
      const updateData = req.body;
      
      const address = await storage.updateAddress(addressId, updateData);
      res.json(address);
    } catch (error) {
      res.status(500).json({ message: "Erro ao atualizar endereço" });
    }
  });

  // Calculate delivery cost
  app.post("/api/delivery/calculate", async (req, res) => {
    try {
      const { customerId, eventId, kitQuantity } = req.body;
      
      const customer = await storage.getCustomerByCredentials("", "");
      const event = await storage.getEvent(eventId);
      
      if (!customer || !event) {
        return res.status(404).json({ message: "Cliente ou evento não encontrado" });
      }
      
      const baseCost = 33.50;
      const additionalKitCost = 8.00;
      const extraKits = Math.max(0, kitQuantity - 1);
      const totalCost = baseCost + (extraKits * additionalKitCost);
      
      res.json({
        baseCost,
        additionalKitCost,
        extraKits,
        totalCost,
        breakdown: {
          pickup: 15.00,
          delivery: 18.50,
          additionalKits: extraKits * additionalKitCost
        }
      });
    } catch (error) {
      res.status(500).json({ message: "Erro ao calcular entrega" });
    }
  });

  // Create order
  app.post("/api/orders", async (req, res) => {
    try {
      const orderData = orderCreationSchema.parse(req.body);
      
      // Calculate costs
      const baseCost = 33.50;
      const additionalKitCost = 8.00;
      const extraKits = Math.max(0, orderData.kitQuantity - 1);
      const additionalCost = extraKits * additionalKitCost;
      const totalCost = baseCost + additionalCost;
      
      // Create order
      const order = await storage.createOrder({
        eventId: orderData.eventId,
        customerId: orderData.customerId,
        addressId: orderData.addressId,
        kitQuantity: orderData.kitQuantity,
        baseCost: baseCost.toString(),
        additionalCost: additionalCost.toString(),
        totalCost: totalCost.toString(),
        paymentMethod: orderData.paymentMethod,
        status: "confirmed"
      });
      
      // Create kits
      const kits = [];
      for (const kitData of orderData.kits) {
        const kit = await storage.createKit({
          orderId: order.id,
          name: kitData.name,
          cpf: kitData.cpf.replace(/\D/g, ''),
          shirtSize: kitData.shirtSize
        });
        kits.push(kit);
      }
      
      // Get event details for response
      const event = await storage.getEvent(orderData.eventId);
      
      res.json({
        order,
        kits,
        event,
        deliveryEstimate: {
          eventDate: event?.date,
          deliveryDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
        }
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ 
          message: "Dados inválidos",
          errors: error.errors 
        });
      }
      res.status(500).json({ message: "Erro ao criar pedido" });
    }
  });

  // Get order by number
  app.get("/api/orders/:orderNumber", async (req, res) => {
    try {
      const orderNumber = req.params.orderNumber;
      const order = await storage.getOrderByNumber(orderNumber);
      
      if (!order) {
        return res.status(404).json({ message: "Pedido não encontrado" });
      }
      
      const kits = await storage.getKitsByOrderId(order.id);
      const event = await storage.getEvent(order.eventId);
      
      res.json({
        order,
        kits,
        event
      });
    } catch (error) {
      res.status(500).json({ message: "Erro ao buscar pedido" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}

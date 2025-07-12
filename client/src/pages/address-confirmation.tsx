import { Header } from "@/components/header";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertTriangle } from "lucide-react";
import { useLocation, useParams } from "wouter";
import { useEffect, useState } from "react";
import type { Customer } from "@shared/schema";

export default function AddressConfirmation() {
  const [, setLocation] = useLocation();
  const { id } = useParams<{ id: string }>();
  const [customer, setCustomer] = useState<Customer | null>(null);

  useEffect(() => {
    const customerData = sessionStorage.getItem("customerData");
    if (customerData) {
      setCustomer(JSON.parse(customerData));
    } else {
      setLocation(`/events/${id}/identify`);
    }
  }, [id, setLocation]);

  if (!customer) {
    return (
      <div className="max-w-md mx-auto bg-white min-h-screen">
        <Header showBackButton />
        <div className="p-4">
          <p className="text-center text-neutral-600">Carregando...</p>
        </div>
      </div>
    );
  }

  const handleConfirmAddress = () => {
    setLocation(`/events/${id}/cost`);
  };

  const handleContact = () => {
    // In a real app, this would open a contact form or WhatsApp
    alert("Em breve você será redirecionado para nosso atendimento!");
  };

  return (
    <div className="max-w-md mx-auto bg-white min-h-screen">
      <Header showBackButton />
      <div className="p-4">
        <h2 className="text-2xl font-bold text-neutral-800 mb-2">Confirmar Endereço</h2>
        <p className="text-neutral-600 mb-6">Confirme o endereço de entrega cadastrado</p>
        
        <Card className="mb-6">
          <CardContent className="p-4">
            <h3 className="font-semibold text-lg text-neutral-800 mb-3">Endereço de Entrega</h3>
            <div className="space-y-2">
              <p className="text-neutral-800 font-medium">{customer.name}</p>
              <p className="text-neutral-600">{customer.address}</p>
              <p className="text-neutral-600">{customer.neighborhood}</p>
              <p className="text-neutral-600">{customer.city} - {customer.state}</p>
              <p className="text-neutral-600">{customer.zipCode}</p>
            </div>
          </CardContent>
        </Card>
        
        <Alert className="mb-6 border-amber-200 bg-amber-50">
          <AlertTriangle className="h-4 w-4 text-amber-600" />
          <AlertDescription className="text-amber-800">
            <span className="font-medium">Atenção:</span> O endereço não pode ser alterado neste sistema. 
            Caso precise modificar, entre em contato conosco.
          </AlertDescription>
        </Alert>
        
        <div className="space-y-3">
          <Button 
            className="w-full bg-primary text-white hover:bg-primary/90" 
            size="lg"
            onClick={handleConfirmAddress}
          >
            Confirmar Endereço
          </Button>
          
          <Button 
            variant="outline" 
            className="w-full" 
            size="lg"
            onClick={handleContact}
          >
            Entrar em Contato
          </Button>
        </div>
      </div>
    </div>
  );
}

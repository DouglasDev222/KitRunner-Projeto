import { Header } from "@/components/header";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar, MapPin, Users, Truck, Clock, Shield } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { useLocation, useParams } from "wouter";
import { formatDateTime } from "@/lib/brazilian-formatter";
import type { Event } from "@shared/schema";

export default function EventDetails() {
  const [, setLocation] = useLocation();
  const { id } = useParams<{ id: string }>();

  const { data: event, isLoading } = useQuery<Event>({
    queryKey: ["/api/events", id],
  });

  if (isLoading) {
    return (
      <div className="max-w-md mx-auto bg-white min-h-screen">
        <Header showBackButton />
        <div className="p-4">
          <div className="animate-pulse">
            <div className="h-48 bg-gray-200 rounded-lg mb-6" />
            <div className="space-y-4">
              <div className="h-32 bg-gray-200 rounded-lg" />
              <div className="h-32 bg-gray-200 rounded-lg" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="max-w-md mx-auto bg-white min-h-screen">
        <Header showBackButton />
        <div className="p-4">
          <p className="text-center text-neutral-600">Evento não encontrado</p>
        </div>
      </div>
    );
  }

  const handleRequestPickup = () => {
    setLocation(`/events/${id}/identify`);
  };

  return (
    <div className="max-w-md mx-auto bg-white min-h-screen">
      <Header showBackButton />
      <div className="p-4">
        {/* Hero Section */}
        <div className="relative h-48 bg-gradient-to-br from-primary to-secondary rounded-lg mb-6 flex items-center justify-center">
          <div className="text-center text-white">
            <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-2">
              <Users className="w-8 h-8" />
            </div>
            <h2 className="text-xl font-bold">{event.name}</h2>
          </div>
        </div>

        {/* Event Information */}
        <Card className="mb-4">
          <CardContent className="p-4">
            <h3 className="font-semibold text-lg text-neutral-800 mb-3">Informações do Evento</h3>
            <div className="space-y-3">
              <div className="flex items-center">
                <Calendar className="w-5 h-5 text-primary mr-3" />
                <div>
                  <p className="font-medium text-neutral-800">Data</p>
                  <p className="text-neutral-600 text-sm">{formatDateTime(event.date, event.time)}</p>
                </div>
              </div>
              <div className="flex items-center">
                <MapPin className="w-5 h-5 text-primary mr-3" />
                <div>
                  <p className="font-medium text-neutral-800">Local</p>
                  <p className="text-neutral-600 text-sm">
                    {event.location}<br />
                    {event.city} - {event.state}
                  </p>
                </div>
              </div>
              <div className="flex items-center">
                <Users className="w-5 h-5 text-primary mr-3" />
                <div>
                  <p className="font-medium text-neutral-800">Participantes</p>
                  <p className="text-neutral-600 text-sm">{event.participants.toLocaleString('pt-BR')} inscritos</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* KitRunner Service */}
        <Card className="mb-6">
          <CardContent className="p-4">
            <h3 className="font-semibold text-lg text-neutral-800 mb-3">Serviço KitRunner</h3>
            <div className="space-y-3">
              <div className="flex items-start">
                <Truck className="w-5 h-5 text-secondary mr-3 mt-1" />
                <div>
                  <p className="font-medium text-neutral-800">Retirada e Entrega</p>
                  <p className="text-neutral-600 text-sm">Retiramos seu kit no evento e entregamos em sua casa</p>
                </div>
              </div>
              <div className="flex items-start">
                <Clock className="w-5 h-5 text-secondary mr-3 mt-1" />
                <div>
                  <p className="font-medium text-neutral-800">Prazo de Entrega</p>
                  <p className="text-neutral-600 text-sm">Até 2 dias úteis após o evento</p>
                </div>
              </div>
              <div className="flex items-start">
                <Shield className="w-5 h-5 text-secondary mr-3 mt-1" />
                <div>
                  <p className="font-medium text-neutral-800">Segurança</p>
                  <p className="text-neutral-600 text-sm">Identificação segura com CPF e dados pessoais</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Button 
          className="w-full bg-primary text-white hover:bg-primary/90" 
          size="lg"
          onClick={handleRequestPickup}
          disabled={!event.available}
        >
          {event.available ? "Solicitar Retirada do Kit" : "Indisponível"}
        </Button>
      </div>
    </div>
  );
}

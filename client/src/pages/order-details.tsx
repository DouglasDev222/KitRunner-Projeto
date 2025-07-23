import { Header } from "@/components/header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Package, Calendar, MapPin, User, CreditCard } from "lucide-react";
import { useLocation, useParams } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { formatCurrency, formatDate } from "@/lib/brazilian-formatter";
import { formatCPF } from "@/lib/cpf-validator";
import type { Order, Kit, Address, Event } from "@shared/schema";

export default function OrderDetails() {
  const [, setLocation] = useLocation();
  const { orderNumber } = useParams<{ orderNumber: string }>();

  const { data: order, isLoading } = useQuery({
    queryKey: ["order", orderNumber],
    queryFn: async () => {
      const response = await fetch(`/api/orders/${orderNumber}`);
      if (!response.ok) {
        throw new Error("Pedido não encontrado");
      }
      return response.json();
    },
    enabled: !!orderNumber,
  });

  const { data: kits } = useQuery({
    queryKey: ["order-kits", order?.id],
    queryFn: async () => {
      const response = await fetch(`/api/orders/${order.id}/kits`);
      return response.json();
    },
    enabled: !!order?.id,
  });

  if (isLoading) {
    return (
      <div className="max-w-md mx-auto bg-white min-h-screen">
        <Header showBackButton onBack={() => setLocation("/my-orders")} />
        <div className="p-4">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-gray-200 rounded w-3/4" />
            <div className="h-24 bg-gray-200 rounded" />
            <div className="h-32 bg-gray-200 rounded" />
          </div>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="max-w-md mx-auto bg-white min-h-screen">
        <Header showBackButton onBack={() => setLocation("/my-orders")} />
        <div className="p-4 text-center">
          <Package className="w-16 h-16 text-neutral-400 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-neutral-800 mb-2">Pedido não encontrado</h2>
          <p className="text-neutral-600">O pedido solicitado não foi encontrado.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto bg-white min-h-screen">
      <Header showBackButton onBack={() => setLocation("/my-orders")} />
      <div className="p-4">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-bold text-neutral-800">Pedido #{order.orderNumber}</h2>
            <p className="text-sm text-neutral-600">
              {formatDate(order.createdAt.split('T')[0])}
            </p>
          </div>
          <Badge 
            variant="default" 
            className="bg-secondary hover:bg-secondary/80"
          >
            {order.status}
          </Badge>
        </div>

        {/* Event Information */}
        <Card className="mb-4">
          <CardHeader>
            <CardTitle className="text-lg flex items-center">
              <Calendar className="w-5 h-5 mr-2" />
              Evento
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="font-semibold text-neutral-800">{order.event?.name}</p>
            <div className="flex items-center text-sm text-neutral-600 mt-1">
              <Calendar className="w-4 h-4 mr-2" />
              {formatDate(order.event?.date)} às {order.event?.time}
            </div>
            <div className="flex items-center text-sm text-neutral-600 mt-1">
              <MapPin className="w-4 h-4 mr-2" />
              {order.event?.location}, {order.event?.city} - {order.event?.state}
            </div>
          </CardContent>
        </Card>

        {/* Kits Information */}
        <Card className="mb-4">
          <CardHeader>
            <CardTitle className="text-lg flex items-center">
              <Package className="w-5 h-5 mr-2" />
              Kits ({order.kitQuantity})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {kits && kits.length > 0 ? (
              <div className="space-y-3">
                {kits.map((kit: Kit, index: number) => (
                  <div key={kit.id} className="flex items-center justify-between p-3 bg-neutral-50 rounded-lg">
                    <div>
                      <p className="font-medium text-neutral-800">{kit.name}</p>
                      <p className="text-sm text-neutral-600">{formatCPF(kit.cpf)}</p>
                    </div>
                    <Badge variant="outline">{kit.shirtSize}</Badge>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-neutral-600">Nenhum kit encontrado para este pedido.</p>
            )}
          </CardContent>
        </Card>

        {/* Delivery Address */}
        <Card className="mb-4">
          <CardHeader>
            <CardTitle className="text-lg flex items-center">
              <MapPin className="w-5 h-5 mr-2" />
              Endereço de Entrega
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <p className="font-medium text-neutral-800">{order.address?.label}</p>
              <p className="text-sm text-neutral-600">
                {order.address?.street}, {order.address?.number}
                {order.address?.complement && `, ${order.address.complement}`}
              </p>
              <p className="text-sm text-neutral-600">
                {order.address?.neighborhood}, {order.address?.city} - {order.address?.state}
              </p>
              <p className="text-sm text-neutral-600">
                CEP: {order.address?.zipCode}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Payment Information */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center">
              <CreditCard className="w-5 h-5 mr-2" />
              Pagamento
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-neutral-600">Valor base:</span>
                <span className="text-neutral-800">{formatCurrency(parseFloat(order.baseCost))}</span>
              </div>
              {parseFloat(order.additionalCost) > 0 && (
                <div className="flex justify-between items-center">
                  <span className="text-neutral-600">Taxa adicional:</span>
                  <span className="text-neutral-800">{formatCurrency(parseFloat(order.additionalCost))}</span>
                </div>
              )}
              <Separator />
              <div className="flex justify-between items-center">
                <span className="font-semibold text-neutral-800">Total:</span>
                <span className="font-bold text-primary text-lg">
                  {formatCurrency(parseFloat(order.totalCost))}
                </span>
              </div>
              <div className="flex justify-between items-center pt-2">
                <span className="text-neutral-600">Forma de pagamento:</span>
                <Badge variant="outline">{order.paymentMethod}</Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
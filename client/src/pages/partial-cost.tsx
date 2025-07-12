import { Header } from "@/components/header";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Calculator, InfoIcon } from "lucide-react";
import { useLocation, useParams } from "wouter";
import { formatCurrency } from "@/lib/brazilian-formatter";

export default function PartialCost() {
  const [, setLocation] = useLocation();
  const { id } = useParams<{ id: string }>();

  const baseCost = 33.50;
  const pickupCost = 15.00;
  const deliveryCost = 18.50;
  const distance = 12.5;

  const handleContinue = () => {
    setLocation(`/events/${id}/kits`);
  };

  return (
    <div className="max-w-md mx-auto bg-white min-h-screen">
      <Header showBackButton />
      <div className="p-4">
        <h2 className="text-2xl font-bold text-neutral-800 mb-2">Cálculo do Delivery</h2>
        <p className="text-neutral-600 mb-6">Valor calculado com base no seu endereço</p>
        
        <Card className="mb-6">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-lg text-neutral-800">Resumo do Pedido</h3>
              <Calculator className="w-5 h-5 text-primary" />
            </div>
            
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-neutral-600">Retirada do Kit</span>
                <span className="font-semibold text-neutral-800">{formatCurrency(pickupCost)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-neutral-600">Entrega ({distance} km)</span>
                <span className="font-semibold text-neutral-800">{formatCurrency(deliveryCost)}</span>
              </div>
              <div className="border-t pt-3">
                <div className="flex justify-between items-center">
                  <span className="font-semibold text-lg text-neutral-800">Total Parcial</span>
                  <span className="font-bold text-xl text-primary">{formatCurrency(baseCost)}</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Alert className="mb-6 border-blue-200 bg-blue-50">
          <InfoIcon className="h-4 w-4 text-blue-600" />
          <AlertDescription className="text-blue-800">
            <span className="font-medium">Informação:</span> Este é o valor para retirada de 1 kit. 
            O valor final será calculado após informar a quantidade de kits desejada.
          </AlertDescription>
        </Alert>
        
        <Button 
          className="w-full bg-primary text-white hover:bg-primary/90" 
          size="lg"
          onClick={handleContinue}
        >
          Informar Kits para Retirada
        </Button>
      </div>
    </div>
  );
}

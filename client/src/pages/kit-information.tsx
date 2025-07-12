import { Header } from "@/components/header";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useLocation, useParams } from "wouter";
import { useState, useEffect } from "react";
import { z } from "zod";
import { kitInformationSchema, type KitInformation } from "@shared/schema";
import { formatCPF } from "@/lib/cpf-validator";
import { formatCurrency } from "@/lib/brazilian-formatter";

const kitFormSchema = z.object({
  kitQuantity: z.number().min(1).max(5),
  kits: z.array(kitInformationSchema),
});

type KitFormData = z.infer<typeof kitFormSchema>;

export default function KitInformation() {
  const [, setLocation] = useLocation();
  const { id } = useParams<{ id: string }>();
  const [selectedQuantity, setSelectedQuantity] = useState(1);

  const form = useForm<KitFormData>({
    resolver: zodResolver(kitFormSchema),
    defaultValues: {
      kitQuantity: 1,
      kits: [{ name: "", cpf: "", shirtSize: "" as any }],
    },
  });

  const { fields, replace } = useFieldArray({
    control: form.control,
    name: "kits",
  });

  useEffect(() => {
    const newKits = Array.from({ length: selectedQuantity }, () => ({
      name: "",
      cpf: "",
      shirtSize: "" as any,
    }));
    replace(newKits);
    form.setValue("kitQuantity", selectedQuantity);
  }, [selectedQuantity, replace, form]);

  const baseCost = 33.50;
  const additionalKitCost = 8.00;
  const extraKits = Math.max(0, selectedQuantity - 1);
  const totalCost = baseCost + (extraKits * additionalKitCost);

  const onSubmit = (data: KitFormData) => {
    // Store kit data in sessionStorage for next steps
    sessionStorage.setItem("kitData", JSON.stringify(data));
    setLocation(`/events/${id}/payment`);
  };

  const handleCPFChange = (value: string, index: number) => {
    const formatted = formatCPF(value);
    form.setValue(`kits.${index}.cpf`, formatted);
  };

  return (
    <div className="max-w-md mx-auto bg-white min-h-screen">
      <Header showBackButton />
      <div className="p-4">
        <h2 className="text-2xl font-bold text-neutral-800 mb-2">Informações dos Kits</h2>
        <p className="text-neutral-600 mb-6">Informe os dados para cada kit que deseja retirar</p>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            {/* Kit Quantity Selector */}
            <div className="mb-4">
              <Label htmlFor="kitQuantity" className="text-sm font-medium text-neutral-700 mb-2 block">
                Quantidade de Kits
              </Label>
              <Select
                value={selectedQuantity.toString()}
                onValueChange={(value) => setSelectedQuantity(parseInt(value))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione a quantidade" />
                </SelectTrigger>
                <SelectContent>
                  {[1, 2, 3, 4, 5].map((num) => (
                    <SelectItem key={num} value={num.toString()}>
                      {num} Kit{num > 1 ? 's' : ''}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Kit Forms */}
            <div className="space-y-4">
              {fields.map((field, index) => (
                <Card key={field.id}>
                  <CardContent className="p-4">
                    <h3 className="font-semibold text-lg text-neutral-800 mb-3">Kit {index + 1}</h3>
                    <div className="space-y-3">
                      <FormField
                        control={form.control}
                        name={`kits.${index}.name`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Nome Completo</FormLabel>
                            <FormControl>
                              <Input placeholder="Nome do atleta" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name={`kits.${index}.cpf`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>CPF</FormLabel>
                            <FormControl>
                              <Input
                                placeholder="000.000.000-00"
                                {...field}
                                onChange={(e) => handleCPFChange(e.target.value, index)}
                                maxLength={14}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name={`kits.${index}.shirtSize`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Tamanho da Camiseta</FormLabel>
                            <Select onValueChange={field.onChange} value={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Selecione o tamanho" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="PP">PP</SelectItem>
                                <SelectItem value="P">P</SelectItem>
                                <SelectItem value="M">M</SelectItem>
                                <SelectItem value="G">G</SelectItem>
                                <SelectItem value="GG">GG</SelectItem>
                                <SelectItem value="XGG">XGG</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Cost Summary */}
            <Card className="mt-6">
              <CardContent className="p-4">
                <h3 className="font-semibold text-lg text-neutral-800 mb-3">Resumo do Pedido</h3>
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-neutral-600">Retirada e Entrega (1 kit)</span>
                    <span className="font-semibold text-neutral-800">{formatCurrency(baseCost)}</span>
                  </div>
                  {extraKits > 0 && (
                    <div className="flex justify-between items-center">
                      <span className="text-neutral-600">Kits adicionais ({extraKits} x {formatCurrency(additionalKitCost)})</span>
                      <span className="font-semibold text-neutral-800">{formatCurrency(extraKits * additionalKitCost)}</span>
                    </div>
                  )}
                  <div className="border-t pt-3">
                    <div className="flex justify-between items-center">
                      <span className="font-semibold text-lg text-neutral-800">Total</span>
                      <span className="font-bold text-xl text-primary">{formatCurrency(totalCost)}</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Button 
              type="submit"
              className="w-full bg-primary text-white hover:bg-primary/90 mt-6" 
              size="lg"
            >
              Continuar para Pagamento
            </Button>
          </form>
        </Form>
      </div>
    </div>
  );
}

import { useState, useEffect } from "react";
import { useParams, useLocation } from "wouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { AdminLayout } from "@/components/admin-layout";
import { AdminAuth } from "@/components/admin-auth";
import { ArrowLeft, Save } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import type { Event } from "@shared/schema";

const eventSchema = z.object({
  name: z.string().min(1, "Nome é obrigatório"),
  date: z.string().min(1, "Data é obrigatória"),
  time: z.string().min(1, "Horário é obrigatório"),
  location: z.string().min(1, "Local é obrigatório"),
  city: z.string().min(1, "Cidade é obrigatória"),
  state: z.string().min(1, "Estado é obrigatório"),
  description: z.string().optional(),
  maxParticipants: z.number().min(1, "Máximo de participantes deve ser maior que 0"),
  available: z.boolean(),
  fixedPrice: z.number().optional(),
  donationRequired: z.boolean(),
  donationDescription: z.string().optional(),
  couponCode: z.string().optional(),
  couponDiscount: z.number().optional(),
});

type EventFormData = z.infer<typeof eventSchema>;

export default function AdminEventEdit() {
  const { id } = useParams();
  const [, setLocation] = useLocation();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  useEffect(() => {
    const authStatus = localStorage.getItem("adminAuthenticated");
    setIsAuthenticated(authStatus === "true");
  }, []);

  const { data: event, isLoading } = useQuery({
    queryKey: ["admin", "event", id],
    queryFn: async () => {
      const response = await fetch(`/api/admin/events/${id}`);
      if (!response.ok) throw new Error("Erro ao carregar evento");
      return response.json();
    },
    enabled: !!id,
  });

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
    reset,
  } = useForm<EventFormData>({
    resolver: zodResolver(eventSchema),
  });

  const donationRequired = watch("donationRequired");

  useEffect(() => {
    if (event) {
      reset({
        name: event.name,
        date: event.date.split('T')[0], // Convert to YYYY-MM-DD format
        time: event.time,
        location: event.location,
        city: event.city,
        state: event.state,
        description: event.description || "",
        maxParticipants: event.maxParticipants,
        available: event.available,
        fixedPrice: event.fixedPrice ? Number(event.fixedPrice) : undefined,
        donationRequired: event.donationRequired,
        donationDescription: event.donationDescription || "",
        couponCode: event.couponCode || "",
        couponDiscount: event.couponDiscount ? Number(event.couponDiscount) : undefined,
      });
    }
  }, [event, reset]);

  const updateEventMutation = useMutation({
    mutationFn: async (data: EventFormData) => {
      const response = await fetch(`/api/admin/events/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error("Erro ao atualizar evento");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "events"] });
      queryClient.invalidateQueries({ queryKey: ["admin", "event", id] });
      toast({
        title: "Sucesso",
        description: "Evento atualizado com sucesso!",
      });
      setLocation("/admin/events");
    },
    onError: () => {
      toast({
        title: "Erro",
        description: "Erro ao atualizar evento",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: EventFormData) => {
    updateEventMutation.mutate(data);
  };

  if (!isAuthenticated) {
    return <AdminAuth onAuthenticated={() => setIsAuthenticated(true)} />;
  }

  if (isLoading) {
    return (
      <AdminLayout>
        <div className="space-y-4">
          <div className="h-8 bg-gray-200 animate-pulse rounded"></div>
          <div className="h-96 bg-gray-200 animate-pulse rounded"></div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="flex items-center gap-4 mb-6">
        <Button
          variant="ghost"
          onClick={() => setLocation("/admin/events")}
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Voltar
        </Button>
        <div>
          <h1 className="text-3xl font-bold text-neutral-800">Editar Evento</h1>
          <p className="text-neutral-600">Modifique as informações do evento</p>
        </div>
      </div>

      <Card className="max-w-4xl">
        <CardHeader>
          <CardTitle>Informações do Evento</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Basic Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Nome do Evento *</Label>
                <Input
                  id="name"
                  {...register("name")}
                  placeholder="Ex: Maratona de São Paulo 2024"
                />
                {errors.name && (
                  <p className="text-sm text-red-600">{errors.name.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="maxParticipants">Máximo de Participantes *</Label>
                <Input
                  id="maxParticipants"
                  type="number"
                  {...register("maxParticipants", { valueAsNumber: true })}
                  placeholder="1000"
                />
                {errors.maxParticipants && (
                  <p className="text-sm text-red-600">{errors.maxParticipants.message}</p>
                )}
              </div>
            </div>

            {/* Date and Time */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="date">Data *</Label>
                <Input
                  id="date"
                  type="date"
                  {...register("date")}
                />
                {errors.date && (
                  <p className="text-sm text-red-600">{errors.date.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="time">Horário *</Label>
                <Input
                  id="time"
                  type="time"
                  {...register("time")}
                />
                {errors.time && (
                  <p className="text-sm text-red-600">{errors.time.message}</p>
                )}
              </div>
            </div>

            {/* Location */}
            <div className="space-y-2">
              <Label htmlFor="location">Local *</Label>
              <Input
                id="location"
                {...register("location")}
                placeholder="Ex: Parque do Ibirapuera"
              />
              {errors.location && (
                <p className="text-sm text-red-600">{errors.location.message}</p>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="city">Cidade *</Label>
                <Input
                  id="city"
                  {...register("city")}
                  placeholder="São Paulo"
                />
                {errors.city && (
                  <p className="text-sm text-red-600">{errors.city.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="state">Estado *</Label>
                <Input
                  id="state"
                  {...register("state")}
                  placeholder="SP"
                />
                {errors.state && (
                  <p className="text-sm text-red-600">{errors.state.message}</p>
                )}
              </div>
            </div>

            {/* Description */}
            <div className="space-y-2">
              <Label htmlFor="description">Descrição</Label>
              <Textarea
                id="description"
                {...register("description")}
                placeholder="Descrição detalhada do evento..."
                rows={4}
              />
            </div>

            {/* Pricing */}
            <div className="space-y-2">
              <Label htmlFor="fixedPrice">Preço Fixo (R$)</Label>
              <Input
                id="fixedPrice"
                type="number"
                step="0.01"
                {...register("fixedPrice", { valueAsNumber: true })}
                placeholder="0.00"
              />
              <p className="text-sm text-neutral-600">
                Deixe em branco para usar cálculo dinâmico baseado na distância
              </p>
            </div>

            {/* Donation */}
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <Switch
                  id="donationRequired"
                  {...register("donationRequired")}
                  onCheckedChange={(checked) => setValue("donationRequired", checked)}
                />
                <Label htmlFor="donationRequired">Doação Obrigatória</Label>
              </div>

              {donationRequired && (
                <div className="space-y-2">
                  <Label htmlFor="donationDescription">Descrição da Doação</Label>
                  <Textarea
                    id="donationDescription"
                    {...register("donationDescription")}
                    placeholder="Ex: 1kg de alimento não perecível"
                    rows={2}
                  />
                </div>
              )}
            </div>

            {/* Coupon */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="couponCode">Código do Cupom</Label>
                <Input
                  id="couponCode"
                  {...register("couponCode")}
                  placeholder="DESCONTO10"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="couponDiscount">Desconto (%)</Label>
                <Input
                  id="couponDiscount"
                  type="number"
                  step="0.01"
                  {...register("couponDiscount", { valueAsNumber: true })}
                  placeholder="10.00"
                />
              </div>
            </div>

            {/* Availability */}
            <div className="flex items-center space-x-2">
              <Switch
                id="available"
                {...register("available")}
                onCheckedChange={(checked) => setValue("available", checked)}
              />
              <Label htmlFor="available">Evento Disponível</Label>
            </div>

            {/* Submit Button */}
            <div className="flex justify-end gap-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setLocation("/admin/events")}
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                disabled={updateEventMutation.isPending}
              >
                <Save className="w-4 h-4 mr-2" />
                {updateEventMutation.isPending ? "Salvando..." : "Salvar Alterações"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </AdminLayout>
  );
}


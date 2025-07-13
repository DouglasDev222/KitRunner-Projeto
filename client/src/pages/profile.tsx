import { Header } from "@/components/header";
import { Button } from "@/components/ui/button";
import { User, Package, LogOut } from "lucide-react";
import { useLocation } from "wouter";

export default function Profile() {
  const [, setLocation] = useLocation();

  const handleLogout = () => {
    // Clear any session data
    sessionStorage.clear();
    setLocation("/");
  };

  return (
    <div className="max-w-md mx-auto bg-white min-h-screen">
      <Header showBackButton onBack={() => setLocation("/")} />
      <div className="p-4">
        <div className="flex items-center mb-6">
          <User className="w-8 h-8 text-primary mr-3" />
          <h2 className="text-2xl font-bold text-neutral-800">Perfil</h2>
        </div>

        <div className="space-y-4">
          <Button
            variant="outline"
            className="w-full flex items-center justify-start gap-3 h-12"
            onClick={() => setLocation("/my-orders")}
          >
            <Package className="w-5 h-5" />
            <span>Meus Pedidos</span>
          </Button>

          <Button
            variant="outline"
            className="w-full flex items-center justify-start gap-3 h-12 text-red-600 border-red-200 hover:bg-red-50"
            onClick={handleLogout}
          >
            <LogOut className="w-5 h-5" />
            <span>Sair</span>
          </Button>
        </div>

        <div className="mt-8 p-4 bg-gray-50 rounded-lg">
          <h3 className="font-semibold text-neutral-800 mb-2">Sobre o KitRunner</h3>
          <p className="text-sm text-neutral-600">
            Sistema de gerenciamento de retirada e entrega de kits para eventos esportivos.
          </p>
        </div>
      </div>
    </div>
  );
}
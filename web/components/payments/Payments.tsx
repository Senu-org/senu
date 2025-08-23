import { PaymentsHeader } from './PaymentsHeader';
import { PaymentsHero } from './PaymentsHero';
import { CleanPaymentMethods } from './CleanPaymentMethods';

export function Payments() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-gray-100 to-gray-200">
      {/* Header y Hero en la parte superior */}
      <div className="container mx-auto px-4 py-8 md:py-12 lg:py-16">
        <PaymentsHeader />
        <PaymentsHero />
      </div>
      
      {/* Selector de métodos de pago estilo móvil nativo */}
      <div className="flex-1 flex items-center justify-center px-4 pb-8">
        <CleanPaymentMethods />
      </div>
      
      {/* Información de seguridad básica */}
      <div className="container mx-auto px-4 pb-8">
        <div className="text-center text-gray-600">
          <p className="text-sm">🔒 Todos los pagos están protegidos con encriptación SSL de 256 bits</p>
        </div>
      </div>
    </main>
  );
}

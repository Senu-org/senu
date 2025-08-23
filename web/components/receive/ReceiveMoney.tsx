import { ReceiveHeader } from './ReceiveHeader';
import { ReceiveHero } from './ReceiveHero';
import { ReceiveMethods } from './ReceiveMethods';

export function ReceiveMoney() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-gray-100 to-gray-200">
      {/* Header y Hero en la parte superior */}
      <div className="container mx-auto px-4 py-8 md:py-12 lg:py-16">
        <ReceiveHeader />
        <ReceiveHero />
      </div>
      
      {/* Selector de métodos para recibir dinero */}
      <div className="flex-1 flex items-center justify-center px-4 pb-8">
        <ReceiveMethods />
      </div>
      
      {/* Información de seguridad básica */}
      <div className="container mx-auto px-4 pb-8">
        <div className="text-center text-gray-600">
          <p className="text-sm">🔒 Todas las transferencias están protegidas con encriptación SSL de 256 bits</p>
        </div>
      </div>
    </main>
  );
}

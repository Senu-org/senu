import { config } from '@/lib/config/env';
import Link from 'next/link';

export function HomeHero() {
  return (
    <div className="space-y-8">
      {/* iOS-style header text */}
      <div className="text-center px-4">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-3 tracking-tight">
          Envía Dinero por WhatsApp
        </h1>
        <h2 className="text-lg md:text-xl font-semibold text-gray-900 mb-4">
          Rápido, Fácil y Transparente
        </h2>
        <p className="text-base text-gray-600 leading-relaxed max-w-sm mx-auto">
          Envía dinero a tus contactos tan fácil como mandar un mensaje. La forma más transparente y conveniente de enviar remesas entre Costa Rica y Nicaragua. Sin comisiones ocultas, sin salir de WhatsApp.
        </p>
      </div>

      {/* iOS-style WhatsApp button */}
      <div className="px-4">
        <a
          href={config.whatsapp.getWhatsAppUrl("Hola, quiero enviar una remesa")}
          target="_blank"
          rel="noopener noreferrer"
          className="w-full flex items-center justify-center px-6 py-4 bg-green-500 active:bg-green-600 text-white font-semibold rounded-2xl shadow-lg active:shadow-md transform active:scale-95 transition-all duration-150"
        >
          <svg className="w-6 h-6 mr-3" fill="currentColor" viewBox="0 0 24 24">
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.488"/>
          </svg>
          Ir a WhatsApp
        </a>
      </div>

      {/* iOS-style transaction card */}
      <div className="px-4 mt-8">
        <div className="bg-white rounded-3xl shadow-lg border border-gray-100 overflow-hidden">
          {/* Card header */}
          <div className="px-6 py-4 border-b border-gray-100">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-gradient-to-br from-green-400 to-green-500 rounded-2xl flex items-center justify-center shadow-sm">
                <span className="text-white font-bold text-lg">$</span>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Senu</h3>
                <p className="text-sm text-gray-500">Transferencias Instantáneas</p>
              </div>
            </div>
          </div>
          
          {/* Transaction amount */}
          <div className="px-6 py-8 text-center">
            <div className="text-4xl font-bold text-gray-900 mb-2">$100.00</div>
            <div className="text-base text-gray-600 mb-4">Costa Rica → Nicaragua</div>
            
            {/* iOS-style status indicator */}
            <div className="inline-flex items-center px-3 py-1 bg-green-100 rounded-full">
              <div className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse"></div>
              <span className="text-sm font-medium text-green-700">Procesando...</span>
            </div>
          </div>
          
          {/* Bottom section */}
          <div className="px-6 py-4 bg-gray-50">
            <div className="text-center text-sm text-gray-500">
              💡 Comparte esta información con la persona que te va a enviar dinero
            </div>
          </div>
        </div>
      </div>
      
      {/* Floating currency indicators */}
      <div className="relative px-4 mt-6">
        <div className="flex justify-center space-x-4">
          <div className="flex items-center space-x-2 px-3 py-2 bg-white rounded-full shadow-md">
            <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
              <span className="text-white text-xs font-bold">$</span>
            </div>
            <span className="text-sm font-medium text-gray-700">USD</span>
          </div>
          <div className="flex items-center space-x-2 px-3 py-2 bg-white rounded-full shadow-md">
            <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
              <span className="text-white text-xs font-bold">₡</span>
            </div>
            <span className="text-sm font-medium text-gray-700">CRC</span>
          </div>
          <div className="flex items-center space-x-2 px-3 py-2 bg-white rounded-full shadow-md">
            <div className="w-6 h-6 bg-yellow-500 rounded-full flex items-center justify-center">
              <span className="text-white text-xs font-bold">C$</span>
            </div>
            <span className="text-sm font-medium text-gray-700">NIO</span>
          </div>
        </div>
      </div>
    </div>
  );
}

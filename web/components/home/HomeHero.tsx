import { config } from '@/lib/config/env';
import Link from 'next/link';

export function HomeHero() {
  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex flex-col lg:grid lg:grid-cols-2 gap-8 md:gap-10 lg:gap-12 items-center">
        {/* Left Content */}
        <div className="text-center lg:text-left">
          <div className="flex items-center justify-center lg:justify-start mb-4 md:mb-6">
            <img 
              src="/senu.png" 
              alt="Senu" 
              className="w-12 h-12 md:w-16 md:h-16 mr-3 md:mr-4"
            />
            <h2 className="text-2xl md:text-3xl lg:text-4xl xl:text-5xl font-bold text-gray-800 leading-tight">
              Senu
            </h2>
          </div>
          <h3 className="text-lg md:text-xl lg:text-2xl text-gray-700 mb-4 md:mb-6 font-medium">
            Envía Dinero por WhatsApp - Rápido, Fácil y Transparente
          </h3>
          <p className="text-base md:text-lg text-gray-600 mb-6 md:mb-8 leading-relaxed">
            Envía dinero a tus contactos tan fácil como mandar un mensaje. La forma más transparente y conveniente de enviar remesas entre Costa Rica y Nicaragua. Sin comisiones ocultas, sin salir de WhatsApp.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 items-center">
            <a
              href={config.whatsapp.getWhatsAppUrl("Hola, quiero enviar una remesa")}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center px-6 py-3 md:px-8 md:py-4 bg-green-500 hover:bg-green-600 text-white font-semibold rounded-lg transition-colors duration-200"
            >
              <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 24 24">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.488"/>
              </svg>
              Ir a WhatsApp
            </a>
          </div>
        </div>

        {/* Right Image - Modern Financial Illustration */}
        <div className="flex justify-center mt-8 lg:mt-0">
          <div className="relative w-full max-w-lg pb-16">
            
            {/* Main Visual Container */}
            <div className="relative">
              
              {/* Central Phone/Card */}
              <div className="relative mx-auto w-64 h-96 bg-gradient-to-br from-white to-gray-50 rounded-3xl shadow-2xl border border-gray-200 overflow-hidden">
                
                {/* Phone Screen Glow */}
                <div className="absolute inset-2 bg-gradient-to-br from-blue-500/10 to-green-500/10 rounded-2xl"></div>
                
                {/* Content Area */}
                <div className="relative p-6 h-full flex flex-col justify-between py-8">
                  
                  {/* Top Section - Senu Branding */}
                  <div className="text-center">
                    <div className="w-16 h-16 mx-auto mb-4 bg-white rounded-2xl flex items-center justify-center shadow-lg border border-gray-100">
                      <img 
                        src="/senu.png" 
                        alt="Senu" 
                        className="w-12 h-12 object-contain"
                      />
                    </div>
                    <h3 className="text-xl font-bold text-gray-800 mb-2">Senu</h3>
                    <p className="text-sm text-gray-500">Transferencias Instantáneas</p>
                  </div>

                  {/* Middle Section - Transaction Display */}
                  <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-2xl p-4 border border-green-100">
                    <div className="text-center">
                      <div className="text-3xl font-bold text-gray-800 mb-1">$100.00</div>
                      <div className="text-sm text-gray-600 mb-3">Costa Rica → Nicaragua</div>
                      <div className="flex items-center justify-center space-x-2">
                        <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                        <span className="text-xs text-green-600 font-medium">Procesando...</span>
                      </div>
                    </div>
                  </div>

                  {/* Bottom Section - WhatsApp Integration */}
                  <div className="flex items-center justify-center space-x-2 bg-green-500 rounded-xl py-3 px-4">
                    <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347"/>
                    </svg>
                    <span className="text-white font-medium text-sm">WhatsApp</span>
                  </div>
                </div>
              </div>

              {/* Floating Money Icons */}
              <div className="absolute -top-6 -left-6 w-12 h-12 bg-green-400 rounded-full flex items-center justify-center shadow-lg animate-bounce">
                <span className="text-white font-bold text-lg">$</span>
              </div>
              
              <div className="absolute -top-2 -right-10 w-8 h-8 bg-blue-400 rounded-full flex items-center justify-center shadow-lg animate-bounce delay-300">
                <span className="text-white font-bold text-sm">₡</span>
              </div>
              
              <div className="absolute -bottom-6 -right-6 w-10 h-10 bg-yellow-400 rounded-full flex items-center justify-center shadow-lg animate-bounce delay-700">
                <span className="text-white font-bold">C$</span>
              </div>

              {/* Connection Lines */}
              <div className="absolute top-1/2 -left-16 w-12 h-0.5 bg-gradient-to-r from-transparent to-green-400 transform -translate-y-1/2"></div>
              <div className="absolute top-1/2 -right-16 w-12 h-0.5 bg-gradient-to-l from-transparent to-blue-400 transform -translate-y-1/2"></div>

              {/* Speed Indicators */}
              <div className="absolute top-1/4 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                <div className="flex space-x-1">
                  <div className="w-1 h-4 bg-green-400 rounded animate-pulse"></div>
                  <div className="w-1 h-6 bg-green-500 rounded animate-pulse delay-100"></div>
                  <div className="w-1 h-8 bg-green-600 rounded animate-pulse delay-200"></div>
                  <div className="w-1 h-6 bg-green-500 rounded animate-pulse delay-300"></div>
                  <div className="w-1 h-4 bg-green-400 rounded animate-pulse delay-400"></div>
                </div>
              </div>

              {/* Background Geometric Shapes */}
              <div className="absolute -z-10 top-0 left-0 w-32 h-32 bg-gradient-to-br from-blue-100 to-transparent rounded-full opacity-50"></div>
              <div className="absolute -z-10 bottom-0 right-0 w-40 h-40 bg-gradient-to-tl from-green-100 to-transparent rounded-full opacity-50"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

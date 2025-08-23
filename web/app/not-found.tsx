import Link from 'next/link';
import { config } from '@/lib/config/env';

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-blue-100">
      <div className="text-center max-w-md mx-auto px-4">
        <div className="bg-blue-100 rounded-full w-24 h-24 flex items-center justify-center mx-auto mb-8">
          <span className="text-4xl font-bold text-blue-600">404</span>
        </div>
        
        <h1 className="text-3xl font-bold text-gray-900 mb-4">
          Página No Encontrada
        </h1>
        
        <p className="text-gray-600 mb-8">
          Lo sentimos, la página que buscas no existe o ha sido movida.
        </p>
        
        <div className="space-y-4">
          <Link
            href="/"
            className="inline-block px-8 py-3 bg-green-500 hover:bg-green-600 text-white font-semibold rounded-lg transition-colors duration-200"
          >
            Volver al Inicio
          </Link>
          
          <div className="text-sm text-gray-500">
            ¿Necesitas ayuda?{' '}
            <a
              href={config.whatsapp.getWhatsAppUrl("Hola, necesito ayuda")}
              target="_blank"
              rel="noopener noreferrer"
              className="text-green-600 hover:underline"
            >
              Contáctanos por WhatsApp
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

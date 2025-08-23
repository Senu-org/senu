import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      <div className="text-center max-w-md mx-auto px-4">
        <div className="bg-blue-100 dark:bg-blue-900 rounded-full w-24 h-24 flex items-center justify-center mx-auto mb-8">
          <span className="text-4xl font-bold text-blue-600 dark:text-blue-400">404</span>
        </div>
        
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
          Página no encontrada
        </h1>
        
        <p className="text-gray-600 dark:text-gray-300 mb-8">
          Lo sentimos, la página que buscas no existe o ha sido movida.
        </p>
        
        <div className="space-y-4">
          <Link
            href="/"
            className="inline-block px-8 py-3 bg-green-500 hover:bg-green-600 text-white font-semibold rounded-lg transition-colors duration-200"
          >
            Volver al inicio
          </Link>
          
          <div className="text-sm text-gray-500 dark:text-gray-400">
            ¿Necesitas ayuda?{' '}
            <a
              href="https://wa.me/50688888888?text=Hola,%20necesito%20ayuda"
              target="_blank"
              rel="noopener noreferrer"
              className="text-green-600 dark:text-green-400 hover:underline"
            >
              Contáctanos por WhatsApp
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

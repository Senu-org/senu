'use client';

import { useEffect } from 'react';
import Link from 'next/link';

export default function OfflinePage() {
  useEffect(() => {
    // Listener para detectar cuando vuelve la conexión
    const handleOnline = () => {
      window.location.reload();
    };

    window.addEventListener('online', handleOnline);
    
    // Verificar conexión cada 5 segundos
    const intervalId = setInterval(() => {
      if (navigator.onLine) {
        window.location.reload();
      }
    }, 5000);

    return () => {
      window.removeEventListener('online', handleOnline);
      clearInterval(intervalId);
    };
  }, []);
  return (
    <div className="min-h-screen bg-white flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center">
        {/* Icono de sin conexión */}
        <div className="mb-8">
          <svg 
            className="mx-auto h-24 w-24 text-gray-400" 
            fill="none" 
            viewBox="0 0 24 24" 
            stroke="currentColor"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={1.5} 
              d="M18.364 5.636l-12.728 12.728m0 0L5.636 18.364m12.728-12.728L18.364 18.364M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" 
            />
          </svg>
        </div>

        {/* Título */}
        <h1 className="text-3xl font-bold text-gray-900 mb-4">
          Sin Conexión
        </h1>

        {/* Descripción */}
        <p className="text-lg text-gray-600 mb-8">
          No tienes conexión a internet. Algunas funciones pueden no estar disponibles.
        </p>

        {/* Información sobre funcionalidad offline */}
        <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4 mb-8">
          <h2 className="text-sm font-semibold text-emerald-800 mb-2">
            ¿Qué puedes hacer sin conexión?
          </h2>
          <ul className="text-sm text-emerald-700 space-y-1">
            <li>• Ver información previamente cargada</li>
            <li>• Navegar por las páginas ya visitadas</li>
            <li>• Preparar transacciones (se enviarán cuando vuelvas a conectarte)</li>
          </ul>
        </div>

        {/* Botones de acción */}
        <div className="space-y-4">
          <button
            onClick={() => window.location.reload()}
            className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-medium py-3 px-6 rounded-lg transition-colors duration-200"
          >
            Reintentar Conexión
          </button>

          <button
            onClick={() => window.history.back()}
            className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium py-3 px-6 rounded-lg transition-colors duration-200"
          >
            Volver Atrás
          </button>

          <Link
            href="/"
            className="block w-full bg-white hover:bg-gray-50 text-emerald-600 font-medium py-3 px-6 rounded-lg border border-emerald-600 transition-colors duration-200"
          >
            Ir al Inicio
          </Link>
        </div>

        {/* Estado de conexión */}
        <div className="mt-8 pt-6 border-t border-gray-200">
          <div className="flex items-center justify-center space-x-2">
            <div className="h-2 w-2 bg-red-500 rounded-full animate-pulse"></div>
            <span className="text-sm text-gray-500">Sin conexión a internet</span>
          </div>
        </div>


      </div>
    </div>
  );
}

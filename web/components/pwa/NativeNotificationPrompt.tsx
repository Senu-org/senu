'use client';

import { useEffect, useState } from 'react';

interface NativeNotificationPromptProps {
  isVisible: boolean;
  onAllow: () => void;
  onDeny: () => void;
  isLoading?: boolean;
}

export function NativeNotificationPrompt({ 
  isVisible, 
  onAllow, 
  onDeny, 
  isLoading = false 
}: NativeNotificationPromptProps) {
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    if (isVisible) {
      setIsAnimating(true);
    }
  }, [isVisible]);

  if (!isVisible) return null;

  return (
    <>
      {/* Backdrop con blur */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div 
          className="absolute inset-0 bg-black bg-opacity-40 backdrop-blur-sm"
          onClick={onDeny}
        />
        
        {/* Modal estilo iOS */}
        <div 
          className={`
            relative bg-white rounded-3xl shadow-2xl max-w-xs w-full mx-4 overflow-hidden
            transform transition-all duration-300 ease-out
            ${isAnimating ? 'scale-100 opacity-100' : 'scale-95 opacity-0'}
          `}
          style={{
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25), 0 0 0 1px rgba(255, 255, 255, 0.1)'
          }}
        >
          {/* Icono de la app */}
          <div className="flex items-center justify-center pt-8 pb-4">
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center shadow-lg">
              <svg className="w-10 h-10 text-white" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
              </svg>
            </div>
          </div>
          
          {/* Contenido */}
          <div className="px-6 pb-6 text-center">
            <h2 className="text-lg font-semibold text-gray-900 mb-2 leading-tight">
              &ldquo;Senu&rdquo; quiere enviarte notificaciones
            </h2>
            <p className="text-sm text-gray-600 mb-8 leading-relaxed px-2">
              Las notificaciones pueden incluir alertas, sonidos e insignias de iconos. Estas se pueden configurar en Ajustes.
            </p>
            
            {/* Separador */}
            <div className="border-t border-gray-200 -mx-6 mb-0"></div>
            
            {/* Botones estilo iOS */}
            <div className="flex -mx-6">
              <button
                onClick={onDeny}
                disabled={isLoading}
                className="flex-1 py-4 text-blue-500 hover:bg-gray-50 active:bg-gray-100 transition-colors duration-150 font-medium text-base disabled:opacity-50"
              >
                No permitir
              </button>
              
              <div className="w-px bg-gray-200"></div>
              
              <button
                onClick={onAllow}
                disabled={isLoading}
                className="flex-1 py-4 text-blue-500 hover:bg-gray-50 active:bg-gray-100 transition-colors duration-150 font-semibold text-base disabled:opacity-50"
              >
                {isLoading ? (
                  <div className="flex items-center justify-center space-x-2">
                    <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                    <span>Permitir</span>
                  </div>
                ) : (
                  'Permitir'
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

// Componente para Android Material Design
export function MaterialNotificationPrompt({ 
  isVisible, 
  onAllow, 
  onDeny, 
  isLoading = false 
}: NativeNotificationPromptProps) {
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    if (isVisible) {
      setIsAnimating(true);
    }
  }, [isVisible]);

  if (!isVisible) return null;

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div 
          className="absolute inset-0 bg-black bg-opacity-60"
          onClick={onDeny}
        />
        
        {/* Modal estilo Material */}
        <div 
          className={`
            relative bg-white rounded-lg shadow-2xl max-w-sm w-full mx-4 overflow-hidden
            transform transition-all duration-300 ease-out
            ${isAnimating ? 'scale-100 opacity-100 translate-y-0' : 'scale-95 opacity-0 translate-y-4'}
          `}
        >
          {/* Contenido */}
          <div className="p-6">
            <div className="flex items-start space-x-4">
              {/* Icono */}
              <div className="flex-shrink-0">
                <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center">
                  <svg className="w-6 h-6 text-emerald-600" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 22c1.1 0 2-.9 2-2h-4c0 1.1.89 2 2 2zm6-6v-5c0-3.07-1.64-5.64-4.5-6.32V4c0-.83-.67-1.5-1.5-1.5s-1.5.67-1.5 1.5v.68C7.63 5.36 6 7.92 6 11v5l-2 2v1h16v-1l-2-2z"/>
                  </svg>
                </div>
              </div>
              
              {/* Texto */}
              <div className="flex-1 min-w-0">
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Permitir notificaciones
                </h3>
                <p className="text-sm text-gray-600 leading-relaxed">
                  Senu quiere enviarte notificaciones sobre el estado de tus transacciones y actualizaciones importantes.
                </p>
              </div>
            </div>
          </div>
          
          {/* Botones */}
          <div className="flex justify-end space-x-2 px-6 pb-6">
            <button
              onClick={onDeny}
              disabled={isLoading}
              className="px-4 py-2 text-emerald-600 hover:bg-emerald-50 rounded font-medium text-sm transition-colors duration-150 disabled:opacity-50"
            >
              DENEGAR
            </button>
            <button
              onClick={onAllow}
              disabled={isLoading}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded font-medium text-sm transition-colors duration-150 disabled:opacity-50"
            >
              {isLoading ? (
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>PERMITIR</span>
                </div>
              ) : (
                'PERMITIR'
              )}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

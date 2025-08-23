'use client';

import { useState } from 'react';

interface PaymentMethod {
  id: string;
  name: string;
  icon: string;
  available: boolean;
}

const paymentMethods: PaymentMethod[] = [
  {
    id: 'card',
    name: 'Tarjeta de Crédito/Débito',
    icon: '💳',
    available: true,
  },
  {
    id: 'bank',
    name: 'Transferencia Bancaria',
    icon: '🏦',
    available: true
  },
  {
    id: 'crypto',
    name: 'Criptomonedas',
    icon: '₿',
    available: true
  }
];

export function CleanPaymentMethods() {
  const [expandedMethod, setExpandedMethod] = useState<string | null>(null);

  const handleMethodClick = (methodId: string) => {
    setExpandedMethod(expandedMethod === methodId ? null : methodId);
  };

  const CreditCardForm = () => (
    <div className="p-4 bg-gray-50 border-t border-gray-200 space-y-4">
      <div className="space-y-3">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Número de Tarjeta
          </label>
          <input
            type="text"
            placeholder="1234 5678 9012 3456"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Fecha de Vencimiento
            </label>
            <input
              type="text"
              placeholder="MM/AA"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              CVV
            </label>
            <input
              type="text"
              placeholder="123"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Nombre en la Tarjeta
          </label>
          <input
            type="text"
            placeholder="Juan Pérez"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </div>
      <button className="w-full py-3 bg-blue-500 hover:bg-blue-600 text-white font-semibold rounded-lg transition-colors">
        Procesar Pago con Tarjeta
      </button>
    </div>
  );

  const BankTransferCTA = () => (
    <div className="p-4 bg-gray-50 border-t border-gray-200 space-y-4">
      <div className="text-center">
        <h4 className="font-semibold text-gray-800 mb-2">Transferencia Bancaria</h4>
        <p className="text-sm text-gray-600 mb-4">
          Te enviaremos los datos bancarios para completar la transferencia
        </p>
      </div>
      <button className="w-full py-3 bg-green-500 hover:bg-green-600 text-white font-semibold rounded-lg transition-colors">
        Obtener Datos Bancarios
      </button>
    </div>
  );

  const CryptoCTA = () => (
    <div className="p-4 bg-gray-50 border-t border-gray-200 space-y-4">
      <div className="text-center">
        <h4 className="font-semibold text-gray-800 mb-2">Pago con Criptomonedas</h4>
        <p className="text-sm text-gray-600 mb-4">
          Acepta Bitcoin, USDC y Ethereum
        </p>
      </div>
      
      <div className="grid grid-cols-3 gap-2 mb-4">
        <div className="py-2 px-3 bg-orange-100 text-orange-800 rounded-lg text-sm font-medium text-center">
          Bitcoin
        </div>
        <div className="py-2 px-3 bg-blue-100 text-blue-800 rounded-lg text-sm font-medium text-center">
          USDC
        </div>
        <div className="py-2 px-3 bg-purple-100 text-purple-800 rounded-lg text-sm font-medium text-center">
          Ethereum
        </div>
      </div>
      
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
        <div className="flex items-center space-x-2">
          <svg className="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <p className="text-sm text-blue-800">
            Funcionalidad de criptomonedas próximamente disponible
          </p>
        </div>
      </div>
    </div>
  );

  const renderExpandedContent = (methodId: string) => {
    switch (methodId) {
      case 'card':
        return <CreditCardForm />;
      case 'bank':
        return <BankTransferCTA />;
      case 'crypto':
        return <CryptoCTA />;
      default:
        return null;
    }
  };

  return (
    <div className="w-full max-w-sm mx-auto">
      <div className="bg-white rounded-3xl shadow-2xl overflow-hidden border border-gray-100">
        
        {/* Header */}
        <div className="relative px-4 py-6 bg-gradient-to-r from-blue-500 to-blue-600">
          <div className="flex items-center justify-between">
            <button className="p-2 -ml-2 rounded-full bg-white bg-opacity-20 hover:bg-opacity-30 transition-all">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <div className="text-center">
              <h1 className="text-lg font-semibold text-white">Método de Pago</h1>
              <p className="text-xs text-blue-100 mt-1">Selecciona tu método preferido</p>
            </div>
            <div className="w-9"></div>
          </div>
        </div>

        {/* Payment Methods List */}
        <div className="divide-y divide-gray-100">
          {paymentMethods.map((method) => (
            <div key={method.id} className="overflow-hidden">
              {/* Method Header - Always Visible */}
              <div
                onClick={() => handleMethodClick(method.id)}
                className={`
                  flex items-center p-4 cursor-pointer transition-all duration-200 hover:bg-gray-50
                  ${expandedMethod === method.id ? 'bg-blue-50' : ''}
                `}
              >
                {/* Icon */}
                <div className={`
                  flex-shrink-0 w-12 h-12 rounded-2xl flex items-center justify-center mr-4 transition-colors
                  ${expandedMethod === method.id ? 'bg-blue-100' : 'bg-gray-100'}
                `}>
                  <span className="text-xl">{method.icon}</span>
                </div>

                {/* Title and Badge */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-2">
                    <h3 className={`
                      text-base font-semibold truncate
                      ${expandedMethod === method.id ? 'text-blue-900' : 'text-gray-900'}
                    `}>
                      {method.name}
                    </h3>
                    {!method.available && (
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-700 border border-orange-200">
                        🚧 Próximamente
                      </span>
                    )}
                  </div>
                </div>

                {/* Expand/Collapse Indicator */}
                <div className="flex-shrink-0 ml-3">
                  {method.available ? (
                    <svg 
                      className={`
                        w-5 h-5 text-gray-400 transition-transform duration-200
                        ${expandedMethod === method.id ? 'rotate-180' : ''}
                      `} 
                      fill="none" 
                      stroke="currentColor" 
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  ) : (
                    <div className="w-5 h-5 rounded-full bg-gray-200"></div>
                  )}
                </div>
              </div>

              {/* Expanded Content */}
              {expandedMethod === method.id && method.available && (
                <div className="animate-in slide-in-from-top duration-200">
                  {renderExpandedContent(method.id)}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Security Footer */}
        <div className="px-4 py-4 bg-gray-50 border-t border-gray-100">
          <div className="flex items-center justify-center text-xs text-gray-500">
            <svg className="w-4 h-4 mr-1 text-green-500" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
            </svg>
            <span>Protegido con encriptación SSL de 256 bits</span>
          </div>
        </div>
      </div>
    </div>
  );
}

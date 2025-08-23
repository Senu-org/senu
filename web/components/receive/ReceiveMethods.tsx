'use client';

import { useState } from 'react';
import { BankAccountForm, CryptoForm } from '../shared/forms';

interface ReceiveMethod {
  id: string;
  name: string;
  icon: string;
  available: boolean;
  description: string;
}

const receiveMethods: ReceiveMethod[] = [
  {
    id: 'bank',
    name: 'Cuenta Bancaria',
    icon: '🏦',
    available: true,
    description: 'Recibe transferencias directamente a tu cuenta bancaria'
  },
  {
    id: 'crypto',
    name: 'Wallet de Criptomonedas',
    icon: '₿',
    available: true,
    description: 'Recibe Bitcoin, USDC y Ethereum en tu wallet'
  }
];

export function ReceiveMethods() {
  const [expandedMethod, setExpandedMethod] = useState<string | null>(null);

  const handleMethodClick = (methodId: string) => {
    setExpandedMethod(expandedMethod === methodId ? null : methodId);
  };

  const BankTransferInfo = () => (
    <div className="p-4 bg-gray-50 border-t border-gray-200 space-y-4">
      <div className="text-center">
        <h4 className="font-semibold text-gray-800 mb-2">Información Bancaria</h4>
        <p className="text-sm text-gray-600 mb-4">
          Comparte esta información con quien te vaya a enviar dinero
        </p>
      </div>

      {/* Bank Information Display */}
      <div className="bg-white border border-gray-200 rounded-lg p-4 space-y-3">
        <div className="grid grid-cols-1 gap-3">
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">
              BANCO
            </label>
            <p className="text-sm font-semibold text-gray-800">Banco Nacional de Costa Rica</p>
          </div>
          
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">
              NÚMERO DE CUENTA
            </label>
            <p className="text-sm font-mono font-semibold text-gray-800">200-01-000-123456</p>
          </div>
          
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">
              TITULAR DE LA CUENTA
            </label>
            <p className="text-sm font-semibold text-gray-800">Tu Nombre Completo</p>
          </div>
          
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">
              CÉDULA
            </label>
            <p className="text-sm font-semibold text-gray-800">1-2345-6789</p>
          </div>
          
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">
              TIPO DE CUENTA
            </label>
            <p className="text-sm font-semibold text-gray-800">Cuenta Corriente Colones</p>
          </div>
        </div>
      </div>

      {/* Copy Button */}
      <button 
        onClick={() => {
          const bankInfo = `
Banco: Banco Nacional de Costa Rica
Cuenta: 200-01-000-123456
Titular: Tu Nombre Completo
Cédula: 1-2345-6789
Tipo: Cuenta Corriente Colones
          `.trim();
          navigator.clipboard.writeText(bankInfo);
        }}
        className="w-full py-3 bg-green-500 hover:bg-green-600 text-white font-semibold rounded-lg transition-colors flex items-center justify-center space-x-2"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
        </svg>
        <span>Copiar Información Bancaria</span>
      </button>

      <div className="text-xs text-gray-500 text-center">
        <p>💡 Comparte esta información con la persona que te va a enviar dinero</p>
      </div>
    </div>
  );

  const renderExpandedContent = (methodId: string) => {
    switch (methodId) {
      case 'bank':
        return <BankAccountForm mode="receiving" />;
      case 'crypto':
        return <CryptoForm mode="receiving" />;
      default:
        return null;
    }
  };

  return (
    <div className="w-full max-w-sm mx-auto">
      <div className="bg-white rounded-3xl shadow-2xl overflow-hidden border border-gray-100">
        
        {/* Header */}
        <div className="relative px-4 py-6 bg-gradient-to-r from-green-500 to-green-600">
          <div className="text-center">
            <h1 className="text-lg font-semibold text-white">Método para Recibir</h1>
            <p className="text-xs text-green-100 mt-1">Configura cómo quieres recibir dinero</p>
          </div>
        </div>

        {/* Receive Methods List */}
        <div className="divide-y divide-gray-100">
          {receiveMethods.map((method) => (
            <div key={method.id} className="overflow-hidden">
              {/* Method Header - Always Visible */}
              <div
                onClick={() => handleMethodClick(method.id)}
                className={`
                  flex items-center p-4 cursor-pointer transition-all duration-200 hover:bg-gray-50
                  ${expandedMethod === method.id ? 'bg-green-50' : ''}
                `}
              >
                {/* Icon */}
                <div className={`
                  flex-shrink-0 w-12 h-12 rounded-2xl flex items-center justify-center mr-4 transition-colors
                  ${expandedMethod === method.id ? 'bg-green-100' : 'bg-gray-100'}
                `}>
                  <span className="text-xl">{method.icon}</span>
                </div>

                {/* Title and Description */}
                <div className="flex-1 min-w-0">
                  <h3 className={`
                    text-base font-semibold truncate
                    ${expandedMethod === method.id ? 'text-green-900' : 'text-gray-900'}
                  `}>
                    {method.name}
                  </h3>
                  <p className="text-sm text-gray-500 truncate">
                    {method.description}
                  </p>
                </div>

                {/* Expand/Collapse Indicator */}
                <div className="flex-shrink-0 ml-3">
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
                </div>
              </div>

              {/* Expanded Content */}
              {expandedMethod === method.id && (
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
            <span>Información protegida con encriptación SSL de 256 bits</span>
          </div>
        </div>
      </div>
    </div>
  );
}

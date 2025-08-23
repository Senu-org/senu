'use client';

import { useState } from 'react';
import { CreditCardForm, BankAccountForm, CryptoForm } from '../shared/forms';

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
    available: true,
  },
  {
    id: 'crypto',
    name: 'Criptomonedas',
    icon: '₿',
    available: true
  }
];

export function FundingMethods() {
  const [expandedMethod, setExpandedMethod] = useState<string | null>(null);

  const handleMethodClick = (methodId: string) => {
    const method = paymentMethods.find(m => m.id === methodId);
    if (method?.available) {
      setExpandedMethod(expandedMethod === methodId ? null : methodId);
    }
  };

  const renderExpandedContent = (methodId: string) => {
    switch (methodId) {
      case 'card':
        return <CreditCardForm mode="funding" />;
      case 'bank':
        return <BankAccountForm mode="funding" />;
      case 'crypto':
        return <CryptoForm mode="funding" />;
      default:
        return null;
    }
  };

  return (
    <div className="w-full max-w-sm mx-auto">
      <div className="bg-white rounded-3xl shadow-2xl overflow-hidden border border-gray-100">
        
        {/* Header */}
        <div className="relative px-4 py-6 bg-gradient-to-r from-blue-500 to-blue-600">
          <div className="text-center">
            <h1 className="text-lg font-semibold text-white">Método de Financiamiento</h1>
            <p className="text-xs text-blue-100 mt-1">Selecciona cómo financiar tu envío</p>
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
                  flex items-center p-4 transition-all duration-200
                  ${method.available 
                    ? 'cursor-pointer hover:bg-gray-50' 
                    : 'cursor-not-allowed opacity-60'
                  }
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

                {/* Title */}
                <div className="flex-1 min-w-0">
                  <h3 className={`
                    text-base font-semibold truncate
                    ${expandedMethod === method.id ? 'text-blue-900' : 'text-gray-900'}
                  `}>
                    {method.name}
                  </h3>
                  {!method.available && (
                    <p className="text-xs text-gray-500 mt-1">Próximamente disponible</p>
                  )}
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
                    <div className="w-5 h-5 flex items-center justify-center">
                      <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
                    </div>
                  )}
                </div>
              </div>

              {/* Expanded Content */}
              {expandedMethod === method.id && (
                <div className="animate-fade-in">
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
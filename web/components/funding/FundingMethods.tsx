'use client';

import { useState, useEffect } from 'react';
import { CreditCardForm, BankAccountForm, CryptoForm } from '../shared/forms';
import { CompletionAnimation } from '../shared';
import { config } from '@/lib/config/env';

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
  const [showCompletion, setShowCompletion] = useState(false);
  const [selectedMethod, setSelectedMethod] = useState<string>('');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleMethodClick = (methodId: string) => {
    const method = paymentMethods.find(m => m.id === methodId);
    if (method?.available) {
      setExpandedMethod(expandedMethod === methodId ? null : methodId);
    }
  };

  const handlePaymentSubmit = (methodId: string) => {
    const method = paymentMethods.find(m => m.id === methodId);
    if (method) {
      setSelectedMethod(method.name);
      setShowCompletion(true);
    }
  };

  const handleCompletionFinish = () => {
    setShowCompletion(false);
    setExpandedMethod(null);
    // Here you could redirect to the next step or update the UI
  };

  const renderExpandedContent = (methodId: string) => {
    switch (methodId) {
      case 'card':
        return <CreditCardForm mode="funding" onSubmit={() => handlePaymentSubmit(methodId)} />;
      case 'bank':
        return <BankAccountForm mode="funding" onSubmit={() => handlePaymentSubmit(methodId)} />;
      case 'crypto':
        return <CryptoForm mode="funding" onSubmit={() => handlePaymentSubmit(methodId)} />;
      default:
        return null;
    }
  };

  // Use safe defaults for SSR to prevent hydration mismatch
  const safeExpandedMethod = mounted ? expandedMethod : null;

  return (
    <>
      <div className="w-full max-w-sm mx-auto">
        <div className="bg-white rounded-3xl shadow-lg overflow-hidden border border-gray-100">
        
        {/* iOS-style header */}
        <div className="px-4 py-4 border-b border-gray-100" style={{ backgroundColor: 'rgb(243 232 255 / var(--tw-bg-opacity, 1))' }}>
          <div className="text-center">
            <h3 className="text-lg font-semibold text-gray-900">Métodos de Financiamiento</h3>
            <p className="text-sm text-gray-500 mt-1">Selecciona tu método preferido</p>
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
                    ? 'cursor-pointer active:bg-gray-100' 
                    : 'cursor-not-allowed opacity-60'
                  }
                  ${safeExpandedMethod === method.id ? 'bg-blue-50' : 'hover:bg-gray-50'}
                `}
              >
                {/* Icon */}
                <div className={`
                  flex-shrink-0 w-12 h-12 rounded-2xl flex items-center justify-center mr-4 transition-colors
                  ${safeExpandedMethod === method.id ? 'bg-blue-100' : 'bg-gray-100'}
                `}>
                  <span className="text-xl">{method.icon}</span>
                </div>

                {/* Title */}
                <div className="flex-1 min-w-0">
                  <h3 className={`
                    text-base font-semibold truncate
                    ${safeExpandedMethod === method.id ? 'text-blue-900' : 'text-gray-900'}
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
                        ${safeExpandedMethod === method.id ? 'rotate-180' : ''}
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
              {safeExpandedMethod === method.id && (
                <div className="animate-fade-in">
                  {renderExpandedContent(method.id)}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* iOS-style Security Footer */}
        <div className="px-4 py-3 bg-gray-50 border-t border-gray-100">
          <div className="flex items-center justify-center space-x-2">
            <svg className="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
            </svg>
            <span className="text-xs font-medium text-gray-600">Protegido con SSL</span>
          </div>
        </div>
        </div>
      </div>

      {/* Completion Animation */}
      <CompletionAnimation
        isVisible={showCompletion}
        onComplete={handleCompletionFinish}
        title="¡Método Configurado!"
        subtitle={`${selectedMethod} ha sido configurado exitosamente. Ahora puedes enviar tu remesa por WhatsApp`}
        redirectTo={config.whatsapp.getWhatsAppUrl("Hola, ya configuré mi método de pago y quiero enviar una remesa")}
      />
    </>
  );
}
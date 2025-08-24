'use client';

interface CreditCardFormData {
  cardNumber: string;
  expiryDate: string;
  cvv: string;
  holderName: string;
}

interface CreditCardFormProps {
  mode?: 'funding' | 'receiving';
  onSubmit?: (data: CreditCardFormData) => void;
  isLoading?: boolean;
}

export function CreditCardForm({ mode = 'funding', onSubmit, isLoading = false }: CreditCardFormProps) {
  const isFunding = mode === 'funding';
  
  // Credit cards are typically only used for funding, not receiving
  if (!isFunding) {
    return (
      <div className="p-4 bg-gray-50 border-t border-gray-200 space-y-4">
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
          <div className="flex items-center space-x-2">
            <svg className="w-5 h-5 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.464 0L4.35 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
            <p className="text-sm text-yellow-800">
              Las tarjetas de crédito no se pueden usar para recibir dinero
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 bg-white space-y-4">
      {/* iOS-style form header */}
      <div className="text-center pb-2">
        <p className="text-sm text-gray-600 mt-1">
          Ingresa los datos de tu tarjeta de forma segura
        </p>
      </div>



      {/* iOS-style form fields */}
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-900 mb-2">
            Número de Tarjeta
          </label>
          <input
            type="text"
            inputMode="numeric"
            placeholder="1234 5678 9012 3456"
            className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all text-base"
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-sm font-medium text-gray-900 mb-2">
              Vencimiento
            </label>
            <input
              type="text"
              inputMode="numeric"
              placeholder="MM/AA"
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all text-base"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-900 mb-2">
              CVV
            </label>
            <input
              type="text"
              inputMode="numeric"
              placeholder="123"
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all text-base"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-900 mb-2">
            Nombre del Titular
          </label>
          <input
            type="text"
            placeholder="Juan Pérez"
            className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all text-base"
          />
        </div>
      </div>

      {/* iOS-style submit button */}
      <div className="pt-2">
        <button
          onClick={() => {
            // Collect form data (in real implementation, get from form state)
            const formData: CreditCardFormData = {
              cardNumber: '****-****-****-1234', // Mock data
              expiryDate: '12/25',
              cvv: '***',
              holderName: 'John Doe'
            };
            onSubmit?.(formData);
          }}
          disabled={isLoading}
          className={`
                  w-full py-4 text-white font-semibold rounded-2xl shadow-sm transition-all duration-150 text-base
                  ${isLoading
              ? 'bg-gray-400 cursor-not-allowed'
              : 'bg-purple-500 active:bg-purple-600 active:shadow-md transform active:scale-95'
            }
                `}
        >
          {isLoading ? (
            <div className="flex items-center justify-center space-x-2">
              <svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              <span>Procesando pago...</span>
            </div>
          ) : (
            'Confirmar Pago con Tarjeta'
          )}
        </button>
      </div>

      {/* iOS-style security notice */}
      <div className="flex items-center justify-center space-x-2 pt-2">
        <svg className="w-4 h-4 text-purple-500" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
        </svg>
        <span className="text-xs text-gray-600">Datos protegidos con encriptación SSL</span>
      </div>
    </div>
  );
}

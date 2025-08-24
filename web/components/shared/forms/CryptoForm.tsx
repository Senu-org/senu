'use client';

interface CryptoFormData {
  cryptoType: string;
  walletAddress?: string;
  network?: string;
}

interface CryptoFormProps {
  mode?: 'funding' | 'receiving';
  onSubmit?: (data: CryptoFormData) => void;
  isLoading?: boolean;
  amount?: number | null;
}

export function CryptoForm({ mode = 'funding', onSubmit, isLoading = false, amount }: CryptoFormProps) {
  const isFunding = mode === 'funding';
  
  const title = isFunding ? 'Pago con Criptomonedas' : 'Recibir Criptomonedas';
  const description = isFunding 
    ? 'Paga con Bitcoin, USDC y Ethereum' 
    : 'Configura tu wallet para recibir criptomonedas';
  
  const buttonText = isFunding 
    ? 'Procesar Pago Crypto' 
    : 'Guardar Wallet Crypto';
  
  const buttonColor = isFunding 
    ? 'bg-purple-500 hover:bg-purple-600' 
    : 'bg-purple-500 hover:bg-purple-600';

  return (
    <div className="p-4 bg-white space-y-4">
      {/* iOS-style form header */}
      <div className="text-center pb-2">
        <h4 className="text-lg font-semibold text-gray-900">{title}</h4>
        <p className="text-sm text-gray-600 mt-1">
          {description}
        </p>
      </div>


      
      {/* iOS-style crypto badges */}
      <div className="grid grid-cols-3 gap-2">
        <div className="py-3 px-3 bg-orange-100 text-orange-800 rounded-xl text-sm font-semibold text-center border border-orange-200">
          ₿ Bitcoin
        </div>
        <div className="py-3 px-3 bg-purple-100 text-purple-800 rounded-xl text-sm font-semibold text-center border border-purple-200">
          💰 USDC
        </div>
        <div className="py-3 px-3 bg-purple-100 text-purple-800 rounded-xl text-sm font-semibold text-center border border-purple-200">
          ⟠ Ethereum
        </div>
      </div>
      
      {!isFunding && (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-900 mb-2">
              Dirección de Wallet
            </label>
            <input
              type="text"
              placeholder="0x1234...abcd"
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all font-mono text-sm"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-900 mb-2">
              Red Blockchain
            </label>
            <select className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all text-base appearance-none">
              <option value="">Selecciona la red</option>
              <option value="ethereum">Ethereum (ETH)</option>
              <option value="polygon">Polygon (MATIC)</option>
              <option value="bsc">Binance Smart Chain (BNB)</option>
              <option value="bitcoin">Bitcoin (BTC)</option>
              <option value="arbitrum">Arbitrum (ARB)</option>
            </select>
          </div>
        </div>
      )}
      
      {/* iOS-style info notice */}
      <div className="bg-purple-50 border border-purple-200 rounded-xl p-4">
        <div className="flex items-start space-x-3">
          <div className="flex-shrink-0">
            <svg className="w-5 h-5 text-purple-500 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div>
            <p className="text-sm font-medium text-purple-900 mb-1">
              Funcionalidad Próximamente
            </p>
            <p className="text-xs text-purple-800 leading-relaxed">
              Los pagos con criptomonedas estarán disponibles muy pronto. Mientras tanto, puedes usar tarjeta de crédito o transferencia bancaria.
            </p>
          </div>
        </div>
      </div>
      
      {/* iOS-style submit button */}
      <div className="pt-2">
        <button 
          onClick={() => {
            // Collect form data (in real implementation, get from form state)
            const formData: CryptoFormData = {
              cryptoType: 'bitcoin', // Mock data
              walletAddress: '1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa',
              network: 'mainnet'
            };
            onSubmit?.(formData);
          }}
          disabled={isLoading}
          className={`
            w-full py-4 text-white font-semibold rounded-2xl shadow-sm transition-all duration-150 text-base
            ${isLoading
              ? 'bg-gray-400 cursor-not-allowed' 
              : `${buttonColor} active:shadow-md transform active:scale-95`
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
            buttonText
          )}
        </button>
      </div>

      {/* iOS-style security notice */}
      <div className="flex items-center justify-center space-x-2 pt-2">
        <svg className="w-4 h-4 text-purple-500" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
        </svg>
        <span className="text-xs text-gray-600">Transacciones protegidas en blockchain</span>
      </div>
    </div>
  );
}

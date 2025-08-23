'use client';

interface CryptoFormProps {
  mode?: 'funding' | 'receiving';
  onSubmit?: (data: any) => void;
}

export function CryptoForm({ mode = 'funding', onSubmit }: CryptoFormProps) {
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
    : 'bg-blue-500 hover:bg-blue-600';

  return (
    <div className="p-4 bg-gray-50 border-t border-gray-200 space-y-4">
      <div className="text-center">
        <h4 className="font-semibold text-gray-800 mb-2">{title}</h4>
        <p className="text-sm text-gray-600 mb-4">
          {description}
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
      
      {!isFunding && (
        <div className="space-y-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Dirección de Wallet
            </label>
            <input
              type="text"
              placeholder="0x1234...abcd"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Red Preferida
            </label>
            <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
              <option value="">Selecciona la red</option>
              <option value="ethereum">Ethereum (ETH)</option>
              <option value="polygon">Polygon (MATIC)</option>
              <option value="bsc">Binance Smart Chain (BNB)</option>
              <option value="bitcoin">Bitcoin (BTC)</option>
            </select>
          </div>
        </div>
      )}
      
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
      
      <button 
        onClick={() => onSubmit?.({})}
        className={`w-full py-3 ${buttonColor} text-white font-semibold rounded-lg transition-colors`}
      >
        {buttonText}
      </button>
    </div>
  );
}

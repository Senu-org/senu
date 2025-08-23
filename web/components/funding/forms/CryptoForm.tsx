'use client';

export function CryptoForm() {
  return (
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
}

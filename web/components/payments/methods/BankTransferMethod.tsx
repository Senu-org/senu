export function BankTransferMethod() {
  return (
    <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-200 hover:shadow-xl transition-shadow duration-300">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center">
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
          </div>
          <div>
            <h3 className="font-semibold text-gray-800">Transferencia Bancaria</h3>
            <p className="text-sm text-gray-500">Bancos locales de Costa Rica</p>
          </div>
        </div>
        <div className="bg-green-100 text-green-600 px-2 py-1 rounded-full text-xs font-medium">
          Disponible
        </div>
      </div>
      
      <div className="space-y-3 mb-4">
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">Comisión:</span>
          <span className="font-medium text-gray-800">₡500 - ₡1,500</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">Tiempo de procesamiento:</span>
          <span className="font-medium text-gray-800">1-2 horas</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">Límite:</span>
          <span className="font-medium text-gray-800">₡5,000,000/día</span>
        </div>
      </div>

      <div className="space-y-2 mb-4">
        <div className="flex items-center text-xs text-gray-600">
          <div className="w-4 h-3 bg-red-500 rounded-sm mr-2"></div>
          Banco Nacional
        </div>
        <div className="flex items-center text-xs text-gray-600">
          <div className="w-4 h-3 bg-blue-600 rounded-sm mr-2"></div>
          BCR
        </div>
        <div className="flex items-center text-xs text-gray-600">
          <div className="w-4 h-3 bg-green-600 rounded-sm mr-2"></div>
          BAC San José
        </div>
      </div>
      
      <button className="w-full bg-green-500 hover:bg-green-600 text-white py-3 rounded-lg font-semibold transition-colors duration-200">
        Transferir desde Banco
      </button>
    </div>
  );
}

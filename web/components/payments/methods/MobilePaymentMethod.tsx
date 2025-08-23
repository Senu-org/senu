export function MobilePaymentMethod() {
  return (
    <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-200 hover:shadow-xl transition-shadow duration-300">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 bg-gradient-to-br from-pink-500 to-pink-600 rounded-xl flex items-center justify-center">
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
            </svg>
          </div>
          <div>
            <h3 className="font-semibold text-gray-800">Pagos Móviles</h3>
            <p className="text-sm text-gray-500">SINPE Móvil, Apple Pay, Google Pay</p>
          </div>
        </div>
        <div className="bg-yellow-100 text-yellow-600 px-2 py-1 rounded-full text-xs font-medium">
          Próximamente
        </div>
      </div>
      
      <div className="space-y-3 mb-4 opacity-60">
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">Comisión:</span>
          <span className="font-medium text-gray-800">₡0 - ₡500</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">Tiempo de procesamiento:</span>
          <span className="font-medium text-gray-800">Instantáneo</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">Límite:</span>
          <span className="font-medium text-gray-800">₡1,500,000/día</span>
        </div>
      </div>

      <div className="space-y-2 mb-4 opacity-60">
        <div className="flex items-center text-xs text-gray-600">
          <div className="w-4 h-3 bg-blue-500 rounded-sm mr-2"></div>
          SINPE Móvil
        </div>
        <div className="flex items-center text-xs text-gray-600">
          <div className="w-4 h-3 bg-gray-800 rounded-sm mr-2"></div>
          Apple Pay
        </div>
        <div className="flex items-center text-xs text-gray-600">
          <div className="w-4 h-3 bg-green-500 rounded-sm mr-2"></div>
          Google Pay
        </div>
      </div>
      
      <button disabled className="w-full bg-gray-300 text-gray-500 py-3 rounded-lg font-semibold cursor-not-allowed">
        Próximamente
      </button>
    </div>
  );
}

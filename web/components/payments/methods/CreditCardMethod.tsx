export function CreditCardMethod() {
  return (
    <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-200 hover:shadow-xl transition-shadow duration-300">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center">
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
            </svg>
          </div>
          <div>
            <h3 className="font-semibold text-gray-800">Tarjeta de Crédito/Débito</h3>
            <p className="text-sm text-gray-500">Visa, Mastercard, American Express</p>
          </div>
        </div>
        <div className="bg-green-100 text-green-600 px-2 py-1 rounded-full text-xs font-medium">
          Disponible
        </div>
      </div>
      
      <div className="space-y-3 mb-4">
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">Comisión:</span>
          <span className="font-medium text-gray-800">2.9% + $0.30</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">Tiempo de procesamiento:</span>
          <span className="font-medium text-gray-800">Instantáneo</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">Límite:</span>
          <span className="font-medium text-gray-800">$10,000/día</span>
        </div>
      </div>

      <div className="flex space-x-2 mb-4">
        <div className="w-8 h-5 bg-blue-600 rounded text-white text-xs flex items-center justify-center font-bold">VISA</div>
        <div className="w-8 h-5 bg-red-500 rounded text-white text-xs flex items-center justify-center font-bold">MC</div>
        <div className="w-8 h-5 bg-blue-500 rounded text-white text-xs flex items-center justify-center font-bold">AMEX</div>
      </div>
      
      <button className="w-full bg-blue-500 hover:bg-blue-600 text-white py-3 rounded-lg font-semibold transition-colors duration-200">
        Usar Tarjeta
      </button>
    </div>
  );
}

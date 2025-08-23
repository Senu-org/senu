export function CryptoMethod() {
  return (
    <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-200 hover:shadow-xl transition-shadow duration-300">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl flex items-center justify-center">
            <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
              <path d="M23.638 14.904c-1.602 6.43-8.113 10.34-14.542 8.736C2.67 22.05-1.244 15.525.362 9.105 1.962 2.67 8.475-1.243 14.9.358c6.43 1.605 10.342 8.115 8.738 14.546z"/>
              <path fill="#fff" d="M17.45 11.286c.15-1.001-.613-1.54-1.657-1.899l.338-1.357-1.376-.343-.33 1.322c-.361-.09-.732-.175-1.102-.258l.332-1.33-1.376-.343-.338 1.357c-.3-.068-.594-.135-.879-.206l.002-.007-1.897-.473-.366 1.469s1.017.233 .996.247c.555.138.655.506.638.798l-.638 2.563c.038.01.088.023.143.043-.046-.011-.096-.024-.147-.037l-.895 3.587c-.068.168-.24.42-.628.325.014.02-.996-.248-.996-.248l-.683 1.574 1.791.446c.333.084.659.171.98.254l-.342 1.371 1.375.343.338-1.357c.375.102.738.196 1.093.285l-.337 1.348 1.376.343.342-1.371c1.41.267 2.47.159 2.915-1.116.36-1.027-.018-1.62-.759-2.006.54-.125.946-.48 1.054-1.215zm-1.885 2.644c-.256 1.025-1.984.471-2.543.332l.454-1.82c.559.139 2.356.415 2.089 1.488zm.256-2.66c-.233.936-1.676.46-2.144.344l.411-1.648c.468.117 1.979.335 1.733 1.304z"/>
            </svg>
          </div>
          <div>
            <h3 className="font-semibold text-gray-800">Criptomonedas</h3>
            <p className="text-sm text-gray-500">Bitcoin, USDC, USDT</p>
          </div>
        </div>
        <div className="bg-green-100 text-green-600 px-2 py-1 rounded-full text-xs font-medium">
          Disponible
        </div>
      </div>
      
      <div className="space-y-3 mb-4">
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">Comisión de red:</span>
          <span className="font-medium text-gray-800">Variable</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">Tiempo de procesamiento:</span>
          <span className="font-medium text-gray-800">5-30 min</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">Límite:</span>
          <span className="font-medium text-gray-800">Sin límite</span>
        </div>
      </div>

      <div className="flex space-x-2 mb-4">
        <div className="flex items-center text-xs bg-orange-100 text-orange-700 px-2 py-1 rounded">
          <div className="w-3 h-3 bg-orange-500 rounded-full mr-1"></div>
          BTC
        </div>
        <div className="flex items-center text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">
          <div className="w-3 h-3 bg-blue-500 rounded-full mr-1"></div>
          USDC
        </div>
        <div className="flex items-center text-xs bg-green-100 text-green-700 px-2 py-1 rounded">
          <div className="w-3 h-3 bg-green-500 rounded-full mr-1"></div>
          USDT
        </div>
      </div>
      
      <button className="w-full bg-orange-500 hover:bg-orange-600 text-white py-3 rounded-lg font-semibold transition-colors duration-200">
        Conectar Wallet
      </button>
    </div>
  );
}

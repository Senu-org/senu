export function StripeMethod() {
  return (
    <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-200 hover:shadow-xl transition-shadow duration-300">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center">
            <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
              <path d="M13.976 9.15c-2.172-.806-3.356-1.426-3.356-2.409 0-.831.683-1.305 1.901-1.305 2.227 0 4.515.858 6.09 1.631l.89-5.494C18.252.975 15.697 0 12.165 0 9.667 0 7.589.654 6.104 1.872 4.56 3.147 3.757 4.992 3.757 7.218c0 4.039 2.467 5.76 6.476 7.219 2.585.92 3.445 1.574 3.445 2.583 0 .98-.84 1.545-2.354 1.545-1.875 0-4.965-.921-6.99-2.109l-.9 5.555C5.175 22.99 8.385 24 11.714 24c2.641 0 4.843-.624 6.328-1.813 1.664-1.305 2.525-3.236 2.525-5.732 0-4.128-2.524-5.851-6.594-7.305h.003z"/>
            </svg>
          </div>
          <div>
            <h3 className="font-semibold text-gray-800">Stripe</h3>
            <p className="text-sm text-gray-500">Procesamiento seguro global</p>
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
          <span className="font-medium text-gray-800">$25,000/día</span>
        </div>
      </div>

      <div className="bg-gray-50 rounded-lg p-3 mb-4">
        <div className="flex items-center text-sm text-gray-600">
          <svg className="w-4 h-4 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          Certificado PCI DSS Nivel 1
        </div>
      </div>
      
      <button className="w-full bg-purple-500 hover:bg-purple-600 text-white py-3 rounded-lg font-semibold transition-colors duration-200">
        Pagar con Stripe
      </button>
    </div>
  );
}

export function PayPalMethod() {
  return (
    <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-200 hover:shadow-xl transition-shadow duration-300">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-blue-700 rounded-xl flex items-center justify-center">
            <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
              <path d="M7.076 21.337H2.47a.641.641 0 0 1-.633-.74L4.944.901C5.026.382 5.474 0 5.998 0h7.46c2.57 0 4.578.543 5.69 1.81 1.01 1.15 1.304 2.42 1.012 4.287-.023.143-.047.288-.077.437-.983 5.05-4.349 6.797-8.647 6.797h-2.19c-.524 0-.968.382-1.05.9l-1.12 7.106zm14.146-14.42a3.35 3.35 0 0 0-.607-.541c-.013.076-.026.175-.041.26-.93 4.778-4.005 7.201-9.138 7.201h-2.19a.563.563 0 0 0-.556.479l-1.187 7.527h-.506l-.24 1.516a.641.641 0 0 0 .633.740h3.94a.563.563 0 0 0 .556-.479l.035-.22.671-4.25.043-.28a.563.563 0 0 1 .556-.479h.35c3.863 0 6.875-1.567 7.762-6.08.372-1.89.166-3.472-.645-4.633z"/>
            </svg>
          </div>
          <div>
            <h3 className="font-semibold text-gray-800">PayPal</h3>
            <p className="text-sm text-gray-500">Pago rápido y seguro</p>
          </div>
        </div>
        <div className="bg-yellow-100 text-yellow-600 px-2 py-1 rounded-full text-xs font-medium">
          Próximamente
        </div>
      </div>
      
      <div className="space-y-3 mb-4 opacity-60">
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">Comisión:</span>
          <span className="font-medium text-gray-800">3.4% + $0.30</span>
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

      <div className="bg-yellow-50 rounded-lg p-3 mb-4">
        <div className="flex items-center text-sm text-yellow-700">
          <svg className="w-4 h-4 text-yellow-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          Integración en desarrollo
        </div>
      </div>
      
      <button disabled className="w-full bg-gray-300 text-gray-500 py-3 rounded-lg font-semibold cursor-not-allowed">
        Próximamente
      </button>
    </div>
  );
}

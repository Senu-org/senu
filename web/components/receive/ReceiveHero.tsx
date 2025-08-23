export function ReceiveHero() {
  return (
    <div className="max-w-4xl mx-auto text-center mb-12 md:mb-16 lg:mb-20">
      <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-800 mb-4 md:mb-6 leading-tight">
        Recibe Dinero de Forma Segura
      </h1>
      <p className="text-base md:text-lg text-gray-600 mb-6 md:mb-8 leading-relaxed max-w-2xl mx-auto">
        Configura tu método preferido para recibir transferencias. Te proporcionaremos toda la información necesaria para que otros puedan enviarte dinero.
      </p>
      <div className="flex items-center justify-center space-x-4 text-sm text-gray-500">
        <div className="flex items-center">
          <svg className="w-4 h-4 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          Seguro
        </div>
        <div className="flex items-center">
          <svg className="w-4 h-4 text-blue-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
          Rápido
        </div>
        <div className="flex items-center">
          <svg className="w-4 h-4 text-purple-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
          Confiable
        </div>
      </div>
    </div>
  );
}

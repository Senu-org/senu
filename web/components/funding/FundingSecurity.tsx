export function FundingSecurity() {
  const securityFeatures = [
    {
      icon: (
        <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
        </svg>
      ),
      title: "Encriptación SSL 256-bit",
      description: "Todos los datos se transmiten con encriptación de grado bancario"
    },
    {
      icon: (
        <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
        </svg>
      ),
      title: "Cumplimiento PCI DSS",
      description: "Certificados con los más altos estándares de seguridad de pagos"
    },
    {
      icon: (
        <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
      ),
      title: "Detección de Fraude",
      description: "Monitoreo en tiempo real para prevenir transacciones fraudulentas"
    },
    {
      icon: (
        <svg className="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 14v3m4-3v3m4-3v3M3 21h18M3 10h18M10 3v4h4V3M4 3h16a1 1 0 011 1v5H3V4a1 1 0 011-1z" />
        </svg>
      ),
      title: "Regulación Bancaria",
      description: "Supervisados por SUGEF y autoridades financieras internacionales"
    }
  ];

  return (
    <div className="max-w-6xl mx-auto mt-16 md:mt-20 lg:mt-24">
      <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-3xl p-8 md:p-12">
        <div className="text-center mb-12">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-800 mb-4">
            Seguridad y Confianza
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Tu seguridad es nuestra prioridad. Utilizamos las mejores tecnologías y cumplimos con todas las regulaciones financieras.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
          {securityFeatures.map((feature, index) => (
            <div key={index} className="text-center">
              <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
                {feature.icon}
              </div>
              <h3 className="font-semibold text-gray-800 mb-2">
                {feature.title}
              </h3>
              <p className="text-sm text-gray-600 leading-relaxed">
                {feature.description}
              </p>
            </div>
          ))}
        </div>

        <div className="mt-12 text-center">
          <div className="flex items-center justify-center space-x-6 mb-6">
            <div className="flex items-center text-sm text-gray-600">
              <div className="w-8 h-6 bg-blue-600 rounded text-white text-xs flex items-center justify-center font-bold mr-2">SSL</div>
              Certificado SSL
            </div>
            <div className="flex items-center text-sm text-gray-600">
              <div className="w-8 h-6 bg-green-600 rounded text-white text-xs flex items-center justify-center font-bold mr-2">PCI</div>
              PCI Compliant
            </div>
            <div className="flex items-center text-sm text-gray-600">
              <div className="w-8 h-6 bg-red-600 rounded text-white text-xs flex items-center justify-center font-bold mr-2">SOC</div>
              SOC 2 Type II
            </div>
          </div>
          <p className="text-xs text-gray-500">
            Senu está registrado y supervisado por las autoridades financieras correspondientes.
          </p>
        </div>
      </div>
    </div>
  );
}

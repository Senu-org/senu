export function HomeFeatures() {
  const features = [
    {
      icon: (
        <svg className="w-8 h-8 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
        </svg>
      ),
      title: "Elige un Contacto",
      description: "Abre nuestro bot en WhatsApp, selecciona a quién quieres enviarle dinero de tu lista de contactos y define el monto. Sin pedir números de cuenta."
    },
    {
      icon: (
        <svg className="w-8 h-8 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
        </svg>
      ),
      title: "Carga tu Dinero",
      description: "Realiza el pago de forma segura. Para nuestro lanzamiento, puedes cargar fondos conectando tu wallet. ¡Próximamente con tarjeta de crédito/débito!"
    },
    {
      icon: (
        <svg className="w-8 h-8 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
        </svg>
      ),
      title: "¡Listo en Minutos!",
      description: "Tu contacto recibe el dinero al instante. Rápido, seguro y sin complicaciones."
    }
  ];

  return (
    <div className="max-w-4xl mx-auto mt-12 md:mt-16 lg:mt-20 px-4 md:px-6">
      <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl md:rounded-2xl p-4 md:p-6 lg:p-8 border-l-4 border-blue-400">
        <h3 className="text-2xl md:text-3xl font-bold text-gray-800 mb-8 md:mb-10 lg:mb-12">
          Funcionalidades
        </h3>
        
        <div className="space-y-6 md:space-y-8 lg:space-y-10">
          {features.map((feature, index) => (
            <div key={index} className="flex flex-col sm:flex-row items-start gap-4 md:gap-6">
              <div className="flex-shrink-0 mx-auto sm:mx-0">
                <div className="w-12 h-12 md:w-14 md:h-14 lg:w-16 lg:h-16 bg-white rounded-lg md:rounded-xl flex items-center justify-center shadow-md">
                  {feature.icon}
                </div>
              </div>
              <div className="flex-1 text-center sm:text-left">
                <h4 className="text-lg md:text-xl lg:text-2xl font-bold text-gray-800 mb-2 md:mb-3">
                  {feature.title}
                </h4>
                <p className="text-sm md:text-base lg:text-lg text-gray-600 leading-relaxed">
                  {feature.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

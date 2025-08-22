# Documento de Requisitos

## Introducción

El sistema de remesas por WhatsApp es una solución innovadora que permite a los inmigrantes nicaragüenses en Costa Rica enviar dinero a sus familias de manera sencilla, rápida y económica. La plataforma utiliza WhatsApp como interfaz principal, eliminando la fricción de las aplicaciones tradicionales y haciendo que el envío de dinero sea tan simple como enviar un mensaje. El MVP se enfoca en el corredor Costa Rica → Nicaragua, integrando tecnología blockchain (Monad) para las transacciones internas y estableciendo alianzas estratégicas para el on-ramp y off-ramp de fondos.

## Requisitos

### Requisito 1: Registro y Onboarding del Emisor

**Historia de Usuario:** Como Juan (emisor nicaragüense en Costa Rica), quiero registrarme en el sistema de remesas a través de WhatsApp de forma sencilla, para que pueda empezar a enviar dinero sin procesos complicados.

#### Criterios de Aceptación

1. CUANDO el usuario inicia una conversación con el Bot de Remesas ENTONCES EL sistema DEBERÁ presentar un flujo de bienvenida y registro
2. SI el usuario no está registrado ENTONCES EL sistema DEBERÁ solicitar información básica (nombre, país de residencia, número de teléfono)
3. CUANDO se complete el registro ENTONCES EL sistema DEBERÁ crear una wallet custodial asociada al número de WhatsApp
4. MIENTRAS el proceso de registro esté en curso EL sistema DEBERÁ mantener el contexto de la conversación sin pérdida de datos

### Requisito 2: Iniciación de Transacción

**Historia de Usuario:** Como Juan (emisor), quiero especificar el monto a enviar de manera intuitiva, para que pueda conocer exactamente cuánto costará la transacción antes de proceder.

#### Criterios de Aceptación

1. CUANDO el usuario introduce un monto (ej. "150 USD") ENTONCES EL sistema DEBERÁ calcular y mostrar el monto final en CRC que recibirá el destinatario
2. CUANDO se muestre el cálculo ENTONCES EL sistema DEBERÁ desglosar claramente las comisiones del servicio
3. SI el monto está fuera de los límites permitidos ENTONCES EL sistema DEBERÁ informar los límites mínimos y máximos
4. CUANDO el usuario confirme el monto ENTONCES EL sistema DEBERÁ abrir la Mini App para procesar el pago

### Requisito 3: Procesamiento de Pago (On-Ramp)

**Historia de Usuario:** Como Juan (emisor), quiero pagar la remesa usando mi método preferido (tarjeta, transferencia bancaria o wallet externa), para que el proceso sea conveniente y seguro.

#### Criterios de Aceptación

1. CUANDO se abra la Mini App de pago ENTONCES EL sistema DEBERÁ presentar múltiples opciones de pago (tarjeta de crédito/débito, transferencia bancaria, wallet externa)
2. SI el usuario selecciona pago con tarjeta ENTONCES EL sistema DEBERÁ procesar el pago mediante integración segura con el proveedor de on-ramp
3. CUANDO el pago sea exitoso ENTONCES EL sistema DEBERÁ crear la wallet del receptor y acreditar los fondos equivalentes en la wallet custodial interna
4. SI el pago falla ENTONCES EL sistema DEBERÁ notificar el error específico y ofrecer alternativas

### Requisito 4: Confirmación y Notificación al Emisor

**Historia de Usuario:** Como Juan (emisor), quiero recibir confirmación inmediata de que mi transacción fue exitosa y tener la opción de notificar al destinatario, para generar confianza y transparencia.

#### Criterios de Aceptación

1. CUANDO la transacción sea procesada exitosamente ENTONCES EL sistema DEBERÁ enviar confirmación al emisor via WhatsApp
2. CUANDO se confirme la transacción ENTONCES EL sistema DEBERÁ ofrecer un botón "Notificar a tu contacto"
3. SI el emisor selecciona notificar ENTONCES EL sistema DEBERÁ generar un mensaje pre-configurado con detalles de la transacción
4. MIENTRAS la transacción esté en proceso EL sistema DEBERÁ mantener al emisor informado del estado

### Requisito 5: Notificación al Receptor

**Historia de Usuario:** Como Miguel (receptor en Nicaragua), quiero recibir una notificación clara cuando me envíen dinero, para que pueda proceder a retirarlo de inmediato.

#### Criterios de Aceptación

1. CUANDO se complete una transacción ENTONCES EL sistema DEBERÁ enviar un mensaje automático al receptor informando sobre la remesa
2. CUANDO el receptor reciba el mensaje ENTONCES EL mensaje DEBERÁ incluir el monto en CRC, nombre del emisor y un enlace para retirar
3. SI el receptor nunca ha interactuado con el Bot ENTONCES EL sistema DEBERÁ establecer una nueva conversación y mostrar el mensaje de bienvenida y el proceso de retiro
   b. Si el usuario ya ha interactuado con el bot, no es necesario que entre a la mini app si no que va pasar directo

4. CUANDO el receptor haga clic en el enlace ENTONCES EL sistema DEBERÁ abrir la Mini App de retiro

### Requisito 6: Proceso de Retiro (Off-Ramp)

**Historia de Usuario:** Como Miguel (receptor), quiero retirar el dinero recibido directamente a mi cuenta bancaria en Nicaragua de forma simple, para que pueda acceder a los fondos sin complicaciones.

#### Criterios de Aceptación

1. CUANDO el receptor abra la Mini App ENTONCES EL sistema DEBERÁ presentar una bienvenida y explicación breve del proceso
2. CUANDO el receptor seleccione retiro ENTONCES EL sistema DEBERÁ mostrar todos las opciones de retiro (off-ramp) (SINPE, Banco, etc) disponbles segun el país de destino
3. SI el receptor selecciona una opción como default o escoger una opcion cada vez que le llegue dinero
4. El sistema DEBERÁ verificar que los datos necesarios sean correctos y validos a traves de una API del off-ramp escogido por el usuario
5. CUANDO el receptor confirme el retiro ENTONCES EL sistema DEBERÁ iniciar la transferencia via integración con el socio de off-ramp
6. MIENTRAS se procesa el retiro EL sistema DEBERÁ notificar que la transferencia se reflejará en minutos

### Requisito 7: Gestión de Wallets Custodiales

**Historia de Usuario:** Como sistema backend, necesito gestionar de forma segura las wallets custodiales de los usuarios, para que los fondos estén protegidos durante todo el proceso de transacción.

#### Criterios de Aceptación

1. CUANDO un usuario se registre ENTONCES EL sistema DEBERÁ crear automáticamente una wallet custodial asociada a su número de WhatsApp
2. CUANDO se reciban fondos del on-ramp y la wallet del receptor no exista ENTONCES EL sistema debera crear la wallet del receptor y acreditar los fondos en la wallet del receptor usando blockchain Monad
   b. Si la wallet del receptor ya existe, el sistema debera acreditar los fondos en la wallet del receptor
3. MIENTRAS haya fondos en custodia EL sistema DEBERÁ mantener registros auditables de todas las transacciones

### Requisito 8: Integración con Socios Tecnológicos

**Historia de Usuario:** Como equipo de desarrollo, necesito integraciones robustas con los socios de on-ramp y off-ramp, para que las transacciones sean confiables y eficientes.

#### Criterios de Aceptación

1. CUANDO se procese un pago ENTONCES EL sistema DEBERÁ comunicarse exitosamente via API con el proveedor de on-ramp
2. CUANDO se solicite un retiro ENTONCES EL sistema DEBERÁ ejecutar la transferencia via API con el socio de off-ramp (SINPE)
3. SI alguna integración falla ENTONCES EL sistema DEBERÁ implementar reintentos automáticos y notificación de errores
4. CUANDO ocurran transacciones EL sistema DEBERÁ mantener logs detallados para auditoría y reconciliación

### Requisito 9: Validaciones y Límites de Transacción

**Historia de Usuario:** Como plataforma de remesas, necesito implementar validaciones apropiadas y límites de transacción, para cumplir con regulaciones y gestionar riesgos.

#### Criterios de Aceptación

1. CUANDO un usuario intente enviar un monto ENTONCES EL sistema DEBERÁ validar que esté dentro de los límites diarios/mensuales establecidos
2. SI se detecta actividad sospechosa ENTONCES EL sistema DEBERÁ flagear la transacción para revisión manual
3. CUANDO se procesen transacciones EL sistema DEBERÁ mantener registros KYC básicos de los usuarios
4. MIENTRAS se validen transacciones EL sistema DEBERÁ cumplir con tiempos de respuesta menores a 5 minutos end-to-end

### Requisito 10: Manejo de Errores y Estados de Transacción

**Historia de Usuario:** Como usuario del sistema (emisor o receptor), quiero recibir información clara sobre el estado de mis transacciones y pasos a seguir en caso de errores, para mantener confianza en el servicio.

#### Criterios de Aceptación

1. CUANDO ocurra un error en cualquier etapa ENTONCES EL sistema DEBERÁ proporcionar mensajes de error claros y accionables
2. SI una transacción queda pendiente ENTONCES EL sistema DEBERÁ notificar a ambas partes sobre el estado y tiempo estimado de resolución
3. CUANDO se resuelva un error ENTONCES EL sistema DEBERÁ reanudar automáticamente el proceso desde el punto de falla
4. MIENTRAS haya transacciones en proceso EL sistema DEBERÁ permitir consulta del estado via comando de WhatsApp

# Plan de Implementación

- [x] 1. Configurar estructura del proyecto y dependencias principales

  - Crear aplicación Next.js monolítica con API Routes internas
  - Configurar TypeScript, ESLint, Prettier para desarrollo
  - Instalar dependencias: wagmi, reown, tailwindcss, shadcn/ui, supabase
  - Configurar variables de entorno para desarrollo y testing
  - Configurar estructura base de la PWA
    - Crear aplicación Next.js con app directory
    - Configurar Tailwind CSS y shadcn/ui components
    - Implementar PWA manifest y service worker
    - Configurar responsive design mobile-first
  - Crear estructura de servicios en /lib/services/
    - AuthService, WalletService, TransactionService
    - BotService, NotificationService
  - _Requisitos: Todos (base técnica)_

- [x] 2. Implementar modelos de datos y esquemas de base de datos

  - [x] 2.1 Crear tipos TypeScript para entidades principales
    - Definir interfaces User, Transaction, CustodialWallet
    - Crear enums para TransactionStatus y ErrorCodes
    - Implementar tipos de requests/responses de API
    - _Requisitos: 1.3, 7.1, 7.3_
  - [x] 2.2 Configurar esquemas Supabase y migraciones
    - Crear tablas users, transactions, custodial_wallets
    - Implementar triggers para updated_at automático
    - Configurar Row Level Security policies básicas
    - _Requisitos: 1.3, 7.1, 9.3_

- [ ] 3. Desarrollar servicios de autenticación y gestión de usuarios

  - [] 3.1 Implementar Auth Service
    - Crear API Route /api/auth/register para registro por número telefónico
    - Implementar AuthService en /lib/services/auth.ts
    - Configurar JWT token generation y validation
    - _Requisitos: 1.1, 1.2, 1.4_
  - [ ] 3.2 Crear middleware de autenticación
    - Implementar JWT verification en Next.js middleware
    - Configurar rate limiting por número telefónico
    - Añadir logging de requests autenticados
    - _Requisitos: 9.1, 10.4_

- [ ] 4. Implementar Wallet Service y integración blockchain

  - [ ] 4.1 Configurar conexión con Monad testnet
    - Integrar wagmi con configuración Monad
    - Crear provider configuration para testnet
    - Implementar gas price estimation y management
    - _Requisitos: 7.1, 7.2_
  - [] 4.2 Implementar gestión de wallets custodiales
    - Implementar WalletService en /lib/services/wallet.ts
    - Crear función para generar wallets con Para Protocol
    - Implementar almacenamiento seguro de claves privadas
    - Desarrollar funciones de transfer entre wallets custodiales
    - Escribir tests unitarios para operaciones de wallet
    - _Requisitos: 7.1, 7.2, 7.3_
  - [] 4.3 Crear API Routes para Wallet Service
    - Implementar POST /api/wallets/create con validaciones
    - Crear GET /api/wallets/[phone]/balance con cache
    - Desarrollar POST /api/wallets/transfer con retry logic
    - _Requisitos: 7.1, 7.2_

- [x] 5. Desarrollar WhatsApp Bot Service (Planificación completada)

  - [x] 5.1 Configurar integración Twilio WhatsApp API
    - Implementar API Route /api/bot/webhook para mensajes entrantes
    - Crear BotService en /lib/services/bot.ts
    - Configurar templates de mensajes pre-aprobados
    - _Requisitos: 1.1, 4.1, 5.1_
  - [x] 5.2 Implementar parser de intents y gestión de contexto
    - Crear sistema de reconocimiento de comandos (/enviar, /estado)
    - Implementar máquina de estados para conversaciones
    - Desarrollar persistencia de contexto de sesión
    - Escribir tests para flows conversacionales
    - _Requisitos: 1.1, 1.4, 10.4_
  - [x] 5.3 Crear flujos de conversación principales
    - Implementar flujo de registro inicial de usuarios
    - Desarrollar flujo de iniciación de transacciones
    - Crear respuestas automáticas para estados de error
    - _Requisitos: 1.1, 1.2, 2.1, 10.1_

- [ ] 6. Implementar Transaction Service y orquestación

  - [ ] 6.1 Crear API Routes para transacciones
    - Implementar POST /api/transactions/send con validaciones
    - Desarrollar GET /api/transactions/[id]/status con polling
    - Crear POST /api/transactions/[id]/retry para fallos
    - _Requisitos: 2.1, 2.4, 10.2, 10.3_
  - [ ] 6.2 Implementar máquina de estados de transacciones
    - Implementar TransactionService en /lib/services/transaction.ts
    - Crear TransactionStatus enum y transitions
    - Desarrollar funciones para cambios de estado seguros
    - Implementar persistence de estados en Supabase
    - Escribir tests para todas las transiciones válidas
    - _Requisitos: 2.4, 4.1, 5.1, 10.1, 10.2_
  - [ ] 6.3 Desarrollar orquestador de flujo completo
    - Crear función principal processTransaction end-to-end
    - Implementar coordinación entre wallet, on-ramp, off-ramp
    - Desarrollar rollback logic para transacciones fallidas
    - _Requisitos: 2.1, 3.1, 6.1, 7.2_

- [ ] 7. Integrar servicios de on-ramp para pagos

  - [ ] 7.1 Implementar integración con proveedor on-ramp
    - Crear cliente API para proveedor de on-ramp seleccionado
    - Implementar webhook handler para confirmaciones de pago
    - Desarrollar mapping entre estados internos y externos
    - _Requisitos: 3.1, 3.2, 8.1_
  - [ ] 7.2 Crear mock on-ramp para fase de prueba técnica
    - Implementar simulador de pago exitoso con delays realistas
    - Crear endpoints mock que replican API real
    - Desarrollar UI de admin para controlar respuestas mock
    - _Requisitos: Requisito 8 (fase de prueba)_

- [ ] 8. Integrar servicios de off-ramp para retiros

  - [ ] 8.1 Implementar integración SINPE para Nicaragua
    - Crear cliente API para validación de cuentas SINPE
    - Implementar procesamiento de transferencias bancarias
    - Desarrollar webhook handler para confirmaciones de retiro
    - _Requisitos: 6.2, 6.4, 6.5, 8.2_
  - [ ] 8.2 Crear fallback con WalletConnect para pruebas
    - Integrar Reown AppKit en Mini App
    - Implementar conexión con wallets externas
    - Desarrollar flujo de retiro directo a wallet conectada
    - _Requisitos: Requisito 8 (fase de prueba)_

- [ ] 9. Desarrollar Mini App PWA

  - [ ] 9.1 Implementar PaymentFlow component
    - Crear UI para selección de métodos de pago
    - Desarrollar integración con on-ramp providers
    - Implementar validaciones de monto y límites
    - Crear loading states y error handling
    - _Requisitos: 2.1, 2.2, 2.4, 3.1, 3.2_
  - [ ] 9.3 Desarrollar WithdrawalFlow component
    - Crear formularios para datos bancarios/SINPE
    - Implementar validación de cuentas en tiempo real
    - Desarrollar confirmación de retiro con preview
    - Crear progress tracking para off-ramp
    - _Requisitos: 6.1, 6.2, 6.4, 6.5, 6.6_
  - [ ] 9.4 Implementar WalletConnect integration
    - Integrar Reown para conexión de wallets
    - Crear UI para selección de wallets soportadas
    - Implementar retiro directo a wallets conectadas
    - _Requisitos: Requisito 8 (fase de prueba)_

- [ ] 10. Implementar sistema de notificaciones

  - [ ] 10.1 Crear Notification Service
    - Implementar NotificationService en /lib/services/notification.ts
    - Crear API Route /api/notifications/send
    - Desarrollar templates para diferentes tipos de notificación
    - Implementar cola de notificaciones con retry logic
    - Crear sistema de tracking de entrega de mensajes
    - _Requisitos: 4.1, 5.1, 5.3, 6.6_
  - [ ] 10.2 Implementar notificaciones automáticas por estado
    - Crear triggers para cambios de estado de transacciones
    - Desarrollar notificaciones push para Mini App
    - Implementar notificaciones WhatsApp para eventos críticos
    - _Requisitos: 4.1, 4.2, 5.1, 10.2_

- [ ] 11. Desarrollar sistema de validaciones y compliance

  - [ ] 11.1 Implementar validaciones de límites transaccionales
    - Crear reglas de límites diarios/mensuales por usuario
    - Implementar validación de montos mínimos/máximos
    - Desarrollar sistema de alertas para actividad sospechosa
    - _Requisitos: 9.1, 9.2, 9.4_
  - [ ] 11.2 Crear sistema básico de KYC
    - Implementar recolección de datos básicos de usuario
    - Desarrollar validación de números telefónicos únicos
    - Crear audit trail para acciones de compliance
    - _Requisitos: 9.3_

- [ ] 12. Implementar manejo de errores y monitoreo

  - [ ] 12.1 Crear sistema centralizado de logging
    - Implementar structured logging con contexto de transacción
    - Configurar niveles de log apropiados por ambiente
    - Desarrollar dashboard básico para monitoreo en tiempo real
    - _Requisitos: 8.4, 10.1, 10.3_
  - [ ] 12.2 Implementar error handling y recovery
    - Crear mapeo de errores técnicos a mensajes de usuario
    - Desarrollar sistema de retry automático para fallos temporales
    - Implementar circuit breaker para servicios externos
    - _Requisitos: 10.1, 10.2, 10.3_

- [ ] 13. Desarrollar suite de testing completa

  - [ ] 13.1 Crear tests unitarios para servicios críticos
    - Implementar tests para Wallet Service (80% coverage mínimo)
    - Crear tests para Transaction Service state machine
    - Desarrollar tests para Bot Service intent parsing
    - _Requisitos: Todos los requisitos_
  - [ ] 13.2 Implementar tests de integración end-to-end
    - Crear flujo de test completo emisor → receptor
    - Desarrollar tests para escenarios de fallo y recovery
    - Implementar performance tests para 100 transacciones concurrentes
    - _Requisitos: Requisito 8, métricas PRD_

- [ ] 14. Configurar métricas y analytics para validación MVP

  - Implementar tracking de tasa de conversión (objetivo >80%)
  - Crear medición de tiempo end-to-end (objetivo <5min)
  - Desarrollar contador de transacciones exitosas (objetivo 100)
  - Configurar alertas automáticas para métricas fuera de objetivo
  - _Requisitos: 9.4, métricas PRD_

- [ ] 15. Preparar deployment y configuración de entornos
  - Configurar pipeline CI/CD con testing automático para Next.js
  - Crear configuración para entorno de desarrollo y staging
  - Implementar scripts de migración de base de datos
  - Configurar variables de entorno para diferentes providers
  - Configurar deployment de aplicación Next.js monolítica
  - _Requisitos: Infraestructura para todos los requisitos_

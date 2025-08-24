## 🚀 **Guía de Prompt #1: Descripción del Proyecto**

### **Pregunta del Formulario:**

_"Descripción del proyecto: Proporciona una descripción general de tu proyecto en 1 párrafo o menos"_

### **Objetivo de esta Respuesta:**

Crear una **narrativa clara y memorable** que permita a jueces y usuarios entender inmediatamente: ¿Qué problema existe? ¿Cuál es tu idea/solución? ¿Para quién es? Esta es tu única oportunidad de generar el "click" de comprensión.

### **Guía de Prompt para el LLM:**

```
Soy participante del hackathon Mobil3 Powered by Monad y necesito crear una descripción narrativa de mi proyecto que sea instantáneamente clara y memorable para los jueces.

Antes de generar la respuesta, por favor hazme estas 3 preguntas para construir la narrativa:

1. PROBLEMA EN EL MUNDO REAL:
   "¿Cuál es la situación específica y frustante que enfrentan las personas HOY? Describe la experiencia problemática en 1-2 oraciones concretas. (Ejemplo: 'Los estudiantes gastan 3 horas diarias navegando entre 8 apps diferentes para gestionar su vida universitaria')"

2. TU IDEA/SOLUCIÓN EN UN ENUNCIADO:
   "Completa esta frase: 'Nosotros creamos [QUÉ] para que [QUIÉN] pueda [RESULTADO DESEADO] sin [BARRERA QUE ELIMINAMOS]'. Sé específico y concreto."

3. TU VENTAJA COMPETITIVA ÚNICA:
   "¿Qué hace diferente tu proyecto? Puede ser: mercado específico no atendido, experiencia de usuario superior, tecnología innovadora, modelo de negocio único, acceso a datos exclusivos, comunidad especializada, etc. ¿Cuál es tu 'superpoder'?"

Después de mis respuestas, genera un párrafo narrativo que siga esta estructura exacta:

ORACIÓN 1: [Problema específico que existe hoy]
ORACIÓN 2: [Nombre del proyecto] es [tu solución en términos simples]
ORACIÓN 3: [Tu ventaja competitiva única + por qué importa]
ORACIÓN 4: [Para quién es específicamente + contexto del mercado]
ORACIÓN 5: [El resultado/impacto que logras para estos usuarios]

Usa un tono como si estuvieras explicando a un amigo inteligente pero no técnico. Enfócate en el valor humano real y por qué tu enfoque es especial.

```

### **Ejemplos de Output Esperado:**

**Ejemplo A (Performance-focused):\***"Los comercios pequeños en México pierden $2.8B anuales al rechazar pagos con criptomonedas debido al miedo a la volatilidad del precio. MonadPay es un sistema de pagos que convierte automáticamente crypto a pesos mexicanos en el momento exacto de la transacción. Utilizando la velocidad de Monad blockchain, procesamos la conversión en menos de 2 segundos, eliminando completamente el riesgo de volatilidad. Está diseñado para los 2.3 millones de comercios mexicanos que ya aceptan pagos digitales pero temen adoptar crypto. Con MonadPay, estos comercios pueden capturar el mercado crypto sin ningún riesgo financiero, aumentando sus ventas promedio 18%."\*

**Ejemplo B (UX-focused):\***"Los desarrolladores Web3 abandonan el 67% de sus proyectos DeFi porque integrar wallets, contratos y APIs es confuso y consume semanas de desarrollo. BuilderKit es una plataforma no-code que permite crear aplicaciones DeFi completas arrastrando y soltando componentes visuales. Nuestro enfoque único es traducir automáticamente acciones visuales a código Solidity optimizado para Monad, sin que el developer necesite conocer blockchain. Dirigido a los 45,000 desarrolladores frontend en LATAM que quieren entrar a Web3 pero se sienten intimidados por la complejidad técnica. Con BuilderKit, pueden lanzar su primera DApp en 2 horas en lugar de 2 meses, democratizando el acceso al desarrollo blockchain."\*

**Ejemplo C (Market-focused):\***"Las comunidades rurales en México no pueden acceder a servicios financieros digitales porque el 78% no tiene cuenta bancaria tradicional y las fintech existentes requieren documentación urbana. RuralChain es una billetera móvil que funciona con identificación biométrica y permite pagos peer-to-peer usando la red Monad. Nuestro diferenciador es trabajar directamente con líderes comunitarios locales como validators de identidad, creando confianza social en lugar de depender de bancos. Diseñado para los 12 millones de mexicanos en comunidades rurales que tienen smartphone pero no acceso bancario. Con RuralChain, pueden enviar remesas familiares, ahorrar y comerciar sin necesidad de sucursales bancarias, conectando la economía rural directamente al ecosistema digital."\*

---

## 🎯 **Guía de Prompt #2: Planteamiento del Problema**

### **Pregunta del Formulario:**

_"Planteamiento del problema: ¿Qué problema aborda tu proyecto?"_

### **Objetivo de esta Respuesta:**

Demostrar profundo entendimiento del problema real que existe en el mercado, con evidencia específica que justifica la necesidad de una solución.

### **Guía de Prompt para el LLM:**

```
Necesito definir el problema que resuelve mi proyecto para el hackathon Mobil3. El problema debe ser específico, medible y convincente para los jueces.

Antes de generar la respuesta, hazme estas 3 preguntas clave:

1. EVIDENCIA CUANTIFICADA:
   "¿Qué datos específicos, estadísticas o números demuestran que este problema existe y es significativo? (Ejemplo: % de adopción, costos actuales, tiempo perdido, usuarios afectados)"

2. EXPERIENCIA DE USUARIO ACTUAL:
   "Describe paso a paso la experiencia frustante que tienen los usuarios HOY cuando enfrentan este problema. ¿Cuál es el 'journey' problemático actual?"

3. IMPACTO ECONÓMICO/SOCIAL:
   "¿Cuánto dinero, tiempo o oportunidades se pierden debido a este problema? ¿Quién sufre más las consecuencias y por qué es urgente resolverlo?"

Basado en mis respuestas, genera un planteamiento del problema que:
- Empiece con una estadística impactante
- Explique 2-3 barreras específicas que causan el problema
- Incluya el costo/impacto de NO resolver el problema
- Termine con el tamaño del mercado afectado
- Use evidencia específica, no generalidades

Longitud: 100-150 palabras máximo.

```

### **Ejemplo de Output Esperado:**

_"Los comercios en América Latina enfrentan tres barreras críticas para adoptar pagos con criptomonedas: 1) VOLATILIDAD EXTREMA: Bitcoin puede fluctuar 15%+ en un solo día..."_

---

## 🛠️ **Guía de Prompt #3: Solución**

### **Pregunta del Formulario:**

_"Solución: ¿Cómo resuelve tu proyecto este problema? ¿Cuáles son sus funciones y características clave? ¿Qué hace que tu proyecto se destaque frente a las soluciones existentes?"_

### **Objetivo de esta Respuesta:**

Demostrar innovación técnica, diferenciación clara vs competencia, y evidencia de que la solución realmente funciona.

### **Guía de Prompt para el LLM:**

```
Necesito explicar mi solución para el hackathon Mobil3 de manera que demuestre innovación técnica y diferenciación clara vs la competencia.

Por favor hazme estas 3 preguntas específicas antes de generar la respuesta:

1. DIFERENCIACIÓN TÉCNICA CORE:
   "¿Cuáles son las 3 innovaciones técnicas específicas que hacen tu solución única? ¿Qué problema técnico resolviste que otros NO han resuelto? ¿Cómo aprovechas específicamente las ventajas de Monad blockchain?"

2. FUNCIONALIDADES CLAVE + EVIDENCIA:
   "Lista las 4-5 funciones principales de tu proyecto con métricas específicas de performance. (Ejemplo: 'Conversión automática en <2 segundos', 'Fees 90% menores', etc.) ¿Qué evidencia tienes de que funciona?"

3. ANÁLISIS COMPETITIVO ESPECÍFICO:
   "Nombra 2-3 competidores directos existentes y explica exactamente qué hace tu solución que ellos NO hacen. ¿Por qué un usuario elegiría tu solución sobre las alternativas actuales?"

Genera una respuesta estructurada que incluya:

SECCIÓN 1: Cómo Resuelves el Problema (2-3 oraciones)
SECCIÓN 2: Funciones Clave con Métricas (lista con bullets + números específicos)
SECCIÓN 3: Diferenciación vs Competencia (tabla comparativa o bullets)
SECCIÓN 4: Por Qué Monad (1-2 oraciones sobre ventajas técnicas específicas)

Usa emojis para organizar visualmente, incluye métricas específicas, evita marketing fluff.
Longitud: 150-200 palabras máximo.

```

### **Ejemplo de Output Esperado:**

_"MonadPay elimina estas barreras mediante arquitectura técnica innovadora: 🔄 CONVERSIÓN AUTOMÁTICA GARANTIZADA: Smart contracts en Monad procesan conversión crypto→fiat en <500ms..."_

---

## 🎯 **Cómo Usar Estas Guías**

### **Para Participantes del Hackathon:**

1. **Copia el prompt completo** de la sección que necesites
2. **Pégalo en ChatGPT/Claude** tal como está
3. **Responde las 3 preguntas** que el AI te haga
4. **Recibe tu respuesta optimizada** lista para el formulario
5. **Ajusta si es necesario** basado en tu proyecto específico

### **Para Mentores/Facilitadores:**

- **Usa las preguntas** como guía de coaching individual
- **Identifica gaps** cuando equipos no pueden responder las preguntas claramente
- **Apoya en research** de competencia y métricas cuando sea necesario

### **Tips de Optimización:**

⚡ **Sé Específico**: "Reduce costos 90%" > "Reduce costos significativamente"
⚡ **Usa Números**: Métricas reales son más convincentes que descripciones vagas
⚡ **Evidencia Real**: Menciona tests, usuarios, transacciones reales cuando sea posible
⚡ **Diferenciación Clara**: Tabla comparativa vs competencia es muy efectiva

---

## 🏆 **Ejemplo de Sesión Completa**

### **Participante usa Guía #1 (Descripción):**

**AI pregunta**: "¿Cuáles son los 3 componentes técnicos principales de tu proyecto?"

**Participante responde**: "Smart contracts en Monad para pagos, app React Native, API Node.js con integración a exchanges"

**AI pregunta**: "¿Cuál es tu 'superpoder' técnico único?"

**Participante responde**: "Conversión automática crypto a fiat en menos de 2 segundos"

**AI pregunta**: "¿Cómo utilizas específicamente Monad?"

**Participante responde**: "Desplegamos contracts de escrow y oracle, aprovechamos 10k TPS y fees de $0.01"

**AI genera**: Párrafo optimizado listo para el formulario ✅

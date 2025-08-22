# **Product Requirement Document: Remesas por WhatsApp (MVP)**

* **Proyecto:** Sistema de Remesas en WhatsApp  
* **Versión:** 1.0 (MVP)  
* **Fecha:** 22 de Agosto, 2025  
* **Autor:** Gemini Coach & Founder

---

### **1\. Visión General y Contexto**

Estamos construyendo un servicio de remesas que permite a los usuarios enviar dinero internacionalmente de forma sencilla por medio de un mensaje. Utilizando Whatsapp como plataforma principal, eliminando la fricción de las aplicaciones de remesas tradicionales, enfocándonos en la conveniencia y velocidad. El MVP se centrará en el corredor Costa Rica \-\> Nicaragua, validando la experiencia de usuario y la viabilidad técnica para asegurar alianzas estratégicas.

### **2\. Problemática**

**TLDR**, Los inmigrantes nicaragüenses en Costa Rica presentan dificultades al enviar dinero a sus familias debido a las altas comisiones, procesos lentos y la complejidad de los servicios tradicionales.

Los inmigrantes de Nicaragua que residen en Costa Rica se enfrentan a serios desafíos al intentar enviar remesas a sus países de origen. Este problema se manifiesta en tres puntos clave:

1. **Altas Comisiones:** Los servicios tradicionales como Western Union tienen tarifas elevadas y comisiones ocultas en el tipo de cambio.  
2. **Procesos Lentos y Burocráticos:** Pueden tardar varios días en procesarse, lo que genera incertidumbre para las familias que esperan los fondos.  
3. **Alta Fricción y Complejidad:** Las aplicaciones existentes (Fintech o Cripto) requieren que el usuario salga de su flujo de comunicación habitual, pida datos bancarios (CLABE, IBAN) y navegue interfaces complejas.

Nuestra solución ataca directamente la fricción y la desconfianza, haciendo que el envío de dinero sea una parte nativa de una conversación.

### **3\. Personas de Usuario**

* **Emisor (Juan):**  
  * **Perfil:** 20 años, nicaragüense, recolector de café viviendo en Costa Rica.  
  * **Comportamiento:** Usa Whatsapp a diario para hablar con amigos y familia en Costa Rica y Nicaragua. Tiene desconocimiento de los procesos bancarios costarricenses y dificultades con el uso de la tecnología.  
  * **Necesidad:** Quiere enviarle $200 a su papá Miguel en Nicaragua para ayudarles con los gastos del cuido de sus hermanos menores de una forma sencilla, barata y que él pueda controlar sin requerir la asistencia de otras personas o visitar entidades bancarias para lograrlo.  
* **Receptor (Miguel):**  
  * **Perfil:** 55 años, agricultor en Nicaragua, padre de 5 niños.  
  * **Comportamiento:** Usuario de WhatsApp con cuenta bancaria en Nicaragua. Desconocimiento total de sistemas crypto y dificultades con el manejo de la tecnología.  
  * **Necesidad:** Miguel necesita recibir el dinero de Juan directamente en su cuenta bancaria de forma segura y **sin procesos complejos**. Desea la certeza de que el dinero ha llegado y está disponible, sin tener que ir a una sucursal bancaria para confirmarlo. Su prioridad es la **simplicidad y la confianza**, eliminando la fricción de los trámites y la incertidumbre sobre el estado del depósito.

### **4\. Metas y Métricas de Éxito (MVP)**

* **Meta Principal:** Validar que la experiencia de usuario de "enviar dinero como un mensaje" es funcionalmente viable y genera confianza para asegurar alianzas con socios de on/off-ramp.  
* **Métricas de Éxito:**  
  * **Tasa de Conversión (Emisor):** % de usuarios que inician el flujo /enviar y completan exitosamente el pago. **Objetivo: \>80%**  
  * **Tiempo de Transacción (End-to-End):** Tiempo desde que el emisor paga hasta que el receptor tiene el dinero disponible. **Objetivo: \< 5 minutos**  
  * **Volumen de Transacciones:** Alcanzar un mínimo de 100 transacciones exitosas durante la fase de prueba técnica.

### **5\. Requisitos Funcionales del MVP**

#### **User Story 1: Flujo del Emisor**

Como Juan (emisor), quiero enviar dinero a mi contacto de WhatsApp (Miguel) que se encuentra en otros país por medio de un mensaje de Whatsapp.

* **Aceptación:**  
  1. El usuario inicia una conversación con el Bot de Remesas en WhatsApp.  
  2. Realiza una serie de preguntas para obtener la información del emisor.  
  3. Se crea su registro en la miniApp, y se le indica que ya esta su registro completado.  
  4. El usuario introduce el monto a enviar (ej. 150 USD).  
  5. El Bot muestra el monto a enviar y el costo del servicio.  
  6. Se abre una Mini App para procesar el pago.  
  7. La Mini App presenta la opción de pago (Transferir con una Wallet externa, Tarjeta de Crédito/Débito, transferencia bancaria, etc).  
  8. El Bot confirma la transacción al emisor.  
  9. El Bot ofrece al emisor un botón para "Notificar a tu contacto", que le permite reenviar un mensaje pre-configurado y verificado a Miguel, informándole sobre el envío y generando confianza.

#### **User Story 2: Flujo del Receptor**

Como Miguel (receptor), quiero recibir de manera eficiente el dinero que me enviaron junto a una notificación y poder retirarlo a mi cuenta bancaria.

* **Aceptación:**  
  1. El Bot envía un mensaje a Miguel (que nunca ha interactuado con el Bot) informándole: Juan te ha enviado XXXX CRC. Haz clic aquí para recibir tu dinero.  
  2. El mensaje incluye un link que abre la Mini App.  
  3. Dentro de la Mini App, se le da la bienvenida y se le explica brevemente el proceso.  
  4. Se le presenta la opción de retiro para Nicaragua indicando su Cuenta Bancaria.  
  5. Se le pide confirmar el número de teléfono asociado a su cuenta SINPE Móvil (el mismo que usa en WhatsApp).  
  6. El sistema valida la existencia de la cuenta.  
  7. El usuario confirma el retiro.  
  8. El Bot notifica a Miguel que la transferencia ha sido enviada y se reflejará en su cuenta en minutos.

#### **User Story 3: Lógica de Backend y Socios**

Como equipo fundador, necesitamos una infraestructura segura y confiable que orqueste la transacción, interactúe con los socios y mantenga la contabilidad.

* **Aceptación:**  
  1. El sistema crea una wallet custodial asociada al numero de WhatsApp de cada usuario para gestionar los fondos internamente.  
  2. Integración vía API con el third party encargado del on-ramp.  
  3. Integración vía API con el socio de **Off-Ramp** para la dispersión de fondos en Nicaragua.

### **6\. Fase de Prueba Técnica (Pre-Socios)**

Para demostrar la viabilidad del flujo antes de completar las integraciones con Uniteller/SINPE, se ejecutará una versión de prueba:

* **On-Ramp:** Se simulará el pago exitoso.  
* **Lógica Interna:** Se utilizará la blockchain de **Monat** para mover los fondos entre wallets internas asociadas a los números de WhatsApp.  
* **Off-Ramp:** En lugar de la integración con SINPE, la Mini App del receptor le permitirá conectar una wallet (vía **WalletConnect**) para retirar los fondos. **Nota:** Esta fase es puramente para demostración técnica a socios y no se lanzará a los usuarios finales objetivo.

### **7\. Fuera del Alcance del MVP**

* Múltiples corredores geográficos.  
* Envío a grupos de WhatsApp o división de gastos.  
* Múltiples opciones de on/off-ramp (ej. SPEI, efectivo).  
* Un historial de transacciones detallado dentro de la Mini App.

---

### **8\. Equipo de trabajo**

* Pablo Madrigal  
  * Backend y web3 dev  
  * Encargado de integración con WhatsApp  
* Francisco   
  * Frontend dev  
  * Integraciones con BE y Web3   
* Walter   
  * Frontend dev  
  * Diseño de app, integración con WhatsApp  
* Rodrigo  
  * Backend y web3 dev  
  * Encargado de integración con Supabase y Web3

### **9\. Herramientas técnicas obligatorias**

Se va a crear una PWA mobile first utilizando un mono repo con NextJs.

Integraciones:

* Blockchain: [Monad](https://www.monad.xyz/)   
* [reown](https://docs.reown.com/appkit/react/core/installation): Manejo de conexión con wallets   
* [0x.org](http://0x.org): Gassless and swaps  
* [Envio](https://envio.dev/): Indexer for the dashboard data  
* [Twilio](https://www.twilio.com/): SDK para integración con WhatsApp  
* [Supabase](https://supabase.com/): Database management  
* [Taildwind](https://tailwindcss.com/): Manejo de estilos en el app  
* [shadcn](https://ui.shadcn.com/): Ui components  
* [wagmi](https://wagmi.sh/): Monad interaction in the FrontEnd  
* [para](https://docs.getpara.com/v2/react/guides/pregen): Manejo de las wallets preexistentes invisibles al usuario
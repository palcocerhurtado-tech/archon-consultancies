# ARCHON CONSULTANCIES

> Precision. Control. Arquitectura.

## Estructura Del Proyecto

Este repositorio mezcla dos piezas distintas:

`index.html`
: Landing principal y canónica de Archon Consultancies.

`archon.html`
: Variante experimental de la misma marca. No es la página principal.

`quantbot/`
: Copia del proyecto QuantBot con su propia estructura de ejecución.

## Archon Consultancies

Archon es una consultoria de infraestructuras algoritmicas para e-commerce. El objetivo es reducir trabajo manual en operaciones criticas y convertir procesos repetitivos en flujos automatizados, auditables y medibles.

## Arquitectura Archon

- `La Caja Fuerte` (`Airtable`): inventario blindado en base de datos relacional externa.
- `Las Arterias` (`Make` / `n8n`): tienda, banco y almacen conectados en milisegundos.
- `La Aduana de Seguridad` (`Stripe`): ningun pedido avanza sin confirmacion de pago.
- `El Supervisor` (`IA`): auditoria de direcciones y deteccion automatica de anomalias.

## Servicios

- Auditoria Operativa gratuita de 33 minutos.
- Radiografia Operativa: 250 euros.
- Setup Logistica Express: 950 euros.
- Full Stack Cerebro Archon: 2.500 euros.
- Mantenimiento y Calidad Total: 350 euros / mes.

## QuantBot

QuantBot es el proyecto open source de trading algoritmico del repositorio. Usa datos de mercado, features tecnicas, sentimiento y un modelo predictivo para generar señales y ejecutar operaciones en modo controlado.

## Puesta En Marcha

```bash
pip3 install -r requirements.txt
python3 main.py
```

## Notas

- La landing principal es `index.html`.
- `archon.html` queda como variante experimental.
- El bot depende de claves y variables de entorno para los servicios externos.
- La funcion serverless del chatbot esta en `api/chat.js`.
- La guia de despliegue de IA en Vercel esta en `VERCEL_AI_SETUP.md`.
## Autopilot Financiero

Documentos y scripts clave:

- [`PENSION_AUTOPILOT.md`](/Users/pabloalcocer/Desktop/quantbot/PENSION_AUTOPILOT.md)
- [`scripts/pension_plan_calculator.py`](/Users/pabloalcocer/Desktop/quantbot/scripts/pension_plan_calculator.py)
- [`scripts/live_readiness_report.py`](/Users/pabloalcocer/Desktop/quantbot/scripts/live_readiness_report.py)
- [`scripts/bot_autopilot_summary.py`](/Users/pabloalcocer/Desktop/quantbot/scripts/bot_autopilot_summary.py)

Comandos utiles:

```bash
python3 scripts/pension_plan_calculator.py
python3 scripts/live_readiness_report.py
python3 scripts/bot_autopilot_summary.py
```

Regla actual:

- QuantBot no pasa a `live` hasta que el readiness report lo permita.

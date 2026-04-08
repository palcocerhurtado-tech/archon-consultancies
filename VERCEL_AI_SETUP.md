# Despliegue Del Chatbot IA En Vercel

## Variables De Entorno

Anade esta variable en tu proyecto de Vercel:

- `GEMINI_API_KEY`

El valor debe ser tu clave de Gemini y nunca debe ir en el frontend ni en el repositorio.

## Pasos En Vercel

1. Importa esta carpeta como proyecto en Vercel.
2. Entra en `Settings`.
3. Abre `Environment Variables`.
4. Crea `GEMINI_API_KEY` y pegala ahi.
5. Activa la variable al menos para `Production` y `Preview`.
6. Guarda los cambios.
7. Haz un `Redeploy` del ultimo despliegue para que la funcion nueva tome la variable.

## Que Hace El Proyecto

- `package.json`
  - Indica a Vercel que las funciones `api/*.js` usan ES modules.
- `api/chat.js`
  - Funcion serverless que llama a Gemini con `gemini-2.0-flash`.
- `assets/js/archon-chatbot.js`
  - Widget de chat con memoria de sesion, diagnostico guiado y fallback local.
- `assets/css/archon-typography.css`
  - Capa comun de tipografia para `Fraunces` y `Manrope`.

## Comprobacion Rapida

Cuando despliegues:

1. Abre `https://tu-dominio/api/chat`
2. Deberias ver un JSON como este:

```json
{
  "ok": true,
  "configured": true,
  "provider": "gemini",
  "model": "gemini-2.0-flash"
}
```

Si `configured` sale `false`, la variable todavia no esta bien puesta o el despliegue no se ha rehecho.

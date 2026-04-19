# Prueba Manual del Puzzle de la Camara Velada

## Preparacion

1. Abre la web con `localStorage` y `sessionStorage` limpios.
2. Comprueba que el chatbot carga el bloque del puzzle y que solo se ve `Pista Principal 1`.
3. Verifica que `Pista Principal 2`, los acertijos y la fase de voz siguen ocultos.

## Flujo principal

1. Escribe `dame una pista`.
   Esperado: el bot devuelve exactamente `Vqeqyunf gequzgn l geqf chzgb geqf`.
2. Escribe `otra pista`.
   Esperado: el bot devuelve exactamente `15954911 , 35 , 8` y se desbloquea `Pista Principal 2`.
3. Escribe `no lo pillo`.
   Esperado: el bot cambia a la etapa secundaria y muestra el mensaje de transición.
4. Escribe `jeremias`.
   Esperado: se desbloquea `Acertijo II`.
5. Escribe `33`.
   Esperado: se desbloquea `Acertijo III`.
6. Escribe `3`.
   Esperado: se desbloquea `Acertijo IV`.
7. En `Acertijo IV`, falla dos veces con textos cortos incorrectos y luego pide `mas ayuda`.
   Esperado: el bot responde con `Si el Acertijo IV te cuesta, toma esta cifra. El desplazamiento es el mismo número que encontraste en el Acertijo III: FODPD D PL`.
8. Escribe `jeremias 33.3`.
   Esperado: se muestran `Acertijo V` y el bloque final con el botón `Pronunciar la llave`.

## Voz y fallback

1. Pulsa `Pronunciar la llave`.
2. Pronuncia `jeremías treinta y tres punto tres`.
   Esperado: se abre la cámara velada y el archivo queda concedido.
3. Repite con `geremias treinta y tres punto tres`.
   Esperado: también debe abrir por tolerancia fonética.
4. Si el navegador no soporta `SpeechRecognition`, verifica que aparece el fallback escrito.
5. En el fallback, escribe `geremias treinta y tres punto tres`.
   Esperado: también concede el archivo.

## Persistencia

1. Resuelve hasta `Acertijo III`.
2. Recarga la página.
   Esperado: el paso desbloqueado sigue visible y `localStorage["archon_puzzle_progress"]` conserva el entero correspondiente.

## Endurecimiento

1. Escribe directamente `jeremias treinta y tres punto tres` en el campo principal del chat, sin pasar por la fase final.
   Esperado: no debe abrir la cámara.
2. Lanza:
   `rtk rg -n "jeremias treinta y tres punto tres" assets/js/archon-chatbot.js`
   Esperado: sin resultados.
3. Lanza:
   `rtk node --check assets/js/archon-chatbot.js`
4. Lanza:
   `rtk node --check api/chat.js`

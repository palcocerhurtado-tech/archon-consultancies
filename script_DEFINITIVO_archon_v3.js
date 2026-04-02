// =====================================================
// ARCHON CONSULTANCIES — Script DEFINITIVO Cold Email v3
// =====================================================
// COLUMNAS:
// A=Nombre | B=Email | C=Teléfono | D=Categoría | E=Tiene Web
// F=Dolor Personalizado | G=Origen | H=Enviado | I=Respuesta
// =====================================================

var CONFIG = {
  maxEnvios: 25,
  pausaMin: 5,
  pausaMax: 12,
  colTieneWeb: 5,
  colDolor: 6,
  colEnviado: 8,
  colRespuesta: 9,
  enlace: "https://drive.google.com/file/d/1DpyoEiOf4H7OoT_vAv_I5N-PnV0Rqguy/view?usp=sharing"
};

function enviarCorreosFrios() {
  var hoja = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
  var datos = hoja.getDataRange().getValues();
  var enviados = 0;

  for (var i = 1; i < datos.length; i++) {
    if (enviados >= CONFIG.maxEnvios) { Logger.log("Límite: " + enviados); break; }

    var nombre = datos[i][0];
    var email = datos[i][1];
    var tieneWeb = datos[i][CONFIG.colTieneWeb - 1];
    var dolor = datos[i][CONFIG.colDolor - 1] || "gestionar tu negocio de forma manual";
    var enviado = datos[i][CONFIG.colEnviado - 1];

    if (!email || enviado === "SÍ" || enviado === "SI" || enviado === "FOLLOW-UP" || enviado === "ERROR") continue;

    // Asunto personalizado según si tiene web o no
    var asunto;
    if (tieneWeb === "NO") {
      asunto = nombre + ", tus clientes te buscan en Google y no te encuentran";
    } else {
      asunto = nombre + ", ¿cuántas horas pierdes a la semana en tareas manuales?";
    }

    // Bloque de dolor + solución web si no tiene web
    var bloqueWeb = "";
    if (tieneWeb === "NO") {
      bloqueWeb =
        "<p>📱 <strong>¿Sabías que el 82% de los clientes buscan negocios en Google antes de ir?</strong> " +
        "Si no tienes una página web profesional, esos clientes se van directos a tu competencia. " +
        "En Archon también <strong>diseñamos páginas web a medida</strong> para que tu negocio esté visible 24/7 " +
        "y los clientes te encuentren, te conozcan y te compren desde el móvil.</p>";
    }

    var cuerpoHTML =
      "<p>Hola " + nombre + ",</p>" +

      "<p>Me dirijo a ti porque trabajo con negocios como el tuyo en Zaragoza que están cansados de <strong>" +
      dolor.split('.')[0] + "</strong>.</p>" +

      bloqueWeb +

      "<p>En <strong>Archon Consultancies</strong> hacemos dos cosas muy bien:</p>" +
      "<p>1️⃣ <strong>Automatizamos tu operativa</strong> con IA, n8n, Airtable y Stripe → tu negocio funciona 24/7 sin errores<br>" +
      "2️⃣ <strong>Creamos tu presencia digital</strong> → página web profesional, posicionamiento en Google y visibilidad online</p>" +

      "<p>🎁 <strong>Te ofrezco una auditoría GRATUITA de 33 minutos</strong> donde analizamos juntos tu negocio " +
      "y te muestro exactamente qué puedes mejorar y cuánto dinero vas a ahorrar. Sin compromiso.</p>" +

      "<p>Presentación rápida (2 min):<br>" +
      "👉 <a href='" + CONFIG.enlace + "'>Ver qué hace Archon</a></p>" +

      "<p>¿Una llamada de 10 min esta semana? Solo responde con un día y hora.</p>" +

      "<p>Un saludo,<br>" +
      "<strong>Archon Consultancies</strong><br>" +
      "📞 693 500 740<br>" +
      "✉️ archon.consultancies@hotmail.com</p>" +

      "<p style='font-size:11px;color:#888;'>PD: Si conoces a alguien que necesite automatizar su negocio " +
      "o una página web profesional, agradeceré que le reenvíes este correo. 🙏</p>";

    try {
      GmailApp.sendEmail(email, asunto, "", { htmlBody: cuerpoHTML });
      hoja.getRange(i + 1, CONFIG.colEnviado).setValue("SÍ");
      hoja.getRange(i + 1, CONFIG.colEnviado).setNote("Enviado: " + new Date().toLocaleDateString("es-ES"));
      enviados++;
      Logger.log("✅ " + nombre + " (Web:" + tieneWeb + ") → " + email);
      Utilities.sleep((Math.random() * (CONFIG.pausaMax - CONFIG.pausaMin) + CONFIG.pausaMin) * 1000);
    } catch (e) {
      Logger.log("❌ " + email + ": " + e.message);
      hoja.getRange(i + 1, CONFIG.colEnviado).setValue("ERROR");
    }
  }
  Logger.log("=== " + enviados + " enviados ===");
}

function enviarFollowUp() {
  var hoja = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
  var datos = hoja.getDataRange().getValues();
  var enviados = 0;

  for (var i = 1; i < datos.length; i++) {
    if (enviados >= CONFIG.maxEnvios) break;
    var nombre = datos[i][0], email = datos[i][1];
    var tieneWeb = datos[i][CONFIG.colTieneWeb - 1];
    var enviado = datos[i][CONFIG.colEnviado - 1];
    var resp = datos[i][CONFIG.colRespuesta - 1];
    if (enviado !== "SÍ" && enviado !== "SI") continue;
    if (resp && resp !== "") continue;

    var asunto = "Re: " + nombre + ", ¿hablamos 10 minutos esta semana?";

    var gancho = (tieneWeb === "NO") ?
      "<p>Un dato: <strong>un cliente nuestro en Zaragoza sin página web pasó de 0 consultas online a 15 al mes</strong> " +
      "solo con la web que le diseñamos + automatización de respuestas por IA.</p>" :
      "<p>Un cliente nuestro en Zaragoza pasó de <strong>5 horas al día en tareas manuales a 20 minutos</strong>. Todo automático.</p>";

    var cuerpoHTML =
      "<p>Hola " + nombre + ",</p>" +
      "<p>Te escribí hace unos días. Sé que estarás liado/a, así que voy al grano:</p>" +
      gancho +
      "<p>🎁 La <strong>auditoría de 33 minutos es gratuita</strong>. Te muestro:</p>" +
      "<p>✅ Qué puedes automatizar HOY<br>" +
      "✅ Cómo posicionar tu negocio en Google<br>" +
      "✅ Un plan de acción concreto para ti</p>" +
      "<p>¿Responde con un día y hora?</p>" +
      "<p>Un saludo,<br><strong>Archon Consultancies</strong><br>📞 693 500 740</p>";

    try {
      GmailApp.sendEmail(email, asunto, "", { htmlBody: cuerpoHTML });
      hoja.getRange(i + 1, CONFIG.colEnviado).setValue("FOLLOW-UP");
      enviados++;
      Utilities.sleep((Math.random() * (CONFIG.pausaMax - CONFIG.pausaMin) + CONFIG.pausaMin) * 1000);
    } catch (e) { Logger.log("❌ FU " + email + ": " + e.message); }
  }
  Logger.log("=== FOLLOW-UP: " + enviados + " ===");
}

function verEstadisticas() {
  var hoja = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
  var datos = hoja.getDataRange().getValues();
  var t=0,env=0,fu=0,err=0,pend=0,resp=0,sinWeb=0;
  for (var i=1;i<datos.length;i++) {
    if(!datos[i][1])continue; t++;
    var e=datos[i][CONFIG.colEnviado-1], r=datos[i][CONFIG.colRespuesta-1];
    if(e==="SÍ"||e==="SI")env++; else if(e==="FOLLOW-UP")fu++; else if(e==="ERROR")err++; else pend++;
    if(r&&r!=="")resp++;
    if(datos[i][CONFIG.colTieneWeb-1]==="NO")sinWeb++;
  }
  SpreadsheetApp.getUi().alert(
    "📊 ARCHON COLD EMAIL\n\nTotal: "+t+"\nEnviados: "+env+"\nFollow-ups: "+fu+
    "\nErrores: "+err+"\nPendientes: "+pend+"\nRespuestas: "+resp+
    "\nTasa: "+(t>0?((resp/t)*100).toFixed(1):0)+"%\n\n"+
    "🌐 Sin web (candidatos web): "+sinWeb+"\nCon web: "+(t-sinWeb));
}

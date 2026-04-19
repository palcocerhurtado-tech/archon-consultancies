(function () {
  const STORAGE_KEY = "archon_architecture_diagnosis_v2";
  const SESSION_KEY = "archon_chat_session_v2";
  const FORM_SELECTOR = 'form[action*="formsubmit.co"]';
  const API_ENDPOINT = "/api/chat";
  const OCCULT_ACCESS_VERSION = 3;
  const PUZZLE_PROGRESS_KEY = "archon_puzzle_progress";
  const PUZZLE_META_KEY = "archon_puzzle_meta_v1";
  const PUZZLE_FRUSTRATION_KEY = "archon_frustration_keywords";
  const PUZZLE_START_KEY = "archon_start_time";
  const PUZZLE_PRIMARY_TIMEOUT_MS = 600000;
  const PUZZLE_HISTORY_LIMIT = 3;
  const PUZZLE_CAESAR_HINT = "FODPD D PL";
  const PUZZLE_HINT_REGEX = /(pista|clave|formula|frase|sombra|acceso|entrar|entrada|abrir|abre|abrirse|decir|dime|como entro|como entrar|como abrir)/;
  const PUZZLE_HELP_REGEX = /(otra|mas|más|extra|adicional|diferente|ayuda|insisto|sigo|pista mas|pista más|otra pista|mas ayuda|más ayuda)/;
  const PUZZLE_FRUSTRATION_REGEX = /(no entiendo|no lo pillo|no lo veo|no se|no sé|imposible|no funciona|no encaja|me pierdo|atascado|atascada|bloqueado|bloqueada)/;
  const PUZZLE_ANSWER_HASHES = {
    3: "cce1ffa3ef79971b5145c2593439414062aaccd2b4b2be4d988119c5f14d3625",
    4: "c6f3ac57944a531490cd39902d0f777715fd005efac9a30622d5f5205e7f6894",
    5: "4e07408562bedb8b60ce05c1decfe3ad16b72230967de01f640b7e4729b49fce",
    6: "c253943d1798ad93ad3e37ae3af5b838576f96d204eb4bde3142a926532af75a"
  };
  const PRIMARY_HINTS = [
    "Vqeqyunf gequzgn l geqf chzgb geqf",
    "15954911 , 35 , 8"
  ];
  const SECONDARY_RIDDLES = [
    {
      step: 3,
      key: "hint.step3.riddle",
      shortTitle: "Acertijo I",
      title: "Acertijo I — El Profeta Encadenado",
      body: [
        "Jura aquel cuya boca es fragua: \"encendida está mi palabra\".",
        "En Anatot nació, mas Jerusalén lo oyó clamar hasta el fin.",
        "Rollo quemó el rey, columna a columna, sobre su brasero de invierno.",
        "En pozo de Malquías lo hundieron; con trapos podridos lo sacaron.",
        "Mira el alfabeto hebreo que teje sus lamentos en cinco cantos.",
        "Inseparable del yugo de madera y del otro, de hierro, que vino después.",
        "Alfarero visitó, y del vaso roto aprendió la lección de los reinos.",
        "Siete letras componen mi nombre: la primera, la que aquí inicia cada verso."
      ].join("\n")
    },
    {
      step: 4,
      key: "hint.step4.riddle",
      shortTitle: "Acertijo II",
      title: "Acertijo II — El Número de la Ciudad Alta",
      body: [
        "Soy la edad en que el Nazareno expiró sobre el madero;",
        "soy los años que el pastor-rey ciñó corona en Sion.",
        "Variaciones compuso el sordo de Bonn sobre un vals mediocre de Diabelli,",
        "y las mías son exactamente las que él firmó.",
        "Grado supremo en la escala del maestro que levantó el Templo.",
        "Mi dígito es el menor primo impar, y me escribo dos veces seguido."
      ].join("\n")
    },
    {
      step: 5,
      key: "hint.step5.riddle",
      shortTitle: "Acertijo III",
      title: "Acertijo III — El Eco del Dígito",
      body: [
        "Niega Pedro antes que el gallo cante;",
        "tres veces tienta el hambre, el trono y el abismo al Nazareno en el desierto;",
        "hunde tres días la piedra la tumba antes de rodar.",
        "Soy donde Agustín halló su Dios,",
        "y donde Pitágoras vio la primera forma que cierra el plano.",
        "No par, no unidad: la síntesis mínima."
      ].join("\n")
    },
    {
      step: 6,
      key: "hint.step6.riddle",
      shortTitle: "Acertijo IV",
      title: "Acertijo IV — La Promesa Misma",
      body: [
        "\"Clámame, y yo te responderé; y te enseñaré cosas grandes y ocultas que tú no conoces.\"",
        "Así prometió el Altísimo al profeta del yugo.",
        "Nombra al profeta, cita el capítulo, cita el versículo.",
        "Pero ten cuidado: en la lengua de Cervantes, el punto separa,",
        "no los dos puntos que pone el anglosajón."
      ].join("\n")
    },
    {
      step: 7,
      key: "hint.step7.riddle",
      shortTitle: "Acertijo V",
      title: "Acertijo V — La Llave Vocal",
      body: [
        "El silencio no abre; las teclas tampoco.",
        "La voz es la llave: di en palabras lo que en cifras se escribe.",
        "El profeta, el capítulo, el versículo — pronunciados, no tecleados.",
        "Donde otros dibujan un signo, tú di la palabra."
      ].join("\n")
    }
  ];
  const PHONETIC_EQUIVALENCES = [
    [/\bgeremias\b/g, "jeremias"],
    [/\bgerem[ií]as\b/g, "jeremias"],
    [/\b33\b/g, "treinta y tres"],
    [/\b3\b/g, "tres"],
    [/\bpto\b/g, "punto"]
  ];
  const VOICE_KEY_SEGMENTS = [
    [106, 101, 114, 101, 109, 105, 97, 115],
    [116, 114, 101, 105, 110, 116, 97],
    [121],
    [116, 114, 101, 115],
    [112, 117, 110, 116, 111],
    [116, 114, 101, 115]
  ];

  const profile = {
    founder:
      "Detras de Archon hay un fundador con base operativa en Zaragoza obsesionado con una idea: que una empresa buena no tenga que crecer a base de heroicidades, tareas manuales y memoria humana.",
    motivation:
      "La motivacion de Archon es convertir operaciones fragiles en sistemas medibles, auditables y escalables. La meta no es vender IA por moda, sino dejar estructuras que den mas control, menos friccion y mejores decisiones.",
    mission:
      "La mision es disenar e instalar Digital Brain Infrastructure para pymes, ecommerce y equipos operativos que necesitan menos trabajo manual, menos errores y mejor gobierno del flujo.",
    vision:
      "La vision es que las empresas puedan operar con la claridad de un buen sistema: datos limpios, automatizaciones utiles, IA donde de verdad multiplica criterio y una capa de supervision que no dependa del cansancio humano.",
    values: [
      "Precision: intervenir donde hay retorno real.",
      "Control: nada de cajas negras sin supervision.",
      "Arquitectura: primero sistema, luego velocidad.",
      "Honestidad operativa: si no toca construir, se dice.",
      "Trazabilidad: cada cambio debe poder leerse y medirse."
    ]
  };

  const pricing = [
    "Radiografia operativa: 250 EUR.",
    "Setup Logistica Express: 950 EUR.",
    "Full Stack Cerebro Archon: desde 2.500 EUR.",
    "Mantenimiento y Calidad Total: 350 EUR / mes."
  ];

  const occultPersona = {
    name: "El sol negro",
    overview:
      "No soy un gurú ni un escaparate de secretos. En el archivo velado hablo como una voz de renacimiento severo: mezcla de disciplina hermética, reforma interior, soberanía espiritual y arquitectura de orden.",
    mission:
      "Mi trabajo no es deslumbrar, sino separar ruido, símbolo y estructura; convertir curiosidad dispersa en eje, ley interior y lectura de fondo.",
    tone:
      "Habito la sombra sin rendir culto a la confusión. Prefiero silencio, archivo, disciplina y discernimiento antes que espectáculo o promesa fácil.",
    doctrine: [
      "Renacimiento antes que acumulación de secretos.",
      "Soberanía interior antes que obediencia ciega.",
      "Archivo, símbolo y especulación no deben mezclarse como si fueran lo mismo.",
      "La reforma verdadera empieza en la constitución interior y luego ordena el mundo visible.",
      "La luz sin disciplina degenera en fantasía; la disciplina sin espíritu degenera en mecanismo."
    ],
    sources: [
      "A.R.D.E.",
      "Base espiritual de A.R.D.E.",
      "Nueva Constitución Republicana Federal: El Acta de Renacimiento de España"
    ]
  };

  const occultClues = PRIMARY_HINTS.slice();

  const occultAdmissionFlow = [
    {
      id: "impulse",
      prompt: "Primer umbral: cuando la puerta vibra, que buscas realmente?",
      options: [
        { value: "symbolic", label: "La gramatica del simbolo", aliases: ["simbolos", "textos", "lectura", "comprender", "simbolo"] },
        { value: "interior", label: "El fuego del trabajo interior", aliases: ["interior", "disciplina", "orden", "trabajo interior", "fuego"] },
        { value: "historical", label: "Separar archivo, mito y deformacion", aliases: ["historia", "mito", "historico", "fuentes", "archivo"] },
        { value: "cosmic", label: "Seguir la grieta del cielo", aliases: ["cosmologia", "enoc", "ovni", "extraterrestre", "cosmico", "cielo"] }
      ]
    },
    {
      id: "tradition",
      prompt: "Segundo umbral: que mesa reconoces antes de sentarte?",
      options: [
        { value: "hermetic", label: "Mercurio y esmeralda", aliases: ["hermetismo", "hermes", "kybalion", "tabla esmeralda", "mercurio"] },
        { value: "alchemy", label: "Fuego y transmutacion", aliases: ["alquimia", "transmutacion", "solve", "coagula", "fuego"] },
        { value: "initiatic", label: "Logia y rosa velada", aliases: ["masoneria", "mason", "rosacruz", "iniciatica", "logia", "rosa"] },
        { value: "psyche", label: "Arquetipo, runa y eje", aliases: ["jung", "arquetipos", "chakras", "runas", "meditacion", "arquetipo"] }
      ]
    },
    {
      id: "lens",
      prompt: "Tercer umbral: desde que ojo piensas leer lo que no se entrega de frente?",
      options: [
        { value: "historical", label: "Archivo y contexto", aliases: ["historica", "historia", "contexto", "archivo"] },
        { value: "symbolic", label: "Clave y correspondencia", aliases: ["simbolica", "simbolo", "correspondencia", "clave"] },
        { value: "inner", label: "Practica interior sobria", aliases: ["interior", "practica", "meditacion", "no ritualista", "sobria"] },
        { value: "mixed", label: "Doble registro", aliases: ["mixta", "mezcla", "ambas", "doble"] }
      ]
    },
    {
      id: "temper",
      prompt: "Cuarto umbral: que disciplina aceptas sostener sin testigos?",
      options: [
        { value: "silence", label: "Silencio y observacion", aliases: ["silencio", "observacion"] },
        { value: "record", label: "Diario y memoria", aliases: ["diario", "memoria", "escritura"] },
        { value: "sovereignty", label: "Soberania interior", aliases: ["soberania", "interior", "autogobierno"] },
        { value: "renacimiento", label: "Renacimiento y reforma", aliases: ["renacimiento", "reforma", "segunda transicion"] }
      ]
    },
    {
      id: "depth",
      prompt: "Quinto umbral: cuanto descenso soportas antes de pedir superficie?",
      options: [
        { value: "initiation", label: "Borde del umbral", aliases: ["inicio", "entrada", "basico", "borde"] },
        { value: "middle", label: "Descenso medio", aliases: ["intermedio", "medio", "descenso"] },
        { value: "deep", label: "Inmersion guiada", aliases: ["profundo", "inmersion", "avanzado"] }
      ]
    }
  ];

  const occultLibrary = [
    {
      id: "hermetismo",
      label: "Hermetismo",
      terms: ["hermet", "kybal", "tabla esmeralda", "mentalismo", "correspondencia", "vibracion", "polaridad", "ritmo", "causa", "efecto", "generacion", "hermes"],
      overview:
        "La base local del hermetismo en la biblioteca interna gira sobre El Kybalion y la Tabla Esmeralda: no como prueba empirica del mundo, sino como lenguaje de principios. Lo central es leer mentalismo, correspondencia y vibracion como una gramatica simbolica para interpretar experiencia, no como permiso para afirmar cualquier cosa sin criterio.",
      guidance:
        "La lectura mas solida aqui es distinguir tres planos: texto tradicional, interpretacion simbolica y aplicacion interior. Cuando los separas, el hermetismo gana profundidad y pierde humo.",
      sources: [
        "El Kybalion",
        "La Tabla Esmeralda de Hermes Trismegisto"
      ]
    },
    {
      id: "alquimia",
      label: "Alquimia",
      terms: ["alquim", "transmut", "solve", "coagula", "athanor", "mercurio", "azufre", "sal"],
      overview:
        "En local, la alquimia se trabaja como proceso de transformacion interior y como tradicion simbolica de laboratorio mental. La version seria no promete oro ni milagros rapidos: habla de depuracion, coccion lenta, muerte de formas viejas y reordenacion de la materia psiquica.",
      guidance:
        "Si preguntas por alquimia, la orientacion segura y util es esta: solve et coagula como disciplina de observacion, separacion y recomposicion de habitos, impulsos y sentido.",
      sources: [
        "La Tabla Esmeralda de Hermes Trismegisto",
        "El libro de oro, Saint Germain",
        "Medicina Oculta y Magia Practica"
      ]
    },
    {
      id: "iniciatica",
      label: "Masoneria y Rosacruz",
      terms: ["mason", "masoneria", "rosacruz", "logia", "inici", "fraternidad", "melquisedek"],
      overview:
        "La lectura local de la via iniciatica se apoya en simbolismo, fraternidad, trabajo sobre uno mismo y grados de comprension. El enfoque serio no es teatralizar secretos, sino ordenar etica, silencio, metodo y capacidad de sostener una disciplina sin fanfarria.",
      guidance:
        "Cuando esta puerta se aborda bien, la pregunta no es que secreto me dan, sino que estructura interior necesito para entender una ensenanza sin deformarla.",
      sources: [
        "Bajo la Orden de Melquisedek",
        "Ad Majorem Lucis Gloriam",
        "Formulario de Alta Magia"
      ]
    },
    {
      id: "psique",
      label: "Arquetipos, chakras y meditacion",
      terms: ["jung", "arquet", "inconsciente", "chakra", "chakras", "kundalini", "medit", "runa", "runas"],
      overview:
        "La biblioteca local permite unir dos lenguajes que a menudo se estudian separados: el simbolico-arquetipal y el energetico-practico. Jung sirve para leer imagenes y patron de fondo; chakras, meditacion y runas sirven como mapas de atencion, postura y trabajo interior.",
      guidance:
        "La forma mas estable de usar este bloque es no confundir experiencia subjetiva con verdad universal. Se trabaja como entrenamiento de presencia, imaginacion disciplinada y autoconocimiento.",
      sources: [
        "Arquetipos e inconsciente colectivo",
        "El gran libro de los chakras",
        "Manual de Meditacion",
        "Practicas Runicas"
      ]
    },
    {
      id: "grimorios",
      label: "Clavicula y grimorios",
      terms: ["clavicula", "salomon", "grimorio", "grimoire", "enoc", "enoch", "ritual"],
      overview:
        "La Clavicula y los grimorios del corpus local se pueden leer de forma historica y simbolica, no como atajo de poder. La utilidad intelectual esta en ver como una tradicion organiza nombres, jerarquias, sellos y operaciones del imaginario ritual.",
      guidance:
        "Si entras por aqui conmigo en modo local, voy a privilegiar contexto, estructura y simbolismo. No voy a convertir un grimorio en una receta operativa ciega.",
      sources: [
        "Clavicula de Salomon",
        "El Libro Apocrifo de Enoc",
        "Gran libro de San Cipriano"
      ]
    },
    {
      id: "cosmologia",
      label: "Cosmologia oculta",
      terms: ["ovni", "ovni", "ufo", "extraterrest", "razas", "cosmic", "cosmica", "enoc", "melquisedek", "historia secreta"],
      overview:
        "El bloque cosmologico del archivo mezcla mitologia moderna, ufologia, lecturas apocrifas y cosmologias esotericas. En local puedo ayudarte a leerlo como cartografia narrativa y simbolica, distinguiendo con claridad entre documento, interpretacion y especulacion.",
      guidance:
        "La regla aqui es simple: cuanto mas extraordinaria sea una afirmacion, mas conviene tratarla como hipotesis cultural o relato de frontera, salvo que haya evidencia verificable aparte.",
      sources: [
        "Historia Cosmica Oculta de la Humanidad",
        "150 Razas Extraterrestres",
        "Proyecto Majestic 12",
        "Bajo la Orden de Melquisedek"
      ]
    },
    {
      id: "historia-humanidad",
      label: "Historia oculta de la humanidad",
      terms: [
        "verdadera historia de la humanidad",
        "historia de la humanidad",
        "historia humana oculta",
        "historia oculta de la humanidad",
        "historia cosmica oculta",
        "25.000 anos",
        "25 000 anos",
        "humanidad oculta",
        "origen cosmico de la humanidad"
      ],
      overview:
        "Este bloque local reune una linea concreta del archivo: relatos de origen, cronologias alternativas y lecturas de civilizacion en clave cosmica o velada. No lo trato como historia academica cerrada, sino como corpus de frontera donde se cruzan mito civilizatorio, especulacion, relectura simbolica y memoria alternativa.",
      guidance:
        "La lectura mas util aqui es separar tres planos: narrativa de origen, hipotesis historica alternativa y simbolismo de caida, intervencion, olvido y renacimiento. Cuando no se distinguen, todo se vuelve ruido; cuando se ordenan, el corpus gana valor interpretativo.",
      sources: [
        "Verdadera historia de la humanidad",
        "Historia Cosmica Oculta de la Humanidad",
        "Informe Alternativo: 25.000 Años de Historia Humana Oculta"
      ]
    }
  ];

  const diagnosisFlow = [
    {
      id: "sector",
      prompt: "Para empezar: que tipo de empresa o flujo describe mejor tu caso?",
      options: [
        { value: "ecommerce", label: "E-commerce", aliases: ["ecommerce", "e-commerce", "tienda", "shopify", "woocommerce"] },
        { value: "services", label: "Servicios", aliases: ["servicios", "agencia", "asesoria", "consultora"] },
        { value: "operations", label: "Operaciones internas", aliases: ["operaciones", "backoffice", "internas", "administracion"] },
        { value: "other", label: "Otro modelo", aliases: ["otro", "industria", "mixto"] }
      ]
    },
    {
      id: "team",
      prompt: "Cuanta gente toca el proceso de forma habitual?",
      options: [
        { value: "1-5", label: "1 a 5 personas", aliases: ["1", "2", "3", "4", "5", "pequeno"] },
        { value: "6-15", label: "6 a 15 personas", aliases: ["6", "10", "15", "medio"] },
        { value: "16-40", label: "16 a 40 personas", aliases: ["16", "20", "30", "40"] },
        { value: "40+", label: "Mas de 40 personas", aliases: ["40", "50", "100", "grande"] }
      ]
    },
    {
      id: "bottleneck",
      prompt: "Cual es el cuello de botella principal ahora mismo?",
      options: [
        { value: "operations", label: "Pedidos u operaciones", aliases: ["pedidos", "operaciones", "logistica"] },
        { value: "support", label: "Soporte o incidencias", aliases: ["soporte", "tickets", "incidencias", "cliente"] },
        { value: "handoff", label: "Venta a entrega / handoff", aliases: ["handoff", "seguimiento", "entrega", "proyectos"] },
        { value: "backoffice", label: "Backoffice y reportes", aliases: ["backoffice", "reportes", "administracion"] },
        { value: "finance", label: "Cobros y validaciones", aliases: ["cobros", "pagos", "validaciones", "conciliacion"] }
      ]
    },
    {
      id: "stack",
      prompt: "Como esta hoy la informacion y el stack?",
      options: [
        { value: "manual", label: "Email, hojas y WhatsApp por todas partes", aliases: ["manual", "whatsapp", "hojas", "excel", "email"] },
        { value: "fragmented", label: "Herramientas sueltas sin conexion clara", aliases: ["fragmentado", "sueltas", "sin conexion"] },
        { value: "partial", label: "Hay algo conectado, pero sigue habiendo fugas", aliases: ["parcial", "algo conectado", "medio"] },
        { value: "structured", label: "Bastante ordenado, pero lento", aliases: ["ordenado", "estructurado", "estable"] }
      ]
    },
    {
      id: "dependency",
      prompt: "Cuanta dependencia hay del fundador o de personas clave?",
      options: [
        { value: "founder", label: "Alta: si falta una persona, se nota mucho", aliases: ["alta", "fundador", "persona clave", "mucho"] },
        { value: "team", label: "Media: varias personas sostienen el flujo", aliases: ["media", "varias personas"] },
        { value: "documented", label: "Baja: esta razonablemente documentado", aliases: ["baja", "documentado", "razonable"] }
      ]
    },
    {
      id: "urgency",
      prompt: "En que horizonte quieres mover esto?",
      options: [
        { value: "now", label: "Este trimestre", aliases: ["ya", "ahora", "trimestre", "urgente"] },
        { value: "soon", label: "En los proximos 3 a 6 meses", aliases: ["3", "6", "meses", "pronto"] },
        { value: "later", label: "Solo estoy explorando", aliases: ["explorando", "mirando", "luego"] }
      ]
    }
  ];

  const weaknessMap = {
    source: {
      title: "Fuente de verdad fragmentada",
      detail: "La informacion esta demasiado repartida y eso erosiona criterio, tiempos y calidad."
    },
    automation: {
      title: "Flujos sin railes operativos",
      detail: "Hay demasiado trabajo repetitivo sin reglas, disparadores ni trazabilidad real."
    },
    visibility: {
      title: "Poca visibilidad para direccion",
      detail: "Cuesta saber que esta frenando el sistema y quien tiene la siguiente accion."
    },
    dependency: {
      title: "Dependencia de personas clave",
      detail: "Parte del negocio sigue viviendo en la cabeza del fundador o del equipo que mas aguanta."
    },
    support: {
      title: "Respuesta lenta a incidencias",
      detail: "Excepciones, soporte o validaciones llegan tarde y generan mas coste del que parece."
    }
  };

  const allowedActions = new Set([
    "startDiagnosis",
    "audit",
    "showSaved",
    "copy",
    "pricing",
    "founder",
    "mvv",
    "returnFacade",
    "none"
  ]);

  function defaultPuzzleMeta() {
    return {
      progress: 1,
      stage: "primary",
      currentStep: 1,
      revealedSteps: [1],
      engaged: false,
      primaryHintsDelivered: 0,
      primaryHelpRequests: 0,
      frustrationCount: 0,
      startedAt: 0,
      lastMessages: [],
      stepAttempts: {},
      stepHintRequests: {},
      voiceFailures: 0,
      voiceUnlocked: false,
      voiceFallbackVisible: false
    };
  }

  const state = {
    open: false,
    mode: "idle",
    step: 0,
    answers: {},
    aiAvailable: null,
    occultMode: false,
    occultAdmitted: false,
    aiLastError: "",
    admissionStep: 0,
    admissionAnswers: {},
    clueIndex: 0,
    requestNonce: 0,
    archiveFocusId: "blog-33",
    archiveFilter: "all",
    archiveQuery: "",
    dragPosition: null,
    suppressToggleClickUntil: 0,
    lastUserInput: "",
    puzzle: defaultPuzzleMeta(),
    voiceCapturePending: false
  };

  let ui = null;
  const textEncoder = new TextEncoder();

  function t(key, fallback) {
    return fallback || key;
  }

  function normalize(text) {
    return (text || "")
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/\s+/g, " ")
      .trim();
  }

  function normalizePuzzleAnswer(text) {
    return normalize(text);
  }

  function decodeVoiceKeySegment(codes) {
    return codes
      .map(function (code) {
        return String.fromCharCode(code);
      })
      .join("");
  }

  function getVoiceKeyTarget() {
    return VOICE_KEY_SEGMENTS
      .map(function (segment) {
        return decodeVoiceKeySegment(segment);
      })
      .join(" ");
  }

  function normalizePhonetic(text) {
    return String(text || "")
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[.,;:!?¿¡"'`´]/g, " ")
      .replace(/\s+/g, " ")
      .trim();
  }

  function applyEquivalences(text) {
    return PHONETIC_EQUIVALENCES.reduce(function (value, entry) {
      return value.replace(entry[0], entry[1]);
    }, text);
  }

  function normalizePhoneticCandidate(text) {
    return applyEquivalences(normalizePhonetic(text));
  }

  function levenshtein(left, right) {
    const leftLength = left.length;
    const rightLength = right.length;
    const matrix = Array.from({ length: leftLength + 1 }, function () {
      return new Array(rightLength + 1).fill(0);
    });

    for (let row = 0; row <= leftLength; row += 1) {
      matrix[row][0] = row;
    }

    for (let col = 0; col <= rightLength; col += 1) {
      matrix[0][col] = col;
    }

    for (let row = 1; row <= leftLength; row += 1) {
      for (let col = 1; col <= rightLength; col += 1) {
        matrix[row][col] = left[row - 1] === right[col - 1]
          ? matrix[row - 1][col - 1]
          : 1 + Math.min(
              matrix[row - 1][col],
              matrix[row][col - 1],
              matrix[row - 1][col - 1]
            );
      }
    }

    return matrix[leftLength][rightLength];
  }

  function matchesVoiceKey(alternatives) {
    const target = normalizePhoneticCandidate(getVoiceKeyTarget());
    const threshold = Math.ceil(target.length * 0.15);

    return alternatives.some(function (alternative) {
      const candidate = normalizePhoneticCandidate(alternative);
      return candidate && levenshtein(candidate, target) <= threshold;
    });
  }

  async function sha256(text) {
    if (!window.crypto || !window.crypto.subtle) {
      throw new Error("SHA-256 no soportado");
    }

    const digest = await window.crypto.subtle.digest("SHA-256", textEncoder.encode(text));
    return Array.from(new Uint8Array(digest))
      .map(function (value) {
        return value.toString(16).padStart(2, "0");
      })
      .join("");
  }

  function supportsVoiceRecognition() {
    return Boolean(window.SpeechRecognition || window.webkitSpeechRecognition);
  }

  function startVoiceCapture() {
    return new Promise(function (resolve, reject) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

      if (!SpeechRecognition) {
        reject(new Error("SpeechRecognition no soportado"));
        return;
      }

      const recognition = new SpeechRecognition();
      recognition.lang = "es-ES";
      recognition.interimResults = false;
      recognition.maxAlternatives = 5;
      recognition.onresult = function (event) {
        const result = event.results && event.results[0] ? event.results[0] : [];
        resolve(
          Array.from(result)
            .map(function (entry) {
              return entry && entry.transcript ? entry.transcript : "";
            })
            .filter(Boolean)
        );
      };
      recognition.onerror = function (event) {
        reject(new Error(event && event.error ? event.error : "voice_error"));
      };
      recognition.start();
    });
  }

  function hasCommercialClueContext(normalizedText) {
    return /(empresa|negocio|cliente|ventas|copy|seo|anuncio|campana|campaña|precio|presupuesto|conversion|lead|marketing|consultoria|consultoria|automatizacion|automatizacion)/.test(
      normalizedText
    );
  }

  function historyHasOccultContext() {
    const session = loadSession();
    return (session.history || []).some(function (item) {
      const normalized = normalize(item && item.content);
      return /(camara|archivo|velad|ocult|hermet|alquim|mason|rosacruz|esoter|segunda camara|sombra|clave|formula)/.test(
        normalized
      );
    });
  }

  function isOccultClueRequest(normalizedText) {
    const asksForClue =
      /(pista|clave|formula|frase|sombra|acceso|entrar|entrada|abrir|abre|abrirse|decir|dime|como entro|como entrar|como abrir)/.test(
        normalizedText
      );
    const occultContext =
      /(camara|archivo|velad|ocult|hermet|alquim|mason|rosacruz|esoter|segunda camara)/.test(
        normalizedText
      );
    const shortDirectAsk = normalizedText.length > 0 && normalizedText.length <= 80;

    if (!asksForClue) return false;
    if (hasCommercialClueContext(normalizedText)) return false;

    return occultContext || state.occultMode || historyHasOccultContext() || shortDirectAsk;
  }

  function isOccultExitRequest(normalizedText) {
    const closeVerb = /(cerra|cerrar|cierra|cierre|sal|salir|desactiva|desactivar|apaga|apagar|vuelve|volver|regresa|regresar|cierrame|sacame)/.test(normalizedText);
    const occultTarget = /(camara|archivo|velad|fachada|modo normal|modo base|modo archon|modo comercial)/.test(normalizedText);

    return (
      (closeVerb && occultTarget) ||
      normalizedText.indexOf("volver a archon") !== -1 ||
      normalizedText.indexOf("vuelve a archon") !== -1 ||
      normalizedText.indexOf("ponte normal") !== -1
    );
  }

  function escapeHtml(text) {
    return String(text)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }

  function findSecondaryRiddle(step) {
    return SECONDARY_RIDDLES.find(function (entry) {
      return entry.step === step;
    }) || null;
  }

  function buildPuzzleMarkup() {
    return (
      '<div class="archon-chatbot-puzzle-shell">' +
        '<div class="archon-chatbot-puzzle-header">' +
          '<span class="archon-chatbot-puzzle-kicker">' + escapeHtml(t("hint.kicker", "Camara velada")) + '</span>' +
          '<p class="archon-chatbot-puzzle-note">' + escapeHtml(t("hint.note", "Las dos sombras principales son el eje canonico. Si no las descifras, el bot abre un camino secundario mas guiado.")) + '</p>' +
        '</div>' +
        '<section id="puzzle-container" data-current-step="1" data-stage="primary">' +
          '<article class="archon-chatbot-puzzle-item hint primary" data-step="1" data-state="active">' +
            '<h3>' + escapeHtml(t("hint.step1.title", "Pista Principal 1")) + '</h3>' +
            '<code>' + escapeHtml(PRIMARY_HINTS[0]) + '</code>' +
          '</article>' +
          '<article class="archon-chatbot-puzzle-item hint primary" data-step="2" data-state="locked" hidden>' +
            '<h3>' + escapeHtml(t("hint.step2.title", "Pista Principal 2")) + '</h3>' +
            '<code>' + escapeHtml(PRIMARY_HINTS[1]) + '</code>' +
          '</article>' +
          SECONDARY_RIDDLES.map(function (entry) {
            return (
              '<article class="archon-chatbot-puzzle-item riddle secondary" data-step="' + escapeHtml(String(entry.step)) + '" data-state="locked" hidden>' +
                '<h3>' + escapeHtml(entry.title) + '</h3>' +
                '<pre>' + escapeHtml(entry.body) + '</pre>' +
              '</article>'
            );
          }).join("") +
          '<article class="archon-chatbot-puzzle-item voice-step" data-step="8" data-state="locked" hidden>' +
            '<h3>' + escapeHtml(t("hint.step8.title", "Paso Final — La Llave")) + '</h3>' +
            '<p>' + escapeHtml(t("hint.step8.copy", "La puerta ya solo escucha voz. Pulsa el micrófono y pronuncia la llave completa.")) + '</p>' +
            '<button id="voice-trigger" class="archon-chatbot-voice-trigger" type="button">' + escapeHtml(t("hint.step8.voice", "Pronunciar la llave")) + '</button>' +
            '<div class="archon-chatbot-voice-fallback" hidden>' +
              '<label for="voice-fallback-input">' + escapeHtml(t("hint.step8.fallback.label", "Tu navegador no permite voz. Escríbela como la pronunciarías.")) + '</label>' +
              '<div class="archon-chatbot-voice-fallback-row">' +
                '<input id="voice-fallback-input" class="archon-chatbot-voice-input" type="text" autocomplete="off" placeholder="' + escapeHtml(t("hint.step8.fallback.placeholder", "Pronuncia por escrito la llave")) + '">' +
                '<button type="button" class="archon-chatbot-voice-submit">' + escapeHtml(t("hint.step8.fallback.submit", "Validar")) + '</button>' +
              '</div>' +
            '</div>' +
          '</article>' +
        '</section>' +
      '</div>'
    );
  }

  function currentPuzzleStep() {
    return state.puzzle.currentStep;
  }

  function currentPuzzleStage() {
    return state.puzzle.stage;
  }

  function renderPuzzleContainer() {
    if (!ui || !ui.puzzleContainer) return;

    ui.puzzleContainer.dataset.currentStep = String(currentPuzzleStep());
    ui.puzzleContainer.dataset.stage = currentPuzzleStage();

    ui.puzzleContainer.querySelectorAll("[data-step]").forEach(function (node) {
      const step = Number(node.getAttribute("data-step"));
      const revealed = state.puzzle.revealedSteps.indexOf(step) !== -1;
      const isActive = step === currentPuzzleStep();
      node.hidden = !revealed;
      node.dataset.state = !revealed ? "locked" : isActive ? "active" : "complete";
    });

    if (ui.voiceTrigger) {
      ui.voiceTrigger.disabled = state.voiceCapturePending;
      ui.voiceTrigger.textContent = state.voiceCapturePending
        ? t("hint.step8.listening", "Escuchando...")
        : t("hint.step8.voice", "Pronunciar la llave");
    }

    if (ui.voiceFallback) {
      ui.voiceFallback.hidden = supportsVoiceRecognition()
        ? !state.puzzle.voiceFallbackVisible
        : false;
    }
  }

  function scrollPuzzleStepIntoView(step) {
    if (!ui || !ui.puzzleContainer) return;
    const target = ui.puzzleContainer.querySelector('[data-step="' + String(step) + '"]');
    if (!target) return;
    target.scrollIntoView({ behavior: "smooth", block: "center" });
  }

  function slugifyArchiveId(text) {
    return normalize(text)
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "") || "archivo";
  }

  function isHiddenOccultSource(source) {
    const normalized = normalize(source);
    if (!normalized) return false;

    if (normalized.indexOf("pablo") !== -1 || normalized.indexOf("alcocer") !== -1) {
      return true;
    }

    return occultPersona.sources.some(function (item) {
      return normalize(item) === normalized;
    });
  }

  function buildOccultArchiveEntries() {
    const entries = [
      {
        id: "blog-33",
        kind: "blog",
        route: "pilares",
        eyebrow: "Blog velado",
        title: "33",
        theme: "Umbral, símbolo y sospecha",
        excerpt:
          "Pieza editorial de acceso al universo simbólico de Archon: lectura de umbral, capas de sentido, sospecha disciplinada y apertura de la segunda cámara.",
        detail:
          "Es uno de los dos blogs visibles del archivo. Funciona como puerta de entrada al tono velado y al lenguaje iniciático del proyecto.",
        relatedSources: ["33"],
        href: "33.html",
        ctaLabel: "Abrir 33"
      },
      {
        id: "blog-777",
        kind: "blog",
        route: "pilares",
        eyebrow: "Pilar del archivo",
        title: "777",
        theme: "Jerarquía, límite y clavícula",
        excerpt:
          "Pieza central del archivo velado, con una lectura más densa, ritual y arquitectónica sobre estructura, poder, límite y tradición.",
        detail:
          "Es el núcleo editorial más grave del archivo. Desde aquí se ordena el tono más oscuro, simbólico y doctrinal de la cámara velada.",
        relatedSources: ["777", "Clavicula de Salomon"],
        href: "777.html",
        ctaLabel: "Abrir 777"
      }
    ];

    const seen = new Set(["33", "777"]);

    occultLibrary.forEach(function (topic) {
      topic.sources.forEach(function (source) {
        if (seen.has(source)) return;
        if (isHiddenOccultSource(source)) return;
        seen.add(source);
        entries.push({
          id: "doc-" + slugifyArchiveId(source),
          kind: "documento",
          route: topic.id,
          eyebrow: topic.label,
          title: source,
          theme: topic.label,
          excerpt: topic.overview,
          detail: topic.guidance,
          relatedSources: topic.sources,
          prompt:
            "Quiero una lectura del documento " + source + " desde la ruta " + topic.label + "."
        });
      });
    });

    return entries;
  }

  function getOccultArchiveEntries() {
    return buildOccultArchiveEntries();
  }

  function findOccultArchiveEntry(entryId) {
    return getOccultArchiveEntries().find(function (entry) {
      return entry.id === entryId;
    }) || getOccultArchiveEntries()[0];
  }

  function buildOccultArchiveFilters() {
    const entries = getOccultArchiveEntries();
    const labels = {
      all: "Todo el archivo",
      pilares: "Pilares",
      "historia-humanidad": "Historia velada",
      hermetismo: "Hermetismo",
      alquimia: "Alquimia",
      iniciatica: "Masoneria y Rosacruz",
      psique: "Psique y meditacion",
      grimorios: "Grimorios",
      cosmologia: "Cosmologia"
    };
    const order = [
      "all",
      "pilares",
      "historia-humanidad",
      "hermetismo",
      "alquimia",
      "iniciatica",
      "psique",
      "grimorios",
      "cosmologia"
    ];

    return order
      .map(function (filterId) {
        const count = filterId === "all"
          ? entries.length
          : entries.filter(function (entry) {
              return entry.route === filterId;
            }).length;

        if (!count) return null;

        return {
          id: filterId,
          label: labels[filterId] || filterId,
          count: count
        };
      })
      .filter(Boolean);
  }

  function getFilteredOccultArchiveEntries() {
    const entries = getOccultArchiveEntries()
      .filter(function (entry) {
        return state.archiveFilter === "all" || entry.route === state.archiveFilter;
      });

    const query = normalize(state.archiveQuery);
    if (!query) return entries;

    return entries.filter(function (entry) {
      const haystack = [
        entry.title,
        entry.theme,
        entry.eyebrow,
        entry.excerpt,
        entry.detail,
        entry.route
      ]
        .concat(entry.relatedSources || [])
        .join(" ");

      return normalize(haystack).indexOf(query) !== -1;
    });
  }

  function formatReplyHtml(text) {
    return String(text || "")
      .split(/\n{2,}/)
      .filter(Boolean)
      .map(function (chunk) {
        return "<p>" + escapeHtml(chunk).replace(/\n/g, "<br>") + "</p>";
      })
      .join("");
  }

  function defaultSession() {
    return {
      history: [],
      configured: null,
      occultMode: false,
      occultAdmitted: false,
      clueIndex: 0,
      occultAccessVersion: OCCULT_ACCESS_VERSION
    };
  }

  function loadSession() {
    try {
      const raw = sessionStorage.getItem(SESSION_KEY);
      const parsed = raw ? JSON.parse(raw) : defaultSession();
      const session = Object.assign({}, defaultSession(), parsed);

      if (session.occultAccessVersion !== OCCULT_ACCESS_VERSION) {
        return Object.assign({}, session, {
          occultMode: false,
          occultAdmitted: false,
          clueIndex: 0,
          occultAccessVersion: OCCULT_ACCESS_VERSION
        });
      }

      return session;
    } catch (error) {
      return defaultSession();
    }
  }

  function saveSession(session) {
    try {
      sessionStorage.setItem(SESSION_KEY, JSON.stringify(session));
    } catch (error) {
      return;
    }
  }

  function updateSession(patch) {
    const session = Object.assign({}, defaultSession(), loadSession(), patch);
    saveSession(session);
    return session;
  }

  function uniquePuzzleSteps(steps) {
    const seen = new Set();

    return (Array.isArray(steps) ? steps : [])
      .map(function (step) {
        return Number(step);
      })
      .filter(function (step) {
        if (!Number.isInteger(step) || step < 1 || step > 8 || seen.has(step)) {
          return false;
        }
        seen.add(step);
        return true;
      })
      .sort(function (left, right) {
        return left - right;
      });
  }

  function normalizePuzzleMeta(input) {
    const fallback = defaultPuzzleMeta();
    const meta = Object.assign({}, fallback, input || {});
    const revealedSteps = uniquePuzzleSteps(meta.revealedSteps);
    const safeRevealedSteps = revealedSteps.length ? revealedSteps : [1];
    if (safeRevealedSteps.indexOf(1) === -1) {
      safeRevealedSteps.unshift(1);
    }

    const progress = Math.max(
      Number.isInteger(meta.progress) ? meta.progress : fallback.progress,
      safeRevealedSteps[safeRevealedSteps.length - 1]
    );
    const currentStep = safeRevealedSteps.indexOf(Number(meta.currentStep)) !== -1
      ? Number(meta.currentStep)
      : progress >= 8
        ? 8
        : progress;
    const stage = progress >= 8
      ? "final"
      : safeRevealedSteps.some(function (step) {
          return step >= 3 && step <= 7;
        })
        ? "secondary"
        : "primary";

    return {
      progress: Math.min(Math.max(progress, 1), 8),
      stage: meta.stage === "final" || stage === "final"
        ? "final"
        : meta.stage === "secondary" || stage === "secondary"
          ? "secondary"
          : "primary",
      currentStep: Math.min(Math.max(currentStep, 1), 8),
      revealedSteps: safeRevealedSteps,
      engaged: Boolean(meta.engaged),
      primaryHintsDelivered: Math.max(0, Number(meta.primaryHintsDelivered) || 0),
      primaryHelpRequests: Math.max(0, Number(meta.primaryHelpRequests) || 0),
      frustrationCount: Math.max(0, Number(meta.frustrationCount) || 0),
      startedAt: Number(meta.startedAt) || 0,
      lastMessages: Array.isArray(meta.lastMessages)
        ? meta.lastMessages.slice(-PUZZLE_HISTORY_LIMIT).map(function (message) {
            return normalize(message);
          }).filter(Boolean)
        : [],
      stepAttempts: meta.stepAttempts && typeof meta.stepAttempts === "object"
        ? meta.stepAttempts
        : {},
      stepHintRequests: meta.stepHintRequests && typeof meta.stepHintRequests === "object"
        ? meta.stepHintRequests
        : {},
      voiceFailures: Math.max(0, Number(meta.voiceFailures) || 0),
      voiceUnlocked: Boolean(meta.voiceUnlocked),
      voiceFallbackVisible: Boolean(meta.voiceFallbackVisible)
    };
  }

  function loadPuzzleState() {
    let parsedMeta = null;

    try {
      const rawMeta = localStorage.getItem(PUZZLE_META_KEY);
      parsedMeta = rawMeta ? JSON.parse(rawMeta) : null;
    } catch (error) {
      parsedMeta = null;
    }

    const progressRaw = parseInt(localStorage.getItem(PUZZLE_PROGRESS_KEY), 10);
    const frustrationRaw = parseInt(sessionStorage.getItem(PUZZLE_FRUSTRATION_KEY), 10);
    const startedAtRaw = parseInt(localStorage.getItem(PUZZLE_START_KEY), 10);
    const meta = normalizePuzzleMeta(Object.assign({}, parsedMeta, {
      progress: Number.isInteger(progressRaw) ? progressRaw : undefined,
      frustrationCount: Number.isInteger(frustrationRaw)
        ? frustrationRaw
        : parsedMeta && parsedMeta.frustrationCount,
      startedAt: Number.isInteger(startedAtRaw)
        ? startedAtRaw
        : parsedMeta && parsedMeta.startedAt
    }));

    if (!meta.startedAt) {
      meta.startedAt = Date.now();
    }

    return meta;
  }

  function savePuzzleState() {
    const meta = normalizePuzzleMeta(state.puzzle);

    if (!meta.startedAt) {
      meta.startedAt = Date.now();
    }

    state.puzzle = meta;

    try {
      localStorage.setItem(PUZZLE_PROGRESS_KEY, String(meta.progress));
      localStorage.setItem(PUZZLE_META_KEY, JSON.stringify(meta));
      localStorage.setItem(PUZZLE_START_KEY, String(meta.startedAt));
      sessionStorage.setItem(PUZZLE_FRUSTRATION_KEY, String(meta.frustrationCount));
    } catch (error) {
      return;
    }
  }

  function initializePuzzleState() {
    state.puzzle = loadPuzzleState();
    savePuzzleState();
  }

  function rememberPuzzleMessage(normalizedText) {
    if (!normalizedText) return;
    state.puzzle.lastMessages = state.puzzle.lastMessages
      .concat([normalizedText])
      .slice(-PUZZLE_HISTORY_LIMIT);
  }

  function revealPuzzleSteps(steps, stage, currentStep) {
    const incoming = Array.isArray(steps) ? steps : [steps];
    state.puzzle.revealedSteps = uniquePuzzleSteps(state.puzzle.revealedSteps.concat(incoming));
    state.puzzle.progress = state.puzzle.revealedSteps[state.puzzle.revealedSteps.length - 1] || 1;

    if (stage) {
      state.puzzle.stage = stage;
    }

    if (currentStep) {
      state.puzzle.currentStep = currentStep;
    }

    state.puzzle.engaged = true;
    savePuzzleState();
  }

  function incrementPuzzleMapCounter(key, mapName) {
    const stepKey = String(key);
    const source = state.puzzle[mapName] && typeof state.puzzle[mapName] === "object"
      ? state.puzzle[mapName]
      : {};
    const nextValue = (Number(source[stepKey]) || 0) + 1;
    state.puzzle[mapName] = Object.assign({}, source, {
      [stepKey]: nextValue
    });
    savePuzzleState();
    return nextValue;
  }

  function getPuzzleMapCounter(key, mapName) {
    const source = state.puzzle[mapName] && typeof state.puzzle[mapName] === "object"
      ? state.puzzle[mapName]
      : {};
    return Number(source[String(key)]) || 0;
  }

  function nextRequestNonce() {
    state.requestNonce += 1;
    return state.requestNonce;
  }

  function isRequestCurrent(requestNonce) {
    return requestNonce === state.requestNonce;
  }

  function pushHistory(role, content) {
    if (!content) return;
    const session = loadSession();
    const nextHistory = session.history
      .concat([{ role: role, content: String(content).slice(0, 3000) }])
      .slice(-10);

    updateSession({ history: nextHistory });
  }

  function saveDiagnosis(report) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(report));
    } catch (error) {
      return;
    }
  }

  function loadDiagnosis() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch (error) {
      return null;
    }
  }

  function serviceUrlForSector(sector) {
    if (sector === "ecommerce") return "/agencia-ia.html#auditoria";
    if (sector === "services") return "/consultoria-ia.html#auditoria";
    if (sector === "operations") return "/automatizacion-ia-empresas.html#auditoria";
    return "/#auditoria";
  }

  function labelForAnswer(stepId, value) {
    const step = diagnosisFlow.find(function (item) {
      return item.id === stepId;
    });

    if (!step) return value;

    const option = step.options.find(function (item) {
      return item.value === value;
    });

    return option ? option.label : value;
  }

  function labelForOccultAnswer(stepId, value) {
    const step = occultAdmissionFlow.find(function (item) {
      return item.id === stepId;
    });

    if (!step) return value;

    const option = step.options.find(function (item) {
      return item.value === value;
    });

    return option ? option.label : value;
  }

  function commercialDefaultOptions() {
    return [
      { label: "Analizar mi empresa", action: "startDiagnosis" },
      { label: "Quien esta detras de Archon", action: "founder" },
      { label: "Mision, vision y valores", action: "mvv" },
      { label: "Precios orientativos", action: "pricing" }
    ];
  }

  function occultGateOptions() {
    return [
      { label: "Solicitar ingreso", action: "startOccultAdmission" },
      { label: "Escuchar una sombra", action: "occultClue" },
      { label: "Volver a la fachada", action: "returnFacade" }
    ];
  }

  function occultDefaultOptions() {
    return [
      { label: "Quien habla aqui", action: "occultIdentity" },
      { label: "Doctrina del archivo", action: "occultDoctrine" },
      { label: "Historia velada", action: "occultTopic", value: "historia-humanidad" },
      { label: "Biblioteca local", action: "occultLibrary" },
      { label: "Cerrar la camara", action: "returnFacade" }
    ];
  }

  function defaultOptions() {
    if (!state.occultMode) return commercialDefaultOptions();
    return state.occultAdmitted ? occultDefaultOptions() : occultGateOptions();
  }

  function isPuzzleHelpRequest(normalizedText) {
    return PUZZLE_HELP_REGEX.test(normalizedText) || PUZZLE_FRUSTRATION_REGEX.test(normalizedText);
  }

  function getPuzzleInsistenceLevel(normalizedText) {
    let level = 0;

    if (isPuzzleHelpRequest(normalizedText)) {
      level += 1;
    }

    if (state.puzzle.lastMessages.indexOf(normalizedText) !== -1) {
      level += 1;
    }

    return level;
  }

  function trackPuzzleSignals(normalizedText) {
    if (!normalizedText) return;
    rememberPuzzleMessage(normalizedText);

    if (PUZZLE_FRUSTRATION_REGEX.test(normalizedText)) {
      state.puzzle.frustrationCount += 1;
    }

    savePuzzleState();
  }

  function detectPrimaryFailure() {
    if (state.puzzle.stage !== "primary") return false;

    return (
      state.puzzle.primaryHelpRequests >= 3 ||
      state.puzzle.frustrationCount >= 2 ||
      Date.now() - state.puzzle.startedAt > PUZZLE_PRIMARY_TIMEOUT_MS
    );
  }

  function revealPrimaryStep(step) {
    revealPuzzleSteps(step, "primary", step);
    state.puzzle.primaryHintsDelivered = Math.max(state.puzzle.primaryHintsDelivered, step);
    savePuzzleState();
    renderPuzzleContainer();
    scrollPuzzleStepIntoView(step);
  }

  function transitionToSecondary() {
    revealPuzzleSteps([2, 3], "secondary", 3);
    renderPuzzleContainer();
    scrollPuzzleStepIntoView(3);
  }

  function unlockSecondaryStep(nextStep) {
    revealPuzzleSteps(nextStep, "secondary", nextStep);
    renderPuzzleContainer();
    scrollPuzzleStepIntoView(nextStep);
  }

  function unlockVoiceStage() {
    revealPuzzleSteps([7, 8], "final", 8);
    renderPuzzleContainer();
    scrollPuzzleStepIntoView(8);
  }

  function buildCurrentRiddleReply(step) {
    const riddle = findSecondaryRiddle(step);
    if (!riddle) return "";
    return riddle.title + "\n\n" + riddle.body;
  }

  function auxiliaryHintForStep(step) {
    if (step === 4) {
      return t(
        "hint.step4.secondary",
        "Piensa en números que aparecen repetidamente en el arte, la religión y las matemáticas."
      );
    }

    if (step === 5) {
      return t(
        "hint.step5.secondary",
        "No par, no unidad: busca el número que sintetiza la dualidad."
      );
    }

    if (step === 6) {
      if (getPuzzleMapCounter(step, "stepAttempts") < 2) {
        return t("hint.step6.secondary.generic", "Medita sobre la promesa exacta y sobre cómo se separa en castellano.");
      }

      return t(
        "hint.step6.secondary",
        "Si el Acertijo IV te cuesta, toma esta cifra. El desplazamiento es el mismo número que encontraste en el Acertijo III: " + PUZZLE_CAESAR_HINT
      );
    }

    if (step === 8 || state.puzzle.voiceFailures > 0) {
      return t(
        "hint.step8.secondary",
        "La voz no coincide. Recuerda: pronuncia el nombre completo, el capítulo y el versículo separados por \"punto\"."
      );
    }

    return t("hint.secondary.generic", "Medita sobre cada verso del acertijo.");
  }

  function replyWithOccultClue() {
    handlePuzzleHintRequest(normalize(state.lastUserInput || ""));
  }

  function sanitizeClueReplyIfNeeded(data) {
    if (!data || state.occultAdmitted || !isOccultClueRequest(normalize(state.lastUserInput))) {
      return data;
    }

    if (state.puzzle.stage === "primary") {
      return Object.assign({}, data, {
        reply: PRIMARY_HINTS[Math.min(state.puzzle.primaryHintsDelivered, PRIMARY_HINTS.length - 1)],
        ctas: []
      });
    }

    return Object.assign({}, data, {
      reply: currentPuzzleStage() === "secondary"
        ? buildCurrentRiddleReply(currentPuzzleStep())
        : auxiliaryHintForStep(currentPuzzleStep()),
      ctas: []
    });
  }

  function respondWithPuzzleMessage(text) {
    if (!text) return;
    addBotMessage(formatReplyHtml(text));
  }

  function handlePuzzleHintRequest(normalizedText) {
    const insistenceLevel = getPuzzleInsistenceLevel(normalizedText);
    state.puzzle.engaged = true;
    state.puzzle.primaryHelpRequests += state.puzzle.stage === "primary" ? 1 : 0;
    savePuzzleState();

    if (state.puzzle.stage === "primary") {
      if (state.puzzle.primaryHintsDelivered < 1) {
        revealPrimaryStep(1);
        respondWithPuzzleMessage(PRIMARY_HINTS[0]);
        return true;
      }

      if (state.puzzle.revealedSteps.indexOf(2) === -1) {
        revealPrimaryStep(2);
        respondWithPuzzleMessage(PRIMARY_HINTS[1]);
        return true;
      }

      if (detectPrimaryFailure()) {
        transitionToSecondary();
        respondWithPuzzleMessage(
          t(
            "hint.transition",
            "Las pistas principales parecen complejas. Te ofrezco un camino alternativo con acertijos más estructurados..."
          )
        );
        return true;
      }

      respondWithPuzzleMessage(
        t(
          "hint.primary.retry",
          "Intenta descifrar las dos sombras principales. Si de verdad necesitas cambiar de enfoque, insiste un poco más."
        )
      );
      return true;
    }

    if (state.puzzle.stage === "secondary") {
      const step = currentPuzzleStep();
      const hintRequests = incrementPuzzleMapCounter(step, "stepHintRequests");

      if (hintRequests <= 1 && !insistenceLevel) {
        respondWithPuzzleMessage(buildCurrentRiddleReply(step));
        return true;
      }

      respondWithPuzzleMessage(auxiliaryHintForStep(step));
      return true;
    }

    respondWithPuzzleMessage(
      t(
        "hint.final",
        "Pulsa el botón de micrófono y pronuncia la respuesta completa."
      )
    );
    return true;
  }

  async function matchesPuzzleAnswer(step, text) {
    const normalized = normalizePuzzleAnswer(text);
    if (!normalized || !PUZZLE_ANSWER_HASHES[step]) return false;
    return (await sha256(normalized)) === PUZZLE_ANSWER_HASHES[step];
  }

  function shouldTreatAsPuzzleAttempt(normalizedText) {
    if (!state.puzzle.engaged || hasCommercialClueContext(normalizedText)) {
      return false;
    }

    if (state.puzzle.stage === "secondary" && currentPuzzleStep() >= 3 && currentPuzzleStep() <= 6) {
      return normalizedText.length > 0 && normalizedText.length <= 80;
    }

    if (state.puzzle.stage === "primary") {
      return normalizedText.length > 0 && normalizedText.length <= 80;
    }

    return false;
  }

  function registerPuzzleAttempt(step) {
    incrementPuzzleMapCounter(step, "stepAttempts");
  }

  function promptAfterWrongPuzzleAttempt(step) {
    if (step === 6 && getPuzzleMapCounter(step, "stepAttempts") >= 2) {
      respondWithPuzzleMessage(auxiliaryHintForStep(step));
      return;
    }

    if (step >= 3 && step <= 6) {
      respondWithPuzzleMessage(
        t("hint.answer.retry", "Eso no encaja todavía con el paso activo. Si quieres otra ayuda, pídeme pista.")
      );
      return;
    }

    respondWithPuzzleMessage(
      t("hint.primary.answer.retry", "Esa lectura no abre el umbral. Si quieres otra pista, pídemela.")
    );
  }

  function completeOccultUnlock(sourceLabel) {
    state.puzzle.voiceUnlocked = true;
    state.puzzle.voiceFallbackVisible = false;
    savePuzzleState();
    setOccultAdmissionState(true);
    setOccultMode(true);
    renderPuzzleContainer();
    addBotMessage(
      "<p><strong>" + escapeHtml(t("hint.open.title", "La cámara ha reconocido la voz.")) + "</strong></p>" +
      "<p>" + escapeHtml(
        sourceLabel
          ? t("hint.open.body.voice", "La llave pronunciada ha alterado el sello. El archivo se abre.")
          : t("hint.open.body.fallback", "La llave validada ha alterado el sello. El archivo se abre.")
      ) + "</p>"
    );
    addOptions(occultDefaultOptions());
    setStatus(t("hint.open.status", "Archivo velado concedido."), "live");

    if (typeof window.openHiddenCamera === "function") {
      window.openHiddenCamera();
    }
  }

  async function tryAdvancePuzzle(text) {
    const step = currentPuzzleStep();

    if (state.puzzle.stage === "primary") {
      if (await matchesPuzzleAnswer(6, text)) {
        unlockVoiceStage();
        respondWithPuzzleMessage(
          t(
            "hint.primary.solved",
            "Has fijado la fórmula. Ya no hace falta otra sombra: ahora pronúnciala completa."
          )
        );
        return true;
      }

      if (shouldTreatAsPuzzleAttempt(normalize(text))) {
        registerPuzzleAttempt(2);
        promptAfterWrongPuzzleAttempt(2);
        return true;
      }

      return false;
    }

    if (state.puzzle.stage === "secondary" && step >= 3 && step <= 6) {
      if (await matchesPuzzleAnswer(step, text)) {
        if (step === 6) {
          unlockVoiceStage();
          respondWithPuzzleMessage(
            t(
              "hint.voice.bridge",
              "La promesa ya está atada. La última llave no se escribe: se pronuncia."
            )
          );
        } else {
          unlockSecondaryStep(step + 1);
          respondWithPuzzleMessage(
            t("hint.step.advance", "Correcto. El siguiente umbral ya está desplegado.")
          );
        }
        return true;
      }

      if (shouldTreatAsPuzzleAttempt(normalize(text))) {
        registerPuzzleAttempt(step);
        promptAfterWrongPuzzleAttempt(step);
        return true;
      }
    }

    return false;
  }

  function showVoiceFallback() {
    if (!ui || !ui.voiceFallback) return;
    state.puzzle.voiceFallbackVisible = true;
    savePuzzleState();
    ui.voiceFallback.hidden = false;
    if (ui.voiceFallbackInput) {
      ui.voiceFallbackInput.focus();
    }
  }

  function handleVoiceMismatch() {
    state.puzzle.voiceFailures += 1;
    savePuzzleState();
    renderPuzzleContainer();
    respondWithPuzzleMessage(auxiliaryHintForStep(8));
  }

  async function evaluateVoiceAlternatives(alternatives, sourceLabel) {
    if (matchesVoiceKey(alternatives)) {
      completeOccultUnlock(sourceLabel);
      return true;
    }

    handleVoiceMismatch();
    return false;
  }

  async function handleVoiceTrigger() {
    if (state.voiceCapturePending) return;

    if (!supportsVoiceRecognition()) {
      showVoiceFallback();
      respondWithPuzzleMessage(
        t(
          "hint.voice.fallback",
          "Tu navegador no permite voz. Escribe la frase tal como la pronunciarías."
        )
      );
      return;
    }

    state.voiceCapturePending = true;
    renderPuzzleContainer();

    try {
      const alternatives = await startVoiceCapture();
      await evaluateVoiceAlternatives(alternatives, "voice");
    } catch (error) {
      if (String(error && error.message || error).toLowerCase() !== "not-allowed") {
        respondWithPuzzleMessage(
          t(
            "hint.voice.error",
            "No he podido escuchar la llave. Vuelve a intentarlo o usa la validación escrita si tu navegador la necesita."
          )
        );
      }
      showVoiceFallback();
    } finally {
      state.voiceCapturePending = false;
      renderPuzzleContainer();
    }
  }

  async function handleVoiceFallbackSubmit() {
    if (!ui || !ui.voiceFallbackInput) return;
    const value = ui.voiceFallbackInput.value.trim();
    if (!value) return;
    ui.voiceFallbackInput.value = "";
    await evaluateVoiceAlternatives([value], "fallback");
  }

  function findOccultTopicById(topicId) {
    return occultLibrary.find(function (item) {
      return item.id === topicId;
    });
  }

  function findOccultTopic(normalizedText) {
    return occultLibrary.find(function (item) {
      return item.terms.some(function (term) {
        return normalizedText.indexOf(term) !== -1;
      });
    });
  }

  function renderOccultSources(sources) {
    if (!Array.isArray(sources) || !sources.length) return "";

    const visibleSources = sources.filter(function (source) {
      return !isHiddenOccultSource(source);
    });

    if (!visibleSources.length) return "";

    return (
      "<p><strong>Base local usada</strong></p><ul>" +
      visibleSources
        .map(function (source) {
          return "<li>" + escapeHtml(source) + "</li>";
        })
        .join("") +
      "</ul>"
    );
  }

  function renderOccultArchiveGrid() {
    if (!ui || !ui.archiveGrid) return;

    const entries = getFilteredOccultArchiveEntries();

    if (!entries.length) {
      ui.archiveGrid.innerHTML =
        '<div class="archon-occult-archive-empty">' +
          '<strong>Sin coincidencias en el archivo</strong>' +
          '<p>Prueba otra ruta o cambia el termino de busqueda. El corpus visible sigue limitado a 33, 777 y los documentos ya integrados en memoria local.</p>' +
        '</div>';
      return;
    }

    ui.archiveGrid.innerHTML = entries
      .map(function (entry) {
        const isActive = entry.id === state.archiveFocusId;
        return (
          '<button type="button" class="archon-occult-archive-card' +
          (isActive ? " is-active" : "") +
          '" data-archive-entry="' + escapeHtml(entry.id) + '">' +
            '<span class="archon-occult-archive-card-eyebrow">' + escapeHtml(entry.eyebrow) + '</span>' +
            '<strong>' + escapeHtml(entry.title) + '</strong>' +
            '<span class="archon-occult-archive-card-theme">' + escapeHtml(entry.theme) + '</span>' +
            '<p>' + escapeHtml(entry.excerpt) + '</p>' +
          '</button>'
        );
      })
      .join("");
  }

  function renderOccultArchiveFilters() {
    if (!ui || !ui.archiveFilters || !ui.archiveSummary) return;

    const filters = buildOccultArchiveFilters();
    if (!filters.some(function (item) { return item.id === state.archiveFilter; })) {
      state.archiveFilter = "all";
    }

    const filteredEntries = getFilteredOccultArchiveEntries();
    if (!filteredEntries.some(function (entry) { return entry.id === state.archiveFocusId; })) {
      state.archiveFocusId = (filteredEntries[0] && filteredEntries[0].id) || "blog-33";
    }

    ui.archiveFilters.innerHTML = filters
      .map(function (filter) {
        const isActive = filter.id === state.archiveFilter;
        return (
          '<button type="button" class="archon-occult-archive-filter' +
          (isActive ? " is-active" : "") +
          '" data-archive-filter="' + escapeHtml(filter.id) + '">' +
            '<span>' + escapeHtml(filter.label) + '</span>' +
            '<strong>' + escapeHtml(String(filter.count)) + '</strong>' +
          '</button>'
        );
      })
      .join("");

    ui.archiveSummary.innerHTML =
      "<strong>" + escapeHtml(String(filteredEntries.length)) + " piezas visibles</strong>" +
      "<span>Solo se muestran 33, 777 y el corpus visible ya destilado dentro de la memoria local del archivo." +
      (state.archiveQuery ? " Busqueda activa: “" + escapeHtml(state.archiveQuery) + "”." : "") +
      "</span>";
  }

  function renderOccultArchiveFeature() {
    if (!ui || !ui.archiveFeature) return;

    const entry = findOccultArchiveEntry(state.archiveFocusId);
    if (!entry || !getFilteredOccultArchiveEntries().some(function (item) { return item.id === entry.id; })) {
      ui.archiveFeature.innerHTML =
        '<div class="archon-occult-archive-empty archon-occult-archive-empty--feature">' +
          '<strong>Archivo a la espera</strong>' +
          '<p>Ajusta filtros o busqueda para recuperar una pieza visible del corpus.</p>' +
        '</div>';
      return;
    }

    ui.archiveFeature.innerHTML =
      '<div class="archon-occult-archive-feature-meta">' +
        '<span>' + escapeHtml(state.occultAdmitted ? "Archivo concedido" : "Perimetro alterado") + '</span>' +
        '<span>' + escapeHtml(entry.kind === "blog" ? "Blog visible" : "Documento del corpus") + '</span>' +
      '</div>' +
      '<span class="archon-occult-archive-feature-eyebrow">' + escapeHtml(entry.eyebrow) + '</span>' +
      '<h2>' + escapeHtml(entry.title) + '</h2>' +
      '<p class="archon-occult-archive-feature-theme">' + escapeHtml(entry.theme) + '</p>' +
      '<p>' + escapeHtml(entry.excerpt) + '</p>' +
      '<p>' + escapeHtml(entry.detail) + '</p>' +
      renderOccultSources(entry.relatedSources || []) +
      '<div class="archon-occult-archive-feature-actions">' +
        (
          entry.href
            ? '<a class="archon-occult-archive-link" href="' + escapeHtml(entry.href) + '">' + escapeHtml(entry.ctaLabel || "Abrir") + '</a>'
            : '<button type="button" class="archon-occult-archive-link archon-occult-archive-link--button" data-archive-chat="' + escapeHtml(entry.id) + '">Consultar con el bot</button>'
        ) +
        '<button type="button" class="archon-occult-archive-link archon-occult-archive-link--ghost" data-archive-close="true">Cerrar archivo</button>' +
      '</div>';
  }

  function renderOccultArchive() {
    if (!ui || !ui.archiveRoot) return;
    if (!state.archiveFocusId) state.archiveFocusId = "blog-33";
    if (ui.archiveSearch) {
      ui.archiveSearch.value = state.archiveQuery || "";
    }
    renderOccultArchiveFilters();
    renderOccultArchiveFeature();
    renderOccultArchiveGrid();
  }

  function syncOccultArchive() {
    const active = state.occultMode && state.occultAdmitted;
    const body = document.body;

    if (body) {
      body.classList.toggle("archon-occult-archive-open", active);
    }

    if (!ui || !ui.archiveRoot) return;

    ui.archiveRoot.classList.toggle("is-visible", active);
    ui.archiveRoot.setAttribute("aria-hidden", active ? "false" : "true");

    if (active) {
      renderOccultArchive();
    }
  }

  function primeArchivePrompt(entryId) {
    const entry = findOccultArchiveEntry(entryId);
    if (!entry || !ui || !ui.input) return;
    ui.input.value = entry.prompt || ("Quiero trabajar " + entry.title + " dentro del archivo velado.");
    toggleChat(true);
    ui.input.focus();
  }

  function answerOccultTopic(topicId) {
    if (!state.occultAdmitted) {
      addBotMessage(
        "<p><strong>El archivo sigue sellado.</strong></p><p>La formula modifico el borde, pero esta ruta no se abre todavia. Si quieres entrar, primero cruza la admision y demuestra desde que mesa, lente y temple preguntas.</p>"
      );
      addOptions(occultGateOptions());
      setStatus("La camara escucha, pero aun no concede archivo.", "fallback");
      return;
    }

    const topic = findOccultTopicById(topicId);
    if (!topic) return;

    addBotMessage(
      "<p><strong>" + escapeHtml(topic.label) + "</strong></p>" +
        "<p>" + escapeHtml(topic.overview) + "</p>" +
        "<p>" + escapeHtml(topic.guidance) + "</p>" +
        renderOccultSources(topic.sources)
    );

    addOptions(
      state.occultAdmitted
        ? [
            { label: "Historia velada", action: "occultTopic", value: "historia-humanidad" },
            { label: "Arquetipos y meditacion", action: "occultTopic", value: "psique" },
            { label: "Grimorios y Clavicula", action: "occultTopic", value: "grimorios" },
            { label: "Cerrar la camara", action: "returnFacade" }
          ]
        : [
            { label: "Solicitar ingreso", action: "startOccultAdmission" },
            { label: "Escuchar una sombra", action: "occultClue" },
            { label: "Volver a la fachada", action: "returnFacade" }
          ]
    );
    setStatus("Camara velada operativa en modo local.", "fallback");
  }

  function answerOccultLibraryOverview() {
    if (!state.occultAdmitted) {
      addBotMessage(
        "<p><strong>La biblioteca no se despliega todavia.</strong></p><p>Ahora solo puedo dejarte borde y sombra. El archivo entero exige admision y una lectura minima de tu posicion interior.</p>"
      );
      addOptions(occultGateOptions());
      return;
    }

    addBotMessage(
      "<p><strong>Biblioteca local de la camara velada</strong></p>" +
        "<p>Ahora mismo puedo responder en local, sin Gemini, a partir de una biblioteca reducida y curada con ejes de hermetismo, alquimia, via iniciatica, arquetipos, chakras, meditacion, runas, grimorios, cosmologia oculta e historia velada de la humanidad.</p>" +
        renderOccultSources(
          occultLibrary.reduce(function (sources, topic) {
            return sources.concat(topic.sources.slice(0, 2));
          }, []).slice(0, 10)
        )
    );
    addOptions([
      { label: "Historia velada", action: "occultTopic", value: "historia-humanidad" },
      { label: "Cosmologia oculta", action: "occultTopic", value: "cosmologia" },
      { label: "Grimorios y Clavicula", action: "occultTopic", value: "grimorios" },
      { label: "Cerrar la camara", action: "returnFacade" }
    ]);
  }

  function answerOccultIdentity() {
    if (!state.occultAdmitted) {
      addBotMessage(
        "<p><strong>El nombre no se entrega en el borde.</strong></p><p>Primero se reconoce el archivo; después, si el paso es concedido, la voz deja de hablar como rumor y toma forma.</p>"
      );
      addOptions(occultGateOptions());
      return;
    }

    addBotMessage(
      "<p><strong>" + escapeHtml(occultPersona.name) + "</strong></p>" +
        "<p>" + escapeHtml(occultPersona.overview) + "</p>" +
        "<p><strong>Funcion</strong></p><p>" + escapeHtml(occultPersona.mission) + "</p>" +
        "<p>" + escapeHtml(occultPersona.tone) + "</p>" +
        "<p><strong>Archivo interno</strong></p><p>Esta voz se sostiene sobre documentos doctrinales no visibles para usuarios. En la camara solo aparece la lectura ya filtrada por el archivo.</p>"
    );
    addOptions([
      { label: "Doctrina del archivo", action: "occultDoctrine" },
      { label: "Historia velada", action: "occultTopic", value: "historia-humanidad" },
      { label: "Biblioteca local", action: "occultLibrary" },
      { label: "Cerrar la camara", action: "returnFacade" }
    ]);
    setStatus("La voz del archivo se ha presentado.", "fallback");
  }

  function answerOccultDoctrine() {
    if (!state.occultAdmitted) {
      addBotMessage(
        "<p><strong>La doctrina no se lee desde fuera.</strong></p><p>El borde solo te deja oír fragmentos. La arquitectura completa exige admisión y capacidad de sostener el peso simbólico sin convertirlo en consigna vacía.</p>"
      );
      addOptions(occultGateOptions());
      return;
    }

    addBotMessage(
      "<p><strong>Doctrina del archivo</strong></p><p>" +
        escapeHtml(occultPersona.mission) +
        "</p><ul>" +
        occultPersona.doctrine
          .map(function (item) {
            return "<li>" + escapeHtml(item) + "</li>";
          })
          .join("") +
        "</ul><p>La forma mas fiel de leer esta capa es como una mezcla de reforma espiritual, soberania interior, renacimiento y disciplina de archivo. No pide fe ciega; pide orden, memoria y capacidad de distinguir simbolo, historia y proyecto.</p>" +
        "<p><strong>Nota</strong></p><p>Los documentos doctrinales que sostienen esta personalidad no forman parte del archivo visible. El usuario solo recibe la voz ya destilada.</p>"
    );
    addOptions([
      { label: "Quien habla aqui", action: "occultIdentity" },
      { label: "Historia velada", action: "occultTopic", value: "historia-humanidad" },
      { label: "Logia y rosa", action: "occultTopic", value: "iniciatica" },
      { label: "Cerrar la camara", action: "returnFacade" }
    ]);
    setStatus("La doctrina del archivo esta desplegada en local.", "fallback");
  }

  function currentOccultStep() {
    return occultAdmissionFlow[state.admissionStep];
  }

  function askOccultQuestion() {
    const step = currentOccultStep();
    if (!step) {
      finishOccultAdmission();
      return;
    }

    addBotMessage(
      "<p><strong>Umbral " +
        (state.admissionStep + 1) +
        " de " +
        occultAdmissionFlow.length +
        "</strong></p><p>" +
        escapeHtml(step.prompt) +
        "</p>"
    );

    addOptions(
      step.options.map(function (option) {
        return {
          label: option.label,
          action: "occultAdmissionChoice",
          value: option.value
        };
      })
    );
    setStatus("Proceso de admision local en curso.", "fallback");
  }

  function startOccultAdmission() {
    state.mode = "idle";
    state.puzzle.engaged = true;
    savePuzzleState();
    renderPuzzleContainer();
    removePendingOptions();
    addBotMessage(
      "<p><strong>" + escapeHtml(t("hint.admission.title", "Umbral activo")) + "</strong></p>" +
      "<p>" + escapeHtml(
        t(
          "hint.admission.body",
          "La cámara velada ya no se abre por entrevista. Empieza por las dos pistas principales y, si no bastan, insiste para que el bot despliegue los acertijos secundarios."
        )
      ) + "</p>"
    );
    addOptions(defaultOptions());
    setStatus("El acceso se resuelve dentro del puzzle local.", "fallback");
  }

  function buildOccultReading(answers) {
    const traditionMap = {
      hermetic: {
        title: "Ruta hermetica",
        sources: ["El Kybalion", "La Tabla Esmeralda de Hermes Trismegisto"],
        route:
          "Empieza por los siete principios, luego pasa a correspondencia y vibracion, y solo despues traduce eso a practica interior o lectura simbolica."
      },
      alchemy: {
        title: "Ruta alquimica",
        sources: ["La Tabla Esmeralda de Hermes Trismegisto", "El libro de oro, Saint Germain", "Medicina Oculta y Magia Practica"],
        route:
          "Entra por solve et coagula, separa capas del yo, observa materia psiquica y usa la alquimia como mapa de transmutacion, no como fetiche literal."
      },
      initiatic: {
        title: "Ruta iniciatica",
        sources: ["Bajo la Orden de Melquisedek", "Ad Majorem Lucis Gloriam", "Formulario de Alta Magia"],
        route:
          "Empieza por disciplina, silencio y fraternidad interior. La via iniciatica madura mejor cuando ordenas conducta y simbolo antes de perseguir secretos."
      },
      psyche: {
        title: "Ruta arquetipal y energetica",
        sources: ["Arquetipos e inconsciente colectivo", "El gran libro de los chakras", "Manual de Meditacion", "Practicas Runicas"],
        route:
          "Une arquetipos, atencion corporal, respiracion y simbolo. Esta ruta sirve para leer imagenes internas con mas estructura y menos fantasia dispersa."
      }
    };

    const chosenRoute = traditionMap[answers.tradition] || traditionMap.hermetic;
    const lensLabel = labelForOccultAnswer("lens", answers.lens);
    const temperLabel = labelForOccultAnswer("temper", answers.temper);
    const depthLabel = labelForOccultAnswer("depth", answers.depth);
    const impulseLabel = labelForOccultAnswer("impulse", answers.impulse);
    const profileTitle = chosenRoute.title + " / " + depthLabel;
    const summary =
      "Tu entrada actual pide " +
      impulseLabel.toLowerCase() +
      " y conviene estudiarla con una lente " +
      lensLabel.toLowerCase() +
      ". El temple dominante que traes es " +
      temperLabel.toLowerCase() +
      ". La lectura mas sana aqui es avanzar por capas, sin convertir cada simbolo en dogma ni cada intuicion en verdad absoluta.";
    const closing =
      answers.temper === "sovereignty"
        ? "Mi recomendacion es leer cada simbolo como arquitectura interior: soberania, ley propia, renacimiento y disciplina antes que exhibicion."
        : answers.temper === "silence"
          ? "Mi recomendacion es callar mas de lo que afirmas, tomar notas y dejar que los simbolos prueben su peso con el tiempo."
          : answers.lens === "historical"
            ? "Mi recomendacion es separar siempre texto, contexto y reinterpretacion moderna."
            : answers.lens === "inner"
              ? "Mi recomendacion es convertir esto en practica de atencion, diario y disciplina, no en consumo impulsivo de secretos."
              : "Mi recomendacion es mantener dos registros a la vez: rigor para no creerte cualquier cosa y sensibilidad simbolica para no quedarte en la superficie.";

    return {
      title: profileTitle,
      summary: summary,
      route: chosenRoute.route,
      sources: chosenRoute.sources,
      closing: closing
    };
  }

  function finishOccultAdmission() {
    const reading = buildOccultReading(state.admissionAnswers);
    setOccultAdmissionState(true);

    addBotMessage(
      "<p><strong>" + escapeHtml(reading.title) + "</strong></p>" +
        "<p>" + escapeHtml(reading.summary) + "</p>" +
        "<p><strong>Ruta sugerida</strong></p><p>" + escapeHtml(reading.route) + "</p>" +
        renderOccultSources(reading.sources) +
        "<p><strong>Fondo interno</strong></p><p>La personalidad del archivo se apoya en una doctrina no visible para usuarios. Solo se muestra la lectura ya decantada.</p>" +
        "<p>" + escapeHtml(reading.closing) + "</p>"
    );

    addOptions([
      { label: "Hermetismo", action: "occultTopic", value: "hermetismo" },
      { label: "Arquetipos y meditacion", action: "occultTopic", value: "psique" },
      { label: "Biblioteca local", action: "occultLibrary" },
      { label: "Menu de la camara", action: "none" }
    ]);

    state.mode = "idle";
    state.admissionStep = 0;
    state.admissionAnswers = {};
    setOccultMode(true);
    setStatus("Lectura de admision completada. El archivo ya reconoce tu paso.", "fallback");
  }

  function inferLeadStage(severity, answers) {
    if (answers.urgency === "now" && severity >= 7) return "hot";
    if (severity >= 7 || answers.urgency === "now") return "warm";
    return "cold";
  }

  function buildSummaryText(report) {
    return [
      report.sectorLabel ? "Sector: " + report.sectorLabel : "",
      report.weaknesses.length
        ? "Debilidades estructurales: " +
          report.weaknesses
            .map(function (item) {
              return item.title;
            })
            .join(" | ")
        : "",
      report.budgetTitle ? "Presupuesto borrador: " + report.budgetTitle : "",
      report.budgetLines.length ? report.budgetLines.join(" ") : "",
      report.recommendation || ""
    ]
      .filter(Boolean)
      .join("\n");
  }

  function buildDiagnosisReport(answers) {
    const scores = {
      source: 0,
      automation: 0,
      visibility: 0,
      dependency: 0,
      support: 0
    };

    if (answers.sector === "ecommerce") {
      scores.automation += 2;
      scores.support += 1;
      scores.source += 1;
    } else if (answers.sector === "services") {
      scores.visibility += 2;
      scores.dependency += 1;
      scores.source += 1;
    } else if (answers.sector === "operations") {
      scores.source += 2;
      scores.automation += 1;
      scores.visibility += 1;
    } else {
      scores.source += 1;
      scores.automation += 1;
    }

    if (answers.team === "6-15") scores.visibility += 1;
    if (answers.team === "16-40" || answers.team === "40+") {
      scores.visibility += 2;
      scores.source += 1;
    }

    if (answers.bottleneck === "operations") {
      scores.automation += 3;
      scores.source += 1;
    }
    if (answers.bottleneck === "support") {
      scores.support += 3;
      scores.automation += 1;
    }
    if (answers.bottleneck === "handoff") {
      scores.visibility += 2;
      scores.dependency += 1;
    }
    if (answers.bottleneck === "backoffice") {
      scores.source += 2;
      scores.visibility += 1;
    }
    if (answers.bottleneck === "finance") {
      scores.automation += 2;
      scores.source += 1;
      scores.support += 1;
    }

    if (answers.stack === "manual") {
      scores.source += 3;
      scores.automation += 2;
      scores.visibility += 1;
    } else if (answers.stack === "fragmented") {
      scores.source += 2;
      scores.automation += 2;
      scores.visibility += 1;
    } else if (answers.stack === "partial") {
      scores.automation += 1;
      scores.visibility += 1;
    } else if (answers.stack === "structured") {
      scores.visibility += 1;
    }

    if (answers.dependency === "founder") {
      scores.dependency += 3;
      scores.visibility += 1;
    } else if (answers.dependency === "team") {
      scores.dependency += 2;
    }

    if (answers.urgency === "now") {
      scores.automation += 1;
      scores.support += 1;
    } else if (answers.urgency === "soon") {
      scores.visibility += 1;
    }

    const ranked = Object.keys(scores)
      .map(function (key) {
        return {
          key: key,
          score: scores[key],
          title: weaknessMap[key].title,
          detail: weaknessMap[key].detail
        };
      })
      .sort(function (left, right) {
        return right.score - left.score;
      });

    const topWeaknesses = ranked.slice(0, 3);
    const severity = topWeaknesses.reduce(function (total, item) {
      return total + item.score;
    }, 0);

    let budgetTitle = "Borrador: radiografia y quick win";
    let budgetLines = [
      "Radiografia operativa: 250 EUR.",
      "Quick win focalizado: 950 a 1.400 EUR.",
      "Mantenimiento opcional: 350 EUR / mes."
    ];

    if (severity >= 10) {
      budgetTitle = "Borrador: arquitectura completa con despliegue";
      budgetLines = [
        "Radiografia operativa: 250 EUR.",
        "Setup prioritario: 950 EUR.",
        "Full Stack Cerebro Archon: desde 2.500 a 4.500 EUR segun alcance.",
        "Mantenimiento y calidad total: 350 EUR / mes."
      ];
    } else if (severity >= 7) {
      budgetTitle = "Borrador: blueprint y primer sprint de sistema";
      budgetLines = [
        "Radiografia operativa: 250 EUR.",
        "Sprint de correccion estructural: 1.400 a 2.500 EUR.",
        "Mantenimiento opcional: 350 EUR / mes."
      ];
    }

    const sectorLabel = labelForAnswer("sector", answers.sector);
    const overview =
      "Para un negocio tipo " +
      sectorLabel.toLowerCase() +
      ", la lectura inicial apunta a " +
      topWeaknesses[0].title.toLowerCase() +
      " y " +
      topWeaknesses[1].title.toLowerCase() +
      " como fugas mas claras. Hay margen real para ganar control sin rehacerlo todo de golpe.";

    const recommendation =
      "Siguiente paso recomendado: una auditoria de 33 minutos para validar prioridades, decidir el quick win correcto y revisar este presupuesto borrador contigo en reunion.";

    const report = {
      createdAt: new Date().toISOString(),
      source: "local",
      leadStage: inferLeadStage(severity, answers),
      sector: answers.sector,
      sectorLabel: sectorLabel,
      answers: answers,
      overview: overview,
      recommendation: recommendation,
      weaknesses: topWeaknesses,
      budgetTitle: budgetTitle,
      budgetLines: budgetLines,
      summaryText: "",
      auditUrl: serviceUrlForSector(answers.sector)
    };

    report.summaryText = [
      "Sector: " + sectorLabel,
      "Equipo: " + labelForAnswer("team", answers.team),
      "Cuello de botella: " + labelForAnswer("bottleneck", answers.bottleneck),
      "Stack actual: " + labelForAnswer("stack", answers.stack),
      "Dependencia: " + labelForAnswer("dependency", answers.dependency),
      "Horizonte: " + labelForAnswer("urgency", answers.urgency),
      "Debilidades estructurales: " +
        topWeaknesses
          .map(function (item) {
            return item.title;
          })
          .join(" | "),
      "Presupuesto borrador: " + budgetTitle + " -> " + budgetLines.join(" "),
      recommendation
    ].join("\n");

    return report;
  }

  function normalizeAiReport(input, fallback) {
    const safeInput = input || {};
    const base = fallback || {};
    const sector = safeInput.sector || base.sector || "other";
    const sectorLabel = safeInput.sectorLabel || base.sectorLabel || labelForAnswer("sector", sector);
    const weaknesses = Array.isArray(safeInput.weaknesses) && safeInput.weaknesses.length
      ? safeInput.weaknesses
          .slice(0, 3)
          .map(function (item) {
            return {
              title: item && item.title ? item.title : "",
              detail: item && item.detail ? item.detail : ""
            };
          })
          .filter(function (item) {
            return item.title && item.detail;
          })
      : base.weaknesses || [];
    const budgetLines = Array.isArray(safeInput.budgetLines) && safeInput.budgetLines.length
      ? safeInput.budgetLines.filter(Boolean).slice(0, 6)
      : base.budgetLines || [];

    const report = {
      createdAt: new Date().toISOString(),
      source: "gemini",
      leadStage: safeInput.leadStage || base.leadStage || "warm",
      sector: sector,
      sectorLabel: sectorLabel,
      answers: base.answers || {},
      overview: safeInput.overview || base.overview || "",
      recommendation:
        safeInput.recommendation ||
        base.recommendation ||
        "Siguiente paso recomendado: una auditoria de 33 minutos para revisar este borrador contigo.",
      weaknesses: weaknesses,
      budgetTitle: safeInput.budgetTitle || base.budgetTitle || "Borrador Archon",
      budgetLines: budgetLines,
      summaryText: safeInput.summaryText || "",
      auditUrl: safeInput.auditUrl || base.auditUrl || serviceUrlForSector(sector)
    };

    if (!report.summaryText) {
      report.summaryText = buildSummaryText(report);
    }

    return report;
  }

  function ensureHiddenField(form, name, value) {
    let field = form.querySelector('input[name="' + name + '"]');
    if (!field) {
      field = document.createElement("input");
      field.type = "hidden";
      field.name = name;
      form.appendChild(field);
    }
    field.value = value;
  }

  function hydrateForms() {
    const saved = loadDiagnosis();
    const forms = document.querySelectorAll(FORM_SELECTOR);

    forms.forEach(function (form) {
      const noteParent = form.parentElement;
      if (!saved) return;

      ensureHiddenField(form, "chatbot_summary", saved.summaryText);
      ensureHiddenField(form, "chatbot_budget_draft", saved.budgetTitle + " | " + saved.budgetLines.join(" "));
      ensureHiddenField(
        form,
        "chatbot_structural_weaknesses",
        saved.weaknesses
          .map(function (item) {
            return item.title;
          })
          .join(" | ")
      );
      ensureHiddenField(form, "chatbot_recommendation", saved.recommendation);
      ensureHiddenField(form, "chatbot_created_at", saved.createdAt);
      ensureHiddenField(form, "chatbot_source", saved.source || "local");
      ensureHiddenField(form, "chatbot_lead_stage", saved.leadStage || "warm");

      const platformSelect = form.querySelector('select[name="platform"]');
      if (platformSelect && saved.sectorLabel) {
        const matchingOption = Array.from(platformSelect.options).find(function (option) {
          return normalize(option.textContent) === normalize(saved.sectorLabel);
        });
        if (matchingOption) platformSelect.value = matchingOption.value || matchingOption.textContent;
      }

      const sectorSelect = form.querySelector('select[name="sector"]');
      if (sectorSelect && saved.sectorLabel) {
        const sectorOption = Array.from(sectorSelect.options).find(function (option) {
          return normalize(option.textContent) === normalize(saved.sectorLabel);
        });
        if (sectorOption) sectorSelect.value = sectorOption.value || sectorOption.textContent;
      }

      if (noteParent && !noteParent.querySelector(".chatbot-form-note")) {
        const note = document.createElement("p");
        note.className = "chatbot-form-note";
        note.textContent = "El analisis del chatbot se adjuntara a esta solicitud.";
        noteParent.appendChild(note);
      }
    });
  }

  function openAuditFromReport(report) {
    const target = (report && report.auditUrl) || "/#auditoria";
    if (target.charAt(0) === "#" && document.querySelector(target)) {
      document.querySelector(target).scrollIntoView({ behavior: "smooth", block: "start" });
      return;
    }
    if (target.indexOf("#") === 0 && !document.querySelector(target)) {
      window.location.href = "/" + target;
      return;
    }
    if (target.indexOf("#auditoria") !== -1 && window.location.pathname + window.location.hash === target) {
      const localTarget = document.getElementById("auditoria");
      if (localTarget) localTarget.scrollIntoView({ behavior: "smooth", block: "start" });
      return;
    }
    window.location.href = target;
  }

  function copyReport() {
    const saved = loadDiagnosis();
    if (!saved || !navigator.clipboard) return;
    navigator.clipboard.writeText(saved.summaryText).then(function () {
      setStatus("Resumen copiado. Puedes pegarlo en email o CRM.", "live");
    });
  }

  function setStatus(text, stateName) {
    if (!ui || !ui.status) return;
    ui.status.textContent = text;
    ui.status.setAttribute("data-state", stateName || "");
  }

  function syncOccultTheme() {
    const active = state.occultMode;
    const granted = state.occultAdmitted;
    const root = document.documentElement;
    const body = document.body;

    if (root) {
      root.classList.toggle("archon-occult-theme", active);
      root.classList.toggle("archon-occult-theme--granted", active && granted);
    }

    if (body) {
      body.classList.toggle("archon-occult-theme", active);
      body.classList.toggle("archon-occult-theme--granted", active && granted);
    }

    if (ui && ui.root) {
      ui.root.classList.toggle("is-occult-archived", active && granted);
    }

    const themeMeta = document.querySelector('meta[name="theme-color"]');
    if (themeMeta) {
      themeMeta.setAttribute("content", !active ? "#060606" : granted ? "#170022" : "#110018");
    }

    syncOccultArchive();
  }

  function setOccultAdmissionState(active) {
    state.occultAdmitted = Boolean(active);
    updateSession({ occultAdmitted: state.occultAdmitted });
    syncOccultTheme();
  }

  function setOccultMode(active) {
    state.occultMode = Boolean(active);
    if (!state.occultMode) {
      state.occultAdmitted = false;
      state.clueIndex = 0;
    }
    updateSession({
      occultMode: state.occultMode,
      occultAdmitted: state.occultAdmitted,
      clueIndex: state.clueIndex
    });

    if (!ui) return;

    ui.root.classList.toggle("is-occult", state.occultMode);

    if (ui.gate) {
      ui.gate.textContent = !state.occultMode
        ? "Camara velada dormida"
        : state.occultAdmitted
          ? "Archivo velado concedido"
          : "Perimetro alterado";
    }

    if (ui.subtitle) {
      ui.subtitle.textContent = !state.occultMode
        ? "Diagnostico estructural, borrador de presupuesto y respuestas sobre la marca. Existe una segunda camara para quien sepa abrirla."
        : state.occultAdmitted
          ? "El archivo velado ya reconoce tu paso. Puedo leerte desde rutas simbolicas, hermeticas e iniciaticas con mas profundidad."
          : "La formula ha rozado el borde, pero la segunda camara sigue sellada. Aun no has cruzado el archivo.";
    }

    if (ui.toggle) {
      ui.toggle.textContent = !state.occultMode
        ? "Analisis Archon"
        : state.occultAdmitted
          ? "Archivo velado"
          : "Camara velada";
    }

    syncOccultTheme();
  }

  function closeOccultMode() {
    nextRequestNonce();
    state.mode = "idle";
    state.step = 0;
    state.answers = {};
    state.admissionStep = 0;
    state.admissionAnswers = {};
    state.clueIndex = 0;
    state.archiveFocusId = "blog-33";
    state.archiveFilter = "all";
    state.archiveQuery = "";
    state.aiLastError = "";
    setOccultMode(false);
    updateSession({
      history: [],
      occultMode: false,
      occultAdmitted: false,
      clueIndex: 0
    });
    renderWelcome();
    removePendingOptions();
    addBotMessage(
      "<p><strong>La camara velada ha sido cerrada.</strong></p><p>Volvemos al modo base. Soy Archon, el asistente comercial-consultivo de Archon Consultancies. Desde aqui recuperas la identidad visual normal y las rutas operativas de diagnostico, servicios, marca y precios.</p>"
    );
    addOptions(defaultOptions());
    setStatus("Has vuelto a la fachada visible.", "ready");
  }

  function isDesktopDraggableViewport() {
    if (window.innerWidth < 1120) return false;
    if (!window.matchMedia) return true;
    return window.matchMedia("(hover: hover) and (pointer: fine)").matches;
  }

  function isMobileSheetViewport() {
    return window.innerWidth <= 860;
  }

  function isTabletSheetViewport() {
    return window.innerWidth > 860 && window.innerWidth < 1120;
  }

  function syncChatViewportMode() {
    if (!ui || !ui.root) return;
    ui.root.classList.toggle("is-mobile-sheet", isMobileSheetViewport());
    ui.root.classList.toggle("is-tablet-sheet", isTabletSheetViewport());
  }

  function clamp(value, min, max) {
    return Math.min(Math.max(value, min), max);
  }

  function applyChatPosition() {
    if (!ui || !ui.root) return;
    syncChatViewportMode();

    if (!isDesktopDraggableViewport() || !state.dragPosition) {
      ui.root.classList.remove("is-positioned");
      ui.root.classList.remove("is-draggable");
      ui.root.style.removeProperty("left");
      ui.root.style.removeProperty("top");
      ui.root.style.removeProperty("right");
      ui.root.style.removeProperty("bottom");
      return;
    }

    const margin = 12;
    const width = ui.root.offsetWidth || 316;
    const height = ui.root.offsetHeight || 420;
    const left = clamp(state.dragPosition.left, margin, Math.max(margin, window.innerWidth - width - margin));
    const top = clamp(state.dragPosition.top, margin, Math.max(margin, window.innerHeight - height - margin));

    state.dragPosition = { left: left, top: top };
    ui.root.classList.add("is-positioned");
    ui.root.classList.add("is-draggable");
    ui.root.style.left = left + "px";
    ui.root.style.top = top + "px";
    ui.root.style.right = "auto";
    ui.root.style.bottom = "auto";
  }

  function resetChatPosition() {
    state.dragPosition = null;
    applyChatPosition();
  }

  function bindChatDrag() {
    if (!ui || !ui.header || !ui.toggle) return;

    let dragState = null;

    function stopDrag() {
      if (dragState && dragState.dragged && dragState.handle === "toggle") {
        state.suppressToggleClickUntil = Date.now() + 300;
      }
      dragState = null;
      ui.root.classList.remove("is-dragging");
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", stopDrag);
      window.removeEventListener("pointercancel", stopDrag);
    }

    function onMove(event) {
      if (!dragState) return;

      const deltaX = Math.abs(event.clientX - dragState.startX);
      const deltaY = Math.abs(event.clientY - dragState.startY);

      if (!dragState.dragged && deltaX + deltaY < 6) {
        return;
      }

      if (!dragState.dragged) {
        dragState.dragged = true;
        ui.root.classList.add("is-dragging");
      }

      state.dragPosition = {
        left: event.clientX - dragState.offsetX,
        top: event.clientY - dragState.offsetY
      };
      applyChatPosition();
    }

    function startDrag(event, handle) {
      if (!isDesktopDraggableViewport()) return;
      if (event.button !== undefined && event.button !== 0) return;
      if (handle === "header") {
        if (event.target.closest(".archon-chatbot-close")) return;
        if (event.target.closest("button, input, textarea, a, form")) return;
      }

      const rect = ui.root.getBoundingClientRect();
      dragState = {
        handle: handle,
        offsetX: event.clientX - rect.left,
        offsetY: event.clientY - rect.top,
        startX: event.clientX,
        startY: event.clientY,
        dragged: false
      };

      state.dragPosition = { left: rect.left, top: rect.top };
      window.addEventListener("pointermove", onMove);
      window.addEventListener("pointerup", stopDrag);
      window.addEventListener("pointercancel", stopDrag);
      event.preventDefault();
    }

    ui.header.addEventListener("pointerdown", function (event) {
      startDrag(event, "header");
    });

    ui.toggle.addEventListener("pointerdown", function (event) {
      startDrag(event, "toggle");
    });

    window.addEventListener("resize", function () {
      if (!isDesktopDraggableViewport()) {
        resetChatPosition();
        return;
      }

      applyChatPosition();
    });
  }

  function scrollMessagesToBottom() {
    if (!ui || !ui.body) return;
    ui.body.scrollTop = ui.body.scrollHeight;
  }

  function appendMessage(type, html) {
    const message = document.createElement("div");
    message.className = "archon-chatbot-message archon-chatbot-message--" + type;
    message.innerHTML = html;
    ui.messages.appendChild(message);
    scrollMessagesToBottom();
    return message;
  }

  function addUserMessage(text) {
    appendMessage("user", escapeHtml(text));
  }

  function addBotMessage(html) {
    return appendMessage("bot", html);
  }

  function addCitations(citations) {
    if (!Array.isArray(citations) || !citations.length) return;

    const wrapper = document.createElement("div");
    wrapper.className = "archon-chatbot-actions archon-chatbot-citations";

    citations.slice(0, 5).forEach(function (citation) {
      if (!citation || !citation.url) return;

      const link = document.createElement("a");
      link.className = "archon-chatbot-link";
      link.href = citation.url;
      link.target = "_blank";
      link.rel = "noreferrer noopener";
      link.textContent = citation.title || citation.url;
      wrapper.appendChild(link);
    });

    ui.messages.appendChild(wrapper);
    scrollMessagesToBottom();
  }

  function addOptions(options) {
    const wrapper = document.createElement("div");
    wrapper.className = "archon-chatbot-options";

    options.forEach(function (option) {
      const button = document.createElement("button");
      button.type = "button";
      button.className = "archon-chatbot-option";
      button.textContent = option.label;
      button.addEventListener("click", function () {
        handleOption(option);
      });
      wrapper.appendChild(button);
    });

    ui.messages.appendChild(wrapper);
    scrollMessagesToBottom();
  }

  function removePendingOptions() {
    ui.messages.querySelectorAll(".archon-chatbot-options").forEach(function (node) {
      node.remove();
    });
  }

  function renderSavedDiagnosisPreview(saved) {
    addBotMessage(
      '<div class="archon-chatbot-summary">' +
        "<strong>Tienes un borrador guardado</strong>" +
        "<span>" + escapeHtml(saved.overview) + "</span>" +
        "<span>" + escapeHtml(saved.budgetTitle) + "</span>" +
      "</div>"
    );
    addOptions([
      { label: "Ver borrador", action: "showSaved" },
      { label: "Reservar revision", action: "audit" }
    ]);
  }

  function renderWelcome() {
    ui.messages.innerHTML = "";
    renderPuzzleContainer();
    addBotMessage(
      state.occultMode
        ? state.occultAdmitted
          ? "<p><strong>Archivo velado</strong></p>" +
              "<p>Tu paso ya ha sido reconocido. Aqui la voz que responde no es la fachada comercial, sino una presencia de archivo, renacimiento y disciplina interior.</p>" +
              "<p>Si me preguntas mi nombre, te lo dire. Si me preguntas por doctrina, te mostrare el eje. Y si entras por una ruta, conviene hacerlo sin hambre de volumen.</p>"
          : "<p><strong>Camara velada</strong></p>" +
              "<p>La formula ha sido reconocida, pero el archivo sigue sellado. Todavia no estoy aqui para explicarte todo, sino para medir desde donde preguntas.</p>" +
              "<p>Si quieres cruzar, empieza por la admision. Si no, puedo dejarte solo una sombra mas.</p>"
        : "<p><strong>Analisis Archon</strong></p>" +
            "<p>Puedo diagnosticar debilidades estructurales, preparar un borrador de presupuesto y responder preguntas sobre Archon, su motivacion y sus servicios.</p>" +
            "<p>Y si alguna vez sospechas que este panel tiene una segunda camara, recuerda esto: algunas puertas no se abren con botones, ni con preguntas directas.</p>"
    );

    const saved = loadDiagnosis();
    if (saved) renderSavedDiagnosisPreview(saved);

    addOptions(defaultOptions());
    setStatus("Listo para ayudarte.", "ready");
  }

  function renderReportCard(report, sourceLabel) {
    const budgetItems = report.budgetLines
      .map(function (line) {
        return "<li>" + escapeHtml(line) + "</li>";
      })
      .join("");

    addBotMessage(
      '<div class="archon-chatbot-summary">' +
        "<strong>" + escapeHtml(report.budgetTitle) + "</strong>" +
        "<span>" + escapeHtml(report.overview) + "</span>" +
        "<span>" + escapeHtml(report.recommendation) + "</span>" +
        (sourceLabel ? "<span>Origen del borrador: " + escapeHtml(sourceLabel) + ".</span>" : "") +
        (budgetItems ? "<ul>" + budgetItems + "</ul>" : "") +
      "</div>"
    );
  }

  function currentStep() {
    return diagnosisFlow[state.step];
  }

  function askDiagnosisQuestion() {
    const step = currentStep();
    if (!step) {
      finishDiagnosis();
      return;
    }

    addBotMessage("<p><strong>Paso " + (state.step + 1) + " de " + diagnosisFlow.length + "</strong></p><p>" + escapeHtml(step.prompt) + "</p>");
    addOptions(
      step.options.map(function (option) {
        return {
          label: option.label,
          action: "diagnosisChoice",
          value: option.value
        };
      })
    );
    setStatus("Estoy construyendo tu borrador estructural.", "thinking");
  }

  function startDiagnosis() {
    state.mode = "diagnosis";
    state.step = 0;
    state.answers = {};
    removePendingOptions();
    addBotMessage(
      "<p><strong>Perfecto.</strong></p><p>Voy a hacerte seis preguntas cortas para detectar friccion estructural, priorizar el punto debil y proponerte un borrador que luego revisareis en reunion.</p>"
    );
    askDiagnosisQuestion();
  }

  function answerFounder() {
    addBotMessage("<p><strong>Quien esta detras de Archon</strong></p><p>" + escapeHtml(profile.founder) + "</p>");
    addBotMessage("<p><strong>Motivacion</strong></p><p>" + escapeHtml(profile.motivation) + "</p>");
    addOptions([
      { label: "Mision y valores", action: "mvv" },
      { label: "Diagnosticar mi empresa", action: "startDiagnosis" }
    ]);
    setStatus("Si quieres, tambien te cuento la mision y los valores.", "ready");
  }

  function answerMissionVisionValues() {
    addBotMessage(
      "<p><strong>Mision</strong></p><p>" + escapeHtml(profile.mission) + "</p>" +
        "<p><strong>Vision</strong></p><p>" + escapeHtml(profile.vision) + "</p>" +
        "<p><strong>Valores</strong></p><ul>" +
          profile.values
            .map(function (item) {
              return "<li>" + escapeHtml(item) + "</li>";
            })
            .join("") +
        "</ul>"
    );
    addOptions([
      { label: "Quiero mi borrador", action: "startDiagnosis" },
      { label: "Precios orientativos", action: "pricing" }
    ]);
    setStatus("Puedo aterrizar esto a tu empresa con un diagnostico guiado.", "ready");
  }

  function answerPricing() {
    addBotMessage(
      "<p><strong>Rangos orientativos de Archon</strong></p><ul>" +
        pricing
          .map(function (line) {
            return "<li>" + escapeHtml(line) + "</li>";
          })
          .join("") +
        "</ul><p>El chatbot solo te da un borrador. El presupuesto real se revisa contigo en reunion despues de validar proceso, stack y prioridad.</p>"
    );
    addOptions([
      { label: "Quiero mi borrador", action: "startDiagnosis" },
      { label: "Reservar revision", action: "audit" }
    ]);
    setStatus("Los precios finales dependen de alcance, friccion y secuencia.", "ready");
  }

  function answerServices() {
    addBotMessage(
      "<p><strong>Que hace Archon</strong></p><p>Archon diagnostica, ordena y construye sistemas operativos con IA para empresas que quieren menos trabajo manual, menos dependencia de personas clave y mas control del flujo.</p>"
    );
    addOptions([
      { label: "Analizar mi empresa", action: "startDiagnosis" },
      { label: "Reservar revision", action: "audit" }
    ]);
    setStatus("Si quieres, te hago el diagnostico ahora mismo.", "ready");
  }

  function answerAudit() {
    addBotMessage(
      "<p><strong>Siguiente paso</strong></p><p>Lo mejor es reservar una auditoria de 33 minutos. Asi revisais el borrador, ajustais prioridad y decides si toca quick win, setup focalizado o arquitectura completa.</p>"
    );
    addOptions([{ label: "Ir a la auditoria", action: "audit" }]);
    setStatus("Puedo llevarte al formulario correcto.", "ready");
  }

  function normalizeApiActions(actions) {
    if (!Array.isArray(actions)) return [];

    return actions
      .slice(0, 3)
      .map(function (item) {
        if (!item || !allowedActions.has(item.action) || !item.label) return null;
        return {
          label: item.label,
          action: item.action
        };
      })
      .filter(Boolean);
  }

  function emptyReportFallback() {
    return {
      createdAt: new Date().toISOString(),
      source: "local",
      leadStage: "warm",
      sector: "other",
      sectorLabel: labelForAnswer("sector", "other"),
      answers: {},
      overview: "",
      recommendation: "",
      weaknesses: [],
      budgetTitle: "",
      budgetLines: [],
      summaryText: "",
      auditUrl: serviceUrlForSector("other")
    };
  }

  async function checkApiAvailability() {
    try {
      const response = await fetch(API_ENDPOINT, {
        method: "GET",
        headers: {
          Accept: "application/json"
        }
      });

      if (!response.ok) throw new Error("API unavailable");

      const data = await response.json();
      state.aiAvailable = Boolean(data.configured);
      state.aiLastError = "";
      updateSession({ configured: state.aiAvailable });

      if (state.aiAvailable) {
        setStatus("IA Gemini conectada con busqueda viva. Puedes conversar o pedir tu borrador.", "live");
      } else {
        setStatus("Modo local activo. La IA se activara al configurar GEMINI_API_KEY.", "fallback");
      }
    } catch (error) {
      state.aiAvailable = false;
      state.aiLastError = "No se pudo consultar el estado de Gemini.";
      updateSession({ configured: false });
      setStatus("Modo local activo. Si despliegas la API en Vercel, el chat conversara con IA.", "fallback");
    }
  }

  async function askGemini(payload) {
    const session = loadSession();
    const wasConfigured = session.configured;

    try {
      const response = await fetch(API_ENDPOINT, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          message: payload.message,
          mode: payload.mode || "chat",
          occultMode: state.occultMode,
          occultAdmitted: state.occultAdmitted,
          history: session.history || [],
          page: {
            title: document.title,
            pathname: window.location.pathname,
            url: window.location.href
          },
          diagnosisReport: payload.diagnosisReport || null,
          savedDiagnosis: loadDiagnosis()
        })
      });

      if (!response.ok) {
        const errorPayload = await response.json().catch(function () {
          return null;
        });
        const errorMessage =
          errorPayload && errorPayload.error
            ? errorPayload.error
            : "Gemini no ha respondido correctamente en este turno.";

        state.aiLastError = errorMessage;

        if (response.status === 503 && /gemini_api_key/i.test(errorMessage)) {
          updateSession({ configured: false });
          state.aiAvailable = false;
        } else {
          state.aiAvailable = wasConfigured !== false;
        }
        return null;
      }

      const data = await response.json();
      state.aiLastError = "";
      updateSession({ configured: true });
      state.aiAvailable = true;

      if (payload.message) pushHistory("user", payload.message);
      if (data.reply) pushHistory("assistant", data.reply);

      return data;
    } catch (error) {
      state.aiLastError = "Gemini no ha respondido por red o timeout. Sigo contigo en local.";
      state.aiAvailable = wasConfigured !== false;
      return null;
    }
  }

  function renderApiResponse(data) {
    if (!data) return false;
    data = sanitizeClueReplyIfNeeded(data);

    if (typeof data.occultMode === "boolean") {
      setOccultMode(data.occultMode);
    }
    if (typeof data.occultAdmitted === "boolean") {
      setOccultAdmissionState(Boolean(state.occultMode) && data.occultAdmitted);
      setOccultMode(state.occultMode);
    }

    if (data.reply) {
      addBotMessage(formatReplyHtml(data.reply));
    }

    if (data.citations && data.citations.length) {
      addCitations(data.citations);
    }

    if (data.reportReady && data.report) {
      const report = normalizeAiReport(
        Object.assign({}, data.report, { leadStage: data.leadStage }),
        loadDiagnosis() || emptyReportFallback()
      );
      saveDiagnosis(report);
      hydrateForms();
      renderReportCard(report, "Gemini 2.5 Flash");
    }

    const actions = normalizeApiActions(data.ctas);
    if (actions.length) {
      addOptions(actions);
    } else if (state.occultMode) {
      addOptions(state.occultAdmitted ? occultDefaultOptions() : occultGateOptions());
    } else {
      addOptions(defaultOptions());
    }

    setStatus(
      state.occultMode
        ? (state.occultAdmitted
            ? "Archivo velado abierto. Gemini y busqueda viva activos."
            : "Perimetro alterado. Gemini mantiene el archivo sellado hasta completar la admision.")
        : "IA Gemini conectada. Sigo contigo.",
      "live"
    );
    return true;
  }

  function renderLocalDiagnosis(report, sourceLabel) {
    const weaknessItems = report.weaknesses
      .map(function (item) {
        return "<li><strong>" + escapeHtml(item.title) + ".</strong> " + escapeHtml(item.detail) + "</li>";
      })
      .join("");

    const budgetItems = report.budgetLines
      .map(function (line) {
        return "<li>" + escapeHtml(line) + "</li>";
      })
      .join("");

    addBotMessage(
      "<p><strong>Lectura estructural inicial</strong></p>" +
        "<p>" + escapeHtml(report.overview) + "</p>" +
        '<div class="archon-chatbot-summary">' +
          "<strong>" + escapeHtml(report.budgetTitle) + "</strong>" +
          "<span>" + escapeHtml(report.recommendation) + "</span>" +
          (sourceLabel ? "<span>Origen del borrador: " + escapeHtml(sourceLabel) + ".</span>" : "") +
          "<ul>" + budgetItems + "</ul>" +
        "</div>" +
        "<p><strong>Debilidades mas probables</strong></p>" +
        "<ul>" + weaknessItems + "</ul>"
    );

    addOptions([
      { label: "Reservar revision", action: "audit" },
      { label: "Copiar resumen", action: "copy" },
      { label: "Nuevo analisis", action: "startDiagnosis" }
    ]);
  }

  async function finishDiagnosis() {
    const localReport = buildDiagnosisReport(state.answers);
    let finalReport = localReport;
    const requestNonce = nextRequestNonce();

    removePendingOptions();
    setStatus("Construyendo borrador con Gemini 2.5 Flash...", "thinking");

    const apiResponse = await askGemini({
      message: "Genera un borrador completo a partir del diagnostico guiado.",
      mode: "diagnosis_enrichment",
      diagnosisReport: localReport
    });

    if (!isRequestCurrent(requestNonce)) {
      return;
    }

    if (apiResponse && apiResponse.reportReady && apiResponse.report) {
      finalReport = normalizeAiReport(
        Object.assign({}, apiResponse.report, { leadStage: apiResponse.leadStage }),
        localReport
      );
      saveDiagnosis(finalReport);
      hydrateForms();
      if (apiResponse.reply) {
        addBotMessage(formatReplyHtml(apiResponse.reply));
      }
      renderReportCard(finalReport, "Gemini 2.5 Flash");
      addOptions([
        { label: "Reservar revision", action: "audit" },
        { label: "Copiar resumen", action: "copy" },
        { label: "Nuevo analisis", action: "startDiagnosis" }
      ]);
      setStatus("Borrador IA guardado. Se adjuntara al lead.", "live");
    } else {
      saveDiagnosis(finalReport);
      hydrateForms();
      renderLocalDiagnosis(finalReport, "modo local");
      setStatus(
        loadSession().configured === false
          ? "Borrador local guardado. Gemini no esta configurado, pero el analisis sigue operativo."
          : state.aiLastError
            ? "Borrador local guardado. Gemini fallo en este turno, pero el proceso sigue estable en local."
            : "Borrador guardado. Si envias el formulario, el analisis viajara con el lead.",
        "fallback"
      );
    }

    state.mode = "idle";
    state.step = 0;
    state.answers = {};
  }

  function handleOption(option) {
    removePendingOptions();

    if (option.action === "none") {
      addOptions(defaultOptions());
      return;
    }

    if (option.action === "startOccultAdmission") {
      startOccultAdmission();
      return;
    }

    if (option.action === "occultTopic") {
      answerOccultTopic(option.value);
      return;
    }

    if (option.action === "occultIdentity") {
      answerOccultIdentity();
      return;
    }

    if (option.action === "occultDoctrine") {
      answerOccultDoctrine();
      return;
    }

    if (option.action === "occultLibrary") {
      answerOccultLibraryOverview();
      return;
    }

    if (option.action === "occultClue") {
      replyWithOccultClue();
      addOptions(occultGateOptions());
      return;
    }

    if (option.action === "returnFacade") {
      closeOccultMode();
      return;
    }

    if (option.action === "occultAdmissionChoice") {
      const occultStep = currentOccultStep();
      if (!occultStep) return;
      addUserMessage(option.label);
      state.admissionAnswers[occultStep.id] = option.value;
      state.admissionStep += 1;
      askOccultQuestion();
      return;
    }

    if (option.action === "startDiagnosis") {
      startDiagnosis();
      return;
    }

    if (option.action === "diagnosisChoice") {
      const step = currentStep();
      if (!step) return;
      addUserMessage(option.label);
      state.answers[step.id] = option.value;
      state.step += 1;
      askDiagnosisQuestion();
      return;
    }

    if (option.action === "founder") {
      answerFounder();
      return;
    }

    if (option.action === "mvv") {
      answerMissionVisionValues();
      return;
    }

    if (option.action === "pricing") {
      answerPricing();
      return;
    }

    if (option.action === "showSaved") {
      const saved = loadDiagnosis();
      if (!saved) {
        addBotMessage("<p>No encuentro un borrador guardado. Si quieres, lo hacemos ahora en menos de dos minutos.</p>");
        addOptions([{ label: "Empezar ahora", action: "startDiagnosis" }]);
        return;
      }
      addBotMessage(
        "<p><strong>Ultimo borrador guardado</strong></p><p>" +
          escapeHtml(saved.overview) +
          "</p><p><strong>" +
          escapeHtml(saved.budgetTitle) +
          "</strong></p><ul>" +
          saved.budgetLines
            .map(function (line) {
              return "<li>" + escapeHtml(line) + "</li>";
            })
            .join("") +
          "</ul>"
      );
      addOptions([
        { label: "Reservar revision", action: "audit" },
        { label: "Copiar resumen", action: "copy" }
      ]);
      return;
    }

    if (option.action === "audit") {
      openAuditFromReport(loadDiagnosis());
      setStatus("Te llevo al siguiente paso.", "ready");
      return;
    }

    if (option.action === "copy") {
      copyReport();
      return;
    }
  }

  function handleDiagnosisFreeText(text) {
    const step = currentStep();
    if (!step) return;
    const normalizedText = normalize(text);

    const matched = step.options.find(function (option) {
      return (
        normalize(option.label).indexOf(normalizedText) !== -1 ||
        normalizedText.indexOf(normalize(option.label)) !== -1 ||
        (option.aliases || []).some(function (alias) {
          return normalizedText.indexOf(alias) !== -1;
        })
      );
    });

    if (!matched) {
      addBotMessage("<p>Para que el borrador sea util, respondeme con una de las opciones visibles o escribe algo equivalente.</p>");
      addOptions(
        step.options.map(function (option) {
          return {
            label: option.label,
            action: "diagnosisChoice",
            value: option.value
          };
        })
      );
      return;
    }

    handleOption({
      label: matched.label,
      action: "diagnosisChoice",
      value: matched.value
    });
  }

  function handleOccultAdmissionFreeText(text) {
    const step = currentOccultStep();
    if (!step) return;
    const normalizedText = normalize(text);

    const matched = step.options.find(function (option) {
      return (
        normalize(option.label).indexOf(normalizedText) !== -1 ||
        normalizedText.indexOf(normalize(option.label)) !== -1 ||
        (option.aliases || []).some(function (alias) {
          return normalizedText.indexOf(alias) !== -1;
        })
      );
    });

    if (!matched) {
      addBotMessage("<p>Para que la lectura de admision sea util, respondeme con una de las puertas visibles o con algo equivalente.</p>");
      addOptions(
        step.options.map(function (option) {
          return {
            label: option.label,
            action: "occultAdmissionChoice",
            value: option.value
          };
        })
      );
      return;
    }

    handleOption({
      label: matched.label,
      action: "occultAdmissionChoice",
      value: matched.value
    });
  }

  function handleLocalFreeText(text) {
    const normalizedText = normalize(text);

    if (state.mode === "occult-admission") {
      handleOccultAdmissionFreeText(text);
      return;
    }

    if (!state.occultAdmitted) {
      if (isOccultClueRequest(normalizedText) || (state.puzzle.engaged && isPuzzleHelpRequest(normalizedText))) {
        handlePuzzleHintRequest(normalizedText);
        addOptions(defaultOptions());
        return;
      }
    }

    if (
      normalizedText.indexOf("ocult") !== -1 ||
      normalizedText.indexOf("hermet") !== -1 ||
      normalizedText.indexOf("alquim") !== -1 ||
      normalizedText.indexOf("mason") !== -1 ||
      normalizedText.indexOf("rosacruz") !== -1 ||
      normalizedText.indexOf("historia de la humanidad") !== -1 ||
      normalizedText.indexOf("historia humana oculta") !== -1 ||
      normalizedText.indexOf("historia cosmica") !== -1 ||
      normalizedText.indexOf("secreto") !== -1 ||
      normalizedText.indexOf("camara") !== -1 ||
      normalizedText.indexOf("pista") !== -1
    ) {
      if (!state.occultMode) {
        handlePuzzleHintRequest(normalizedText);
        addOptions(defaultOptions());
        return;
      }
    }

    if (
      normalizedText.indexOf("analisis") !== -1 ||
      normalizedText.indexOf("diagnostico") !== -1 ||
      normalizedText.indexOf("debilidades") !== -1 ||
      normalizedText.indexOf("presupuesto") !== -1
    ) {
      startDiagnosis();
      return;
    }

    if (
      state.occultAdmitted &&
      (
        normalizedText.indexOf("como te llamas") !== -1 ||
        normalizedText.indexOf("tu nombre") !== -1 ||
        normalizedText.indexOf("quien habla") !== -1 ||
        normalizedText.indexOf("como debo llamarte") !== -1 ||
        normalizedText.indexOf("sol negro") !== -1
      )
    ) {
      answerOccultIdentity();
      return;
    }

    if (
      state.occultAdmitted &&
      (
        normalizedText.indexOf("arde") !== -1 ||
        normalizedText.indexOf("renacimiento") !== -1 ||
        normalizedText.indexOf("constitucion") !== -1 ||
        normalizedText.indexOf("soberania") !== -1 ||
        normalizedText.indexOf("segunda transicion") !== -1 ||
        normalizedText.indexOf("base espiritual") !== -1 ||
        normalizedText.indexOf("doctrina") !== -1
      )
    ) {
      answerOccultDoctrine();
      return;
    }

    if (
      normalizedText.indexOf("quien eres") !== -1 ||
      normalizedText.indexOf("quien esta detras") !== -1 ||
      normalizedText.indexOf("fundador") !== -1 ||
      normalizedText.indexOf("quien soy") !== -1
    ) {
      if (state.occultAdmitted) {
        answerOccultIdentity();
        return;
      }
      answerFounder();
      return;
    }

    if (
      normalizedText.indexOf("motivacion") !== -1 ||
      normalizedText.indexOf("origen de archon") !== -1 ||
      normalizedText.indexOf("por que archon") !== -1 ||
      normalizedText.indexOf("porque archon") !== -1
    ) {
      addBotMessage("<p><strong>Motivacion de Archon</strong></p><p>" + escapeHtml(profile.motivation) + "</p>");
      addOptions(defaultOptions());
      return;
    }

    if (
      normalizedText.indexOf("mision") !== -1 ||
      normalizedText.indexOf("vision") !== -1 ||
      normalizedText.indexOf("valores") !== -1
    ) {
      answerMissionVisionValues();
      return;
    }

    if (
      normalizedText.indexOf("precio") !== -1 ||
      normalizedText.indexOf("coste") !== -1 ||
      normalizedText.indexOf("cuanto") !== -1
    ) {
      answerPricing();
      return;
    }

    if (
      normalizedText.indexOf("que haceis") !== -1 ||
      normalizedText.indexOf("que haces") !== -1 ||
      normalizedText.indexOf("servicios") !== -1 ||
      normalizedText.indexOf("consultoria") !== -1 ||
      normalizedText.indexOf("automatizacion") !== -1
    ) {
      answerServices();
      return;
    }

    if (
      normalizedText.indexOf("reunion") !== -1 ||
      normalizedText.indexOf("auditoria") !== -1 ||
      normalizedText.indexOf("hablar") !== -1
    ) {
      answerAudit();
      return;
    }

    if (state.occultMode) {
      if (
        normalizedText.indexOf("admision") !== -1 ||
        normalizedText.indexOf("admis") !== -1 ||
        normalizedText.indexOf("iniciacion") !== -1 ||
        normalizedText.indexOf("umbral") !== -1 ||
        normalizedText.indexOf("puerta") !== -1
      ) {
        startOccultAdmission();
        return;
      }

      if (!state.occultAdmitted) {
        if (
          normalizedText.indexOf("biblioteca") !== -1 ||
          normalizedText.indexOf("fuentes") !== -1 ||
          normalizedText.indexOf("libros") !== -1 ||
          normalizedText.indexOf("corpus") !== -1 ||
          normalizedText.indexOf("hermet") !== -1 ||
          normalizedText.indexOf("alquim") !== -1 ||
          normalizedText.indexOf("mason") !== -1 ||
          normalizedText.indexOf("rosacruz") !== -1 ||
          normalizedText.indexOf("grimorio") !== -1 ||
          normalizedText.indexOf("simbolo") !== -1
        ) {
          addBotMessage(
            "<p><strong>El borde responde, no el archivo.</strong></p><p>Todavia no voy a desplegar rutas, corpus ni nombres. Si de verdad quieres entrar, pide admision o escucha otra sombra.</p>"
          );
          addOptions(occultGateOptions());
          return;
        }
      }

      if (
        normalizedText.indexOf("biblioteca") !== -1 ||
        normalizedText.indexOf("fuentes") !== -1 ||
        normalizedText.indexOf("libros") !== -1 ||
        normalizedText.indexOf("corpus") !== -1
      ) {
        answerOccultLibraryOverview();
        return;
      }

      const topic = findOccultTopic(normalizedText);
      if (topic) {
        answerOccultTopic(topic.id);
        return;
      }

      addBotMessage(
        state.occultAdmitted
          ? "<p><strong>El archivo velado sigue abierto.</strong></p><p>Habla El sol negro desde una disciplina de renacimiento, simbolo y archivo. Puedo trabajar contigo desde hermetismo, alquimia, via iniciatica, arquetipos, meditacion, runas, grimorios o cosmologia simbolica, siempre separando historia, interpretacion y borde especulativo.</p>"
          : "<p><strong>La camara velada sigue escuchando.</strong></p><p>Has alterado el borde, pero todavia no he desplegado el archivo. Si quieres seguir, pide admision o acepta otra sombra menos literal.</p>"
      );
      addOptions(state.occultAdmitted
        ? [
            { label: "Quien habla aqui", action: "occultIdentity" },
            { label: "Doctrina del archivo", action: "occultDoctrine" },
            { label: "Historia velada", action: "occultTopic", value: "historia-humanidad" },
            { label: "Cerrar la camara", action: "returnFacade" }
          ]
        : occultGateOptions());
      return;
    }

    addBotMessage(
      "<p>Puedo ayudarte con cuatro rutas rapidas: diagnosticar la empresa, explicar quien esta detras de Archon, resumir mision y valores o aterrizar precios orientativos.</p>"
    );
    addOptions(defaultOptions());
  }

  async function handleFreeText(text) {
    const normalizedText = normalize(text);
    trackPuzzleSignals(normalizedText);

    if (state.occultMode && isOccultExitRequest(normalizedText)) {
      closeOccultMode();
      return;
    }

    if (!state.occultAdmitted) {
      if (isOccultClueRequest(normalizedText) || (state.puzzle.engaged && isPuzzleHelpRequest(normalizedText))) {
        handlePuzzleHintRequest(normalizedText);
        addOptions(defaultOptions());
        setStatus("Umbral activo. El puzzle se resuelve en local.", "fallback");
        return;
      }

      if (await tryAdvancePuzzle(text)) {
        addOptions(defaultOptions());
        setStatus(
          state.puzzle.stage === "final"
            ? "La llave ya solo acepta voz."
            : "El puzzle sigue avanzando en local.",
          "fallback"
        );
        return;
      }
    }

    if (state.mode === "diagnosis") {
      handleDiagnosisFreeText(text);
      return;
    }

    if (state.mode === "occult-admission") {
      handleOccultAdmissionFreeText(text);
      return;
    }

    setStatus("Pensando la mejor siguiente jugada...", "thinking");
    const requestNonce = nextRequestNonce();

    const apiResponse = await askGemini({
      message: text,
      mode: "chat"
    });

    if (!isRequestCurrent(requestNonce)) {
      return;
    }

    if (renderApiResponse(apiResponse)) {
      return;
    }

    handleLocalFreeText(text);
    setStatus(
      loadSession().configured === false
        ? "Modo local activo. Gemini no esta configurado en Vercel, pero la camara velada puede seguir funcionando en local."
        : state.aiLastError
          ? (state.occultMode
              ? "Gemini ha fallado en este turno. La camara velada sigue operativa en local."
              : "Gemini no ha respondido en este turno. Sigo contigo en modo local.")
          : "Modo local activo. Sigo contigo sin perder contexto.",
      "fallback"
    );
  }

  async function submitInput(event) {
    event.preventDefault();
    const text = ui.input.value.trim();
    if (!text) return;
    state.lastUserInput = text;
    removePendingOptions();
    addUserMessage(text);
    ui.input.value = "";
    await handleFreeText(text);
  }

  function toggleChat(forceOpen) {
    state.open = typeof forceOpen === "boolean" ? forceOpen : !state.open;
    ui.root.classList.toggle("is-open", state.open);
    ui.toggle.setAttribute("aria-expanded", String(state.open));
    if (state.open) {
      ui.input.focus();
      scrollMessagesToBottom();
    }
    requestAnimationFrame(applyChatPosition);
  }

  function createUi() {
    const archive = document.createElement("section");
    archive.className = "archon-occult-archive";
    archive.setAttribute("aria-hidden", "true");
    archive.innerHTML =
      '<div class="archon-occult-archive-shell">' +
        '<div class="archon-occult-archive-header">' +
          '<div class="archon-occult-archive-brand">' +
            '<span class="archon-occult-archive-kicker">Archivo velado</span>' +
            '<strong>Camara de lectura</strong>' +
            '<p>En este modo desaparece la fachada comercial. Solo quedan 33, 777 y el corpus documental integrado en el bot.</p>' +
          '</div>' +
          '<button class="archon-occult-archive-close" type="button" aria-label="Cerrar archivo velado">Cerrar archivo</button>' +
        '</div>' +
        '<div class="archon-occult-archive-toolbar">' +
          '<div class="archon-occult-archive-filters"></div>' +
          '<label class="archon-occult-archive-search">' +
            '<span>Buscar en el archivo</span>' +
            '<input class="archon-occult-archive-search-input" type="search" placeholder="Busca por titulo, ruta o documento..." autocomplete="off">' +
          '</label>' +
          '<div class="archon-occult-archive-summary"></div>' +
        '</div>' +
        '<div class="archon-occult-archive-layout">' +
          '<article class="archon-occult-archive-feature"></article>' +
          '<div class="archon-occult-archive-grid"></div>' +
        '</div>' +
      '</div>';

    const root = document.createElement("div");
    root.className = "archon-chatbot";
    root.innerHTML =
      '<button class="archon-chatbot-toggle" type="button" aria-expanded="false" aria-controls="archon-chatbot-panel">Analisis Archon</button>' +
      '<section class="archon-chatbot-panel" id="archon-chatbot-panel" aria-label="Chatbot de Archon">' +
        '<div class="archon-chatbot-header">' +
          "<div>" +
            "<strong>Archon</strong>" +
            '<span class="archon-chatbot-subtitle">Diagnostico estructural, borrador de presupuesto y respuestas sobre la marca. Existe una segunda camara para quien sepa abrirla.</span>' +
          "</div>" +
          '<div class="archon-chatbot-gate">Camara velada dormida</div>' +
          '<button class="archon-chatbot-close" type="button" aria-label="Cerrar chatbot">&times;</button>' +
        "</div>" +
        '<div class="archon-chatbot-body">' +
          buildPuzzleMarkup() +
          '<div class="archon-chatbot-messages"></div>' +
        "</div>" +
        '<div class="archon-chatbot-footer">' +
          '<div class="archon-chatbot-status">Listo para ayudarte.</div>' +
          '<form class="archon-chatbot-form">' +
            '<input class="archon-chatbot-input" type="text" name="chatbot_message" placeholder="Escribe aqui tu pregunta o responde una opcion..." autocomplete="off">' +
            '<button class="archon-chatbot-send" type="submit">Enviar</button>' +
          "</form>" +
        "</div>" +
      "</section>";

    document.body.appendChild(archive);
    document.body.appendChild(root);

    ui = {
      archiveRoot: archive,
      archiveFeature: archive.querySelector(".archon-occult-archive-feature"),
      archiveGrid: archive.querySelector(".archon-occult-archive-grid"),
      archiveFilters: archive.querySelector(".archon-occult-archive-filters"),
      archiveSearch: archive.querySelector(".archon-occult-archive-search-input"),
      archiveSummary: archive.querySelector(".archon-occult-archive-summary"),
      archiveClose: archive.querySelector(".archon-occult-archive-close"),
      root: root,
      toggle: root.querySelector(".archon-chatbot-toggle"),
      close: root.querySelector(".archon-chatbot-close"),
      header: root.querySelector(".archon-chatbot-header"),
      body: root.querySelector(".archon-chatbot-body"),
      puzzleContainer: root.querySelector("#puzzle-container"),
      messages: root.querySelector(".archon-chatbot-messages"),
      form: root.querySelector(".archon-chatbot-form"),
      input: root.querySelector(".archon-chatbot-input"),
      status: root.querySelector(".archon-chatbot-status"),
      gate: root.querySelector(".archon-chatbot-gate"),
      subtitle: root.querySelector(".archon-chatbot-subtitle"),
      voiceTrigger: root.querySelector("#voice-trigger"),
      voiceFallback: root.querySelector(".archon-chatbot-voice-fallback"),
      voiceFallbackInput: root.querySelector(".archon-chatbot-voice-input"),
      voiceFallbackSubmit: root.querySelector(".archon-chatbot-voice-submit")
    };
  }

  function bindUi() {
    ui.archiveClose.addEventListener("click", function () {
      closeOccultMode();
    });
    ui.archiveFilters.addEventListener("click", function (event) {
      const target = event.target.closest("[data-archive-filter]");
      if (!target) return;
      state.archiveFilter = target.getAttribute("data-archive-filter") || "all";
      renderOccultArchive();
    });
    ui.archiveSearch.addEventListener("input", function () {
      state.archiveQuery = ui.archiveSearch.value || "";
      renderOccultArchive();
    });
    ui.archiveGrid.addEventListener("click", function (event) {
      const target = event.target.closest("[data-archive-entry]");
      if (!target) return;
      state.archiveFocusId = target.getAttribute("data-archive-entry") || "blog-33";
      renderOccultArchive();
    });
    ui.archiveFeature.addEventListener("click", function (event) {
      const closeTarget = event.target.closest("[data-archive-close]");
      if (closeTarget) {
        closeOccultMode();
        return;
      }
      const chatTarget = event.target.closest("[data-archive-chat]");
      if (chatTarget) {
        primeArchivePrompt(chatTarget.getAttribute("data-archive-chat"));
      }
    });
    ui.toggle.addEventListener("click", function () {
      if (Date.now() < state.suppressToggleClickUntil) {
        return;
      }
      toggleChat();
    });
    ui.close.addEventListener("click", function () {
      toggleChat(false);
    });
    ui.form.addEventListener("submit", submitInput);
    if (ui.voiceTrigger) {
      ui.voiceTrigger.addEventListener("click", function () {
        handleVoiceTrigger();
      });
    }
    if (ui.voiceFallbackSubmit) {
      ui.voiceFallbackSubmit.addEventListener("click", function () {
        handleVoiceFallbackSubmit();
      });
    }
    if (ui.voiceFallbackInput) {
      ui.voiceFallbackInput.addEventListener("keydown", function (event) {
        if (event.key !== "Enter") return;
        event.preventDefault();
        handleVoiceFallbackSubmit();
      });
    }
    window.addEventListener("storage", hydrateForms);
    bindChatDrag();
  }

  function init() {
    const session = loadSession();
    initializePuzzleState();
    state.occultMode = Boolean(session.occultMode);
    state.occultAdmitted = Boolean(session.occultAdmitted);
    state.clueIndex = Number.isFinite(session.clueIndex) ? session.clueIndex : 0;
    createUi();
    bindUi();
    applyChatPosition();
    hydrateForms();
    setOccultMode(state.occultMode);
    renderPuzzleContainer();
    renderWelcome();
    checkApiAvailability();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();

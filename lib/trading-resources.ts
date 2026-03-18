export interface Resource {
  type: "article" | "search";
  title: string;
  source: string;
  url: string;
  lang: "es" | "en";
  description?: string;
}

export interface YoutubeSearch {
  label: string;
  query: string;
  lang: "es" | "en";
}

export interface ModuleContent {
  number: number;
  name: string;
  emoji: string;
  description: string;
  concepts: string[];
  youtubeSearches: YoutubeSearch[];
  resources: Resource[];
}

export const MODULE_CONTENT: Record<number, ModuleContent> = {
  1: {
    number: 1,
    name: "Fundamentos del mercado Forex",
    emoji: "🌍",
    description:
      "El mercado Forex mueve más de 6 billones de dólares al día. Opera 24/5 y es el mercado financiero más grande del mundo. Aquí aprendes las bases antes de tocar cualquier estrategia.",
    concepts: [
      "¿Qué es el Forex y cómo funciona?",
      "Pares de divisas: mayores (EUR/USD), menores y exóticos",
      "Pip, lote, spread y apalancamiento",
      "Sesiones: Londres, Nueva York, Tokio, Sydney",
      "Cómo elegir un broker regulado (FCA, CFTC, CySEC)",
      "Diferencia entre mercado spot y CFDs",
    ],
    youtubeSearches: [
      { label: "Forex para principiantes", query: "que es el forex para principiantes español 2024", lang: "es" },
      { label: "Forex basics", query: "forex trading for beginners complete guide 2024", lang: "en" },
      { label: "Pips y lotes", query: "que es un pip lote forex explicacion español", lang: "es" },
    ],
    resources: [
      {
        type: "article",
        title: "¿Qué es el mercado Forex? — Guía completa",
        source: "Investopedia",
        url: "https://www.investopedia.com/terms/forex/f/foreign-exchange-markets.asp",
        lang: "en",
        description: "Explicación completa del mercado de divisas, cómo funciona y quiénes participan.",
      },
      {
        type: "article",
        title: "Introducción al Forex — IG España",
        source: "IG",
        url: "https://www.ig.com/es/forex/que-es-el-forex",
        lang: "es",
        description: "Guía en español sobre qué es el Forex, cómo operar y los riesgos.",
      },
      {
        type: "article",
        title: "School of Pipsology — Forex 101",
        source: "BabyPips",
        url: "https://www.babypips.com/learn/forex/preschool",
        lang: "en",
        description: "El curso gratuito más completo para aprender Forex desde cero.",
      },
      {
        type: "article",
        title: "Glosario Forex: Pip, Spread, Lote",
        source: "Investopedia",
        url: "https://www.investopedia.com/terms/p/pip.asp",
        lang: "en",
        description: "Definición detallada de los términos más usados en Forex.",
      },
    ],
  },
  2: {
    number: 2,
    name: "Análisis técnico básico",
    emoji: "📊",
    description:
      "El análisis técnico estudia el precio histórico para predecir movimientos futuros. Gráficas, patrones e indicadores son tus herramientas principales.",
    concepts: [
      "Tipos de gráficas: línea, barras, velas japonesas",
      "Soporte y resistencia — los niveles clave",
      "Tendencias: alcista, bajista, lateral (rango)",
      "Medias móviles: SMA y EMA",
      "RSI, MACD y Bandas de Bollinger",
      "Patrones de velas: Doji, Hammer, Engulfing",
    ],
    youtubeSearches: [
      { label: "Análisis técnico", query: "analisis tecnico forex desde cero español 2024", lang: "es" },
      { label: "Velas japonesas", query: "velas japonesas patrones forex trading español", lang: "es" },
      { label: "Technical analysis", query: "technical analysis forex trading beginners Rayner Teo", lang: "en" },
    ],
    resources: [
      {
        type: "article",
        title: "Patrones de velas japonesas — Guía visual",
        source: "Investopedia",
        url: "https://www.investopedia.com/articles/active-trading/092315/5-most-powerful-candlestick-patterns.asp",
        lang: "en",
        description: "Los 5 patrones de velas más poderosos con imágenes y ejemplos.",
      },
      {
        type: "article",
        title: "Soporte y Resistencia — BabyPips",
        source: "BabyPips",
        url: "https://www.babypips.com/learn/forex/support-and-resistance",
        lang: "en",
        description: "Cómo identificar y usar niveles de soporte y resistencia.",
      },
      {
        type: "article",
        title: "RSI — Índice de fuerza relativa",
        source: "Investopedia",
        url: "https://www.investopedia.com/terms/r/rsi.asp",
        lang: "en",
        description: "Qué es el RSI, cómo interpretarlo y cuándo usarlo.",
      },
      {
        type: "article",
        title: "Medias móviles — SMA vs EMA",
        source: "Investopedia",
        url: "https://www.investopedia.com/articles/active-trading/052014/how-use-moving-average-buy-stocks.asp",
        lang: "en",
        description: "Diferencia entre SMA y EMA y cómo usarlas para detectar tendencias.",
      },
    ],
  },
  3: {
    number: 3,
    name: "Gestión de riesgo y posición",
    emoji: "🛡️",
    description:
      "La gestión del riesgo es lo que separa a traders rentables de los que quiebran. No importa qué tan buena sea tu estrategia si no controlas cuánto arriesgas.",
    concepts: [
      "Regla del 1-2%: nunca arriesgar más por operación",
      "Stop Loss obligatorio en cada trade",
      "Relación Riesgo/Beneficio (RR): mínimo 1:2",
      "Cálculo del tamaño de posición (position sizing)",
      "Drawdown máximo y cómo recuperarse",
      "Correlación entre pares — no abrir duplicados",
    ],
    youtubeSearches: [
      { label: "Gestión del riesgo", query: "gestion del riesgo trading forex español explicacion", lang: "es" },
      { label: "Position sizing", query: "position sizing forex como calcular lotes español", lang: "es" },
      { label: "Risk management", query: "risk management forex trading position sizing Rayner Teo", lang: "en" },
    ],
    resources: [
      {
        type: "article",
        title: "Position Sizing — Cómo calcular el tamaño",
        source: "Investopedia",
        url: "https://www.investopedia.com/articles/trading/09/determine-position-sizing.asp",
        lang: "en",
        description: "Guía paso a paso para calcular el tamaño correcto de cada posición.",
      },
      {
        type: "article",
        title: "La regla del 1% — BabyPips",
        source: "BabyPips",
        url: "https://www.babypips.com/learn/forex/position-sizing",
        lang: "en",
        description: "Por qué nunca debes arriesgar más del 1-2% por operación.",
      },
      {
        type: "article",
        title: "Stop Loss y Take Profit — Guía completa",
        source: "Investopedia",
        url: "https://www.investopedia.com/articles/active-trading/091813/which-order-use-stoploss-or-stoplimit-orders.asp",
        lang: "en",
        description: "Cómo usar Stop Loss y Take Profit correctamente.",
      },
      {
        type: "article",
        title: "Calculadora de tamaño de posición — Myfxbook",
        source: "Myfxbook",
        url: "https://www.myfxbook.com/forex-calculators/position-size",
        lang: "en",
        description: "Herramienta gratuita para calcular lotes según tu capital y riesgo.",
      },
    ],
  },
  4: {
    number: 4,
    name: "Estrategias de entrada y salida",
    emoji: "🎯",
    description:
      "Una estrategia define exactamente cuándo entrar, dónde poner el stop y cuándo salir. Sin reglas claras, operas por emoción — y eso siempre termina mal.",
    concepts: [
      "Price Action: leer el precio sin indicadores",
      "Ruptura de niveles (Breakout trading)",
      "Retrocesos a soporte/resistencia (Pullback)",
      "Zonas de oferta y demanda (Supply & Demand)",
      "Scalping vs Swing Trading vs Position Trading",
      "Confluence: confirmar señales con múltiples factores",
    ],
    youtubeSearches: [
      { label: "Estrategias Forex", query: "mejores estrategias trading forex para ganar español 2024", lang: "es" },
      { label: "Price Action", query: "price action forex trading español sin indicadores", lang: "es" },
      { label: "Swing trading", query: "swing trading forex strategy Rayner Teo price action", lang: "en" },
    ],
    resources: [
      {
        type: "article",
        title: "Price Action Trading — Guía completa",
        source: "Investopedia",
        url: "https://www.investopedia.com/terms/p/price-action.asp",
        lang: "en",
        description: "Qué es el Price Action y cómo operar sin indicadores.",
      },
      {
        type: "article",
        title: "Swing Trading — BabyPips",
        source: "BabyPips",
        url: "https://www.babypips.com/learn/forex/swing-trading",
        lang: "en",
        description: "Estrategia de swing trading explicada con ejemplos reales.",
      },
      {
        type: "article",
        title: "Breakout Trading Strategy",
        source: "Investopedia",
        url: "https://www.investopedia.com/terms/b/breakout.asp",
        lang: "en",
        description: "Cómo operar rupturas de niveles clave con confirmación.",
      },
      {
        type: "article",
        title: "Supply and Demand Zones",
        source: "BabyPips",
        url: "https://www.babypips.com/learn/forex/support-resistance-zones",
        lang: "en",
        description: "Zonas de oferta y demanda — identificarlas y operarlas.",
      },
    ],
  },
  5: {
    number: 5,
    name: "Psicología del trading",
    emoji: "🧠",
    description:
      "El 80% del trading es mental. El miedo, la codicia y el revenge trading destruyen cuentas cada día. Dominar tus emociones es tan importante como tu estrategia.",
    concepts: [
      "FOMO: el miedo a quedarse fuera de una operación",
      "Revenge trading: operar enojado para recuperar pérdidas",
      "Overtrading: operar demasiado por aburrimiento",
      "Mentalidad de proceso, no de resultado",
      "Cómo manejar rachas perdedoras sin romperte",
      "Rutinas y hábitos del trader disciplinado",
    ],
    youtubeSearches: [
      { label: "Psicología trading", query: "psicologia del trading emociones disciplina español", lang: "es" },
      { label: "FOMO y revenge", query: "como evitar fomo revenge trading forex español", lang: "es" },
      { label: "Trading psychology", query: "trading psychology discipline mindset Rayner Teo", lang: "en" },
    ],
    resources: [
      {
        type: "article",
        title: "Psicología del Trading — Investopedia",
        source: "Investopedia",
        url: "https://www.investopedia.com/articles/trading/02/110502.asp",
        lang: "en",
        description: "Los sesgos emocionales más comunes y cómo combatirlos.",
      },
      {
        type: "article",
        title: "Cómo crear un plan de trading — BabyPips",
        source: "BabyPips",
        url: "https://www.babypips.com/learn/forex/creating-a-trading-plan",
        lang: "en",
        description: "Un plan escrito es la mejor defensa contra las decisiones emocionales.",
      },
      {
        type: "article",
        title: "Trading Journal — Por qué llevarlo",
        source: "Investopedia",
        url: "https://www.investopedia.com/articles/trading/01/stoplosskills.asp",
        lang: "en",
        description: "Cómo el journaling mejora tu disciplina y resultados a largo plazo.",
      },
      {
        type: "article",
        title: "Libro recomendado: Trading in the Zone",
        source: "Amazon",
        url: "https://www.amazon.com/Trading-Zone-Confidence-Discipline-Attitude/dp/0735201447",
        lang: "en",
        description: "El libro de Mark Douglas — el más recomendado sobre psicología del trading.",
      },
    ],
  },
  6: {
    number: 6,
    name: "Backtesting y journaling",
    emoji: "📋",
    description:
      "Antes de arriesgar dinero real, prueba tu estrategia con datos históricos. El backtesting te dice si tu sistema funciona — el journaling te dice por qué.",
    concepts: [
      "¿Qué es el backtesting y por qué es esencial?",
      "Backtesting manual en TradingView (gratis)",
      "Métricas clave: Win Rate, Profit Factor, R:R promedio",
      "Cómo evitar el overfitting (adaptar al pasado, no al futuro)",
      "Cómo llevar un trading journal efectivo",
      "Revisión semanal: aprende de cada trade",
    ],
    youtubeSearches: [
      { label: "Backtesting", query: "como hacer backtesting en tradingview español paso a paso", lang: "es" },
      { label: "Trading journal", query: "como llevar un trading journal forex español plantilla", lang: "es" },
      { label: "Backtesting guide", query: "how to backtest forex trading strategy TradingView 2024", lang: "en" },
    ],
    resources: [
      {
        type: "article",
        title: "Backtesting — Guía completa",
        source: "Investopedia",
        url: "https://www.investopedia.com/terms/b/backtesting.asp",
        lang: "en",
        description: "Qué es el backtesting, cómo hacerlo correctamente y qué métricas usar.",
      },
      {
        type: "article",
        title: "Cómo crear un trading journal — BabyPips",
        source: "BabyPips",
        url: "https://www.babypips.com/learn/forex/how-to-make-a-forex-trading-journal",
        lang: "en",
        description: "Plantilla y guía para llevar un diario de trading efectivo.",
      },
      {
        type: "article",
        title: "TradingView — Herramienta gratuita de backtesting",
        source: "TradingView",
        url: "https://www.tradingview.com/chart/",
        lang: "en",
        description: "La plataforma más usada para análisis técnico y backtesting manual.",
      },
      {
        type: "article",
        title: "Myfxbook — Analiza tu historial de trades",
        source: "Myfxbook",
        url: "https://www.myfxbook.com/",
        lang: "en",
        description: "Conecta tu cuenta de broker y analiza tus estadísticas automáticamente.",
      },
    ],
  },
};

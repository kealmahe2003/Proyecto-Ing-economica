# FinCalc — Software de apoyo para Ingeniería Económica

Aplicación web educativa para calcular, paso a paso, operaciones financieras de Ingeniería Económica: interés simple y compuesto, conversión de tasas, anualidades, amortización, inflación y crédito educativo. Incluye una wiki de conceptos y un asistente conversacional.

Pensada para estudiantes universitarios en Colombia: montos en pesos (COP) y notación de tasas local (EA, NMV, NTV, anticipada/vencida).

**Demo:** [ing-economica-sistemas.vercel.app](https://ing-economica-sistemas.vercel.app)

---

## Funcionalidades

| Módulo | Qué resuelve |
| --- | --- |
| Interés simple | Despeja F, P, i o n con crecimiento lineal |
| Interés compuesto | Despeja cualquier variable; gráfica comparativa simple vs. compuesto |
| Conversión de tasas | EA ↔ nominal ↔ efectiva periódica, anticipada ↔ vencida, tabla de equivalencias |
| Anualidades | Series uniformes: valor presente, valor futuro y cuota (PMT) |
| Amortización | Tablas completas sistema francés (cuota fija) y alemán (abono constante), exportables a Excel |
| Crédito educativo | Simulación de desembolsos periódicos, periodo de gracia y amortización posterior, exportable a Excel |
| Inflación y tasas reales | Ecuación de Fisher y poder adquisitivo |
| Wiki de conceptos | 22 conceptos con definiciones, fórmulas y ejemplos, con búsqueda |
| Asistente IA | Chat sobre los conceptos de la wiki (Gemini vía función serverless) |

Cada calculadora muestra el **procedimiento paso a paso** y permite pasar resultados de un módulo a otro; la mayoría incluye diagrama de flujo de caja. Incluye modo guiado/experto y tema claro/oscuro.

## Stack

- **Frontend:** React 18, TypeScript, Vite, Tailwind CSS
- **Gráficas:** Recharts
- **Estado:** Zustand
- **Enrutamiento:** React Router
- **Exportación:** SheetJS (xlsx)
- **Backend:** Vercel Serverless Function (`api/chat.ts`) como proxy a la API de Gemini
- **Despliegue:** Vercel

## Arquitectura

```
api/
└── chat.ts               Función serverless del asistente (la API key vive solo en el servidor)
src/
├── lib/                  Lógica financiera pura, sin React
├── pages/                Una página por módulo (Calculators/, Wiki/, Home/)
├── components/           Layout y kit de UI reutilizable (StepByStep, CashFlowDiagram, Chatbot…)
├── store/                Estado global con Zustand (historial, traspaso entre módulos)
├── utils/                Formateo de moneda, porcentajes y números
└── types/                Tipos compartidos
```

Las fórmulas están aisladas en `src/lib`, separadas de la interfaz, lo que facilita verificarlas y reutilizarlas.

## Ejecución local

Requisitos: Node.js 20.19+ (exigido por Vite 7).

```bash
npm install
npm run dev        # servidor de desarrollo en http://localhost:5173
npm run build      # verificación de tipos + build de producción
npm run lint       # ESLint
```

El asistente IA requiere la variable de entorno `GEMINI_API_KEY` y ejecutarse con [`vercel dev`](https://vercel.com/docs/cli/dev); el resto de la aplicación funciona solo con `npm run dev`.

## Equipo

Proyecto académico del curso de Ingeniería Económica, desarrollado por:

- Kevin Alexander Marin
- Pablo Nicolas Marin Gonzalez
- Carlos Fernando Padilla Mesa
- Santiago Velasquez Bedoya
- Kevin Steven Rico Gonzalez
- Miguel Angel Sanclemente Mejia
- Nini Johanna Cambindo
- Juan Camilo Gutierrez
- Juan Jose Gonzalez Trujillo
- Melissa Espitia Marín

## Flujo de contribución

Cada integrante trabajó en su propia rama y abrió un pull request hacia `main`. Otra persona del equipo revisaba cada pull request antes de integrarlo.

## Licencia

Distribuido bajo la [licencia MIT](LICENSE). Puedes usar, modificar y compartir el código libremente, siempre que conserves el aviso de copyright con los nombres de sus autores.

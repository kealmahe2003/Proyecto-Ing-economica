import { PageHeader, Callout } from '../../components/ui'

const SECTIONS = [
  {
    title: 'Uso educativo',
    body: 'FinCalc es una herramienta académica para aprender Ingeniería Económica. Los resultados son aproximaciones con fines didácticos y no constituyen asesoría financiera. Antes de tomar decisiones, verifica siempre las condiciones reales con tu entidad financiera o con el ICETEX.',
  },
  {
    title: 'Datos que se guardan',
    body: 'La aplicación no usa cookies, no tiene cuentas de usuario ni herramientas de analítica. Solo guarda en tu navegador (localStorage) el tema claro/oscuro y el historial de cálculos. Esos datos nunca salen de tu dispositivo y puedes borrarlos limpiando los datos del sitio en tu navegador.',
  },
  {
    title: 'Asistente con IA',
    body: 'Los mensajes que escribes en el asistente se envían a la API de Google Gemini para generar la respuesta, sujetos a la política de privacidad de Google. No escribas datos personales en el chat. Las respuestas pueden contener errores; contrástalas con la Wiki y las calculadoras.',
  },
  {
    title: 'Servicios de terceros',
    body: 'El sitio está alojado en Vercel y carga tipografías desde Google Fonts, por lo que estos proveedores pueden recibir datos técnicos de conexión, como tu dirección IP.',
  },
  {
    title: 'Autoría',
    body: '© 2026 Equipo FinCalc. El código, los contenidos y el diseño de este sitio son obra de sus autores y se distribuyen bajo la licencia MIT: puedes reutilizarlos siempre que conserves el aviso de autoría.',
  },
]

export default function PrivacyPage() {
  return (
    <div className="p-6 lg:p-10 max-w-4xl mx-auto">
      <PageHeader
        chip="Legal"
        title="Privacidad y términos"
        description="Cómo funciona FinCalc con tus datos y bajo qué condiciones puedes usarlo."
      />
      <Callout color="gold">
        Al usar este sitio aceptas que es un recurso educativo y que sus autores no se hacen
        responsables por decisiones financieras tomadas con base en sus resultados.
      </Callout>
      {SECTIONS.map((s) => (
        <section key={s.title} className="card p-6 mb-4">
          <h2 className="display text-xl font-semibold mb-2" style={{ color: 'var(--text)' }}>
            {s.title}
          </h2>
          <p className="text-sm leading-relaxed" style={{ color: 'var(--muted)' }}>
            {s.body}
          </p>
        </section>
      ))}
    </div>
  )
}

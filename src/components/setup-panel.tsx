import { Database, Wrench } from "@phosphor-icons/react/dist/ssr";

export function SetupPanel() {
  return <section className="setup-panel" aria-labelledby="setup-title"><div className="setup-symbol"><Database size={28} weight="bold" aria-hidden="true" /></div><div><p className="eyebrow">Base pendiente</p><h2 id="setup-title">Conecta la nueva base para empezar.</h2><p>La interfaz está preparada. El siguiente paso es crear PostgreSQL en Vercel y ejecutar la importación verificada de la copia SQLite.</p></div><div className="setup-actions"><Wrench size={20} aria-hidden="true" /><span>Sin datos de ejemplo</span></div></section>;
}

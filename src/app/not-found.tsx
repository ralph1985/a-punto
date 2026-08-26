import Link from "next/link";

export default function NotFoundPage() {
  return <main className="feedback-page"><section><p className="eyebrow">Página no encontrada</p><h1>Esta ficha no existe.</h1><p>Puede haberse eliminado o la dirección no ser correcta.</p><Link href="/">Volver a A Punto</Link></section></main>;
}

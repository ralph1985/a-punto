"use client";

export default function ErrorPage({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return <main className="feedback-page"><section><p className="eyebrow">Ha ocurrido un error</p><h1>No se ha podido cargar A Punto.</h1><p>Los datos no se han modificado. Inténtalo de nuevo.</p><button type="button" onClick={reset}>Reintentar</button></section></main>;
}

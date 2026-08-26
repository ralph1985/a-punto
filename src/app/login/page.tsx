import { Wrench } from "@phosphor-icons/react/dist/ssr";
import { LoginForm } from "./login-form";

export default function LoginPage() {
  return (
    <main className="login-page">
      <section className="login-panel" aria-labelledby="login-title">
        <div className="brand-mark" aria-hidden="true"><Wrench size={30} weight="bold" /></div>
        <p className="eyebrow">A Punto</p>
        <h1 id="login-title">Mantenimiento bajo control.</h1>
        <p className="login-copy">Acceso privado a la agenda de tus coches.</p>
        <LoginForm />
      </section>
    </main>
  );
}

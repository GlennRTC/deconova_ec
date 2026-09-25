import Link from "next/link";

export default function Home() {
  return (
    <>
      <header>
        <nav aria-label="Principal">
          <Link href="/" data-testid="brand">Deconova</Link>
        </nav>
      </header>
      <main>
        <h1>Deconova</h1>
        <p>Sitio en construcción.</p>
      </main>
    </>
  );
}

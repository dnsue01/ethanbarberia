import Link from "next/link";

export default function NoEncontrada() {
  return (
    <section className="bloque pagina vacio-pagina">
      <h1>Esta página no existe</h1>
      <p>Puede que el producto ya no esté o que el enlace esté mal escrito.</p>
      <Link className="boton" href="/tienda">
        Volver a la tienda
      </Link>
    </section>
  );
}

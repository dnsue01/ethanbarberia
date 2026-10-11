import Link from "next/link";

export default function Pie() {
  return (
    <footer className="pie">
      <p className="pie__marca">Ethan Barbershop</p>
      <div className="pie__fila">
        <p className="pie__frase">La perilla me pone perrilla. El flequillo me pone perrillo.</p>
        <nav aria-label="Pie">
          <Link href="/tienda">Tienda</Link>
          <a href="https://www.instagram.com/ethan.lopzz/" target="_blank" rel="noopener noreferrer">
            Instagram
          </a>
        </nav>
      </div>
      <p className="pie__legal">Pago seguro con Shopify · © {new Date().getFullYear()} Ethan Barbershop</p>
    </footer>
  );
}

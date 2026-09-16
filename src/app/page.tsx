import { getCatalogo } from "@/lib/shopify";
import Escena from "@/components/Escena";

export default async function Home() {
  const catalogo = await getCatalogo();
  return <Escena catalogo={catalogo} />;
}

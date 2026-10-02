import { getCatalogo } from "@/lib/shopify";
import Sitio from "@/components/Sitio";

export default async function Home() {
  const catalogo = await getCatalogo();
  return <Sitio catalogo={catalogo} />;
}

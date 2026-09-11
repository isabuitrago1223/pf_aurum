import { Suspense } from "react";

import Header from "../components/Header";
import Hero from "../components/Hero";
import Categories from "../components/Categories";
import Products from "../components/Products";
import ProductsLoading from "../components/ProductsLoading";
import Footer from "../components/Footer";

export default function Home() {
  return (
    <main className="min-h-screen bg-[#fffaf7] text-[#2f2a27]">
      {/* ENCABEZADO */}
      <Header />

      {/* SECCION PRINCIPAL */}
      <Hero />

      {/* CATEGORIAS */}
      <Categories />

      {/* PRODUCTOS DESTACADOS */}
      <Suspense fallback={<ProductsLoading />}>
        <Products />
      </Suspense>

      {/* PIE DE PAGINA */}
      <Footer />
    </main>
  );
}
import Header from "../components/Header";
import Hero from "../components/Hero";
import Categories from "../components/Categories";
import Products from "../components/Products";

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
      <Products />

      {/* PIE DE PAGINA */}
      <footer className="border-t border-[#eadfd8] bg-white py-8 text-center text-sm text-[#7a6f69]">
        © 2026 Aurum Decoraciones
      </footer>
    </main>
  );
}
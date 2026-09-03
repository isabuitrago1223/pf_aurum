import Header from "../components/Header";
import Hero from "../components/Hero";
import Categories from "../components/Categories";
import Products from "../components/Products";
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
      <Products />

      {/* PIE DE PAGINA */}
      <Footer />
    </main>
  );
}
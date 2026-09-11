"use client";

import { useEffect, useState } from "react";
import {
  MapPin,
  Sparkles,
  Star,
  X,
} from "lucide-react";

type ModalType =
  | "nosotros"
  | "equipo"
  | "privacidad"
  | "terminos"
  | "seguridad"
  | "preguntas"
  | "contacto"
  | null;

const testimonios = [
  {
    texto:
      "El desayuno sorpresa para el cumpleaños de mi mamá estuvo sencillamente espectacular. Las frutas súper frescas, los waffles calienticos y la decoración en morado y dorado preciosa.",
    nombre: "Camila Rodríguez",
    ciudad: "Bogotá",
    ocasion: "Cumpleaños",
  },
  {
    texto:
      "La ancheta gourmet con vino llegó exactamente a la hora programada en mi aniversario. Mi esposo quedó fascinado con la presentación elegante.",
    nombre: "Felipe Mendoza",
    ciudad: "Chía",
    ocasion: "Aniversario",
  },
  {
    texto:
      "La atención fue excelente y todo llegó tal como lo esperaba. Los detalles quedaron hermosos y la presentación fue impecable.",
    nombre: "Valeria Santos",
    ciudad: "Bogotá",
    ocasion: "Graduación",
  },
];

export default function Footer() {
  const [modal, setModal] = useState<ModalType>(null);

  useEffect(() => {
    function handleEscape(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setModal(null);
      }
    }

    window.addEventListener("keydown", handleEscape);

    return () => {
      window.removeEventListener("keydown", handleEscape);
    };
  }, []);

  return (
    <>
      {/* Testimonios */}
      <section className="bg-slate-50 px-4 py-20 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="mx-auto max-w-3xl text-center">
            <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.18em] text-purple-700">
              <Sparkles className="h-4 w-4 text-amber-500" />
              Opiniones de clientes
            </div>

            <h2 className="mt-4 font-serif text-4xl font-black tracking-tight text-purple-950 sm:text-5xl">
              Experiencias que enamoran
            </h2>

            <p className="mx-auto mt-4 max-w-2xl text-sm leading-7 text-slate-600 sm:text-base">
              La confianza y felicidad de nuestros clientes es
              nuestra mayor satisfacción.
            </p>
          </div>

          <div className="mt-12 grid gap-6 md:grid-cols-3">
            {testimonios.map((testimonio) => (
              <article
                key={testimonio.nombre}
                className="rounded-3xl border border-purple-100 bg-white p-7 shadow-sm"
              >
                <div className="flex items-center justify-between gap-3">
                  <div
                    className="flex gap-1 text-amber-400"
                    aria-label="5 estrellas"
                  >
                    {Array.from({ length: 5 }).map((_, index) => (
                      <Star
                        key={index}
                        className="h-4 w-4 fill-current"
                      />
                    ))}
                  </div>

                  <span className="rounded-full bg-purple-50 px-3 py-1 text-[10px] font-bold text-purple-700">
                    {testimonio.ocasion}
                  </span>
                </div>

                <p className="mt-5 min-h-[120px] text-sm italic leading-7 text-slate-600">
                  “{testimonio.texto}”
                </p>

                <div className="mt-5 border-t border-purple-50 pt-5">
                  <p className="text-sm font-black text-purple-950">
                    {testimonio.nombre}
                  </p>

                  <p className="mt-1 text-xs text-slate-400">
                    {testimonio.ciudad}
                  </p>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-purple-950 text-white">
        <div className="mx-auto max-w-7xl px-6 py-10 lg:px-8">
          {/* Marca y ubicación */}
          <div className="flex flex-col gap-8 border-b border-white/10 pb-8 md:flex-row md:items-center md:justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-amber-300 text-purple-950">
                <Sparkles className="h-6 w-6" />
              </div>

              <div>
                <p className="font-serif text-xl font-black text-amber-300">
                  Aurum Decoraciones
                </p>

                <p className="mt-1 text-xs text-purple-200">
                  Desayunos sorpresa, anchetas y regalos de ocasión
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 text-xs text-purple-100">
              <MapPin className="h-4 w-4 text-amber-300" />

              <span>
                Avenida 39A #62-42, Bogotá
              </span>
            </div>
          </div>

          {/* Enlaces */}
          <nav className="flex flex-wrap items-center justify-center gap-x-5 gap-y-4 border-b border-white/10 py-8 text-xs font-semibold text-purple-100">
            <button
              type="button"
              onClick={() => setModal("nosotros")}
              className="transition hover:text-amber-300"
            >
              Acerca de nosotros
            </button>

            <span className="text-purple-500">•</span>

            <button
              type="button"
              onClick={() => setModal("equipo")}
              className="transition hover:text-amber-300"
            >
              Integrantes del equipo
            </button>

            <span className="text-purple-500">•</span>

            <button
              type="button"
              onClick={() => setModal("privacidad")}
              className="transition hover:text-amber-300"
            >
              Política de privacidad
            </button>

            <span className="text-purple-500">•</span>

            <button
              type="button"
              onClick={() => setModal("terminos")}
              className="transition hover:text-amber-300"
            >
              Términos y condiciones
            </button>

            <span className="text-purple-500">•</span>

            <button
              type="button"
              onClick={() => setModal("seguridad")}
              className="transition hover:text-amber-300"
            >
              Políticas de seguridad
            </button>

            <span className="text-purple-500">•</span>

            <button
              type="button"
              onClick={() => setModal("preguntas")}
              className="transition hover:text-amber-300"
            >
              Preguntas frecuentes
            </button>

            <span className="text-purple-500">•</span>

            <button
              type="button"
              onClick={() => setModal("contacto")}
              className="transition hover:text-amber-300"
            >
              Contáctanos
            </button>
          </nav>

          {/* Créditos */}
          <div className="pt-6 text-center text-[11px] leading-6 text-purple-300">
            <p>
              © 2026 Aurum Decoraciones. Todos los derechos reservados.
            </p>

            <p className="mt-1">
              Proyecto desarrollado por Tatiana, Karen e Isabella.
            </p>
          </div>
        </div>
      </footer>

      {/* Modal */}
      {modal && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-purple-950/70 p-4 backdrop-blur-sm"
          onClick={() => setModal(null)}
        >
          <div
            className="max-h-[85vh] w-full max-w-2xl overflow-hidden rounded-3xl bg-white shadow-2xl"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex items-center justify-between bg-purple-950 px-6 py-5">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.18em] text-amber-300">
                  Aurum Decoraciones
                </p>

                <h2 className="mt-1 font-serif text-xl font-black text-white">
                  {getModalTitle(modal)}
                </h2>
              </div>

              <button
                type="button"
                onClick={() => setModal(null)}
                aria-label="Cerrar ventana"
                className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white transition hover:bg-white/20"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="max-h-[65vh] overflow-y-auto px-7 py-7 text-sm leading-7 text-slate-600">
              <ModalContent type={modal} />
            </div>

            <div className="border-t border-purple-50 bg-slate-50 px-7 py-4 text-right">
              <button
                type="button"
                onClick={() => setModal(null)}
                className="rounded-full bg-purple-900 px-6 py-2.5 text-sm font-bold text-white transition hover:bg-purple-800"
              >
                Volver
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

function getModalTitle(
  type: Exclude<ModalType, null>,
) {
  const titles = {
    nosotros: "Acerca de Nosotros",
    equipo: "Integrantes del Equipo",
    privacidad: "Política de Privacidad",
    terminos: "Términos y Condiciones",
    seguridad: "Políticas de Seguridad",
    preguntas: "Preguntas Frecuentes",
    contacto: "Contáctanos",
  };

  return titles[type];
}

function ModalContent({
  type,
}: {
  type: Exclude<ModalType, null>;
}) {
  if (type === "nosotros") {
    return (
      <div className="space-y-5">
        <h3 className="font-serif text-lg font-black text-purple-950">
          Nuestra Historia
        </h3>

        <p>
          Aurum Decoraciones nace con el propósito de transformar
          fechas especiales en experiencias memorables mediante
          regalos, desayunos, flores, anchetas y detalles
          personalizados.
        </p>

        <h3 className="font-serif text-lg font-black text-purple-950">
          Nuestra misión
        </h3>

        <p>
          Crear experiencias únicas a través de detalles preparados
          con dedicación, creatividad y atención personalizada.
        </p>
      </div>
    );
  }

  if (type === "equipo") {
    return (
      <div className="grid gap-4 sm:grid-cols-3">
        <TeamCard
          nombre="Tatiana"
          rol="Scrum Master"
        />

        <TeamCard
          nombre="Karen"
          rol="Frontend"
        />

        <TeamCard
          nombre="Isabella"
          rol="Backend"
        />
      </div>
    );
  }

  if (type === "terminos") {
    return (
      <div className="space-y-5">
        <p>
          Al utilizar Aurum Decoraciones, el usuario acepta las
          condiciones aplicables al uso de la plataforma, registro,
          pedidos y servicios ofrecidos.
        </p>

        <h3 className="font-bold text-purple-950">
          Pedidos
        </h3>

        <p>
          El cliente debe verificar que los productos, cantidades,
          datos de entrega y personalizaciones sean correctos antes
          de confirmar un pedido.
        </p>

        <h3 className="font-bold text-purple-950">
          Disponibilidad
        </h3>

        <p>
          Los productos y tiempos de entrega están sujetos a
          disponibilidad de inventario y condiciones informadas al
          momento de realizar el pedido.
        </p>

        <h3 className="font-bold text-purple-950">
          Personalizaciones
        </h3>

        <p>
          Los productos personalizados se elaboran de acuerdo con la
          información suministrada por el cliente.
        </p>
      </div>
    );
  }

  if (type === "privacidad") {
    return (
      <div className="space-y-5">
        <p>
          Aurum Decoraciones utiliza los datos proporcionados por los
          usuarios para gestionar cuentas, pedidos, entregas y
          atención relacionada con el servicio.
        </p>

        <p>
          La información personal debe ser tratada únicamente para
          las finalidades necesarias para el funcionamiento de la
          plataforma.
        </p>
      </div>
    );
  }

  if (type === "seguridad") {
    return (
      <div className="space-y-5">
        <p>
          Aurum Decoraciones aplica mecanismos de autenticación y
          control de acceso para proteger las funciones privadas de
          la plataforma.
        </p>

        <p>
          Las credenciales de acceso son personales y cada usuario es
          responsable de mantenerlas protegidas.
        </p>

        <p>
          Las operaciones administrativas están restringidas a
          usuarios con los permisos correspondientes.
        </p>
      </div>
    );
  }

  if (type === "preguntas") {
    return (
      <div className="space-y-6">
        <Faq
          pregunta="¿Puedo personalizar un producto?"
          respuesta="Sí. Los productos que permiten personalización mostrarán las opciones disponibles en su detalle."
        />

        <Faq
          pregunta="¿Dónde puedo revisar mis pedidos?"
          respuesta="Después de iniciar sesión puedes consultar tus pedidos desde la sección Mis pedidos."
        />

        <Faq
          pregunta="¿Puedo comprar varios productos?"
          respuesta="Sí. Puedes agregarlos al carrito y revisar cantidades y valores antes de continuar con el pedido."
        />

        <Faq
          pregunta="¿Las imágenes corresponden al producto real?"
          respuesta="Las imágenes sirven como referencia visual del producto y pueden existir pequeñas variaciones propias de cada preparación o personalización."
        />
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <h3 className="font-serif text-lg font-black text-purple-950">
        Atención personalizada
      </h3>

      <p>
        Si necesitas ayuda con un producto, personalización, pedido o
        entrega, puedes comunicarte con Aurum Decoraciones mediante
        los canales de atención habilitados por la tienda.
      </p>

      <div className="rounded-2xl bg-purple-50 p-5">
        <p className="font-bold text-purple-950">
          Aurum Decoraciones
        </p>

        <p className="mt-2">
          Avenida 39A #62-42, Bogotá
        </p>
      </div>
    </div>
  );
}

function TeamCard({
  nombre,
  rol,
}: {
  nombre: string;
  rol: string;
}) {
  return (
    <div className="rounded-2xl border border-purple-100 bg-purple-50/50 p-5 text-center">
      <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-purple-950 font-serif text-xl font-black text-amber-300">
        {nombre.charAt(0)}
      </div>

      <p className="mt-4 font-bold text-purple-950">
        {nombre}
      </p>

      <p className="mt-1 text-xs text-slate-500">
        {rol}
      </p>
    </div>
  );
}

function Faq({
  pregunta,
  respuesta,
}: {
  pregunta: string;
  respuesta: string;
}) {
  return (
    <div className="border-b border-purple-50 pb-5">
      <h3 className="font-bold text-purple-950">
        {pregunta}
      </h3>

      <p className="mt-2">
        {respuesta}
      </p>
    </div>
  );
}
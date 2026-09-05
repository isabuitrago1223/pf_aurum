import { Suspense } from "react";

import NewOrderForm from "../../../components/NewOrderForm";

export default function NewOrderPage() {
  return (
    <Suspense
      fallback={
        <main className="min-h-screen bg-[#faf7f5] px-6 py-12">
          <div className="mx-auto max-w-3xl">
            <p className="text-[#7a6f69]">
              Cargando pedido...
            </p>
          </div>
        </main>
      }
    >
      <NewOrderForm />
    </Suspense>
  );
}

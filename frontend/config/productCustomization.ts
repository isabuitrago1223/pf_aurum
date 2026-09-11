export type CustomizationOption = {
  label: string;
  value: string;
};

export type CustomizationGroup = {
  id: string;
  label: string;
  type: "single" | "multiple" | "text";
  maxSelections?: number;
  options?: CustomizationOption[];
  placeholder?: string;
};

export type ProductCustomizationConfig = {
  title: string;
  groups: CustomizationGroup[];
};

export const customizationByCategory: Record<
  string,
  ProductCustomizationConfig
> = {
  desayunos: {
    title: "Opciones del desayuno sorpresa",
    groups: [
      {
        id: "colorDecoracion",
        label: "Seleccionar color de la decoración",
        type: "single",
        options: [
          { label: "Morado", value: "morado" },
          { label: "Lila", value: "lila" },
          { label: "Morado oscuro", value: "morado-oscuro" },
          { label: "Fucsia", value: "fucsia" },
          { label: "Blanco", value: "blanco" },
          { label: "Rojo", value: "rojo" },
          { label: "Amarillo", value: "amarillo" },
          { label: "Verde", value: "verde" },
          { label: "Azul", value: "azul" },
        ],
      },
      {
        id: "platoPrincipal",
        label: "Plato principal",
        type: "single",
        options: [
          { label: "Sándwich de pollo", value: "sandwich-pollo" },
          { label: "Waffles", value: "waffles" },
        ],
      },
      {
        id: "bebida",
        label: "Bebida",
        type: "single",
        options: [
          { label: "Café frío", value: "cafe-frio" },
          { label: "Café caliente", value: "cafe-caliente" },
          { label: "Chocolate", value: "chocolate" },
          { label: "Jugo de naranja", value: "jugo-naranja" },
        ],
      },
      {
        id: "frutas",
        label: "Frutas",
        type: "multiple",
        maxSelections: 2,
        options: [
          { label: "Fresa", value: "fresa" },
          { label: "Kiwi", value: "kiwi" },
          { label: "Mango", value: "mango" },
          { label: "Uvas", value: "uvas" },
          { label: "Piña", value: "pina" },
        ],
      },
      {
        id: "mensaje",
        label: "Mensaje personalizado",
        type: "text",
        placeholder: "Escribe el mensaje que quieres incluir...",
      },
    ],
  },

  ramos: {
    title: "Personaliza tu ramo",
    groups: [
      {
        id: "tono",
        label: "Tono principal",
        type: "single",
        options: [
          { label: "Lila", value: "lila" },
          { label: "Rosado", value: "rosado" },
          { label: "Rojo", value: "rojo" },
          { label: "Blanco", value: "blanco" },
        ],
      },
      {
        id: "mensaje",
        label: "Mensaje personalizado",
        type: "text",
        placeholder: "Escribe tu dedicatoria...",
      },
    ],
  },

  anchetas: {
    title: "Personaliza tu ancheta",
    groups: [
      {
        id: "presentacion",
        label: "Presentación",
        type: "single",
        options: [
          { label: "Clásica", value: "clasica" },
          { label: "Elegante", value: "elegante" },
          { label: "Romántica", value: "romantica" },
        ],
      },
      {
        id: "mensaje",
        label: "Mensaje personalizado",
        type: "text",
        placeholder: "Escribe tu mensaje...",
      },
    ],
  },

  regalos: {
    title: "Personaliza tu regalo",
    groups: [
      {
        id: "color",
        label: "Color principal",
        type: "single",
        options: [
          { label: "Morado", value: "morado" },
          { label: "Lila", value: "lila" },
          { label: "Dorado", value: "dorado" },
          { label: "Rosado", value: "rosado" },
        ],
      },
      {
        id: "mensaje",
        label: "Mensaje personalizado",
        type: "text",
        placeholder: "Escribe tu mensaje...",
      },
    ],
  },

  personalizados: {
    title: "Crea tu detalle personalizado",
    groups: [
      {
        id: "nombre",
        label: "Nombre",
        type: "text",
        placeholder: "Nombre que deseas personalizar",
      },
      {
        id: "mensaje",
        label: "Frase o mensaje",
        type: "text",
        placeholder: "Escribe la frase que deseas incluir",
      },
      {
        id: "color",
        label: "Color principal",
        type: "single",
        options: [
          { label: "Morado", value: "morado" },
          { label: "Lila", value: "lila" },
          { label: "Dorado", value: "dorado" },
          { label: "Blanco", value: "blanco" },
        ],
      },
    ],
  },
};
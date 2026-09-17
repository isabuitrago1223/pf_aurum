export type CityLocation = {
  name: string;
  barrios: string[];
};

export type DepartmentLocation = {
  name: string;
  cities: CityLocation[];
};

export const colombiaLocations: DepartmentLocation[] = [
  {
    name: "Antioquia",
    cities: [
      {
        name: "Medellín",
        barrios: [
          "El Poblado",
          "Laureles",
          "Estadio",
          "Belén",
          "La América",
          "Robledo",
          "Buenos Aires",
          "Manrique",
          "Aranjuez",
          "Castilla",
          "Doce de Octubre",
          "Guayabal",
          "El Centro",
          "Boston",
          "Prado",
          "Conquistadores",
          "Los Colores",
          "Calasanz",
          "Santa Mónica",
          "San Javier",
          "La Floresta",
          "La Milagrosa",
          "Villa Hermosa",
          "Campo Valdés",
          "Pedregal",
          "Las Palmas",
          "El Tesoro",
          "Provenza",
          "Manila",
          "Ciudad del Río",
          "Santa María de Los Ángeles",
          "Los Balsos",
          "La Aguacatala",
          "Cristo Rey",
          "San Diego",
          "La Candelaria",
          "Moravia",
          "Caribe",
          "Tricentenario",
        ],
      },
      {
        name: "Envigado",
        barrios: [
          "El Dorado",
          "La Magnolia",
          "Mesa",
          "San Marcos",
          "La Paz",
          "Las Antillas",
          "El Portal",
          "Jardines",
          "Zúñiga",
          "La Frontera",
        ],
      },
      {
        name: "Itagüí",
        barrios: [
          "Santa María",
          "San Pío",
          "Ditaires",
          "Simón Bolívar",
          "La Gloria",
          "Calatrava",
          "El Rosario",
          "San Gabriel",
        ],
      },
      {
        name: "Sabaneta",
        barrios: [
          "Prados de Sabaneta",
          "La Doctora",
          "San Joaquín",
          "Aliadas",
          "Las Lomitas",
          "Betania",
          "Calle Larga",
        ],
      },
      {
        name: "Bello",
        barrios: [
          "Niquía",
          "Cabañas",
          "Madera",
          "Navarra",
          "La Cumbre",
          "Manchester",
          "Santa Ana",
          "Zamora",
        ],
      },
      {
        name: "La Estrella",
        barrios: [
          "La Tablaza",
          "Suramérica",
          "Bellavista",
          "Ancón",
          "El Pedrero",
        ],
      },
    ],
  },
];
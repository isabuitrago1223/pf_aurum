import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const occasions = [
  {
    nombre: 'Día de la Madre',
    slug: 'dia-de-la-madre'
  },
  {
    nombre: 'Día del Padre',
    slug: 'dia-del-padre'
  },
  {
    nombre: 'Cumpleaños',
    slug: 'cumpleanos'
  },
  {
    nombre: 'Amor y Amistad',
    slug: 'amor-y-amistad'
  },
  {
    nombre: 'Navidad',
    slug: 'navidad'
  },
  {
    nombre: 'Empresas',
    slug: 'empresas'
  },
  {
    nombre: 'Otros',
    slug: 'otros'
  },
  {
    nombre: 'Aniversario',
    slug: 'aniversario'
  },
  {
    nombre: 'San Valentín',
    slug: 'san-valentin'
  },
  {
    nombre: 'Graduación',
    slug: 'graduacion'
  },
  {
    nombre: 'Día del Niño',
    slug: 'dia-del-nino'
  }
];

const categories = [
  {
    nombre: 'Anchetas',
    slug: 'anchetas',
    descripcion:
      'Anchetas artesanales y gourmet cargadas de delicias, vinos, chocolates y frutos seleccionados.',
    imagen:
      '/images/catalogo/anchetas/ancheta-feliz-cumpleanos.png',
    orden: 1,
    ocasiones: [
      'Día de la Madre',
      'Día del Padre',
      'Cumpleaños',
      'Amor y Amistad',
      'Navidad',
      'Empresas',
      'Otros'
    ]
  },
  {
    nombre: 'Desayunos',
    slug: 'desayunos',
    descripcion:
      'Desayunos sorpresa preparados al instante con ingredientes frescos, globos y empaques elegantes.',
    imagen:
      '/images/catalogo/desayunos/desayuno-sorpresa-arco-lila.png',
    orden: 2,
    ocasiones: [
      'Cumpleaños',
      'Aniversario',
      'Día de la Madre',
      'Día del Padre',
      'San Valentín',
      'Graduación'
    ]
  },
  {
    nombre: 'Ramos',
    slug: 'ramos',
    descripcion:
      'Ramos de flores naturales, rosas preservadas y arreglos florales diseñados con delicadeza.',
    imagen:
      '/images/catalogo/ramos/ramo-rosas-rosadas-personalizado.png',
    orden: 3,
    ocasiones: [
      'Amor y Amistad',
      'Aniversario',
      'San Valentín',
      'Día de la Madre',
      'Graduación',
      'Otros'
    ]
  },
  {
    nombre: 'Regalos',
    slug: 'regalos',
    descripcion:
      'Detalles únicos, peluches gigantes, cajas de luz, chocolates importados y portarretratos.',
    imagen:
      '/images/catalogo/regalos/canasta-peluche-arcoiris.png',
    orden: 4,
    ocasiones: [
      'Día del Niño',
      'Cumpleaños',
      'Graduación',
      'San Valentín',
      'Empresas',
      'Otros'
    ]
  },
  {
    nombre: 'Personalizados',
    slug: 'personalizados',
    descripcion:
      'Detalles hechos a la medida con nombres, fotos y mensajes grabados en dorado y lavanda.',
    imagen:
      '/images/catalogo/personalizados/set-regalo-lila-personalizado.png',
    orden: 5,
    ocasiones: [
      'Empresas',
      'Graduación',
      'Cumpleaños',
      'Aniversario',
      'Otros'
    ]
  }
];

const products = [
  {
    sku: 'AUR-DES-001',
    nombre: 'Desayuno Sorpresa Aurum Deluxe',
    slug: 'desayuno-sorpresa-aurum-deluxe',
    precio: 145000,
    categoria: 'Desayunos',
    ocasion: 'Cumpleaños',
    imagen:
      '/images/catalogo/desayunos/desayuno-sorpresa-arco-lila.png',
    stock: 15,
    tiempoEntrega: 'Entrega en 1 día hábil',
    descripcion:
      'Exquisito desayuno servido en bandeja de madera noble decorada con cintas doradas y moradas. Incluye plato principal personalizable, bebida a elección, frutas frescas, yogur con granola y globo metálico.',
    permitirPersonalizacion: true,
    destacado: true
  },
  {
    sku: 'AUR-ANC-001',
    nombre: 'Ancheta Gourmet Vino & Chocolates Finos',
    slug: 'ancheta-gourmet-vino-chocolates-finos',
    precio: 189000,
    categoria: 'Anchetas',
    ocasion: 'Aniversario',
    imagen:
      '/images/catalogo/anchetas/ancheta-feliz-cumpleanos.png',
    stock: 10,
    tiempoEntrega: 'Entrega entre 2 y 3 días hábiles',
    descripcion:
      'Elegante cesta artesanal compuesta por vino tinto reserva, trufas artesanas de chocolate belga, variedad de quesos madurados, galletas finas y frutos secos selectos.',
    permitirPersonalizacion: true,
    destacado: true
  },
  {
    sku: 'AUR-RAM-001',
    nombre: 'Ramo Imperial de 24 Rosas & Lirios Lavender',
    slug: 'ramo-imperial-24-rosas-lirios-lavender',
    precio: 135000,
    categoria: 'Ramos',
    ocasion: 'Amor y Amistad',
    imagen:
      '/images/catalogo/ramos/ramo-rosas-rosadas-personalizado.png',
    stock: 20,
    tiempoEntrega: 'Entrega en 1 día hábil',
    descripcion:
      'Soberbio ramo floral armado con rosas en tonos lila, lirios blancos aromáticos y follaje de eucalipto fresco, envuelto en fino papel de seda lila y listón dorado.',
    permitirPersonalizacion: true,
    destacado: true
  },
  {
    sku: 'AUR-REG-001',
    nombre: 'Caja Regalo Sorpresa "Momentos Dorado"',
    slug: 'caja-regalo-sorpresa-momentos-dorado',
    precio: 98000,
    categoria: 'Regalos',
    ocasion: 'San Valentín',
    imagen:
      '/images/catalogo/regalos/canasta-peluche-arcoiris.png',
    stock: 8,
    tiempoEntrega: 'Entrega entre 2 y 3 días hábiles',
    descripcion:
      'Caja rígida con acabado mate morado y detalles dorados. Al abrirla revela chocolates finos, pocillo personalizado y una hermosa velita aromática de lavanda y vainilla.',
    permitirPersonalizacion: true,
    destacado: true
  },
  {
    sku: 'AUR-PER-001',
    nombre: 'Mug y Cuadro Personalizado Aurum',
    slug: 'mug-cuadro-personalizado-aurum',
    precio: 65000,
    categoria: 'Personalizados',
    ocasion: 'Graduación',
    imagen:
      '/images/catalogo/personalizados/set-regalo-lila-personalizado.png',
    stock: 25,
    tiempoEntrega: 'Entrega entre 2 y 3 días hábiles',
    descripcion:
      'Set con portarretratos en madera noble y pocillo en cerámica blanca personalizado con el nombre, mensaje en tipografía dorada e ilustración especial.',
    permitirPersonalizacion: true,
    destacado: false
  },
  {
    sku: 'AUR-DES-002',
    nombre: 'Desayuno Dulce Despertar Lavanda',
    slug: 'desayuno-dulce-despertar-lavanda',
    precio: 120000,
    categoria: 'Desayunos',
    ocasion: 'Día de la Madre',
    imagen:
      '/images/catalogo/desayunos/desayuno-dia-de-la-madre.png',
    stock: 12,
    tiempoEntrega: 'Entrega en 1 día hábil',
    descripcion:
      'Ideal para celebrar a mamá con ternura: incluye waffles calientes con miel de acacia, ensalada de frutas macedonia, capuchino artesanal y arreglo floral miniatura.',
    permitirPersonalizacion: true,
    destacado: true
  },
  {
    sku: 'AUR-ANC-002',
    nombre: 'Ancheta Ejecutiva Cerveza & Snack Master',
    slug: 'ancheta-ejecutiva-cerveza-snack-master',
    precio: 110000,
    categoria: 'Anchetas',
    ocasion: 'Día del Padre',
    imagen:
      '/images/catalogo/anchetas/ancheta-cerveza-y-snacks.png',
    stock: 18,
    tiempoEntrega: 'Entrega entre 2 y 3 días hábiles',
    descripcion:
      'Cofre rústico con selección de cervezas artesanales, maní salado, papas nativas crujientes, salchichón premiun y copa cervecera personalizada.',
    permitirPersonalizacion: true,
    destacado: false
  },
  {
    sku: 'AUR-RAM-002',
    nombre: 'Ramo de Rosas Preservadas Eternas Aurum Gold',
    slug: 'ramo-rosas-preservadas-eternas-aurum-gold',
    precio: 160000,
    categoria: 'Ramos',
    ocasion: 'Aniversario',
    imagen:
      '/images/catalogo/ramos/ramo-rosas-naranjas.png',
    stock: 6,
    tiempoEntrega: 'Entrega entre 5 y 6 días hábiles',
    descripcion:
      'Rosas 100% naturales preservadas en cúpula de cristal con destellos dorados que conservan su frescura y belleza por más de 3 años.',
    permitirPersonalizacion: true,
    destacado: true
  },
  {
    sku: 'AUR-REG-002',
    nombre: 'Peluche Gigante con Globo de Helio Personalizado',
    slug: 'peluche-gigante-globo-helio-personalizado',
    precio: 175000,
    categoria: 'Regalos',
    ocasion: 'Día del Niño',
    imagen:
      '/images/catalogo/regalos/canasta-peluche-y-girasol.png',
    stock: 7,
    tiempoEntrega: 'Entrega entre 2 y 3 días hábiles',
    descripcion:
      'Oso de peluche afelpado de 80cm de altura acompañado por un globo burbuja transparente relleno de miniglobos lavanda y texto en dorado.',
    permitirPersonalizacion: true,
    destacado: false
  }
];

async function main() {
  console.log('Iniciando seed de Aurum...');

  for (const occasion of occasions) {
    await prisma.occasion.upsert({
      where: {
        slug: occasion.slug
      },
      update: {
        nombre: occasion.nombre,
        activo: true
      },
      create: {
        nombre: occasion.nombre,
        slug: occasion.slug,
        activo: true
      }
    });
  }

  console.log('Ocasiones cargadas.');

  for (const category of categories) {
    const savedCategory = await prisma.category.upsert({
      where: {
        slug: category.slug
      },
      update: {
        nombre: category.nombre,
        descripcion: category.descripcion,
        imagen: category.imagen,
        orden: category.orden,
        activo: true
      },
      create: {
        nombre: category.nombre,
        slug: category.slug,
        descripcion: category.descripcion,
        imagen: category.imagen,
        orden: category.orden,
        activo: true
      }
    });

    await prisma.categoryOccasion.deleteMany({
      where: {
        categoryId: savedCategory.id
      }
    });

    for (const occasionName of category.ocasiones) {
      const occasion = await prisma.occasion.findUnique({
        where: {
          nombre: occasionName
        }
      });

      if (!occasion) {
        throw new Error(
          `No se encontró la ocasión: ${occasionName}`
        );
      }

      await prisma.categoryOccasion.create({
        data: {
          categoryId: savedCategory.id,
          occasionId: occasion.id
        }
      });
    }
  }

  console.log('Categorías y relaciones cargadas.');

  for (const product of products) {
    const category = await prisma.category.findUnique({
      where: {
        nombre: product.categoria
      }
    });

    if (!category) {
      throw new Error(
        `No se encontró la categoría: ${product.categoria}`
      );
    }

    const occasion = await prisma.occasion.findUnique({
      where: {
        nombre: product.ocasion
      }
    });

    if (!occasion) {
      throw new Error(
        `No se encontró la ocasión: ${product.ocasion}`
      );
    }

    await prisma.product.upsert({
      where: {
        sku: product.sku
      },
      update: {
        nombre: product.nombre,
        slug: product.slug,
        descripcion: product.descripcion,
        precio: product.precio,
        stock: product.stock,
        imagen: product.imagen,
        imagenAlt: product.nombre,
        tiempoEntrega: product.tiempoEntrega,
        permitirPersonalizacion:
          product.permitirPersonalizacion,
        destacado: product.destacado,
        activo: true,
        categoryId: category.id,
        occasionId: occasion.id
      },
      create: {
        sku: product.sku,
        nombre: product.nombre,
        slug: product.slug,
        descripcion: product.descripcion,
        precio: product.precio,
        stock: product.stock,
        stockMinimo: 0,
        imagen: product.imagen,
        imagenAlt: product.nombre,
        tiempoEntrega: product.tiempoEntrega,
        permitirPersonalizacion:
          product.permitirPersonalizacion,
        destacado: product.destacado,
        activo: true,
        categoryId: category.id,
        occasionId: occasion.id
      }
    });
  }

  console.log('Productos cargados.');
  console.log('Seed de Aurum finalizado correctamente.');
}

main()
  .catch((error) => {
    console.error('Error ejecutando el seed:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
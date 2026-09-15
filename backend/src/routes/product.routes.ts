import { Router } from 'express';

import {
  addProductImage,
  createProduct,
  getAdminProducts,
  getProductBySlug,
  getProducts,
  updateProduct,
  updateProductStatus
} from '../controllers/product.controller.js';

import {
  requireAuth,
  requireRole
} from '../middlewares/auth.middleware.js';

export const productRouter = Router();

/**
 * @openapi
 * /api/products:
 *   get:
 *     tags:
 *       - Productos
 *     summary: Obtener productos activos
 *     description: Retorna los productos activos disponibles en el catálogo público.
 *     responses:
 *       200:
 *         description: Lista de productos obtenida correctamente.
 */
productRouter.get('/', getProducts);

/**
 * @openapi
 * /api/products:
 *   post:
 *     tags:
 *       - Productos
 *     summary: Crear un producto
 *     description: Crea un nuevo producto. Requiere autenticación y rol ADMIN.
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - sku
 *               - nombre
 *               - slug
 *               - descripcion
 *               - precio
 *               - imagen
 *               - tiempoEntrega
 *               - categoryId
 *             properties:
 *               sku:
 *                 type: string
 *                 example: AUR-001
 *               nombre:
 *                 type: string
 *                 example: Arreglo floral romántico
 *               slug:
 *                 type: string
 *                 example: arreglo-floral-romantico
 *               descripcion:
 *                 type: string
 *                 example: Arreglo floral elaborado con rosas y follaje decorativo.
 *               precio:
 *                 type: number
 *                 example: 85000
 *               precioAnterior:
 *                 type: number
 *                 example: 95000
 *               costo:
 *                 type: number
 *                 example: 45000
 *               stock:
 *                 type: integer
 *                 example: 10
 *               stockMinimo:
 *                 type: integer
 *                 example: 2
 *               imagen:
 *                 type: string
 *                 format: uri
 *                 example: https://example.com/producto.jpg
 *               imagenAlt:
 *                 type: string
 *                 example: Arreglo floral romántico
 *               tiempoEntrega:
 *                 type: string
 *                 example: 2 a 4 horas
 *               pesoGramos:
 *                 type: integer
 *                 example: 1200
 *               permitirPersonalizacion:
 *                 type: boolean
 *                 example: true
 *               opcionesPersonalizacion:
 *                 type: object
 *                 additionalProperties: true
 *               destacado:
 *                 type: boolean
 *                 example: false
 *               activo:
 *                 type: boolean
 *                 example: true
 *               categoryId:
 *                 type: string
 *                 example: clxxxxxxxxxxxxxxxx
 *               occasionId:
 *                 type: string
 *                 example: clxxxxxxxxxxxxxxxx
 *     responses:
 *       201:
 *         description: Producto creado correctamente.
 *       400:
 *         description: Datos del producto inválidos.
 *       401:
 *         description: Autenticación requerida o sesión inválida.
 *       403:
 *         description: El usuario no tiene permisos de administrador.
 *       404:
 *         description: Categoría u ocasión no encontrada.
 *       409:
 *         description: Ya existe un producto con el mismo SKU o slug.
 */
productRouter.post(
  '/',
  requireAuth,
  requireRole('ADMIN'),
  createProduct
);

/**
 * @openapi
 * /api/products/admin:
 *   get:
 *     tags:
 *       - Productos
 *     summary: Obtener todos los productos
 *     description: Retorna productos activos e inactivos. Requiere rol ADMIN.
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista completa de productos obtenida correctamente.
 *       401:
 *         description: Autenticación requerida o sesión inválida.
 *       403:
 *         description: El usuario no tiene permisos de administrador.
 */
productRouter.get(
  '/admin',
  requireAuth,
  requireRole('ADMIN'),
  getAdminProducts
);

/**
 * @openapi
 * /api/products/{id}:
 *   put:
 *     tags:
 *       - Productos
 *     summary: Actualizar un producto
 *     description: Actualiza los campos enviados de un producto existente. Requiere rol ADMIN.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID del producto.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               sku:
 *                 type: string
 *               nombre:
 *                 type: string
 *               slug:
 *                 type: string
 *               descripcion:
 *                 type: string
 *               precio:
 *                 type: number
 *               precioAnterior:
 *                 type: number
 *               costo:
 *                 type: number
 *               stock:
 *                 type: integer
 *               stockMinimo:
 *                 type: integer
 *               imagen:
 *                 type: string
 *                 format: uri
 *               imagenAlt:
 *                 type: string
 *               tiempoEntrega:
 *                 type: string
 *               pesoGramos:
 *                 type: integer
 *               permitirPersonalizacion:
 *                 type: boolean
 *               opcionesPersonalizacion:
 *                 type: object
 *                 additionalProperties: true
 *               destacado:
 *                 type: boolean
 *               activo:
 *                 type: boolean
 *               categoryId:
 *                 type: string
 *               occasionId:
 *                 type: string
 *     responses:
 *       200:
 *         description: Producto actualizado correctamente.
 *       400:
 *         description: Datos del producto inválidos.
 *       401:
 *         description: Autenticación requerida o sesión inválida.
 *       403:
 *         description: El usuario no tiene permisos de administrador.
 *       404:
 *         description: Producto, categoría u ocasión no encontrada.
 *       409:
 *         description: Ya existe otro producto con el mismo SKU o slug.
 */
productRouter.put(
  '/:id',
  requireAuth,
  requireRole('ADMIN'),
  updateProduct
);

/**
 * @openapi
 * /api/products/{id}/status:
 *   patch:
 *     tags:
 *       - Productos
 *     summary: Activar o desactivar un producto
 *     description: Cambia el estado activo de un producto. Requiere rol ADMIN.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID del producto.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - activo
 *             properties:
 *               activo:
 *                 type: boolean
 *                 example: false
 *     responses:
 *       200:
 *         description: Estado del producto actualizado correctamente.
 *       400:
 *         description: Estado del producto inválido.
 *       401:
 *         description: Autenticación requerida o sesión inválida.
 *       403:
 *         description: El usuario no tiene permisos de administrador.
 *       404:
 *         description: Producto no encontrado.
 */
productRouter.patch(
  '/:id/status',
  requireAuth,
  requireRole('ADMIN'),
  updateProductStatus
);

/**
 * @openapi
 * /api/products/{id}/images:
 *   post:
 *     tags:
 *       - Productos
 *     summary: Agregar una imagen a un producto
 *     description: Agrega una imagen a la galería del producto. Requiere rol ADMIN.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID del producto.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - url
 *             properties:
 *               url:
 *                 type: string
 *                 format: uri
 *                 example: https://example.com/producto-galeria.jpg
 *               alt:
 *                 type: string
 *                 example: Vista lateral del producto
 *               orden:
 *                 type: integer
 *                 minimum: 0
 *                 example: 1
 *     responses:
 *       201:
 *         description: Imagen agregada al producto correctamente.
 *       400:
 *         description: Datos de la imagen inválidos.
 *       401:
 *         description: Autenticación requerida o sesión inválida.
 *       403:
 *         description: El usuario no tiene permisos de administrador.
 *       404:
 *         description: Producto no encontrado.
 */
productRouter.post(
  '/:id/images',
  requireAuth,
  requireRole('ADMIN'),
  addProductImage
);

/**
 * @openapi
 * /api/products/{slug}:
 *   get:
 *     tags:
 *       - Productos
 *     summary: Obtener detalle de producto por slug
 *     description: Retorna el detalle público de un producto activo, incluyendo su galería de imágenes.
 *     parameters:
 *       - in: path
 *         name: slug
 *         required: true
 *         schema:
 *           type: string
 *         example: arreglo-floral-romantico
 *     responses:
 *       200:
 *         description: Producto obtenido correctamente.
 *       400:
 *         description: El slug del producto es requerido.
 *       404:
 *         description: Producto no encontrado.
 */
productRouter.get('/:slug', getProductBySlug);
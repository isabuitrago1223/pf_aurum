import { Router } from 'express';

import { getProducts } from '../controllers/product.controller.js';

export const productRouter = Router();

productRouter.get('/', getProducts);
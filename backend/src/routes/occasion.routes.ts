import { Router } from 'express';

import { getOccasions } from '../controllers/occasion.controller.js';

export const occasionRouter = Router();

occasionRouter.get('/', getOccasions);
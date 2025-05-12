import { Router, Request, Response, NextFunction } from 'express';
import {
  createCampaign,
  getCampaigns,
  getCampaignDetails
} from '../controllers/campaign.controller';
import { requireAuth } from '../middlewares/auth.middleware';

const router = Router();

// Explicitly type the route handlers to void
router.post('/', requireAuth, (req: Request, res: Response, next: NextFunction): void => {
  createCampaign(req, res)
    .then(() => {})
    .catch(error => {
      next(error);
    });
});

router.get('/', requireAuth, (req: Request, res: Response, next: NextFunction): void => {
  getCampaigns(req, res)
    .then(() => {})
    .catch(error => {
      next(error);
    });
});

router.get('/:id', requireAuth, (req: Request, res: Response, next: NextFunction): void => {
  getCampaignDetails(req, res)
    .then(() => {})
    .catch(error => {
      next(error);
    });
});

export default router;
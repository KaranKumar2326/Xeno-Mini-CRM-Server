import { Request, Response, NextFunction } from 'express';
import { body, ValidationChain } from 'express-validator';
import { SegmentService } from '../services/segment.service';

export const evaluateSegment = async (req: Request, res: Response) => {
  try {
    // Normalize input (handle both wrapped and direct rules)
    console.log('🔥 Raw req.body:', JSON.stringify(req.body, null, 2));
    const result = await SegmentService.evaluateRules(req.body);

    res.json(result);
  } catch (error) {
    res.status(400).json({ 
      error: 'Evaluation failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

export const validateRules: (ValidationChain | ((req: Request, res: Response, next: NextFunction) => void))[] = [
  // Accept either { rules: { condition, rules[] }} or direct { condition, rules[] }
  body().custom(body => {
    if (!body.rules && !body.condition) {
      throw new Error('Must provide either rules object or direct rules');
    }
    return true;
  }),
  
  // Validate condition when present
  body('condition').optional().isIn(['AND', 'OR']).withMessage('Condition must be AND or OR'),
  body('rules.condition').optional().isIn(['AND', 'OR']).withMessage('Condition must be AND or OR'),
  
  // Validate rules array
  body('rules.rules').optional().isArray({ min: 1 }),
  body().customSanitizer(body => {
  if ('rules' in body && 'condition' in body.rules) {
    return body.rules; // Nested format
  } else if ('condition' in body && 'rules' in body) {
    return body; // Direct format
  }
  return body;
})

];
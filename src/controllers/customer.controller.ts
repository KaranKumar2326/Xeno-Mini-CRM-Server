import { Request, Response, NextFunction } from 'express';

// Extend the Request interface to include the 'file' property
declare global {
  namespace Express {
    interface Request {
      file?: Express.Multer.File;
    }
  }
}
import Customer from '../models/Customer';

export const createCustomer = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const customer = await Customer.create(req.body);
    res.status(201).json(customer);
  } catch (error: any) {
    if (error.code === 11000) {
      res.status(400).json({ error: "Email already exists" });
      return;
    }
    next(error);
  }
};

export const getCustomers = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const skip = (page - 1) * limit;

    const [customers, count] = await Promise.all([
      Customer.find().skip(skip).limit(limit),
      Customer.countDocuments()
    ]);

    res.json({
      data: customers,
      total: count,
      page,
      totalPages: Math.ceil(count / limit)
    });
  } catch (error) {
    next(error);
  }
};

export const getCustomerById = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const customer = await Customer.findById(req.params.id);
    if (!customer) {
      res.status(404).json({ error: "Customer not found" });
      return;
    }
    res.json(customer);
  } catch (error) {
    next(error);
  }
};

export const updateCustomer = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const customer = await Customer.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    if (!customer) {
      res.status(404).json({ error: "Customer not found" });
      return;
    }
    res.json(customer);
  } catch (error) {
    next(error);
  }
};

export const deleteCustomer = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const customer = await Customer.findByIdAndDelete(req.params.id);
    if (!customer) {
      res.status(404).json({ error: "Customer not found" });
      return;
    }
    res.json({ message: "Customer deleted successfully" });
  } catch (error) {
    next(error);
  }
};


// import { Request, Response } from 'express';
import multer from 'multer';
import * as XLSX from 'xlsx';
// Removed duplicate import of Customer
import { validationResult } from 'express-validator';

// Set up multer to handle file uploads
const storage = multer.memoryStorage();
const upload = multer({ storage: storage }).single('file'); // 'file' will be the form field name



export const importExcelCustomers = async (req: Request, res: Response): Promise<void> => {
  try {
    // Early return if no file uploaded
    if (!req.file) {
      res.status(400).json({ message: 'No file uploaded' });
      return;
    }

    // Parse the Excel file
    const workbook = XLSX.read(req.file.buffer, { type: 'buffer' });
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    const data = XLSX.utils.sheet_to_json(sheet);

    // Process data in a single pipeline
    const { validCustomers, invalidCount } = (data as any[]).reduce((acc: { validCustomers: Array<{ name: string; email: string; totalSpend: number; visitCount: number }>; invalidCount: number }, item: any) => {
      const customer = {
        name: item.Name?.toString().trim() || '',
        email: item.Email?.toString().trim() || '',
        totalSpend: Number(item.TotalSpend) || 0,
        visitCount: Number(item.Visits) || 0,
      };

      if (customer.name && customer.email) {
        acc.validCustomers.push(customer);
      } else {
        acc.invalidCount++;
      }
      return acc;
    }, { validCustomers: [], invalidCount: 0 });

    // Bulk insert valid customers
    const result = await Customer.insertMany(validCustomers, { ordered: false })
      .then(() => ({ successCount: validCustomers.length, errorCount: 0 }))
      .catch((error: any) => {
        if (error.writeErrors) {
          return {
            successCount: error.insertedCount,
            errorCount: error.writeErrors.length,
          };
        }
        throw error;
      });

    res.status(200).json({
      message: `Import completed: ${result.successCount} customers created, ${result.errorCount + invalidCount} failed.`,
      details: {
        successfulImports: result.successCount,
        databaseErrors: result.errorCount,
        invalidRows: invalidCount,
      },
    });
  } catch (error) {
    console.error('Error during Excel import:', error);
    res.status(500).json({ 
      message: 'Error processing the Excel file.',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

// Example route to handle the import
import { Router } from 'express';
const router = Router();

router.post('/import/customers', upload, importExcelCustomers);

export default router;

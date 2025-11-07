import { Router } from 'express';
import { prisma } from '../libs/prisma';

const router = Router();

// GET /api/companies
router.get('/', async (req, res) => {
  try {
    const companies = await prisma.company.findMany({
      include: {
        _count: {
          select: {
            users: true,
            orders: true,
          },
        },
      },
    });
    res.json(companies);
  } catch (error) {
    console.error('Error fetching companies:', error);
    res.status(500).json({ error: 'Failed to fetch companies' });
  }
});

// GET /api/companies/:id - Get company details with users and orders
router.get('/:id', async (req, res) => {
  try {
    const companyId = parseInt(req.params.id);

    if (isNaN(companyId)) {
      return res.status(400).json({ error: 'Invalid company ID' });
    }

    const company = await prisma.company.findUnique({
      where: { id: companyId },
      include: {
        users: {
          select: {
            id: true,
            email: true,
            name: true,
            role: true,
            createdAt: true,
          },
          orderBy: {
            createdAt: 'desc',
          },
        },
        orders: {
          include: {
            vehicle: true,
            createdBy: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
          orderBy: {
            createdAt: 'desc',
          },
        },
        _count: {
          select: {
            users: true,
            orders: true,
          },
        },
      },
    });

    if (!company) {
      return res.status(404).json({ error: 'Company not found' });
    }

    res.json(company);
  } catch (error) {
    console.error('Error fetching company details:', error);
    res.status(500).json({ error: 'Failed to fetch company details' });
  }
});

// POST /api/companies
router.post('/', async (req, res) => {
  try {
    const { name } = req.body;

    if (!name) {
      return res.status(400).json({ error: 'Company name is required' });
    }

    // Check if company already exists
    const existing = await prisma.company.findUnique({
      where: { name },
    });

    if (existing) {
      return res.status(400).json({ error: 'Company with this name already exists' });
    }

    const company = await prisma.company.create({
      data: { name },
    });

    res.status(201).json(company);
  } catch (error) {
    console.error('Error creating company:', error);
    res.status(500).json({ error: 'Failed to create company' });
  }
});

// PUT /api/companies/:id
router.put('/:id', async (req, res) => {
  try {
    const companyId = parseInt(req.params.id);
    const { name } = req.body;

    if (isNaN(companyId)) {
      return res.status(400).json({ error: 'Invalid company ID' });
    }

    if (!name) {
      return res.status(400).json({ error: 'Company name is required' });
    }

    // Check if company exists
    const existingCompany = await prisma.company.findUnique({
      where: { id: companyId },
    });

    if (!existingCompany) {
      return res.status(404).json({ error: 'Company not found' });
    }

    // Check if name is already taken by another company
    const nameConflict = await prisma.company.findFirst({
      where: {
        name,
        id: { not: companyId },
      },
    });

    if (nameConflict) {
      return res.status(400).json({ error: 'Company with this name already exists' });
    }

    const company = await prisma.company.update({
      where: { id: companyId },
      data: { name },
    });

    res.json(company);
  } catch (error) {
    console.error('Error updating company:', error);
    res.status(500).json({ error: 'Failed to update company' });
  }
});

// DELETE /api/companies/:id
router.delete('/:id', async (req, res) => {
  try {
    const companyId = parseInt(req.params.id);

    if (isNaN(companyId)) {
      return res.status(400).json({ error: 'Invalid company ID' });
    }

    // Check if company exists
    const existingCompany = await prisma.company.findUnique({
      where: { id: companyId },
      include: {
        _count: {
          select: {
            users: true,
            orders: true,
          },
        },
      },
    });

    if (!existingCompany) {
      return res.status(404).json({ error: 'Company not found' });
    }

    // Check if company has users or orders
    if (existingCompany._count.users > 0) {
      return res.status(400).json({ 
        error: `Cannot delete company with ${existingCompany._count.users} user(s). Please remove all users first.` 
      });
    }

    if (existingCompany._count.orders > 0) {
      return res.status(400).json({ 
        error: `Cannot delete company with ${existingCompany._count.orders} order(s). Please remove all orders first.` 
      });
    }

    await prisma.company.delete({
      where: { id: companyId },
    });

    res.json({ message: 'Company deleted successfully' });
  } catch (error) {
    console.error('Error deleting company:', error);
    res.status(500).json({ error: 'Failed to delete company' });
  }
});

export { router as companyRouter };

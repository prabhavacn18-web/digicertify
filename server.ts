import express from 'express';
import cors from 'cors';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const app = express();
const port = 3001;

app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Students API
app.get('/api/students', async (req, res) => {
    try {
        const students = await prisma.student.findMany({
            orderBy: { createdAt: 'desc' }
        });
        res.json(students);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch students' });
    }
});

app.post('/api/students', async (req, res) => {
    try {
        const { students } = req.body;

        // Clear existing students if requested or just push
        // We'll use Prisma's createMany
        if (students && Array.isArray(students)) {
            // For simplicity, we can delete all and insert new on each upload
            await prisma.student.deleteMany();

            const created = await prisma.student.createMany({
                data: students.map((s: any) => ({
                    usn: s.usn,
                    name: s.name,
                    course: s.course,
                    score: parseFloat(s.score)
                })),
                skipDuplicates: true
            });
            res.json({ message: 'Students uploaded successfully', count: created.count });
        } else {
            res.status(400).json({ error: 'Invalid data format' });
        }
    } catch (error) {
        console.error('Error saving students:', error);
        res.status(500).json({ error: 'Failed to save students' });
    }
});

// Templates API
app.get('/api/templates', async (req, res) => {
    try {
        const templates = await prisma.certificateTemplate.findMany({
            orderBy: { createdAt: 'desc' }
        });
        res.json(templates);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch templates' });
    }
});

app.post('/api/templates', async (req, res) => {
    try {
        const template = req.body;
        const newTemplate = await prisma.certificateTemplate.create({
            data: {
                id: template.id,
                name: template.name,
                dataUrl: template.dataUrl,
                isActive: template.isActive || false
            }
        });
        res.json(newTemplate);
    } catch (error) {
        console.error('Error saving template:', error);
        res.status(500).json({ error: 'Failed to save template' });
    }
});

app.put('/api/templates/:id/active', async (req, res) => {
    try {
        const { id } = req.params;

        // Set all templates to inactive
        await prisma.certificateTemplate.updateMany({
            data: { isActive: false }
        });

        // Set requested template to active
        await prisma.certificateTemplate.update({
            where: { id },
            data: { isActive: true }
        });

        res.json({ message: 'Template activated successfully' });
    } catch (error) {
        res.status(500).json({ error: 'Failed to activate template' });
    }
});

app.delete('/api/templates/:id', async (req, res) => {
    try {
        const { id } = req.params;
        await prisma.certificateTemplate.delete({
            where: { id }
        });
        res.json({ message: 'Template deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: 'Failed to delete template' });
    }
});

app.listen(port, () => {
    console.log(`Backend API running on http://localhost:${port}`);
});

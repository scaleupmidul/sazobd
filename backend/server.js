import express from 'express';
import cors from 'cors';
import 'dotenv/config';
import bcrypt from 'bcryptjs';

import connectDB from './db.js';

import Product from './models/Product.js';
import Settings from './models/Settings.js';

import authRoutes from './routes/auth.js';
import productRoutes from './routes/products.js';
import orderRoutes from './routes/orders.js';
import messageRoutes from './routes/messages.js';
import settingsRoutes from './routes/settings.js';

import { MOCK_PRODUCTS_DATA, DEFAULT_SETTINGS_DATA } from './data/seedData.js';

const startServer = async () => {
    try {
        // Connect to Database first
        await connectDB();

        const app = express();

        // Middlewares
        // Use a more explicit CORS configuration to handle cross-origin requests
        app.use(cors({
          origin: '*', // Allow all origins
          methods: ['GET', 'POST', 'PUT', 'DELETE'], // Allow common methods
          allowedHeaders: ['Content-Type', 'Authorization'], // Allow necessary headers
        }));
        app.use(express.json({ limit: '50mb' })); // Increase limit for base64 images

        // --- Seeding Logic ---
        const seedDatabase = async () => {
            try {
                // Seed Settings
                const settingsCount = await Settings.countDocuments();
                if (settingsCount === 0) {
                    console.log('No settings found, seeding...');
                    const salt = await bcrypt.genSalt(10);
                    const hashedPassword = await bcrypt.hash(DEFAULT_SETTINGS_DATA.adminPassword, salt);
                    await Settings.create({ ...DEFAULT_SETTINGS_DATA, adminPassword: hashedPassword });
                    console.log('Default settings seeded.');
                }

                // Seed Products
                const productCount = await Product.countDocuments();
                if (productCount === 0) {
                    console.log('No products found, seeding...');
                    // Remove frontend-specific ID before inserting
                    const productsToSeed = MOCK_PRODUCTS_DATA.map(({ id, ...rest }) => rest);
                    await Product.insertMany(productsToSeed);
                    console.log('Mock products seeded.');
                }
            } catch (error) {
                console.error('Error during seeding:', error);
            }
        };
        await seedDatabase();
        // --- End Seeding Logic ---

        // API Routes
        app.use('/api/auth', authRoutes);
        app.use('/api/products', productRoutes);
        app.use('/api/orders', orderRoutes);
        app.use('/api/messages', messageRoutes);
        app.use('/api/settings', settingsRoutes);

        app.get('/', (req, res) => {
            res.send('SAZO API is running...');
        });

        const PORT = process.env.PORT || 5000;
        app.listen(PORT, () => console.log(`Server running on port ${PORT}, and it is now live!`));

    } catch (error) {
        console.error("Server failed to start due to database connection error.");
        // The error from connectDB will be caught here and the process will exit
        // which is handled by the db.js file.
    }
}

startServer();

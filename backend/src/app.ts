import express from 'express';
import cors from 'cors';
import { authMiddleware } from './middleware/auth';
import { companyRouter } from './routes/company';
import { userRouter } from './routes/user';
import { deviceRouter } from './routes/device';
import { vehicleRouter } from './routes/vehicle';
import { orderRouter } from './routes/order';

const app = express();

app.use(cors());
app.use(express.json());
app.use(authMiddleware);

// CRUD endpoints
app.use('/api/companies', companyRouter);
app.use('/api/users', userRouter);
app.use('/api/devices', deviceRouter);
app.use('/api/vehicles', vehicleRouter);
app.use('/api/orders', orderRouter);

app.listen(3000, () => {
    console.log("Server is running on port 3000");
});

export default app;
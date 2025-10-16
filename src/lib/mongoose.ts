import mongoose from 'mongoose';

// Custom modules
import config from '@/config';
import { logger } from '@/lib/winston';

// Types
import { ConnectOptions } from 'mongoose';

// MongoDB connection options
const clientOptions: ConnectOptions = {
	dbName: 'blog-api',
	appName: 'Blog API',
	serverApi: {
		version: '1',
		strict: true,
		deprecationErrors: true, // Report deprecated features
	},
};

// Function to connect to MongoDB database
export const connectToDatabase = async (): Promise<void> => {
	// Ensure MONGO_URI is defined
	if (!config.MONGO_URI) {
		throw new Error('MONGO_URI is not defined in the configuration.');
	}

	// Connect to MongoDB using Mongoose
	try {
		await mongoose.connect(config.MONGO_URI, clientOptions);

		logger.info('Connected to MongoDB database successfully.', {
			uri: config.MONGO_URI,
			options: clientOptions,
		});
	} catch (error) {
		if (error instanceof Error) {
			throw error;
		}

		logger.error('Error connecting to MongoDB database:', error);
	}
};

// Function to disconnect from MongoDB database
export const disconnectFromDatabase = async (): Promise<void> => {
	try {
		await mongoose.disconnect();
		logger.info('Disconnected from MongoDB database successfully.', {
			uri: config.MONGO_URI,
			options: clientOptions,
		});
	} catch (error) {
		if (error instanceof Error) {
			throw new Error(error.message);
		}

		logger.error('Error disconnecting from MongoDB database:', error);
	}
};

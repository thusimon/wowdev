import mongoose from 'mongoose';
const CONNECTION_URI = process.env.MONGODB_URI;

export const connectToDb = (verbose) => {
  return mongoose.connect(CONNECTION_URI).then(async () => {
    if (verbose) {
      console.log(`Connected to mongoDB to ${CONNECTION_URI}`);
    }
    return Promise.resolve();
  });
};

export const closeConnection = () => {
  mongoose.connection.close();
};

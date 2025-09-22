// config/db.js
const mongoose = require('mongoose');
const duplicateKeyPlugin = require('../plugins/duplicateKeyPlugin'); 


mongoose.set('strictQuery', true);

let indexesSynced = false;

const connectDB = async () => {
  try {
    
    mongoose.plugin(duplicateKeyPlugin);

    await mongoose.connect(process.env.MONGO_URI);

    console.log('MongoDB connected successfully');

 
    mongoose.connection.on('error', (err) => {
      console.error('Mongo connection error:', err);
    });

  
    if (!indexesSynced) {
      try {
  
        const models = mongoose.modelNames();
        for (const name of models) {
          await mongoose.model(name).syncIndexes();
        }
        indexesSynced = true;
        console.log('Mongoose indexes synced');
      } catch (e) {
        console.warn('Index sync skipped/failed:', e.message);
      }
    }

  } catch (error) {
    console.error('MongoDB connection error:', error);
    process.exit(1);
  }
};

module.exports = connectDB;

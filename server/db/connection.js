const mongoose = require('mongoose');
mongoose.set('useFindAndModify', false);
mongoose.set('useNewUrlParser', true);
mongoose.set('useUnifiedTopology', true);
const CONNECTION_URI = process.env.MONGODB_URI;

module.exports = {
  connectToDb: (verbose) => {
    return mongoose.connect(CONNECTION_URI, {
      useNewUrlParser: true,
      useCreateIndex: true
    }).then(async () => {
      if (verbose) {
        console.log(`Connected to mongoDB to ${CONNECTION_URI}`);
      }
      return Promise.resolve();
    });
  },
  closeConnection: () => {
    mongoose.connection.close();
  }
}

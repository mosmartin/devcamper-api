const mongoose = require("mongoose");
const debug = require("debug")("worker:database");

const dbConnect = async () => {
  const conn = await mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: false,
    useUnifiedTopology: true
  });

  debug(`Connected to DB on ${conn.connection.host} host`);
};

module.exports = dbConnect;

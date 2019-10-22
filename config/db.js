const mongoose = require("mongoose");

const dbConnect = async () => {
  const conn = await mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: false,
    useUnifiedTopology: true
  });

  console.log(`Connected to DB on => ${conn.connection.host}`);
};

module.exports = dbConnect;

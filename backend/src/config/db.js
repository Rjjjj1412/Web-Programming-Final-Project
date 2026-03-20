import mongoose from "mongoose";

const connectDB = async () => {
  try {
    const uri = `${process.env.MONGO_URI}`;
    const conn = await mongoose.connect(uri);

    console.log(
      `MongoDB connected: ${conn.connection.host}/${conn.connection.name}`
    );
  } catch (error) {
    console.error("MongoDB connection error:", error);
    process.exit(1);
  }
};

export default connectDB;

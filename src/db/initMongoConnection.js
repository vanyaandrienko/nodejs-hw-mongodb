import { getEnvVar } from "../utils/getEnvVar.js";
import mongoose from "mongoose";

export const initMongoConnection = async () => {
  try {
    const user = getEnvVar("MONGODB_USER");
    const password = getEnvVar("MONGODB_PASSWORD");
    const url = getEnvVar("MONGODB_URL");
    const name = getEnvVar("MONGODB_DB");

    await mongoose.connect(`mongodb+srv://${user}:${password}@${url}/${name}?retryWrites=true&w=majority&appName=Cluster0`)
    console.log("Mongo connection successfully established!");
  } catch (error) {
    console.log(error.message);
    throw error;
  }
};
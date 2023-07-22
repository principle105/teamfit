import { MONGO_URL } from "$env/static/private";
import { MongoClient } from "mongodb";

let client;
let clientPromise: Promise<MongoClient>;

client = new MongoClient(MONGO_URL);
clientPromise = client.connect();

export default clientPromise;

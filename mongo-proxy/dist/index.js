"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.app = void 0;
const dotenv_1 = __importDefault(require("dotenv"));
const express_1 = __importDefault(require("express"));
const blogRouter_1 = __importDefault(require("./routes/blogRouter"));
exports.app = express_1.default.Router();
dotenv_1.default.config();
// const MONGO_URI = process.env.MONGO_URI;
// if (!MONGO_URI) {
//   throw new Error('MONGO_URI is not defined in .env file');
// }
exports.app.use(express_1.default.json());
exports.app.use("/api/v1/blogs", blogRouter_1.default);
// const connectDB = async () => {
//   try {
//     await mongoose.connect(MONGODB_URI);
//     console.log('MongoDB connected successfully');
//   } catch (error) {
//     console.error('Connection error:', error instanceof Error ? error.message : String(error));
//     process.exit(1);
//   }
// };
// export default connectDB;

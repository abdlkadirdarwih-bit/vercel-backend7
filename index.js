
    //  "start": "nodemon index.js"
import dotenv from "dotenv";
import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import bcrypt from "bcrypt";
import bodyParser from "body-parser";

dotenv.config(); // load .env
const PORT = process.env.PORT || 3001;

const app = express();
// app.use(cors());
app.use(cors({
  origin: "https://vercel-frontend7.vercel.app/", // your frontend domain
  methods: ["GET", "POST", "PUT", "DELETE"],
  credentials: true
}));
app.use(bodyParser.json());
//  const URL = process.env.MONGODB_URL;

// 🧭 Connect to MongoDB
mongoose.connect("mongodb://127.0.0.1:27017/myapplog")
//   , {
//   useNewUrlParser: true,
//   useUnifiedTopology: true,
// }
// );
// mongoose.connect(URL)
.then(() => console.log("✅ Connected to MongoDB successfully"))
.catch(err => console.error("❌ MongoDB connection error:", err));


// 📄 User Model
const userSchema = new mongoose.Schema({
  email: { type: String, unique: true },
  passwordHash: { type: String, required: true },
});

userSchema.methods.setPassword = async function (plain) {
  this.passwordHash = await bcrypt.hash(plain, 10);
};

userSchema.methods.validatePassword = async function (plain) {
  return bcrypt.compare(plain, this.passwordHash);
};

const User = mongoose.model("User", userSchema);

// 📝 Login Route
app.post("/api/auth/login", async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email: email.toLowerCase() });
  if (!user) return res.status(400).json({ message: "Invalid email or password" });

  const valid = await user.validatePassword(password);
  if (!valid) return res.status(400).json({ message: "Invalid email or password" });

  res.json({ message: "Login successful", email: user.email });
});

// 🔐 Change Password Route
app.post("/api/auth/change-password", async (req, res) => {
  const { email,oldPassword, newPassword } = req.body;
  const user = await User.findOne({ email: email.toLowerCase() });
  if (!user) return res.status(400).json({ message: "User not found" });
 // 🛡️ Verify old password
  const valid = await user.validatePassword(oldPassword);
  if (!valid) return res.status(400).json({ message: "Old password is incorrect" });

  await user.setPassword(newPassword);
  await user.save();

  res.json({ message: "Password updated successfully" });
});

// 🧪 Register Route
app.post("/api/auth/register", async (req, res) => {
  const { email, password } = req.body;
  const exist = await User.findOne({ email: email.toLowerCase() });
  if (exist) return res.status(400).json({ message: "Email already exists" });

  const user = new User({ email: email.toLowerCase() });
  await user.setPassword(password);
  await user.save();

  res.json({ message: "User created" });
});

app.get("/", (req, res) => {
  res.send("Backend is working ✅");
});

// 🚀 Start Server
app.listen(PORT, () =>
  //  console.log("✅ Server running on http://localhost:5000")
console.log(`✅ Server running on http://localhost:${PORT}`)

);

// project:loginms
//logincluster
//username:login password login123
//
//login.ms
//login7cluster
//login7       login7123


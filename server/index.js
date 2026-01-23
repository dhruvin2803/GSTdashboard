require("dotenv").config();

const express = require("express");
const cors = require("cors");

const authRoutes = require("./routes/auth.routes");
const adminRoutes = require("./routes/admin.routes");
const employeeRoutes = require("./routes/employee.routes");
const gstRoutes = require("./routes/admin.gst.routes");


const app = express();

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("Local backend running");
});

app.use("/auth", authRoutes);
app.use("/admin", adminRoutes);
app.use("/admin/gst", gstRoutes);
app.use("/employee", employeeRoutes);



const PORT = 5000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

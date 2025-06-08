import mongoose from "mongoose";
import Admin from "./admin.model.js";
import dotenv from "dotenv";
dotenv.config();

const MONGO_URI = process.env.MONGO_URI;

// Students for admin1
const students1 = [
  { name: "Dhanus E M", regNo: "REG001", marks: { efforts: 8, presentation: 7, assessment: 9, assignment: 8 }, attendance: [] },
  { name: "Mei anna", regNo: "REG002", marks: { efforts: 7, presentation: 8, assessment: 8, assignment: 7 }, attendance: [] },
  { name: "Raghul na", regNo: "REG003", marks: { efforts: 9, presentation: 9, assessment: 7, assignment: 8 }, attendance: [] },
  { name: "Siva Surya", regNo: "REG004", marks: { efforts: 8, presentation: 8, assessment: 8, assignment: 9 }, attendance: [] },
  { name: "Manikandan na", regNo: "REG005", marks: { efforts: 7, presentation: 7, assessment: 8, assignment: 8 }, attendance: [] },
  { name: "Prasana", regNo: "REG006", marks: { efforts: 8, presentation: 9, assessment: 9, assignment: 7 }, attendance: [] },
  { name: "Ramsurath", regNo: "REG007", marks: { efforts: 9, presentation: 8, assessment: 8, assignment: 9 }, attendance: [] },
  { name: "Mohana Priyan", regNo: "REG008", marks: { efforts: 7, presentation: 8, assessment: 7, assignment: 8 }, attendance: [] },
  { name: "Praveen Kumar", regNo: "REG009", marks: { efforts: 8, presentation: 7, assessment: 8, assignment: 7 }, attendance: [] },
  { name: "Krishna Moorthi", regNo: "REG010", marks: { efforts: 9, presentation: 9, assessment: 9, assignment: 9 }, attendance: [] }
];

// Students for admin2
const students2 = [
  { name: "Venkatesh", regNo: "REG011", marks: { efforts: 6, presentation: 8, assessment: 7, assignment: 8 }, attendance: [] },
  { name: "Monish na", regNo: "REG012", marks: { efforts: 8, presentation: 6, assessment: 8, assignment: 7 }, attendance: [] },
  { name: "Nagulan na", regNo: "REG013", marks: { efforts: 7, presentation: 7, assessment: 9, assignment: 8 }, attendance: [] },
  { name: "Mamtha", regNo: "REG014", marks: { efforts: 9, presentation: 8, assessment: 8, assignment: 6 }, attendance: [] },
  { name: "Maria ka", regNo: "REG015", marks: { efforts: 8, presentation: 9, assessment: 7, assignment: 8 }, attendance: [] },
  { name: "Joshua Allen na", regNo: "REG016", marks: { efforts: 7, presentation: 8, assessment: 8, assignment: 9 }, attendance: [] },
  { name: "Rohit na", regNo: "REG017", marks: { efforts: 8, presentation: 7, assessment: 7, assignment: 8 }, attendance: [] },
  { name: "Swetha ka", regNo: "REG018", marks: { efforts: 9, presentation: 8, assessment: 8, assignment: 7 }, attendance: [] },
  { name: "Dharshan na", regNo: "REG019", marks: { efforts: 8, presentation: 9, assessment: 9, assignment: 8 }, attendance: [] },
  { name: "Nandha na", regNo: "REG020", marks: { efforts: 7, presentation: 8, assessment: 8, assignment: 9 }, attendance: [] }
];

async function seed() {
  await mongoose.connect(MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true });

  // Remove existing admins (optional)
  await Admin.deleteMany({});

  const admin1 = new Admin({
    adminName: "admin1",
    adminPassword: "password1",
    students: students1
  });

  const admin2 = new Admin({
    adminName: "admin2",
    adminPassword: "password2",
    students: students2
  });

  await admin1.save();
  await admin2.save();

  console.log("Seeded admin1 and admin2 with students!");
  mongoose.disconnect();
}

seed();
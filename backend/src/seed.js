import mongoose from "mongoose";
import Admin from "./admin.model.js";

const MONGO_URI = "mongodb+srv://kthiganth:wW4yBoeipjwoA2zu@cluster0.nhrldh9.mongodb.net/progresspoint?retryWrites=true&w=majority";

// Students for admin1
const students1 = [
  { name: "Alice Johnson", regNo: "REG001", marks: { efforts: 8, presentation: 7, assessment: 9, assignment: 8 }, attendance: [] },
  { name: "Bob Smith", regNo: "REG002", marks: { efforts: 7, presentation: 8, assessment: 8, assignment: 7 }, attendance: [] },
  { name: "Charlie Brown", regNo: "REG003", marks: { efforts: 9, presentation: 9, assessment: 7, assignment: 8 }, attendance: [] },
  { name: "Diana Prince", regNo: "REG004", marks: { efforts: 8, presentation: 8, assessment: 8, assignment: 9 }, attendance: [] },
  { name: "Ethan Hunt", regNo: "REG005", marks: { efforts: 7, presentation: 7, assessment: 8, assignment: 8 }, attendance: [] },
  { name: "Fiona Gallagher", regNo: "REG006", marks: { efforts: 8, presentation: 9, assessment: 9, assignment: 7 }, attendance: [] },
  { name: "George Miller", regNo: "REG007", marks: { efforts: 9, presentation: 8, assessment: 8, assignment: 9 }, attendance: [] },
  { name: "Hannah Lee", regNo: "REG008", marks: { efforts: 7, presentation: 8, assessment: 7, assignment: 8 }, attendance: [] },
  { name: "Ian Curtis", regNo: "REG009", marks: { efforts: 8, presentation: 7, assessment: 8, assignment: 7 }, attendance: [] },
  { name: "Julia Roberts", regNo: "REG010", marks: { efforts: 9, presentation: 9, assessment: 9, assignment: 9 }, attendance: [] }
];

// Students for admin2
const students2 = [
  { name: "Kevin Hart", regNo: "REG011", marks: { efforts: 6, presentation: 8, assessment: 7, assignment: 8 }, attendance: [] },
  { name: "Linda Kim", regNo: "REG012", marks: { efforts: 8, presentation: 6, assessment: 8, assignment: 7 }, attendance: [] },
  { name: "Michael Scott", regNo: "REG013", marks: { efforts: 7, presentation: 7, assessment: 9, assignment: 8 }, attendance: [] },
  { name: "Nina Dobrev", regNo: "REG014", marks: { efforts: 9, presentation: 8, assessment: 8, assignment: 6 }, attendance: [] },
  { name: "Oscar Wilde", regNo: "REG015", marks: { efforts: 8, presentation: 9, assessment: 7, assignment: 8 }, attendance: [] },
  { name: "Pam Beesly", regNo: "REG016", marks: { efforts: 7, presentation: 8, assessment: 8, assignment: 9 }, attendance: [] },
  { name: "Quentin Blake", regNo: "REG017", marks: { efforts: 8, presentation: 7, assessment: 7, assignment: 8 }, attendance: [] },
  { name: "Rachel Green", regNo: "REG018", marks: { efforts: 9, presentation: 8, assessment: 8, assignment: 7 }, attendance: [] },
  { name: "Steve Rogers", regNo: "REG019", marks: { efforts: 8, presentation: 9, assessment: 9, assignment: 8 }, attendance: [] },
  { name: "Tina Fey", regNo: "REG020", marks: { efforts: 7, presentation: 8, assessment: 8, assignment: 9 }, attendance: [] }
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
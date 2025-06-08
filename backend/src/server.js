import express from 'express';
import cors from 'cors';

const app= express();
const admins= [
    {
        adminName: "admin1",
        adminPassword: "password1",
        students:[
            'Alice', 'Bob', 'Charlie', 'David', 'Eve',
            'Frank', 'Grace', 'Heidi', 'Ivan', 'Judy'
        ]
    },
    {
        adminName: "admin2",
        adminPassword: "password2",
        students:[
            'Mallory', 'Nina', 'Oscar', 'Peggy', 'Quentin',
            'Rupert', 'Sybil', 'Trent', 'Uma', 'Victor'
        ]
    }
]
app.use(cors());
app.use(express.json());

app.post('/api/admin/login', (req,res) =>{
    const {adminName, adminPassword} = req.body;
    const admin = admins.find(admin => 
        admin.adminName === adminName && admin.adminPassword === adminPassword
    );
    
    if(admin) {
        res.status(200).json({
            success: true,
            message: "Login successful",
            students: admin.students
        });
    } else {
        res.status(401).json({message: "Invalid credentials"});
    }
});

app.get('/api/admin/:adminName/students', (req, res) => {
  const { adminName } = req.params;
  const admin = admins.find(a => a.adminName === adminName);
  if (admin) {
    res.json({ students: admin.students });
  } else {
    res.status(404).json({ message: 'Admin not found' });
  }
});

app.listen(5001, () =>{
    console.log("Server is running on port 5001");
});
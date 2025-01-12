const express = require("express");
const mysql = require("mysql2");
const bcrypt = require("bcryptjs");
const bodyParser = require("body-parser");
const cors = require("cors");
const app = express();
const port = 5000;


app.use(cors());
app.use(bodyParser.json());
app.use(express.json());


const db = mysql.createConnection({
  host: "localhost",
  user: "root", 
  password: "", 
  database: "airline_booking",
});

db.connect((err) => {
  if (err) throw err;
  console.log("Connected to MySQL!");
});

// Register Admin (Signup)

app.post("/api/signup", (req, res) => {
  const { username, password } = req.body;
  const hashedPassword = bcrypt.hashSync(password, 10);

  const query = "INSERT INTO admin (username, password) VALUES (?, ?)";
  db.query(query, [username, hashedPassword], (err, result) => {
    if (err) {
      return res
        .status(500)
        .json({ message: "Error registering admin", error: err });
    }
    res.status(200).json({ message: "Admin registered successfully" });
  });
});



// Login Admin
app.post("/api/login", (req, res) => {
  const { username, password } = req.body;

  const query = "SELECT * FROM admin WHERE username = ?";
  db.query(query, [username], (err, result) => {
    if (err || result.length === 0) {
      return res.status(400).json({ message: "Admin not found" });
    }

    const admin = result[0];
    if (bcrypt.compareSync(password, admin.password)) {
      res.status(200).json({ message: "Login successful", adminId: admin.id });
    } else {
      res.status(400).json({ message: "Invalid credentials" });
    }
  });
});

// CRUD 

// buat Ticket
app.post("/api/tickets", (req, res) => {
  const { from_city, to_city, departure_date, return_date, available_seats } =
    req.body;

  const query =
    "INSERT INTO tickets (from_city, to_city, departure_date, return_date, available_seats) VALUES (?, ?, ?, ?, ?)";
  db.query(
    query,
    [from_city, to_city, departure_date, return_date, available_seats],
    (err, result) => {
      if (err) {
        return res
          .status(500)
          .json({ message: "Error creating ticket", error: err });
      }
      res.status(200).json({ message: "Ticket created successfully" });
    }
  );
});


app.get("/api/tickets", (req, res) => {
  const query = "SELECT * FROM tickets";
  db.query(query, (err, result) => {
    if (err) {
      return res
        .status(500)
        .json({ message: "Error fetching tickets", error: err });
    }
    res.status(200).json(result);
  });
});

// Update Ticket
app.put("/api/tickets/:id", (req, res) => {
  const { id } = req.params;
  const { from_city, to_city, departure_date, return_date, available_seats } =
    req.body;
  const query =
    "UPDATE tickets SET from_city = ?, to_city = ?, departure_date = ?, return_date = ?, available_seats = ? WHERE id = ?";
  db.query(
    query,
    [from_city, to_city, departure_date, return_date, available_seats, id],
    (err, result) => {
      if (err) {
        return res
          .status(500)
          .json({ message: "Error updating ticket", error: err });
      }
      res.status(200).json({ message: "Ticket updated successfully" });
    }
  );
});

// hapus Ticket
app.delete("/api/tickets/:id", (req, res) => {
  const { id } = req.params;

  const query = "DELETE FROM tickets WHERE id = ?";
  db.query(query, [id], (err, result) => {
    if (err) {
      return res
        .status(500)
        .json({ message: "Error deleting ticket", error: err });
    }
    res.status(200).json({ message: "Ticket deleted successfully" });
  });
});
app.get("/api/tickets/:id", (req, res) => {
  const { id } = req.params;

  const query = "SELECT * FROM tickets WHERE id = ?";
  db.query(query, [id], (err, result) => {
    if (err) {
      return res.status(500).json({ message: "Error fetching ticket", error: err });
    }

    if (result.length === 0) {
      return res.status(404).json({ message: "Ticket not found" });
    }
    res.status(200).json(result[0]);
  });
});


app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});

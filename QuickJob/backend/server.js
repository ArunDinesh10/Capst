const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const userRoutes = require("./routes/userRoutes");
const connection = require("./config/db.js");
const mockTestRoutes = require('./routes/mockTestRoutes');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(express.json());
app.use(cors());
app.use(bodyParser.json());

// Routes
app.use('/api/mocktest', mockTestRoutes);
app.use("/api", userRoutes);

// Save Resume
app.post("/api/resume", (req, res) => {
  const {
    firstName,
    lastName,
    address,
    jobTitle,
    linkedinId,
    experience,
    education,
    skills,
  } = req.body;

  const query = `
    INSERT INTO resumes (first_name, last_name, address, job_title, linkedin_id, experience, education, skills)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `;

  connection.query(
    query,
    [
      firstName,
      lastName,
      address,
      jobTitle,
      linkedinId,
      JSON.stringify(experience),
      JSON.stringify(education),
      JSON.stringify(skills),
    ],
    (err, result) => {
      if (err) {
        console.error("Error saving resume data:", err);
        return res.status(500).send("Error saving resume data");
      }
      res.status(201).send({
        message: "Resume saved successfully!",
        resumeId: result.insertId,
      });
    }
  );
});

// Save Resume Builder User Data
app.post("/api/resumebuilder", (req, res) => {
  const { firstName, lastName, address, jobTitle, linkedinId, phone, email } = req.body;

  const query = `
    INSERT INTO resumeUser (first_name, last_name, address, job_title, linkedin_id, phone, email)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `;

  connection.query(
    query,
    [firstName, lastName, address, jobTitle, linkedinId, phone, email],
    (err, result) => {
      if (err) {
        console.error("Error saving user data:", err);
        return res.status(500).send("Error saving user data");
      }
      res.status(200).send({
        message: "User data saved successfully",
        userId: result.insertId,
      });
    }
  );
});

// Save Experience Data
app.post("/api/experience", (req, res) => {
  const { company, position, startDate, endDate, isCurrent, userId } = req.body;

  const query = `
    INSERT INTO experience (user_id, company, position, start_date, end_date, is_current)
    VALUES (?, ?, ?, ?, ?, ?)
  `;

  connection.query(
    query,
    [userId, company, position, startDate, endDate, isCurrent ? 1 : 0],
    (err, result) => {
      if (err) {
        console.error("Error saving experience data:", err);
        return res.status(500).send("Error saving experience data");
      }
      res.status(200).send({
        message: "Experience data saved successfully",
        experienceId: result.insertId,
      });
    }
  );
});

// Get Applications
app.get("/applications", (req, res) => {
  const query = `
    SELECT a.application_id AS id, j.job_role AS jobRole, u.name AS applicantName, a.applied_at AS submissionDate, a.status
    FROM applications a
    JOIN users u ON a.user_id = u.user_id
    JOIN jobs j ON a.job_id = j.job_id
  `;

  connection.query(query, (err, results) => {
    if (err) {
      console.error("Error fetching applications:", err);
      return res.status(500).send("Error fetching applications");
    }
    res.status(200).json(results);
  });
});

// Update Application Status
app.put("/applications/:id/status", (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  const query = `
    UPDATE applications SET status = ? WHERE application_id = ?
  `;

  connection.query(query, [status, id], (err) => {
    if (err) {
      console.error("Error updating application status:", err);
      return res.status(500).send("Error updating application status");
    }
    res.status(200).send({ message: "Application status updated successfully" });
  });
});

// Start Server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

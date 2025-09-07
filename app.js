// import express
const express = require("express");
const app = express();
const PORT = process.env.PORT || 3000;

// Middleware to parse JSON requests
app.use(express.json());

// Basic route
app.get("/", (req, res) => {
    res.send("Hello, World! Your Express app is running.");
});

// Example GET route
app.get("/api/hello", (req, res) => {
    res.json({ message: "Hello from the API!" });
});

// Example POST route
app.post("/api/echo", (req, res) => {
    const userInput = req.body;
    res.json({ youSent: userInput });
})

// Start server
app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});
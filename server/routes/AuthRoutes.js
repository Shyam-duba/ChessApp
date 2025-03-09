const User = require("../models/User");
const bcrypt = require("bcryptjs");
const { generateToken } = require("../config/jwt");
const express = require("express");
const router = express.Router();
router.post("/signup", async (req, res) => {
    console.log("Signup Request:", req.body);
    try {
        const { username, email, password, rating, matches, wins, losses, mobile } = req.body;

        let existingUser = await User.findOne({ email });
        if (existingUser) return res.status(400).json({ message: "User already exists" });

        const hashedPassword = await bcrypt.hash(password, 10);

        // Default role to "user" unless specified as "admin" (only for manually added admins)
        const newUser = await User.create({
            username,
            email,
            password:hashedPassword,
            rating,
            matches,
            wins,
            losses,
            mobile
        });

        const token = generateToken(newUser._id);
        res.status(201).json({ message: "User created successfully", token, role: newUser.roles });
    } catch (error) {
        res.status(500).json({ message: "Server error", error });
    }
});

router.post("/login", async (req, res) => {
    try {
        const { email, password } = req.body;

        const user = await User.findOne({ email });
        if (!user) return res.status(400).json({ message: "Invalid credentials" });

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(400).json({ message: "Invalid credentials" });

        const token = generateToken(user._id);
        console.log("from login ", user)
        res.status(200).json({ message: "Login successful", token, user: { username: user.username, email: user.email, rating: user.rating, matches: user.matches, wins: user.wins, losses: user.losses, draws: user.draws, mobile: user.mobile } });
    } catch (error) {
        res.status(500).json({ message: "Server error", error });
    }
});

module.exports = router;
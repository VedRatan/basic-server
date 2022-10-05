const express = require("express");
const User = require("../models/user");
const bcryptjs = require("bcrypt");
const authRouter = express.Router();
const jwt = require("jsonwebtoken");
const auth = require("../middlewares/auth");

const JWT_KEY = process.env.JWT_KEY

// SIGN UP
authRouter.post("/api/signup", async (req, res) => {
  try {
    console.log(req)
    const { name, email, password } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res
        .status(400)
        .json({ msg: "User with same email already exists!" });
    }

    const hashedPassword = await bcryptjs.hash(password, 8);

    let user = new User({
      email,
      password: hashedPassword,
      name,
    });
    user = await user.save();
    res.json(user);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// Sign In Route
// Exercise
authRouter.post("/api/signin", async (req, res) => {
  try {
    console.log(req.body);
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    console.log(user);
    if (!user) {
      return res
        .status(400)
        .json({ msg: "User with this email does not exist!" });
    }

    const isMatch = await bcryptjs.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ msg: "Incorrect password." });
    }

    const token = jwt.sign({ id: user._id }, process.env.JWT_KEY);
    res.json({ token, ...user._doc });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

authRouter.post("/tokenIsValid", async (req, res) => {
  try {
    const token = req.header("x-auth-token");
    if (!token) return res.json(false);
    const verified = jwt.verify(token, process.env.JWT_KEY);
    if (!verified) return res.json(false);

    const user = await User.findById(verified.id);
    if (!user) return res.json(false);
    res.json(true);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

authRouter.get("/api/users", async(req, res)=>{
  const users = await User.find();
  res.json(users);
})

//update the user

authRouter.post("/api/users/:id", async (req, res)=>{
  try{
    let user = await User.findById(req.params.id);

    if(!user) return res.status(400).json({msg: "User does not exist!"});

    const updatedUser = await User.updateOne({_id: req.params.id}, {$set: req.body});

    return res.status(200).json(updatedUser);

  }catch(err){
    console.log(`Error in updating user ${req.params.id}}: `,err)
    return res.status(500).json({error:err.message})
  }
})


authRouter.get("/api/users/:id", async (req, res)=>{
  try{
    let user = await User.findById(req.params.id);
    
    if(!user) return res.status(400).json({msg: "User does not exist!"});

    return res.status(200).json(user);

  }catch(err){
    console.log(`Error in fetching user ${req.params.id}}: `,err)
    return res.status(500).json({error:err.message})
  }
})

// get user data
authRouter.get("/", auth, async (req, res) => {
  const user = await User.findById(req.user);
  res.json({ ...user._doc, token: req.token });
});

module.exports = authRouter;
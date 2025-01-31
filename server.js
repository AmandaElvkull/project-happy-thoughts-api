import express from "express";
import cors from "cors";
import mongoose from "mongoose";

const mongoUrl = process.env.MONGO_URL || "mongodb://localhost/project-mongo";
mongoose.connect(mongoUrl, { useNewUrlParser: true, useUnifiedTopology: true });
mongoose.Promise = Promise;

// Defines the port the app will run on. Defaults to 8080, but can be overridden
// when starting the server. Example command to overwrite PORT env variable value:
// PORT=9000 npm start
const port = process.env.PORT || 8080;
const app = express();

// Add middlewares to enable cors and json body parsing
app.use(cors());
app.use(express.json());

const HappyThoughts = new mongoose.Schema({
  message:{
    type: String, 
    required: true,
    minLength: 5, 
    maxLength: 140,
      // Deletes whitespace from beginning and end of a string (but no spaces between words)
    trim: true, 
  },
  hearts: {
    type: Number,
    default:0,
  },
  creadedAt: {
    type: Date, 
    default: () => new Date()
  },
})

const thoughtList = mongoose.model("thoughtList", HappyThoughts)

// Start defining your routes here
app.get("/", (req, res) => {
  res.send({
    Message: "This is an API for Happy Thoughts",
    Routes: [{
      "/thoughts": "To GET and POST Happy thoughts",
      "/thoughts/:id/like" : " Add likes to a thought"
    }]
  });
});

// All happy thoughts MAX 20 
app.get("/thoughts", async (req, res) => {

  try {
    const thoughts = await thoughtList.find().sort({creadedAt: 'desc'}).limit(20).exec()
    res.status(200).json(thoughts)

  } catch (error) {
    res.status(400).json({ response: error, success: false })
  }

})

// Post a happy thought
app.post("/thoughts", async(req, res) => {
  const { message } = req.body

  try {
    const newThought = await new thoughtList({ message }).save()
    res.status(201).json({
      response: newThought,
      success: true,
    })
  } catch(err) {
    res.status(400).json({
      message: "Not able to post your thought",
      success: false, 
      error: err.errors
    })
  }

})

app.post("/thoughts/:id/like", async (req, res) => {
  const { id } = req.params

   try{
    const updateLikes = await thoughtList.findByIdAndUpdate(id, { $inc: { hearts: 1 } })
    res.status(201).json({
      response: updateLikes, 
      success: true
    })
   } catch(err) {
    res.status(400).json({
      message: "Couldn't find no post with that ID",
      success: false, 
      error: err.errors
    })
   }
})

// Start the server
app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});

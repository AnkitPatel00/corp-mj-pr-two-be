const initializeDatabase = require("./db/db.connect")
const AgentModel = require('./models/salesAgent.model')
const LeadModel = require('./models/lead.model')
const CommentModel = require('./models/comment.model')
const cors = require('cors')
const express = require('express')
const mongoose = require("mongoose")
const app = express()
app.use(express.json())
app.use(cors({ origin: "*" }))

initializeDatabase()

app.get("/",(req,res) => {
  res.send(`<div>Welcome to Anvaya Server
    <h3>Lead API </h3>
    <p>Leads api (GET/POST): /api/leads</p>
    <p>Lead by Id api (GET): /api/leads/:leadId</p>
    <p>Lead Update by Id api (PUT): /api/leads/:leadId</p>
    <p>Lead Delete by Id api (DELETE): /api/leads/:leadId</p>
    <h3>Agent API </h3>
    <p>Agent api (GET/POST): /api/agents</p>
    <p>Agent by Id api (GET): /api/agents/:agentId</p>
    <h3>Comment API </h3>
    <p>Comment by lead id api (GET/POST): /api/leads/:id/comments</p>
    <h3>Report API </h3>
    <p>lastweek closed lead Report api (GET): /api/report/last-week</p>
    <p>pipeline leads count Report api (GET): /api/report/pipeline</p>
    </div>`)
})

//*Leads API/

//Creates a new lead.

app.post("/api/leads", async (req, res) => {
  
  const { name, salesAgent } = req.body
  try {

    if (name)
    {
      if (typeof name !== "string")
      {
return res.status(400).json({error:'name must be a string.'})
      }
    }


    if (salesAgent)
    {
      const isValid = mongoose.Types.ObjectId.isValid(salesAgent)
      if (!isValid)
      {
        return res.status(400).json({ error: `Invalid Id ${salesAgent} for SalesAgent` })
      }

       const isAgentAvalable = await AgentModel.findById(salesAgent)

      if (!isAgentAvalable)
      {
        return res.status(404).json({error:`Sales agent with ID '${salesAgent}' not found.`})
      }
    }

    

    const newLead = new LeadModel(req.body)
    const savedLead = await newLead.save()
    if (!salesAgent)
    {
      return res.status(400).json({ error: "error in saving lead" })
    }
    const lead =await savedLead.populate("salesAgent", "name")
    return res.status(200).json(lead)

  }
  catch (error)
  {
    if (error.name === "ValidationError")
    {

      const firstError = Object.values(error.errors)[0].message;
       return res.status(400).json({error: firstError})
    }

    res.status(400).json({error:"internal server error"})
   
  }
})

//Get All Leads -Fetches all leads with optional filtering.


app.get("/api/leads", async (req, res) => {
  const { salesAgent, status, tags, source,sortByDay } = req.query

  const statusEnum =['New', 'Contacted', 'Qualified', 'Proposal Sent','Closed']
  const sourceEnum =['Website', 'Referral', 'Cold Call', 'Advertisement', 'Email', 'Other']

  const query = {}

    if (salesAgent)
  {
    const isValid = mongoose.Types.ObjectId.isValid(salesAgent)
    if (!isValid)
    {
      return res.status(400).json({ error: `Invalid Id '${salesAgent}' for SalesAgent` })
    }
    query.salesAgent = salesAgent
  }

  if (status)
  {


   if ((typeof status ==="string" && !statusEnum.includes(status)))
   {
   
      return res.status(400).json({ error: `Invalid input: 'status' must be one of [${statusEnum.join(", ")}].` })
    }
   else if (typeof status !=="string" && !status.every((status) => statusEnum.includes(status)))
   {
     return res.status(400).json({ error: `Invalid input: 'status' must be one of [${statusEnum.join(", ")}].` })
     }

      query.status = {$in:status}
    
  }

  if (tags)
  {
    query.tags = { $regex: tags, $options: "i" }
  }

  if (source)
  {
    if (!sourceEnum.includes(source))
    {
      return res.status(400).json({ error: `Invalid input: 'source' must be one of [${sourceEnum.join(", ")}].` })
    }
    query.source =source
  }

  if (sortByDay)
  {
     if (sortByDay !== "low" &&  sortByDay !== "high"  )
  {
    return res.status(400).json({ error: `Invalid input: 'sortByDay' must be one of [ low , high ].` })
  }
   }

   let sortDay

  sortDay = sortByDay === "low" ? { "timeToClose": 1 } : sortByDay === "high" ? { "timeToClose": -1 } : {}
  
  try {
    const leads = await LeadModel.find(query).populate("salesAgent", "name").sort(sortDay)
    res.status(200).json(leads)
  }
  catch (error)
  {
res.status(400).json({error})
  }
})

//get lead with Id

app.get("/api/leads/:leadId", async (req,res) => {
const leadId = req.params.leadId
    if (leadId)
  {
    const isValid = mongoose.Types.ObjectId.isValid(leadId)
    if (!isValid)
    {
      return res.status(400).json({ error: `Invalid Id '${leadId}' for SalesAgent` })
    }
  }
  try {
    const lead = await LeadModel.findById(leadId).populate("salesAgent", "name")
    if (!lead)
    {
return res.status(400).json({error:"error in getting lead"})
    }
res.status(200).json(lead)
  }
  catch (error)
  {
res.status(400).json({error})
  }
})

//Update a Lead

app.put("/api/leads/:id", async (req, res) => {
 const leadId = req.params.id
  const { name, salesAgent,status } = req.body

  if (leadId)
  {
    const isValidId = mongoose.Types.ObjectId.isValid(leadId)
    if (!isValidId)
    {
return res.status(400).json({ error: `Invalid Id '${leadId}' for Lead` })
    }
  }
  
  try {

    const isLeadExist = await LeadModel.findOne({ _id: leadId })
    
    if (!isLeadExist)
    {
      res.status(404).json({error: `Lead with ID '${leadId}' not found.`})
    }

    if (name)
    {
      if (typeof name !== "string")
      {
return res.status(400).json({error:'name must be a string.'})
      }
    }

    if (salesAgent)
    {
      const isValid = mongoose.Types.ObjectId.isValid(salesAgent)
      if (!isValid)
      {
        return res.status(400).json({ error: `Invalid Id ${salesAgent} for SalesAgent` })
      }

       const isAgentAvalable = await AgentModel.findById(salesAgent)

      if (!isAgentAvalable)
      {
        return res.status(404).json({error:`Sales agent with ID '${salesAgent}' not found.`})
      }
    }

    const updatedLead = await LeadModel.findByIdAndUpdate(leadId, { ...req.body, ...(req.body.status === "Closed" && { closedAt: Date.now() }) }, { new: true, runValidators: true })
    
    await updatedLead.save()
    if (!updatedLead)
    {
      return res.status(400).json({ error: "error in updating lead" })
    }

    const lead =await updatedLead.populate("salesAgent", "name")
    return res.status(200).json(lead)

  }
  catch (error)
  {
   
    if (error.name === "ValidationError")
    {

      const firstError = Object.values(error.errors)[0].message;
       return res.status(400).json({error: firstError})
    }

    res.status(500).json({error:"internal server error"})
   
  }
})

//Delete a Lead

app.delete("/api/leads/:id", async(req, res) => {
  const leadId = req.params.id
   if (leadId)
  {
    const isValidId = mongoose.Types.ObjectId.isValid(leadId)
    if (!isValidId)
    {
return res.status(400).json({ error: `Invalid Id '${leadId}' for Lead` })
    }
  }
  try {
    const isLeadExist =await LeadModel.findById(leadId)
      if (!isLeadExist)
    {
      res.status(404).json({error: `Lead with ID '${leadId}' not found.`})
    }
    const deletedLead = await LeadModel.findByIdAndDelete(leadId)
    if (!deletedLead)
    {
      return res.status(400).json({ error: "error in deleting lead" })
    }

    res.status(200).json(deletedLead)

  }
  catch (error)
  {
 res.status(500).json({error:"internal server error"})
  }
})


//*Sales Agents API/

//Adds a new sales agent.

app.post("/api/agents", async (req, res) => {
  const { name, email } = req.body

  if (name && typeof name !== "string")
    {
return res.status(400).json({error:'Invalid input: name must be a string.'})
  }

   if (email && (!email.includes("@") || !email.includes(".")))
    {
return res.status(400).json({error:"Invalid input: 'email' must be a valid email address."})
    }
  try {
    
    const isEmailExist = await AgentModel.findOne({ email })
    
    if (isEmailExist)
    {
return res.status(409).json({ error: `Sales agent with email'${email}' already exists.`})
    }

    const newAgent = new AgentModel(req.body)

    const savedAgent = await newAgent.save()
    
    if (!savedAgent)
    {
      return res.status(400).json({error:'error in saving Agent'})
    }

    return res.status(200).json(savedAgent)
  }
  catch (error)
  {
   
    if (error.name === "ValidationError")
    {
      const firstError = Object.values(error.errors)[0].message
      return res.status(400).json({ error:firstError })
    }

    res.status(500).json({error:"internal server error"})
    
  }
})

//  Fetches all sales agents.

app.get("/api/agents",async(req,res) => {
  try {
    const agents = await AgentModel.find()
    if (!agents)
    {
      res.status(400).json({error:"error in fetching agents"})
    }
    res.status(200).json(agents)
  }
  catch (error)
  {
 return res.status(500).json({ error: "internal server error" })
  }
})

//  Fetches sales agents by Id.

app.get("/api/agents/:agentId", async (req, res) => {

  const agentId = req.params.agentId

    if (agentId)
  {
    const isValidId = mongoose.Types.ObjectId.isValid(agentId)
    if (!agentId)
    {
return res.status(400).json({ error: `Invalid Id '${agentId}' for Lead` })
    }
  }
  try {
    const agent = await AgentModel.findById(agentId)
    if (!agent)
    {
      res.status(400).json({error:"error in fetching agents"})
    }
    res.status(200).json(agent)
  }
  catch (error)
  {
 return res.status(500).json({ error: "internal server error" })
  }
})

// Comments API Adds a new comment to a specific lead.

app.post("/api/leads/:id/comments", async (req,res) => {
  const leadId = req.params.id
  const { commentText } = req.body
  if (commentText)
  {
    if (typeof commentText !== "string")
    {
      return res.status(400).json({error:"commentText must be a string."})
    }
  }
  if (leadId)
  {
    const isValidId = mongoose.Types.ObjectId.isValid(leadId)
    if (!isValidId)
    {
      return res.status(400).json({error:`Invalid Id '${leadId}' for Lead`})
    }
  }
  try {

     const isLeadExist =await LeadModel.findById(leadId)
      if (!isLeadExist)
    {
      res.status(404).json({error: `Lead with ID '${leadId}' not found.`})
    }

    const newComment = new CommentModel({ lead: leadId, author: "67b5663ba5e69bc20f5bc35f", commentText })
    const savedComment = await newComment.save()
    if (!savedComment)
    {
      return res.status(400).json({error:"error is saving comment"})
    }

    const comment = await CommentModel.findById(savedComment._id).populate("author","name")

    res.status(201).json(comment)
  }
  catch (error)
  {
      if (error.name === "ValidationError")
    {
      const firstError = Object.values(error.errors)[0].message
      return res.status(400).json({ error:firstError })
    }
    res.status(500).json({ error: "internal server error" })
    
  }
})

//

// Get All Comments for a Lead

app.get("/api/leads/:id/comments", async (req,res) => {

  const leadId = req.params.id

   if (leadId)
  {
    const isValidId = mongoose.Types.ObjectId.isValid(leadId)
    if (!isValidId)
    {
      return res.status(400).json({error:`Invalid Id '${leadId}' for Lead`})
    }
  }
  try {
    const allComments = await CommentModel.find({ lead: leadId }).populate("author","name")
    res.status(200).json(allComments)
  }
  catch (error)
  {
 res.status(500).json({ error: "internal server error" })
  }
})

//report api

app.get("/api/report/last-week", async (req, res) => {
  
  const sevendayAgoDate = new Date()
    
  sevendayAgoDate.setDate(sevendayAgoDate.getDate() - 7);

  try {
    const closedLeads = await LeadModel.find({ status: "Closed" ,closedAt:{$gte:sevendayAgoDate}}).populate("salesAgent", "name")
    res.status(200).json(closedLeads)
  }
  catch (error)
  {
 res.status(500).json({ error: "internal server error" })
  }
})


app.get("/api/report/pipeline", async (req, res) => {
  

  try {
    const pipelineLeads = await LeadModel.find({ status: {$ne:"Closed"} }).countDocuments()
    res.status(200).json({
  "totalLeadsInPipeline": pipelineLeads
}
)
  }
  catch (error)
  {
 res.status(500).json({ error: "internal server error" })
  }
})

//handle invalid route

app.all("*",(req,res) => {
  res.status(404).json({error:"invalid api route"})
})

const PORT = process.env.PORT
app.listen(PORT,() => {
  console.log(`Server is Running on Port ${PORT}`)
})



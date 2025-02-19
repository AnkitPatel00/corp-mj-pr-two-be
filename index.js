const initializeDatabase = require("./db/db.connect")
const AgentModel = require('./models/salesAgent.model')
const LeadModel = require('./models/lead.model')
const cors = require('cors')
const express = require('express')
const mongoose = require("mongoose")
const app = express()
app.use(express.json())
app.use(cors({ origin: "*" }))

initializeDatabase()

app.get("/",(req,res) => {
  res.send("Welcome to Anvaya Server")
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
    console.log(newLead)
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
  const { salesAgent, status, tags, source } = req.query

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
 if (!statusEnum.includes(status))
    {
      return res.status(400).json({ error: `Invalid input: 'status' must be one of [${statusEnum.join(", ")}].` })
    }
    query.status = status
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

  try {
    const leads = await LeadModel.find(query)
    res.status(200).json(leads)
  }
  catch (error)
  {
res.status(400).json({error})
  }
})

//Update a Lead

app.put("/api/leads/:id", async (req, res) => {
 const leadId = req.params.id
  const { name, salesAgent } = req.body

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

    const updatedLead = await LeadModel.findOneAndUpdate({_id:leadId},req.body, { new: true,runValidators: true })
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

    res.status(200).json({"message": "Lead deleted successfully."})

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
    console.log(error.name)
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


//handle invalid route

app.all("*",(req,res) => {
  res.status(404).json({error:"invalid api route"})
})

const PORT = process.env.PORT
app.listen(PORT,() => {
  console.log(`Server is Running on Port ${PORT}`)
})



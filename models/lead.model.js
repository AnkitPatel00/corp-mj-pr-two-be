const mongoose = require('mongoose');

// Lead Schema
const leadSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Lead name is required'],
  },
  source: {
    type: String,
    required: [true, 'Lead source is required'],
    enum:{values: ['Website', 'Referral', 'Cold Call', 'Advertisement', 'Email', 'Other'],message:"Invalid input: 'source' must be one of ['Website', 'Referral', 'Cold Call', 'Advertisement', 'Email', 'Other']."},  // Predefined lead sources
  },
  salesAgent: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'SalesAgent',  // Reference to SalesAgent model
    required: [true, 'Sales Agent is required'],
  },
  status: {
    type: String,
    required: true,
    enum:{values: ['New', 'Contacted', 'Qualified', 'Proposal Sent', 'Closed'] , message:"Invalid input: 'status' must be one of ['New', 'Contacted', 'Qualified', 'Proposal Sent', 'Closed']."},  // Predefined lead statuses
    default: 'New',
  },
  tags: {
    type: [String],  // Array of strings for tags (e.g., High Value, Follow-up)
  },
  timeToClose: {
    type: Number,
    required: [true, 'Time to Close is required'],
    min: [1, 'Time to Close must be a positive number'],  // Positive integer validation
  },
  priority: {
    type: String,
    required: true,
    enum: {values:['High', 'Medium', 'Low'],message:"Invalid input: 'priority' must be one of ['High', 'Medium', 'Low']."},  // Predefined priority levels
    default: 'Medium',
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
  closedAt: {
    type: Date,  // The date when the lead was closed (optional, used when status is "Closed")
  },
});

// Middleware to update the `updatedAt` field on each save
leadSchema.pre('save', function (next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('Lead', leadSchema);

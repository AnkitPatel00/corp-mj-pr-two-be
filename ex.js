const errorObject = {
  errors: {
    source: {
      name: "ValidatorError",
      message: "Invalid input: 'source' must be one of ['Website', 'Referral', 'Cold Call', 'Advertisement', 'Email', 'Other'].",
      properties: {
        message: "Invalid input: 'source' must be one of ['Website', 'Referral', 'Cold Call', 'Advertisement', 'Email', 'Other'].",
        type: "enum",
        enumValues: [
          "Website",
          "Referral",
          "Cold Call",
          "Advertisement",
          "Email",
          "Other"
        ],
        path: "source",
        value: "referral"
      },
      kind: "enum",
      path: "source",
      value: "referral"
    },
    status: { 
      name: "ValidatorError",
      message: "Invalid input: 'status' must be one of ['New', 'Contacted', 'Qualified', 'Proposal Sent', 'Closed'].",
      properties: {
        message: "Invalid input: 'status' must be one of ['New', 'Contacted', 'Qualified', 'Proposal Sent', 'Closed'].",
        type: "enum",
        enumValues: [
          "New",
          "Contacted",
          "Qualified",
          "Proposal Sent",
          "Closed"
        ],
        path: "status",
        value: "new"
      },
      kind: "enum",
      path: "status",
      value: "new"
    }
  },
  _message: "Lead validation failed",
  name: "ValidationError",
  message: "Lead validation failed: source: Invalid input: 'source' must be one of ['Website', 'Referral', 'Cold Call', 'Advertisement', 'Email', 'Other']., status: Invalid input: 'status' must be one of ['New', 'Contacted', 'Qualified', 'Proposal Sent', 'Closed']."
};

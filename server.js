const express = require("express");
const fs = require("fs");
const axios = require("axios");
require("dotenv").config();
const app = express();

app.use(express.json());
app.use(express.static("public"));

let agentState = {
  client: null,
  product: null,
  price: null,
  proposal: ""
};

function loadData(file) {
  return JSON.parse(fs.readFileSync(`data/${file}`));
}

app.post("/chat", async (req, res) => {
  const userMessage = req.body.message;

  const crm = loadData("crm.json");
  const pricing = loadData("pricing.json");
  const templates = loadData("templates.json");

  // Detect customer
  crm.customers.forEach(c => {
    if (userMessage.toLowerCase().includes(c.name.toLowerCase())) {
      agentState.client = c;
    }
  });

  // Detect product
  pricing.products.forEach(p => {
    if (userMessage.toLowerCase().includes(p.name.toLowerCase())) {
      agentState.product = p;
      agentState.price = p.pricePerYear;
    }
  });

  const systemPrompt = `
You are an enterprise AI Sales Agent working inside Microsoft Copilot.

CRM:
${JSON.stringify(agentState.client)}

Product:
${JSON.stringify(agentState.product)}

Current Proposal:
${agentState.proposal || "None"}

Your job:
- Ask for missing info
- Generate or update a sales proposal
- Use the template
`;

  const userPrompt = userMessage;

  const response = await axios.post(
    "https://api.openai.com/v1/chat/completions",
    {
      model: "gpt-4o",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt }
      ]
    },
    {
      headers: {
        Authorization: `Bearer ${process.env.OPENAI_KEY}`
      }
    }
  );

  const reply = response.data.choices[0].message.content;

  agentState.proposal = reply;

  res.json({
    reply,
    proposal: agentState.proposal,
    crm: agentState.client,
    product: agentState.product
  });
});

app.listen(3000, () => console.log("Agent running on http://localhost:3000"));

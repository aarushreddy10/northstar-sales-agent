async function send() {
    const input = document.getElementById("input").value;
  
    const res = await fetch("/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message: input })
    });
  
    const data = await res.json();
  
    document.getElementById("chat").innerHTML += `<p>You: ${input}</p><p>Agent: ${data.reply}</p>`;
    document.getElementById("proposal").innerText = data.proposal;
    document.getElementById("crm").innerText = JSON.stringify(data.crm, null, 2);
  }
  
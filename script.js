const SUBJECTS = [
  { key:"hindu", name:"The Hindu Editorial Quiz", total:20, cutoff:8 },
  { key:"ca", name:"Current Affairs Quiz", total:20, cutoff:8 },
  { key:"desc", name:"Descriptive Writing Quiz", total:30, cutoff:12 },
  { key:"weeklyH", name:"Weekly Hindu Editorial Quiz", total:60, cutoff:37 },
  { key:"weeklyCA", name:"Weekly Current Affairs Quiz", total:70, cutoff:35 }
];

const USERS = {
  "9151701": { password:"91517001", dob:"05-07-2000", name:"Deepanshu Yadav", hindu:20, ca:20, desc:28, weeklyH:55, weeklyCA:62, email:"purab100yadav@gmail.com" },
  "8504002": { password:"85040002", dob:"25-11-2004", name:"Nikita Soni", hindu:18, ca:11, desc:18, weeklyH:42, weeklyCA:40, email:"nikita@example.com" },
  "8756203": { password:"87562003", dob:"10-08-2002", name:"Jyoti Yadav", hindu:19, ca:18, desc:25, weeklyH:48, weeklyCA:52, email:"jyoti@example.com" },
  "6001104": { password:"60011004", dob:"29-11-1999", name:"Priyanka Dev", hindu:17, ca:16, desc:20, weeklyH:46, weeklyCA:45, email:"priyanka@example.com" },
  "6205705": { password:"62057005", dob:"25-12-2003", name:"Priyanka Verma", hindu:6, ca:8, desc:12, weeklyH:20, weeklyCA:22, email:"verma@example.com" },
  "8303906": { password:"83039006", dob:"27-07-2003", name:"Adweta Sen", hindu:0, ca:0, desc:0, weeklyH:0, weeklyCA:0, email:"adweta@example.com" },
  "7878107": { password:"78781007", dob:"02-02-2002", name:"Shivani Jha", hindu:6, ca:10, desc:10, weeklyH:22, weeklyCA:25, email:"shivani@example.com" },
  "8534808": { password:"85348008", dob:"06-06-2002", name:"Shweta Yadav", hindu:8, ca:13, desc:14, weeklyH:30, weeklyCA:35, email:"shweta@example.com" }
};

let chart = null;
let currentRoll = null;

function getTotal(u){
  return SUBJECTS.reduce((s,x)=>s+(u[x.key]||0),0);
}

function login(){
  const roll = document.getElementById("roll").value.trim();
  const pass = document.getElementById("password").value.trim();
  const dob = document.getElementById("dob").value.trim();
  const errorEl = document.getElementById("error");

  if(!USERS[roll] || USERS[roll].password !== pass || USERS[roll].dob !== dob){
    errorEl.textContent = "Invalid credentials. Please check Roll No, Password, and DOB.";
    return;
  }
  errorEl.textContent = "";
  currentRoll = roll;
  showResult(roll);
}

function showResult(roll){
  const u = USERS[roll];
  document.getElementById("loginCard").style.display = "none";
  document.getElementById("resultCard").style.display = "block";

  document.getElementById("name").textContent = u.name;
  document.getElementById("rollShow").textContent = roll;

  const sorted = Object.entries(USERS).sort((a,b)=>getTotal(b[1]) - getTotal(a[1]));
  const rank = sorted.findIndex(x => x[0] === roll) + 1;
  document.getElementById("rank").textContent = rank;

  // Topper & medals
  document.getElementById("topperBadge").style.display = rank === 1 ? "inline-block" : "none";
  const medalEl = document.getElementById("medalTag");
  if(rank === 1) medalEl.textContent = "🥇 Gold Performer";
  else if(rank === 2) medalEl.textContent = "🥈 Silver Performer";
  else if(rank === 3) medalEl.textContent = "🥉 Bronze Performer";
  else medalEl.textContent = "";

  document.getElementById("certBtn").style.display = rank <= 3 ? "inline-block" : "none";

  // Table
  let tableHTML = `<tr><th>Subject</th><th>Marks</th><th>Cut-off</th><th>Status</th></tr>`;
  let labels = [], data = [];
  SUBJECTS.forEach(s => {
    const scored = u[s.key];
    const pass = scored >= s.cutoff;
    tableHTML += `
      <tr class="${pass ? 'green' : 'red'}">
        <td>${s.name}</td>
        <td>${scored}/${s.total} ${!pass ? '⭐' : ''}</td>
        <td>${s.cutoff}</td>
        <td>${pass ? 'Pass' : 'Fail'}</td>
      </tr>
    `;
    labels.push(s.name);
    data.push(scored);
  });
  document.getElementById("marksTable").innerHTML = tableHTML;

  // Attempt summary & accuracy
  const totalQ = 20 + 20 + 2 + 60 + 60; // 162
  const correct = u.hindu + u.ca + u.weeklyH + u.weeklyCA;
  const attempted = totalQ; // assuming attempted all
  const wrong = totalQ - correct;
  const accuracy = ((correct / attempted) * 100).toFixed(2);

  document.getElementById("totalQ").textContent = totalQ;
  document.getElementById("attempted").textContent = attempted;
  document.getElementById("correct").textContent = correct;
  document.getElementById("wrong").textContent = wrong;
  document.getElementById("accuracy").textContent = accuracy;

  // Chart
  if(chart) chart.destroy();
  chart = new Chart(document.getElementById("barChart"), {
    type: 'bar',
    data: {
      labels,
      datasets: [{ label: "Marks", data }]
    },
    options: {
      responsive: true,
      scales: { y: { beginAtZero: true } }
    }
  });
}

function downloadPDF(){
  html2pdf().from(document.getElementById("marksheet")).save("Scorecard.pdf");
}

function downloadCertificate(){
  const roll = currentRoll;
  const u = USERS[roll];
  const sorted = Object.entries(USERS).sort((a,b)=>getTotal(b[1]) - getTotal(a[1]));
  const rank = sorted.findIndex(x => x[0] === roll) + 1;

  const cert = document.createElement("div");
  cert.style.padding = "40px";
  cert.innerHTML = `
    <h1 style="text-align:center;">Certificate of Excellence</h1>
    <p style="text-align:center;font-size:18px;">
      This is to certify that <b>${u.name}</b> has secured <b>Rank ${rank}</b>
      in the Weekly Test Series.
    </p>
    <p style="text-align:right;margin-top:60px;">Authorized Signatory<br><b>Deepanshu Yadav</b></p>
  `;
  html2pdf().from(cert).save(\`Certificate_Rank_\${rank}.pdf\`);
}

function emailResult(){
  const u = USERS[currentRoll];
  const rank = document.getElementById("rank").textContent;
  window.location.href = \`mailto:${u.email}?subject=Your Scorecard&body=Hi ${u.name},%0D%0AYour Rank: ${rank}\`;
}

function logout(){
  location.reload();
}

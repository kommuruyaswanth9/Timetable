const timetable = {
  1: [ // Monday
    ["09:15","10:05","Advanced Data Structures and Algorithm Analysis","class",1],
    ["10:05","10:55","Digital Logic Design and Computer Organization","class",1],
    ["10:55","11:45","Discrete Mathematics","class",1],
    ["11:45","12:35","Object Oriented Programming Using Java","class",1]
  ],
  2: [ // Tuesday
    ["09:15","10:05","Universal Human Values-II","class",1],
    ["10:05","10:55","Advanced Data Structures and Algorithm Analysis","class",1],
    ["10:55","11:45","Object Oriented Programming Using Java","class",1],
    ["11:45","12:35","Digital Logic Design and Computer Organization","class",1]
  ],
  3: [ // Wednesday
    ["09:15","10:55","Digital Logic Design and Computer Organization Lab","lab",2],
    ["10:55","11:45","Digital Logic Design and Computer Organization","class",1],
    ["11:45","12:35","Discrete Mathematics","class",1],
    ["13:30","14:20","Digital Logic Design and Computer Organization","class",1],
    ["14:20","15:10","Object Oriented Programming Using Java","class",1]
  ],
  4: [ // Thursday
    ["10:55","12:35","Full Stack Development","lab",2],
    ["13:30","14:20","Discrete Mathematics","class",1],
    ["14:20","15:10","Digital Logic Design and Computer Organization","class",1]
  ],
  5: [ // Friday
    ["10:05","10:55","Universal Human Values-II","class",1],
    ["10:55","11:45","Discrete Mathematics","class",1],
    ["11:45","12:35","Object Oriented Programming Using Java","class",1],
    ["13:30","14:20","Advanced Data Structures and Algorithm Analysis","class",1],
    ["14:20","15:10","Discrete Mathematics","class",1],
    ["15:10","16:50","Object Oriented Programming Using Java Lab","lab",2]
  ],
  6: [ // Saturday
    ["10:05","10:55","Advanced Data Structures and Algorithm Analysis","class",1],
    ["10:55","12:35","Advanced Data Structures and Algorithm Analysis Lab","lab",2],
    ["13:30","14:20","Object Oriented Programming Using Java","class",1],
    ["14:20","15:10","Universal Human Values-II","class",1],
    ["15:10","16:00","Advanced Data Structures and Algorithm Analysis","class",1]
  ]
};
const names=["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"];
let data=JSON.parse(localStorage.getItem("attendanceData")||"{}");
let view=new Date(2026,9,1); view.setHours(0,0,0,0);
let selected=new Date(2026,9,5); selected.setHours(0,0,0,0);
const key=d=>`${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}`;
const pad=n=>String(n).padStart(2,"0");
const fmt=d=>d.toLocaleDateString(undefined,{weekday:"long",day:"numeric",month:"long",year:"numeric"});
function save(){localStorage.setItem("attendanceData",JSON.stringify(data));}
// Date-specific timetable history. These schedules are used only for the requested past dates.
// Thursday through 2026-09-03 (inclusive)
// Saturday through 2026-08-29 (inclusive)
function scheduleForDate(d){
  const k=key(d);
  if(d.getDay()===4 && k <= "2026-09-03"){
    return [
      ["10:55","12:35","Full Stack Development","lab",2],
      ["13:30","14:20","Discrete Mathematics","class",1],
      ["14:20","15:10","Object Oriented Programming Using Java","class",1],
      ["15:10","16:00","Digital Logic Design and Computer Organization","class",1]
    ];
  }
  if(d.getDay()===6 && k <= "2026-08-29"){
    return [
      ["10:05","10:55","Advanced Data Structures and Algorithm Analysis","class",1],
      ["10:55","12:35","Advanced Data Structures and Algorithm Analysis Lab","lab",2],
      ["13:30","14:20","Object Oriented Programming Using Java","class",1],
      ["14:20","15:10","Universal Human Values-II","class",1],
      ["15:10","16:00","Digital Logic Design and Computer Organization","class",1]
    ];
  }
  return timetable[d.getDay()]||[];
}
function entriesFor(d){return scheduleForDate(d)}
function getDay(d){return data[key(d)]||{}}
function statusFor(d){
  const e=getDay(d), items=entriesFor(d);
  if(!items.length) return null;
  const vals=items.map((_,i)=>e[i]);
  if(vals.every(v=>v==="holiday")) return "holiday";
  const active=vals.filter(v=>v==="present"||v==="absent");
  if(!active.length) return null;
  if(active.every(v=>v==="present")) return "present";
  if(active.every(v=>v==="absent")) return "absent";
  return "mixed";
}
function renderCalendar(){
  const y=view.getFullYear(), m=view.getMonth();
  document.getElementById("monthTitle").textContent=view.toLocaleDateString(undefined,{month:"long",year:"numeric"});
  const first=new Date(y,m,1), last=new Date(y,m+1,0);
  let html="";
  for(let i=0;i<first.getDay();i++) html+='<div class="day empty"></div>';
  for(let n=1;n<=last.getDate();n++){
    const d=new Date(y,m,n), k=key(d), s=statusFor(d);
    const today=key(new Date())===k, sel=key(selected)===k;
    html+=`<div class="day ${today?"today ":""}${sel?"selected":""}" data-date="${k}">
      <div class="day-number">${n}</div>${s?`<div class="day-status ${s}"></div>`:""}
    </div>`;
  }
  document.getElementById("calendar").innerHTML=html;
  document.querySelectorAll(".day[data-date]").forEach(el=>el.onclick=()=>{
    selected=new Date(el.dataset.date+"T00:00:00"); renderAll();
  });
}
function renderDay(){
  const title=document.getElementById("selectedDateTitle"), sub=document.getElementById("selectedDateSub"), box=document.getElementById("dayContent");
  title.textContent=fmt(selected);
  const items=entriesFor(selected);
  if(!items.length){sub.textContent="No scheduled classes or labs.";box.innerHTML='<div class="empty-state">Sunday / no timetable entries.<br>Nothing is counted.</div>';return}
  sub.textContent=`${items.length} timetable entries • ${items.reduce((a,x)=>a+x[4],0)} attendance periods`;
  const d=getDay(selected);
  box.innerHTML=items.map((x,i)=>{
    const st=d[i]||"";
    return `<div class="session"><div class="session-main"><div><div class="subject">${x[2]}</div><div class="time">${time(x[0])} – ${time(x[1])} • ${x[4]} period${x[4]>1?"s":""}</div></div><span class="badge ${x[3]}">${x[3]==="lab"?"LAB":"CLASS"}</span></div>
    <div class="actions">
      <button class="${st==="present"?"active present":""}" onclick="setStatus(${i},'present')">✓ Present</button>
      <button class="${st==="absent"?"active absent":""}" onclick="setStatus(${i},'absent')">✕ Absent</button>
      <button class="${st==="holiday"?"active holiday":""}" onclick="setStatus(${i},'holiday')">○ Holiday</button>
    </div></div>`
  }).join("");
}
function time(t){let [h,m]=t.split(":").map(Number);const ap=h>=12?"PM":"AM";h=h%12||12;return `${h}:${pad(m)} ${ap}`}
function setStatus(i,s){const k=key(selected);data[k]??={};data[k][i]=s;save();renderAll()}
document.getElementById("clearDay").onclick=()=>{delete data[key(selected)];save();renderAll()};
document.getElementById("prevMonth").onclick=()=>{view.setMonth(view.getMonth()-1);renderCalendar()};
document.getElementById("nextMonth").onclick=()=>{view.setMonth(view.getMonth()+1);renderCalendar()};
document.getElementById("todayBtn").onclick=()=>{view=new Date();view.setHours(0,0,0,0);selected=new Date(view);renderAll()};
document.getElementById("resetData").onclick=()=>{if(confirm("Delete all saved attendance?")){data={};save();renderAll()}};
document.getElementById("targetPct").onchange=renderStats;
function renderStats(){
  let present=0,absent=0,holidays=0;
  Object.entries(data).forEach(([k,vals])=>{
    const d=new Date(k+"T00:00:00"), items=entriesFor(d);
    items.forEach((x,i)=>{if(vals[i]==="present")present+=x[4];if(vals[i]==="absent")absent+=x[4];if(vals[i]==="holiday")holidays+=x[4]});
  });
  const conducted=present+absent, pct=conducted?present/conducted*100:0, target=+document.getElementById("targetPct").value;
  document.getElementById("attendancePct").textContent=conducted?pct.toFixed(2)+"%":"0%";
  document.getElementById("presentCount").textContent=present;
  document.getElementById("absentCount").textContent=absent;
  document.getElementById("holidayCount").textContent=holidays;
  document.getElementById("attendanceSub").textContent=conducted?`${conducted} conducted periods`:"No classes recorded";
  const r=document.getElementById("targetResult");
  if(!conducted){r.textContent="Record some classes to see your target.";r.className="target-result";return}
  if(pct>=target){
    const miss=Math.floor(present/(target/100)-present-absent);
    r.innerHTML=`<span class="good">You are at ${pct.toFixed(2)}%.</span> You can miss approximately <b>${Math.max(0,miss)}</b> more period${miss===1?"":"s"} and stay at ${target}%.`;
  }else{
    const need=Math.ceil((target/100*conducted-present)/(1-target/100));
    r.innerHTML=`<span class="warn">You are at ${pct.toFixed(2)}%.</span> Attend the next <b>${Math.max(0,need)}</b> consecutive periods to reach ${target}%.`;
  }
}
function renderTable(){
 const labels=["","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"];
 let rows="";
 for(let d=1;d<=6;d++) timetable[d].forEach(x=>rows+=`<tr><td>${labels[d]}</td><td>${time(x[0])} – ${time(x[1])}</td><td>${x[2]}</td><td><span class="type ${x[3]}">${x[3]==="lab"?"LAB":"CLASS"}</span></td><td>${x[4]}</td></tr>`);
 document.getElementById("timetableBody").innerHTML=rows;
}
function clock(){document.getElementById("liveClock").textContent=new Date().toLocaleTimeString(undefined,{hour:"2-digit",minute:"2-digit",second:"2-digit"})}
function renderAll(){renderCalendar();renderDay();renderStats()}
renderTable();renderAll();clock();setInterval(clock,1000);

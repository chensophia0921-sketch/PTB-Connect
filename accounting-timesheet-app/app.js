const DEFAULTS = {
  staff: ['Sophia','Manager','Staff A','Staff B'],
  clients: ['Client A','Client B','Client C'],
  jobs: ['Account','文件/资料整理','培训','会议','Payroll','行政','VAT','VIES / VAT3申报','Bookkeeping','Tax Return','Company Secretarial','客户沟通','Other'],
  entries: []
};
const STORE_KEY = 'accountingTimesheetApp.v1';
let state = loadState();
let selectedStaff = null;
let selectedClient = null;
function loadState(){try{return {...DEFAULTS,...JSON.parse(localStorage.getItem(STORE_KEY))}}catch{return structuredClone(DEFAULTS)}}
function saveState(){localStorage.setItem(STORE_KEY,JSON.stringify(state));}
const $ = id => document.getElementById(id);
function today(){return new Date().toISOString().slice(0,10)}
function currentMonth(){return new Date().toISOString().slice(0,7)}
function money(n){return Number(n||0).toLocaleString(undefined,{minimumFractionDigits:2,maximumFractionDigits:2})}
function hours(n){return Number(n||0).toFixed(1)}
function escapeHtml(s=''){return String(s).replace(/[&<>'"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c]))}
function linesToArray(text){return [...new Set(text.split('\n').map(x=>x.trim()).filter(Boolean))]}
function fillSelect(el, arr){el.innerHTML='<option value="">请选择</option>'+arr.map(x=>`<option>${escapeHtml(x)}</option>`).join('')}
function fillDatalist(){ $('clientList').innerHTML = state.clients.map(c=>`<option value="${escapeHtml(c)}"></option>`).join('') }
function init(){
  $('date').value=today(); $('monthFilter').value=currentMonth(); $('staffMonth').value=currentMonth(); $('clientMonth').value=currentMonth();
  fillSelect($('staff'),state.staff); fillSelect($('job'),state.jobs); fillDatalist(); renderSettings(); renderAll();
}
function renderSettings(){ $('staffSettings').value=state.staff.join('\n'); $('clientSettings').value=state.clients.join('\n'); $('jobSettings').value=state.jobs.join('\n'); }
function filteredEntries(monthId='monthFilter'){
  const q=($('searchBox')?.value||'').toLowerCase(); const m=$(monthId)?.value;
  return state.entries.filter(e=>(!m||e.date.startsWith(m)) && (!q||[e.staff,e.client,e.job,e.details,e.notes].join(' ').toLowerCase().includes(q)));
}
function renderEntries(){
  const rows = filteredEntries();
  $('entriesTable').innerHTML = `<thead><tr><th>Date</th><th>Staff</th><th>Client</th><th>Job</th><th>Hours</th><th>Billable</th><th>Amount</th><th>Details</th><th></th></tr></thead><tbody>`+
  rows.map(e=>`<tr><td>${e.date}</td><td>${escapeHtml(e.staff)}</td><td>${escapeHtml(e.client)}</td><td>${escapeHtml(e.job)}</td><td>${hours(e.hours)}</td><td><span class="pill">${e.billable}</span></td><td>${money(e.billable==='Yes'?e.hours*e.rate:0)}</td><td>${escapeHtml(e.details)}</td><td><button class="danger" onclick="deleteEntry('${e.id}')">删除</button></td></tr>`).join('')+'</tbody>';
}
function groupBy(entries,key){return entries.reduce((a,e)=>{(a[e[key]] ||= []).push(e);return a},{})}
function summary(entries, key){return Object.entries(groupBy(entries,key)).map(([name,list])=>({name,list,total:list.reduce((s,e)=>s+Number(e.hours),0),billable:list.filter(e=>e.billable==='Yes').reduce((s,e)=>s+Number(e.hours),0),amount:list.reduce((s,e)=>s+(e.billable==='Yes'?Number(e.hours)*Number(e.rate||0):0),0)})).sort((a,b)=>b.total-a.total)}
function renderStaff(){
  const entries = state.entries.filter(e=>!$('staffMonth').value||e.date.startsWith($('staffMonth').value)); const data=summary(entries,'staff');
  $('staffCards').innerHTML = data.map(d=>`<div class="summary-card" onclick="showStaff('${escapeHtml(d.name)}')"><h3>${escapeHtml(d.name)}</h3><div class="metric"><span>Total Hours</span><b>${hours(d.total)}</b></div><div class="metric"><span>Billable Hours</span><b>${hours(d.billable)}</b></div><div class="metric"><span>Output Amount</span><b>${money(d.amount)}</b></div></div>`).join('') || '<p class="muted">本月暂无数据</p>';
  if(!selectedStaff && data[0]) selectedStaff=data[0].name; showStaff(selectedStaff,false);
}
function showStaff(name, rerender=true){ selectedStaff=name; const m=$('staffMonth').value; const rows=state.entries.filter(e=>e.staff===name && (!m||e.date.startsWith(m))); renderDetailTable('staffDetailTable',rows); if(rerender) window.scrollTo({top:0,behavior:'smooth'}); }
function renderClient(){
  const entries = state.entries.filter(e=>!$('clientMonth').value||e.date.startsWith($('clientMonth').value)); const data=summary(entries,'client');
  $('clientCards').innerHTML = data.map(d=>`<div class="summary-card" onclick="showClient('${escapeHtml(d.name)}')"><h3>${escapeHtml(d.name)}</h3><div class="metric"><span>Total Hours</span><b>${hours(d.total)}</b></div><div class="metric"><span>Billable Hours</span><b>${hours(d.billable)}</b></div><div class="metric"><span>Billing Amount</span><b>${money(d.amount)}</b></div></div>`).join('') || '<p class="muted">本月暂无数据</p>';
  if(!selectedClient && data[0]) selectedClient=data[0].name; showClient(selectedClient,false);
}
function showClient(name, rerender=true){ selectedClient=name; const m=$('clientMonth').value; const rows=state.entries.filter(e=>e.client===name && (!m||e.date.startsWith(m))); renderDetailTable('clientDetailTable',rows); if(rerender) window.scrollTo({top:0,behavior:'smooth'}); }
function renderDetailTable(id, rows){
  $(id).innerHTML = `<thead><tr><th>Date</th><th>Staff</th><th>Client</th><th>Job</th><th>Hours</th><th>Amount</th><th>Details</th></tr></thead><tbody>`+
  rows.map(e=>`<tr><td>${e.date}</td><td>${escapeHtml(e.staff)}</td><td>${escapeHtml(e.client)}</td><td>${escapeHtml(e.job)}</td><td>${hours(e.hours)}</td><td>${money(e.billable==='Yes'?e.hours*e.rate:0)}</td><td>${escapeHtml(e.details)}</td></tr>`).join('')+'</tbody>';
}
function renderAll(){renderEntries(); renderStaff(); renderClient();}
function deleteEntry(id){ if(confirm('确定删除这条记录吗？')){state.entries=state.entries.filter(e=>e.id!==id);saveState();renderAll();}}
function toCsv(rows){return rows.map(r=>r.map(v=>`"${String(v??'').replaceAll('"','""')}"`).join(',')).join('\n')}
function download(name, content, type='text/csv'){const a=document.createElement('a');a.href=URL.createObjectURL(new Blob([content],{type}));a.download=name;a.click();URL.revokeObjectURL(a.href)}
function exportEntries(){const rows=[['Date','Staff','Client','Job','Hours','Billable','Rate','Amount','Details','Notes'],...filteredEntries().map(e=>[e.date,e.staff,e.client,e.job,e.hours,e.billable,e.rate,e.billable==='Yes'?e.hours*e.rate:0,e.details,e.notes])];download('timesheet_entries.csv',toCsv(rows))}
function exportStaff(){const rows=[['Staff','Total Hours','Billable Hours','Non Billable Hours','Output Amount'],...summary(state.entries.filter(e=>!$('staffMonth').value||e.date.startsWith($('staffMonth').value)),'staff').map(d=>[d.name,d.total,d.billable,d.total-d.billable,d.amount])];download('staff_summary.csv',toCsv(rows))}
function exportClient(){const rows=[['Client','Total Hours','Billable Hours','Non Billable Hours','Billing Amount','Staff Involved'],...summary(state.entries.filter(e=>!$('clientMonth').value||e.date.startsWith($('clientMonth').value)),'client').map(d=>[d.name,d.total,d.billable,d.total-d.billable,d.amount,[...new Set(d.list.map(e=>e.staff))].join('; ')])];download('client_summary.csv',toCsv(rows))}
document.querySelectorAll('.tab').forEach(btn=>btn.addEventListener('click',()=>{document.querySelectorAll('.tab,.panel').forEach(x=>x.classList.remove('active'));btn.classList.add('active');$(btn.dataset.tab).classList.add('active');renderAll();}));
$('timesheetForm').addEventListener('submit',e=>{e.preventDefault(); const client=$('client').value.trim(); if(!state.clients.includes(client)) state.clients.push(client); const entry={id:crypto.randomUUID(),date:$('date').value,staff:$('staff').value,client,job:$('job').value,hours:Number($('hours').value),billable:$('billable').value,rate:Number($('rate').value||0),details:$('details').value.trim(),notes:$('notes').value.trim()}; state.entries.push(entry); saveState(); fillDatalist(); $('timesheetForm').reset(); $('date').value=today(); renderAll();});
$('saveSettings').addEventListener('click',()=>{state.staff=linesToArray($('staffSettings').value);state.clients=linesToArray($('clientSettings').value);state.jobs=linesToArray($('jobSettings').value);saveState();fillSelect($('staff'),state.staff);fillSelect($('job'),state.jobs);fillDatalist();alert('设置已保存')});
['searchBox','monthFilter','staffMonth','clientMonth'].forEach(id=>$(id).addEventListener('input',renderAll));
$('clearFilters').onclick=()=>{$('searchBox').value='';$('monthFilter').value='';renderAll()};
$('exportEntriesCsv').onclick=exportEntries; $('exportStaffCsv').onclick=exportStaff; $('exportClientCsv').onclick=exportClient;
$('exportBackupBtn').onclick=()=>download('timesheet_backup.json',JSON.stringify(state,null,2),'application/json');
$('importBackupInput').addEventListener('change',async e=>{const file=e.target.files[0];if(!file)return;state={...DEFAULTS,...JSON.parse(await file.text())};saveState();init();});
init();

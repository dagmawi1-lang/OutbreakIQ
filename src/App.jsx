import { useEffect, useMemo, useState } from 'react'
import { Activity, AlertTriangle, ArrowDownToLine, ArrowUpRight, BarChart3, Bell, BookOpen, BrainCircuit, CheckCircle2, ChevronDown, CircleHelp, Clock3, Database, FileUp, Globe2, LayoutDashboard, MapPinned, Menu, MessageCircle, RefreshCw, Search, ShieldCheck, SlidersHorizontal, Sparkles, Stethoscope, Upload, X } from 'lucide-react'
import { Area, AreaChart, CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { MapContainer, CircleMarker, Popup, TileLayer, useMap } from 'react-leaflet'
import { analyzeRows, summarize } from './data/analysis'
import { demoRows, demoMetadata } from './data/demo'
import { importCsv } from './data/normalize'

const stateCoords = {
  Alabama:[32.8,-86.8], Alaska:[64.2,-152], Arizona:[34.2,-111.7], Arkansas:[34.8,-92.2], California:[36.8,-119.4], Colorado:[39,-105.5], Connecticut:[41.6,-72.7], Delaware:[39,-75.4], Florida:[27.8,-81.7], Georgia:[32.7,-83.4], Hawaii:[20.8,-156.3], Idaho:[44.2,-114.4], Illinois:[40,-89.2], Indiana:[40,-86.1], Iowa:[42.1,-93.5], Kansas:[38.5,-98], Kentucky:[37.5,-85.3], Louisiana:[31,-92], Maine:[45.3,-69], Maryland:[39,-76.7], Massachusetts:[42.3,-71.8], Michigan:[44.3,-85.5], Minnesota:[46,-94.5], Mississippi:[32.7,-89.7], Missouri:[38.5,-92.5], Montana:[47,-109.6], Nebraska:[41.5,-99.8], Nevada:[39.3,-116.6], 'New Hampshire':[43.8,-71.6], 'New Jersey':[40.1,-74.5], 'New Mexico':[34.5,-106], 'New York':[42.9,-75], 'North Carolina':[35.5,-79.4], 'North Dakota':[47.5,-100.5], Ohio:[40.4,-82.8], Oklahoma:[35.6,-97.5], Oregon:[44,-120.5], Pennsylvania:[41,-77.5], 'Rhode Island':[41.6,-71.5], 'South Carolina':[33.8,-80.9], 'South Dakota':[44.5,-100], Tennessee:[35.8,-86.3], Texas:[31,-99], Utah:[39.3,-111.7], Vermont:[44,-72.7], Virginia:[37.5,-79], Washington:[47.4,-120.5], 'West Virginia':[38.6,-80.6], Wisconsin:[44.5,-89.5], Wyoming:[43,-107.5], 'New York City':[40.71,-74]
}
const fmt = n => Number(n || 0).toLocaleString('en-US')
const shortDate = row => row ? `MMWR ${row.week}, ${row.year}` : 'No reporting period'

function MapView({ rows, selectedLocation, onSelect }) {
  const grouped = useMemo(() => {
    const totals = new Map()
    for (const row of rows) {
      if (row.cases === null || row.cases === undefined) continue
      totals.set(row.location, (totals.get(row.location) || 0) + Number(row.cases))
    }
    return [...totals.entries()].map(([location, total]) => ({ location, total, coords: stateCoords[location] })).filter(x => x.coords)
  }, [rows])
  const max = Math.max(1, ...grouped.map(x => x.total))
  return <div className="mapWrap"><MapContainer center={[38.8,-96]} zoom={3.5} scrollWheelZoom={false} zoomControl={true}>
    <TileLayer attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>' url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
    {grouped.map(item => <CircleMarker key={item.location} center={item.coords} radius={7 + (item.total / max) * 14} pathOptions={{ color: selectedLocation === item.location ? '#c5ff72' : '#54c9b4', fillColor: selectedLocation === item.location ? '#c5ff72' : '#54c9b4', fillOpacity: .48, weight: 2 }} eventHandlers={{ click: () => onSelect(item.location) }}><Popup><strong>{item.location}</strong><br/>{fmt(item.total)} reported cases in selected view<br/><button className="mapPopupBtn" onClick={() => onSelect(item.location)}>Filter this location</button></Popup></CircleMarker>)}
  </MapContainer><div className="mapLegend"><span><i className="legendDot"/> Reported cases</span><span>Circle size represents total count</span></div></div>
}

function App() {
  const [rows, setRows] = useState(demoRows)
  const [metadata, setMetadata] = useState(demoMetadata)
  const [dataMode, setDataMode] = useState('demo')
  const [loading, setLoading] = useState(false)
  const [loadError, setLoadError] = useState('')
  const [disease, setDisease] = useState('All conditions')
  const [location, setLocation] = useState('All locations')
  const [period, setPeriod] = useState('all')
  const [activeNav, setActiveNav] = useState('Overview')
  const [mobileMenu, setMobileMenu] = useState(false)
  const [question, setQuestion] = useState('What are the strongest signals in this dataset?')
  const [answer, setAnswer] = useState('')
  const [assistantMode, setAssistantMode] = useState('')
  const [asking, setAsking] = useState(false)
  const [showMethod, setShowMethod] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [includeAggregates, setIncludeAggregates] = useState(false)
  const [importNote, setImportNote] = useState('')

  const diseases = useMemo(() => ['All conditions', ...new Set(rows.map(r => r.disease).filter(Boolean).sort())], [rows])
  const locations = useMemo(() => ['All locations', ...new Set(rows.map(r => r.location).filter(Boolean).sort())], [rows])
  const aggregateCount = useMemo(() => rows.filter(r => r.aggregate).length, [rows])
  const filteredRows = useMemo(() => rows.filter(r => (disease === 'All conditions' || r.disease === disease) && (location === 'All locations' ? (includeAggregates || !r.aggregate) : r.location === location)), [rows, disease, location, includeAggregates])
  const periodRows = useMemo(() => {
    if (period === 'latest') {
      const latest = [...filteredRows].sort((a,b) => b.year-a.year || b.week-a.week)[0]
      return latest ? filteredRows.filter(r => r.year === latest.year && r.week === latest.week) : []
    }
    if (period === 'recent') {
      const ordered = [...filteredRows].sort((a,b) => b.year-a.year || b.week-a.week)
      const cutoff = ordered[0]
      if (!cutoff) return []
      return filteredRows.filter(r => (cutoff.year * 53 + cutoff.week) - (r.year * 53 + r.week) < 12)
    }
    return filteredRows
  }, [filteredRows, period])
  const anomalies = useMemo(() => analyzeRows(filteredRows), [filteredRows])
  const summary = useMemo(() => summarize(periodRows, anomalies), [periodRows, anomalies])
  const trend = useMemo(() => {
    const totals = new Map()
    for (const row of filteredRows) {
      const key = `${row.year}-W${String(row.week).padStart(2,'0')}`
      const item = totals.get(key) || { period: `W${row.week}`, year: row.year, week: row.week, cases: 0, rows: 0 }
      if (row.cases !== null && row.cases !== undefined) { item.cases += Number(row.cases); item.rows += 1 }
      totals.set(key, item)
    }
    return [...totals.values()].sort((a,b) => a.year-b.year || a.week-b.week).slice(-26)
  }, [filteredRows])
  const topAnomalies = anomalies.slice(0, 6)

  async function loadCdc() {
    setLoading(true); setLoadError('')
    try {
      const response = await fetch('/api/surveillance?refresh=true')
      const payload = await response.json()
      if (!response.ok) throw new Error(payload.error || 'CDC data could not be loaded.')
      setImportNote(''); setRows(payload.rows); setMetadata(payload); setDataMode('cdc'); setDisease('All conditions'); setLocation('All locations'); setPeriod('all')
    } catch (error) { setLoadError(`${error.message} The dashboard remains usable with clearly labeled synthetic demo data.`) }
    finally { setLoading(false) }
  }
  function useDemo() { setImportNote(''); setRows(demoRows); setMetadata(demoMetadata); setDataMode('demo'); setDisease('All conditions'); setLocation('All locations'); setLoadError('') }
  function parseCsv(text) {
    const result = importCsv(text)
    if (result.error) throw new Error(result.error)
    setRows(result.rows); setMetadata({source:'User-imported CSV',sourceUrl:null,provisional:true,fetchedAt:new Date().toISOString()}); setDataMode('upload'); setDisease('All conditions'); setLocation('All locations'); setPeriod('all'); setLoadError('')
    setImportNote(`Imported ${result.rows.length.toLocaleString('en-US')} rows.` + (result.skipped ? ` Skipped ${result.skipped.toLocaleString('en-US')} invalid row${result.skipped===1?'':'s'} (first at line ${result.problemLines.join(', ')}).` : '') + (result.truncated ? ' Only the first 50,000 rows were loaded.' : ''))
  }
  async function uploadCsv(file) { if (!file) return; if (file.size > 25_000_000) { setLoadError('That file is larger than 25 MB. Filter it to the conditions and years you need first.'); return } try { parseCsv(await file.text()) } catch(e) { setImportNote(''); setLoadError(e.message) } }
  async function askAssistant() {
    setAsking(true); setAnswer('')
    try {
      const response = await fetch('/api/assistant', { method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify({ question, context:{ rows:filteredRows.slice(-300), anomalies:topAnomalies.slice(0,6), disease, location, source:metadata.source } }) })
      const payload=await response.json(); if(!response.ok) throw new Error(payload.error||'Assistant unavailable.')
      setAnswer(payload.answer); setAssistantMode(payload.mode)
    } catch(e) { setAnswer(`The explanation service is unavailable: ${e.message}. You can still inspect the calculated trends and anomaly table.`); setAssistantMode('Unavailable') }
    finally { setAsking(false) }
  }
  function exportCsv() {
    const cols=['disease','location','year','week','cases','cumulative','source']
    const csv=[cols.join(','),...filteredRows.map(r=>cols.map(c=>`"${String(r[c]??'').replaceAll('"','""')}"`).join(','))].join('\n')
    const url=URL.createObjectURL(new Blob([csv],{type:'text/csv'})); const a=document.createElement('a');a.href=url;a.download='outbreakiq-observations.csv';a.click();URL.revokeObjectURL(url)
  }

  const navItems=[['Overview',LayoutDashboard],['Surveillance map',MapPinned],['Trend analysis',BarChart3],['Anomaly monitor',AlertTriangle],['AI research assistant',BrainCircuit],['Data sources',Database]]
  function navClick(label){setActiveNav(label);setMobileMenu(false);if(label==='AI research assistant')document.getElementById('assistant')?.scrollIntoView({behavior:'smooth'});else if(label==='Anomaly monitor')document.getElementById('anomalies')?.scrollIntoView({behavior:'smooth'});else if(label==='Surveillance map')document.getElementById('map')?.scrollIntoView({behavior:'smooth'});else if(label==='Trend analysis')document.getElementById('trend')?.scrollIntoView({behavior:'smooth'});else if(label==='Data sources')document.getElementById('sources')?.scrollIntoView({behavior:'smooth'});else window.scrollTo({top:0,behavior:'smooth'})}

  return <div className="appShell">
    <aside className={`sidebar ${mobileMenu?'open':''}`}>
      <div className="brand"><div className="brandIcon"><Activity size={22}/></div><div><strong>Outbreak<span>IQ</span></strong><small>PUBLIC HEALTH INTELLIGENCE</small></div><button className="mobileClose" onClick={()=>setMobileMenu(false)}><X size={18}/></button></div>
      <div className="workspaceLabel">WORKSPACE</div>
      <nav>{navItems.map(([label,Icon])=><button key={label} className={`navItem ${activeNav===label?'active':''}`} onClick={()=>navClick(label)}><Icon size={17}/><span>{label}</span>{label==='Anomaly monitor'&&<b>{anomalies.length}</b>}</button>)}</nav>
      <div className="sidebarBottom"><div className="safeCard"><ShieldCheck size={17}/><div><strong>Evidence first</strong><p>Signals are not diagnoses or confirmed outbreaks.</p></div></div><div className="userMini"><div className="avatar">OI</div><div><strong>Research workspace</strong><small>Student prototype · v0.3</small></div><ChevronDown size={15}/></div></div>
    </aside>
    {mobileMenu&&<button className="scrim" aria-label="Close menu" onClick={()=>setMobileMenu(false)}/>}
    <main className="mainArea">
      <header className="topbar"><div className="topLeft"><button className="menuBtn" onClick={()=>setMobileMenu(true)}><Menu size={19}/></button><div className="breadcrumb">Workspace <span>/</span> <strong>{activeNav}</strong></div></div><div className="topRight"><div className={`sourcePill ${dataMode==='cdc'?'live':''}`}><span className="pulse"/>{dataMode==='cdc'?'CDC DATA CONNECTED':dataMode==='upload'?'CSV IMPORTED':'DEMO DATA'}</div><button className="iconButton" title="Data source information" onClick={()=>document.getElementById('sources')?.scrollIntoView({behavior:'smooth'})}><CircleHelp size={17}/></button><div className="topAvatar">OI</div></div></header>
      <div className="contentWrap">
        <section className="pageHeading"><div><div className="eyebrow"><span className="eyebrowLine"/> PUBLIC HEALTH SURVEILLANCE PLATFORM</div><h1>Intelligence <em>overview</em></h1><p>Explore reported disease trends, review statistical signals, and understand the evidence behind each observation.</p></div><div className="headingActions"><button className="btn secondary" onClick={exportCsv}><ArrowDownToLine size={16}/> Export data</button><button className="btn primary" onClick={loadCdc} disabled={loading}>{loading?<RefreshCw className="spin" size={16}/>:<RefreshCw size={16}/>} {loading?'Connecting…':'Load live CDC data'}</button></div></section>
        <div className={`dataNotice ${dataMode==='cdc'?'noticeLive':''}`}><div className="noticeIcon"><Database size={17}/></div><div><strong>{dataMode==='cdc'?'CDC NNDSS provisional weekly data':dataMode==='upload'?'User-imported surveillance data':'Demonstration environment'}</strong><p>{dataMode==='cdc'?'Connected to the CDC NNDSS Weekly Data catalog. Weekly counts are provisional and may be revised.':dataMode==='upload'?'These records were imported from a CSV file. Verify field definitions and reporting completeness before interpretation.':'The current charts use synthetic observations to demonstrate the interface and analysis. They are not real disease reports.'}</p></div><button className="textAction" onClick={()=>setShowMethod(true)}>Data notes <ArrowUpRight size={14}/></button></div>
        {loadError&&<div className="errorNotice"><AlertTriangle size={17}/><span>{loadError}</span><button onClick={()=>setLoadError('')}><X size={15}/></button></div>}
        <section className="filterBar"><div className="filterTitle"><SlidersHorizontal size={16}/> <strong>Explore data</strong></div><label><span>Condition</span><select value={disease} onChange={e=>setDisease(e.target.value)}>{diseases.map(x=><option key={x}>{x}</option>)}</select></label><label><span>Reporting area</span><select value={location} onChange={e=>setLocation(e.target.value)}>{locations.map(x=><option key={x}>{x}</option>)}</select></label><label><span>Time window</span><select value={period} onChange={e=>setPeriod(e.target.value)}><option value="all">All available</option><option value="recent">Latest 12 weeks</option><option value="latest">Latest reporting week</option></select></label>{aggregateCount>0&&<label className="aggToggle" title="National, regional, and residency totals already include state counts"><input type="checkbox" checked={includeAggregates} onChange={e=>setIncludeAggregates(e.target.checked)}/><span>Include national/regional totals</span></label>}<button className="clearFilters" onClick={()=>{setDisease('All conditions');setLocation('All locations');setPeriod('all');setIncludeAggregates(false)}}>Reset</button></section>
        {importNote&&<div className="importNote" role="status"><Upload size={15}/><span>{importNote}</span><button aria-label="Dismiss" onClick={()=>setImportNote('')}><X size={14}/></button></div>}
        <section className="statsGrid">
          <Stat icon={Database} label="Observations" value={fmt(summary.observations)} sub="In selected view" tone="mint"/>
          <Stat icon={Stethoscope} label="Conditions" value={fmt(summary.diseases)} sub="Distinct conditions" tone="blue"/>
          <Stat icon={Globe2} label="Reporting areas" value={fmt(summary.locations)} sub="Geographies represented" tone="purple"/>
          <Stat icon={AlertTriangle} label="Statistical signals" value={fmt(anomalies.length)} sub="Require further review" tone="amber"/>
        </section>
        <section className="gridMain">
          <div className="panel trendPanel" id="trend"><div className="panelHeader"><div><div className="sectionKicker">WEEKLY REPORTING</div><h2>Reported case trends</h2><p>Aggregated reported counts across the selected conditions and locations.</p></div><span className="panelTag"><Activity size={13}/> Time series</span></div><div className="chartMeta"><div><strong>{fmt(trend.reduce((s,x)=>s+x.cases,0))}</strong><span>reported observations in chart</span></div><div className="chartLegend"><i/> Reported cases</div></div><div className="chartBox"><ResponsiveContainer width="100%" height="100%"><AreaChart data={trend} margin={{top:12,right:12,left:-14,bottom:0}}><defs><linearGradient id="trendFill" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#54c9b4" stopOpacity={.28}/><stop offset="95%" stopColor="#54c9b4" stopOpacity={0}/></linearGradient></defs><CartesianGrid stroke="#24343d" strokeDasharray="3 5" vertical={false}/><XAxis dataKey="period" tick={{fill:'#73838c',fontSize:11}} axisLine={false} tickLine={false}/><YAxis tick={{fill:'#73838c',fontSize:11}} axisLine={false} tickLine={false}/><Tooltip contentStyle={{background:'#101e27',border:'1px solid #2a414b',borderRadius:12,color:'#edf4f4'}} labelStyle={{color:'#a8bac1'}} formatter={v=>[fmt(v),'Reported cases']}/><Area type="monotone" dataKey="cases" stroke="#54c9b4" strokeWidth={2.5} fill="url(#trendFill)" activeDot={{r:5,fill:'#c5ff72',stroke:'#0b171f',strokeWidth:2}}/></AreaChart></ResponsiveContainer></div><div className="chartFoot"><span><Clock3 size={13}/> Reporting period: MMWR week</span><span>{trend.length} time points shown</span></div></div>
          <div className="panel assistantPanel" id="assistant"><div className="assistantHead"><div className="aiMark"><BrainCircuit size={19}/></div><div><div className="sectionKicker">OUTBREAKIQ EXPLAIN</div><h2>Research assistant</h2></div><span className="onlineDot"/></div><p className="assistantIntro">Ask questions about the selected data. Explanations are grounded in the visible analysis and avoid clinical conclusions.</p><div className="suggestionChips"><button onClick={()=>setQuestion('What are the strongest signals in this dataset?')}>Strongest signals</button><button onClick={()=>setQuestion('Explain the current trend and its limitations.')}>Explain this trend</button></div><label className="questionLabel" htmlFor="assistantQuestion">YOUR QUESTION</label><textarea id="assistantQuestion" value={question} onChange={e=>setQuestion(e.target.value)} rows={3} placeholder="Ask about the data…"/><button className="askButton" onClick={askAssistant} disabled={asking||!question.trim()}>{asking?<RefreshCw size={15} className="spin"/>:<Sparkles size={15}/>} {asking?'Analyzing…':'Generate explanation'}</button>{answer&&<div className="answerBox"><div className="answerMeta"><span><Sparkles size={13}/> {assistantMode||'Evidence explanation'}</span><span>Grounded in current view</span></div><p>{answer}</p></div>}<div className="assistantDisclaimer"><ShieldCheck size={14}/> Not a diagnostic or outbreak-confirmation tool.</div></div>
        </section>
        <section className="gridMap"><div className="panel mapPanel" id="map"><div className="panelHeader"><div><div className="sectionKicker">GEOGRAPHIC DISTRIBUTION</div><h2>Surveillance map</h2><p>Select a marker to filter the dashboard by reporting area.</p></div><span className="panelTag"><MapPinned size={13}/> US jurisdictions</span></div><MapView rows={periodRows} selectedLocation={location==='All locations'?null:location} onSelect={setLocation}/></div><div className="panel anomalyPanel" id="anomalies"><div className="panelHeader"><div><div className="sectionKicker">STATISTICAL REVIEW QUEUE</div><h2>Signals to review</h2><p>Largest deviations from recent baselines.</p></div><span className="countBadge">{anomalies.length}</span></div><div className="anomalyList">{topAnomalies.length?topAnomalies.map((item,i)=><div className="anomalyItem" key={item.id||`${item.disease}-${item.location}-${item.week}`}><div className={`signalIcon ${item.level==='High signal'?'high':''}`}><AlertTriangle size={15}/></div><div className="anomalyInfo"><strong>{item.disease}</strong><span>{item.location} · {shortDate(item)}</span><small>{fmt(item.cases)} reported · baseline {fmt(item.baseline)}</small></div><div className="zScore"><strong>{item.zScore}σ</strong><small>{item.level}</small></div></div>):<div className="emptyState"><CheckCircle2 size={22}/><strong>No signals in this view</strong><p>No observations currently meet the selected statistical threshold.</p></div>}</div><button className="panelLink" onClick={()=>setShowMethod(true)}>How signals are calculated <ArrowUpRight size={14}/></button></div></section>
        <section className="panel tablePanel"><div className="panelHeader"><div><div className="sectionKicker">OBSERVATION EXPLORER</div><h2>Recent reported observations</h2><p>Review the most recent rows in the selected dataset.</p></div><div className="tableActions"><div className="searchBox"><Search size={14}/><input value={searchTerm} onChange={e=>setSearchTerm(e.target.value)} placeholder="Search condition or area"/></div><label className="uploadBtn"><FileUp size={15}/> Import CSV<input type="file" accept=".csv,text/csv" onChange={e=>e.target.files?.[0]&&uploadCsv(e.target.files[0])}/></label></div></div><div className="tableScroll"><table><thead><tr><th>CONDITION</th><th>REPORTING AREA</th><th>MMWR PERIOD</th><th>REPORTED CASES</th><th>DATA STATUS</th></tr></thead><tbody>{[...periodRows].filter(r=>`${r.disease} ${r.location}`.toLowerCase().includes(searchTerm.toLowerCase())).sort((a,b)=>b.year-a.year||b.week-a.week).slice(0,10).map((r,i)=><tr key={r.id||i}><td><strong>{r.disease}</strong></td><td>{r.location}</td><td>Week {r.week}, {r.year}</td><td className="numeric">{r.cases===null?'Not reported':fmt(r.cases)}</td><td><span className={`status ${r.provisional?'provisional':'demo'}`}>{r.provisional?'Provisional':'Demo only'}</span></td></tr>)}</tbody></table>{!periodRows.length&&<div className="emptyTable">No rows match the selected filters.</div>}</div><div className="tableFooter"><span>Showing up to 10 observations · {fmt(periodRows.length)} total in view</span><button onClick={exportCsv}>Download filtered CSV <ArrowDownToLine size={14}/></button></div></section>
        <section className="sourceFooter" id="sources"><div><div className="footerIcon"><Database size={18}/></div><div><strong>Data provenance matters.</strong><p>CDC NNDSS weekly counts are provisional, subject to revision, and should not be interpreted as population-adjusted rates.</p></div></div><a href="https://data.cdc.gov/d/x9gk-5huc" target="_blank" rel="noreferrer">CDC dataset <ArrowUpRight size={14}/></a><a href="https://www.cdc.gov/nndss/infectious-disease/" target="_blank" rel="noreferrer">CDC interpretation guide <ArrowUpRight size={14}/></a></section>
        <footer className="footer">OUTBREAKIQ · STUDENT RESEARCH PROTOTYPE <span>Built for responsible exploration of public health data.</span></footer>
      </div>
    </main>
    {showMethod&&<div className="modalBackdrop" onClick={()=>setShowMethod(false)}><div className="modal" onClick={e=>e.stopPropagation()}><div className="modalHeader"><div><div className="sectionKicker">METHODOLOGY & LIMITATIONS</div><h2>How to interpret OutbreakIQ</h2></div><button onClick={()=>setShowMethod(false)}><X size={18}/></button></div><div className="modalBody"><h3>Data status</h3><p>CDC NNDSS weekly observations are provisional and may change as jurisdictions reconcile reports. Missing, suppressed, unavailable, or non-reportable values are not treated as zero.</p><h3>Anomaly detection</h3><p>The prototype compares each observation with up to eight preceding observations for the same condition and reporting area. It requires at least four prior values and flags values at least two standard deviations above the rolling mean. This is a simple screening heuristic, not a validated epidemiological model.</p><h3>Important limitations</h3><ul><li>Reported counts are not population-adjusted incidence rates.</li><li>Reporting delays, revisions, jurisdiction coverage, and small counts can affect comparisons.</li><li>An anomaly is not proof of an outbreak, cause, or transmission event.</li><li>OutbreakIQ is not a diagnostic, treatment, or emergency decision tool.</li><li>Demo data are synthetic and must never be cited as observed disease statistics.</li></ul><h3>Sources</h3><p><a href="https://data.cdc.gov/d/x9gk-5huc" target="_blank" rel="noreferrer">CDC NNDSS Weekly Data</a> · <a href="https://www.cdc.gov/nndss/infectious-disease/" target="_blank" rel="noreferrer">CDC NNDSS data tables and guidance</a></p></div><button className="btn primary modalDone" onClick={()=>setShowMethod(false)}>I understand</button></div></div>}
  </div>
}
function Stat({icon:Icon,label,value,sub,tone}){return <div className="statCard"><div className={`statIcon ${tone}`}><Icon size={18}/></div><div className="statText"><span>{label}</span><strong>{value}</strong><small>{sub}</small></div><ArrowUpRight className="statArrow" size={15}/></div>}
export default App

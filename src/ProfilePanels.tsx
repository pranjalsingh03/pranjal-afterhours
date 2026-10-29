import { useRef, useState, type KeyboardEvent } from 'react';
import { ArrowLeft, ArrowRight, ArrowUpRight, Code, Envelope, GraduationCap, Terminal } from '@phosphor-icons/react';
import { capabilities, caseNotes, evaluation, experience, metrics, philosophy, profile, story, workingStyle } from './content';

const sections=['Profile','Experience','Stack','AI & craft','My story'] as const;
type Section=typeof sections[number];
export function Tags({items}:{items:string[]}) {return <div className="skill-tags">{items.map(item=><span key={item}>{item}</span>)}</div>;}

function Profile() {
  return <article className="document-content profile-content">
    <span className="document-label">A LITTLE INTRODUCTION</span>
    <h2>A human behind<br/>the pixels.</h2>
    <p className="document-lead">{profile.intro}</p>
    <p>{profile.about}</p>
    <div className="professional-identity"><strong>{profile.role}</strong><span><i className="tiny-dot"/>{profile.location} · {profile.availability}</span></div>
    <p>{profile.professionalSummary}</p><p>{profile.focus}</p>
    <div className="profile-metrics">{metrics.map(metric=><div key={metric.label}><strong>{metric.value}</strong><span>{metric.label}</span><small>{metric.detail}</small></div>)}</div>
    <div className="education-card"><GraduationCap size={25} weight="duotone"/><div><span className="document-label">EDUCATION / {profile.education.period}</span><h3>{profile.education.degree}</h3><p>{profile.education.university}</p></div></div>
    <div className="paper-callout">“Stay curious. Make something. Keep going.”</div>
    <h3>Things I enjoy working with</h3><Tags items={profile.skills}/>
    <section className="personal-philosophy"><span className="document-label">MORE THAN CODE</span><h3>A line I keep close.</h3><blockquote lang="sa">{philosophy.quote}</blockquote><p>{philosophy.meaning}</p>{philosophy.principles.map(item=><div className="principle" key={item.title}><h3>{item.title}</h3><p>{item.body}</p></div>)}</section>
  </article>;
}
function Experience() {
  return <article className="document-content experience-content"><span className="document-label">THE CAREER JOURNEY</span><h2>Built in the<br/>real world.</h2><p>2+ years taking ownership of production web, mobile, and AI systems across fintech and AI-SaaS.</p>
    <div className="career-timeline">{experience.map(job=><section className="career-entry" key={job.company}>
      <div className="career-meta"><span>{job.period}</span>{job.current&&<span className="current-role"><i className="tiny-dot"/>CURRENT</span>}</div>
      <h3>{job.company}</h3><p className="career-role">{job.role}<span>{job.sector}</span></p><p>{job.summary}</p>
      <ul className="detail-bullets">{job.highlights.map(point=><li key={point}>{point}</li>)}</ul><Tags items={job.stack}/>
    </section>)}</div>
    <div className="education-card"><GraduationCap size={25} weight="duotone"/><div><span className="document-label">{profile.education.period}</span><h3>{profile.education.degree}</h3><p>{profile.education.university}</p></div></div>
  </article>;
}
function Stack() {
  return <article className="document-content"><span className="document-label">CAPABILITIES & TOOLKIT</span><h2>What I build.<br/>What I build with.</h2><p>Full-stack engineering, mobile products, AI systems, workflow automations, and the infrastructure underneath.</p><div className="capability-list">{capabilities.map((item,index)=><section key={item.title}><span className="capability-index">0{index+1} / CAPABILITY</span><h3>{item.title}</h3><p>{item.description}</p><Tags items={item.stack}/></section>)}</div></article>;
}
function Craft() {
  return <article className="document-content craft-content"><span className="document-label">AI × EVALUATION / ENGINEERING NOTES</span><h2>Build it.<br/>Then prove it works.</h2>
    <div className="craft-heading"><Terminal size={25} weight="duotone"/><h3>{evaluation.title}</h3></div><p>{evaluation.description}</p><Tags items={evaluation.stack}/>
    <h3>The verification loop</h3><ol className="verification-loop">{evaluation.loop.map(step=><li key={step}>{step}</li>)}</ol>
    <section className="case-notes"><span className="document-label">SELECTED CASE NOTES</span><h3>How the work works.</h3>{caseNotes.map((note,index)=><details key={note.title}><summary><span>0{index+1}</span>{note.title}</summary><p>{note.body}</p><Tags items={note.tags}/></details>)}</section>
    <section className="working-style"><span className="document-label">WORKING STYLE</span><h3>Build. Ship. Learn.</h3><p>Direct, iterative, and practical: enough structure to avoid chaos, with a clear path to shipping.</p>{workingStyle.map((step,index)=><div key={step.step}><span>0{index+1} / {step.step.toUpperCase()}</span><h3>{step.title}</h3><p>{step.body}</p></div>)}</section>
  </article>;
}
function Story({onContact}:{onContact:()=>void}) {
  const [chapter,setChapter]=useState(0);const current=story[chapter];
  return <article className="document-content story-content"><span className="document-label">THE STORY SO FAR / 8 CHAPTERS</span><h2>Every build<br/>has a beginning.</h2><div className="story-chapters" role="group" aria-label="Story chapters">{story.map((item,index)=><button key={item.tick} aria-pressed={index===chapter} aria-label={`Chapter ${index+1}: ${item.tick}`} onClick={()=>setChapter(index)}><span>{String(index+1).padStart(2,'0')}</span>{item.tick}</button>)}</div>
    <section className="story-card" aria-live="polite"><span className="document-label">CHAPTER {String(chapter+1).padStart(2,'0')} / {current.label.toUpperCase()}</span><h3>{current.title}</h3><p>{current.body}</p><div className="story-facts">{current.facts.map(fact=><span key={fact}>{fact}</span>)}</div><Tags items={current.stack}/>{chapter===story.length-1&&<button className="os-primary story-contact" onClick={onContact}><Envelope size={16}/>Write the next chapter<ArrowUpRight size={15}/></button>}</section>
    <div className="story-navigation"><button className="text-action" disabled={chapter===0} onClick={()=>setChapter(index=>Math.max(0,index-1))}><ArrowLeft size={14}/>Previous chapter</button><span>{chapter+1} / {story.length}</span><button className="text-action" disabled={chapter===story.length-1} onClick={()=>setChapter(index=>Math.min(story.length-1,index+1))}>Next chapter<ArrowRight size={14}/></button></div>
  </article>;
}

export function AboutApp({onContact}:{onContact:()=>void}) {
  const [section,setSection]=useState<Section>('Profile');const root=useRef<HTMLDivElement>(null);
  const select=(next:Section)=>{setSection(next);root.current?.closest('.window-content')?.scrollTo({top:0});};
  const keydown=(event:KeyboardEvent<HTMLDivElement>)=>{
    if(!['ArrowLeft','ArrowRight','Home','End'].includes(event.key))return;
    event.preventDefault();let index=sections.indexOf(section);
    index=event.key==='Home'?0:event.key==='End'?sections.length-1:(index+(event.key==='ArrowLeft'?-1:1)+sections.length)%sections.length;
    select(sections[index]);(event.currentTarget.querySelectorAll<HTMLButtonElement>('[role="tab"]')[index])?.focus();
  };
  return <div className="about-app" ref={root}><div className="about-tabs" role="tablist" aria-label="About Pranjal" onKeyDown={keydown}>{sections.map((name,index)=><button role="tab" key={name} id={`profile-tab-${index}`} aria-selected={section===name} aria-controls="profile-panel" tabIndex={section===name?0:-1} onClick={()=>select(name)}>{name}</button>)}</div><section id="profile-panel" role="tabpanel" aria-labelledby={`profile-tab-${sections.indexOf(section)}`}>
    {section==='Profile'?<Profile/>:section==='Experience'?<Experience/>:section==='Stack'?<Stack/>:section==='AI & craft'?<Craft/>:<Story onContact={onContact}/>}
  </section><div className="profile-endnote"><Code size={13}/><span>A little curiosity. A lot of ownership.</span></div></div>;
}

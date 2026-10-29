import { capabilities, evaluation, experience, profile, projects } from './content';

export function buildResumeText() {
  const lines=[
    profile.name.toUpperCase(), profile.role, profile.location,
    `Email: ${profile.email}`,`LinkedIn: ${profile.linkedin}`,`GitHub: ${profile.github}`,`Portfolio: ${profile.website}`,
    '', 'PROFILE', profile.professionalSummary, profile.focus,
    '', 'EDUCATION', `${profile.education.degree} | ${profile.education.university} | ${profile.education.period}`,
    '', 'EXPERIENCE',
  ];
  for(const job of experience){lines.push('',`${job.company} | ${job.period}`,`${job.role} | ${job.sector}`,job.summary,...job.highlights.map(point=>`- ${point}`),`Stack: ${job.stack.join(', ')}`);}
  lines.push('','CAPABILITIES & SKILLS');
  for(const item of capabilities)lines.push('',item.title,item.description,item.stack.join(', '));
  lines.push('','SELECTED PROJECTS');
  for(const project of projects.filter(item=>!item.concept))lines.push('',project.fullTitle,project.description,...project.highlights.map(point=>`- ${point}`),`Stack: ${project.stack.join(', ')}`,project.url??'Interactive 3D portfolio — the website you are exploring.');
  lines.push('','AI EVALUATION',evaluation.description,`Verification: ${evaluation.loop.join(' → ')}`,'','ENGINEERING ACTIVITY','100,000+ e-banking users | 900+ WakaTime hours, Top 4% of 500,000+ developers | 483-day GitHub streak | OmniTutor: 800+ learners in 15 days, +35% 30-day retention.','','Availability: '+profile.availability,'','Compiled from my published portfolio and current Afterhours build.');
  return lines.join('\n')+'\n';
}

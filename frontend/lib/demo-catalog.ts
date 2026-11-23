// Sample catalogue for the local demo only (see lib/demo.ts). Organisations and listings are
// fictional and marked "(sample)"; nothing here is shown by a production build.
import type { Assessment, Course, Opportunity, TaxonomySkill } from './talent';

const D = {
  ran: 'RF / RAN & 5G', fibre: 'Fibre & transmission', ip: 'IP networking & NOC',
  field: 'Field deployment & power', sec: 'Cybersecurity & cloud', auto: 'Automation & applied AI',
};

export const TAXONOMY: TaxonomySkill[] = [
  ['RF planning', D.ran], ['4G/5G RAN fundamentals', D.ran], ['Drive testing', D.ran], ['Antenna installation', D.ran],
  ['Fusion splicing', D.fibre], ['OTDR testing', D.fibre], ['FTTH installation', D.fibre], ['DWDM fundamentals', D.fibre],
  ['IP routing & switching', D.ip], ['Network monitoring (NOC)', D.ip], ['Linux administration', D.ip], ['Troubleshooting', D.ip],
  ['Site safety', D.field], ['Tower climbing certification', D.field], ['DC power systems', D.field], ['Site surveys', D.field],
  ['Network security', D.sec], ['Cloud networking', D.sec], ['Incident response', D.sec], ['Containers', D.sec],
  ['Python scripting', D.auto], ['Network automation', D.auto], ['SQL for analysis', D.auto], ['Data dashboards', D.auto],
].map(([name, domain], i) => ({ id: `sk-${i + 1}`, name, domain }));

export const ASSESSMENTS: Assessment[] = [
  { id: 'as-fibre', title: 'Fibre Optic Splicing & OTDR Basics', domain: D.fibre, skills: ['Fusion splicing', 'OTDR testing'], minutes: 30, questions: 25, format: 'Online diagnostic' },
  { id: 'as-ran', title: 'RF / 5G RAN Fundamentals', domain: D.ran, skills: ['4G/5G RAN fundamentals', 'RF planning'], minutes: 30, questions: 25, format: 'Online diagnostic' },
];

const days = (n: number) => new Date(Date.now() - n * 86400000).toISOString();

export const OPPORTUNITIES: Omit<Opportunity, 'applied'>[] = [
  { id: 'op-1', title: 'Junior Network Technician', organization: 'Northwind Networks (sample)', location: 'Lagos', type: 'FULL_TIME', workMode: 'ON_SITE',
    skills: ['IP routing & switching', 'Troubleshooting', 'Linux administration', 'Site safety'], summary: 'Support core network operations and first-line fault resolution for a metro network.', postedAt: days(2) },
  { id: 'op-2', title: 'Fibre Splicing Technician', organization: 'Lightpath Infra (sample)', location: 'Abuja', type: 'FIELD_DEPLOYMENT', workMode: 'ON_SITE',
    skills: ['Fusion splicing', 'OTDR testing', 'FTTH installation', 'Site safety'], summary: 'Six-week FTTH rollout across new estates. Safety briefing provided on day one.', postedAt: days(4) },
  { id: 'op-3', title: 'NOC Analyst Intern', organization: 'Sahel Telecom (sample)', location: 'Lagos', type: 'INTERNSHIP', workMode: 'HYBRID',
    skills: ['Network monitoring (NOC)', 'Troubleshooting', 'Linux administration'], summary: 'Three-month internship monitoring alarms and escalating incidents with a senior analyst.', postedAt: days(6) },
  { id: 'op-4', title: 'RF Drive Test Engineer', organization: 'Waveline Services (sample)', location: 'Port Harcourt', type: 'CONTRACT', workMode: 'ON_SITE',
    skills: ['Drive testing', 'RF planning', '4G/5G RAN fundamentals'], summary: 'Twelve-week contract collecting and analysing drive-test data for a 5G cluster launch.', postedAt: days(9) },
  { id: 'op-5', title: 'Cloud Support Associate', organization: 'Kora Cloud (sample)', location: 'Remote, Nigeria', type: 'FULL_TIME', workMode: 'REMOTE',
    skills: ['Linux administration', 'Cloud networking', 'Containers', 'Troubleshooting'], summary: 'Help customers deploy and troubleshoot workloads. Strong written communication needed.', postedAt: days(12) },
];

export const COURSES: Course[] = [
  { id: 'co-1', title: 'Fibre optics: splicing and testing lab', provider: 'Digital Bridge Institute', format: 'In-person lab', hours: 24, domain: D.fibre, skills: ['Fusion splicing', 'OTDR testing'], sponsored: true },
  { id: 'co-2', title: '5G RAN essentials', provider: 'Digital Bridge Institute', format: 'Blended', hours: 30, domain: D.ran, skills: ['4G/5G RAN fundamentals', 'RF planning'], sponsored: false },
  { id: 'co-3', title: 'IP networking foundations', provider: 'Digital Bridge Institute', format: 'Online, self-paced', hours: 20, domain: D.ip, skills: ['IP routing & switching', 'Troubleshooting'], sponsored: false },
  { id: 'co-4', title: 'Linux for network engineers', provider: 'Partner course (sample)', format: 'Online, self-paced', hours: 12, domain: D.ip, skills: ['Linux administration'], sponsored: false },
  { id: 'co-5', title: 'Python for network automation', provider: 'Partner course (sample)', format: 'Online, mentored', hours: 18, domain: D.auto, skills: ['Python scripting', 'Network automation'], sponsored: true },
  { id: 'co-6', title: 'Field safety and working at height', provider: 'Digital Bridge Institute', format: 'In-person', hours: 8, domain: D.field, skills: ['Site safety', 'Tower climbing certification'], sponsored: false },
];

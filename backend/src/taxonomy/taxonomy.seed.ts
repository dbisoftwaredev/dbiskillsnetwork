export interface SeedDomain {
  slug: string;
  name: string;
  description: string;
  displayOrder: number;
  escoGroupCode: string;
}

export interface SeedSkill {
  domainSlug: string;
  slug: string;
  name: string;
  description: string;
  escoUri: string;
  safetyCritical: boolean;
  requiredEvidence: string;
}

export interface SeedRoleBenchmark {
  domainSlug: string;
  slug: string;
  title: string;
  description: string;
  requiredSkillSlugs: string[];
}

export const PILOT_DOMAINS: SeedDomain[] = [
  {
    slug: 'rf-ran-4g-5g',
    name: 'RF/RAN & 4G/5G Engineering',
    description: 'Radio frequency planning, drive testing, antenna alignment, and 4G/5G RAN integration.',
    displayOrder: 1,
    escoGroupCode: '2153',
  },
  {
    slug: 'fibre-transmission',
    name: 'Fibre Optics & Transmission',
    description: 'Backbone and metro fiber splicing, OTDR characterization, DWDM, and microwave transmission.',
    displayOrder: 2,
    escoGroupCode: '7422',
  },
  {
    slug: 'ip-networking-noc',
    name: 'IP Networking & NOC',
    description: 'Enterprise and carrier IP routing, switching, MPLS, and 24/7 NOC fault triage.',
    displayOrder: 3,
    escoGroupCode: '2523',
  },
  {
    slug: 'field-deployment-power',
    name: 'Field Deployment & Tower/Power',
    description: 'Base station civil/rigging safety, hybrid solar/rectifier power systems, and site maintenance.',
    displayOrder: 4,
    escoGroupCode: '7412',
  },
  {
    slug: 'cybersecurity-cloud',
    name: 'Cybersecurity & Cloud',
    description: 'Cloud infrastructure hardening, identity governance, SOC monitoring, and telecom network security.',
    displayOrder: 5,
    escoGroupCode: '2529',
  },
  {
    slug: 'network-automation-ai',
    name: 'Network Automation & Applied AI',
    description: 'Python/Ansible network automation, telemetry pipelines, and predictive fault analytics.',
    displayOrder: 6,
    escoGroupCode: '2512',
  },
];

export const PILOT_SKILLS: SeedSkill[] = [
  {
    domainSlug: 'rf-ran-4g-5g',
    slug: 'rf-link-budget-planning',
    name: 'RF Link Budget & Coverage Planning',
    description: 'Calculate path loss, fade margin, and sector coverage for LTE and 5G NR cells.',
    escoUri: 'http://data.europa.eu/esco/skill/rf-link-budget',
    safetyCritical: false,
    requiredEvidence: 'SkillVerify diagnostic + propagation plan review',
  },
  {
    domainSlug: 'rf-ran-4g-5g',
    slug: 'bts-4g-5g-integration',
    name: '4G/5G BTS & gNodeB Integration',
    description: 'Commission baseband units, RRUs, and verify KPIs after site cutover.',
    escoUri: 'http://data.europa.eu/esco/skill/bts-integration',
    safetyCritical: false,
    requiredEvidence: 'SkillVerify diagnostic or DBI practical lab',
  },
  {
    domainSlug: 'rf-ran-4g-5g',
    slug: 'rf-drive-test-optimization',
    name: 'RF Drive Testing & KPI Optimization',
    description: 'Analyze RSRP, RSRQ, SINR, and handover failures to resolve cluster bottlenecks.',
    escoUri: 'http://data.europa.eu/esco/skill/rf-drive-test',
    safetyCritical: false,
    requiredEvidence: 'Logfile analysis + SkillVerify diagnostic',
  },
  {
    domainSlug: 'fibre-transmission',
    slug: 'fiber-fusion-splicing',
    name: 'Optical Fiber Fusion Splicing',
    description: 'Prepare, cleave, and fusion-splice single-mode and multi-mode optical fibers within loss tolerances.',
    escoUri: 'http://data.europa.eu/esco/skill/fiber-fusion-splicing',
    safetyCritical: true,
    requiredEvidence: 'SkillVerify theory + DBI Evaluator laser-safety lab sign-off',
  },
  {
    domainSlug: 'fibre-transmission',
    slug: 'otdr-fault-testing',
    name: 'OTDR Testing & Trace Analysis',
    description: 'Operate OTDR equipment to locate fiber breaks, macrobends, and splice attenuation.',
    escoUri: 'http://data.europa.eu/esco/skill/otdr-testing',
    safetyCritical: true,
    requiredEvidence: 'DBI Evaluator practical OTDR trace sign-off or FOA CFOT RPL',
  },
  {
    domainSlug: 'fibre-transmission',
    slug: 'ftth-odn-deployment',
    name: 'FTTH & ODN Distribution Design',
    description: 'Design and terminate optical distribution frames, splitters, and drop closures.',
    escoUri: 'http://data.europa.eu/esco/skill/ftth-odn',
    safetyCritical: false,
    requiredEvidence: 'SkillVerify diagnostic or field work sample',
  },
  {
    domainSlug: 'fibre-transmission',
    slug: 'microwave-link-alignment',
    name: 'Microwave Transmission & Link Alignment',
    description: 'Align point-to-point microwave dishes and verify RSL/BER stability.',
    escoUri: 'http://data.europa.eu/esco/skill/microwave-alignment',
    safetyCritical: true,
    requiredEvidence: 'DBI Evaluator sign-off with tower/RF safety clearance',
  },
  {
    domainSlug: 'ip-networking-noc',
    slug: 'ip-routing-bgp-ospf',
    name: 'IP Routing (OSPF & BGP)',
    description: 'Configure and troubleshoot enterprise and ISP dynamic routing protocols.',
    escoUri: 'http://data.europa.eu/esco/skill/ip-routing-bgp-ospf',
    safetyCritical: false,
    requiredEvidence: 'SkillVerify diagnostic or Cisco CCNA/CCNP RPL',
  },
  {
    domainSlug: 'ip-networking-noc',
    slug: 'vlan-mpls-switching',
    name: 'Layer-2 Switching, VLANs & MPLS',
    description: 'Deploy trunking, STP, VLAN segmentation, and MPLS transport VPNs.',
    escoUri: 'http://data.europa.eu/esco/skill/vlan-mpls-switching',
    safetyCritical: false,
    requiredEvidence: 'SkillVerify diagnostic or Cisco/Huawei RPL',
  },
  {
    domainSlug: 'ip-networking-noc',
    slug: 'noc-incident-triage',
    name: 'NOC Fault Triage & SLA Escalation',
    description: 'Monitor NMS alarms, isolate root-cause outages, and coordinate field dispatch.',
    escoUri: 'http://data.europa.eu/esco/skill/noc-incident-triage',
    safetyCritical: false,
    requiredEvidence: 'Scenario diagnostic + incident ticket rubric',
  },
  {
    domainSlug: 'ip-networking-noc',
    slug: 'network-packet-diagnostics',
    name: 'Packet Capture & Latency Diagnostics',
    description: 'Use Wireshark/tcpdump and traceroute telemetry to diagnose transport degradation.',
    escoUri: 'http://data.europa.eu/esco/skill/packet-diagnostics',
    safetyCritical: false,
    requiredEvidence: 'SkillVerify diagnostic or CCNA/CCNP RPL',
  },
  {
    domainSlug: 'field-deployment-power',
    slug: 'tower-working-at-height-safety',
    name: 'Tower Rigging & Working-at-Height Safety',
    description: 'Execute harness inspection, fall-arrest procedures, and safe tower rigging.',
    escoUri: 'http://data.europa.eu/esco/skill/tower-height-safety',
    safetyCritical: true,
    requiredEvidence: 'Mandatory DBI Evaluator physical safety sign-off',
  },
  {
    domainSlug: 'field-deployment-power',
    slug: 'dc-rectifier-solar-hybrid-power',
    name: '48V DC Rectifier & Solar Hybrid Power',
    description: 'Commission and troubleshoot telecom DC power plants, LiFePO4 banks, and hybrid inverters.',
    escoUri: 'http://data.europa.eu/esco/skill/dc-solar-hybrid',
    safetyCritical: true,
    requiredEvidence: 'Electrical safety gate + DBI Evaluator lab rubric',
  },
  {
    domainSlug: 'field-deployment-power',
    slug: 'site-earthing-lightning-protection',
    name: 'Telecom Site Earthing & Lightning Protection',
    description: 'Measure earth resistance and install surge/lightning protection per NCC standards.',
    escoUri: 'http://data.europa.eu/esco/skill/site-earthing',
    safetyCritical: true,
    requiredEvidence: 'Practical earth-test sign-off',
  },
  {
    domainSlug: 'cybersecurity-cloud',
    slug: 'cloud-iam-zero-trust',
    name: 'Cloud IAM & Zero-Trust Hardening',
    description: 'Enforce least-privilege IAM policies, MFA, and VPC segmentation across cloud workloads.',
    escoUri: 'http://data.europa.eu/esco/skill/cloud-iam',
    safetyCritical: false,
    requiredEvidence: 'SkillVerify diagnostic or cloud security certification RPL',
  },
  {
    domainSlug: 'cybersecurity-cloud',
    slug: 'soc-siem-threat-monitoring',
    name: 'SOC Alert Triage & SIEM Monitoring',
    description: 'Correlate firewall, IDS, and endpoint logs to detect and contain security incidents.',
    escoUri: 'http://data.europa.eu/esco/skill/soc-siem',
    safetyCritical: false,
    requiredEvidence: 'SkillVerify diagnostic or CompTIA Security+/CySA+ RPL',
  },
  {
    domainSlug: 'cybersecurity-cloud',
    slug: 'telecom-firewall-vpn-security',
    name: 'Carrier Firewall & IPsec VPN Security',
    description: 'Configure perimeter firewalls, IPsec tunnels, and DDoS mitigation policies.',
    escoUri: 'http://data.europa.eu/esco/skill/telecom-firewall',
    safetyCritical: false,
    requiredEvidence: 'SkillVerify diagnostic or vendor security RPL',
  },
  {
    domainSlug: 'network-automation-ai',
    slug: 'python-netmiko-automation',
    name: 'Python Network Automation (Netmiko/RESTCONF)',
    description: 'Automate device configuration backups, compliance audits, and bulk provisioning.',
    escoUri: 'http://data.europa.eu/esco/skill/python-netmiko',
    safetyCritical: false,
    requiredEvidence: 'SkillVerify diagnostic or DevNet RPL',
  },
  {
    domainSlug: 'network-automation-ai',
    slug: 'ansible-infrastructure-playbooks',
    name: 'Ansible Infrastructure & Network Playbooks',
    description: 'Author idempotent Ansible playbooks for repeatable server and router deployments.',
    escoUri: 'http://data.europa.eu/esco/skill/ansible-playbooks',
    safetyCritical: false,
    requiredEvidence: 'SkillVerify diagnostic or work sample',
  },
  {
    domainSlug: 'network-automation-ai',
    slug: 'telemetry-anomaly-analytics',
    name: 'Telecom Telemetry & Anomaly Analytics',
    description: 'Build SNMP/gNMI telemetry dashboards and threshold alerting for proactive maintenance.',
    escoUri: 'http://data.europa.eu/esco/skill/telemetry-analytics',
    safetyCritical: false,
    requiredEvidence: 'SkillVerify diagnostic',
  },
];

export const PILOT_ROLE_BENCHMARKS: SeedRoleBenchmark[] = [
  {
    domainSlug: 'fibre-transmission',
    slug: 'fibre-optic-technician',
    title: 'Fibre Optic & Transmission Technician',
    description: 'Deploys, splices, tests, and maintains metro and FTTH optical fiber networks.',
    requiredSkillSlugs: [
      'fiber-fusion-splicing',
      'otdr-fault-testing',
      'ftth-odn-deployment',
      'site-earthing-lightning-protection',
    ],
  },
  {
    domainSlug: 'rf-ran-4g-5g',
    slug: 'rf-5g-field-engineer',
    title: 'RF / 5G Field & RAN Engineer',
    description: 'Plans, integrates, and optimizes 4G/5G base stations and microwave backhaul links.',
    requiredSkillSlugs: [
      'rf-link-budget-planning',
      'bts-4g-5g-integration',
      'rf-drive-test-optimization',
      'microwave-link-alignment',
      'tower-working-at-height-safety',
    ],
  },
  {
    domainSlug: 'ip-networking-noc',
    slug: 'noc-ip-network-engineer',
    title: 'NOC & IP Core Network Engineer',
    description: 'Operates carrier IP/MPLS routing, resolves NOC escalations, and automates diagnostics.',
    requiredSkillSlugs: [
      'ip-routing-bgp-ospf',
      'vlan-mpls-switching',
      'noc-incident-triage',
      'network-packet-diagnostics',
      'python-netmiko-automation',
    ],
  },
  {
    domainSlug: 'cybersecurity-cloud',
    slug: 'telecom-cloud-security-analyst',
    title: 'Telecom Cloud & Security Analyst',
    description: 'Secures telecom cloud infrastructure, carrier VPNs, and monitors SOC telemetry.',
    requiredSkillSlugs: [
      'cloud-iam-zero-trust',
      'soc-siem-threat-monitoring',
      'telecom-firewall-vpn-security',
      'telemetry-anomaly-analytics',
    ],
  },
];

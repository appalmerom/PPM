/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type RAGStatus = 'Red' | 'Amber' | 'Green';

export interface Demand {
  id: string;
  name: string;
  status: 'Draft' | 'Submitted' | 'Screening' | 'Qualified' | 'Approved' | 'Rejected';
  priority: 'Low' | 'Medium' | 'High' | 'Critical';
  businessCase: string;
  estimatedBudget: number;
  year: number;
  readiness: {
    assessment: boolean;
    businessCase: boolean;
    costInputs: boolean;
  };
  lastUpdated: string;
}

export interface Project {
  id: string;
  name: string;
  status: 'Initiating' | 'Planning' | 'Executing' | 'Closing' | 'On Hold';
  ragStatus: RAGStatus;
  milestones: { name: string; date: string; status: 'Completed' | 'In Progress' | 'Pending' }[];
  risks: { id: string; description: string; impact: 'Low' | 'Medium' | 'High' }[];
  budget: { planned: number; actual: number; forecast: number };
  portfolioId: string;
  lastUpdated: string;
}

export interface Portfolio {
  id: string;
  name: string;
  manager: string;
  kpis: {
    budgetBurn: number;
    capacityForecast: number;
    atRiskProjects: number;
  };
}

export interface Document {
  id: string;
  name: string;
  type: 'pptx' | 'pdf' | 'xlsx' | 'docx' | 'video';
  lastModified: string;
  category: 'Governance' | 'RAID' | 'Process' | 'Report';
  url: string;
}

export const mockDemands: Demand[] = [
  {
    id: 'DMND001',
    name: 'Cloud Migration Phase 2',
    status: 'Screening',
    priority: 'High',
    businessCase: 'Migrate legacy workloads to AWS to reduce on-prem footprint.',
    estimatedBudget: 450000,
    year: 2026,
    readiness: { assessment: true, businessCase: true, costInputs: false },
    lastUpdated: '2026-04-01',
  },
  {
    id: 'DMND002',
    name: 'AI Customer Service Bot',
    status: 'Qualified',
    priority: 'Critical',
    businessCase: 'Implement LLM-based chatbot to handle 40% of tier 1 support.',
    estimatedBudget: 280000,
    year: 2026,
    readiness: { assessment: true, businessCase: true, costInputs: true },
    lastUpdated: '2026-04-05',
  },
  {
    id: 'DMND003',
    name: 'ERP Upgrade 2026',
    status: 'Submitted',
    priority: 'Medium',
    businessCase: 'Upgrade SAP instance to latest version for compliance.',
    estimatedBudget: 1200000,
    year: 2026,
    readiness: { assessment: false, businessCase: true, costInputs: false },
    lastUpdated: '2026-03-28',
  },
];

export const mockProjects: Project[] = [
  {
    id: 'PRJ001',
    name: 'Data Warehouse Modernization',
    status: 'Executing',
    ragStatus: 'Amber',
    portfolioId: 'PORT001',
    milestones: [
      { name: 'Architecture Sign-off', date: '2026-02-15', status: 'Completed' },
      { name: 'ETL Development', date: '2026-05-20', status: 'In Progress' },
    ],
    risks: [
      { id: 'RSK001', description: 'Data quality issues in source systems', impact: 'High' },
    ],
    budget: { planned: 500000, actual: 320000, forecast: 550000 },
    lastUpdated: '2026-04-10',
  },
  {
    id: 'PRJ002',
    name: 'Mobile App Redesign',
    status: 'Planning',
    ragStatus: 'Green',
    portfolioId: 'PORT001',
    milestones: [
      { name: 'Design Freeze', date: '2026-04-30', status: 'Pending' },
    ],
    risks: [],
    budget: { planned: 150000, actual: 20000, forecast: 150000 },
    lastUpdated: '2026-04-12',
  },
  {
    id: 'PRJ003',
    name: 'Cybersecurity Hardening',
    status: 'Executing',
    ragStatus: 'Red',
    portfolioId: 'PORT002',
    milestones: [
      { name: 'Firewall Upgrade', date: '2026-03-10', status: 'Completed' },
      { name: 'Endpoint Protection', date: '2026-04-01', status: 'In Progress' },
    ],
    risks: [
      { id: 'RSK002', description: 'Resource shortage for security engineers', impact: 'High' },
      { id: 'RSK003', description: 'Vendor delay on hardware', impact: 'Medium' },
    ],
    budget: { planned: 800000, actual: 750000, forecast: 950000 },
    lastUpdated: '2026-04-11',
  },
];

export const mockPortfolios: Portfolio[] = [
  {
    id: 'PORT001',
    name: 'Digital Transformation',
    manager: 'Sarah Jenkins',
    kpis: { budgetBurn: 65, capacityForecast: 85, atRiskProjects: 1 },
  },
  {
    id: 'PORT002',
    name: 'Infrastructure & Security',
    manager: 'Michael Chen',
    kpis: { budgetBurn: 92, capacityForecast: 110, atRiskProjects: 1 },
  },
];

export const mockDocuments: Document[] = [
  {
    id: 'DOC001',
    name: 'Governance Gate 2 Pack',
    type: 'pptx',
    lastModified: '2026-04-01',
    category: 'Governance',
    url: '#',
  },
  {
    id: 'DOC002',
    name: 'RAID Log - Cloud Migration',
    type: 'xlsx',
    lastModified: '2026-04-08',
    category: 'RAID',
    url: '#',
  },
  {
    id: 'DOC003',
    name: 'Portfolio Strategy 2026',
    type: 'pdf',
    lastModified: '2026-01-15',
    category: 'Process',
    url: '#',
  },
];

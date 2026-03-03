-- HireTX Seed Data v2.0 - Demo Users + 50+ Simulations

-- Demo Users (password: Password123!)
INSERT OR IGNORE INTO users (id, username, email, password_hash, role, full_name, specialization, verified_status, is_active)
VALUES 
  ('admin-001', 'admin', 'admin@hiretx.gov', '$2b$10$demo_admin_hash', 'admin', 'System Administrator', 'none', 1, 1),
  ('superadmin-001', 'superadmin', 'superadmin@hiretx.gov', '$2b$10$demo_admin_hash', 'super_admin', 'Super Administrator', 'none', 1, 1),
  ('evaluator-001', 'eval_johnson', 'evaluator@hiretx.gov', '$2b$10$demo_admin_hash', 'evaluator', 'Dr. Patricia Johnson', 'human_resources', 1, 1),
  ('evaluator-002', 'eval_santos', 'eval2@hiretx.gov', '$2b$10$demo_admin_hash', 'evaluator', 'Engr. Marco Santos', 'computer_science', 1, 1),
  ('candidate-001', 'maria_reyes', 'candidate@hiretx.gov', '$2b$10$demo_admin_hash', 'candidate', 'Maria Reyes', 'human_resources', 1, 1),
  ('candidate-002', 'john_dela', 'john@hiretx.gov', '$2b$10$demo_admin_hash', 'candidate', 'John Dela Cruz', 'computer_science', 1, 1);

-- ============================================================
-- HUMAN RESOURCES SIMULATIONS (26 simulations)
-- ============================================================

-- HR-001: BEGINNER
INSERT OR IGNORE INTO simulations (id, title, description, specialization, difficulty, time_limit, passing_score, instructions, scenario_background, created_by)
VALUES ('hr-001', 'HR Fundamentals: Onboarding Basics', 'Demonstrate understanding of employee onboarding processes and HR documentation.', 'human_resources', 'beginner', 1800, 60, 'Read the scenario carefully and answer each task. You have 30 minutes.', 'You are a new HR assistant at a mid-sized company. Your manager has asked you to handle the onboarding of 3 new employees joining next Monday.', 'admin-001');

INSERT OR IGNORE INTO tasks (id, simulation_id, title, description, task_type, sequence_order, max_score, tbclm_axis, keywords)
VALUES
('hr-001-t1','hr-001','Onboarding Checklist Creation','Create a comprehensive onboarding checklist for a new employee joining the Marketing department.','text_response',1,100,'T','["onboarding","checklist","orientation","documentation","welcome","introduction","policies","handbook","equipment","access","training","mentor","benefits"]'),
('hr-001-t2','hr-001','Required Documents','Which documents are legally required during employee onboarding?','multiple_choice',2,100,'T','[]'),
('hr-001-t3','hr-001','First Week Schedule','Draft a first-week schedule for the new Marketing Associate including orientation, team introductions, and initial training.','text_response',3,100,'B','["schedule","orientation","introduction","meeting","training","tour","lunch","buddy","manager","goals","expectations"]');

UPDATE tasks SET options='["A) SSS, PhilHealth, Pag-IBIG forms only","B) Employment contract, tax forms, government IDs, bank account details, emergency contacts","C) Only the employment contract","D) Just the resume and cover letter"]', correct_option='B' WHERE id='hr-001-t2';

-- HR-002: BEGINNER
INSERT OR IGNORE INTO simulations (id, title, description, specialization, difficulty, time_limit, passing_score, instructions, scenario_background, created_by)
VALUES ('hr-002', 'Job Description Writing Essentials', 'Write clear, compliant, and attractive job descriptions for open positions.', 'human_resources', 'beginner', 1800, 60, 'Complete each task within the time limit.', 'The company has 3 open positions: (1) Customer Service Rep, (2) IT Support Technician, (3) Accounting Clerk. You must draft job descriptions.', 'admin-001');

INSERT OR IGNORE INTO tasks (id, simulation_id, title, description, task_type, sequence_order, max_score, tbclm_axis, keywords)
VALUES
('hr-002-t1','hr-002','JD Structure','What are the essential components of an effective job description?','multiple_choice',1,100,'T','[]'),
('hr-002-t2','hr-002','Write a JD for Customer Service Rep','Draft a complete job description for the Customer Service Representative position including all required components.','text_response',2,100,'T','["job title","responsibilities","qualifications","skills","education","experience","salary","benefits","reporting","communication","customer","service","problem-solving"]'),
('hr-002-t3','hr-002','Inclusive Language Review','Identify potential biases in job descriptions and rewrite them using inclusive language.','text_response',3,100,'B','["inclusive","bias","gender-neutral","diverse","equal","opportunity","regardless","all backgrounds","welcoming","accessibility"]');

UPDATE tasks SET options='["A) Job title only","B) Job title, responsibilities, qualifications, compensation, and company overview","C) Only responsibilities and pay","D) Resume requirements only"]', correct_option='B' WHERE id='hr-002-t1';

-- HR-003: BEGINNER
INSERT OR IGNORE INTO simulations (id, title, description, specialization, difficulty, time_limit, passing_score, instructions, scenario_background, created_by)
VALUES ('hr-003', 'Employee Leave Management', 'Handle leave requests, track absences, and apply leave policies correctly.', 'human_resources', 'beginner', 1800, 60, 'Apply company leave policy to the given scenarios.', 'Your company provides: 15 VL, 15 SL, 5 Emergency Leave per year. You receive multiple leave requests from different employees.', 'admin-001');

INSERT OR IGNORE INTO tasks (id, simulation_id, title, description, task_type, sequence_order, max_score, tbclm_axis, keywords)
VALUES
('hr-003-t1','hr-003','Leave Policy Application','Employee A requests 20 consecutive vacation leaves but only has 15 remaining. How do you handle this?','text_response',1,100,'T','["available balance","approve partial","communicate","alternative","documentation","policy","reject","explain","discuss","options"]'),
('hr-003-t2','hr-003','Leave Type Classification','A worker calls in sick for 3 days without documentation. What leave type applies and what is required?','multiple_choice',2,100,'T','[]'),
('hr-003-t3','hr-003','Leave Report','Generate a monthly leave utilization report format for your department of 10 employees.','text_response',3,100,'C','["table","employee name","leave type","days used","balance","month","report","summary","total","department"]');

UPDATE tasks SET options='["A) Vacation Leave — no documentation needed","B) Sick Leave — medical certificate required if more than 2 consecutive days","C) Emergency Leave — auto approved","D) Unpaid Leave — immediate deduction"]', correct_option='B' WHERE id='hr-003-t2';

-- HR-004: INTERMEDIATE
INSERT OR IGNORE INTO simulations (id, title, description, specialization, difficulty, time_limit, passing_score, instructions, scenario_background, created_by)
VALUES ('hr-004', 'Recruitment and Selection Process', 'Manage full-cycle recruitment from job posting to offer extension.', 'human_resources', 'intermediate', 2700, 65, 'You have 45 minutes. Demonstrate your recruitment process knowledge.', 'TechBridge Corporation needs to hire a Senior Software Developer within 3 weeks. Budget: ₱80,000/month. Current team: 8 developers. The role requires 5+ years experience in Node.js and React.', 'admin-001');

INSERT OR IGNORE INTO tasks (id, simulation_id, title, description, task_type, sequence_order, max_score, tbclm_axis, keywords)
VALUES
('hr-004-t1','hr-004','Sourcing Strategy','Outline a multi-channel sourcing strategy to find qualified Senior Software Developer candidates within 3 weeks.','text_response',1,100,'T','["job boards","linkedin","referrals","social media","headhunting","university","network","posting","sourcing","pipeline","active","passive","channels"]'),
('hr-004-t2','hr-004','Interview Structure','Design a structured interview process for the role including screening, technical, and final rounds.','text_response',2,100,'C','["screening","technical","panel","behavioral","structured","competency","questions","assessment","coding test","case","portfolio","timeline","stages"]'),
('hr-004-t3','hr-004','Offer Negotiation','A top candidate counters your offer of ₱80,000 with a request for ₱95,000. How do you handle this?','text_response',3,100,'B','["negotiate","communicate","total package","benefits","budget","approval","market rate","compromise","counter","value","offer letter","acceptance"]'),
('hr-004-t4','hr-004','Candidate Evaluation Matrix','Which selection method is most valid for predicting job performance?','multiple_choice',4,100,'C','[]');

UPDATE tasks SET options='["A) Unstructured interviews alone","B) Cognitive ability tests and structured behavioral interviews combined","C) Resume screening only","D) Personal references only"]', correct_option='B' WHERE id='hr-004-t4';

-- HR-005: INTERMEDIATE
INSERT OR IGNORE INTO simulations (id, title, description, specialization, difficulty, time_limit, passing_score, instructions, scenario_background, created_by)
VALUES ('hr-005', 'Performance Management Cycle', 'Design and implement a complete performance management system.', 'human_resources', 'intermediate', 2700, 65, 'Apply performance management principles to the given organizational scenarios.', 'A company of 200 employees currently has no formal performance management system. Employees report feeling unclear about expectations and unfairly assessed. You are hired to build one from scratch.', 'admin-001');

INSERT OR IGNORE INTO tasks (id, simulation_id, title, description, task_type, sequence_order, max_score, tbclm_axis, keywords)
VALUES
('hr-005-t1','hr-005','KPI Framework Design','Design a KPI framework for a Sales Department with 20 representatives.','text_response',1,100,'T','["KPI","metrics","targets","revenue","conversion","activity","lagging","leading","SMART","measurable","specific","aligned","strategic","dashboard"]'),
('hr-005-t2','hr-005','360-Degree Feedback Implementation','Explain how you would implement 360-degree feedback for middle management.','text_response',2,100,'C','["peers","subordinates","supervisors","self","feedback","anonymity","development","form","calibration","process","training","confidential","multi-rater"]'),
('hr-005-t3','hr-005','PIP Development','Draft a Performance Improvement Plan (PIP) for an employee consistently missing targets.','text_response',3,100,'L','["performance improvement plan","goals","timeline","milestones","support","coaching","consequences","documentation","specific","measurable","weekly","review"]'),
('hr-005-t4','hr-005','Bias in Performance Reviews','What is "Halo Effect" in performance reviews and how do you mitigate it?','multiple_choice',4,100,'C','[]');

UPDATE tasks SET options='["A) Rating everyone the same score","B) Allowing one positive trait to influence all other ratings — mitigated through calibration sessions and structured rubrics","C) Giving higher ratings to friends","D) Ignoring negative feedback"]', correct_option='B' WHERE id='hr-005-t4';

-- HR-006: INTERMEDIATE
INSERT OR IGNORE INTO simulations (id, title, description, specialization, difficulty, time_limit, passing_score, instructions, scenario_background, created_by)
VALUES ('hr-006', 'Employee Relations & Conflict Resolution', 'Handle workplace conflicts, grievances, and disciplinary proceedings professionally.', 'human_resources', 'intermediate', 2700, 65, 'Apply ER best practices and labor law principles to each scenario.', 'You are the HR Manager. Three situations arise simultaneously: (1) A harassment complaint, (2) An inter-team conflict affecting productivity, (3) An employee refusing to follow reasonable work instructions.', 'admin-001');

INSERT OR IGNORE INTO tasks (id, simulation_id, title, description, task_type, sequence_order, max_score, tbclm_axis, keywords)
VALUES
('hr-006-t1','hr-006','Harassment Investigation Protocol','Describe the step-by-step investigation process for a workplace harassment complaint.','text_response',1,100,'T','["investigate","confidential","interview","witness","evidence","documentation","policy","report","findings","due process","HR","legal","timeline","follow-up"]'),
('hr-006-t2','hr-006','Conflict Mediation','Two department heads have an ongoing conflict that is affecting their teams. Design a mediation process.','text_response',2,100,'B','["mediation","neutral","listen","ground rules","issue identification","solutions","agreement","follow-up","communication","relationship","facilitate","common ground"]'),
('hr-006-t3','hr-006','Disciplinary Action','What is the correct progressive discipline process for an employee refusing instructions?','multiple_choice',3,100,'L','[]');

UPDATE tasks SET options='["A) Immediate termination","B) Verbal warning → Written warning → Final warning with PIP → Separation with due process","C) Suspension first, then dismissal","D) Transfer to another department"]', correct_option='B' WHERE id='hr-006-t3';

-- HR-007: INTERMEDIATE
INSERT OR IGNORE INTO simulations (id, title, description, specialization, difficulty, time_limit, passing_score, instructions, scenario_background, created_by)
VALUES ('hr-007', 'Compensation and Benefits Design', 'Design competitive compensation structures and benefits packages.', 'human_resources', 'intermediate', 2700, 65, 'Use market data and internal equity principles to design compensation systems.', 'A 150-person logistics company wants to redesign its entire compensation structure. Current situation: no pay grades, frequent turnover, below-market salaries. Budget increase: 12%.', 'admin-001');

INSERT OR IGNORE INTO tasks (id, simulation_id, title, description, task_type, sequence_order, max_score, tbclm_axis, keywords)
VALUES
('hr-007-t1','hr-007','Pay Grade Structure','Design a pay grade structure with at least 5 levels for this logistics company.','text_response',1,100,'T','["pay grade","band","range","minimum","midpoint","maximum","job evaluation","level","compensation","equity","structure","progression","merit"]'),
('hr-007-t2','hr-007','Benefits Package','Design a cost-effective benefits package that improves retention.','text_response',2,100,'M','["health insurance","HMO","retirement","leave","bonus","incentive","flexible","wellness","training","development","allowance","competitive","total rewards"]'),
('hr-007-t3','hr-007','Salary Benchmarking','How do you conduct a salary benchmarking exercise?','text_response',3,100,'C','["survey","market data","benchmark","percentile","P50","P75","median","comparison","industry","role","adjust","gap","analysis","report"]');

-- HR-008: ADVANCED
INSERT OR IGNORE INTO simulations (id, title, description, specialization, difficulty, time_limit, passing_score, instructions, scenario_background, created_by)
VALUES ('hr-008', 'Strategic Workforce Planning', 'Develop a multi-year workforce plan aligned with business strategy.', 'human_resources', 'advanced', 3600, 70, 'You have 60 minutes. This is a strategic exercise requiring long-term thinking.', 'A major bank plans to expand from 500 to 1,200 employees over 3 years, launching digital banking services. 30% of current roles will be automated. You lead HR Strategy.', 'admin-001');

INSERT OR IGNORE INTO tasks (id, simulation_id, title, description, task_type, sequence_order, max_score, tbclm_axis, keywords)
VALUES
('hr-008-t1','hr-008','Workforce Gap Analysis','Conduct a workforce gap analysis identifying critical skill gaps for the digital transformation.','text_response',1,100,'T','["gap analysis","current state","future state","skills","roles","headcount","automation","digital","technology","upskilling","reskilling","supply","demand"]'),
('hr-008-t2','hr-008','Succession Planning','Design a succession planning framework for the top 20 critical roles in the bank.','text_response',2,100,'L','["succession","readiness","9-box","high potential","critical roles","pipeline","development","talent pool","assessment","replacement","leadership","transition"]'),
('hr-008-t3','hr-008','Change Management Strategy','Develop a change management plan for employees whose roles will be automated.','text_response',3,100,'B','["change management","communication","reskilling","transition","support","fear","resistance","stakeholders","training","new roles","timeline","engagement"]'),
('hr-008-t4','hr-008','HR Technology Roadmap','Recommend an HRIS/HCM technology roadmap for the expanded organization.','text_response',4,100,'M','["HRIS","HCM","HRMS","technology","automation","analytics","AI","payroll","performance","recruitment","integration","cloud","implementation","ROI"]');

-- HR-009: ADVANCED
INSERT OR IGNORE INTO simulations (id, title, description, specialization, difficulty, time_limit, passing_score, instructions, scenario_background, created_by)
VALUES ('hr-009', 'Organizational Development & Culture Transformation', 'Lead organizational culture change and design effective OD interventions.', 'human_resources', 'advanced', 3600, 70, '60-minute advanced simulation. Demonstrate OD expertise and systemic thinking.', 'A manufacturing company of 800 employees has a toxic culture: high turnover (45%), low engagement (32% eNPS), frequent inter-department conflicts, and resistance to change. New CEO wants transformation in 18 months.', 'admin-001');

INSERT OR IGNORE INTO tasks (id, simulation_id, title, description, task_type, sequence_order, max_score, tbclm_axis, keywords)
VALUES
('hr-009-t1','hr-009','Culture Diagnostic','Design a comprehensive culture diagnostic methodology to understand root causes.','text_response',1,100,'C','["diagnostic","survey","focus group","interview","data","culture","climate","values","behaviors","engagement","analysis","qualitative","quantitative","assessment"]'),
('hr-009-t2','hr-009','OD Intervention Plan','Develop a prioritized 18-month OD intervention roadmap with milestones.','text_response',2,100,'L','["intervention","roadmap","priority","milestone","change","culture","engagement","training","leadership","communication","recognition","values","quick wins","long-term"]'),
('hr-009-t3','hr-009','Stakeholder Engagement','How do you secure leadership buy-in for the culture transformation program?','text_response',3,100,'B','["stakeholder","leadership","CEO","buy-in","data","business case","ROI","engagement","communication","champion","sponsor","resistance","influence","partnership"]'),
('hr-009-t4','hr-009','Measuring Culture Change','Design a metrics framework to track culture transformation progress.','text_response',4,100,'T','["metrics","eNPS","engagement","turnover","retention","KPI","survey","pulse","benchmark","data","dashboard","leading","lagging","indicators"]');

-- HR-010: ADVANCED
INSERT OR IGNORE INTO simulations (id, title, description, specialization, difficulty, time_limit, passing_score, instructions, scenario_background, created_by)
VALUES ('hr-010', 'HR Analytics & Data-Driven Decision Making', 'Apply HR analytics to solve complex organizational problems.', 'human_resources', 'advanced', 3600, 70, 'This simulation tests your ability to work with HR data and generate insights.', 'You have access to 3 years of HR data for a 600-person retail company showing: increasing turnover in store managers (28%), declining productivity (-12% YoY), rising absenteeism (avg 18 days/year).', 'admin-001');

INSERT OR IGNORE INTO tasks (id, simulation_id, title, description, task_type, sequence_order, max_score, tbclm_axis, keywords)
VALUES
('hr-010-t1','hr-010','Turnover Analysis','Analyze the likely causes of 28% manager turnover and propose an analytical approach.','text_response',1,100,'C','["regression","correlation","exit interview","survey","data","analysis","predictive","factors","compensation","management","career","workload","engagement","hypothesis"]'),
('hr-010-t2','hr-010','Predictive Analytics Model','Design a predictive model to identify employees at risk of leaving within 6 months.','text_response',2,100,'T','["predictive model","variables","risk score","algorithm","data","features","performance","tenure","engagement","absenteeism","training","machine learning","output","threshold"]'),
('hr-010-t3','hr-010','Data Visualization Dashboard','Describe the key HR dashboard metrics you would present to the executive team.','text_response',3,100,'M','["dashboard","visualization","KPI","metric","executive","headcount","turnover","cost","productivity","engagement","benchmark","trend","chart","insight"]'),
('hr-010-t4','hr-010','ROI of HR Programs','How do you calculate the ROI of a management development program?','text_response',4,100,'C','["ROI","investment","benefit","cost","training","before","after","measurement","performance","productivity","retention","savings","calculation","impact"]');

-- HR-011: EXPERT
INSERT OR IGNORE INTO simulations (id, title, description, specialization, difficulty, time_limit, passing_score, instructions, scenario_background, created_by)
VALUES ('hr-011', 'Labor Relations & Collective Bargaining', 'Navigate complex labor relations, union negotiations, and CBA administration.', 'human_resources', 'expert', 4500, 75, '75-minute expert simulation. Demonstrate mastery of labor law and collective bargaining.', 'You are VP-HR of a 2,500-employee manufacturing company. The union representing 1,800 workers is demanding: 15% wage increase, additional 10 SL days, removal of performance bonuses (replaced with fixed allowances). CBA expires in 45 days.', 'admin-001');

INSERT OR IGNORE INTO tasks (id, simulation_id, title, description, task_type, sequence_order, max_score, tbclm_axis, keywords)
VALUES
('hr-011-t1','hr-011','CBA Negotiation Strategy','Develop management''s negotiation strategy and BATNA for the upcoming CBA talks.','text_response',1,100,'L','["BATNA","negotiation","strategy","management","position","interest","wage","costing","tradeoff","compromise","bottom line","counter","opening","package"]'),
('hr-011-t2','hr-011','Economic Package Analysis','Analyze the economic impact of the union''s demands and prepare a counter-proposal.','text_response',2,100,'T','["cost","impact","wage","increase","percentage","payroll","benefits","analysis","counter","proposal","alternative","sustainable","productivity","financial"]'),
('hr-011-t3','hr-011','Impasse Resolution','The negotiation reaches an impasse on day 30. What are your legal options and preferred course of action?','text_response',3,100,'C','["impasse","conciliation","mediation","NCMB","strike","lockout","DOLE","legal","arbitration","cooling-off","options","resolution","compromise","relationship"]'),
('hr-011-t4','hr-011','Post-CBA Implementation','After signing the CBA, design the implementation and monitoring plan.','text_response',4,100,'B','["implementation","communication","socialization","grievance","compliance","monitoring","joint committee","training","administration","records","dispute","resolution"]');

-- HR-012: EXPERT
INSERT OR IGNORE INTO simulations (id, title, description, specialization, difficulty, time_limit, passing_score, instructions, scenario_background, created_by)
VALUES ('hr-012', 'Global HR Management & Expatriate Programs', 'Manage international HR operations and cross-cultural workforce.', 'human_resources', 'expert', 4500, 75, 'Expert-level simulation requiring international HR management expertise.', 'Your company is expanding to 5 new countries (Singapore, Germany, UAE, Brazil, USA). You need to deploy 15 Filipino expatriates over 12 months, while hiring 200+ local employees across regions.', 'admin-001');

INSERT OR IGNORE INTO tasks (id, simulation_id, title, description, task_type, sequence_order, max_score, tbclm_axis, keywords)
VALUES
('hr-012-t1','hr-012','Expatriate Compensation Package','Design a comprehensive expat package for Filipino employees deployed to Singapore.','text_response',1,100,'T','["expatriate","package","COLA","housing","education","tax","equalization","home","host","allowance","relocation","repatriation","compensation","benefits"]'),
('hr-012-t2','hr-012','Cross-Cultural Training','Design a pre-departure cross-cultural training program for expats going to Germany and UAE.','text_response',2,100,'B','["culture","training","pre-departure","language","customs","business etiquette","communication","adaptation","family","support","integration","preparation","sensitivities"]'),
('hr-012-t3','hr-012','Global HR Policy Framework','Develop a framework for balancing global HR standards with local compliance requirements.','text_response',3,100,'L','["global","local","glocal","framework","policy","compliance","labor law","consistency","flexibility","country","standards","adaptation","governance","implementation"]'),
('hr-012-t4','hr-012','International Talent Acquisition','Design a strategy for hiring 200 employees across 5 countries in 12 months.','text_response',4,100,'M','["global","recruitment","talent","sourcing","employer brand","compliance","immigration","work permit","timeline","partnership","agency","assessment","pipeline","strategy"]');

-- HR-013: BEGINNER
INSERT OR IGNORE INTO simulations (id, title, description, specialization, difficulty, time_limit, passing_score, instructions, scenario_background, created_by)
VALUES ('hr-013', 'HR Documentation & Records Management', 'Maintain accurate HR records and ensure documentation compliance.', 'human_resources', 'beginner', 1800, 60, 'Demonstrate your knowledge of HR documentation requirements.', 'You are an HR Coordinator responsible for maintaining records for 50 employees.', 'admin-001');

INSERT OR IGNORE INTO tasks (id, simulation_id, title, description, task_type, sequence_order, max_score, tbclm_axis, keywords)
VALUES
('hr-013-t1','hr-013','Employee 201 File','List all documents that should be in an employee 201 file.','text_response',1,100,'T','["201 file","resume","contract","government IDs","SSS","PhilHealth","Pag-IBIG","TIN","emergency","NBI","medical","performance","training","compensation","termination"]'),
('hr-013-t2','hr-013','Data Privacy Compliance','How do you ensure HR records comply with the Data Privacy Act?','text_response',2,100,'T','["data privacy","consent","confidential","secure","access","encryption","retention","disposal","breach","DPA","personal information","sensitive","policy","compliance"]'),
('hr-013-t3','hr-013','Retention Schedule','What is the proper retention period for employment records?','multiple_choice',3,100,'T','[]');

UPDATE tasks SET options='["A) 1 year after separation","B) Minimum 3 years; payroll records up to 10 years per labor code","C) Forever, no disposal allowed","D) Only during employment"]', correct_option='B' WHERE id='hr-013-t3';

-- HR-014: INTERMEDIATE
INSERT OR IGNORE INTO simulations (id, title, description, specialization, difficulty, time_limit, passing_score, instructions, scenario_background, created_by)
VALUES ('hr-014', 'Training Needs Analysis & L&D Program Design', 'Conduct TNA and design effective learning programs.', 'human_resources', 'intermediate', 2700, 65, 'Apply L&D best practices to design training interventions.', 'Employee engagement scores dropped to 54%. Exit interviews reveal: lack of career growth (68%), inadequate training (57%), poor management (49%). Budget: ₱2.5M for L&D this year.', 'admin-001');

INSERT OR IGNORE INTO tasks (id, simulation_id, title, description, task_type, sequence_order, max_score, tbclm_axis, keywords)
VALUES
('hr-014-t1','hr-014','Training Needs Analysis','Design a comprehensive TNA process to identify priority training gaps.','text_response',1,100,'C','["TNA","gap","survey","interview","observation","performance","competency","assessment","priority","data","analysis","business","need","recommendation"]'),
('hr-014-t2','hr-014','L&D Program Design','Design a flagship management development program within ₱1.5M budget.','text_response',2,100,'T','["program","curriculum","modules","methodology","blended","online","classroom","facilitation","assessment","budget","timeline","measurement","outcome","competency"]'),
('hr-014-t3','hr-014','Training ROI Measurement','How would you measure the ROI of the management development program?','text_response',3,100,'C','["Kirkpatrick","Level 1","Level 2","Level 3","Level 4","ROI","reaction","learning","behavior","results","impact","measurement","pre","post","control"]');

-- HR-015: EXPERT
INSERT OR IGNORE INTO simulations (id, title, description, specialization, difficulty, time_limit, passing_score, instructions, scenario_background, created_by)
VALUES ('hr-015', 'HR Business Partner Strategic Advisory', 'Act as a strategic HRBP advising a business unit during major transformation.', 'human_resources', 'expert', 4500, 75, 'Expert simulation requiring strategic business acumen and HR mastery.', 'The Operations Division (300 employees) is undergoing automation affecting 40% of roles. Revenue dropped 15%. The Division Head wants to implement a RIF (Reduction in Force). You are the HRBP.', 'admin-001');

INSERT OR IGNORE INTO tasks (id, simulation_id, title, description, task_type, sequence_order, max_score, tbclm_axis, keywords)
VALUES
('hr-015-t1','hr-015','RIF Legal Framework','Outline the legal requirements and process for a lawful reduction in force in the Philippines.','text_response',1,100,'T','["DOLE","30-day notice","separation pay","authorized cause","redundancy","retrenchment","closure","legal","compliance","due process","documentation","labor code"]'),
('hr-015-t2','hr-015','Selection Criteria for RIF','Design fair and defensible criteria for selecting employees for redundancy.','text_response',2,100,'C','["criteria","seniority","performance","skills","objectivity","documented","consistent","fair","non-discriminatory","rating","matrix","transparent","legal","defensible"]'),
('hr-015-t3','hr-015','Alternative to RIF','What alternatives to RIF should you present to the Division Head?','text_response',3,100,'L','["alternative","retraining","redeployment","voluntary","early retirement","reduced hours","freeze hiring","outsource","restructure","reorganize","cost reduction","recommendation"]'),
('hr-015-t4','hr-015','Communication Strategy','Develop the communication strategy for the workforce during the transformation.','text_response',4,100,'B','["communication","transparent","honest","townhall","FAQ","manager","message","timeline","support","EAP","concern","morale","trust","leadership"]');

-- ============================================================
-- COMPUTER SCIENCE / IT SIMULATIONS (26 simulations)
-- ============================================================

-- IT-001: BEGINNER
INSERT OR IGNORE INTO simulations (id, title, description, specialization, difficulty, time_limit, passing_score, instructions, scenario_background, created_by)
VALUES ('it-001', 'IT Help Desk Fundamentals', 'Handle common IT support tickets and apply troubleshooting methodology.', 'computer_science', 'beginner', 1800, 60, 'Apply IT support best practices to each ticket scenario.', 'You are a Level 1 Help Desk Technician. You receive multiple support tickets from employees.', 'admin-001');

INSERT OR IGNORE INTO tasks (id, simulation_id, title, description, task_type, sequence_order, max_score, tbclm_axis, keywords)
VALUES
('it-001-t1','it-001','Password Reset Procedure','Describe the secure procedure for resetting an employee''s Windows domain password.','text_response',1,100,'T','["verify identity","ticket","Active Directory","reset","temporary password","secure","policy","complexity","expiry","documentation","MFA","two-factor","authorization"]'),
('it-001-t2','it-001','Printer Troubleshooting','A user cannot print. Walk through the troubleshooting steps.','text_response',2,100,'C','["restart","driver","queue","network","cable","port","IP","spooler","test print","connection","paper","ink","permissions","escalate"]'),
('it-001-t3','it-001','Ticket Priority','Which ticket gets the highest priority?','multiple_choice',3,100,'T','[]');

UPDATE tasks SET options='["A) A user cannot change their screensaver","B) The company''s main database server is down affecting all 200 users","C) A manager needs a new keyboard","D) WiFi is slow for one user"]', correct_option='B' WHERE id='it-001-t3';

-- IT-002: BEGINNER
INSERT OR IGNORE INTO simulations (id, title, description, specialization, difficulty, time_limit, passing_score, instructions, scenario_background, created_by)
VALUES ('it-002', 'Network Basics & Connectivity Troubleshooting', 'Apply foundational networking knowledge to resolve connectivity issues.', 'computer_science', 'beginner', 1800, 60, 'Demonstrate understanding of basic networking concepts and troubleshooting.', 'A small office of 30 computers suddenly loses internet connectivity. You are the network admin on duty.', 'admin-001');

INSERT OR IGNORE INTO tasks (id, simulation_id, title, description, task_type, sequence_order, max_score, tbclm_axis, keywords)
VALUES
('it-002-t1','it-002','Network Troubleshooting Steps','Describe your systematic approach to diagnosing and resolving the network outage.','text_response',1,100,'C','["ping","traceroute","ipconfig","DNS","gateway","router","modem","ISP","cable","switch","restart","layer","OSI","diagnose","isolate"]'),
('it-002-t2','it-002','IP Addressing','A computer shows "169.254.x.x" IP address. What does this mean and how do you fix it?','text_response',2,100,'T','["APIPA","DHCP","server","release","renew","ipconfig","static","assign","failed","automatic","fallback","network","reconfigure"]'),
('it-002-t3','it-002','Network Topology','Which network topology provides the best redundancy for a small office?','multiple_choice',3,100,'T','[]');

UPDATE tasks SET options='["A) Bus topology","B) Star topology with managed switch","C) Ring topology","D) Mesh topology"]', correct_option='B' WHERE id='it-002-t3';

-- IT-003: BEGINNER
INSERT OR IGNORE INTO simulations (id, title, description, specialization, difficulty, time_limit, passing_score, instructions, scenario_background, created_by)
VALUES ('it-003', 'Cybersecurity Awareness & Basic Protection', 'Apply basic cybersecurity practices to protect users and systems.', 'computer_science', 'beginner', 1800, 60, 'Demonstrate cybersecurity awareness and ability to communicate best practices.', 'Your company experienced a phishing attack. 5 employees clicked a suspicious email link. You are IT Security.', 'admin-001');

INSERT OR IGNORE INTO tasks (id, simulation_id, title, description, task_type, sequence_order, max_score, tbclm_axis, keywords)
VALUES
('it-003-t1','it-003','Incident Response','Describe your immediate response steps when a phishing attack is detected.','text_response',1,100,'T','["isolate","disconnect","scan","antivirus","report","contain","investigate","change passwords","MFA","notify","document","escalate","remediate","monitor"]'),
('it-003-t2','it-003','Employee Awareness Training','Write the key points for an employee cybersecurity awareness training module.','text_response',2,100,'B','["phishing","password","MFA","links","attachments","social engineering","USB","public WiFi","updates","reporting","suspicious","verification","policy","awareness"]'),
('it-003-t3','it-003','Password Policy','What is the recommended minimum password policy for enterprise security?','multiple_choice',3,100,'T','[]');

UPDATE tasks SET options='["A) 4 characters, any type","B) Minimum 12 characters with uppercase, lowercase, numbers, special chars; changed every 90 days; no reuse of last 10","C) 8 characters letters only","D) Use company name plus birth year"]', correct_option='B' WHERE id='it-003-t3';

-- IT-004: INTERMEDIATE
INSERT OR IGNORE INTO simulations (id, title, description, specialization, difficulty, time_limit, passing_score, instructions, scenario_background, created_by)
VALUES ('it-004', 'Database Design & SQL Optimization', 'Design relational database schemas and optimize SQL query performance.', 'computer_science', 'intermediate', 2700, 65, 'Apply database design principles and SQL optimization techniques.', 'An e-commerce platform with 500,000 products and 2M customers reports that product search queries take 8-12 seconds. You are the Database Developer tasked with optimization.', 'admin-001');

INSERT OR IGNORE INTO tasks (id, simulation_id, title, description, task_type, sequence_order, max_score, tbclm_axis, keywords)
VALUES
('it-004-t1','it-004','Schema Design','Design a normalized database schema for the e-commerce platform (products, customers, orders, reviews).','text_response',1,100,'T','["table","primary key","foreign key","normalization","3NF","relationship","products","customers","orders","categories","index","schema","ERD","constraint","relationship"]'),
('it-004-t2','it-004','Query Optimization','A product search query takes 8 seconds. Identify likely causes and optimization strategies.','text_response',2,100,'C','["index","query plan","EXPLAIN","full table scan","composite index","covering index","cache","partitioning","statistics","rewrite","join","subquery","optimization","performance"]'),
('it-004-t3','it-004','Indexing Strategy','Write the optimal indexing strategy for a products table with 500K rows.','text_response',3,100,'T','["CREATE INDEX","composite","covering","category_id","price","product_name","LIKE","full-text","search","performance","cardinality","selectivity","write","read"]'),
('it-004-t4','it-004','ACID Properties','Which ACID property ensures data remains consistent even during concurrent transactions?','multiple_choice',4,100,'T','[]');

UPDATE tasks SET options='["A) Atomicity","B) Isolation — prevents concurrent transactions from interfering with each other","C) Durability","D) Consistency"]', correct_option='B' WHERE id='it-004-t4';

-- IT-005: INTERMEDIATE
INSERT OR IGNORE INTO simulations (id, title, description, specialization, difficulty, time_limit, passing_score, instructions, scenario_background, created_by)
VALUES ('it-005', 'REST API Design & Development', 'Design and implement RESTful APIs following best practices.', 'computer_science', 'intermediate', 2700, 65, 'Demonstrate API design skills and RESTful principles.', 'You are a Backend Developer building a REST API for a hospital management system. The system needs to manage: patients, appointments, doctors, medical records.', 'admin-001');

INSERT OR IGNORE INTO tasks (id, simulation_id, title, description, task_type, sequence_order, max_score, tbclm_axis, keywords)
VALUES
('it-005-t1','it-005','API Endpoint Design','Design the complete RESTful API endpoint structure for the hospital system.','text_response',1,100,'T','["GET","POST","PUT","DELETE","PATCH","/patients","/appointments","/doctors","/records","endpoint","resource","HTTP","method","versioning","path","parameter","query"]'),
('it-005-t2','it-005','Authentication & Authorization','Design the authentication and role-based authorization system for the API.','text_response',2,100,'T','["JWT","OAuth","bearer token","RBAC","role","permission","middleware","authentication","authorization","refresh token","expiry","secure","HTTPS","header"]'),
('it-005-t3','it-005','Error Handling & Response Standards','Define the API error handling and response format standards.','text_response',3,100,'C','["status code","200","201","400","401","403","404","500","error","message","response","format","JSON","success","consistent","pagination","envelope"]'),
('it-005-t4','it-005','API Security','What HTTP status code should be returned when a user is authenticated but lacks permission?','multiple_choice',4,100,'T','[]');

UPDATE tasks SET options='["A) 401 Unauthorized","B) 403 Forbidden — authenticated but lacks required permissions","C) 404 Not Found","D) 400 Bad Request"]', correct_option='B' WHERE id='it-005-t4';

-- IT-006: INTERMEDIATE
INSERT OR IGNORE INTO simulations (id, title, description, specialization, difficulty, time_limit, passing_score, instructions, scenario_background, created_by)
VALUES ('it-006', 'Cloud Infrastructure & AWS Architecture', 'Design scalable cloud architectures using AWS services.', 'computer_science', 'intermediate', 2700, 65, 'Apply cloud architecture principles to design scalable solutions.', 'A startup with a Node.js application currently hosted on a single VPS (4GB RAM, 2 CPU) is experiencing 300% traffic growth. They need to migrate to AWS for scalability.', 'admin-001');

INSERT OR IGNORE INTO tasks (id, simulation_id, title, description, task_type, sequence_order, max_score, tbclm_axis, keywords)
VALUES
('it-006-t1','it-006','AWS Architecture Design','Design a scalable AWS architecture for the Node.js application.','text_response',1,100,'T','["EC2","ECS","ELB","Auto Scaling","RDS","ElastiCache","S3","CloudFront","VPC","Route53","ALB","Lambda","multi-AZ","redundancy","scalability"]'),
('it-006-t2','it-006','Cost Optimization','Estimate the monthly AWS cost and identify 3 cost optimization strategies.','text_response',2,100,'M','["Reserved Instance","Spot Instance","right-sizing","S3 storage class","CloudFront","cost explorer","budget","monitoring","optimization","savings","plan","tier","pricing"]'),
('it-006-t3','it-006','Disaster Recovery Plan','Design a disaster recovery plan with RTO < 1 hour and RPO < 15 minutes.','text_response',3,100,'C','["RTO","RPO","backup","replication","multi-region","failover","snapshot","database","restore","DR","pilot light","warm standby","active-active","automation"]'),
('it-006-t4','it-006','Managed Services','Which AWS service provides managed Kubernetes?','multiple_choice',4,100,'T','[]');

UPDATE tasks SET options='["A) EC2 Container Service","B) Amazon EKS (Elastic Kubernetes Service)","C) AWS Lambda","D) AWS Fargate"]', correct_option='B' WHERE id='it-006-t4';

-- IT-007: INTERMEDIATE
INSERT OR IGNORE INTO simulations (id, title, description, specialization, difficulty, time_limit, passing_score, instructions, scenario_background, created_by)
VALUES ('it-007', 'Software Development Lifecycle & Agile', 'Apply Agile/Scrum methodology to software project management.', 'computer_science', 'intermediate', 2700, 65, 'Demonstrate your Agile project management capabilities.', 'You are a Scrum Master for a team of 7 developers building an inventory management system. Sprint 3 of 8. The team is behind schedule — only 60% of committed story points delivered. Velocity is dropping.', 'admin-001');

INSERT OR IGNORE INTO tasks (id, simulation_id, title, description, task_type, sequence_order, max_score, tbclm_axis, keywords)
VALUES
('it-007-t1','it-007','Sprint Retrospective Facilitation','Facilitate a retrospective to identify why velocity dropped. What structure would you use?','text_response',1,100,'B','["retrospective","Start Stop Continue","4Ls","root cause","impediment","velocity","burndown","team","feedback","action items","psychological safety","facilitate","improve","sprint"]'),
('it-007-t2','it-007','Backlog Refinement','Explain how to properly groom and prioritize the product backlog for upcoming sprints.','text_response',2,100,'L','["backlog","refinement","grooming","prioritize","MoSCoW","story points","definition of ready","acceptance criteria","epic","user story","dependency","estimate","sprint"]'),
('it-007-t3','it-007','Scrum Events','What is the maximum timebox for a Sprint Planning meeting for a 2-week sprint?','multiple_choice',3,100,'T','[]');

UPDATE tasks SET options='["A) 1 hour","B) 4 hours (max 2 hours per sprint week)","C) 8 hours","D) No time limit"]', correct_option='B' WHERE id='it-007-t3';

-- IT-008: ADVANCED
INSERT OR IGNORE INTO simulations (id, title, description, specialization, difficulty, time_limit, passing_score, instructions, scenario_background, created_by)
VALUES ('it-008', 'Cybersecurity Incident Response & Forensics', 'Lead a cybersecurity incident response for a critical infrastructure breach.', 'computer_science', 'advanced', 3600, 70, '60-minute advanced simulation. Apply cybersecurity frameworks to a real breach scenario.', 'CRITICAL: Your company''s ERP system has been breached. Signs: Unusual admin account activity at 2AM, 50GB data exfiltrated to external IP, ransomware note on 3 file servers, production database encrypted. You are the CISO.', 'admin-001');

INSERT OR IGNORE INTO tasks (id, simulation_id, title, description, task_type, sequence_order, max_score, tbclm_axis, keywords)
VALUES
('it-008-t1','it-008','Immediate Containment','Describe your immediate (first 2 hours) incident response and containment actions.','text_response',1,100,'T','["isolate","disconnect","preserve","evidence","IRP","CSIRT","contain","document","notify","executive","legal","timeline","system","network","access"]'),
('it-008-t2','it-008','Forensic Investigation','Design the forensic investigation methodology to determine the breach vector.','text_response',2,100,'C','["forensics","chain of custody","logs","SIEM","timeline","IOC","TTPs","MITRE","ATT&CK","evidence","artifact","memory","disk","network","analysis"]'),
('it-008-t3','it-008','Ransomware Decision','The attackers demand $500K Bitcoin for decryption keys. Analyze your decision options.','text_response',3,100,'L','["do not pay","backup","restore","legal","FBI","CISA","negotiate","risk","reputation","decryption","alternative","insurance","business continuity","decision"]'),
('it-008-t4','it-008','Post-Incident Report','Structure a comprehensive post-incident report for the board of directors.','text_response',4,100,'B','["executive summary","timeline","scope","impact","root cause","response","lessons learned","recommendations","controls","improvement","cost","recovery","board","report"]');

-- IT-009: ADVANCED
INSERT OR IGNORE INTO simulations (id, title, description, specialization, difficulty, time_limit, passing_score, instructions, scenario_background, created_by)
VALUES ('it-009', 'System Architecture & Microservices Design', 'Design scalable microservices architecture for a complex enterprise system.', 'computer_science', 'advanced', 3600, 70, 'Advanced architecture simulation requiring deep system design knowledge.', 'A monolithic e-commerce platform with 5M daily active users is experiencing scalability issues: 4+ second page load, 99.2% uptime, database bottlenecks during peak sales. You must design the microservices migration.', 'admin-001');

INSERT OR IGNORE INTO tasks (id, simulation_id, title, description, task_type, sequence_order, max_score, tbclm_axis, keywords)
VALUES
('it-009-t1','it-009','Microservices Decomposition','Identify the bounded contexts and decompose the monolith into microservices.','text_response',1,100,'T','["bounded context","domain","service","catalog","order","payment","user","inventory","notification","delivery","decompose","independence","boundary","DDD","microservice"]'),
('it-009-t2','it-009','Inter-Service Communication','Design the communication strategy between microservices.','text_response',2,100,'T','["REST","gRPC","message queue","Kafka","RabbitMQ","event-driven","async","sync","API gateway","service mesh","Istio","circuit breaker","retry","timeout"]'),
('it-009-t3','it-009','Data Management Strategy','How do you handle data consistency across microservices without a shared database?','text_response',3,100,'C','["Saga","event sourcing","CQRS","eventual consistency","compensating transaction","distributed","database per service","2PC","outbox","idempotent","retry","message"]'),
('it-009-t4','it-009','Observability & Monitoring','Design the observability stack for your microservices platform.','text_response',4,100,'T','["distributed tracing","Jaeger","Zipkin","metrics","Prometheus","Grafana","logs","ELK","OpenTelemetry","alerting","SLO","SLA","dashboard","incident","correlation"]');

-- IT-010: ADVANCED
INSERT OR IGNORE INTO simulations (id, title, description, specialization, difficulty, time_limit, passing_score, instructions, scenario_background, created_by)
VALUES ('it-010', 'DevOps & CI/CD Pipeline Architecture', 'Design and implement enterprise-grade DevOps practices and pipelines.', 'computer_science', 'advanced', 3600, 70, 'Advanced DevOps simulation requiring CI/CD expertise.', 'A 50-person engineering team deploys software monthly with frequent rollbacks (30% of deployments fail). Build time: 45 minutes. Manual testing: 3 days. You are hired as Lead DevOps Engineer.', 'admin-001');

INSERT OR IGNORE INTO tasks (id, simulation_id, title, description, task_type, sequence_order, max_score, tbclm_axis, keywords)
VALUES
('it-010-t1','it-010','CI/CD Pipeline Design','Design a complete CI/CD pipeline to achieve daily deployments with <5% rollback rate.','text_response',1,100,'T','["CI","CD","pipeline","stages","build","test","lint","SAST","integration","staging","canary","blue-green","rollback","automation","Jenkins","GitHub Actions","GitLab"]'),
('it-010-t2','it-010','Test Automation Strategy','Design a test automation pyramid to reduce 3-day manual testing.','text_response',2,100,'T','["unit test","integration test","E2E","coverage","Selenium","Cypress","Jest","pytest","contract","API","performance","load","regression","automation","pyramid"]'),
('it-010-t3','it-010','Deployment Strategy','Compare Blue-Green vs Canary deployment strategies for this team.','text_response',3,100,'C','["blue-green","canary","rollback","risk","traffic","percentage","monitoring","feature flag","downtime","production","switch","gradual","rollout","comparison","recommendation"]'),
('it-010-t4','it-010','Infrastructure as Code','Which tool is best suited for managing cloud infrastructure as code?','multiple_choice',4,100,'T','[]');

UPDATE tasks SET options='["A) Manual configuration scripts","B) Terraform — provider-agnostic IaC tool supporting multi-cloud with state management","C) AWS Console only","D) Ansible only"]', correct_option='B' WHERE id='it-010-t4';

-- IT-011: EXPERT
INSERT OR IGNORE INTO simulations (id, title, description, specialization, difficulty, time_limit, passing_score, instructions, scenario_background, created_by)
VALUES ('it-011', 'Enterprise Security Architecture & Zero Trust', 'Design a Zero Trust security architecture for a large enterprise.', 'computer_science', 'expert', 4500, 75, 'Expert-level cybersecurity architecture simulation.', 'A financial services firm (3,000 employees, 50 branches, cloud-hybrid) suffered two data breaches in 18 months. Board mandates Zero Trust implementation within 12 months. Budget: $2M. You are CISO.', 'admin-001');

INSERT OR IGNORE INTO tasks (id, simulation_id, title, description, task_type, sequence_order, max_score, tbclm_axis, keywords)
VALUES
('it-011-t1','it-011','Zero Trust Architecture Design','Design the Zero Trust architecture framework for this financial firm.','text_response',1,100,'T','["never trust always verify","identity","device","network","application","data","microsegmentation","ZTNA","IAM","PAM","MFA","least privilege","continuous verification","Zero Trust"]'),
('it-011-t2','it-011','Identity & Access Management','Design the IAM/PAM implementation roadmap.','text_response',2,100,'T','["IAM","PAM","SSO","MFA","conditional access","lifecycle","provisioning","deprovisioning","privileged","just-in-time","Active Directory","Azure AD","policy","governance"]'),
('it-011-t3','it-011','Security Roadmap & Business Case','Build the 12-month security transformation roadmap and executive business case.','text_response',3,100,'L','["roadmap","phases","priority","quick wins","business case","ROI","risk reduction","cost","compliance","regulatory","board","executive","investment","timeline","milestone"]'),
('it-011-t4','it-011','Compliance & Regulatory Framework','Map the Zero Trust controls to financial services regulatory requirements.','text_response',4,100,'M','["PCI-DSS","BSP","ISO 27001","NIST","compliance","control","mapping","audit","evidence","gap","framework","regulatory","requirement","financial","implementation"]');

-- IT-012: EXPERT
INSERT OR IGNORE INTO simulations (id, title, description, specialization, difficulty, time_limit, passing_score, instructions, scenario_background, created_by)
VALUES ('it-012', 'AI/ML System Design & Production Deployment', 'Design and deploy production-grade machine learning systems.', 'computer_science', 'expert', 4500, 75, 'Expert simulation on ML engineering and production AI systems.', 'You are Lead ML Engineer at a bank. The fraud detection model currently catches 72% of fraud (recall) with 15% false positive rate. Task: improve to 90% recall, <5% FPR, and deploy as real-time API handling 10K transactions/minute.', 'admin-001');

INSERT OR IGNORE INTO tasks (id, simulation_id, title, description, task_type, sequence_order, max_score, tbclm_axis, keywords)
VALUES
('it-012-t1','it-012','ML Model Improvement Strategy','Design a strategy to improve fraud detection from 72% to 90% recall.','text_response',1,100,'T','["recall","precision","threshold","class imbalance","SMOTE","ensemble","XGBoost","feature engineering","cross-validation","AUC-ROC","confusion matrix","precision-recall","optimization","model"]'),
('it-012-t2','it-012','MLOps Pipeline Design','Design the MLOps pipeline for continuous training, evaluation, and deployment.','text_response',2,100,'T','["MLOps","pipeline","feature store","training","evaluation","registry","deployment","monitoring","drift","retraining","A/B testing","canary","rollback","automation","workflow"]'),
('it-012-t3','it-012','Real-Time Inference Architecture','Design the system architecture for real-time fraud scoring at 10K TPS.','text_response',3,100,'C','["real-time","streaming","Kafka","inference","latency","p99","cache","feature","precompute","serving","Kubernetes","autoscaling","GPU","model","milliseconds"]'),
('it-012-t4','it-012','Model Explainability','How do you ensure the ML model''s decisions are explainable for regulatory compliance?','text_response',4,100,'M','["explainability","SHAP","LIME","interpretable","feature importance","regulation","audit","transparency","black box","decision","report","compliance","XAI","bias","fairness"]');

-- IT-013: BEGINNER
INSERT OR IGNORE INTO simulations (id, title, description, specialization, difficulty, time_limit, passing_score, instructions, scenario_background, created_by)
VALUES ('it-013', 'HTML/CSS/JavaScript Web Development Basics', 'Build a simple responsive webpage using fundamental web technologies.', 'computer_science', 'beginner', 1800, 60, 'Demonstrate your foundational web development knowledge.', 'A small bakery wants a simple 3-page website: Home, Menu, and Contact. No framework, pure HTML/CSS/JS.', 'admin-001');

INSERT OR IGNORE INTO tasks (id, simulation_id, title, description, task_type, sequence_order, max_score, tbclm_axis, keywords)
VALUES
('it-013-t1','it-013','HTML Structure','Write the semantic HTML structure for the bakery homepage.','text_response',1,100,'T','["semantic","header","nav","main","footer","section","article","aside","h1","p","ul","a","img","alt","meta","viewport","doctype","title"]'),
('it-013-t2','it-013','Responsive CSS','Explain how to make the website mobile-responsive.','text_response',2,100,'T','["media query","viewport","flexbox","grid","breakpoint","mobile first","responsive","fluid","percent","em","rem","max-width","CSS","screen","column"]'),
('it-013-t3','it-013','JavaScript Interaction','What is the difference between == and === in JavaScript?','multiple_choice',3,100,'T','[]');

UPDATE tasks SET options='["A) No difference","B) === is strict equality (checks both value and type); == allows type coercion","C) == is for numbers only","D) === is slower"]', correct_option='B' WHERE id='it-013-t3';

-- IT-014: INTERMEDIATE
INSERT OR IGNORE INTO simulations (id, title, description, specialization, difficulty, time_limit, passing_score, instructions, scenario_background, created_by)
VALUES ('it-014', 'Data Structures & Algorithm Problem Solving', 'Solve algorithmic problems and analyze time/space complexity.', 'computer_science', 'intermediate', 2700, 65, 'Demonstrate algorithm design and complexity analysis skills.', 'You are interviewing for a Software Engineer role. You will solve 3 algorithm problems.', 'admin-001');

INSERT OR IGNORE INTO tasks (id, simulation_id, title, description, task_type, sequence_order, max_score, tbclm_axis, keywords)
VALUES
('it-014-t1','it-014','Two Sum Problem','Describe an optimized solution for the Two Sum problem (find two numbers in array that add to target). Analyze time and space complexity.','text_response',1,100,'C','["hash map","HashMap","O(n)","O(1)","dictionary","lookup","complement","brute force","O(n²)","nested loop","space","time","complexity","optimal","solution"]'),
('it-014-t2','it-014','Binary Search Tree','Explain when to use a Binary Search Tree vs a Hash Table for data storage.','text_response',2,100,'C','["BST","hash table","ordered","search","O(log n)","O(1)","traversal","sorted","range query","worst case","collision","use case","comparison","tree","structure"]'),
('it-014-t3','it-014','Sorting Algorithm','Which sorting algorithm has the best average-case time complexity?','multiple_choice',3,100,'T','[]');

UPDATE tasks SET options='["A) Bubble Sort — O(n²)","B) Merge Sort / Quick Sort — O(n log n) average case","C) Insertion Sort — O(n²)","D) Selection Sort — O(n²)"]', correct_option='B' WHERE id='it-014-t3';

-- IT-015: EXPERT
INSERT OR IGNORE INTO simulations (id, title, description, specialization, difficulty, time_limit, passing_score, instructions, scenario_background, created_by)
VALUES ('it-015', 'CTO Technical Strategy & Digital Transformation', 'Lead a complete digital transformation initiative as CTO.', 'computer_science', 'expert', 4500, 75, 'Expert simulation requiring CTO-level technical strategy and leadership.', 'You are the new CTO of a 500-person traditional retail company. Current state: legacy on-premise systems (10+ years old), no mobile app, 0 cloud adoption, 3-week deployment cycles, outdated skills in 60% of engineering team. CEO wants digital-first transformation in 24 months.', 'admin-001');

INSERT OR IGNORE INTO tasks (id, simulation_id, title, description, task_type, sequence_order, max_score, tbclm_axis, keywords)
VALUES
('it-015-t1','it-015','Technology Assessment','Conduct a technology audit and identify the most critical modernization priorities.','text_response',1,100,'T','["audit","assessment","legacy","technical debt","risk","priority","stack","infrastructure","application","data","integration","security","skills","roadmap","critical"]'),
('it-015-t2','it-015','Cloud Migration Strategy','Design the 24-month cloud migration roadmap with phases and risk mitigation.','text_response',2,100,'T','["migration","phases","lift-shift","refactor","re-platform","cloud-native","AWS","Azure","GCP","risk","parallel","cutover","testing","rollback","timeline"]'),
('it-015-t3','it-015','Engineering Culture & Talent','Develop a strategy to upskill 60% of the engineering team and build a modern engineering culture.','text_response',3,100,'L','["upskill","training","culture","DevOps","agile","hiring","retention","community","learning","certification","team","structure","leadership","tech stack","transformation"]'),
('it-015-t4','it-015','Executive Communication','Present the transformation ROI and risk assessment to the board.','text_response',4,100,'M','["ROI","revenue","cost savings","risk","investment","payback","efficiency","customer experience","competitive","board","executive","metrics","milestone","business case","presentation"]');

-- Additional simulations (HR-016 to HR-026, IT-016 to IT-026)
-- HR-016: BEGINNER
INSERT OR IGNORE INTO simulations (id, title, description, specialization, difficulty, time_limit, passing_score, instructions, scenario_background, created_by)
VALUES ('hr-016', 'Employment Law Fundamentals', 'Apply basic Philippine labor law principles to common HR scenarios.', 'human_resources', 'beginner', 1800, 60, 'Apply labor law knowledge to the given scenarios.', 'A company of 100 employees asks you basic labor law questions.', 'admin-001');

INSERT OR IGNORE INTO tasks (id, simulation_id, title, description, task_type, sequence_order, max_score, tbclm_axis, keywords)
VALUES
('hr-016-t1','hr-016','Minimum Wage','What constitutes the legally mandated minimum wage in the NCR for 2024?','multiple_choice',1,100,'T','[]'),
('hr-016-t2','hr-016','13th Month Pay','Explain who is entitled to 13th month pay and how it is computed.','text_response',2,100,'T','["rank and file","basic salary","one month","1/12","prorate","computation","entitled","exemptions","deadline","November","December","labor code"]'),
('hr-016-t3','hr-016','Illegal Dismissal','What constitutes illegal dismissal under Philippine labor law?','text_response',3,100,'T','["just cause","authorized cause","due process","notice","opportunity","twin notice","hearing","reinstatement","back wages","separation pay","illegal","unjust"]');

UPDATE tasks SET options='["A) ₱500/day","B) ₱610/day (NCR Daily Minimum Wage as adjusted)","C) ₱400/day","D) ₱750/day"]', correct_option='B' WHERE id='hr-016-t1';

-- IT-016: BEGINNER
INSERT OR IGNORE INTO simulations (id, title, description, specialization, difficulty, time_limit, passing_score, instructions, scenario_background, created_by)
VALUES ('it-016', 'Version Control with Git', 'Apply Git version control best practices for team collaboration.', 'computer_science', 'beginner', 1800, 60, 'Demonstrate your Git knowledge and workflow skills.', 'You join a development team using Git for version control. You need to demonstrate proper Git usage.', 'admin-001');

INSERT OR IGNORE INTO tasks (id, simulation_id, title, description, task_type, sequence_order, max_score, tbclm_axis, keywords)
VALUES
('it-016-t1','it-016','Git Branching Strategy','Explain the Git Flow branching strategy and when to use it.','text_response',1,100,'T','["main","develop","feature","release","hotfix","branch","merge","pull request","review","strategy","naming","convention","workflow","team","collaboration"]'),
('it-016-t2','it-016','Merge Conflict Resolution','A merge conflict occurs. Describe how you resolve it.','text_response',2,100,'C','["conflict","markers","<<<",">>>","manual","resolve","commit","test","communicate","rebase","merge","both sides","accept","choose","diff"]'),
('it-016-t3','it-016','Git Command','Which command undoes the last commit but keeps changes staged?','multiple_choice',3,100,'T','[]');

UPDATE tasks SET options='["A) git revert HEAD","B) git reset --soft HEAD~1","C) git checkout HEAD","D) git stash"]', correct_option='B' WHERE id='it-016-t3';

-- IT-017: INTERMEDIATE
INSERT OR IGNORE INTO simulations (id, title, description, specialization, difficulty, time_limit, passing_score, instructions, scenario_background, created_by)
VALUES ('it-017', 'React.js Frontend Development', 'Build a React application demonstrating modern frontend patterns.', 'computer_science', 'intermediate', 2700, 65, 'Demonstrate React expertise and modern JavaScript patterns.', 'You are building a task management SPA using React with TypeScript. The app needs: user authentication, task CRUD, real-time updates, and responsive design.', 'admin-001');

INSERT OR IGNORE INTO tasks (id, simulation_id, title, description, task_type, sequence_order, max_score, tbclm_axis, keywords)
VALUES
('it-017-t1','it-017','Component Architecture','Design the component hierarchy and state management approach for the task manager.','text_response',1,100,'T','["component","props","state","Context","Redux","Zustand","hierarchy","atoms","molecules","organisms","lifting state","composition","separation","reusable","TypeScript"]'),
('it-017-t2','it-017','Performance Optimization','Identify common React performance issues and their solutions.','text_response',2,100,'C','["memo","useMemo","useCallback","lazy loading","code splitting","virtual DOM","reconciliation","keys","re-render","profiler","suspense","optimization","batch"]'),
('it-017-t3','it-017','React Hook','Which React hook should you use to perform side effects like data fetching?','multiple_choice',3,100,'T','[]');

UPDATE tasks SET options='["A) useState","B) useEffect — runs after render and handles side effects like API calls and subscriptions","C) useContext","D) useReducer"]', correct_option='B' WHERE id='it-017-t3';

-- IT-018: ADVANCED
INSERT OR IGNORE INTO simulations (id, title, description, specialization, difficulty, time_limit, passing_score, instructions, scenario_background, created_by)
VALUES ('it-018', 'Kubernetes & Container Orchestration', 'Design and manage containerized applications at scale with Kubernetes.', 'computer_science', 'advanced', 3600, 70, 'Advanced simulation on Kubernetes architecture and operations.', 'A company is migrating 30 microservices to Kubernetes. Current state: Docker Compose in production (problematic). Target: managed K8s cluster handling 50K concurrent users with 99.99% uptime.', 'admin-001');

INSERT OR IGNORE INTO tasks (id, simulation_id, title, description, task_type, sequence_order, max_score, tbclm_axis, keywords)
VALUES
('it-018-t1','it-018','K8s Architecture','Design the Kubernetes cluster architecture for 30 microservices.','text_response',1,100,'T','["cluster","node","pod","deployment","service","ingress","namespace","ConfigMap","Secret","PersistentVolume","resource limits","autoscaler","HPA","VPA","cluster autoscaler"]'),
('it-018-t2','it-018','Service Mesh & Networking','Design the networking and service mesh strategy.','text_response',2,100,'T','["Istio","Linkerd","service mesh","mTLS","traffic management","circuit breaker","retry","timeout","load balancing","observability","sidecar","proxy","NetworkPolicy","ingress"]'),
('it-018-t3','it-018','High Availability Strategy','Ensure 99.99% uptime for critical services.','text_response',3,100,'C','["multi-AZ","PodDisruptionBudget","anti-affinity","rolling update","liveness","readiness","probe","replica","failover","monitoring","alerting","runbook","SLO","recovery"]'),
('it-018-t4','it-018','K8s Object','What Kubernetes resource ensures a minimum number of pod replicas are always available?','multiple_choice',4,100,'T','[]');

UPDATE tasks SET options='["A) DaemonSet","B) PodDisruptionBudget combined with Deployment replicas","C) ConfigMap","D) StatefulSet"]', correct_option='B' WHERE id='it-018-t4';

-- HR-017 through HR-020 (quick inserts)
INSERT OR IGNORE INTO simulations (id, title, description, specialization, difficulty, time_limit, passing_score, instructions, scenario_background, created_by)
VALUES 
('hr-017', 'Diversity, Equity & Inclusion Programs', 'Design and implement DEI initiatives for an organization.', 'human_resources', 'advanced', 3600, 70, '60-minute advanced HR simulation on DEI strategy.', 'A technology company with 85% male workforce and minimal representation from marginalized groups wants to become a top DEI employer within 3 years.', 'admin-001'),
('hr-018', 'HR Metrics & Scorecard Design', 'Build an HR scorecard aligned with business strategy.', 'human_resources', 'intermediate', 2700, 65, 'Design comprehensive HR metrics using balanced scorecard approach.', 'The CEO wants HR to demonstrate its business value through a quarterly dashboard.', 'admin-001'),
('hr-019', 'Talent Acquisition: Executive Search', 'Lead an executive search for C-suite positions.', 'human_resources', 'expert', 4500, 75, 'Expert simulation on executive recruitment.', 'The company needs to hire a CEO, CFO, and CTO simultaneously. You lead executive recruitment.', 'admin-001'),
('hr-020', 'Employee Engagement Strategy', 'Diagnose low engagement and design improvement programs.', 'human_resources', 'intermediate', 2700, 65, 'Apply engagement science to an organizational case.', 'Company-wide eNPS dropped to -15. Annual engagement survey shows 48% disengaged employees.', 'admin-001'),
('hr-021', 'Payroll Administration & Compliance', 'Process payroll accurately and ensure statutory compliance.', 'human_resources', 'beginner', 1800, 60, 'Demonstrate payroll processing and compliance knowledge.', 'You are HR Payroll Specialist for a 100-person company. Process the bi-monthly payroll.', 'admin-001'),
('hr-022', 'HR Policy Development', 'Draft, review and communicate comprehensive HR policies.', 'human_resources', 'intermediate', 2700, 65, 'Create effective, compliant HR policies for an organization.', 'A growing startup of 80 employees has no formal HR policies. You must build from scratch.', 'admin-001'),
('hr-023', 'Talent Management & Succession', 'Design a complete talent management framework.', 'human_resources', 'advanced', 3600, 70, 'Advanced talent management and succession planning simulation.', 'A rapidly growing company needs to identify and develop future leaders from within.', 'admin-001'),
('hr-024', 'HR Due Diligence in M&A', 'Conduct HR due diligence during a merger and acquisition.', 'human_resources', 'expert', 4500, 75, 'Expert simulation on HR integration during M&A.', 'Your company is acquiring a 300-person competitor. You lead the HR due diligence team.', 'admin-001'),
('hr-025', 'Remote Work Policy & Management', 'Design remote work policies and virtual team management practices.', 'human_resources', 'intermediate', 2700, 65, 'Apply modern remote work best practices.', '70% of employees want to remain fully remote post-pandemic. Design a comprehensive policy.', 'admin-001'),
('hr-026', 'HR Compliance Audit', 'Conduct a comprehensive HR compliance audit.', 'human_resources', 'advanced', 3600, 70, 'Advanced HR compliance and audit simulation.', 'A 250-person company has not had an HR audit in 5 years. Multiple labor law violations suspected.', 'admin-001');

INSERT OR IGNORE INTO tasks (id, simulation_id, title, description, task_type, sequence_order, max_score, tbclm_axis, keywords)
VALUES
('hr-017-t1','hr-017','DEI Strategy','Design a 3-year DEI roadmap including goals, initiatives, and metrics.','text_response',1,100,'L','["diversity","equity","inclusion","representation","bias","hiring","promotion","ERG","training","accountability","metrics","target","pipeline","culture","belonging"]'),
('hr-018-t1','hr-018','HR KPIs','Design an HR balanced scorecard with 15 key metrics across 4 perspectives.','text_response',1,100,'T','["balanced scorecard","financial","customer","process","learning","KPI","metric","turnover","cost per hire","time to fill","engagement","productivity","ROI","benchmark"]'),
('hr-019-t1','hr-019','Executive Search Process','Design the search strategy for filling all three C-suite roles.','text_response',1,100,'L','["executive search","headhunting","board","CEO","CFO","CTO","assessment","psychometric","reference","confidential","search firm","retainer","profile","competency"]'),
('hr-020-t1','hr-020','Engagement Diagnosis','Identify the root causes of -15 eNPS and design an improvement plan.','text_response',1,100,'C','["eNPS","engagement","diagnosis","survey","focus group","driver","manager","recognition","career","communication","feedback","culture","action plan","priority"]'),
('hr-021-t1','hr-021','Payroll Computation','Compute the net pay for an employee earning ₱25,000/month with standard deductions.','text_response',1,100,'T','["gross pay","SSS","PhilHealth","Pag-IBIG","withholding tax","net pay","deduction","BIR","contribution","computation","table","schedule","13th month"]'),
('hr-022-t1','hr-022','Policy Framework','List and describe the 10 most critical HR policies a startup needs first.','text_response',1,100,'T','["code of conduct","anti-harassment","leave","attendance","data privacy","compensation","disciplinary","recruitment","IT","security","priority","policy","compliance"]'),
('hr-023-t1','hr-023','9-Box Grid','Explain how to use the 9-box talent grid to identify high-potential employees.','text_response',1,100,'C','["9-box","performance","potential","high performer","high potential","development","succession","assessment","calibration","action","retain","develop","promote","pipeline"]'),
('hr-024-t1','hr-024','Due Diligence Checklist','Design the HR due diligence checklist for the acquisition.','text_response',1,100,'T','["due diligence","labor","contracts","benefits","pension","litigation","compliance","culture","headcount","compensation","turnover","liability","integration","risk"]'),
('hr-025-t1','hr-025','Remote Work Policy','Draft a comprehensive remote work policy covering eligibility, expectations, and compliance.','text_response',1,100,'T','["remote","policy","eligibility","equipment","security","productivity","attendance","communication","overlap","hours","deliverables","performance","onsite","hybrid","compliance"]'),
('hr-026-t1','hr-026','Compliance Audit Plan','Design a comprehensive HR compliance audit plan.','text_response',1,100,'C','["audit","checklist","labor code","SSS","PhilHealth","Pag-IBIG","BIR","DOLE","findings","risk","priority","remediation","documentation","process","compliance"]');

-- IT-019 through IT-026
INSERT OR IGNORE INTO simulations (id, title, description, specialization, difficulty, time_limit, passing_score, instructions, scenario_background, created_by)
VALUES
('it-019', 'Python Backend Development with FastAPI', 'Build a production-ready Python API with FastAPI.', 'computer_science', 'intermediate', 2700, 65, 'Demonstrate Python and FastAPI development skills.', 'Build a REST API for a library management system using FastAPI and PostgreSQL.', 'admin-001'),
('it-020', 'Network Security & Penetration Testing', 'Apply ethical hacking methodology to identify vulnerabilities.', 'computer_science', 'advanced', 3600, 70, 'Advanced cybersecurity simulation on penetration testing.', 'You are a security consultant conducting an authorized pentest for a fintech company.', 'admin-001'),
('it-021', 'Data Engineering & ETL Pipeline', 'Design and build data pipelines for enterprise analytics.', 'computer_science', 'advanced', 3600, 70, 'Advanced data engineering simulation.', 'A company needs to process 10M daily transactions from 5 source systems into a data warehouse.', 'admin-001'),
('it-022', 'Mobile App Development with React Native', 'Build cross-platform mobile applications.', 'computer_science', 'intermediate', 2700, 65, 'Demonstrate mobile development skills with React Native.', 'Build a cross-platform e-wallet mobile app for iOS and Android.', 'admin-001'),
('it-023', 'Blockchain & Web3 Architecture', 'Design blockchain solutions for enterprise use cases.', 'computer_science', 'expert', 4500, 75, 'Expert simulation on enterprise blockchain architecture.', 'A supply chain company wants to implement blockchain for end-to-end product traceability.', 'admin-001'),
('it-024', 'IT Project Management & PMP Practices', 'Apply project management principles to IT initiatives.', 'computer_science', 'intermediate', 2700, 65, 'Demonstrate IT project management skills.', 'You are PM for an ERP implementation project — ₱50M budget, 18-month timeline, 200 stakeholders.', 'admin-001'),
('it-025', 'Systems Analysis & Design', 'Conduct requirements gathering and system design.', 'computer_science', 'intermediate', 2700, 65, 'Apply SDLC and systems analysis methodologies.', 'A hospital needs a new patient management system to replace paper-based processes.', 'admin-001'),
('it-026', 'Quantum Computing Readiness Assessment', 'Evaluate quantum computing impact and prepare cryptographic migration.', 'computer_science', 'expert', 4500, 75, 'Expert simulation on quantum-safe cryptography planning.', 'Your financial institution must assess and prepare for post-quantum cryptographic threats.', 'admin-001');

INSERT OR IGNORE INTO tasks (id, simulation_id, title, description, task_type, sequence_order, max_score, tbclm_axis, keywords)
VALUES
('it-019-t1','it-019','FastAPI Application Design','Design the FastAPI application structure with dependency injection and authentication.','text_response',1,100,'T','["FastAPI","router","dependency","Pydantic","SQLAlchemy","async","await","JWT","OAuth2","middleware","schema","model","endpoint","database","validation"]'),
('it-020-t1','it-020','Penetration Test Methodology','Outline a penetration test methodology following OWASP and PTES standards.','text_response',1,100,'T','["OWASP","PTES","reconnaissance","scanning","exploitation","post-exploitation","reporting","scope","authorization","CVSS","vulnerability","risk","finding","remediation"]'),
('it-021-t1','it-021','ETL Pipeline Architecture','Design the ETL pipeline architecture for processing 10M daily transactions.','text_response',1,100,'T','["ETL","ELT","Airflow","Spark","Kafka","data lake","warehouse","transformation","partitioning","incremental","CDC","schema","quality","lineage","orchestration"]'),
('it-022-t1','it-022','React Native App Architecture','Design the React Native app architecture for the e-wallet application.','text_response',1,100,'T','["React Native","navigation","Redux","secure storage","biometrics","push notifications","offline","deep linking","performance","native modules","Expo","testing","CI/CD"]'),
('it-023-t1','it-023','Blockchain Solution Design','Design the blockchain architecture for supply chain traceability.','text_response',1,100,'T','["Hyperledger","Ethereum","smart contract","permissioned","consensus","node","wallet","transaction","immutable","traceability","NFT","DID","integration","oracle","governance"]'),
('it-024-t1','it-024','Project Charter & Risk Register','Develop the project charter and comprehensive risk register.','text_response',1,100,'L','["charter","scope","stakeholder","risk","register","probability","impact","mitigation","WBS","schedule","budget","RACI","governance","assumptions","constraints"]'),
('it-025-t1','it-025','Requirements Gathering Plan','Design the requirements gathering approach for the hospital system.','text_response',1,100,'C','["stakeholder","interview","workshop","use case","user story","functional","non-functional","requirements","document","sign-off","prototype","wireframe","validation","traceability"]'),
('it-026-t1','it-026','Quantum Threat Assessment','Assess quantum computing threats to current cryptographic systems.','text_response',1,100,'M','["post-quantum","RSA","ECC","lattice","NIST","CRYSTALS","Kyber","Dilithium","Harvest Now Decrypt Later","migration","cryptography","timeline","quantum","threat","assessment"]');

-- Add rubrics for key tasks
INSERT OR IGNORE INTO rubrics (id, task_id, criterion, description, max_points, weight, keywords_positive, keywords_negative)
VALUES
('r-hr001-t1','hr-001-t1','Completeness','Covers all major onboarding steps',10,2.0,'["documentation","orientation","equipment","mentor","benefits","training","access","introduction"]','["incomplete","missing","skip"]'),
('r-hr001-t3','hr-001-t3','Schedule Quality','Realistic and comprehensive first week plan',10,2.0,'["day 1","day 2","day 3","orientation","team","meeting","training","goals","manager"]','["vague","unstructured"]'),
('r-it001-t1','it-001-t1','Procedure Accuracy','Correct and secure password reset steps',10,2.0,'["verify","identity","ticket","Active Directory","temporary","policy","MFA","documentation"]','["insecure","skip verification","no check"]'),
('r-hr004-t1','hr-004-t1','Strategy Breadth','Multiple sourcing channels identified',10,1.5,'["job boards","linkedin","referrals","social media","headhunting","university","network"]','["single channel","only job board"]'),
('r-it008-t1','it-008-t1','Urgency & Completeness','Critical first-response actions covered',10,2.0,'["isolate","disconnect","preserve","evidence","notify","executive","document","contain"]','["delay","ignore","do nothing"]');

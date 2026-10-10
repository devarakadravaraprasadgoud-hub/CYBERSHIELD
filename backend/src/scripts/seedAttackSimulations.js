import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { AttackSimulation } from '../models/AttackSimulation.js';
import { User } from '../models/User.js';

dotenv.config();

const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/cybershield_db';

const simulationsData = [
  // =========================================================================
  // SCENARIO 1: PHISHING ATTACK
  // =========================================================================
  {
    title: 'Phishing Attack: Corporate Credential Harvesting',
    slug: 'phishing-credential-harvesting',
    description:
      'Watch how an attacker crafts a lookalike domain, bypasses basic filters with urgent messaging, and attempts to harvest employee SSO credentials. Explore how human inspection, email security gateways, and MFA completely neutralize the threat.',
    category: 'phishing',
    difficulty: 'beginner',
    estimatedDuration: '8 min',
    icon: 'MailWarning',
    learningObjectives: [
      'Understand how cybercriminals spoof reputable brand identities',
      'Identify visual and technical red flags in deceptive email communications',
      'Witness the exact point where credentials are stolen vs protected by MFA',
      'Learn the difference between clicking a link and reporting suspicious messages to SOC'
    ],
    nodes: [
      { id: 'node-start', label: 'Attacker Recon', type: 'start', x: 80, y: 160, icon: 'Globe', description: 'Attacker creates lookalike domain support@paypa1-security.com', category: 'Infrastructure', mode: 'both' },
      { id: 'node-send', label: 'Email Dispatched', type: 'attacker_action', x: 260, y: 160, icon: 'Send', description: 'Urgent security alert sent to target mailbox', category: 'Delivery', mode: 'both' },
      { id: 'node-filter', label: 'Mail Gateway Relay', type: 'system', x: 440, y: 160, icon: 'Server', description: 'Email passes through organizational MX server', category: 'Network', mode: 'both' },
      { id: 'node-weakness', label: 'Soft DMARC Policy', type: 'weakness', x: 440, y: 280, icon: 'AlertTriangle', description: 'DMARC set to p=none allowing spoofed sender display', category: 'Weakness', mode: 'attack' },
      { id: 'node-inbox', label: 'Inbound Message', type: 'attack_event', x: 620, y: 160, icon: 'Inbox', description: 'Victim receives: "Account Suspension in 24 Hours!"', category: 'Delivery', mode: 'both' },
      { id: 'node-warning', label: 'Red Flags Present', type: 'warning', x: 800, y: 160, icon: 'Search', description: 'Urgency cues, domain typosquatting, generic greeting', category: 'Detection', mode: 'both' },
      { id: 'node-decision', label: 'Employee Action', type: 'decision', x: 980, y: 160, icon: 'HelpCircle', description: 'Learner decides: Click Link or Report to Security', category: 'Human Factor', mode: 'both' },
      { id: 'node-breach', label: 'Credential Harvested', type: 'outcome', x: 1160, y: 100, icon: 'Unlock', description: 'User enters credentials into fake login page. Account compromised.', category: 'Impact', mode: 'attack' },
      { id: 'node-defense', label: 'MFA & Threat Report', type: 'defense_control', x: 1160, y: 240, icon: 'ShieldCheck', description: 'User reports email; FIDO2 token blocks illegitimate auth attempt.', category: 'Defense', mode: 'defense' },
      { id: 'node-recovery', label: 'Incident Isolated', type: 'recovery', x: 1340, y: 240, icon: 'CheckCircle2', description: 'Domain blacklisted globally across corporate firewall', category: 'Response', mode: 'defense' }
    ],
    edges: [
      { id: 'e1', from: 'node-start', to: 'node-send', label: 'Craft Payload', animated: true, mode: 'both' },
      { id: 'e2', from: 'node-send', to: 'node-filter', label: 'SMTP Transmission', animated: true, mode: 'both' },
      { id: 'e3', from: 'node-filter', to: 'node-weakness', label: 'SPF/DMARC Check', animated: true, mode: 'attack' },
      { id: 'e4', from: 'node-weakness', to: 'node-inbox', label: 'Permit Delivery', animated: true, mode: 'attack' },
      { id: 'e5', from: 'node-filter', to: 'node-inbox', label: 'Deliver', animated: true, mode: 'defense' },
      { id: 'e6', from: 'node-inbox', to: 'node-warning', label: 'User Inspects', animated: true, mode: 'both' },
      { id: 'e7', from: 'node-warning', to: 'node-decision', label: 'Evaluation', animated: true, mode: 'both' },
      { id: 'e8', from: 'node-decision', to: 'node-breach', label: 'Unsafe: Click Link', animated: true, mode: 'attack' },
      { id: 'e9', from: 'node-decision', to: 'node-defense', label: 'Safe: Report Email', animated: true, mode: 'defense' },
      { id: 'e10', from: 'node-defense', to: 'node-recovery', label: 'SOC Mitigation', animated: true, mode: 'defense' }
    ],
    attackStages: [
      {
        stageId: 'stage-1',
        stageNumber: 1,
        title: 'Infrastructure Staging & Domain Typosquatting',
        nodeId: 'node-start',
        nodeType: 'start',
        description: 'The threat actor purchases a lookalike domain and clones a legitimate corporate login interface.',
        whatIsHappening: 'The attacker registers "paypa1-security.com" (replacing the letter "l" with number "1") and hosts a high-fidelity replica of the corporate single sign-on portal.',
        whyCanThisHappen: 'Domain registries allow similar-looking domain names, and attackers exploit Unicode homoglyphs or character substitutions that deceive human perception.',
        whatShouldYouNotice: 'Check the browser address bar carefully. Notice "paypa1" instead of "paypal", or unexpected top-level domains (.security vs .com).',
        whatCouldBeImpact: 'Sets the foundation for an unmonitored external portal capable of intercepting any entered text.',
        howCanItBePrevented: 'Organizations proactively monitor brand domain registrations and configure internal DNS sinks.',
        realWorldLesson: 'Never trust sender display names alone; always inspect the fully qualified domain name (FQDN).',
        technicalDetails: 'WHOIS registration and Let\'s Encrypt SSL certificate issuance allowing fake sites to display the browser padlock icon.',
        warningSigns: ['Mismatched domain spelling', 'Recently registered domain age (< 7 days)', 'Generic SSL certificate']
      },
      {
        stageId: 'stage-2',
        stageNumber: 2,
        title: 'Social Engineering Transmission',
        nodeId: 'node-send',
        nodeType: 'attacker_action',
        description: 'The attacker crafts a spear-phishing email utilizing psychological pressure to bypass critical thinking.',
        whatIsHappening: 'An email is sent claiming "IMMEDIATE ACTION REQUIRED: Unauthorized transfer detected. Verify identity within 2 hours to avoid account freeze."',
        whyCanThisHappen: 'Attackers exploit human fear of financial loss and urgency to prompt impulsive clicking without inspection.',
        whatShouldYouNotice: 'False sense of urgency, high-pressure deadlines, and threatening consequences.',
        whatCouldBeImpact: 'Causes target users to bypass standard organizational safety protocols.',
        howCanItBePrevented: 'Train users to recognize emotional manipulation and establish verification channels outside of email.',
        realWorldLesson: 'Urgency is the primary weapon of social engineers. Legitimate services do not demand panic actions via email links.',
        technicalDetails: 'Headers show Sender: "Security Team <alert@paypa1-security.com>" with Reply-To pointing to an external mailbox.',
        warningSigns: ['Urgent 24-hour countdown timer', 'Threat of account deletion or financial penalty', 'Generic salutation "Dear Customer"']
      },
      {
        stageId: 'stage-3',
        stageNumber: 3,
        title: 'Delivery & Absence of Strict Email Authentication',
        nodeId: 'node-weakness',
        nodeType: 'weakness',
        description: 'The inbound message passes through the mail relay due to permissive DMARC policies.',
        whatIsHappening: 'Because the organization lacks an aggressive DMARC "p=reject" policy, the email gateway delivers the message to the user\'s inbox.',
        whyCanThisHappen: 'Misconfigured DNS SPF and DMARC records set to monitoring-only (p=none) rather than enforcement mode.',
        whatShouldYouNotice: 'Absence of external banner warnings or lack of DKIM cryptographic verification marks.',
        whatCouldBeImpact: 'The spoofed email appears directly inside the primary inbox next to legitimate corporate communications.',
        howCanItBePrevented: 'Enforce strict DMARC enforcement (p=reject), SPF hardfails (-all), and configure automated External Sender banner warnings.',
        realWorldLesson: 'Email authentication protocols are vital, but technical filters cannot catch 100% of newly staged attack domains.',
        technicalDetails: 'RFC 7489 DMARC policy check returns `dmarc=none action=none` allowing message forwarding.',
        warningSigns: ['Missing internal digital signature', 'Email header SPF alignment mismatch', 'Sender IP not in corporate IP range']
      },
      {
        stageId: 'stage-4',
        stageNumber: 4,
        title: 'Decision Point: Link Inspection & Action',
        nodeId: 'node-decision',
        nodeType: 'decision',
        description: 'The user opens the email and must decide whether to click the link or report the message.',
        whatIsHappening: 'The user hovers over the "Verify Account Now" button and sees the underlying destination URL.',
        whyCanThisHappen: 'Hyperlinks can display arbitrary anchor text that differs completely from their actual destination URL.',
        whatShouldYouNotice: 'Hovering reveals the true destination: `https://paypa1-security.com/login?token=x892`.',
        whatCouldBeImpact: 'Clicking directs the user\'s browser to an attacker-controlled server.',
        howCanItBePrevented: 'Train users to always hover before clicking, or navigate directly to official portals via bookmarked links.',
        realWorldLesson: 'The anchor text is just a label; only the actual destination URL determines where your browser will connect.',
        technicalDetails: 'Anchor `<a href="https://paypa1-security.com">https://paypal.com/verify</a>` obscures the actual destination.',
        warningSigns: ['Anchor text says PayPal but destination URL points elsewhere', 'Link contains tracking tokens', 'Shortened redirect URLs'],
        checkpoint: {
          question: 'The email warns your account will be suspended unless you verify within 2 hours. What is the safest course of action?',
          options: [
            {
              id: 'opt-click',
              text: 'Click the "Verify Account" link immediately to prevent your account from being frozen.',
              isCorrect: false,
              explanation: 'Never click links in unverified urgent emails. This delivers you directly to the credential harvester.',
              consequence: 'Your browser opens the clone site, and your typed credentials will be transmitted directly to the attacker.'
            },
            {
              id: 'opt-report',
              text: 'Do not click the link. Report the email using the PhishAlarm button and check your account via the official app.',
              isCorrect: true,
              explanation: 'Correct! Reporting alerts the Security Operations Center (SOC) to protect all company employees.',
              consequence: 'The SOC analyzes the sender, blocks the domain, and your credentials remain 100% secure.'
            }
          ]
        }
      },
      {
        stageId: 'stage-5',
        stageNumber: 5,
        title: 'Exploitation & Credential Exfiltration',
        nodeId: 'node-breach',
        nodeType: 'outcome',
        description: 'The user submits their credentials into the fake web form, resulting in account takeover.',
        whatIsHappening: 'The user types their username and password. An asynchronous POST request sends the plain text credentials to the attacker\'s database.',
        whyCanThisHappen: 'The fake website looks identical to the authentic login portal, and single-factor passwords lack hardware proof of origin.',
        whatShouldYouNotice: 'After logging in, the page either reloads or redirects to the real home page to avoid raising suspicion.',
        whatCouldBeImpact: 'Attacker gains access to sensitive corporate databases, customer records, and internal communications.',
        howCanItBePrevented: 'FIDO2 / WebAuthn hardware security keys, which cryptographically bind authentication to the verified domain name.',
        realWorldLesson: 'Passwords alone are no longer sufficient security. Modern phishing kits harvest credentials in real-time.',
        technicalDetails: 'HTTP POST to `/api/capture` saves `{ username: "user@corp.com", password: "...", ip: "..." }`.',
        warningSigns: ['Page reloads without logging you in', 'Browser password manager does not offer auto-fill', 'URL changes unexpectedly']
      }
    ],
    defenseStages: [
      {
        stageId: 'def-1',
        stageNumber: 1,
        title: 'Email Security Gateway & DMARC Enforcement',
        nodeId: 'node-filter',
        nodeType: 'system',
        description: 'The inbound email is evaluated by automated threat filters before reaching the user inbox.',
        whatIsHappening: 'The secure email gateway inspects headers, detects that the sender domain failed SPF/DKIM alignment, and quarantine policies take effect.',
        whyCanThisHappen: 'Defenders maintain strict DNS DMARC records with `p=reject`, ensuring fraudulent mail is blocked at the perimeter.',
        whatShouldYouNotice: 'Warning banner: "[CAUTION: External Sender with Unverified Domain]".',
        whatCouldBeImpact: 'Significantly reduces the likelihood of deceptive messages landing in user mailboxes.',
        howCanItBePrevented: 'Continuous email authentication auditing and automated spam classification.',
        realWorldLesson: 'Automated perimeter security stops bulk attacks before users ever have to make a decision.',
        technicalDetails: 'Inbound evaluation: `SPF=fail, DKIM=none, DMARC=reject` triggers automated quarantine.',
        warningSigns: ['Perimeter quarantine flag', 'Failed cryptographic signature']
      },
      {
        stageId: 'def-2',
        stageNumber: 2,
        title: 'User Awareness & One-Click SOC Reporting',
        nodeId: 'node-defense',
        nodeType: 'defense_control',
        description: 'The trained employee spots the red flags and clicks the Report Phish button.',
        whatIsHappening: 'The user recognizes the mismatched domain, avoids clicking, and submits the raw email headers to the security team.',
        whyCanThisHappen: 'Regular interactive security training empowers employees to act as human sensors for the organization.',
        whatShouldYouNotice: 'A confirmation popup confirms the message was forwarded to the security operations center.',
        whatCouldBeImpact: 'Prevents coworkers from falling for the same campaign and speeds up incident response.',
        howCanItBePrevented: 'Maintain accessible one-click reporting tools in standard email clients.',
        realWorldLesson: 'Security is a team effort. A single user reporting an attack can save an entire company.',
        technicalDetails: 'Automated SOAR playbook extracts URLs, queries VirusTotal API, and flags threat level.',
        warningSigns: ['Zero credentials exposed']
      },
      {
        stageId: 'def-3',
        stageNumber: 3,
        title: 'FIDO2 Hardware MFA & Perimeter Domain Block',
        nodeId: 'node-recovery',
        nodeType: 'recovery',
        description: 'Automated defenses quarantine the threat and protect user accounts even if passwords were typed.',
        whatIsHappening: 'The SOC firewall blocks `paypa1-security.com`. Even if a user visited the site, FIDO2/WebAuthn refused to provide tokens to the fake domain.',
        whyCanThisHappen: 'FIDO2 cryptographic authentication verifies the Origin header in the browser, making it mathematically immune to phishing.',
        whatShouldYouNotice: 'The malicious site displays a connection error, and user accounts remain entirely secure.',
        whatCouldBeImpact: 'Zero unauthorized access, zero compromised credentials, and complete organizational resilience.',
        howCanItBePrevented: 'Mandate phishing-resistant Multi-Factor Authentication across all corporate identity providers.',
        realWorldLesson: 'Phishing-resistant MFA (FIDO2 keys) turns an attempted breach into a harmless failed probe.',
        technicalDetails: 'WebAuthn navigator.credentials.get() checks `rpId: "paypal.com"`, rejecting "paypa1-security.com".',
        warningSigns: ['Incident successfully resolved']
      }
    ],
    order: 1
  },

  // =========================================================================
  // SCENARIO 2: SQL INJECTION (SQLi)
  // =========================================================================
  {
    title: 'SQL Injection: Web Database Manipulation & Query Defense',
    slug: 'sql-injection-query-defense',
    description:
      'Step through how malicious input alters database query structure when raw strings are concatenated. Compare the vulnerable path side by side with parameterized prepared statements that treat input strictly as data.',
    category: 'sqli',
    difficulty: 'intermediate',
    estimatedDuration: '10 min',
    icon: 'Database',
    learningObjectives: [
      'Understand how untrusted input breaks SQL string boundaries',
      'Discover why evaluating tautologies (1=1) bypasses authentication logic',
      'Witness how prepared statements and parameter binding eliminate SQLi',
      'Learn the difference between sanitizing strings and parameterizing queries'
    ],
    nodes: [
      { id: 'node-sqli-input', label: 'User Form Input', type: 'start', x: 80, y: 160, icon: 'Terminal', description: "Attacker enters admin' OR '1'='1 into username field", category: 'Input', mode: 'both' },
      { id: 'node-sqli-app', label: 'Web Application', type: 'system', x: 280, y: 160, icon: 'Globe', description: 'Application receives HTTP POST request', category: 'Backend', mode: 'both' },
      { id: 'node-sqli-weak', label: 'Raw String Concat', type: 'weakness', x: 480, y: 100, icon: 'AlertTriangle', description: 'Query built with string concatenation: "SELECT * FROM users WHERE u=\'" + input', category: 'Weakness', mode: 'attack' },
      { id: 'node-sqli-secure', label: 'Prepared Statement', type: 'defense_control', x: 480, y: 240, icon: 'ShieldCheck', description: 'Query pre-compiled with parameter placeholder: SELECT * FROM users WHERE u = ?', category: 'Defense', mode: 'defense' },
      { id: 'node-sqli-db', label: 'Database Engine', type: 'system', x: 700, y: 160, icon: 'Database', description: 'SQL engine parses and executes incoming instructions', category: 'Storage', mode: 'both' },
      { id: 'node-sqli-decision', label: 'Syntax Evaluation', type: 'decision', x: 900, y: 160, icon: 'HelpCircle', description: 'Engine decides: Treat input as command logic OR literal string data', category: 'Evaluation', mode: 'both' },
      { id: 'node-sqli-breach', label: 'Auth Bypass & Leak', type: 'outcome', x: 1100, y: 100, icon: 'Unlock', description: 'Tautology (1=1) evaluates to TRUE for every row. Admin access granted.', category: 'Outcome', mode: 'attack' },
      { id: 'node-sqli-safe', label: 'Safe Literal Lookup', type: 'recovery', x: 1100, y: 240, icon: 'CheckCircle2', description: 'Database searches for literal string "admin\' OR \'1\'=\'1". Zero match found.', category: 'Outcome', mode: 'defense' }
    ],
    edges: [
      { id: 'eq1', from: 'node-sqli-input', to: 'node-sqli-app', label: 'Submit Form', animated: true, mode: 'both' },
      { id: 'eq2', from: 'node-sqli-app', to: 'node-sqli-weak', label: 'Vulnerable Route', animated: true, mode: 'attack' },
      { id: 'eq3', from: 'node-sqli-app', to: 'node-sqli-secure', label: 'Secure Route', animated: true, mode: 'defense' },
      { id: 'eq4', from: 'node-sqli-weak', to: 'node-sqli-db', label: 'Direct SQL String', animated: true, mode: 'attack' },
      { id: 'eq5', from: 'node-sqli-secure', to: 'node-sqli-db', label: 'Bound Parameter', animated: true, mode: 'defense' },
      { id: 'eq6', from: 'node-sqli-db', to: 'node-sqli-decision', label: 'Query Execution', animated: true, mode: 'both' },
      { id: 'eq7', from: 'node-sqli-decision', to: 'node-sqli-breach', label: 'Evaluate Logic (1=1)', animated: true, mode: 'attack' },
      { id: 'eq8', from: 'node-sqli-decision', to: 'node-sqli-safe', label: 'Literal Match (0 rows)', animated: true, mode: 'defense' }
    ],
    attackStages: [
      {
        stageId: 'sqli-1',
        stageNumber: 1,
        title: 'Input Formulation: Breaking String Boundaries',
        nodeId: 'node-sqli-input',
        nodeType: 'start',
        description: 'The attacker inputs a single quotation mark followed by an SQL tautology.',
        whatIsHappening: 'In the login form, the attacker types `admin\' OR \'1\'=\'1`. The single quote (\') is intended to close the string delimiter inside the SQL query.',
        whyCanThisHappen: 'The application frontend accepts arbitrary characters without client or server-side syntactic isolation.',
        whatShouldYouNotice: 'The input contains SQL reserved characters like quotes, boolean keywords (OR), and equality comparisons.',
        whatCouldBeImpact: 'Prepares the payload to alter the backend database interpreter logic.',
        howCanItBePrevented: 'Use input validation and type checking, though parameterization is the true primary defense.',
        realWorldLesson: 'Never assume user input represents harmless alphanumeric text.',
        technicalDetails: "Payload characters: single quote ('), space, boolean OR, condition '1'='1'.",
        warningSigns: ['Presence of quotes in username fields', 'SQL keywords in HTTP form bodies']
      },
      {
        stageId: 'sqli-2',
        stageNumber: 2,
        title: 'Vulnerable Query Concatenation',
        nodeId: 'node-sqli-weak',
        nodeType: 'weakness',
        description: 'The server concatenates user input directly into the SQL string.',
        whatIsHappening: 'Backend code runs: `SELECT * FROM users WHERE username = \'` + input + `\' AND password = \'` + pass + `\'`.',
        whyCanThisHappen: 'Developers improperly combine programmatic commands with untrusted external data using string concatenation.',
        whatShouldYouNotice: 'The user input escapes its intended data boundary and becomes executable command code.',
        whatCouldBeImpact: 'The database cannot distinguish between instructions written by the programmer and input provided by the user.',
        howCanItBePrevented: 'Never concatenate user variables into query strings. Always separate query structure from data values.',
        realWorldLesson: 'Code injection happens when data is mistakenly interpreted as code by the receiving engine.',
        technicalDetails: 'Resulting SQL: `SELECT * FROM users WHERE username = \'admin\' OR \'1\'=\'1\' AND password = \'...\'`.',
        warningSigns: ['Database syntax errors in web server logs', 'Slow database response times']
      },
      {
        stageId: 'sqli-3',
        stageNumber: 3,
        title: 'Logical Evaluation & Authentication Bypass',
        nodeId: 'node-sqli-breach',
        nodeType: 'outcome',
        description: 'The database engine evaluates the tautology, granting full administrative access.',
        whatIsHappening: 'Because `\'1\'=\'1\'` is unconditionally true for every record in the table, the query returns the first user row (the admin account) without checking passwords.',
        whyCanThisHappen: 'Boolean logic rules: `FALSE OR TRUE` evaluates to `TRUE`. The authentication constraint is completely negated.',
        whatShouldYouNotice: 'The attacker is immediately logged into the administrative dashboard with zero valid credentials.',
        whatCouldBeImpact: 'Full database exfiltration, unauthorized modification, or complete database drops (`DROP TABLE`).',
        howCanItBePrevented: 'Parameterized queries (Prepared Statements) ensure the database treats input as a literal search term only.',
        realWorldLesson: 'A single unescaped query parameter can compromise an entire enterprise database.',
        technicalDetails: 'SQL engine returns HTTP 200 with admin authorization session token.',
        warningSigns: ['Login successful with blank password', 'Abnormal high volume data transfer']
      }
    ],
    defenseStages: [
      {
        stageId: 'def-sqli-1',
        stageNumber: 1,
        title: 'Parameterized Query Compilation',
        nodeId: 'node-sqli-secure',
        nodeType: 'defense_control',
        description: 'The application compiles query structure before binding user values.',
        whatIsHappening: 'The server executes: `SELECT * FROM users WHERE username = ? AND password = ?`. The database compiles the execution plan with empty placeholders.',
        whyCanThisHappen: 'Parameterized queries separate the SQL syntax parsing phase from the runtime data assignment phase.',
        whatShouldYouNotice: 'Question marks (`?`) represent values; they can never change the structure or logic of the SQL statement.',
        whatCouldBeImpact: 'SQL injection becomes mathematically impossible because user input is never parsed by the query compiler.',
        howCanItBePrevented: 'Mandate ORMs (e.g. Prisma, Mongoose, Hibernate) or parameterized database drivers (e.g. PDO, pg, mysql2).',
        realWorldLesson: 'Prepared statements treat user input as inert data values, preventing injection entirely.',
        technicalDetails: 'Database protocol `PREPARE stmt FROM ...; EXECUTE stmt USING @user;`.',
        warningSigns: ['Zero syntax errors']
      },
      {
        stageId: 'def-sqli-2',
        stageNumber: 2,
        title: 'Safe Literal Lookup & Rejection',
        nodeId: 'node-sqli-safe',
        nodeType: 'recovery',
        description: 'The database looks for a literal username equal to the string provided.',
        whatIsHappening: 'The database searches for a user whose literal username is `"admin\' OR \'1\'=\'1"`. No such user exists, and 0 rows are returned.',
        whyCanThisHappen: 'The single quotes are treated as literal text characters rather than syntax delimiters.',
        whatShouldYouNotice: 'Login fails safely with "Invalid username or password" message.',
        whatCouldBeImpact: 'Database remains 100% confidential and integral. Zero unauthorized data leaked.',
        howCanItBePrevented: 'Combine prepared statements with principle of least privilege for database service accounts.',
        realWorldLesson: 'When security controls are architecturally sound, malicious payloads fail silently and safely.',
        technicalDetails: 'Query returns `Empty set (0.00 sec)`. Application responds with HTTP 401 Unauthorized.',
        warningSigns: ['Safe denial of access']
      }
    ],
    order: 2
  },

  // =========================================================================
  // SCENARIO 3: RANSOMWARE AWARENESS
  // =========================================================================
  {
    title: 'Ransomware Awareness: Malicious Execution to Air-Gapped Recovery',
    slug: 'ransomware-execution-recovery',
    description:
      'Explore how deceptive file extensions and macro execution trigger unauthorized file encryption. Follow the incident response lifecycle from process detection and device isolation to immutable backup restoration.',
    category: 'ransomware',
    difficulty: 'advanced',
    estimatedDuration: '12 min',
    icon: 'FileLock2',
    learningObjectives: [
      'Learn how attackers conceal executable binaries inside document file formats',
      'Understand how ransomware deletes Volume Shadow Copies before encrypting files',
      'Discover the critical importance of immediate network isolation during an active infection',
      'Recognize how immutable, 3-2-1 backup strategies eliminate ransom payment demands'
    ],
    nodes: [
      { id: 'node-rw-att', label: 'Suspicious Email Attachment', type: 'start', x: 80, y: 160, icon: 'FileText', description: 'Email arrives with attachment: Q4_Invoice.pdf.exe', category: 'Delivery', mode: 'both' },
      { id: 'node-rw-weak', label: 'Hidden Extensions Enabled', type: 'weakness', x: 280, y: 160, icon: 'AlertTriangle', description: 'Windows Explorer hides .exe extension, appearing as harmless PDF', category: 'Weakness', mode: 'attack' },
      { id: 'node-rw-exec', label: 'User Double-Clicks', type: 'user_action', x: 480, y: 160, icon: 'MousePointerClick', description: 'Executable launches binary process into system memory', category: 'Execution', mode: 'both' },
      { id: 'node-rw-shadow', label: 'Shadow Copies Deleted', type: 'attack_event', x: 680, y: 100, icon: 'Trash2', description: 'Commands run: vssadmin delete shadows /all /quiet', category: 'Evasion', mode: 'attack' },
      { id: 'node-rw-edr', label: 'EDR Behavioral Alert', type: 'warning', x: 680, y: 240, icon: 'Activity', description: 'Endpoint detection flags mass file renaming and anomalous AES key generation', category: 'Detection', mode: 'defense' },
      { id: 'node-rw-decision', label: 'Containment Action', type: 'decision', x: 880, y: 160, icon: 'HelpCircle', description: 'Decide: Disconnect network cable OR attempt antivirus scan while online', category: 'Response', mode: 'both' },
      { id: 'node-rw-encrypt', label: 'Files Encrypted (.locked)', type: 'outcome', x: 1080, y: 100, icon: 'FileLock2', description: 'Local files and network shares encrypted. Ransom note displayed.', category: 'Impact', mode: 'attack' },
      { id: 'node-rw-isolate', label: 'Host Network Isolation', type: 'defense_control', x: 1080, y: 240, icon: 'Network', description: 'Host instantly severed from network; lateral movement stopped.', category: 'Containment', mode: 'defense' },
      { id: 'node-rw-restore', label: 'Air-Gapped Backup Restore', type: 'recovery', x: 1280, y: 240, icon: 'History', description: 'Device re-imaged and files restored from immutable backup.', category: 'Recovery', mode: 'defense' }
    ],
    edges: [
      { id: 'er1', from: 'node-rw-att', to: 'node-rw-weak', label: 'Inspect File', animated: true, mode: 'both' },
      { id: 'er2', from: 'node-rw-weak', to: 'node-rw-exec', label: 'Launch Program', animated: true, mode: 'both' },
      { id: 'er3', from: 'node-rw-exec', to: 'node-rw-shadow', label: 'Unrestricted Execution', animated: true, mode: 'attack' },
      { id: 'er4', from: 'node-rw-exec', to: 'node-rw-edr', label: 'Behavioral Monitoring', animated: true, mode: 'defense' },
      { id: 'er5', from: 'node-rw-shadow', to: 'node-rw-decision', label: 'Encryption Staging', animated: true, mode: 'attack' },
      { id: 'er6', from: 'node-rw-edr', to: 'node-rw-decision', label: 'Automated Containment', animated: true, mode: 'defense' },
      { id: 'er7', from: 'node-rw-decision', to: 'node-rw-encrypt', label: 'Delayed Response', animated: true, mode: 'attack' },
      { id: 'er8', from: 'node-rw-decision', to: 'node-rw-isolate', label: 'Isolate Device', animated: true, mode: 'defense' },
      { id: 'er9', from: 'node-rw-isolate', to: 'node-rw-restore', label: 'Clean Recovery', animated: true, mode: 'defense' }
    ],
    attackStages: [
      {
        stageId: 'rw-1',
        stageNumber: 1,
        title: 'Payload Masquerading & Double Extensions',
        nodeId: 'node-rw-att',
        nodeType: 'start',
        description: 'An invoice email contains a disguised binary executable.',
        whatIsHappening: 'The file name is `Q4_Audit_Invoice.pdf.exe`. Because standard operating systems often hide known file extensions by default, the user only sees `Q4_Audit_Invoice.pdf`.',
        whyCanThisHappen: 'Operating system configuration defaults designed for consumer convenience hide the final file extension.',
        whatShouldYouNotice: 'The file type icon is a generic application icon rather than a certified Adobe/PDF document icon.',
        whatCouldBeImpact: 'Tricking the user into executing arbitrary native code with local privileges.',
        howCanItBePrevented: 'Enable "File name extensions" in Windows Explorer, and configure email gateways to block incoming `.exe`, `.scr`, and `.bat` attachments.',
        realWorldLesson: 'Always verify the true file extension and never execute attachments sent unexpectedly.',
        technicalDetails: 'MIME-type `application/x-msdownload` delivered inside ZIP archive to evade simple boundary sniffers.',
        warningSigns: ['Double extensions in filenames (.pdf.exe)', 'Missing digital certificate signature', 'Sender address does not match accounting team']
      },
      {
        stageId: 'rw-2',
        stageNumber: 2,
        title: 'Execution & Volume Shadow Copy Deletion',
        nodeId: 'node-rw-shadow',
        nodeType: 'attack_event',
        description: 'The ransomware process launches and terminates recovery mechanisms.',
        whatIsHappening: 'The malware spawns command-line utilities to delete Windows Volume Shadow Copies: `vssadmin.exe Delete Shadows /All /Quiet`.',
        whyCanThisHappen: 'Local administrative privileges allow child processes to execute privileged system backup commands.',
        whatShouldYouNotice: 'Unusual command prompts flashing briefly and rapid hard drive disk write operations.',
        whatCouldBeImpact: 'Prevents the user from using standard Windows System Restore to revert back to previous file versions.',
        howCanItBePrevented: 'Enforce Principle of Least Privilege (standard user accounts without local admin rights) and command-line auditing.',
        realWorldLesson: 'Ransomware intentionally destroys local backup tools before encrypting your files.',
        technicalDetails: 'Executes `wbadmin delete catalog -quiet` and `bcdedit /set {default} recoveryenabled No`.',
        warningSigns: ['Unexpected UAC prompt requesting administrator rights', 'High CPU activity from unknown processes']
      },
      {
        stageId: 'rw-3',
        stageNumber: 3,
        title: 'Mass File Encryption & Lateral Movement',
        nodeId: 'node-rw-encrypt',
        nodeType: 'outcome',
        description: 'User documents are encrypted with AES-256 and public key cryptography.',
        whatIsHappening: 'The malware iterates through documents, photos, and spreadsheets, encrypting file contents and appending `.locked`. A `README_RESTORE.txt` ransom note appears on the desktop.',
        whyCanThisHappen: 'Ransomware uses hybrid encryption: symmetric keys encrypt files quickly, while the attacker\'s public RSA key protects the symmetric key.',
        whatShouldYouNotice: 'Files cannot be opened, desktop wallpaper changes, and instructions demand cryptocurrency payments.',
        whatCouldBeImpact: 'Severe business disruption, total data loss, and extortion demands.',
        howCanItBePrevented: 'Maintain offline air-gapped backups, implement application allowlisting (AppLocker), and deploy EDR tools.',
        realWorldLesson: 'Never pay the ransom. Paying finances criminal enterprises and provides no guarantee files will be recovered.',
        technicalDetails: 'Files renamed to `filename.docx.locked` with AES-256 CBC cipher mode.',
        warningSigns: ['File extensions changing to unfamiliar strings', 'Ransomware instruction notepad files on Desktop']
      }
    ],
    defenseStages: [
      {
        stageId: 'def-rw-1',
        stageNumber: 1,
        title: 'Endpoint Behavioral Detection (EDR)',
        nodeId: 'node-rw-edr',
        nodeType: 'warning',
        description: 'Behavioral antivirus halts rapid file encryption attempts.',
        whatIsHappening: 'The EDR agent detects a process attempting to modify 50 files in under 2 seconds and delete Volume Shadow Copies. The process is instantly terminated.',
        whyCanThisHappen: 'Modern security relies on behavioral heuristics rather than waiting for known antivirus signature hashes.',
        whatShouldYouNotice: 'Security pop-up: "Suspicious Ransomware-like Behavior Blocked: Process Q4_Invoice.exe terminated."',
        whatCouldBeImpact: 'Only 2-3 sample files touched before the malware was killed in system memory.',
        howCanItBePrevented: 'Deploy enterprise EDR (e.g. CrowdStrike, Microsoft Defender for Endpoint) on all workstations.',
        realWorldLesson: 'Heuristic detection identifies brand-new zero-day malware that signature scanners miss.',
        technicalDetails: 'API hook on `CryptEncrypt` and `MoveFileExW` flags anomalous entropy threshold.',
        warningSigns: ['Zero network propagation']
      },
      {
        stageId: 'def-rw-2',
        stageNumber: 2,
        title: 'Immediate Network Isolation & Immutable Restore',
        nodeId: 'node-rw-restore',
        nodeType: 'recovery',
        description: 'The host is isolated from network shares, and clean files are restored from immutable backups.',
        whatIsHappening: 'The system administrator severs the device from the network to stop lateral spread. The machine is wiped, re-imaged, and files restored from read-only cloud backups.',
        whyCanThisHappen: 'Immutable backups cannot be deleted or modified, even by administrator accounts, during their retention window.',
        whatShouldYouNotice: 'The workstation returns to operational status within hours without paying a single dollar in ransom.',
        whatCouldBeImpact: 'Zero financial loss, zero data loss, and complete operational recovery.',
        howCanItBePrevented: 'Implement the 3-2-1 backup rule (3 copies, 2 different media, 1 offsite/immutable air-gap).',
        realWorldLesson: 'An air-gapped backup strategy is the ultimate silver bullet against ransomware extortion.',
        technicalDetails: 'AWS S3 Object Lock in Compliance Mode prevents data deletion or encryption.',
        warningSigns: ['Workstation cleanly restored']
      }
    ],
    order: 3
  },

  // =========================================================================
  // SCENARIO 4: MAN-IN-THE-MIDDLE (MitM)
  // =========================================================================
  {
    title: 'Man-in-the-Middle: Rogue Wi-Fi Interception vs TLS 1.3 Encryption',
    slug: 'mitm-wifi-interception-tls',
    description:
      'Visualize how an attacker establishes a rogue wireless access point (Evil Twin) to intercept unencrypted HTTP credentials. Contrast this with TLS 1.3 certificate validation and HSTS enforcement that keeps communications secure.',
    category: 'mitm',
    difficulty: 'intermediate',
    estimatedDuration: '9 min',
    icon: 'Radio',
    learningObjectives: [
      'Understand how ARP spoofing and rogue access points intercept network packets',
      'See why unencrypted HTTP traffic exposes session cookies and passwords in plain text',
      'Discover how TLS certificates cryptographically verify server identity',
      'Learn how VPN tunnels and HSTS protect users on untrusted public Wi-Fi networks'
    ],
    nodes: [
      { id: 'node-mitm-client', label: 'User Laptop', type: 'start', x: 80, y: 160, icon: 'Laptop', description: 'User connects to public Wi-Fi at coffee shop', category: 'Client', mode: 'both' },
      { id: 'node-mitm-ap', label: 'Rogue Access Point', type: 'attacker_action', x: 300, y: 160, icon: 'Wifi', description: 'Attacker creates Evil Twin AP: "Starbucks_Free_WiFi"', category: 'Network', mode: 'both' },
      { id: 'node-mitm-weak', label: 'Unencrypted HTTP', type: 'weakness', x: 520, y: 100, icon: 'Unlock', description: 'Website serves login over plaintext HTTP protocol (port 80)', category: 'Weakness', mode: 'attack' },
      { id: 'node-mitm-tls', label: 'TLS 1.3 Encryption', type: 'defense_control', x: 520, y: 240, icon: 'Lock', description: 'Connection upgraded to HTTPS with valid CA-signed certificate', category: 'Defense', mode: 'defense' },
      { id: 'node-mitm-sniff', label: 'Packet Sniffer (Wireshark)', type: 'attack_event', x: 740, y: 100, icon: 'Binary', description: 'Attacker captures raw TCP packets passing through the access point', category: 'Interception', mode: 'attack' },
      { id: 'node-mitm-cert', label: 'Certificate Validation', type: 'system', x: 740, y: 240, icon: 'ShieldCheck', description: 'Browser verifies certificate chain against trusted Root CA store', category: 'Verification', mode: 'defense' },
      { id: 'node-mitm-decision', label: 'Security Warning', type: 'decision', x: 960, y: 160, icon: 'HelpCircle', description: 'Decide: Bypass browser invalid SSL warning OR disconnect', category: 'Human Factor', mode: 'both' },
      { id: 'node-mitm-breach', label: 'Session Hijacked', type: 'outcome', x: 1180, y: 100, icon: 'FileWarning', description: 'Attacker copies plain text session cookie and assumes user identity.', category: 'Outcome', mode: 'attack' },
      { id: 'node-mitm-safe', label: 'Secure Tunnel Established', type: 'recovery', x: 1180, y: 240, icon: 'CheckCircle2', description: 'Encrypted payload cannot be decoded. Zero plaintext leaked.', category: 'Outcome', mode: 'defense' }
    ],
    edges: [
      { id: 'em1', from: 'node-mitm-client', to: 'node-mitm-ap', label: 'Connect Wi-Fi', animated: true, mode: 'both' },
      { id: 'em2', from: 'node-mitm-ap', to: 'node-mitm-weak', label: 'Route HTTP Traffic', animated: true, mode: 'attack' },
      { id: 'em3', from: 'node-mitm-ap', to: 'node-mitm-tls', label: 'Route HTTPS Traffic', animated: true, mode: 'defense' },
      { id: 'em4', from: 'node-rw-weak', to: 'node-mitm-sniff', label: 'Inspect Packets', animated: true, mode: 'attack' },
      { id: 'em5', from: 'node-mitm-tls', to: 'node-mitm-cert', label: 'Validate Identity', animated: true, mode: 'defense' },
      { id: 'em6', from: 'node-mitm-sniff', to: 'node-mitm-decision', label: 'Observe Data', animated: true, mode: 'attack' },
      { id: 'em7', from: 'node-mitm-cert', to: 'node-mitm-decision', label: 'Verify Trust', animated: true, mode: 'defense' },
      { id: 'em8', from: 'node-mitm-decision', to: 'node-mitm-breach', label: 'Proceed Unsafe', animated: true, mode: 'attack' },
      { id: 'em9', from: 'node-mitm-decision', to: 'node-mitm-safe', label: 'Enforce Encryption', animated: true, mode: 'defense' }
    ],
    attackStages: [
      {
        stageId: 'mitm-1',
        stageNumber: 1,
        title: 'Rogue Access Point & Traffic Redirection',
        nodeId: 'node-mitm-ap',
        nodeType: 'attacker_action',
        description: 'The threat actor deploys a clone Wi-Fi hotspot in a public venue.',
        whatIsHappening: 'The attacker broadcasts a high-powered Wi-Fi SSID identical to the coffee shop\'s official network. The victim\'s device connects automatically.',
        whyCanThisHappen: 'Standard Wi-Fi devices automatically connect to recognized network names without authenticating the hardware MAC address of the router.',
        whatShouldYouNotice: 'Unsecured open Wi-Fi network without a padlock or password prompt.',
        whatCouldBeImpact: 'All internet traffic originating from the victim passes directly through the attacker\'s network adapter.',
        howCanItBePrevented: 'Disable "Auto-Connect to Open Wi-Fi" on mobile devices, and utilize cellular data or trusted VPNs.',
        realWorldLesson: 'Never assume a public Wi-Fi network is safe just because the name matches the business.',
        technicalDetails: 'Tools like Wi-Fi Pineapple perform deauthentication frames to force clients onto rogue APs.',
        warningSigns: ['Open network requiring no password', 'Two networks with identical names visible']
      },
      {
        stageId: 'mitm-2',
        stageNumber: 2,
        title: 'Plaintext Packet Interception',
        nodeId: 'node-mitm-sniff',
        nodeType: 'attack_event',
        description: 'Unencrypted HTTP traffic is read in real time using packet analysis tools.',
        whatIsHappening: 'When the victim logs into an unencrypted website, the attacker inspects the TCP payload and reads: `Cookie: session_id=98f12a; user=alice; pass=Secret123`.',
        whyCanThisHappen: 'HTTP transmits data in cleartext ASCII across the wire without mathematical encryption.',
        whatShouldYouNotice: 'Browser address bar shows "Not Secure" or a red broken padlock symbol.',
        whatCouldBeImpact: 'Immediate credential theft and complete session hijacking.',
        howCanItBePrevented: 'Web developers must enforce HTTPS and implement HTTP Strict Transport Security (HSTS).',
        realWorldLesson: 'On an unencrypted network, your digital traffic is as visible as writing on a postcard.',
        technicalDetails: 'Wireshark packet capture filter `http.request.method == "POST"` extracts form parameters.',
        warningSigns: ['Address starts with http:// rather than https://', 'Browser warns connection is not private']
      },
      {
        stageId: 'mitm-3',
        stageNumber: 3,
        title: 'Session Hijacking & Account Assumption',
        nodeId: 'node-mitm-breach',
        nodeType: 'outcome',
        description: 'The attacker imports the intercepted session token into their own browser.',
        whatIsHappening: 'The attacker injects the victim\'s `session_id` into their browser storage and refreshes. The server treats the attacker as the authenticated victim.',
        whyCanThisHappen: 'Web servers rely on cookies to maintain state; whoever possesses the token is treated as the authenticated user.',
        whatShouldYouNotice: 'Unauthorized account activity logged from unexpected IP addresses.',
        whatCouldBeImpact: 'Identity theft, unauthorized transactions, and data theft.',
        howCanItBePrevented: 'Require TLS 1.3 encryption and set `Secure` and `HttpOnly` flags on all authentication cookies.',
        realWorldLesson: 'Session tokens are as valuable as passwords. Protect them with universal encryption.',
        technicalDetails: 'Cookie injection via browser developer console `document.cookie="session_id=..."`.',
        warningSigns: ['Sudden logouts from mobile sessions', 'Unknown active login sessions']
      }
    ],
    defenseStages: [
      {
        stageId: 'def-mitm-1',
        stageNumber: 1,
        title: 'End-to-End TLS 1.3 Cryptographic Protection',
        nodeId: 'node-mitm-tls',
        nodeType: 'defense_control',
        description: 'All communication is wrapped inside a secure TLS cryptographic envelope.',
        whatIsHappening: 'The client and server perform a TLS 1.3 handshake, exchanging ephemeral Diffie-Hellman keys to encrypt all payloads.',
        whyCanThisHappen: 'Modern browsers automatically enforce encrypted transport protocols.',
        whatShouldYouNotice: 'Browser shows a secure padlock and `https://` prefix.',
        whatCouldBeImpact: 'Even though packets pass through the attacker\'s router, the attacker sees only random ciphertext.',
        howCanItBePrevented: 'Configure HSTS preload headers to block downgrade attacks.',
        realWorldLesson: 'Encryption ensures that intercepting data yields nothing more than unreadable noise.',
        technicalDetails: 'Cipher suite TLS_AES_256_GCM_SHA384 provides authenticated encryption with perfect forward secrecy.',
        warningSigns: ['Verified digital certificate']
      },
      {
        stageId: 'def-mitm-2',
        stageNumber: 2,
        title: 'Certificate Chain Validation & VPN Tunneling',
        nodeId: 'node-mitm-safe',
        nodeType: 'recovery',
        description: 'Attempted certificate spoofing is rejected by the browser.',
        whatIsHappening: 'If the attacker attempts an SSL-stripping attack, the browser blocks the connection because the attacker\'s fake certificate is not signed by a trusted Certificate Authority.',
        whyCanThisHappen: 'Public Key Infrastructure (PKI) guarantees mathematical proof of the server\'s real identity.',
        whatShouldYouNotice: 'A full tunnel VPN encrypts all DNS queries and traffic from the laptop to the VPN gateway.',
        whatCouldBeImpact: 'Zero data intercepted, zero credentials exposed, complete confidentiality.',
        howCanItBePrevented: 'Always use an enterprise VPN on untrusted public Wi-Fi networks.',
        realWorldLesson: 'Never click past a certificate warning. It is the browser\'s loudest alarm that someone is tampering with your traffic.',
        technicalDetails: 'X.509 certificate validation checks Subject Alternative Name (SAN) and OCSP revocation status.',
        warningSigns: ['Connection completely secured']
      }
    ],
    order: 4
  },

  // =========================================================================
  // SCENARIO 5: DENIAL-OF-SERVICE (DoS / DDoS)
  // =========================================================================
  {
    title: 'Denial of Service: Botnet Floods & Anycast Edge Mitigation',
    slug: 'dos-botnet-flooding-mitigation',
    description:
      'Witness how thousands of compromised botnet nodes overwhelm server socket backlogs and memory. Discover how edge rate limiting, SYN cookies, and Anycast scrubbing centers absorb and filter malicious surges in real time.',
    category: 'dos',
    difficulty: 'intermediate',
    estimatedDuration: '9 min',
    icon: 'Activity',
    learningObjectives: [
      'Understand how SYN flood attacks exploit the TCP 3-way handshake',
      'Discover how application-layer HTTP floods exhaust web server CPU and database connections',
      'Learn how Anycast DNS and cloud scrubbing centers distribute attack traffic globally',
      'Recognize rate limiting and web application firewall (WAF) challenges'
    ],
    nodes: [
      { id: 'node-dos-bot', label: 'Botnet Command (C2)', type: 'start', x: 80, y: 160, icon: 'Bot', description: 'Attacker orchestrates 50,000 infected IoT bot nodes', category: 'Attacker', mode: 'both' },
      { id: 'node-dos-surge', label: 'Traffic Surge (500k req/s)', type: 'attacker_action', x: 280, y: 160, icon: 'Zap', description: 'Coordinated flood of TCP SYN packets and HTTP GET requests', category: 'Flood', mode: 'both' },
      { id: 'node-dos-weak', label: 'Single Origin Server', type: 'weakness', x: 480, y: 100, icon: 'ServerCrash', description: 'Single physical server with limited TCP backlog queue (1,024 sockets)', category: 'Weakness', mode: 'attack' },
      { id: 'node-dos-cdn', label: 'Anycast Edge Network', type: 'defense_control', x: 480, y: 240, icon: 'Cloud', description: 'Cloud scrubbing center with 100+ Tbps global edge capacity', category: 'Defense', mode: 'defense' },
      { id: 'node-dos-spike', label: 'Latency Spikes (15,000ms)', type: 'warning', x: 680, y: 100, icon: 'TrendingUp', description: 'CPU usage hits 100%; response times degrade from 40ms to timeouts', category: 'Telemetry', mode: 'attack' },
      { id: 'node-dos-rate', label: 'Rate Limiting & SYN Cookies', type: 'system', x: 680, y: 240, icon: 'Sliders', description: 'Edge inspects IP velocity and challenges bots with JavaScript verification', category: 'Mitigation', mode: 'defense' },
      { id: 'node-dos-decision', label: 'Mitigation Strategy', type: 'decision', x: 880, y: 160, icon: 'HelpCircle', description: 'Decide: Restart server manually OR enable automated Cloud WAF rule', category: 'Strategy', mode: 'both' },
      { id: 'node-dos-down', label: 'Service Outage (HTTP 503)', type: 'outcome', x: 1080, y: 100, icon: 'XCircle', description: 'Server crashes. Legitimate customers cannot access application.', category: 'Outage', mode: 'attack' },
      { id: 'node-dos-up', label: 'Service Stabilized (99.99%)', type: 'recovery', x: 1080, y: 240, icon: 'CheckCircle2', description: 'Bot traffic absorbed at edge; legitimate users experience instant 45ms latency.', category: 'Uptime', mode: 'defense' }
    ],
    edges: [
      { id: 'ed1', from: 'node-dos-bot', to: 'node-dos-surge', label: 'Broadcast Command', animated: true, mode: 'both' },
      { id: 'ed2', from: 'node-dos-surge', to: 'node-dos-weak', label: 'Target Origin IP', animated: true, mode: 'attack' },
      { id: 'ed3', from: 'node-dos-surge', to: 'node-dos-cdn', label: 'Route via Anycast', animated: true, mode: 'defense' },
      { id: 'ed4', from: 'node-dos-weak', to: 'node-dos-spike', label: 'Resource Exhaustion', animated: true, mode: 'attack' },
      { id: 'ed5', from: 'node-dos-cdn', to: 'node-dos-rate', label: 'Filter Attack Vectors', animated: true, mode: 'defense' },
      { id: 'ed6', from: 'node-dos-spike', to: 'node-dos-decision', label: 'Alert Triggered', animated: true, mode: 'attack' },
      { id: 'ed7', from: 'node-dos-rate', to: 'node-dos-decision', label: 'Telemetry Verified', animated: true, mode: 'defense' },
      { id: 'ed8', from: 'node-dos-decision', to: 'node-dos-down', label: 'Unmitigated Flood', animated: true, mode: 'attack' },
      { id: 'ed9', from: 'node-dos-decision', to: 'node-dos-up', label: 'Activate Edge Shield', animated: true, mode: 'defense' }
    ],
    attackStages: [
      {
        stageId: 'dos-1',
        stageNumber: 1,
        title: 'Botnet Marshaling & SYN Flood Launch',
        nodeId: 'node-dos-surge',
        nodeType: 'attacker_action',
        description: 'Threat actors trigger a massive volume of half-open TCP connection requests.',
        whatIsHappening: 'Thousands of compromised botnet devices send TCP SYN packets with spoofed source IP addresses. The origin server allocates memory for each connection and waits for the completion ACK.',
        whyCanThisHappen: 'The TCP handshake requires servers to hold socket resources in memory while waiting for the client to complete the 3-way handshake.',
        whatShouldYouNotice: 'Inbound bandwidth surges dramatically, and the server socket table reaches maximum capacity.',
        whatCouldBeImpact: 'No new connections can be accepted, even from legitimate users.',
        howCanItBePrevented: 'Enable SYN Cookies in the operating system kernel and deploy Anycast edge proxies.',
        realWorldLesson: 'Denial of Service attacks target availability rather than confidentiality; their goal is to silence your service.',
        technicalDetails: 'Kernel parameter `net.ipv4.tcp_max_syn_backlog` exceeded, triggering kernel dropped packet events.',
        warningSigns: ['SYN_RECV socket count spikes to maximum', 'Inbound bandwidth saturates network link']
      },
      {
        stageId: 'dos-2',
        stageNumber: 2,
        title: 'Resource Exhaustion & Complete Outage',
        nodeId: 'node-dos-down',
        nodeType: 'outcome',
        description: 'Server CPU and memory collapse under load, producing 503 errors.',
        whatIsHappening: 'Database connection pools are exhausted, web server workers are pinned at 100% CPU, and the operating system crashes or drops incoming packets.',
        whyCanThisHappen: 'The server has finite hardware resources, while the distributed botnet has vastly superior aggregate bandwidth.',
        whatShouldYouNotice: 'Legitimate web visitors receive "HTTP 503 Service Unavailable" or connection timeout errors.',
        whatCouldBeImpact: 'Financial losses, reputational damage, and SLA penalty breaches.',
        howCanItBePrevented: 'Use multi-region auto-scaling and cloud-based DDoS scrubbing networks (Cloudflare, AWS Shield).',
        realWorldLesson: 'A single web server cannot survive a distributed flood on its own; resilient infrastructure requires distributed edge absorption.',
        technicalDetails: 'Apache/Nginx workers saturated: `server reached MaxRequestWorkers setting`.',
        warningSigns: ['Response latency climbs to 10+ seconds', 'Monitoring alerts ping 100% loss']
      }
    ],
    defenseStages: [
      {
        stageId: 'def-dos-1',
        stageNumber: 1,
        title: 'Anycast DNS Scrubbing & Edge Rate Limiting',
        nodeId: 'node-dos-rate',
        nodeType: 'defense_control',
        description: 'Traffic is routed across a distributed edge network where bots are challenged.',
        whatIsHappening: 'Anycast routing splits the 500k req/s attack across 300 global data centers. Each local node absorbs a small fraction of the traffic and filters out spoofed SYN packets using SYN cookies.',
        whyCanThisHappen: 'Edge networks possess tens of terabits of bandwidth, rendering localized botnet floods insignificant.',
        whatShouldYouNotice: 'Bot IP addresses are issued managed JavaScript challenges; automated bots fail the challenge and are dropped at the edge.',
        whatCouldBeImpact: 'Only verified human traffic ever reaches the backend origin web server.',
        howCanItBePrevented: 'Implement edge rate limits (e.g. max 100 requests per IP per minute) and geo-blocking if applicable.',
        realWorldLesson: 'Filter the flood at the edge before a single malicious packet touches your origin server.',
        technicalDetails: 'SYN cookie encodes connection state in TCP sequence number without allocating kernel RAM.',
        warningSigns: ['Attack traffic dropped at edge; origin server CPU at normal 12%']
      },
      {
        stageId: 'def-dos-2',
        stageNumber: 2,
        title: 'Origin Stabilization & Continuous Uptime',
        nodeId: 'node-dos-up',
        nodeType: 'recovery',
        description: 'The web service maintains 100% availability for legitimate users.',
        whatIsHappening: 'Real users access the application without experiencing any delay. The origin server receives only clean, authenticated HTTP requests.',
        whyCanThisHappen: 'Layered defenses successfully filter network-layer (Layer 4) and application-layer (Layer 7) anomalies.',
        whatShouldYouNotice: 'Latency remains flat at 45ms, and the operational dashboard shows green status.',
        whatCouldBeImpact: 'Zero downtime, zero business interruption, and complete resilience against volumetric attacks.',
        howCanItBePrevented: 'Hide origin IP addresses behind reverse proxies so attackers cannot bypass edge defenses.',
        realWorldLesson: 'Resilience is achieved by design, not by panic during an attack.',
        technicalDetails: 'Origin firewall allows incoming connections exclusively from verified Cloudflare IP CIDR blocks.',
        warningSigns: ['Full service availability maintained']
      }
    ],
    order: 5
  },

  // =========================================================================
  // SCENARIO 6: PASSWORD ATTACKS & CREDENTIAL STUFFING
  // =========================================================================
  {
    title: 'Password Attacks: Credential Stuffing & Adaptive MFA Defense',
    slug: 'password-brute-force-mfa-defense',
    description:
      'Learn how automated credential stuffing scripts test billions of leaked username and password combinations. See how rate limiting, account lockout policies, and adaptive Multi-Factor Authentication stop unauthorized logins instantly.',
    category: 'password',
    difficulty: 'beginner',
    estimatedDuration: '8 min',
    icon: 'KeyRound',
    learningObjectives: [
      'Understand the danger of password reuse across multiple internet services',
      'See how automated credential stuffing bots test breached credentials against login endpoints',
      'Witness how exponential backoff and rate limiting neutralize automated dictionary attacks',
      'Learn how time-based one-time passwords (TOTP) and push notifications protect accounts'
    ],
    nodes: [
      { id: 'node-pwd-combo', label: 'Breached Combo List', type: 'start', x: 80, y: 160, icon: 'FileText', description: 'Attacker acquires 10,000 username:password pairs from third-party breach', category: 'Attacker', mode: 'both' },
      { id: 'node-pwd-bot', label: 'Automated Login Bot', type: 'attacker_action', x: 280, y: 160, icon: 'Cpu', description: 'Script fires 200 authentication attempts per second', category: 'Automation', mode: 'both' },
      { id: 'node-pwd-weak', label: 'No Rate Limiting', type: 'weakness', x: 480, y: 100, icon: 'AlertTriangle', description: 'Login endpoint allows infinite failed attempts without delay', category: 'Weakness', mode: 'attack' },
      { id: 'node-pwd-limit', label: 'Adaptive Rate Limiter', type: 'defense_control', x: 480, y: 240, icon: 'ShieldAlert', description: 'Login endpoint throttles IP and requires CAPTCHA after 3 failures', category: 'Defense', mode: 'defense' },
      { id: 'node-pwd-match', label: 'Reused Password Match', type: 'attack_event', x: 680, y: 100, icon: 'Check', description: 'Target user reused password "Summer2024!" from compromised forum', category: 'Breach', mode: 'attack' },
      { id: 'node-pwd-mfa', label: 'MFA Challenge Prompt', type: 'warning', x: 680, y: 240, icon: 'Smartphone', description: 'System requires 6-digit TOTP code sent to user authenticator app', category: 'Verification', mode: 'defense' },
      { id: 'node-pwd-decision', label: 'Authentication Step', type: 'decision', x: 880, y: 160, icon: 'HelpCircle', description: 'Decide: Issue session cookie based on password alone OR demand 2nd factor', category: 'Policy', mode: 'both' },
      { id: 'node-pwd-breach', label: 'Account Takeover', type: 'outcome', x: 1080, y: 100, icon: 'Unlock', description: 'Attacker enters user account, changes recovery email, and drains data.', category: 'Outcome', mode: 'attack' },
      { id: 'node-pwd-safe', label: 'Unauthorized Login Blocked', type: 'recovery', x: 1080, y: 240, icon: 'CheckCircle2', description: 'Bot fails MFA prompt. User alerted to change reused password.', category: 'Outcome', mode: 'defense' }
    ],
    edges: [
      { id: 'ep1', from: 'node-pwd-combo', to: 'node-pwd-bot', label: 'Load Credentials', animated: true, mode: 'both' },
      { id: 'ep2', from: 'node-pwd-bot', to: 'node-pwd-weak', label: 'Unmetered Requests', animated: true, mode: 'attack' },
      { id: 'ep3', from: 'node-pwd-bot', to: 'node-pwd-limit', label: 'Throttled Requests', animated: true, mode: 'defense' },
      { id: 'ep4', from: 'node-pwd-weak', to: 'node-pwd-match', label: 'Brute Force Succeeds', animated: true, mode: 'attack' },
      { id: 'ep5', from: 'node-pwd-limit', to: 'node-pwd-mfa', label: 'Require 2nd Factor', animated: true, mode: 'defense' },
      { id: 'ep6', from: 'node-pwd-match', to: 'node-pwd-decision', label: 'Evaluate Token', animated: true, mode: 'attack' },
      { id: 'ep7', from: 'node-pwd-mfa', to: 'node-pwd-decision', label: 'Verify TOTP', animated: true, mode: 'defense' },
      { id: 'ep8', from: 'node-pwd-decision', to: 'node-pwd-breach', label: 'Password-Only Policy', animated: true, mode: 'attack' },
      { id: 'ep9', from: 'node-pwd-decision', to: 'node-pwd-safe', label: 'MFA Enforced', animated: true, mode: 'defense' }
    ],
    attackStages: [
      {
        stageId: 'pwd-1',
        stageNumber: 1,
        title: 'Credential Stuffing Automation',
        nodeId: 'node-pwd-bot',
        nodeType: 'attacker_action',
        description: 'An automated bot sprays thousands of leaked credentials at the login API.',
        whatIsHappening: 'The attacker downloads a dump of email and password pairs leaked from an unrelated gaming website. A script automatically tests each pair against your platform.',
        whyCanThisHappen: 'Over 65% of internet users reuse the exact same password across multiple online accounts.',
        whatShouldYouNotice: 'A surge in authentication requests targeting `/api/auth/login` from rotational proxy IP addresses.',
        whatCouldBeImpact: 'Finding matching credentials without having to hack your platform directly.',
        howCanItBePrevented: 'Implement rate limiting (express-rate-limit) and integrate HaveIBeenPwned API to forbid known compromised passwords.',
        realWorldLesson: 'Never reuse passwords. If one website is breached, every other account using that password is at risk.',
        technicalDetails: 'Automated tool uses rotating residential proxies to bypass simple per-IP blocklists.',
        warningSigns: ['High volume of failed login requests', 'Distributed user agent strings']
      },
      {
        stageId: 'pwd-2',
        stageNumber: 2,
        title: 'Password Match & Account Takeover',
        nodeId: 'node-pwd-breach',
        nodeType: 'outcome',
        description: 'A reused password matches, granting the attacker complete account control.',
        whatIsHappening: 'The script hits a user who used `Password2024!` on both sites. Because the account lacks Multi-Factor Authentication, the server issues a valid session JWT.',
        whyCanThisHappen: 'Single-factor authentication relies entirely on something you know; once known by others, security drops to zero.',
        whatShouldYouNotice: 'User receives an email: "New login from Moscow, Russia (Chrome on Linux)".',
        whatCouldBeImpact: 'Unauthorized profile changes, theft of sensitive data, and financial transactions.',
        howCanItBePrevented: 'Mandatory Multi-Factor Authentication (MFA/2FA) on all user accounts.',
        realWorldLesson: 'A strong password that is reused is just as vulnerable as a weak password.',
        technicalDetails: 'API returns HTTP 200 with JWT authentication payload.',
        warningSigns: ['Login from new geolocation or unrecognized device', 'Immediate password change request']
      }
    ],
    defenseStages: [
      {
        stageId: 'def-pwd-1',
        stageNumber: 1,
        title: 'Adaptive Rate Limiting & Account Lockout',
        nodeId: 'node-pwd-limit',
        nodeType: 'defense_control',
        description: 'The login endpoint throttles rapid attempts and presents CAPTCHA challenges.',
        whatIsHappening: 'After 5 failed attempts from an IP address or for a specific account, the server returns `HTTP 429 Too Many Requests` and requires an interactive CAPTCHA.',
        whyCanThisHappen: 'Rate limiters slow down automated dictionary scripts from 200 attempts/sec to 1 attempt every 15 minutes, rendering brute force mathematically infeasible.',
        whatShouldYouNotice: 'The bot script experiences timeouts and aborts the attack campaign.',
        whatCouldBeImpact: 'Protects weak user passwords from being guessed.',
        howCanItBePrevented: 'Configure progressive delays and account lockout alerts.',
        realWorldLesson: 'Rate limiting turns a 10-minute brute force attack into a 500-year waiting game.',
        technicalDetails: 'Redis token bucket rate limiter drops requests exceeding 5 per minute per IP.',
        warningSigns: ['HTTP 429 Too Many Requests response status']
      },
      {
        stageId: 'def-pwd-2',
        stageNumber: 2,
        title: 'Multi-Factor Authentication (MFA) Enforcement',
        nodeId: 'node-pwd-safe',
        nodeType: 'recovery',
        description: 'Even with the correct password, the attacker is stopped by the 2nd factor.',
        whatIsHappening: 'The attacker enters the correct password, but the system prompts for a time-based 6-digit TOTP code generated by the user\'s physical smartphone. The attacker cannot provide it, and access is denied.',
        whyCanThisHappen: 'MFA requires two independent factors: something you know (password) + something you have (phone/token).',
        whatShouldYouNotice: 'The genuine user receives an alert, realizes their password is compromised, and rotates it immediately.',
        whatCouldBeImpact: 'Zero unauthorized account access; attack completely neutralized.',
        howCanItBePrevented: 'Enforce MFA universally across learners, instructors, and administrators.',
        realWorldLesson: 'MFA blocks over 99.9% of automated credential stuffing attacks.',
        technicalDetails: 'HMAC-based One-Time Password (RFC 6238) algorithm with 30-second rotating code window.',
        warningSigns: ['Zero unauthorized access recorded']
      }
    ],
    order: 6
  }
];

export const seedAttackSimulations = async () => {
  try {
    const admin = await User.findOne({ role: 'admin' });
    if (!admin) {
      console.log('⚠️ No admin user found to author simulations. Creating fallback admin...');
      return;
    }

    console.log('⚡ Seeding Watch How It Happens — Animated Cyber Attack Simulations...');

    for (const sim of simulationsData) {
      await AttackSimulation.findOneAndUpdate(
        { slug: sim.slug },
        { ...sim, createdBy: admin._id },
        { upsert: true, new: true, setDefaultsOnInsert: true }
      );
      console.log(`  ✅ Seeded simulation: ${sim.title}`);
    }

    console.log('✨ All Attack Simulations seeded successfully into MongoDB!');
  } catch (error) {
    console.error('❌ Error seeding attack simulations:', error);
  }
};

if (process.argv[1].endsWith('seedAttackSimulations.js')) {
  mongoose
    .connect(MONGO_URI)
    .then(async () => {
      console.log('✅ Connected to MongoDB for simulation seeding');
      await seedAttackSimulations();
      await mongoose.disconnect();
      process.exit(0);
    })
    .catch((err) => {
      console.error(err);
      process.exit(1);
    });
}

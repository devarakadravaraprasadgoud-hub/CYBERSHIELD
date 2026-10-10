import { LearningResource } from '../models/LearningResource.js';
import { ResourceProgress } from '../models/ResourceProgress.js';

export const seedVisualResources = async ({ moduleMap, topicMap, adminUser, learnerUser }) => {
  console.log('🎨 Seeding Visual Learning Hub resources across all modules...');

  // Purge existing resources & progress
  await Promise.all([
    LearningResource.deleteMany({}),
    ResourceProgress.deleteMany({})
  ]);

  const resourcesData = [
    // -------------------------------------------------------------
    // MODULE 1: anatomy-of-resilient-passwords
    // -------------------------------------------------------------
    {
      title: 'Passphrase Entropy & Diceware Mathematics Explained',
      description:
        'A comprehensive deep dive into the mathematical entropy difference between traditional short complex passwords and multi-word diceware passphrases.',
      module: moduleMap['anatomy-of-resilient-passwords'],
      topic: topicMap['password-security'],
      type: 'video',
      contentUrl: 'https://www.youtube.com/embed/3NjQ9b3pgIg',
      thumbnailUrl: 'https://images.unsplash.com/photo-1614064641938-3bbee52942c7?auto=format&fit=crop&w=600&q=80',
      duration: '11 min',
      difficulty: 'beginner',
      provider: 'Computerphile & Security Education',
      transcript:
        'In this video, security experts explain why password length exponentially outweighs symbol complexity. We analyze brute-force mathematics, password search spaces, and why humans picking "P@ssword1!" are predictable targets for GPU-accelerated dictionary attacks.',
      keyTakeaways: [
        'Search space is calculated as (Character Set Size) raised to the power of Length',
        'Diceware with 7,776 word lists produces ~12.9 bits of entropy per word',
        'Four randomly selected words provide over 50 bits of offline crack resistance'
      ],
      tags: ['passwords', 'entropy', 'diceware', 'authentication'],
      order: 1,
      isPublished: true,
      createdBy: adminUser._id
    },
    {
      title: 'Audio Lecture: Why Length Trumps Complexity in Modern Hashing',
      description:
        'Listen to an audio walkthrough detailing how Hashcat and modern GPU clusters attack password hashes and why length prevents dictionary recovery.',
      module: moduleMap['anatomy-of-resilient-passwords'],
      topic: topicMap['password-security'],
      type: 'audio',
      contentUrl: '',
      duration: '6 min',
      difficulty: 'beginner',
      provider: 'CyberShield Audio Academy',
      transcript:
        'Welcome to this audio briefing on credential physics. Traditional 8-character requirements forced users to adopt mnemonic tricks that automated cracking tools already test in their first passes. When you switch to a 16-character passphrase composed of distinct dictionary words, the combinatorial space required to crack the hash balloons beyond centuries of compute time, even on modern multi-GPU rigs.',
      keyTakeaways: [
        'Attackers leverage rule-based mutation dictionaries targeting capital first letters and trailing exclamation marks',
        'Offline hash cracking speeds exceed billions of guesses per second for weak hashes like MD5 and NTLM',
        'Modern key-stretching functions like Argon2 and PBKDF2 dramatically reduce brute-force effectiveness'
      ],
      tags: ['audio', 'lecture', 'hashing', 'passwords'],
      order: 2,
      isPublished: true,
      createdBy: adminUser._id
    },
    {
      title: 'Flowchart: NIST SP 800-63B Password Verification Lifecycle',
      description:
        'Interactive step-by-step flowchart of the modern NIST authentication standard: from user input through breach checking and salting.',
      module: moduleMap['anatomy-of-resilient-passwords'],
      topic: topicMap['password-security'],
      type: 'flowchart',
      duration: '8 min read',
      difficulty: 'intermediate',
      provider: 'NIST Standards & CyberShield',
      flowchartData: {
        workflowTitle: 'NIST SP 800-63B Credential Ingestion Flow',
        overview:
          'Modern NIST guidance discourages arbitrary periodic resets and special character requirements, emphasizing length and breach list auditing.',
        steps: [
          {
            stepId: 'pwd_1',
            stepNumber: 1,
            title: 'Candidate Passphrase Input',
            description: 'User enters proposed passphrase into client form.',
            technicalDetails: 'Form permits passphrases up to 64+ characters with Unicode/emojis.',
            commandExample: 'input[type="password"] minlength="12" maxlength="128"',
            securityImpact: 'Avoids arbitrary length truncation which breaks passphrase entropy.',
            category: 'process',
            icon: 'KeyRound'
          },
          {
            stepId: 'pwd_2',
            stepNumber: 2,
            title: 'Length & Normalization Check',
            description: 'System verifies minimum length requirement (e.g. 12+ chars).',
            technicalDetails: 'Normalize UTF-8 characters without stripping whitespace.',
            commandExample: 'if (passphrase.trim().length < 12) reject()',
            securityImpact: 'Ensures baseline search space threshold.',
            category: 'validation',
            icon: 'Check'
          },
          {
            stepId: 'pwd_3',
            stepNumber: 3,
            title: 'Compromised Credential Audit',
            description: 'Compare password against known breach lists (e.g., Have I Been Pwned k-Anonymity API).',
            technicalDetails: 'Hash password with SHA-1, send first 5 hex chars to HIBP k-anonymity API.',
            commandExample: 'GET https://api.pwnedpasswords.com/range/5BAA6',
            securityImpact: 'Prevents usage of passwords exposed in prior database dumps.',
            category: 'analysis',
            icon: 'ShieldAlert'
          },
          {
            stepId: 'pwd_4',
            stepNumber: 4,
            title: 'Key-Stretching & Salting',
            description: 'Derive cryptographic key using Argon2id or bcrypt with unique random salt.',
            technicalDetails: 'Use memory-hard hashing with cost parameters (e.g., Argon2id t=3, m=65536, p=4).',
            commandExample: 'argon2.hash(password, { type: argon2.argon2id, memoryCost: 2**16 })',
            securityImpact: 'Slows down brute-force attacks by orders of magnitude.',
            category: 'defense',
            icon: 'Lock'
          },
          {
            stepId: 'pwd_5',
            stepNumber: 5,
            title: 'Secure Database Ingestion',
            description: 'Store derived hash string containing algorithm tag, cost factor, salt, and digest.',
            technicalDetails: 'Never store plain text or reversible encryption in user table.',
            commandExample: '$argon2id$v=19$m=65536,t=3,p=4$c29tZXNhbHQ$...',
            securityImpact: 'Protects user credentials even in the event of database exfiltration.',
            category: 'action',
            icon: 'Database'
          }
        ],
        connections: [
          { from: 'pwd_1', to: 'pwd_2', label: 'Submit candidate' },
          { from: 'pwd_2', to: 'pwd_3', label: 'Meets length' },
          { from: 'pwd_3', to: 'pwd_4', label: 'Not in breach list' },
          { from: 'pwd_4', to: 'pwd_5', label: 'Hash generated' }
        ]
      },
      tags: ['nist', 'flowchart', 'authentication', 'verification'],
      order: 3,
      isPublished: true,
      createdBy: adminUser._id
    },
    {
      title: 'Interactive Lab: Real-Time Password Entropy & Crack Time Estimator',
      description:
        'Type test passwords into a client-side sandbox to calculate Shannon entropy, character set search space, and estimated brute force cracking time against a 100 Billion guess/sec GPU rig.',
      module: moduleMap['anatomy-of-resilient-passwords'],
      topic: topicMap['password-security'],
      type: 'simulation',
      duration: 'Hands-on',
      difficulty: 'beginner',
      provider: 'CyberShield Simulation Lab',
      simulationType: 'password',
      simulationConfig: {
        defaultInput: 'CorrectHorseBatteryStaple',
        gpuGuessesPerSec: 100000000000,
        showCharBreakdown: true
      },
      tags: ['simulation', 'calculator', 'entropy', 'interactive'],
      order: 4,
      isPublished: true,
      createdBy: adminUser._id
    },

    // -------------------------------------------------------------
    // MODULE 2: password-managers-and-credential-stuffing
    // -------------------------------------------------------------
    {
      title: 'Interactive Concept Map: Zero-Knowledge Password Vault Architecture',
      description:
        'Explore how client-side PBKDF2 encryption, master passphrases, and encrypted blobs operate in modern zero-knowledge cloud architectures.',
      module: moduleMap['password-managers-and-credential-stuffing'],
      topic: topicMap['password-security'],
      type: 'diagram',
      duration: '7 min read',
      difficulty: 'intermediate',
      provider: 'CyberShield Systems Architecture',
      diagramData: {
        diagramType: 'architecture',
        title: 'Zero-Knowledge Vault Cryptographic Pipeline',
        subtitle: 'How zero-knowledge protects stored secrets from cloud provider visibility',
        elements: [
          {
            id: 'arch_1',
            name: 'Master Passphrase (Client)',
            category: 'Client Side',
            details: 'Entered only on user local device memory. Never transmitted over the wire or stored on disk.',
            protocolsOrTools: ['Local RAM only', 'Diceware'],
            securityConsideration: 'Single point of failure; loss means total vault inaccessibility.',
            badge: 'Unshared Secret',
            highlight: true
          },
          {
            id: 'arch_2',
            name: 'Key Derivation Function (PBKDF2 / Argon2)',
            category: 'Client Side',
            details: 'Executes 600,000+ iterations using master password and email as salt to compute Encryption Key.',
            protocolsOrTools: ['Argon2id', 'PBKDF2-HMAC-SHA256'],
            securityConsideration: 'High work factor resists brute-force guessing of the master key.',
            badge: 'Key Stretching',
            highlight: false
          },
          {
            id: 'arch_3',
            name: 'AES-256-GCM Vault Encryption',
            category: 'Client Side',
            details: 'All passwords, credit cards, and notes are encrypted into ciphertext blobs prior to any transmission.',
            protocolsOrTools: ['AES-256', 'Galois/Counter Mode (GCM)'],
            securityConsideration: 'Provides both confidentiality and cryptographic integrity verification.',
            badge: 'Symmetric Cipher',
            highlight: true
          },
          {
            id: 'arch_4',
            name: 'TLS Encrypted Transport',
            category: 'Network',
            details: 'Ciphertext blob is sent across TLS 1.3 tunnel to vendor sync servers.',
            protocolsOrTools: ['HTTPS', 'TLS 1.3'],
            securityConsideration: 'Double layer of protection: encrypted data inside encrypted tunnel.',
            badge: 'In-Transit',
            highlight: false
          },
          {
            id: 'arch_5',
            name: 'Zero-Knowledge Cloud Repository',
            category: 'Cloud Storage',
            details: 'Vendor database only holds opaque encrypted binary blobs. Vendor engineers cannot read anything.',
            protocolsOrTools: ['Encrypted Blob Storage'],
            securityConsideration: 'Even a full server breach yields only uncrackable AES ciphertext blobs.',
            badge: 'Zero-Knowledge',
            highlight: true
          }
        ]
      },
      tags: ['architecture', 'vault', 'encryption', 'zero-knowledge'],
      order: 1,
      isPublished: true,
      createdBy: adminUser._id
    },

    // -------------------------------------------------------------
    // MODULE 3: spotting-spear-phishing-and-malicious-emails
    // -------------------------------------------------------------
    {
      title: 'Interactive Phishing Email Forensic Inspector Lab',
      description:
        'Inspect a simulated high-stakes phishing email. Hover and click flagged anomalies to discover spoofed sender domains, forged headers, and psychological urgency cues.',
      module: moduleMap['spotting-spear-phishing-and-malicious-emails'],
      topic: topicMap['phishing-and-social-engineering'],
      type: 'simulation',
      duration: 'Interactive',
      difficulty: 'beginner',
      provider: 'CyberShield Threat Labs',
      simulationType: 'phishing',
      simulationConfig: {
        emailSubject: 'URGENT: Unauthorized $1,420.00 Transaction Detected on Your Account',
        senderDisplay: 'PayPal Security Team <security-alert@paypa1-support-verify.com>',
        dateReceived: 'Today at 09:14 AM'
      },
      tags: ['phishing', 'simulation', 'forensics', 'interactive'],
      order: 1,
      isPublished: true,
      createdBy: adminUser._id
    },
    {
      title: 'Flowchart: Enterprise Email Threat Triage & Incident Handling',
      description:
        'Step-by-step decision flowchart used by Security Operations Centers (SOC) to triage, analyze headers, and contain malicious email attacks.',
      module: moduleMap['spotting-spear-phishing-and-malicious-emails'],
      topic: topicMap['phishing-and-social-engineering'],
      type: 'flowchart',
      duration: '6 min read',
      difficulty: 'intermediate',
      provider: 'SOC Playbook & SANS Institute',
      flowchartData: {
        workflowTitle: 'SOC Email Phishing Investigation Pipeline',
        overview:
          'From initial employee report to SPF/DKIM verification, URL sandboxing, and enterprise inbox purge.',
        steps: [
          {
            stepId: 'phish_1',
            stepNumber: 1,
            title: 'Suspicious Email Reported',
            description: 'Employee flags message using email reporting button.',
            technicalDetails: 'Message is routed to SOC abuse mailbox preserving full RFC 822 MIME headers.',
            commandExample: 'PhishAlarm / ReportMessage plugin trigger',
            securityImpact: 'Quick reporting reduces threat dwell time.',
            category: 'reconnaissance',
            icon: 'MailWarning'
          },
          {
            stepId: 'phish_2',
            stepNumber: 2,
            title: 'SPF, DKIM & DMARC Header Verification',
            description: 'Analyze authentication results in email header.',
            technicalDetails: 'Verify Received-SPF=pass, dkim=pass, dmarc=pass aligned with domain.',
            commandExample: 'Authentication-Results: spf=fail (sender IP not in SPF record)',
            securityImpact: 'Detects sender address spoofing instantly.',
            category: 'analysis',
            icon: 'Search'
          },
          {
            stepId: 'phish_3',
            stepNumber: 3,
            title: 'URL & Attachment Sandboxing',
            description: 'Submit links to dynamic analysis sandbox (e.g. VirusTotal, Any.Run).',
            technicalDetails: 'Evaluate credential harvesting forms and executable downloads in isolated browser.',
            commandExample: 'curl -s -X POST https://www.virustotal.com/api/v3/urls',
            securityImpact: 'Prevents analyst machine infection while observing malware behavior.',
            category: 'analysis',
            icon: 'Terminal'
          },
          {
            stepId: 'phish_4',
            stepNumber: 4,
            title: 'Organization-Wide Search & Purge',
            description: 'Search email gateway logs for same Message-ID or subject across all mailboxes.',
            technicalDetails: 'Automate Microsoft 365 or Google Workspace hard delete (Zero-Hour Auto Purge).',
            commandExample: 'Search-Mailbox -Filter "Subject -eq \'URGENT Invoice\'" -DeleteContent',
            securityImpact: 'Removes the phishing threat from all other employee inboxes.',
            category: 'containment',
            icon: 'Trash2'
          },
          {
            stepId: 'phish_5',
            stepNumber: 5,
            title: 'Block Domain & IOC Dissemination',
            description: 'Add malicious domain and sender IP to web filter and firewall blocklists.',
            technicalDetails: 'Feed IOC into SIEM/EDR to monitor for outbound connections.',
            commandExample: 'iptables -A OUTPUT -d 198.51.100.42 -j DROP',
            securityImpact: 'Neutralizes secondary callback attempts.',
            category: 'defense',
            icon: 'ShieldCheck'
          }
        ],
        connections: [
          { from: 'phish_1', to: 'phish_2', label: 'Extract raw headers' },
          { from: 'phish_2', to: 'phish_3', label: 'Suspicious SPF/links' },
          { from: 'phish_3', to: 'phish_4', label: 'Malicious verdict confirmed' },
          { from: 'phish_4', to: 'phish_5', label: 'Broadcast IOC block' }
        ]
      },
      tags: ['phishing', 'soc', 'triage', 'incident-response'],
      order: 2,
      isPublished: true,
      createdBy: adminUser._id
    },

    // -------------------------------------------------------------
    // MODULE 7: implementing-robust-mfa
    // -------------------------------------------------------------
    {
      title: 'Interactive Diagram: MFA Factors & Authentication Strengths Comparison',
      description:
        'A comprehensive matrix comparing SMS OTP, TOTP Authenticator Apps, Push Notifications, and FIDO2 WebAuthn Hardware Security Keys across phishing resistance and usability.',
      module: moduleMap['implementing-robust-mfa'],
      topic: topicMap['multi-factor-authentication'],
      type: 'diagram',
      duration: '8 min read',
      difficulty: 'intermediate',
      provider: 'CISA & CyberShield Guidelines',
      diagramData: {
        diagramType: 'comparison',
        title: 'MFA Authentication Vectors & Phishing Resistance Matrix',
        subtitle: 'Evaluation based on CISA guidance for phishing-resistant identity assurance',
        elements: [
          {
            id: 'mfa_sms',
            name: 'SMS One-Time Passcodes (OTP)',
            category: 'Legacy MFA',
            details: '6-digit code transmitted over cellular SMS network. Susceptible to SIM swapping and SS7 interception.',
            protocolsOrTools: ['Cellular SMS', 'SMPP'],
            securityConsideration: 'Vulnerable to real-time AitM reverse-proxy phishing (Evilginx).',
            badge: 'Low Resistance',
            highlight: false
          },
          {
            id: 'mfa_totp',
            name: 'Time-Based OTP (RFC 6238 Authenticator Apps)',
            category: 'Standard MFA',
            details: 'Shared secret key generating 30-second rotating 6-digit codes via HMAC-SHA1 algorithm.',
            protocolsOrTools: ['Google Authenticator', 'YubiKey TOTP', '1Password'],
            securityConsideration: 'Immune to SIM swapping, but users can still paste codes into adversary-in-the-middle phishing pages.',
            badge: 'Medium Resistance',
            highlight: false
          },
          {
            id: 'mfa_push',
            name: 'Mobile App Push with Number Matching',
            category: 'Modern MFA',
            details: 'Encrypted push prompt requesting approval. Includes number matching to prevent MFA fatigue/bombing.',
            protocolsOrTools: ['Microsoft Authenticator', 'Duo Security'],
            securityConsideration: 'Number matching neutralizes fatigue, but vulnerable if device is compromised.',
            badge: 'High Resistance',
            highlight: false
          },
          {
            id: 'mfa_fido2',
            name: 'FIDO2 / WebAuthn Hardware Security Keys',
            category: 'Gold Standard',
            details: 'Asymmetric public key cryptography bound cryptographically to the browser origin URL. Truly phishing-resistant.',
            protocolsOrTools: ['YubiKey 5 Series', 'Apple Passkeys', 'Windows Hello'],
            securityConsideration: 'Impossible to phish because origin binding refuses to sign challenges from spoofed domains.',
            badge: 'Phishing-Resistant',
            highlight: true
          }
        ]
      },
      tags: ['mfa', 'cisa', 'comparison', 'fido2'],
      order: 1,
      isPublished: true,
      createdBy: adminUser._id
    },

    // -------------------------------------------------------------
    // MODULE 9: sql-injection-and-xss-demystified
    // -------------------------------------------------------------
    {
      title: 'Interactive Lab: SQL Injection Vulnerable vs Parameterized Sandbox',
      description:
        'Experiment with live SQL queries in a safe sandbox. Witness how raw string concatenation permits authentication bypass (`\' OR 1=1 --`), while parameterized prepared statements neutralize the attack.',
      module: moduleMap['sql-injection-and-xss-demystified'],
      topic: topicMap['web-application-security'],
      type: 'simulation',
      duration: 'Interactive Lab',
      difficulty: 'advanced',
      provider: 'CyberShield AppSec Sandbox',
      simulationType: 'sqli',
      simulationConfig: {
        defaultVulnerableQuery: "SELECT * FROM users WHERE username = 'USER_INPUT' AND password = 'PASSWORD_INPUT'",
        defaultSafeQuery: "SELECT * FROM users WHERE username = ? AND password = ?",
        samplePayload: "admin' OR '1'='1"
      },
      tags: ['sqli', 'appsec', 'owasp', 'simulation'],
      order: 1,
      isPublished: true,
      createdBy: adminUser._id
    },
    {
      title: 'Interactive Infographic: OWASP Top 10 Web Application Vulnerabilities',
      description:
        'An interactive breakdown of the top web security risks including Broken Access Control, Cryptographic Failures, Injection, and Insecure Design.',
      module: moduleMap['sql-injection-and-xss-demystified'],
      topic: topicMap['web-application-security'],
      type: 'infographic',
      duration: '9 min read',
      difficulty: 'advanced',
      provider: 'OWASP Foundation & CyberShield',
      diagramData: {
        diagramType: 'matrix',
        title: 'OWASP Top 10 Web Security Vulnerability Taxonomy',
        subtitle: 'Essential application security vulnerabilities and defensive countermeasures',
        elements: [
          {
            id: 'owasp_a01',
            name: 'A01: Broken Access Control',
            category: 'Authorization',
            details: 'Failures that allow users to access unauthorized data or execute administrative capabilities (e.g. IDOR).',
            protocolsOrTools: ['RBAC', 'ABAC', 'Server-side session validation'],
            securityConsideration: 'Always enforce authorization on the backend, never rely on hidden UI buttons.',
            badge: 'Rank #1 Risk',
            highlight: true
          },
          {
            id: 'owasp_a02',
            name: 'A02: Cryptographic Failures',
            category: 'Cryptography',
            details: 'Exposure of sensitive data due to weak algorithms (MD5, SHA1), hardcoded keys, or missing TLS in transit.',
            protocolsOrTools: ['AES-256-GCM', 'TLS 1.3', 'Argon2id'],
            securityConsideration: 'Encrypt sensitive PII at rest and enforce HTTPS with HSTS headers.',
            badge: 'Data Protection',
            highlight: false
          },
          {
            id: 'owasp_a03',
            name: 'A03: Injection (SQL, NoSQL, Command)',
            category: 'Input Handling',
            details: 'Hostile data sent to an interpreter as part of a command or query tricking it into unintended execution.',
            protocolsOrTools: ['Prepared Statements', 'ORM Parameterization', 'Input Validation'],
            securityConsideration: 'Separate code from data strictly through parameterized interfaces.',
            badge: 'High Exploitability',
            highlight: true
          },
          {
            id: 'owasp_a04',
            name: 'A04: Insecure Design',
            category: 'Architecture',
            details: 'Missing security controls during architectural design phase before code implementation begins.',
            protocolsOrTools: ['Threat Modeling (STRIDE)', 'Paved Road Frameworks'],
            securityConsideration: 'You cannot patch flaws out of fundamentally broken system designs.',
            badge: 'Architectural',
            highlight: false
          },
          {
            id: 'owasp_a05',
            name: 'A05: Security Misconfiguration',
            category: 'Infrastructure',
            details: 'Default credentials, permissive CORS origins, verbose error stack traces, unpatched cloud permissions.',
            protocolsOrTools: ['CIS Benchmarks', 'IaC Scanners', 'CSP Headers'],
            securityConsideration: 'Harden cloud environments and disable debug output in production.',
            badge: 'Operations',
            highlight: false
          }
        ]
      },
      tags: ['owasp', 'appsec', 'infographic', 'web-security'],
      order: 2,
      isPublished: true,
      createdBy: adminUser._id
    },

    // -------------------------------------------------------------
    // MODULE 11: securing-connections-vpns-tls-wifi
    // -------------------------------------------------------------
    {
      title: 'Interactive Lab: Stateful Firewall Rule & Packet Inspection Simulator',
      description:
        'Configure network firewall rules (ACCEPT, DROP, REJECT) across ports 80, 443, 22, and 23. Send test packets and observe real-time packet filtering, inspection, and rule matching logs.',
      module: moduleMap['securing-connections-vpns-tls-wifi'],
      topic: topicMap['network-security'],
      type: 'simulation',
      duration: 'Interactive Lab',
      difficulty: 'intermediate',
      provider: 'CyberShield Network Defense Lab',
      simulationType: 'firewall',
      simulationConfig: {
        defaultRules: [
          { id: 'r1', port: 80, protocol: 'TCP', action: 'ACCEPT', description: 'HTTP Web Traffic' },
          { id: 'r2', port: 443, protocol: 'TCP', action: 'ACCEPT', description: 'HTTPS Secure Web' },
          { id: 'r3', port: 22, protocol: 'TCP', action: 'DROP', description: 'Block Public SSH' },
          { id: 'r4', port: 23, protocol: 'TCP', action: 'DROP', description: 'Block Insecure Telnet' }
        ]
      },
      tags: ['firewall', 'network', 'packet-filtering', 'simulation'],
      order: 1,
      isPublished: true,
      createdBy: adminUser._id
    },
    {
      title: 'Interactive TCP 3-Way Handshake Protocol Animator',
      description:
        'Walk through the foundational TCP connection sequence: SYN (Synchronization), SYN-ACK (Acknowledgment), and ACK, examining sequence numbers and socket state transitions.',
      module: moduleMap['securing-connections-vpns-tls-wifi'],
      topic: topicMap['network-security'],
      type: 'simulation',
      duration: 'Interactive',
      difficulty: 'beginner',
      provider: 'Networking & Transport Layer Essentials',
      simulationType: 'tcp_handshake',
      simulationConfig: {
        clientInitialSeq: 1000,
        serverInitialSeq: 5000
      },
      tags: ['tcp', 'handshake', 'networking', 'simulation'],
      order: 2,
      isPublished: true,
      createdBy: adminUser._id
    },
    {
      title: 'Interactive Concept Map: The OSI 7-Layer Model Security Explorer',
      description:
        'Explore all 7 layers of the Open Systems Interconnection model, their primary protocol data units (PDUs), real-world protocols, common attack vectors, and layer-specific defenses.',
      module: moduleMap['securing-connections-vpns-tls-wifi'],
      topic: topicMap['network-security'],
      type: 'diagram',
      duration: '10 min read',
      difficulty: 'beginner',
      provider: 'ISO / IEC Standards & CyberShield',
      diagramData: {
        diagramType: 'layers',
        title: 'OSI 7-Layer Reference Model & Defense-In-Depth Security',
        subtitle: 'Comprehensive layer protocol breakdown with attack vectors and countermeasures',
        elements: [
          {
            id: 'osi_7',
            name: 'Layer 7: Application Layer',
            category: 'Software & Protocols',
            details: 'Human-computer interaction layer where network services interface with software applications.',
            protocolsOrTools: ['HTTP/HTTPS', 'DNS', 'SSH', 'SMTP'],
            securityConsideration: 'Attacks: SQLi, XSS, DDoS, CSRF. Defenses: WAF, Input Sanitization, TLS.',
            badge: 'User Interface',
            highlight: true
          },
          {
            id: 'osi_6',
            name: 'Layer 6: Presentation Layer',
            category: 'Data Representation',
            details: 'Data translation, encryption, decryption, and compression between application and network formats.',
            protocolsOrTools: ['TLS/SSL', 'MIME', 'JPEG', 'ASCII'],
            securityConsideration: 'Attacks: Certificate spoofing, Heartbleed. Defenses: Strict TLS 1.3, Certificate Pinning.',
            badge: 'Encryption Layer',
            highlight: false
          },
          {
            id: 'osi_5',
            name: 'Layer 5: Session Layer',
            category: 'Connection Management',
            details: 'Establishes, manages, and terminates persistent sessions and dialogs between applications.',
            protocolsOrTools: ['RPC', 'NetBIOS', 'PPTP', 'SOCKS'],
            securityConsideration: 'Attacks: Session Hijacking, Man-in-the-Middle. Defenses: Cryptographic session tokens, short TTL.',
            badge: 'Session Control',
            highlight: false
          },
          {
            id: 'osi_4',
            name: 'Layer 4: Transport Layer',
            category: 'End-to-End Transport',
            details: 'Manages end-to-end data delivery, packet flow control, error checking, and port multiplexing.',
            protocolsOrTools: ['TCP', 'UDP', 'QUIC', 'SCTP'],
            securityConsideration: 'Attacks: SYN Flood, Port Scanning, UDP Amplification. Defenses: SYN Cookies, Stateful Firewalls.',
            badge: 'Segment / Datagram',
            highlight: true
          },
          {
            id: 'osi_3',
            name: 'Layer 3: Network Layer',
            category: 'Routing & Addressing',
            details: 'Handles logical device addressing and packet routing across diverse interconnected networks.',
            protocolsOrTools: ['IPv4/IPv6', 'ICMP', 'IPsec', 'BGP'],
            securityConsideration: 'Attacks: IP Spoofing, Ping of Death, BGP Hijacking. Defenses: RPKI, Packet Filtering, Ingress/Egress ACLs.',
            badge: 'Packets',
            highlight: true
          },
          {
            id: 'osi_2',
            name: 'Layer 2: Data Link Layer',
            category: 'Physical Addressing',
            details: 'Transfers frames between nodes on the same local network segment using physical MAC addresses.',
            protocolsOrTools: ['Ethernet (802.3)', 'Wi-Fi (802.11)', 'ARP', 'VLAN'],
            securityConsideration: 'Attacks: ARP Poisoning, MAC Flooding, Evil Twin. Defenses: Dynamic ARP Inspection (DAI), 802.1X.',
            badge: 'Frames',
            highlight: false
          },
          {
            id: 'osi_1',
            name: 'Layer 1: Physical Layer',
            category: 'Hardware & Signals',
            details: 'Transmits raw unstructured bitstreams across physical copper wires, fiber optics, or radio frequencies.',
            protocolsOrTools: ['Fiber', 'Cat6 Cables', 'RJ45', 'Radio RF'],
            securityConsideration: 'Attacks: Wiretapping, Jamming, Rogue Hardware Implants. Defenses: Physical access controls, fiber shielding.',
            badge: 'Raw Bits',
            highlight: false
          }
        ]
      },
      tags: ['osi-model', 'diagram', 'networking', 'defense-in-depth'],
      order: 3,
      isPublished: true,
      createdBy: adminUser._id
    },

    // -------------------------------------------------------------
    // MODULE 12: data-classification-erasure-incident-containment
    // -------------------------------------------------------------
    {
      title: 'Flowchart: SANS/NIST Incident Response Lifecycle Playbook',
      description:
        'The official 6-phase Incident Response cycle: Preparation, Identification, Containment, Eradication, Recovery, and Lessons Learned.',
      module: moduleMap['data-classification-erasure-incident-containment'],
      topic: topicMap['incident-response-basics'],
      type: 'flowchart',
      duration: '8 min read',
      difficulty: 'intermediate',
      provider: 'NIST Special Publication 800-61',
      flowchartData: {
        workflowTitle: 'NIST SP 800-61 Incident Handling Phases',
        overview:
          'Structured cybersecurity incident handling process for minimizing impact and rapidly restoring business operations.',
        steps: [
          {
            stepId: 'ir_1',
            stepNumber: 1,
            title: '1. Preparation Phase',
            description: 'Maintain trained response team, deploy monitoring tools, and establish communication plans.',
            technicalDetails: 'Configure SIEM alert thresholds, run tabletop exercises, provision out-of-band communication channels.',
            commandExample: 'Verify offline forensic jumpbags and write-blockers',
            securityImpact: 'Lays the operational foundation before an attack occurs.',
            category: 'process',
            icon: 'Shield'
          },
          {
            stepId: 'ir_2',
            stepNumber: 2,
            title: '2. Detection & Identification',
            description: 'Determine whether an anomalous security event has occurred and evaluate its scope.',
            technicalDetails: 'Correlate EDR telemetry, firewall drops, and authentication logs to confirm adversary dwell time.',
            commandExample: 'Splunk / ELK query: `sourcetype=edr event_id=malicious_process`',
            securityImpact: 'Identifies patient zero and initial compromise vector.',
            category: 'analysis',
            icon: 'Search'
          },
          {
            stepId: 'ir_3',
            stepNumber: 3,
            title: '3. Containment (Short & Long Term)',
            description: 'Isolate affected network segments and devices to prevent lateral movement.',
            technicalDetails: 'Sever compromised hosts from the LAN, revoke compromised session tokens, quarantine VM snapshots.',
            commandExample: 'EDR Host Isolation: `isolate-host --agent-id A84920`',
            securityImpact: 'Stops ransomware spreading and active data exfiltration.',
            category: 'containment',
            icon: 'AlertTriangle'
          },
          {
            stepId: 'ir_4',
            stepNumber: 4,
            title: '4. Eradication Phase',
            description: 'Completely eliminate all artifacts of the attacker from the infrastructure.',
            technicalDetails: 'Remove web shells, purge persistence registry keys, re-image compromised operating systems from golden images.',
            commandExample: 'Re-image host from verified baseline hash',
            securityImpact: 'Ensures no backdoors or secondary implants survive.',
            category: 'defense',
            icon: 'Trash2'
          },
          {
            stepId: 'ir_5',
            stepNumber: 5,
            title: '5. Recovery & Validation',
            description: 'Restore systems to production environment carefully with elevated monitoring.',
            technicalDetails: 'Restore data from immutable offline backups, reset all privileged credentials, test system functionality.',
            commandExample: 'Enable 24/7 high-frequency SIEM auditing on restored domain controller',
            securityImpact: 'Safely resumes operational capability without re-infection risk.',
            category: 'action',
            icon: 'Activity'
          },
          {
            stepId: 'ir_6',
            stepNumber: 6,
            title: '6. Post-Incident Lessons Learned',
            description: 'Conduct formal retrospective meeting and document root-cause report.',
            technicalDetails: 'Update policies, modify detection rules to catch the technique earlier, address vulnerability gaps.',
            commandExample: 'Generate After-Action Report (AAR) within 72 hours',
            securityImpact: 'Prevents recurrence of the identical attack vector.',
            category: 'validation',
            icon: 'FileText'
          }
        ],
        connections: [
          { from: 'ir_1', to: 'ir_2', label: 'Monitor continuously' },
          { from: 'ir_2', to: 'ir_3', label: 'Threat confirmed' },
          { from: 'ir_3', to: 'ir_4', label: 'Infection isolated' },
          { from: 'ir_4', to: 'ir_5', label: 'Environment clean' },
          { from: 'ir_5', to: 'ir_6', label: 'Service restored' },
          { from: 'ir_6', to: 'ir_1', label: 'Feedback loop & update defenses' }
        ]
      },
      tags: ['incident-response', 'nist', 'sans', 'playbook'],
      order: 1,
      isPublished: true,
      createdBy: adminUser._id
    },
    {
      title: 'Interactive Cryptographic Hash & Digest Explorer Lab',
      description:
        'Generate cryptographic hashes (SHA-256 and MD5) for any text in real-time. Change a single character to witness the dramatic avalanche effect that underpins digital forensic integrity.',
      module: moduleMap['data-classification-erasure-incident-containment'],
      topic: topicMap['data-privacy-and-encryption'],
      type: 'simulation',
      duration: 'Interactive Lab',
      difficulty: 'beginner',
      provider: 'CyberShield Cryptography Lab',
      simulationType: 'hash',
      simulationConfig: {
        defaultInput: 'CyberShield Security Protocol 2026'
      },
      tags: ['hashing', 'sha256', 'cryptography', 'simulation'],
      order: 2,
      isPublished: true,
      createdBy: adminUser._id
    }
  ];

  const createdResources = await LearningResource.insertMany(resourcesData);
  console.log(`✅ Successfully seeded ${createdResources.length} Visual Learning Hub resources!`);

  // Seed sample learner progress for testing
  if (learnerUser && createdResources.length > 0) {
    const sampleProgress = [
      {
        user: learnerUser._id,
        resource: createdResources[0]._id, // Passphrase video
        module: createdResources[0].module,
        lastPosition: 660,
        completionPercentage: 100,
        isCompleted: true,
        completedAt: new Date()
      },
      {
        user: learnerUser._id,
        resource: createdResources[3]._id, // Password entropy simulation
        module: createdResources[3].module,
        lastPosition: 1,
        completionPercentage: 100,
        isCompleted: true,
        completedAt: new Date()
      }
    ];

    await ResourceProgress.insertMany(sampleProgress);
    console.log(`📊 Seeded initial student visual progress records for ${learnerUser.email}`);
  }

  return createdResources;
};

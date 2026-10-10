import mongoose from 'mongoose';
import { connectDB, disconnectDB } from '../config/db.js';
import { env } from '../config/env.js';
import { User } from '../models/User.js';
import { Topic } from '../models/Topic.js';
import { LearningModule } from '../models/LearningModule.js';
import { Quiz } from '../models/Quiz.js';
import { Question } from '../models/Question.js';
import { QuizAttempt } from '../models/QuizAttempt.js';
import { Progress } from '../models/Progress.js';
import { Achievement } from '../models/Achievement.js';
import { seedVisualResources } from './seedVisualResources.js';
import { seedAttackSimulations } from './seedAttackSimulations.js';

const achievementsCatalog = [
  {
    code: 'first-login',
    title: 'Welcome Cadet',
    description: 'Joined the CyberShield awareness training platform',
    badgeIcon: 'Shield',
    category: 'learning',
    criteriaType: 'login',
    criteriaThreshold: 1
  },
  {
    code: 'first-module',
    title: 'Knowledge Seeker',
    description: 'Completed your first cybersecurity learning module',
    badgeIcon: 'BookOpen',
    category: 'learning',
    criteriaType: 'module_completion',
    criteriaThreshold: 1
  },
  {
    code: 'module-master',
    title: 'Cyber Guardian',
    description: 'Completed 5 cybersecurity learning modules',
    badgeIcon: 'Shield',
    category: 'learning',
    criteriaType: 'module_completion',
    criteriaThreshold: 5
  },
  {
    code: 'security-architect',
    title: 'Security Architect',
    description: 'Completed 10 cybersecurity learning modules',
    badgeIcon: 'Award',
    category: 'learning',
    criteriaType: 'module_completion',
    criteriaThreshold: 10
  },
  {
    code: 'first-quiz',
    title: 'Threat Analyst',
    description: 'Completed your first cybersecurity quiz assessment',
    badgeIcon: 'FileCheck',
    category: 'quiz',
    criteriaType: 'quiz_completion',
    criteriaThreshold: 1
  },
  {
    code: 'perfect-score',
    title: 'Flawless Defense',
    description: 'Achieved a perfect 100% score on a cybersecurity quiz',
    badgeIcon: 'Zap',
    category: 'mastery',
    criteriaType: 'score_percentage',
    criteriaThreshold: 100
  },
  {
    code: 'shield-bearer',
    title: 'Shield Bearer',
    description: 'Passed at least 3 distinct cybersecurity quizzes',
    badgeIcon: 'ShieldCheck',
    category: 'mastery',
    criteriaType: 'quiz_pass',
    criteriaThreshold: 3
  },
  {
    code: 'quiz-veteran',
    title: 'Incident Commander',
    description: 'Conducted 5 or more cybersecurity quiz assessments',
    badgeIcon: 'Terminal',
    category: 'mastery',
    criteriaType: 'quiz_attempts',
    criteriaThreshold: 5
  }
];

export const seedDatabase = async () => {
  try {
    await connectDB();
    console.log('🌱 Starting CyberShield database seed process...');

    // Clear existing collections
    console.log('🧹 Purging existing test records...');
    await Promise.all([
      User.deleteMany({}),
      Topic.deleteMany({}),
      LearningModule.deleteMany({}),
      Quiz.deleteMany({}),
      Question.deleteMany({}),
      QuizAttempt.deleteMany({}),
      Progress.deleteMany({}),
      Achievement.deleteMany({})
    ]);

    // 1. Seed Achievements Catalog
    await Achievement.insertMany(achievementsCatalog);
    console.log(`🏅 Seeded ${achievementsCatalog.length} achievements`);

    // 2. Seed Users
    const adminPasswordHash = await User.hashPassword(env.ADMIN_INITIAL_PASSWORD);
    const instructorPasswordHash = await User.hashPassword('InstructorPass123!');
    const learnerPasswordHash = await User.hashPassword('LearnerPass123!');

    const adminUser = await User.create({
      name: 'Chief Security Officer (Admin)',
      email: env.ADMIN_EMAIL,
      passwordHash: adminPasswordHash,
      role: 'admin',
      status: 'active',
      profile: {
        bio: 'CyberShield Root Administrator and Security Compliance Architect.',
        title: 'Lead Security Administrator',
        organization: 'CyberShield Global Operations'
      }
    });

    const instructorUser = await User.create({
      name: 'Sarah Connor (Instructor)',
      email: 'instructor@cybershield.local',
      passwordHash: instructorPasswordHash,
      role: 'instructor',
      status: 'active',
      profile: {
        bio: 'Certified Ethical Hacker (CEH) and Senior Threat Modeling Instructor.',
        title: 'Senior Cyber Defense Instructor',
        organization: 'Defense Academics'
      }
    });

    const learnerUser = await User.create({
      name: 'Alex Rivera (Learner)',
      email: 'learner@cybershield.local',
      passwordHash: learnerPasswordHash,
      role: 'learner',
      status: 'active',
      profile: {
        bio: 'Aspiring SOC Analyst enthusiastic about blue teaming and cloud security.',
        title: 'Junior IT Support Specialist',
        organization: 'Digital Vanguard'
      }
    });

    console.log('👤 Created Users: Admin, Instructor, Learner');

    // 3. Seed 8 Topics
    const topicsData = [
      {
        title: 'Password Security & Credential Hygiene',
        slug: 'password-security',
        description:
          'Learn the foundation of identity defense: formulating resilient passphrases, leveraging password managers, and preventing brute force attacks.',
        category: 'Identity & Access',
        difficultyLevel: 'beginner',
        iconName: 'KeyRound',
        thumbnailUrl: 'https://images.unsplash.com/photo-1614064641938-3bbee52942c7?auto=format&fit=crop&w=600&q=80',
        isPublished: true,
        createdBy: adminUser._id
      },
      {
        title: 'Phishing and Social Engineering',
        slug: 'phishing-and-social-engineering',
        description:
          'Recognize deceptive psychology: spot spear phishing emails, smishing texts, impersonation scams, and deceptive URL manipulations.',
        category: 'Threat Awareness',
        difficultyLevel: 'beginner',
        iconName: 'MailWarning',
        thumbnailUrl: 'https://images.unsplash.com/photo-1563986768609-322da13575f3?auto=format&fit=crop&w=600&q=80',
        isPublished: true,
        createdBy: adminUser._id
      },
      {
        title: 'Malware and Ransomware Defense',
        slug: 'malware-and-ransomware',
        description:
          'Understand malicious payloads: ransomware mechanics, trojan droppers, zero-day vulnerabilities, and behavioral host defenses.',
        category: 'Threat Awareness',
        difficultyLevel: 'intermediate',
        iconName: 'ShieldAlert',
        thumbnailUrl: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&w=600&q=80',
        isPublished: true,
        createdBy: instructorUser._id
      },
      {
        title: 'Multi-Factor Authentication (MFA)',
        slug: 'multi-factor-authentication',
        description:
          'Elevate your barrier of entry: authenticator apps, push notifications, and cryptographic hardware security keys like FIDO2/WebAuthn.',
        category: 'Identity & Access',
        difficultyLevel: 'beginner',
        iconName: 'Smartphone',
        thumbnailUrl: 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&w=600&q=80',
        isPublished: true,
        createdBy: instructorUser._id
      },
      {
        title: 'Web Application Security & OWASP Top 10',
        slug: 'web-application-security',
        description:
          'Explore critical web vulnerabilities: SQL Injection, Cross-Site Scripting (XSS), broken access control, and API security principles.',
        category: 'Application Security',
        difficultyLevel: 'advanced',
        iconName: 'Code',
        thumbnailUrl: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&w=600&q=80',
        isPublished: true,
        createdBy: adminUser._id
      },
      {
        title: 'Network Security & Public Wi-Fi Protection',
        slug: 'network-security',
        description:
          'Protect data in transit: Man-in-the-Middle (MitM) attacks, rogue access points, VPN tunneling, and DNS spoofing mitigation.',
        category: 'Network Security',
        difficultyLevel: 'intermediate',
        iconName: 'Wifi',
        thumbnailUrl: 'https://images.unsplash.com/photo-1544197150-b99a580bb7a8?auto=format&fit=crop&w=600&q=80',
        isPublished: true,
        createdBy: instructorUser._id
      },
      {
        title: 'Data Privacy, Encryption & Hygiene',
        slug: 'data-privacy-and-encryption',
        description:
          'Secure digital assets: symmetric vs asymmetric cryptography, at-rest vs in-transit protection, and compliance privacy controls.',
        category: 'Data Protection',
        difficultyLevel: 'beginner',
        iconName: 'Database',
        thumbnailUrl: 'https://images.unsplash.com/photo-1504639725590-34d0984388bd?auto=format&fit=crop&w=600&q=80',
        isPublished: true,
        createdBy: adminUser._id
      },
      {
        title: 'Incident Response & Security Operations',
        slug: 'incident-response-basics',
        description:
          'Respond when compromised: containment protocols, forensic evidence preservation, threat hunting, and operational post-mortems.',
        category: 'Incident Response',
        difficultyLevel: 'intermediate',
        iconName: 'AlertTriangle',
        thumbnailUrl: 'https://images.unsplash.com/photo-1510511459019-5dda7724fd87?auto=format&fit=crop&w=600&q=80',
        isPublished: true,
        createdBy: adminUser._id
      }
    ];

    const createdTopics = await Topic.insertMany(topicsData);
    console.log(`📚 Seeded ${createdTopics.length} cybersecurity topics`);

    // Map topics by slug for module & quiz linkage
    const topicMap = {};
    createdTopics.forEach((t) => {
      topicMap[t.slug] = t._id;
    });

    // 4. Seed 12 Learning Modules
    const modulesData = [
      {
        title: 'The Anatomy of Resilient Passwords & Passphrases',
        slug: 'anatomy-of-resilient-passwords',
        topic: topicMap['password-security'],
        shortDescription: 'Understand why password length trumps complexity and how to construct uncrackable diceware passphrases.',
        learningObjectives: [
          'Calculate entropy and crack time for character sets vs multi-word passphrases',
          'Avoid common dictionary patterns and personal date substitutions',
          'Implement the 3-random-words methodology for high recall and high entropy'
        ],
        contentSections: [
          {
            title: '1. Why Traditional Password Complexity Rules Failed',
            content:
              'For decades, standard advice mandated 8 characters with uppercase, lowercase, numbers, and symbols. Users reacted predictably: they used "P@ssword1!" or capitalized the first letter and put "1!" at the end. Attackers write rules into hash-cracking software (like Hashcat) specifically prioritizing these predictable patterns. A 16-character passphrase composed of four completely random dictionary words provides vastly superior mathematical entropy.',
            calloutType: 'info',
            calloutText: 'Length dominates entropy exponentially compared to short high-complexity strings.',
            order: 1
          },
          {
            title: '2. The Diceware Technique',
            content:
              'The Diceware method generates cryptographically secure passphrases using physical dice and a word list of 7,776 words. Rolling five standard dice yields a 5-digit number matching a specific word. Four randomly chosen words provide 51.6 bits of entropy, which is exceptionally difficult to crack offline.',
            calloutType: 'tip',
            calloutText: 'Example: "battery-staple-correct-horse" creates memorable high-entropy security.',
            order: 2
          }
        ],
        estimatedReadingTime: 6,
        difficultyLevel: 'beginner',
        order: 1,
        isPublished: true,
        createdBy: adminUser._id
      },
      {
        title: 'Password Managers & Credential Stuffing Countermeasures',
        slug: 'password-managers-and-credential-stuffing',
        topic: topicMap['password-security'],
        shortDescription: 'Why reusing passwords is the #1 vector for account takeover and how zero-knowledge password vaults solve it.',
        learningObjectives: [
          'Understand automated credential stuffing attack vectors',
          'Evaluate zero-knowledge client-side encryption architectures',
          'Deploy emergency kits and master passphrase best practices'
        ],
        contentSections: [
          {
            title: '1. How Credential Stuffing Operates',
            content:
              'When a minor service suffers a database breach, attackers feed the leaked email-password combinations into automated bots targeting banks, cloud providers, and email services. If you reuse passwords across multiple sites, a breach on an obscure gaming forum immediately exposes your primary banking portal.',
            calloutType: 'alert',
            calloutText: 'Never reuse passwords across personal and work services.',
            order: 1
          },
          {
            title: '2. Zero-Knowledge Cloud Vaults',
            content:
              'Modern password managers (such as Bitwarden and 1Password) use zero-knowledge architecture. Your master password derives an AES-256 key locally on your device using PBKDF2 or Argon2. The vendor only holds encrypted blobs and cannot read your passwords even under subpoena.',
            calloutType: 'info',
            calloutText: 'Zero-knowledge guarantees only your client decrypts vault secrets.',
            order: 2
          }
        ],
        estimatedReadingTime: 7,
        difficultyLevel: 'beginner',
        order: 2,
        isPublished: true,
        createdBy: adminUser._id
      },
      {
        title: 'Spotting Spear Phishing & Malicious Email Payloads',
        slug: 'spotting-spear-phishing-and-malicious-emails',
        topic: topicMap['phishing-and-social-engineering'],
        shortDescription: 'Identify lookalike sender domains, urgency traps, deceptive hyperlinking, and obfuscated attachments.',
        learningObjectives: [
          'Examine raw email headers for SPF, DKIM, and DMARC alignment',
          'Inspect disguised URLs using safe hover preview and unshortening',
          'Recognize emotional coercion triggers (authority, urgency, fear)'
        ],
        contentSections: [
          {
            title: '1. Typosquatting and Homograph Attacks',
            content:
              'Attackers register lookalike domains like "micros0ft.com" or utilize Cyrillic characters that look identical to Latin letters in standard fonts. Always inspect the true destination domain before entering credentials or executing macro-enabled files.',
            calloutType: 'warning',
            calloutText: 'Always inspect the root domain before entering credentials.',
            order: 1
          },
          {
            title: '2. The Psychological Lever: Manufactured Panic',
            content:
              'Phishing emails consistently manufacture an artificial crisis: "Your account will be terminated in 24 hours" or "Urgent wire transfer required by CEO". When fear or urgency is provoked, pause and verify out-of-band via phone or Slack.',
            calloutType: 'tip',
            calloutText: 'Out-of-band verification foils 99% of executive impersonation scams.',
            order: 2
          }
        ],
        estimatedReadingTime: 8,
        difficultyLevel: 'beginner',
        order: 1,
        isPublished: true,
        createdBy: instructorUser._id
      },
      {
        title: 'Smishing, Vishing & Human Manipulation Tactics',
        slug: 'smishing-vishing-human-manipulation',
        topic: topicMap['phishing-and-social-engineering'],
        shortDescription: 'Deep dive into SMS text phishing, voice deepfakes, and pretexting tactics targeting support desks.',
        learningObjectives: [
          'Differentiate between SMS phishing (Smishing) and voice fraud (Vishing)',
          'Recognize AI voice cloning manipulation during phone interactions',
          'Establish verification protocols for corporate service desks'
        ],
        contentSections: [
          {
            title: '1. SMS Scams and Malicious 2FA Interceptions',
            content:
              'Smishing messages mimic package delivery notifications, bank alerts, or toll payment deadlines. They include shortened links redirecting to credential harvesting portals specifically designed to steal one-time OTP codes in real time.',
            calloutType: 'alert',
            calloutText: 'Banks will never ask for your one-time SMS verification code over the phone or text.',
            order: 1
          }
        ],
        estimatedReadingTime: 5,
        difficultyLevel: 'intermediate',
        order: 2,
        isPublished: true,
        createdBy: instructorUser._id
      },
      {
        title: 'Ransomware Operations: Kill Chain & Resilient Backups',
        slug: 'ransomware-operations-and-kill-chain',
        topic: topicMap['malware-and-ransomware'],
        shortDescription: 'Understand initial access brokers, lateral movement, data exfiltration, and the 3-2-1 immutable backup rule.',
        learningObjectives: [
          'Map modern ransomware across the MITRE ATT&CK framework',
          'Understand double-extortion (encryption + public data leakage)',
          'Implement immutable, air-gapped 3-2-1 backup architectures'
        ],
        contentSections: [
          {
            title: '1. The Evolution to Double Extortion',
            content:
              'Early ransomware simply encrypted files locally. Modern ransomware groups (RaaS) first exfiltrate sensitive corporate databases to dark web servers, and only then deploy system-wide encryption. If the victim restores from backup, the attackers threaten to publish client data publicly.',
            calloutType: 'warning',
            calloutText: 'Backups alone do not prevent data extortion; data loss prevention (DLP) and zero-trust segmentation are vital.',
            order: 1
          },
          {
            title: '2. The 3-2-1-1-0 Backup Strategy',
            content:
              'Keep 3 copies of data on 2 different media types, 1 offsite, 1 immutable/offline (air-gapped), and ensure 0 errors via automated recovery rehearsals.',
            calloutType: 'tip',
            calloutText: 'An untested backup is not a backup.',
            order: 2
          }
        ],
        estimatedReadingTime: 9,
        difficultyLevel: 'intermediate',
        order: 1,
        isPublished: true,
        createdBy: instructorUser._id
      },
      {
        title: 'Trojan Horses, Rootkits & Living-off-the-Land (LotL)',
        slug: 'trojans-rootkits-and-living-off-the-land',
        topic: topicMap['malware-and-ransomware'],
        shortDescription: 'How modern malware blends in using built-in system binaries (PowerShell, WMI, certutil) to evade antivirus.',
        learningObjectives: [
          'Differentiate user-mode malware from kernel rootkits',
          'Identify Living-off-the-Land Binaries and Scripts (LOLBAS)',
          'Implement Endpoint Detection and Response (EDR) telemetry'
        ],
        contentSections: [
          {
            title: '1. Living off the Land (LotL)',
            content:
              'Traditional antivirus scans for known malicious file hashes. Attackers bypass this by executing built-in Windows utilities like powershell.exe, certutil.exe, or bitsadmin.exe to download and execute code in memory without dropping suspicious binaries onto disk.',
            calloutType: 'info',
            calloutText: 'Behavioral detection and command-line logging (Sysmon Event ID 1) are required to catch LotL tactics.',
            order: 1
          }
        ],
        estimatedReadingTime: 8,
        difficultyLevel: 'advanced',
        order: 2,
        isPublished: true,
        createdBy: instructorUser._id
      },
      {
        title: 'Implementing Robust Multi-Factor Authentication',
        slug: 'implementing-robust-mfa',
        topic: topicMap['multi-factor-authentication'],
        shortDescription: 'Compare SMS OTP, Time-based One-Time Passwords (TOTP), and push notifications with number matching.',
        learningObjectives: [
          'Identify vulnerabilities in SMS-based 2FA (SIM swapping, SS7 interception)',
          'Explain the HMAC-based One-Time Password (HOTP) and TOTP RFC 6238 math',
          'Prevent MFA fatigue attacks using number-matching challenges'
        ],
        contentSections: [
          {
            title: '1. The Weakness of SMS 2FA',
            content:
              'SMS messages travel unencrypted across cellular networks and can be redirected via SIM swapping—where an attacker impersonates the victim to mobile carriers to gain control of their phone number.',
            calloutType: 'alert',
            calloutText: 'Upgrade from SMS to app-based TOTP or hardware security keys whenever available.',
            order: 1
          },
          {
            title: '2. Combatting MFA Fatigue',
            content:
              'In MFA fatigue attacks, attackers spam victims with dozens of login push notifications at 3 AM until the frustrated user taps "Approve". Number-matching forces the user to type a 2-digit number shown on the login screen into their phone authenticator app.',
            calloutType: 'tip',
            calloutText: 'Number matching effectively eliminates push fatigue vulnerabilities.',
            order: 2
          }
        ],
        estimatedReadingTime: 6,
        difficultyLevel: 'beginner',
        order: 1,
        isPublished: true,
        createdBy: adminUser._id
      },
      {
        title: 'FIDO2, WebAuthn & Phishing-Resistant Hardware Keys',
        slug: 'fido2-webauthn-hardware-keys',
        topic: topicMap['multi-factor-authentication'],
        shortDescription: 'The gold standard in authentication: public-key cryptography bound to browser origin domains.',
        learningObjectives: [
          'Explain WebAuthn protocol flow between browser, authenticator, and relying party',
          'Understand how domain binding makes YubiKeys immune to reverse-proxy phishing',
          'Configure passkeys for seamless cross-device synchronization'
        ],
        contentSections: [
          {
            title: '1. Why FIDO2 Cannot Be Phished',
            content:
              'Reverse-proxy phishing kits (like Evilginx) can intercept passwords and TOTP codes in real time. FIDO2 / WebAuthn is immune because the security key signs a challenge bound to the browser origin URL. If you are on a phishing site like "login.evil.com", the key generates a signature for that domain, which the real provider will reject.',
            calloutType: 'info',
            calloutText: 'FIDO2 is the only mathematically phishing-resistant authentication protocol in widespread production.',
            order: 1
          }
        ],
        estimatedReadingTime: 8,
        difficultyLevel: 'intermediate',
        order: 2,
        isPublished: true,
        createdBy: adminUser._id
      },
      {
        title: 'SQL Injection & Cross-Site Scripting (XSS) Demystified',
        slug: 'sql-injection-and-xss-demystified',
        topic: topicMap['web-application-security'],
        shortDescription: 'Master the top web application flaws: input sanitization, parameterized queries, and output encoding.',
        learningObjectives: [
          'Demonstrate how unsanitized input leads to SQL query manipulation',
          'Distinguish Stored, Reflected, and DOM-based Cross-Site Scripting',
          'Implement defense-in-depth: Prepared statements and Content Security Policy (CSP)'
        ],
        contentSections: [
          {
            title: '1. Parameterized Queries vs String Concatenation',
            content:
              'SQL Injection occurs when user input is concatenated directly into SQL statements. Parameterized queries (prepared statements) treat input strictly as literals, preventing the SQL engine from interpreting user strings as executable commands.',
            calloutType: 'warning',
            calloutText: 'Never concatenate raw user input into database queries.',
            order: 1
          },
          {
            title: '2. XSS and Context-Aware Output Encoding',
            content:
              'Cross-Site Scripting allows attackers to inject malicious JavaScript into victim browsers to steal session cookies. Prevent XSS by encoding output for the relevant HTML, attribute, or JavaScript context, and enforcing a strict Content Security Policy.',
            calloutType: 'tip',
            calloutText: 'Always set HttpOnly flags on session cookies to mitigate script-based token theft.',
            order: 2
          }
        ],
        estimatedReadingTime: 10,
        difficultyLevel: 'advanced',
        order: 1,
        isPublished: true,
        createdBy: instructorUser._id
      },
      {
        title: 'Broken Access Control & Insecure Direct Object References',
        slug: 'broken-access-control-and-idor',
        topic: topicMap['web-application-security'],
        shortDescription: 'Examine OWASP #1 vulnerability: horizontal/vertical privilege escalation and IDOR vulnerabilities.',
        learningObjectives: [
          'Recognize IDOR flaws in REST APIs manipulating resource identifiers',
          'Enforce server-side authorization checks on every state-changing route',
          'Implement Role-Based (RBAC) and Attribute-Based (ABAC) Access Control'
        ],
        contentSections: [
          {
            title: '1. Anatomy of an IDOR Vulnerability',
            content:
              'When an API endpoint `/api/documents/1042` displays an invoice without verifying that document 1042 belongs to the logged-in user, an attacker can simply increment the ID to view all confidential invoices in the database.',
            calloutType: 'alert',
            calloutText: 'Never rely on frontend UI hiding for access control; always enforce permission checks on the backend server.',
            order: 1
          }
        ],
        estimatedReadingTime: 7,
        difficultyLevel: 'advanced',
        order: 2,
        isPublished: true,
        createdBy: adminUser._id
      },
      {
        title: 'Securing Connections: VPNs, TLS 1.3 & Rogue Wi-Fi Hotspots',
        slug: 'securing-connections-vpns-tls-wifi',
        topic: topicMap['network-security'],
        shortDescription: 'Protect mobile devices on coffee shop networks against Evil Twin APs, ARP poisoning, and DNS hijacking.',
        learningObjectives: [
          'Identify Evil Twin access points mimicking legitimate public networks',
          'Understand how HTTPS/TLS 1.3 protects against eavesdropping',
          'Deploy DNS-over-HTTPS (DoH) and secure VPN tunnels'
        ],
        contentSections: [
          {
            title: '1. The Evil Twin Attack',
            content:
              'Attackers set up a rogue Wi-Fi hotspot with the identical SSID (e.g., "Airport_Free_WiFi") and higher broadcast power. Devices automatically connect, giving the attacker control over routing and DNS queries.',
            calloutType: 'warning',
            calloutText: 'Turn off "Auto-Join Known Networks" on mobile devices and use a trusted VPN on public networks.',
            order: 1
          }
        ],
        estimatedReadingTime: 6,
        difficultyLevel: 'intermediate',
        order: 1,
        isPublished: true,
        createdBy: instructorUser._id
      },
      {
        title: 'Data Classification, Safe Erasure & Incident Containment',
        slug: 'data-classification-erasure-incident-containment',
        topic: topicMap['incident-response-basics'],
        shortDescription: 'Frameworks for incident containment: network isolation, memory preservation, and regulatory disclosure.',
        learningObjectives: [
          'Classify corporate data into Public, Internal, Confidential, and Restricted tiers',
          'Perform NIST SP 800-88 cryptographic sanitization on discarded storage',
          'Execute the initial 60-minute containment playbook during active breaches'
        ],
        contentSections: [
          {
            title: '1. The Golden Rule of Live Incident Containment',
            content:
              'When malware or unauthorized intrusion is detected on a workstation, DO NOT turn off the power. Powering down flushes RAM, destroying volatile forensic evidence (injected processes, decrypted encryption keys, network sockets). Instead, disconnect the Ethernet cable or disable Wi-Fi to sever command-and-control communication while preserving volatile memory.',
            calloutType: 'alert',
            calloutText: 'Isolate the network, but do not power down the system during live incident triage.',
            order: 1
          }
        ],
        estimatedReadingTime: 9,
        difficultyLevel: 'intermediate',
        order: 1,
        isPublished: true,
        createdBy: adminUser._id
      }
    ];

    const createdModules = await LearningModule.insertMany(modulesData);
    console.log(`📖 Seeded ${createdModules.length} learning modules`);

    const moduleMap = {};
    createdModules.forEach((m) => {
      moduleMap[m.slug] = m._id;
    });

    // 5. Seed 5 Quizzes
    const quizzesData = [
      {
        title: 'Password Mastery & Credential Defense Challenge',
        description:
          'Test your knowledge on passphrase entropy, password manager zero-knowledge architecture, and credential stuffing defenses.',
        topic: topicMap['password-security'],
        learningModule: moduleMap['anatomy-of-resilient-passwords'],
        difficultyLevel: 'beginner',
        timeLimitMinutes: 10,
        passPercentage: 70,
        isRandomized: false,
        isPublished: true,
        createdBy: adminUser._id
      },
      {
        title: 'Phishing Spotter & Social Engineering Assessment',
        description:
          'Assess your readiness against spear phishing emails, typosquatting domains, urgency manipulation, and smishing attacks.',
        topic: topicMap['phishing-and-social-engineering'],
        learningModule: moduleMap['spotting-spear-phishing-and-malicious-emails'],
        difficultyLevel: 'beginner',
        timeLimitMinutes: 10,
        passPercentage: 70,
        isRandomized: false,
        isPublished: true,
        createdBy: instructorUser._id
      },
      {
        title: 'Malware Detection & Incident Prevention Quiz',
        description:
          'Evaluate your comprehension of ransomware double-extortion, immutable backups, and Living-off-the-Land attack techniques.',
        topic: topicMap['malware-and-ransomware'],
        learningModule: moduleMap['ransomware-operations-and-kill-chain'],
        difficultyLevel: 'intermediate',
        timeLimitMinutes: 12,
        passPercentage: 70,
        isRandomized: false,
        isPublished: true,
        createdBy: instructorUser._id
      },
      {
        title: 'Multi-Factor Authentication & Identity Verification Quiz',
        description:
          'Test your expertise in SMS 2FA risks, TOTP algorithms, push notification fatigue mitigation, and FIDO2/WebAuthn hardware keys.',
        topic: topicMap['multi-factor-authentication'],
        learningModule: moduleMap['implementing-robust-mfa'],
        difficultyLevel: 'beginner',
        timeLimitMinutes: 10,
        passPercentage: 70,
        isRandomized: false,
        isPublished: true,
        createdBy: adminUser._id
      },
      {
        title: 'Web Application Security & OWASP Top 10 Knowledge Check',
        description:
          'Demonstrate your understanding of SQL Injection prevention, XSS mitigation, Insecure Direct Object References (IDOR), and secure headers.',
        topic: topicMap['web-application-security'],
        learningModule: moduleMap['sql-injection-and-xss-demystified'],
        difficultyLevel: 'advanced',
        timeLimitMinutes: 15,
        passPercentage: 75,
        isRandomized: false,
        isPublished: true,
        createdBy: adminUser._id
      }
    ];

    const createdQuizzes = await Quiz.insertMany(quizzesData);
    console.log(`🎯 Seeded ${createdQuizzes.length} cybersecurity quizzes`);

    // 6. Seed 5 Questions per Quiz (Total 25 detailed questions)
    const questionsData = [
      // Quiz 1: Password Mastery (5 questions)
      {
        quiz: createdQuizzes[0]._id,
        questionText:
          'From an entropy perspective, which password strategy provides the strongest defense against modern offline dictionary and brute-force cracking attacks?',
        options: [
          { id: 'opt_1', text: 'An 8-character password with mixed case, numbers, and symbols like "Tr0ub4dor&"' },
          { id: 'opt_2', text: 'A 16-character passphrase composed of four completely random unrelated dictionary words' },
          { id: 'opt_3', text: 'A 10-character password derived from your childhood street name with digits replacing vowels' },
          { id: 'opt_4', text: 'A 6-character completely random alphanumeric string changed every 30 days' }
        ],
        correctAnswerId: 'opt_2',
        explanation:
          'Length exponentially increases search space. A 16-character multi-word random passphrase (Diceware style) provides over 50 bits of entropy and is practically immune to precomputed hash cracking dictionaries.',
        points: 1,
        order: 1
      },
      {
        quiz: createdQuizzes[0]._id,
        questionText:
          'What happens during an automated credential stuffing attack?',
        options: [
          { id: 'opt_1', text: 'Attackers flood a server with ICMP packets to crash authentication gateways' },
          { id: 'opt_2', text: 'Attackers guess passwords one by one using a single dictionary list on a single user' },
          { id: 'opt_3', text: 'Attackers use breached username/password pairs from one website to access accounts on other services' },
          { id: 'opt_4', text: 'Attackers inject SQL syntax into the login form input field' }
        ],
        correctAnswerId: 'opt_3',
        explanation:
          'Credential stuffing leverages the reality of password reuse. Bots systematically test lists of credentials leaked from prior breaches against thousands of diverse web applications.',
        points: 1,
        order: 2
      },
      {
        quiz: createdQuizzes[0]._id,
        questionText:
          'In a "Zero-Knowledge" password manager architecture, what information does the cloud vendor hold about your stored passwords?',
        options: [
          { id: 'opt_1', text: 'They store your master password in plaintext for account recovery purposes' },
          { id: 'opt_2', text: 'They hold your encryption keys in escrow with third-party trust authorities' },
          { id: 'opt_3', text: 'They only hold encrypted ciphertext blobs; decryption keys never leave your local device' },
          { id: 'opt_4', text: 'They decrypt your passwords on their server whenever you authenticate via 2FA' }
        ],
        correctAnswerId: 'opt_3',
        explanation:
          'Zero-knowledge encryption ensures the client device derives the cryptographic key locally from your master password and salt. The cloud servers only store ciphertext and cannot decrypt your vault.',
        points: 1,
        order: 3
      },
      {
        quiz: createdQuizzes[0]._id,
        questionText:
          'Why do modern NIST guidelines (SP 800-63B) strongly discourage mandatory periodic password changes (e.g., forcing changes every 90 days)?',
        options: [
          { id: 'opt_1', text: 'Modern computers can no longer process password changes quickly enough' },
          { id: 'opt_2', text: 'Frequent mandatory changes lead users to make predictable incremental modifications (e.g. Spring2024! to Summer2024!)' },
          { id: 'opt_3', text: 'Passwords stored longer in database servers automatically gain stronger hashing security' },
          { id: 'opt_4', text: 'Periodic password resets increase bandwidth consumption for cloud service providers' }
        ],
        correctAnswerId: 'opt_2',
        explanation:
          'Empirical research demonstrated that arbitrary rotation mandates cause humans to pick predictable patterns, actually decreasing security compared to choosing a strong passphrase and changing it only upon suspected compromise.',
        points: 1,
        order: 4
      },
      {
        quiz: createdQuizzes[0]._id,
        questionText:
          'What is a "rainbow table" in cryptographic credential attacks?',
        options: [
          { id: 'opt_1', text: 'A visual chart illustrating user password compliance across an enterprise network' },
          { id: 'opt_2', text: 'A precomputed lookup table of cryptographic hashes used to reverse unsalted password hashes' },
          { id: 'opt_3', text: 'A firewall filtering mechanism detecting multiple colors in HTML login portals' },
          { id: 'opt_4', text: 'A list of rainbow-colored hardware security keys authorized for FIDO2 login' }
        ],
        correctAnswerId: 'opt_2',
        explanation:
          'Rainbow tables trade memory for time by precomputing hash chains. Salting passwords with a unique random value completely renders precomputed rainbow tables useless.',
        points: 1,
        order: 5
      },

      // Quiz 2: Phishing Spotter (5 questions)
      {
        quiz: createdQuizzes[1]._id,
        questionText:
          'You receive an email purportedly from your HR department asking you to review an urgent policy change by clicking a link. What is the safest first step?',
        options: [
          { id: 'opt_1', text: 'Click the link immediately to see if the website looks authentic' },
          { id: 'opt_2', text: 'Reply to the email asking the sender to confirm their identity' },
          { id: 'opt_3', text: 'Inspect the sender address, hover over the link to verify the real destination URL, or contact HR out-of-band' },
          { id: 'opt_4', text: 'Forward the email to all coworkers to ask if they received it' }
        ],
        correctAnswerId: 'opt_3',
        explanation:
          'Inspecting full header details and verifying link destinations without clicking prevents payload triggers. Reaching out out-of-band via verified internal channels confirms legitimacy.',
        points: 1,
        order: 1
      },
      {
        quiz: createdQuizzes[1]._id,
        questionText:
          'What is an IDN Homograph attack in phishing campaigns?',
        options: [
          { id: 'opt_1', text: 'An attack that sends voice recordings mimicking your supervisor’s voice' },
          { id: 'opt_2', text: 'Using visually identical characters from non-Latin scripts (Cyrillic, Greek) to register deceptive domain names' },
          { id: 'opt_3', text: 'Hacking home routers to intercept domestic internet traffic' },
          { id: 'opt_4', text: 'Sending SMS messages with malicious hyperlinks' }
        ],
        correctAnswerId: 'opt_2',
        explanation:
          'Homograph attacks exploit characters that look identical (e.g. Cyrillic "а" vs Latin "a") in internationalized domain names (Punycode) to fool victims into believing they are on legitimate sites.',
        points: 1,
        order: 2
      },
      {
        quiz: createdQuizzes[1]._id,
        questionText:
          'Which core human psychological tendency is most frequently weaponized by social engineers?',
        options: [
          { id: 'opt_1', text: 'Apathy and complete disinterest in workplace events' },
          { id: 'opt_2', text: 'Artificial urgency, deference to authority, and fear of negative consequences' },
          { id: 'opt_3', text: 'A deep preference for reading complex corporate privacy documentation' },
          { id: 'opt_4', text: 'Patience and willingness to wait for confirmation' }
        ],
        correctAnswerId: 'opt_2',
        explanation:
          'Phishers deliberately trigger panic, urgency, or fear ("Account suspended in 2 hours", "Confidential request from CEO") to bypass critical cognitive evaluation.',
        points: 1,
        order: 3
      },
      {
        quiz: createdQuizzes[1]._id,
        questionText:
          'What is "Smishing"?',
        options: [
          { id: 'opt_1', text: 'Phishing attacks delivered through Short Message Service (SMS) text messages' },
          { id: 'opt_2', text: 'Physical theft of smart cards and RFID badges at office entrances' },
          { id: 'opt_3', text: 'Voice-based social engineering conducted over telephone calls' },
          { id: 'opt_4', text: 'Using malicious Wi-Fi beacons to spoof cellular towers' }
        ],
        correctAnswerId: 'opt_1',
        explanation:
          'Smishing is SMS phishing. Messages typically pretend to be delivery carrier delays, banking fraud alerts, or tax refunds to lure recipients into tapping harvesting links.',
        points: 1,
        order: 4
      },
      {
        quiz: createdQuizzes[1]._id,
        questionText:
          'Which email authentication standard cryptographically signs message headers to verify the sender domain has not been altered?',
        options: [
          { id: 'opt_1', text: 'SPF (Sender Policy Framework)' },
          { id: 'opt_2', text: 'DKIM (DomainKeys Identified Mail)' },
          { id: 'opt_3', text: 'SMTP (Simple Mail Transfer Protocol)' },
          { id: 'opt_4', text: 'IMAP (Internet Message Access Protocol)' }
        ],
        correctAnswerId: 'opt_2',
        explanation:
          'DKIM uses asymmetric cryptographic keypairs to digitally sign outbound emails. Receiving mail servers verify the digital signature against public keys published in DNS records.',
        points: 1,
        order: 5
      },

      // Quiz 3: Malware and Ransomware (5 questions)
      {
        quiz: createdQuizzes[2]._id,
        questionText:
          'What distinguishes "Double Extortion" ransomware from early generational ransomware?',
        options: [
          { id: 'opt_1', text: 'It demands payment in two distinct cryptocurrency formats simultaneously' },
          { id: 'opt_2', text: 'It exfiltrates confidential corporate data prior to encrypting local files, threatening public disclosure' },
          { id: 'opt_3', text: 'It infects both Windows and macOS operating systems at the exact same moment' },
          { id: 'opt_4', text: 'It locks system memory in addition to hard drive sectors' }
        ],
        correctAnswerId: 'opt_2',
        explanation:
          'In double extortion, attackers steal proprietary files before deploying the encryption payload. If the victim recovers from backups, the attackers threaten to publish trade secrets or client data.',
        points: 1,
        order: 1
      },
      {
        quiz: createdQuizzes[2]._id,
        questionText:
          'What is the core principle of the "3-2-1 Backup Rule" for defending against destructive ransomware?',
        options: [
          { id: 'opt_1', text: '3 passwords, 2 security tokens, and 1 administrator authorization key' },
          { id: 'opt_2', text: '3 copies of data, on 2 different storage media, with at least 1 copy stored offsite or immutable' },
          { id: 'opt_3', text: '3 encrypted partitions, 2 local flash drives, and 1 paper printed backup' },
          { id: 'opt_4', text: 'Backing up data at 3 PM, 2 PM, and 1 PM daily' }
        ],
        correctAnswerId: 'opt_2',
        explanation:
          'The 3-2-1 rule guarantees recovery resiliency: 3 total copies of data, 2 distinct media types (e.g. NAS and tape/cloud), with at least 1 copy offsite/immutable (air-gapped from live network infection).',
        points: 1,
        order: 2
      },
      {
        quiz: createdQuizzes[2]._id,
        questionText:
          'How do attackers carry out "Living off the Land" (LotL) execution?',
        options: [
          { id: 'opt_1', text: 'By physically stealing servers from data center buildings' },
          { id: 'opt_2', text: 'By utilizing legitimate, pre-installed administrative tools and binaries (PowerShell, WMI, certutil) to execute attacks' },
          { id: 'opt_3', text: 'By building custom malware written exclusively in assembly language' },
          { id: 'opt_4', text: 'By disabling hardware power supplies using voltage fluctuations' }
        ],
        correctAnswerId: 'opt_2',
        explanation:
          'Living off the Land utilizes LOLBAS (Living Off The Land Binaries and Scripts) like powershell.exe, certutil, and bitsadmin. Because these tools are trusted system components, they bypass basic signature antivirus filters.',
        points: 1,
        order: 3
      },
      {
        quiz: createdQuizzes[2]._id,
        questionText:
          'What distinguishes a "Rootkit" from standard user-level trojans?',
        options: [
          { id: 'opt_1', text: 'A rootkit operates in the OS kernel or firmware layer, hiding its processes and files from the operating system' },
          { id: 'opt_2', text: 'A rootkit can only infect Linux systems running as the root user' },
          { id: 'opt_3', text: 'A rootkit only encrypts text files located in the root directory' },
          { id: 'opt_4', text: 'A rootkit is delivered exclusively via physical USB keys' }
        ],
        correctAnswerId: 'opt_1',
        explanation:
          'Rootkits subvert operating system integrity by intercepting API calls at kernel or hypervisor/firmware levels, rendering their presence invisible to conventional task managers and basic scanners.',
        points: 1,
        order: 4
      },
      {
        quiz: createdQuizzes[2]._id,
        questionText:
          'Why should you isolate an infected machine from the network instead of powering it off immediately during an active malware incident?',
        options: [
          { id: 'opt_1', text: 'Powering off causes the hard drive heads to scratch the magnetic platters' },
          { id: 'opt_2', text: 'Powering off clears volatile RAM, destroying vital forensic evidence such as encryption keys and running processes' },
          { id: 'opt_3', text: 'The malware automatically forwards a copy to the cloud whenever power is lost' },
          { id: 'opt_4', text: 'Network cables cannot be disconnected while devices are receiving power' }
        ],
        correctAnswerId: 'opt_2',
        explanation:
          'Volatile memory (RAM) contains injected processes, active network connections, and uncommitted cryptographic keys. Pulling network plugs severs command-and-control communication while preserving memory for forensic triage.',
        points: 1,
        order: 5
      },

      // Quiz 4: Multi-Factor Authentication (5 questions)
      {
        quiz: createdQuizzes[3]._id,
        questionText:
          'Why is SMS-based two-factor authentication considered vulnerable to targeted account takeovers?',
        options: [
          { id: 'opt_1', text: 'Cellular signals cannot transmit numbers higher than 9999' },
          { id: 'opt_2', text: 'Attackers can intercept SMS via SIM swapping scams or telecom routing vulnerabilities (SS7)' },
          { id: 'opt_3', text: 'SMS messages can only be delivered during standard business hours' },
          { id: 'opt_4', text: 'SMS messages require an active VPN connection to be decrypted' }
        ],
        correctAnswerId: 'opt_2',
        explanation:
          'SIM swapping involves social engineering mobile phone provider representatives to port the victim’s number to an attacker SIM card, allowing intercept of all incoming one-time SMS verification codes.',
        points: 1,
        order: 1
      },
      {
        quiz: createdQuizzes[3]._id,
        questionText:
          'How does Time-based One-Time Password (TOTP) generate valid codes without requiring an active internet connection on your phone?',
        options: [
          { id: 'opt_1', text: 'It uses satellite GPS positioning coordinates' },
          { id: 'opt_2', text: 'It hashes a shared secret key and the current 30-second Unix time counter using HMAC-SHA1' },
          { id: 'opt_3', text: 'It stores a static list of 10,000 pre-generated codes inside local cache' },
          { id: 'opt_4', text: 'It listens for ultrasonic audio signals transmitted by your laptop speaker' }
        ],
        correctAnswerId: 'opt_2',
        explanation:
          'RFC 6238 defines TOTP: Both the server and client app hold the identical secret seed key (shared via QR code). Combining this secret with the current Unix epoch time divided by 30 produces the synchronized 6-digit code.',
        points: 1,
        order: 2
      },
      {
        quiz: createdQuizzes[3]._id,
        questionText:
          'What mechanism effectively stops "MFA Fatigue" (prompt bombing) attacks?',
        options: [
          { id: 'opt_1', text: 'Switching all users back to simple static password authentication' },
          { id: 'opt_2', text: 'Number matching, requiring the user to type the 2-digit number displayed on the login screen into their authenticator' },
          { id: 'opt_3', text: 'Sending push notifications only via email attachments' },
          { id: 'opt_4', text: 'Increasing push notification sound volume so users wake up faster' }
        ],
        correctAnswerId: 'opt_2',
        explanation:
          'In MFA fatigue, attackers flood a user with push notifications hoping they tap "Approve" blindly. Number matching prevents this because the user must see the number displayed on the legitimate browser session.',
        points: 1,
        order: 3
      },
      {
        quiz: createdQuizzes[3]._id,
        questionText:
          'Why is FIDO2 / WebAuthn (e.g. YubiKey) considered completely immune to real-time reverse-proxy phishing (like Evilginx)?',
        options: [
          { id: 'opt_1', text: 'The hardware key physically scans the fingerprint of the remote attacker' },
          { id: 'opt_2', text: 'The cryptographic challenge is cryptographically bound to the browser origin domain' },
          { id: 'opt_3', text: 'Hardware keys block all internet traffic that does not originate from government IP ranges' },
          { id: 'opt_4', text: 'WebAuthn stores all user passwords on a military-grade satellite network' }
        ],
        correctAnswerId: 'opt_2',
        explanation:
          'The WebAuthn API provides the browser domain origin to the hardware key. The signature generated is only valid for that exact domain. If a phishing site proxies the connection, the signature fails validation at the real server.',
        points: 1,
        order: 4
      },
      {
        quiz: createdQuizzes[3]._id,
        questionText:
          'Which of the following represents an authentication factor from the "Something You Are" category?',
        options: [
          { id: 'opt_1', text: 'A 14-character alphanumeric passphrase' },
          { id: 'opt_2', text: 'A hardware USB token containing a private key' },
          { id: 'opt_3', text: 'A biometric fingerprint or facial recognition scan' },
          { id: 'opt_4', text: 'A dynamic TOTP code generated on your smartphone' }
        ],
        correctAnswerId: 'opt_3',
        explanation:
          'Authentication factors: Something You Know (passwords/PINs), Something You Have (tokens/smartphones), and Something You Are (biometrics: fingerprints, retina scans, facial recognition).',
        points: 1,
        order: 5
      },

      // Quiz 5: Web Application Security (5 questions)
      {
        quiz: createdQuizzes[4]._id,
        questionText:
          'What is the most effective architectural defense against SQL Injection vulnerabilities in backend web applications?',
        options: [
          { id: 'opt_1', text: 'Filtering out single quote characters using client-side regular expressions' },
          { id: 'opt_2', text: 'Using parameterized queries (prepared statements) or safe ORM mappings' },
          { id: 'opt_3', text: 'Converting all database columns to string types' },
          { id: 'opt_4', text: 'Encrypting database hard drives using BitLocker' }
        ],
        correctAnswerId: 'opt_2',
        explanation:
          'Parameterized queries treat user input strictly as data parameters rather than executable SQL commands, making it syntactically impossible for input to alter query logic.',
        points: 1,
        order: 1
      },
      {
        quiz: createdQuizzes[4]._id,
        questionText:
          'How does Stored Cross-Site Scripting (XSS) differ from Reflected Cross-Site Scripting?',
        options: [
          { id: 'opt_1', text: 'Stored XSS executes in server memory, whereas Reflected XSS executes in client routers' },
          { id: 'opt_2', text: 'Stored XSS permanently saves the malicious payload in the database, executing against any user viewing the page' },
          { id: 'opt_3', text: 'Stored XSS only affects mobile applications, while Reflected XSS affects desktop browsers' },
          { id: 'opt_4', text: 'Stored XSS requires physical access to the web server hardware' }
        ],
        correctAnswerId: 'opt_2',
        explanation:
          'Stored XSS injects malicious code into persistent storage (e.g. comment sections, user profiles). Every subsequent victim requesting that resource has the script executed in their browser context.',
        points: 1,
        order: 2
      },
      {
        quiz: createdQuizzes[4]._id,
        questionText:
          'What is an Insecure Direct Object Reference (IDOR)?',
        options: [
          { id: 'opt_1', text: 'A broken hyperlink pointing to an image file that no longer exists' },
          { id: 'opt_2', text: 'An application flaw where internal object identifiers in URL parameters are exposed without server authorization checks' },
          { id: 'opt_3', text: 'A failure to import external JavaScript libraries over HTTPS' },
          { id: 'opt_4', text: 'Using variable names longer than 64 characters in JavaScript' }
        ],
        correctAnswerId: 'opt_2',
        explanation:
          'IDOR occurs when an application exposes a direct database key or record identifier in a request (like /api/records/459) and fails to verify that the requesting user owns or has permission to access record 459.',
        points: 1,
        order: 3
      },
      {
        quiz: createdQuizzes[4]._id,
        questionText:
          'Why is the "HttpOnly" cookie flag essential for protecting web authentication tokens?',
        options: [
          { id: 'opt_1', text: 'It forces the browser to transmit cookies exclusively over HTTP instead of HTTPS' },
          { id: 'opt_2', text: 'It prevents client-side JavaScript (via document.cookie) from reading the cookie, mitigating token theft via XSS' },
          { id: 'opt_3', text: 'It compresses cookie payloads to reduce HTTP latency' },
          { id: 'opt_4', text: 'It deletes cookies whenever the user closes their browser window' }
        ],
        correctAnswerId: 'opt_2',
        explanation:
          'Setting HttpOnly ensures that if an attacker manages to execute Cross-Site Scripting on the webpage, their injected script cannot access session tokens stored in the cookie.',
        points: 1,
        order: 4
      },
      {
        quiz: createdQuizzes[4]._id,
        questionText:
          'What is the purpose of a Content Security Policy (CSP) HTTP header?',
        options: [
          { id: 'opt_1', text: 'It provides legal copyright notices for all images published on the website' },
          { id: 'opt_2', text: 'It restricts the sources and origins from which browsers are allowed to load scripts, styles, and frames' },
          { id: 'opt_3', text: 'It encrypts database passwords before saving them into configuration files' },
          { id: 'opt_4', text: 'It forces search engines to index private administrative dashboards' }
        ],
        correctAnswerId: 'opt_2',
        explanation:
          'Content Security Policy (CSP) is an HTTP header that lets site operators declare trusted domains for executable scripts, stylesheets, and images, drastically limiting the impact of Cross-Site Scripting.',
        points: 1,
        order: 5
      }
    ];

    await Question.insertMany(questionsData);
    console.log(`❓ Seeded ${questionsData.length} questions across all 5 quizzes (5 per quiz)`);

    // 7. Initialize sample progress & completed quiz attempt for demo Learner
    console.log('📊 Seeding initial progress and demo quiz attempts for the learner account...');
    const learnerQuiz = createdQuizzes[0];
    const attempt = await QuizAttempt.create({
      user: learnerUser._id,
      quiz: learnerQuiz._id,
      status: 'completed',
      score: 5,
      maxScore: 5,
      percentage: 100,
      correctAnswersCount: 5,
      totalQuestionsCount: 5,
      isPassed: true,
      startTime: new Date(Date.now() - 360000),
      submissionTime: new Date(),
      durationSeconds: 320,
      answers: [
        {
          questionId: questionsData[0]._id || new mongoose.Types.ObjectId(),
          questionText: questionsData[0].questionText,
          selectedOptionId: 'opt_2',
          correctOptionId: 'opt_2',
          isCorrect: true,
          explanation: questionsData[0].explanation,
          pointsAwarded: 1,
          maxPoints: 1,
          optionsSnapshot: questionsData[0].options
        },
        {
          questionId: questionsData[1]._id || new mongoose.Types.ObjectId(),
          questionText: questionsData[1].questionText,
          selectedOptionId: 'opt_3',
          correctOptionId: 'opt_3',
          isCorrect: true,
          explanation: questionsData[1].explanation,
          pointsAwarded: 1,
          maxPoints: 1,
          optionsSnapshot: questionsData[1].options
        },
        {
          questionId: questionsData[2]._id || new mongoose.Types.ObjectId(),
          questionText: questionsData[2].questionText,
          selectedOptionId: 'opt_3',
          correctOptionId: 'opt_3',
          isCorrect: true,
          explanation: questionsData[2].explanation,
          pointsAwarded: 1,
          maxPoints: 1,
          optionsSnapshot: questionsData[2].options
        },
        {
          questionId: questionsData[3]._id || new mongoose.Types.ObjectId(),
          questionText: questionsData[3].questionText,
          selectedOptionId: 'opt_2',
          correctOptionId: 'opt_2',
          isCorrect: true,
          explanation: questionsData[3].explanation,
          pointsAwarded: 1,
          maxPoints: 1,
          optionsSnapshot: questionsData[3].options
        },
        {
          questionId: questionsData[4]._id || new mongoose.Types.ObjectId(),
          questionText: questionsData[4].questionText,
          selectedOptionId: 'opt_2',
          correctOptionId: 'opt_2',
          isCorrect: true,
          explanation: questionsData[4].explanation,
          pointsAwarded: 1,
          maxPoints: 1,
          optionsSnapshot: questionsData[4].options
        }
      ]
    });

    await Progress.create({
      user: learnerUser._id,
      completedModules: [
        {
          module: createdModules[0]._id,
          completedAt: new Date(Date.now() - 7200000)
        },
        {
          module: createdModules[1]._id,
          completedAt: new Date(Date.now() - 3600000)
        }
      ],
      viewedModules: [
        {
          module: createdModules[0]._id,
          lastViewedAt: new Date(Date.now() - 7200000)
        },
        {
          module: createdModules[1]._id,
          lastViewedAt: new Date(Date.now() - 3600000)
        },
        {
          module: createdModules[2]._id,
          lastViewedAt: new Date(Date.now() - 1800000)
        }
      ],
      quizStats: [
        {
          quiz: learnerQuiz._id,
          bestScore: 5,
          bestPercentage: 100,
          isPassed: true,
          attemptsCount: 1,
          lastAttemptAt: new Date()
        }
      ],
      achievements: [
        {
          code: 'first-login',
          title: 'Welcome Cadet',
          description: 'Joined the CyberShield awareness training platform',
          badgeIcon: 'Shield',
          earnedAt: new Date(Date.now() - 86400000)
        },
        {
          code: 'first-module',
          title: 'Knowledge Seeker',
          description: 'Completed your first cybersecurity learning module',
          badgeIcon: 'BookOpen',
          earnedAt: new Date(Date.now() - 7200000)
        },
        {
          code: 'first-quiz',
          title: 'Threat Analyst',
          description: 'Completed your first cybersecurity quiz assessment',
          badgeIcon: 'FileCheck',
          earnedAt: new Date()
        },
        {
          code: 'perfect-score',
          title: 'Flawless Defense',
          description: 'Achieved a perfect 100% score on a cybersecurity quiz',
          badgeIcon: 'Zap',
          earnedAt: new Date()
        }
      ]
    });

    // 7. Seed Visual Learning Hub Resources
    await seedVisualResources({ moduleMap, topicMap, adminUser, learnerUser });

    // 8. Seed Watch How It Happens Attack Simulations
    await seedAttackSimulations();

    console.log('✅ CyberShield database seed complete!');
    console.log('----------------------------------------------------');
    console.log('🔑 Credentials for local development:');
    console.log(`   Admin:      ${env.ADMIN_EMAIL} / ${env.ADMIN_INITIAL_PASSWORD}`);
    console.log('   Instructor: instructor@cybershield.local / InstructorPass123!');
    console.log('   Learner:    learner@cybershield.local / LearnerPass123!');
    console.log('----------------------------------------------------');
  } catch (error) {
    console.error('❌ Error during seeding:', error);
    throw error;
  }
};

// If executed directly via CLI
if (process.argv[1]?.endsWith('seed.js')) {
  seedDatabase()
    .then(() => disconnectDB())
    .catch((err) => {
      console.error(err);
      process.exit(1);
    });
}

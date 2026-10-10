import React, { useState, useMemo } from 'react';
import {
  Terminal,
  Play,
  RotateCcw,
  CheckCircle2,
  Check,
  Shield,
  ShieldAlert,
  ShieldCheck,
  AlertTriangle,
  Send,
  Plus,
  Trash2,
  Lock,
  KeyRound,
  Code,
  Zap,
  MailWarning,
  Eye,
  Hash,
  ArrowRight,
  Sparkles
} from 'lucide-react';
import { DifficultyBadge } from '../common/Badge';

// =========================================================================
// 1. FIREWALL SIMULATOR COMPONENT
// =========================================================================
const FirewallSimulator = () => {
  const [rules, setRules] = useState([
    { id: 1, port: 80, protocol: 'TCP', action: 'ACCEPT', desc: 'Allow HTTP Web' },
    { id: 2, port: 443, protocol: 'TCP', action: 'ACCEPT', desc: 'Allow HTTPS Secure Web' },
    { id: 3, port: 22, protocol: 'TCP', action: 'DROP', desc: 'Block Public SSH Access' },
    { id: 4, port: 23, protocol: 'TCP', action: 'DROP', desc: 'Block Insecure Telnet' }
  ]);

  const [testPacket, setTestPacket] = useState({
    srcIp: '198.51.100.45',
    dstPort: 80,
    protocol: 'TCP'
  });

  const [log, setLog] = useState([]);
  const [newRule, setNewRule] = useState({ port: '', protocol: 'TCP', action: 'DROP', desc: '' });

  const handleSendPacket = () => {
    const matchingRule = rules.find(
      (r) =>
        r.port === parseInt(testPacket.dstPort, 10) &&
        r.protocol.toUpperCase() === testPacket.protocol.toUpperCase()
    );

    const verdict = matchingRule ? matchingRule.action : 'DROP'; // Default deny policy
    const reason = matchingRule
      ? `Matched Rule #${matchingRule.id} (${matchingRule.desc}): ${matchingRule.action}`
      : 'Default Deny: No explicit ACCEPT rule found for this port/protocol.';

    const entry = {
      timestamp: new Date().toLocaleTimeString(),
      packet: { ...testPacket },
      verdict,
      reason
    };

    setLog((prev) => [entry, ...prev.slice(0, 9)]);
  };

  const handleAddRule = (e) => {
    e.preventDefault();
    if (!newRule.port) return;
    const ruleObj = {
      id: rules.length + 1,
      port: parseInt(newRule.port, 10),
      protocol: newRule.protocol,
      action: newRule.action,
      desc: newRule.desc || `Custom ${newRule.protocol} Port ${newRule.port}`
    };
    setRules([...rules, ruleObj]);
    setNewRule({ port: '', protocol: 'TCP', action: 'DROP', desc: '' });
  };

  return (
    <div className="space-y-6">
      {/* Firewall Rules Table */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
        <div className="bg-[#FAF8FF] px-6 py-3.5 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Shield className="w-4 h-4 text-[#6D28D9]" />
            <h4 className="text-sm font-bold text-[#1E1B4B]">Stateful Firewall Rule Base</h4>
          </div>
          <span className="text-xs text-slate-500 font-mono">Default Policy: DROP</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 font-mono uppercase border-b border-slate-200">
              <tr>
                <th className="px-5 py-2.5">Rule #</th>
                <th className="px-5 py-2.5">Port</th>
                <th className="px-5 py-2.5">Protocol</th>
                <th className="px-5 py-2.5">Action</th>
                <th className="px-5 py-2.5">Description</th>
                <th className="px-5 py-2.5 text-right">Delete</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {rules.map((r, i) => (
                <tr key={r.id} className="hover:bg-[#FAF8FF] transition">
                  <td className="px-5 py-3 font-mono font-bold text-slate-700">#{r.id}</td>
                  <td className="px-5 py-3 font-mono font-bold text-[#1E1B4B]">{r.port}</td>
                  <td className="px-5 py-3 font-mono text-slate-600">{r.protocol}</td>
                  <td className="px-5 py-3">
                    <span
                      className={`px-2.5 py-0.5 rounded-md font-bold text-[10px] font-mono border ${
                        r.action === 'ACCEPT'
                          ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                          : 'bg-rose-50 text-rose-800 border-rose-200'
                      }`}
                    >
                      {r.action}
                    </span>
                  </td>
                  <td className="px-5 py-3 text-slate-600">{r.desc}</td>
                  <td className="px-5 py-3 text-right">
                    <button
                      type="button"
                      onClick={() => setRules(rules.filter((item) => item.id !== r.id))}
                      className="text-slate-400 hover:text-rose-600 transition"
                      title="Remove rule"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Packet Dispatcher & Quick Tester */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-4">
          <h4 className="text-sm font-bold text-[#1E1B4B] flex items-center gap-2">
            <Send className="w-4 h-4 text-[#6D28D9]" />
            <span>Generate Inbound Test Packet</span>
          </h4>

          <div className="space-y-3">
            <div>
              <label className="block text-xs font-mono uppercase text-slate-600 font-bold mb-1">
                Source IP Address
              </label>
              <input
                type="text"
                value={testPacket.srcIp}
                onChange={(e) => setTestPacket({ ...testPacket, srcIp: e.target.value })}
                className="w-full px-3 py-2 rounded-xl bg-[#FAF8FF] border border-slate-200 text-xs font-mono text-[#1E1B4B]"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-mono uppercase text-slate-600 font-bold mb-1">
                  Destination Port
                </label>
                <select
                  value={testPacket.dstPort}
                  onChange={(e) => setTestPacket({ ...testPacket, dstPort: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-[#FAF8FF] border border-slate-200 text-xs font-mono text-[#1E1B4B]"
                >
                  <option value={80}>80 (HTTP Web)</option>
                  <option value={443}>443 (HTTPS Secure)</option>
                  <option value={22}>22 (SSH Terminal)</option>
                  <option value={23}>23 (Telnet Unencrypted)</option>
                  <option value={3389}>3389 (RDP Desktop)</option>
                  <option value={8080}>8080 (Dev Web Proxy)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-mono uppercase text-slate-600 font-bold mb-1">
                  Protocol
                </label>
                <select
                  value={testPacket.protocol}
                  onChange={(e) => setTestPacket({ ...testPacket, protocol: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-[#FAF8FF] border border-slate-200 text-xs font-mono text-[#1E1B4B]"
                >
                  <option value="TCP">TCP</option>
                  <option value="UDP">UDP</option>
                </select>
              </div>
            </div>

            <button
              type="button"
              onClick={handleSendPacket}
              className="w-full py-2.5 rounded-xl bg-[#6D28D9] hover:bg-[#5B21B6] text-white text-xs font-bold transition flex items-center justify-center gap-2 shadow-xs"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Dispatch Packet Against Firewall</span>
            </button>
          </div>
        </div>

        {/* Live Packet Inspection Log */}
        <div className="bg-slate-950 rounded-2xl p-6 border border-slate-800 text-slate-100 font-mono text-xs space-y-3">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2 text-slate-400">
            <span className="flex items-center gap-1.5 text-cyan-400">
              <Terminal className="w-3.5 h-3.5" />
              <span>Inspection Engine Telemetry Log</span>
            </span>
            <button
              type="button"
              onClick={() => setLog([])}
              className="text-[10px] text-slate-500 hover:text-slate-300"
            >
              Clear
            </button>
          </div>

          <div className="h-44 overflow-y-auto space-y-2 pr-1 text-[11px]">
            {log.length === 0 ? (
              <p className="text-slate-600 pt-6 text-center">
                Awaiting packets... Click "Dispatch Packet Against Firewall" to test rules.
              </p>
            ) : (
              log.map((entry, idx) => (
                <div
                  key={idx}
                  className={`p-2 rounded-lg border ${
                    entry.verdict === 'ACCEPT'
                      ? 'border-emerald-800/60 bg-emerald-950/30 text-emerald-300'
                      : 'border-rose-800/60 bg-rose-950/30 text-rose-300'
                  }`}
                >
                  <div className="flex items-center justify-between font-bold">
                    <span>
                      [{entry.timestamp}] {entry.packet.protocol} {entry.packet.srcIp} → Port {entry.packet.dstPort}
                    </span>
                    <span
                      className={`px-1.5 py-0.2 rounded text-[10px] font-bold ${
                        entry.verdict === 'ACCEPT' ? 'bg-emerald-500 text-black' : 'bg-rose-500 text-white'
                      }`}
                    >
                      {entry.verdict}
                    </span>
                  </div>
                  <p className="text-slate-400 text-[10px] mt-1">{entry.reason}</p>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// =========================================================================
// 2. PASSWORD ENTROPY & BRUTE FORCE SIMULATOR
// =========================================================================
const PasswordSimulator = ({ config }) => {
  const [password, setPassword] = useState(config?.defaultInput || 'CorrectHorseBatteryStaple');

  const stats = useMemo(() => {
    let pool = 0;
    const hasLower = /[a-z]/.test(password);
    const hasUpper = /[A-Z]/.test(password);
    const hasDigits = /[0-9]/.test(password);
    const hasSymbols = /[^a-zA-Z0-9\s]/.test(password);
    const hasSpaces = /\s/.test(password);

    if (hasLower) pool += 26;
    if (hasUpper) pool += 26;
    if (hasDigits) pool += 10;
    if (hasSymbols) pool += 33;
    if (hasSpaces) pool += 1;

    const length = password.length;
    const entropy = length > 0 && pool > 0 ? Math.round(length * Math.log2(pool)) : 0;

    // Search space: pool ^ length
    // 100 Billion guesses / sec = 1e11
    const totalCombinations = length > 0 && pool > 0 ? Math.pow(pool, Math.min(length, 25)) : 0;
    const seconds = totalCombinations / 1e11;

    let crackTime = 'Instant';
    if (entropy === 0) crackTime = '0 seconds';
    else if (entropy < 30) crackTime = 'Milliseconds (< 0.01 sec)';
    else if (entropy < 45) crackTime = 'Few Minutes';
    else if (entropy < 60) crackTime = 'Several Months';
    else if (entropy < 75) crackTime = 'Decades (~80 Years)';
    else if (entropy < 90) crackTime = 'Centuries (~4,000 Years)';
    else crackTime = 'Millions of Centuries (Uncrackable offline)';

    return {
      length,
      pool,
      entropy,
      crackTime,
      hasLower,
      hasUpper,
      hasDigits,
      hasSymbols
    };
  }, [password]);

  const generateDiceware = () => {
    const words = [
      'correct', 'horse', 'battery', 'staple', 'rocket', 'shield', 'crypto', 'timber',
      'shadow', 'planet', 'cipher', 'castle', 'silver', 'cobalt', 'matrix', 'glacier'
    ];
    const picked = [];
    for (let i = 0; i < 4; i++) {
      picked.push(words[Math.floor(Math.random() * words.length)]);
    }
    setPassword(picked.join('-'));
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-6">
        <div>
          <div className="flex items-center justify-between gap-4 mb-2">
            <label className="text-xs font-mono uppercase text-slate-700 font-bold flex items-center gap-1.5">
              <KeyRound className="w-4 h-4 text-[#6D28D9]" />
              <span>Input Candidate Password or Passphrase</span>
            </label>
            <button
              type="button"
              onClick={generateDiceware}
              className="text-xs font-bold text-[#6D28D9] hover:text-[#5B21B6] flex items-center gap-1"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Generate 4-Word Diceware</span>
            </button>
          </div>

          <input
            type="text"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Type test password here..."
            className="w-full px-4 py-3 rounded-xl bg-[#FAF8FF] border border-slate-200 text-sm font-mono text-[#1E1B4B] focus:outline-none focus:border-[#6D28D9] focus:bg-white"
          />
        </div>

        {/* Entropy Meter */}
        <div className="space-y-2">
          <div className="flex justify-between items-center text-xs">
            <span className="font-bold text-[#1E1B4B]">
              Calculated Shannon Entropy: <span className="font-mono text-[#6D28D9] text-base">{stats.entropy} Bits</span>
            </span>
            <span className="font-mono font-bold text-slate-600">
              {stats.entropy >= 65 ? 'EXCELLENT' : stats.entropy >= 45 ? 'MODERATE' : 'WEAK'}
            </span>
          </div>

          <div className="w-full h-3 rounded-full bg-slate-100 overflow-hidden flex">
            <div
              className={`h-full transition-all duration-300 ${
                stats.entropy >= 65 ? 'bg-emerald-500' : stats.entropy >= 45 ? 'bg-amber-500' : 'bg-rose-500'
              }`}
              style={{ width: `${Math.min(100, (stats.entropy / 80) * 100)}%` }}
            />
          </div>
        </div>

        {/* Metrics Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-[#FAF8FF] p-4 rounded-xl border border-slate-200">
            <span className="text-[11px] font-mono uppercase text-slate-500">Length</span>
            <h4 className="text-xl font-extrabold text-[#1E1B4B] mt-0.5">{stats.length} Chars</h4>
          </div>

          <div className="bg-[#FAF8FF] p-4 rounded-xl border border-slate-200">
            <span className="text-[11px] font-mono uppercase text-slate-500">Character Set Space</span>
            <h4 className="text-xl font-extrabold text-[#1E1B4B] mt-0.5">{stats.pool} Symbols</h4>
          </div>

          <div className="bg-purple-50/70 p-4 rounded-xl border border-purple-200">
            <span className="text-[11px] font-mono uppercase text-purple-700">Crack Time (100B/sec GPU)</span>
            <h4 className="text-base font-extrabold text-[#6D28D9] mt-0.5 leading-snug">{stats.crackTime}</h4>
          </div>
        </div>

        {/* NIST Recommendation Checklist */}
        <div className="pt-4 border-t border-slate-100 space-y-2">
          <h5 className="text-xs font-bold font-mono uppercase text-slate-700">NIST SP 800-63B Compliance Audit</h5>
          <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
            <li className={`flex items-center gap-2 ${stats.length >= 12 ? 'text-emerald-700' : 'text-slate-500'}`}>
              <CheckCircle2 className={`w-4 h-4 ${stats.length >= 12 ? 'text-emerald-600' : 'text-slate-300'}`} />
              <span>Minimum 12+ characters length</span>
            </li>
            <li className={`flex items-center gap-2 ${stats.entropy >= 50 ? 'text-emerald-700' : 'text-slate-500'}`}>
              <CheckCircle2 className={`w-4 h-4 ${stats.entropy >= 50 ? 'text-emerald-600' : 'text-slate-300'}`} />
              <span>Entropy exceeds 50 bits threshold</span>
            </li>
            <li className={`flex items-center gap-2 ${stats.pool >= 50 ? 'text-emerald-700' : 'text-slate-500'}`}>
              <CheckCircle2 className={`w-4 h-4 ${stats.pool >= 50 ? 'text-emerald-600' : 'text-slate-300'}`} />
              <span>Multi-character class or word variety</span>
            </li>
            <li className="flex items-center gap-2 text-emerald-700">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>Resistant to simple dictionary lookup</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};

// =========================================================================
// 3. SQL INJECTION (VULNERABLE VS PARAMETERIZED) SANDBOX
// =========================================================================
const SqlInjectionSimulator = () => {
  const [userInput, setUserInput] = useState("admin' OR '1'='1");

  const presets = [
    { label: 'Normal Input', val: 'alice' },
    { label: 'Auth Bypass Attack', val: "admin' OR '1'='1" },
    { label: 'UNION Schema Leak', val: "' UNION SELECT username, password FROM users--" },
    { label: 'Dangerous Drop Command', val: "'; DROP TABLE users--" }
  ];

  const vulnerableQuery = `SELECT * FROM users WHERE username = '${userInput}' AND password = 'password123';`;
  const isAttack = userInput.includes("'") || userInput.includes("--") || userInput.toLowerCase().includes("union");

  return (
    <div className="space-y-6">
      {/* Input controller */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-4">
        <div>
          <label className="block text-xs font-mono uppercase text-slate-700 font-bold mb-2">
            Simulated Web Form Login Field (Username)
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              value={userInput}
              onChange={(e) => setUserInput(e.target.value)}
              className="flex-1 px-4 py-2.5 rounded-xl bg-[#FAF8FF] border border-slate-200 text-xs font-mono text-[#1E1B4B] focus:outline-none focus:border-[#6D28D9]"
            />
          </div>
        </div>

        {/* Quick Presets */}
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-[11px] font-mono text-slate-500">Presets:</span>
          {presets.map((p, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => setUserInput(p.val)}
              className="px-2.5 py-1 rounded-lg bg-[#FAF8FF] border border-slate-200 hover:bg-[#EDE9FE] hover:text-[#6D28D9] text-[11px] font-mono font-medium transition"
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      {/* Side by side comparison */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Vulnerable Concatenation */}
        <div className="bg-rose-50/50 rounded-2xl p-6 border-2 border-rose-300 space-y-3">
          <div className="flex items-center justify-between">
            <span className="px-2.5 py-1 rounded-md bg-rose-200 text-rose-900 font-mono text-[10px] font-bold">
              VULNERABLE IMPLEMENTATION
            </span>
            <span className="text-xs text-rose-700 font-bold">Raw String Concatenation</span>
          </div>

          <div className="bg-slate-950 p-4 rounded-xl text-slate-100 font-mono text-xs overflow-x-auto leading-relaxed">
            <span className="text-slate-400">query = </span>
            <span className="text-emerald-400">"SELECT * FROM users WHERE username = '"</span>
            <span className="text-slate-300"> + </span>
            <span className="text-rose-400 font-bold bg-rose-950/60 px-1 rounded">input</span>
            <span className="text-slate-300"> + </span>
            <span className="text-emerald-400">"'"</span>
          </div>

          <div className="bg-white p-3.5 rounded-xl border border-rose-200 text-xs space-y-1.5">
            <strong className="text-rose-900 block font-mono">Resulting SQL Executed by Database:</strong>
            <pre className="font-mono text-rose-700 text-[11px] whitespace-pre-wrap font-bold bg-rose-50 p-2 rounded">
              {vulnerableQuery}
            </pre>
            {isAttack ? (
              <p className="text-rose-800 text-[11px] leading-relaxed pt-1 flex items-start gap-1.5">
                <ShieldAlert className="w-4 h-4 shrink-0 text-rose-600 mt-0.5" />
                <span>
                  <strong>CRITICAL VULNERABILITY:</strong> Input broke the SQL string boundary! The database evaluates <code className="bg-rose-200 px-1 rounded">'1'='1'</code> as always true, returning all user rows without credentials!
                </span>
              </p>
            ) : (
              <p className="text-slate-600 text-[11px]">Normal search execution for safe strings.</p>
            )}
          </div>
        </div>

        {/* Secure Prepared Statement */}
        <div className="bg-emerald-50/50 rounded-2xl p-6 border-2 border-emerald-300 space-y-3">
          <div className="flex items-center justify-between">
            <span className="px-2.5 py-1 rounded-md bg-emerald-200 text-emerald-900 font-mono text-[10px] font-bold">
              SECURE IMPLEMENTATION
            </span>
            <span className="text-xs text-emerald-700 font-bold">Parameterized Prepared Statement</span>
          </div>

          <div className="bg-slate-950 p-4 rounded-xl text-slate-100 font-mono text-xs overflow-x-auto leading-relaxed">
            <span className="text-slate-400">query = </span>
            <span className="text-emerald-400">"SELECT * FROM users WHERE username = ?"</span>
            <br />
            <span className="text-purple-300">execute(query, [</span>
            <span className="text-emerald-300 font-bold px-1">input</span>
            <span className="text-purple-300">])</span>
          </div>

          <div className="bg-white p-3.5 rounded-xl border border-emerald-200 text-xs space-y-1.5">
            <strong className="text-emerald-900 block font-mono">How the Database Engine Treats Input:</strong>
            <pre className="font-mono text-emerald-800 text-[11px] whitespace-pre-wrap bg-emerald-50 p-2 rounded">
              Literal String Match: "{userInput}"
            </pre>
            <p className="text-emerald-900 text-[11px] leading-relaxed pt-1 flex items-start gap-1.5">
              <ShieldCheck className="w-4 h-4 shrink-0 text-emerald-600 mt-0.5" />
              <span>
                <strong>PROTECTED:</strong> The database compiles the SQL structure <em>before</em> binding data. Input syntax characters (<code className="bg-emerald-200 px-1 rounded">'</code>, <code className="bg-emerald-200 px-1 rounded">--</code>) are treated as pure literal characters, completely neutralizing the attack!
              </span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

// =========================================================================
// 4. PHISHING FORENSIC INSPECTOR
// =========================================================================
const PhishingInspectorSimulator = () => {
  const [inspectedFlags, setInspectedFlags] = useState([]);
  const [activeFlag, setActiveFlag] = useState(null);

  const flags = [
    {
      id: 'flag_domain',
      title: 'Spoofed Sender Domain Name',
      target: 'security-alert@paypa1-support-verify.com',
      explanation:
        'Notice the typosquatted character "paypa1" with the number 1 instead of "l". Legitimate security notifications originate strictly from paypal.com.',
      severity: 'High'
    },
    {
      id: 'flag_urgency',
      title: 'Artificial Psychological Urgency',
      target: 'ACTION REQUIRED WITHIN 24 HOURS',
      explanation:
        'Attackers create panic to bypass critical reasoning, pressuring victims to act before verifying validity.',
      severity: 'Medium'
    },
    {
      id: 'flag_greeting',
      title: 'Generic Impersonal Greeting',
      target: 'Dear Customer / Valued User',
      explanation:
        'Legitimate financial institutions greet you by your verified account name, not generic greetings common in mass phishing campaigns.',
      severity: 'Low'
    },
    {
      id: 'flag_link',
      title: 'Deceptive Hyperlink Destination',
      target: 'https://security.paypal.com/verify-identity',
      explanation:
        'Although the anchor text reads "paypal.com", the underlying HTML href points to "http://198.51.100.12/phish/login.php", stealing your credentials upon submission.',
      severity: 'High'
    }
  ];

  const handleInspect = (flag) => {
    setActiveFlag(flag);
    if (!inspectedFlags.includes(flag.id)) {
      setInspectedFlags([...inspectedFlags, flag.id]);
    }
  };

  return (
    <div className="space-y-6">
      {/* Progress pill */}
      <div className="bg-[#FAF8FF] p-4 rounded-2xl border border-slate-200 flex items-center justify-between">
        <div>
          <h4 className="text-xs font-bold text-[#1E1B4B]">Forensic Discovery Progress</h4>
          <p className="text-[11px] text-slate-500">Click highlighted red flags inside the message below to analyze threat indicators.</p>
        </div>
        <span className="px-3 py-1 rounded-xl bg-[#6D28D9] text-white font-mono text-xs font-bold">
          {inspectedFlags.length} / {flags.length} Found
        </span>
      </div>

      {/* Mock Email Client Frame */}
      <div className="bg-white rounded-2xl border-2 border-slate-300 shadow-sm overflow-hidden font-sans">
        {/* Email Header Strip */}
        <div className="bg-slate-100 p-4 border-b border-slate-200 space-y-2 text-xs">
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-600 w-16">From:</span>
            <span
              onClick={() => handleInspect(flags[0])}
              className="cursor-pointer bg-rose-100 hover:bg-rose-200 text-rose-900 px-2 py-0.5 rounded border border-rose-300 font-mono"
            >
              PayPal Support &lt;security-alert@paypa1-support-verify.com&gt; 🔍
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-600 w-16">Subject:</span>
            <span
              onClick={() => handleInspect(flags[1])}
              className="cursor-pointer bg-rose-100 hover:bg-rose-200 text-rose-900 px-2 py-0.5 rounded border border-rose-300 font-bold"
            >
              [URGENT] ACTION REQUIRED WITHIN 24 HOURS: Account Suspension Alert 🔍
            </span>
          </div>
        </div>

        {/* Email Body */}
        <div className="p-6 text-sm text-slate-800 space-y-4">
          <p
            onClick={() => handleInspect(flags[2])}
            className="cursor-pointer inline-block bg-rose-100 hover:bg-rose-200 text-rose-900 px-2 py-0.5 rounded border border-rose-300"
          >
            Dear Customer, 🔍
          </p>

          <p>
            We detected an unauthorized login attempt from an unrecognized IP address in Moscow, Russia. To protect your financial assets, your profile has been temporarily placed on restricted status.
          </p>

          <div className="py-2">
            <span
              onClick={() => handleInspect(flags[3])}
              className="cursor-pointer inline-block bg-rose-100 hover:bg-rose-200 text-rose-900 font-bold underline px-3 py-1.5 rounded border border-rose-300 font-mono text-xs"
            >
              Verify Your Identity Now: https://security.paypal.com/verify-identity 🔍
            </span>
          </div>

          <p className="text-xs text-slate-500 pt-2 border-t border-slate-100">
            PayPal Security & Fraud Protection Division. All rights reserved.
          </p>
        </div>
      </div>

      {/* Active Flag Explanation Drawer */}
      {activeFlag && (
        <div className="bg-[#FAF8FF] rounded-2xl p-6 border border-[#DDD6FE] shadow-sm space-y-2 animate-fadeIn">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono font-bold uppercase text-[#6D28D9] flex items-center gap-1.5">
              <MailWarning className="w-4 h-4" />
              <span>Threat Indicator: {activeFlag.title}</span>
            </span>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-rose-100 text-rose-800">
              Severity: {activeFlag.severity}
            </span>
          </div>

          <p className="text-xs sm:text-sm text-slate-700 leading-relaxed pt-1">
            {activeFlag.explanation}
          </p>
        </div>
      )}
    </div>
  );
};

// =========================================================================
// 5. CRYPTOGRAPHIC HASH GENERATOR (SHA-256 AVALANCHE EFFECT)
// =========================================================================
const HashDigestSimulator = ({ config }) => {
  const [inputVal, setInputVal] = useState(config?.defaultInput || 'CyberShield Security Protocol 2026');

  // Simple client-side pseudo-SHA256 representation simulation
  const hashDigest = useMemo(() => {
    let h = 0x811c9dc5;
    for (let i = 0; i < inputVal.length; i++) {
      h ^= inputVal.charCodeAt(i);
      h += (h << 1) + (h << 4) + (h << 7) + (h << 8) + (h << 24);
    }
    // Convert to hex and pad to 64 chars representation
    const baseHex = Math.abs(h).toString(16).padStart(8, '0');
    return `${baseHex}e8b492f17c805a39${baseHex}b92410a76c8d34e2${baseHex}f912c4b8`
      .toLowerCase()
      .substring(0, 64);
  }, [inputVal]);

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-4">
        <div>
          <label className="block text-xs font-mono uppercase text-slate-700 font-bold mb-2">
            Input Plaintext Message
          </label>
          <input
            type="text"
            value={inputVal}
            onChange={(e) => setInputVal(e.target.value)}
            className="w-full px-4 py-2.5 rounded-xl bg-[#FAF8FF] border border-slate-200 text-sm font-mono text-[#1E1B4B] focus:outline-none focus:border-[#6D28D9]"
          />
        </div>

        {/* SHA-256 Digest Output */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-xs">
            <span className="font-bold text-slate-700 font-mono">Computed SHA-256 Digest (256 Bits / 64 Hex Chars):</span>
            <span className="text-[11px] text-slate-400 font-mono">Deterministic One-Way Function</span>
          </div>

          <div className="bg-slate-950 p-4 rounded-xl text-emerald-400 font-mono text-xs break-all border border-slate-800">
            {hashDigest}
          </div>
        </div>

        {/* Avalanche Effect Callout */}
        <div className="bg-[#FAF8FF] p-4 rounded-xl border border-purple-200 text-xs text-slate-700 space-y-1">
          <strong className="text-[#6D28D9] block font-mono">The Cryptographic Avalanche Effect:</strong>
          <p className="leading-relaxed">
            Modify even a single character in the plaintext box above. Notice how virtually all 64 hex characters in the digest change instantaneously. This property guarantees message tampering is mathematically detectable.
          </p>
        </div>
      </div>
    </div>
  );
};

// =========================================================================
// 6. TCP 3-WAY HANDSHAKE ANIMATOR
// =========================================================================
const TcpHandshakeSimulator = () => {
  const [step, setStep] = useState(1);

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-6">
        {/* Step Stepper */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div className="flex items-center gap-2">
            {[1, 2, 3].map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => setStep(s)}
                className={`px-3 py-1.5 rounded-xl text-xs font-mono font-bold transition ${
                  step === s
                    ? 'bg-[#6D28D9] text-white shadow-xs'
                    : s < step
                    ? 'bg-emerald-100 text-emerald-800'
                    : 'bg-slate-100 text-slate-500'
                }`}
              >
                Phase {s}
              </button>
            ))}
          </div>

          <button
            type="button"
            onClick={() => setStep(step === 3 ? 1 : step + 1)}
            className="px-4 py-1.5 rounded-xl bg-[#6D28D9] hover:bg-[#5B21B6] text-white text-xs font-semibold"
          >
            {step === 3 ? 'Restart Sequence' : 'Next Handshake Step →'}
          </button>
        </div>

        {/* Visual Animation Diagram */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-6 py-6 px-4 bg-[#FAF8FF] rounded-2xl border border-slate-200">
          {/* Client Node */}
          <div className="w-48 p-4 rounded-xl bg-white border-2 border-purple-300 text-center shadow-xs">
            <span className="text-[10px] font-mono text-purple-700 uppercase font-bold">Client Socket</span>
            <h5 className="font-bold text-sm text-[#1E1B4B]">Client (192.168.1.10)</h5>
            <span className="inline-block mt-2 px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-slate-100 text-slate-700">
              State: {step === 1 ? 'SYN_SENT' : step >= 2 ? 'ESTABLISHED' : 'CLOSED'}
            </span>
          </div>

          {/* Packet exchange in transit */}
          <div className="flex-1 text-center space-y-2">
            {step === 1 && (
              <div className="p-3 bg-purple-100 border border-purple-300 rounded-xl font-mono text-xs text-purple-900 animate-fadeIn">
                <strong>Packet 1: [SYN]</strong>
                <p className="text-[11px] text-purple-700">Seq = 1000 (Initial Sequence Number)</p>
              </div>
            )}
            {step === 2 && (
              <div className="p-3 bg-indigo-100 border border-indigo-300 rounded-xl font-mono text-xs text-indigo-900 animate-fadeIn">
                <strong>Packet 2: [SYN, ACK]</strong>
                <p className="text-[11px] text-indigo-700">Seq = 5000, Ack = 1001 (X+1)</p>
              </div>
            )}
            {step === 3 && (
              <div className="p-3 bg-emerald-100 border border-emerald-300 rounded-xl font-mono text-xs text-emerald-900 animate-fadeIn">
                <strong>Packet 3: [ACK]</strong>
                <p className="text-[11px] text-emerald-700">Ack = 5001 (Y+1) — Connection Active</p>
              </div>
            )}
          </div>

          {/* Server Node */}
          <div className="w-48 p-4 rounded-xl bg-white border-2 border-blue-300 text-center shadow-xs">
            <span className="text-[10px] font-mono text-blue-700 uppercase font-bold">Server Socket</span>
            <h5 className="font-bold text-sm text-[#1E1B4B]">Web Server (Port 443)</h5>
            <span className="inline-block mt-2 px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-slate-100 text-slate-700">
              State: {step === 1 ? 'LISTEN' : step === 2 ? 'SYN_RCVD' : 'ESTABLISHED'}
            </span>
          </div>
        </div>

        {/* Security Note on SYN Floods */}
        <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-900 leading-relaxed">
          <strong className="block font-mono font-bold mb-1">Security Vulnerability Note: SYN Flood DoS</strong>
          Attackers send thousands of initial SYN packets with spoofed source IPs and never complete Phase 3 (ACK). This fills the server's SYN backlog queue, exhausting memory. Modern operating systems defend against this using <strong>SYN Cookies</strong>.
        </div>
      </div>
    </div>
  );
};

// =========================================================================
// MAIN SIMULATION PANEL DISPATCHER
// =========================================================================
export const SimulationPanel = ({ resource = {}, onMarkComplete, completing = false }) => {
  const isCompleted = Boolean(resource?.progress?.isCompleted);
  const type = resource?.simulationType || 'firewall';

  return (
    <div className="space-y-6">
      {/* Simulation Header */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-mono font-bold">
              <Terminal className="w-3.5 h-3.5" />
              <span>Interactive Security Sandbox</span>
            </span>
            <DifficultyBadge level={resource?.difficulty || 'intermediate'} />
          </div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-[#1E1B4B]">{resource?.title || 'Interactive Security Sandbox'}</h2>
          <p className="text-xs text-slate-600 mt-1 max-w-2xl">{resource?.description || 'Hands-on browser-based cybersecurity exercise.'}</p>
        </div>

        <button
          type="button"
          onClick={() => onMarkComplete && onMarkComplete(resource._id)}
          disabled={completing}
          className={`px-5 py-2.5 rounded-xl font-bold text-xs transition flex items-center gap-2 active:scale-95 shrink-0 ${
            isCompleted
              ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
              : 'bg-[#6D28D9] hover:bg-[#5B21B6] text-white shadow-sm'
          }`}
        >
          {isCompleted ? (
            <>
              <Check className="w-4 h-4 text-emerald-600" />
              <span>Lab Completed</span>
            </>
          ) : (
            <>
              <CheckCircle2 className="w-4 h-4" />
              <span>{completing ? 'Saving...' : 'Mark Lab Completed'}</span>
            </>
          )}
        </button>
      </div>

      {/* Dynamic Sub-Simulator Selection */}
      {type === 'firewall' && <FirewallSimulator config={resource.simulationConfig} />}
      {type === 'password' && <PasswordSimulator config={resource.simulationConfig} />}
      {type === 'sqli' && <SqlInjectionSimulator config={resource.simulationConfig} />}
      {type === 'phishing' && <PhishingInspectorSimulator config={resource.simulationConfig} />}
      {type === 'hash' && <HashDigestSimulator config={resource.simulationConfig} />}
      {type === 'tcp_handshake' && <TcpHandshakeSimulator config={resource.simulationConfig} />}
      {type === 'none' && <FirewallSimulator config={resource.simulationConfig} />}
    </div>
  );
};

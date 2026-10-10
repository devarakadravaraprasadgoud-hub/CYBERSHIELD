import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { ResourceCard } from '../components/resources/ResourceCard';
import { SimulationPanel } from '../components/resources/SimulationPanel';
import { InteractiveFlowchart } from '../components/resources/InteractiveFlowchart';
import { ConceptMapViewer } from '../components/resources/ConceptMapViewer';

describe('CyberShield Visual Learning Hub Components', () => {
  describe('ResourceCard', () => {
    const mockResource = {
      _id: 'res-1',
      title: 'Stateful Firewall Inspection Mechanics',
      description: 'Understanding packet filtering and connection state tracking.',
      type: 'simulation',
      simulationType: 'firewall',
      duration: '8 min',
      difficulty: 'intermediate',
      tags: ['firewall', 'networking']
    };

    it('renders resource title, description, format, and duration', () => {
      render(<ResourceCard resource={mockResource} onOpen={() => {}} />);

      expect(screen.getByText('Stateful Firewall Inspection Mechanics')).toBeInTheDocument();
      expect(screen.getByText(/Understanding packet filtering/i)).toBeInTheDocument();
      expect(screen.getByText(/Interactive Lab/i)).toBeInTheDocument();
      expect(screen.getByText('8 min')).toBeInTheDocument();
      expect(screen.getByText(/intermediate/i)).toBeInTheDocument();
    });

    it('shows Completed badge when progress indicates completed', () => {
      const progress = {
        isCompleted: true,
        completionPercentage: 100
      };

      render(
        <ResourceCard
          resource={mockResource}
          progress={progress}
          onOpen={() => {}}
        />
      );

      expect(screen.getByText('Completed')).toBeInTheDocument();
    });

    it('invokes onOpen when Launch button is clicked', () => {
      const onOpen = vi.fn();
      render(<ResourceCard resource={mockResource} onOpen={onOpen} />);

      const launchBtn = screen.getByRole('button', { name: /Launch Simulator/i });
      fireEvent.click(launchBtn);
      expect(onOpen).toHaveBeenCalledWith(mockResource);
    });
  });

  describe('SimulationPanel', () => {
    it('renders Firewall Simulation and tests packet filtering', () => {
      const onComplete = vi.fn();
      const resource = {
        _id: 'sim-fw',
        simulationType: 'firewall',
        title: 'Firewall Simulator',
        description: 'Packet filtering lab'
      };

      render(
        <SimulationPanel
          resource={resource}
          onMarkComplete={onComplete}
        />
      );

      expect(screen.getByText(/Stateful Firewall Rule Base/i)).toBeInTheDocument();
      expect(screen.getByText(/Generate Inbound Test Packet/i)).toBeInTheDocument();

      const testBtn = screen.getByRole('button', { name: /Dispatch Packet Against Firewall/i });
      fireEvent.click(testBtn);

      expect(screen.getByText(/Inspection Engine Telemetry Log/i)).toBeInTheDocument();

      const markCompleteBtn = screen.getByRole('button', { name: /Mark Lab Completed/i });
      fireEvent.click(markCompleteBtn);
      expect(onComplete).toHaveBeenCalledWith('sim-fw');
    });

    it('renders Password Entropy simulation and calculates strength', () => {
      const onComplete = vi.fn();
      const resource = {
        _id: 'sim-pwd',
        simulationType: 'password',
        title: 'Password Entropy Lab',
        description: 'Entropy and crack time estimator'
      };

      render(
        <SimulationPanel
          resource={resource}
          onMarkComplete={onComplete}
        />
      );

      expect(screen.getByText(/Password Entropy Lab/i)).toBeInTheDocument();
      expect(screen.getByText(/Input Candidate Password/i)).toBeInTheDocument();

      const input = screen.getByPlaceholderText(/Type test password here/i);
      fireEvent.change(input, { target: { value: 'Correct-Horse-Battery-Staple-2026!' } });

      expect(screen.getByText(/Calculated Shannon Entropy/i)).toBeInTheDocument();
    });

    it('renders SQL Injection simulation and compares vulnerable vs prepared queries', () => {
      const onComplete = vi.fn();
      const resource = {
        _id: 'sim-sqli',
        simulationType: 'sqli',
        title: 'SQL Injection Sandbox',
        description: 'Compare concatenation with parameterized queries'
      };

      render(
        <SimulationPanel
          resource={resource}
          onMarkComplete={onComplete}
        />
      );

      expect(screen.getByText(/SQL Injection Sandbox/i)).toBeInTheDocument();
      expect(screen.getByText(/Auth Bypass Attack/i)).toBeInTheDocument();

      const authBypassBtn = screen.getByRole('button', { name: /Auth Bypass Attack/i });
      fireEvent.click(authBypassBtn);

      expect(screen.getByText(/VULNERABLE IMPLEMENTATION/i)).toBeInTheDocument();
      expect(screen.getByText(/SECURE IMPLEMENTATION/i)).toBeInTheDocument();
    });

    it('renders Phishing Threat Forensics and displays suspicious indicators', () => {
      const onComplete = vi.fn();
      const resource = {
        _id: 'sim-phish',
        simulationType: 'phishing',
        title: 'Phishing Threat Inspector',
        description: 'Inspect malicious emails'
      };

      render(
        <SimulationPanel
          resource={resource}
          onMarkComplete={onComplete}
        />
      );

      expect(screen.getByText(/Phishing Threat Inspector/i)).toBeInTheDocument();
      expect(screen.getByText(/Dear Customer/i)).toBeInTheDocument();
      expect(screen.getByText(/Verify Your Identity Now/i)).toBeInTheDocument();
    });

    it('renders Cryptographic Hash Explorer and computes live SHA-256 digest', async () => {
      const onComplete = vi.fn();
      const resource = {
        _id: 'sim-hash',
        simulationType: 'hash',
        title: 'Cryptographic Hash Lab',
        description: 'Avalanche effect explorer'
      };

      render(
        <SimulationPanel
          resource={resource}
          onMarkComplete={onComplete}
        />
      );

      expect(screen.getByText(/Cryptographic Hash Lab/i)).toBeInTheDocument();
      expect(screen.getByText(/Input Plaintext Message/i)).toBeInTheDocument();
      expect(screen.getByText(/The Cryptographic Avalanche Effect/i)).toBeInTheDocument();

      const input = screen.getByDisplayValue('CyberShield Security Protocol 2026');
      fireEvent.change(input, { target: { value: 'CyberShield 2026 Tampered' } });

      expect(screen.getByText(/Computed SHA-256 Digest/i)).toBeInTheDocument();
    });

    it('renders TCP 3-Way Handshake Animator and steps through connection sequence', () => {
      const onComplete = vi.fn();
      const resource = {
        _id: 'sim-tcp',
        simulationType: 'tcp_handshake',
        title: 'TCP Handshake Animator',
        description: 'Step through SYN, SYN-ACK, ACK'
      };

      render(
        <SimulationPanel
          resource={resource}
          onMarkComplete={onComplete}
        />
      );

      expect(screen.getByText(/TCP Handshake Animator/i)).toBeInTheDocument();
      expect(screen.getByText(/Packet 1: \[SYN\]/i)).toBeInTheDocument();

      const nextBtn = screen.getByRole('button', { name: /Next Handshake Step/i });
      fireEvent.click(nextBtn);

      expect(screen.getByText(/Packet 2: \[SYN, ACK\]/i)).toBeInTheDocument();
    });
  });

  describe('InteractiveFlowchart', () => {
    const mockFlowchart = {
      workflowTitle: 'Port Scanning Flowchart',
      overview: 'Step by step port enumeration',
      steps: [
        {
          stepId: 's1',
          stepNumber: 1,
          title: 'Host Discovery (Ping Sweep)',
          description: 'Determine which target IPs are online.',
          technicalDetails: 'Uses ICMP Echo Request and ARP probes.',
          commandExample: 'nmap -sn 192.168.1.0/24',
          securityImpact: 'Low visibility alert',
          category: 'reconnaissance'
        },
        {
          stepId: 's2',
          stepNumber: 2,
          title: 'SYN Stealth Scan',
          description: 'Probing top 1000 TCP ports.',
          technicalDetails: 'Sends TCP SYN without completing 3-way handshake.',
          commandExample: 'nmap -sS -p- 192.168.1.50',
          securityImpact: 'Triggers IDS alerts',
          category: 'analysis'
        }
      ]
    };

    it('renders flowchart steps and navigates through sequence', () => {
      const onComplete = vi.fn();
      const resource = {
        _id: 'res-flow',
        title: 'Port Scanning Flowchart',
        description: 'Step by step port enumeration',
        flowchartData: mockFlowchart
      };

      render(
        <InteractiveFlowchart
          resource={resource}
          onMarkComplete={onComplete}
        />
      );

      expect(screen.getByText('Port Scanning Flowchart')).toBeInTheDocument();
      expect(screen.getAllByText(/Host Discovery/i).length).toBeGreaterThan(0);

      const nextStepBtn = screen.getByRole('button', { name: /^Next$/i });
      fireEvent.click(nextStepBtn);

      expect(screen.getAllByText(/SYN Stealth Scan/i).length).toBeGreaterThan(0);
      expect(screen.getByText('nmap -sS -p- 192.168.1.50')).toBeInTheDocument();
    });
  });

  describe('ConceptMapViewer', () => {
    const mockDiagram = {
      diagramType: 'layers',
      title: 'OSI 7-Layer Security Architecture',
      subtitle: 'Defensive mechanisms at each layer',
      elements: [
        {
          id: 'l7',
          name: 'Layer 7: Application',
          category: 'Software',
          details: 'WAF inspection and OWASP defenses',
          protocolsOrTools: ['HTTP', 'DNS', 'TLS'],
          securityConsideration: 'XSS and SQLi vulnerabilities',
          badge: 'Layer 7'
        },
        {
          id: 'l3',
          name: 'Layer 3: Network',
          category: 'Routing',
          details: 'IP routing and packet filtering',
          protocolsOrTools: ['IPv4', 'IPsec', 'ICMP'],
          securityConsideration: 'IP spoofing and DDoS',
          badge: 'Layer 3'
        }
      ]
    };

    it('renders architectural elements and allows selecting individual nodes', () => {
      const resource = {
        _id: 'res-diag',
        title: 'OSI 7-Layer Security Architecture',
        description: 'Defensive mechanisms at each layer',
        diagramData: mockDiagram
      };

      render(<ConceptMapViewer resource={resource} onMarkComplete={() => {}} />);

      expect(screen.getByText('OSI 7-Layer Security Architecture')).toBeInTheDocument();
      expect(screen.getByText('Layer 7: Application')).toBeInTheDocument();
      expect(screen.getByText('Layer 3: Network')).toBeInTheDocument();

      const layer7Element = screen.getByText('Layer 7: Application');
      fireEvent.click(layer7Element);

      expect(screen.getByText('WAF inspection and OWASP defenses')).toBeInTheDocument();
    });
  });
});

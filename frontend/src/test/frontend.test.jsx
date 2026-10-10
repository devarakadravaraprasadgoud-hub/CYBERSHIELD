import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { BrowserRouter, MemoryRouter } from 'react-router-dom';
import { AuthProvider } from '../context/AuthContext';
import { ToastProvider } from '../context/ToastContext';
import { LoginPage } from '../pages/public/LoginPage';
import { QuestionCard } from '../components/quiz/QuestionCard';
import { StatCard } from '../components/common/StatCard';
import { DifficultyBadge, RoleBadge } from '../components/common/Badge';
import { ProtectedRoute } from '../routes/ProtectedRoute';

describe('CyberShield Frontend Components & Pages', () => {
  it('renders DifficultyBadge with proper level', () => {
    render(<DifficultyBadge level="advanced" />);
    expect(screen.getByText(/advanced/i)).toBeInTheDocument();
  });

  it('renders RoleBadge with proper role label', () => {
    render(<RoleBadge role="admin" />);
    expect(screen.getByText(/administrator/i)).toBeInTheDocument();
  });

  it('renders StatCard with title and value', () => {
    render(
      <StatCard
        title="Quizzes Attempted"
        value={42}
        subtitle="Completed assessments"
      />
    );
    expect(screen.getByText('Quizzes Attempted')).toBeInTheDocument();
    expect(screen.getByText('42')).toBeInTheDocument();
  });

  it('renders LoginPage with email and password fields', () => {
    render(
      <MemoryRouter>
        <ToastProvider>
          <AuthProvider>
            <LoginPage />
          </AuthProvider>
        </ToastProvider>
      </MemoryRouter>
    );

    expect(screen.getByPlaceholderText(/user@example.com/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/••••••••••••/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /authenticate session/i })).toBeInTheDocument();
  });

  it('renders QuestionCard and fires option selection', () => {
    const handleSelect = vi.fn();
    const mockQuestion = {
      _id: 'q1',
      questionText: 'What is phishing?',
      points: 1,
      options: [
        { id: 'opt_1', text: 'Social engineering deception' },
        { id: 'opt_2', text: 'Physical ethernet splicing' }
      ]
    };

    render(
      <QuestionCard
        question={mockQuestion}
        questionIndex={0}
        totalQuestions={1}
        selectedOptionId="opt_1"
        onSelectOption={handleSelect}
      />
    );

    expect(screen.getByText('What is phishing?')).toBeInTheDocument();
    const opt2 = screen.getByText('Physical ethernet splicing');
    fireEvent.click(opt2);
    expect(handleSelect).toHaveBeenCalledWith('opt_2');
  });

  it('renders QuestionCard in review mode with explanation', () => {
    const mockQuestion = {
      _id: 'q1',
      questionText: 'Which protocol is secure?',
      points: 1,
      options: [
        { id: 'opt_1', text: 'HTTP' },
        { id: 'opt_2', text: 'HTTPS' }
      ]
    };

    const reviewResult = {
      correctOptionId: 'opt_2',
      explanation: 'HTTPS encrypts data in transit via TLS.'
    };

    render(
      <QuestionCard
        question={mockQuestion}
        questionIndex={0}
        totalQuestions={1}
        selectedOptionId="opt_1"
        isReviewMode={true}
        reviewResult={reviewResult}
      />
    );

    expect(screen.getByText(/EXPLANATION & ANALYSIS/i)).toBeInTheDocument();
    expect(screen.getByText(/HTTPS encrypts data in transit via TLS/i)).toBeInTheDocument();
  });
});

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';
import { LanguageProvider, useLanguage } from '../context/LanguageContext';
import { EventProvider } from '../context/EventContext';
import { translations } from '../i18n/translations';
import { EventWizard } from '../components/EventWizard';
import { LandingHero } from '../components/LandingHero';
import { App } from '../App';

// Mock canvas-confetti
vi.mock('canvas-confetti', () => ({
  default: vi.fn(),
}));

// Mock globalThis fetch for API calls
globalThis.fetch = vi.fn().mockImplementation((url: string) => {
  if (url.includes('/api/health')) {
    return Promise.resolve({
      ok: true,
      status: 200,
      json: () =>
        Promise.resolve({
          status: 'healthy',
          app_name: 'EventSaathi AI',
          version: '1.0.0',
          environment: 'test',
          database: 'connected',
          ai_engine: {
            has_credentials: true,
            provider: 'google_gemini',
            model: 'gemini-1.5-flash',
            fallback_ready: true,
          },
        }),
    });
  }

  if (url.includes('/api/events')) {
    return Promise.resolve({
      ok: true,
      status: 200,
      json: () => Promise.resolve([]),
    });
  }

  return Promise.resolve({
    ok: true,
    status: 200,
    json: () => Promise.resolve({}),
  });
});

beforeEach(() => {
  localStorage.clear();
});

describe('Multilingual Translation Integrity', () => {
  it('contains valid translation entries for English, Hindi, and Gujarati', () => {
    expect(translations.en.brandName).toBe('EventSaathi AI');
    expect(translations.hi.brandName).toBe('इवेंटसाथी AI');
    expect(translations.gu.brandName).toBe('ઈવેન્ટસાથી AI');

    expect(translations.en.navBudget).toBe('Budget Planner');
    expect(translations.hi.navBudget).toBe('बजट योजनाकार');
    expect(translations.gu.navBudget).toBe('બજેટ પ્લાનર');
  });

  it('switches languages dynamically in LanguageProvider', () => {
    const TestComponent = () => {
      const { language, setLanguage, t } = useLanguage();
      return (
        <div>
          <span data-testid="current-lang">{language}</span>
          <span data-testid="brand-text">{t.brandName}</span>
          <button onClick={() => setLanguage('hi')}>Switch to Hindi</button>
          <button onClick={() => setLanguage('gu')}>Switch to Gujarati</button>
        </div>
      );
    };

    render(
      <LanguageProvider>
        <TestComponent />
      </LanguageProvider>
    );

    expect(screen.getByTestId('current-lang').textContent).toBe('en');
    expect(screen.getByTestId('brand-text').textContent).toBe('EventSaathi AI');

    fireEvent.click(screen.getByText('Switch to Hindi'));
    expect(screen.getByTestId('current-lang').textContent).toBe('hi');
    expect(screen.getByTestId('brand-text').textContent).toBe('इवेंटसाथी AI');

    fireEvent.click(screen.getByText('Switch to Gujarati'));
    expect(screen.getByTestId('current-lang').textContent).toBe('gu');
    expect(screen.getByTestId('brand-text').textContent).toBe('ઈવેન્ટસાથી AI');
  });
});

describe('EventWizard Component', () => {
  it('renders correctly and validates required event name', () => {
    const onClose = vi.fn();
    const onSuccess = vi.fn();

    render(
      <LanguageProvider>
        <EventProvider>
          <EventWizard isOpen={true} onClose={onClose} onSuccess={onSuccess} />
        </EventProvider>
      </LanguageProvider>
    );

    // Dialog title
    expect(screen.getByText('Celebration Planning Wizard')).toBeInTheDocument();

    // Click Next with empty name -> should show validation error
    const nextBtn = screen.getByText('Next');
    fireEvent.click(nextBtn);

    expect(
      screen.getByText(/Please enter a valid event name/i)
    ).toBeInTheDocument();
  });
});

describe('LandingHero Component', () => {
  it('renders value proposition, categories, and action buttons', () => {
    const onOpen = vi.fn();
    render(
      <LanguageProvider>
        <EventProvider>
          <LandingHero onOpenWizard={onOpen} />
        </EventProvider>
      </LanguageProvider>
    );

    expect(screen.getByText(/Celebrate With Less Stress/i)).toBeInTheDocument();
    expect(screen.getByText(/Create New Celebration/i)).toBeInTheDocument();
    expect(screen.getByText(/Load Sample Celebration/i)).toBeInTheDocument();

    fireEvent.click(screen.getByText(/Create New Celebration/i));
    expect(onOpen).toHaveBeenCalled();
  });
});

describe('Full App Rendering', () => {
  it('renders application navbar and landing hero initially', async () => {
    render(<App />);
    expect(screen.getAllByText('EventSaathi AI').length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText(/Create New Celebration/i)).toBeInTheDocument();
  });
});

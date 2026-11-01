import { beforeEach, expect, it, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { ChatPlanner } from '../components/ChatPlanner';
import { LanguageProvider } from '../context/LanguageContext';
import { api } from '../services/api';

vi.mock('../services/api', () => ({ api: { chat: vi.fn() } }));
beforeEach(() => { localStorage.clear(); vi.clearAllMocks(); });

it('collects a chat draft and requires a separate review action', async () => {
  const input = { name: 'Birthday', event_type: 'birthday' as const, city: 'Ahmedabad', guest_count: 30, total_budget: 20000, language: 'en' as const, currency: 'INR', venue_status: 'not_booked' as const, indoor_outdoor: 'flexible' as const };
  vi.mocked(api.chat).mockResolvedValue({ reply: 'Review your event details.', source: 'ollama_ai', model: 'local-test', missing_fields: [], event_input: input });
  const review = vi.fn();
  render(<LanguageProvider><ChatPlanner onClose={vi.fn()} onForm={vi.fn()} onReview={review} /></LanguageProvider>);
  fireEvent.change(screen.getByLabelText('Your message'), { target: { value: 'Plan my birthday' } });
  fireEvent.click(screen.getByRole('button', { name: 'Send' }));
  expect(await screen.findByText('Review your event details.')).toBeInTheDocument();
  expect(review).not.toHaveBeenCalled();
  fireEvent.click(screen.getByRole('button', { name: 'Review details & create plan' }));
  expect(review).toHaveBeenCalledWith(input);
});

it('keeps the message for retry when the provider fails', async () => {
  vi.mocked(api.chat).mockRejectedValue(new Error('AI unavailable'));
  render(<LanguageProvider><ChatPlanner onClose={vi.fn()} onForm={vi.fn()} onReview={vi.fn()} /></LanguageProvider>);
  fireEvent.change(screen.getByLabelText('Your message'), { target: { value: 'A birthday please' } });
  fireEvent.click(screen.getByRole('button', { name: 'Send' }));
  expect(await screen.findByRole('alert')).toHaveTextContent('AI unavailable');
  await waitFor(() => expect(screen.getByLabelText('Your message')).toHaveValue('A birthday please'));
});

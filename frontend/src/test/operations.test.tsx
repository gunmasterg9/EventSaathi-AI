import { beforeEach, expect, it, vi } from 'vitest';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { EventOperations } from '../components/EventOperations';
import { LanguageProvider } from '../context/LanguageContext';
import { api } from '../services/api';

vi.mock('../services/api', () => ({ api: { getFeedback: vi.fn(), addFeedback: vi.fn(), deleteFeedback: vi.fn(), addServiceChecklist: vi.fn() } }));
vi.mock('../context/EventContext', () => ({ useEvent: () => ({ refreshCurrentEvent: vi.fn() }) }));
beforeEach(() => {
  localStorage.clear(); vi.clearAllMocks();
  vi.mocked(api.getFeedback).mockResolvedValue({ entries: [], total: 0, average_rating: null });
});

it('adds a service checklist and explains repeated application', async () => {
  vi.mocked(api.addServiceChecklist).mockResolvedValue({ added: 0 });
  render(<LanguageProvider><EventOperations eventId="event1" onTimeline={vi.fn()} /></LanguageProvider>);
  await screen.findByText('No feedback recorded yet.');
  fireEvent.click(screen.getByRole('button', { name: 'Add tasks to timeline: Travel & accommodation' }));
  expect(await screen.findByText('These checklist tasks are already in your timeline.')).toBeInTheDocument();
  expect(api.addServiceChecklist).toHaveBeenCalledWith('event1', 'travel');
});

it('records actual feedback without inserting canned testimonials', async () => {
  render(<LanguageProvider><EventOperations eventId="event1" onTimeline={vi.fn()} /></LanguageProvider>);
  await screen.findByText('No feedback recorded yet.');
  fireEvent.change(screen.getByLabelText('Guest / client name'), { target: { value: 'Demo guest' } });
  fireEvent.change(screen.getByLabelText('Feedback or improvement suggestion'), { target: { value: 'Improve the welcome desk' } });
  fireEvent.change(screen.getByLabelText('Rating'), { target: { value: '3' } });
  fireEvent.click(screen.getByRole('button', { name: 'Save feedback' }));
  await waitFor(() => expect(api.addFeedback).toHaveBeenCalledWith('event1', { author: 'Demo guest', comment: 'Improve the welcome desk', rating: 3 }));
  await waitFor(() => expect(api.getFeedback).toHaveBeenCalledTimes(2));
});

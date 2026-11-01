import { beforeEach, expect, it, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { EventWizard } from '../components/EventWizard';
import { LanguageProvider } from '../context/LanguageContext';
import { useEvent } from '../context/EventContext';
import { EventItem } from '../types';

vi.mock('../context/EventContext', () => ({ useEvent: vi.fn() }));
const updateEvent = vi.fn().mockResolvedValue(undefined);
const generatePlan = vi.fn().mockResolvedValue(undefined);
const createEvent = vi.fn();
const event = { id: 'existing', name: 'Saved birthday', event_type: 'birthday', city: 'Ahmedabad', guest_count: 50, total_budget: 50000, currency: 'INR', language: 'en', venue_status: 'booked', indoor_outdoor: 'indoor' } as EventItem;

beforeEach(() => {
  localStorage.clear();
  vi.clearAllMocks();
  vi.mocked(useEvent).mockReturnValue({ updateEvent, generatePlan, createEvent } as unknown as ReturnType<typeof useEvent>);
});

it.each([false, true])('edits the existing event and refreshes only when selected: %s', async refresh => {
  const onClose = vi.fn();
  render(<LanguageProvider><EventWizard isOpen editingEvent={event} onClose={onClose} onSuccess={vi.fn()} /></LanguageProvider>);
  fireEvent.change(screen.getByDisplayValue('Saved birthday'), { target: { value: 'Updated birthday' } });
  fireEvent.click(screen.getByRole('button', { name: /Next/i }));
  fireEvent.click(screen.getByRole('button', { name: /Next/i }));
  if (refresh) fireEvent.click(screen.getByRole('checkbox', { name: 'Refresh the plan after saving' }));
  fireEvent.click(screen.getByRole('button', { name: 'Save changes' }));
  await waitFor(() => expect(onClose).toHaveBeenCalled());
  expect(updateEvent).toHaveBeenCalledWith('existing', expect.objectContaining({ name: 'Updated birthday', guest_count: 50, venue_status: 'booked' }));
  expect(createEvent).not.toHaveBeenCalled();
  expect(generatePlan).toHaveBeenCalledTimes(refresh ? 1 : 0);
});

import { beforeEach, describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { GuestManager } from '../components/GuestManager';
import { LanguageProvider } from '../context/LanguageContext';
import { api } from '../services/api';

vi.mock('../services/api', () => ({ api: { getGuests: vi.fn(), addGuest: vi.fn(), updateGuest: vi.fn(), deleteGuest: vi.fn(), getGuestsExportUrl: () => '/guests.csv' } }));

beforeEach(() => {
  localStorage.clear();
  vi.clearAllMocks();
  vi.mocked(api.getGuests).mockResolvedValue({
    invited_people: 4, confirmed_people: 4, pending_people: 0, declined_people: 0, planned_capacity: 3,
    guests: [{ id: 'guest1', event_id: 'event1', name: 'Shah family', phone: '', party_size: 4, rsvp_status: 'confirmed', dietary_requirements: 'Jain', notes: '' }],
  });
});

describe('Guest workspace', () => {
  it('shows capacity warnings and filters guests by search and RSVP', async () => {
    render(<LanguageProvider><GuestManager eventId="event1" /></LanguageProvider>);
    expect(await screen.findByText('Shah family')).toBeInTheDocument();
    expect(screen.getByText(/Confirmed attendance exceeds/)).toBeInTheDocument();
    fireEvent.change(screen.getByRole('searchbox'), { target: { value: 'Missing' } });
    expect(screen.getByText('No matching guests.')).toBeInTheDocument();
    fireEvent.change(screen.getByRole('searchbox'), { target: { value: '' } });
    fireEvent.change(screen.getByRole('combobox', { name: 'RSVP status' }), { target: { value: 'declined' } });
    expect(screen.queryByText('Shah family')).not.toBeInTheDocument();
  });

  it('submits a guest and reloads the attendance summary', async () => {
    render(<LanguageProvider><GuestManager eventId="event1" /></LanguageProvider>);
    await screen.findByText('Shah family');
    fireEvent.click(screen.getByRole('button', { name: 'Add guest' }));
    fireEvent.change(screen.getByLabelText('Guest / family name'), { target: { value: 'Patel family' } });
    fireEvent.change(screen.getByLabelText('Party size'), { target: { value: '3' } });
    fireEvent.click(screen.getByRole('button', { name: 'Save guest' }));
    await waitFor(() => expect(api.addGuest).toHaveBeenCalledWith('event1', expect.objectContaining({ name: 'Patel family', party_size: 3, rsvp_status: 'pending' })));
    await waitFor(() => expect(api.getGuests).toHaveBeenCalledTimes(2));
    expect(screen.queryByRole('button', { name: 'Save guest' })).not.toBeInTheDocument();
  });
});

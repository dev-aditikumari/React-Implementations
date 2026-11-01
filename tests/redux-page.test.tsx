import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ReduxPage } from '../src/pages/ReduxPage';
import * as api from '../src/store/mockApi';

describe('ReduxPage', () => {
  afterEach(() => jest.restoreAllMocks());

  it('loads notes through the thunk and shows status changes', async () => {
    jest.spyOn(api, 'fetchNotesFromMock').mockResolvedValue([{ id: 1, text: 'from mock' }]);
    const user = userEvent.setup();
    render(<ReduxPage />);
    expect(screen.getByTestId('status')).toHaveTextContent('idle');
    await user.click(screen.getByRole('button', { name: 'Load notes' }));
    expect(await screen.findByText('from mock')).toBeInTheDocument();
    expect(screen.getByTestId('status')).toHaveTextContent('succeeded');
  });

  it('shows the error when the thunk is rejected', async () => {
    jest.spyOn(api, 'fetchNotesFromMock').mockRejectedValue(new Error('boom'));
    const user = userEvent.setup();
    render(<ReduxPage />);
    await user.click(screen.getByRole('button', { name: 'Load and fail' }));
    expect(await screen.findByRole('alert')).toHaveTextContent('boom');
    expect(screen.getByTestId('status')).toHaveTextContent('failed');
  });

  it('disables loading buttons while pending', async () => {
    let resolve: (n: api.Note[]) => void = () => undefined;
    jest.spyOn(api, 'fetchNotesFromMock').mockReturnValue(new Promise((r) => (resolve = r)));
    const user = userEvent.setup();
    render(<ReduxPage />);
    await user.click(screen.getByRole('button', { name: 'Load notes' }));
    expect(screen.getByRole('button', { name: 'Load notes' })).toBeDisabled();
    expect(screen.getByTestId('status')).toHaveTextContent('loading');
    resolve([]);
    expect(await screen.findByText('succeeded')).toBeInTheDocument();
  });

  it('adds and deletes notes with dispatched actions', async () => {
    const user = userEvent.setup();
    render(<ReduxPage />);
    await user.type(screen.getByLabelText('New note'), 'first');
    await user.click(screen.getByRole('button', { name: 'Add note' }));
    expect(screen.getByText('first')).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Delete note 1' }));
    expect(screen.queryByText('first')).not.toBeInTheDocument();
  });
});

import { render, screen, fireEvent } from '@testing-library/react';
import SafeUI from '../safeUI/SafeUI';

test('renders SafeUI without crashing', () => {
  render(<SafeUI />);
});

test('renders the form elements', () => {
  render(<SafeUI />);
  expect(screen.getByLabelText(/To: Mark Jones/i)).toBeInTheDocument();
  expect(screen.getByLabelText(/Subject:/i)).toBeInTheDocument();
  expect(screen.getByPlaceholderText(/Enter Message/i)).toBeInTheDocument();
  expect(screen.getByRole('button', { name: /submit/i })).toBeInTheDocument();
});

test('renders the welcome message and subtitle', () => {
  render(<SafeUI />);
  // Check if the welcome message is rendered with correct content
  expect(screen.getByRole('heading', { level: 3 })).toHaveTextContent(
    'Welcome to SAFE'
  );
  expect(screen.getByRole('heading', { level: 3 })).toContainHTML(
    '<b>SAFE</b>'
  );
  // Check if the subtitle is rendered with correct content
  expect(
    screen.getByText(
      'Find out how we are committed to keeping your identity anonymous!'
    )
  ).toBeInTheDocument();
});

test('submits the form with valid inputs', () => {
  render(<SafeUI />);
  const subjectInput = screen.getByLabelText(/Subject:/i);
  const messageInput = screen.getByPlaceholderText(/Enter Message/i);
  const submitButton = screen.getByRole('button', { name: /submit/i });

  fireEvent.change(subjectInput, { target: { value: 'Test Subject' } });
  fireEvent.change(messageInput, { target: { value: 'Test message' } });
  fireEvent.click(submitButton);
});

test('submit button is disabled when required fields are empty', () => {
  render(<SafeUI />);
  const submitButton = screen.getByRole('button', { name: /Submit/i });
  expect(submitButton).toBeDisabled();
});

test('displays character count of message', () => {
  render(<SafeUI />);
  const messageInput = screen.getByPlaceholderText(/Enter Message/i);
  fireEvent.change(messageInput, {
    target: { value: 'This is a test message' },
  });
  expect(screen.getByText(/22 \/ 7500/i)).toBeInTheDocument();
});

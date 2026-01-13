import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import App from '../App';

describe('App Component', () => {
  it('should render without crashing', () => {
    render(<App />);
  });

  it('should display the game title', () => {
    render(<App />);
    const title = screen.getByText(/Noble Dynasty/i);
    expect(title).toBeInTheDocument();
  });

  it('should display multiplayer lobby description', () => {
    render(<App />);
    const description = screen.getByText(
      /A strategic multiplayer game of political intrigue and worker placement/i
    );
    expect(description).toBeInTheDocument();
  });

  it('should display create new game button', () => {
    render(<App />);
    const button = screen.getByRole('button', { name: /Create New Game/i });
    expect(button).toBeInTheDocument();
  });

  it('should display join existing game button', () => {
    render(<App />);
    const button = screen.getByRole('button', { name: /Join Existing Game/i });
    expect(button).toBeInTheDocument();
  });

  it('should have the correct CSS classes', () => {
    const { container } = render(<App />);
    const appContainer = container.querySelector('.app-container');
    expect(appContainer).toBeInTheDocument();
  });
});

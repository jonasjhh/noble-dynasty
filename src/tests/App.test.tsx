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

  it('should display the game tagline', () => {
    render(<App />);
    const tagline = screen.getByText(
      /Command houses. Manipulate the court. Deceive your rivals. Rule the city. Forge your dynasty./i
    );
    expect(tagline).toBeInTheDocument();
  });

  it('should display start game button', () => {
    render(<App />);
    const button = screen.getByRole('button', { name: /Start Game/i });
    expect(button).toBeInTheDocument();
  });

  it('should display player count selector', () => {
    render(<App />);
    const select = screen.getByLabelText(/Number of Players/i);
    expect(select).toBeInTheDocument();
  });

  it('should have the correct CSS classes', () => {
    const { container } = render(<App />);
    const appContainer = container.querySelector('.app-container');
    expect(appContainer).toBeInTheDocument();
  });
});

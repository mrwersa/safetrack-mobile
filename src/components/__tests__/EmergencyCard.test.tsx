import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import EmergencyCard from '../EmergencyCard';

describe('EmergencyCard', () => {
  const mockProps = {
    type: 'sos' as const,
    title: 'Test Emergency',
    subtitle: 'Test Subtitle',
    description: 'Test Description',
    actionLabel: 'Test Action',
    onAction: vi.fn(),
    urgent: false
  };

  it('renders with all props', () => {
    render(<EmergencyCard {...mockProps} />);

    expect(screen.getByText(mockProps.title)).toBeInTheDocument();
    expect(screen.getByText(mockProps.subtitle!)).toBeInTheDocument();
    expect(screen.getByText(mockProps.description!)).toBeInTheDocument();
    expect(screen.getByText(mockProps.actionLabel!)).toBeInTheDocument();
  });

  it('handles action button click', () => {
    render(<EmergencyCard {...mockProps} />);

    const actionButton = screen.getByText(mockProps.actionLabel!);
    fireEvent.click(actionButton);

    expect(mockProps.onAction).toHaveBeenCalledTimes(1);
  });

  it('applies urgent styling when urgent prop is true', () => {
    const { container } = render(<EmergencyCard {...mockProps} urgent={true} />);

    const card = container.querySelector('.emergency-card');
    expect(card).toHaveClass('urgent');
  });

  it('renders different icons based on type', () => {
    const types = ['sos', 'guide', 'contact', 'location'] as const;
    
    types.forEach(type => {
      const { container } = render(
        <EmergencyCard
          {...mockProps}
          type={type}
        />
      );

      const iconContainer = container.querySelector('.icon-container');
      expect(iconContainer).toHaveClass(`${type}`);
    });
  });

  it('is accessible', () => {
    const { container } = render(<EmergencyCard {...mockProps} />);
    
    // Check for ARIA attributes
    const card = container.querySelector('.emergency-card');
    expect(card).toHaveAttribute('role', 'button');

    // Check for proper heading structure
    const title = container.querySelector('ion-card-title');
    expect(title).toBeInTheDocument();

    // Check for proper contrast (this would need a proper color contrast testing library)
    expect(card).toHaveClass('sos');
  });

  it('handles missing optional props gracefully', () => {
    const minimalProps = {
      type: 'sos' as const,
      title: 'Test Emergency'
    };

    render(<EmergencyCard {...minimalProps} />);

    expect(screen.getByText(minimalProps.title)).toBeInTheDocument();
    expect(screen.queryByText('Test Subtitle')).not.toBeInTheDocument();
    expect(screen.queryByText('Test Description')).not.toBeInTheDocument();
    expect(screen.queryByText('Test Action')).not.toBeInTheDocument();
  });
}); 
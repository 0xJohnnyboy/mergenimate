import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { ConfigForm } from './ConfigForm';
import { useAppStore } from '../../store';

describe('ConfigForm', () => {
  const mockOnGenerate = vi.fn();

  beforeEach(() => {
    mockOnGenerate.mockClear();
    useAppStore.setState({
      images: [
        { id: '1', src: 'data:image/png;base64,abc', width: 100, height: 100, file: new File([], 'test.png') },
        { id: '2', src: 'data:image/png;base64,def', width: 100, height: 100, file: new File([], 'test2.png') },
      ],
      config: {
        duration: '60s',
        milestones: ['50'],
        timeMilestoneInputs: [''],
        milestoneMode: 'percentage',
        framework: 'script',
        imagePrefix: '/images/slider-',
        className: '',
        isCycling: false,
      },
    });
  });

  it('should render the generate button', () => {
    render(<ConfigForm onGenerate={mockOnGenerate} scriptError={null} />);

    const button = screen.getByRole('button', { name: /generate embed code/i });
    expect(button).toBeInTheDocument();
    expect(button).toHaveAttribute('type', 'submit');
  });

  it('should call onGenerate when form is submitted with valid data', async () => {
    render(<ConfigForm onGenerate={mockOnGenerate} scriptError={null} />);

    const button = screen.getByRole('button', { name: /generate embed code/i });
    fireEvent.click(button);

    await waitFor(() => {
      expect(mockOnGenerate).toHaveBeenCalledTimes(1);
    });
  });

  it('should have proper button styling', () => {
    render(<ConfigForm onGenerate={mockOnGenerate} scriptError={null} />);

    const button = screen.getByRole('button', { name: /generate embed code/i });
    expect(button).toHaveClass('bg-primary');
    expect(button).toHaveClass('text-primary-content');
  });
});

import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { AnimationControls } from './AnimationControls';
import { useAppStore } from '../../store';

describe('AnimationControls', () => {
  beforeEach(() => {
    useAppStore.setState({
      images: [
        { id: '1', src: 'data:image/png;base64,abc', width: 100, height: 100, file: new File([], 'test.png') },
        { id: '2', src: 'data:image/png;base64,def', width: 100, height: 100, file: new File([], 'test2.png') },
      ],
      sliderValue: 0,
      isAnimating: false,
      config: {
        duration: '60s',
        milestones: ['50'],
        timeMilestoneInputs: [''],
        milestoneMode: 'percentage',
        framework: 'script',
        imagePrefix: '/images/slider-',
        className: '',
        isCycling: false,
        startAt: '',
      },
    });
  });

  it('should render play button and slider', () => {
    render(<AnimationControls />);

    expect(screen.getByRole('button', { name: /run animation/i })).toBeInTheDocument();
    expect(screen.getByRole('slider', { name: /image merge slider/i })).toBeInTheDocument();
  });

  it('should have proper flexbox layout with vertical centering', () => {
    const { container } = render(<AnimationControls />);

    // Get the main container
    const mainContainer = container.querySelector('.flex.items-center');
    expect(mainContainer).toBeInTheDocument();
    expect(mainContainer).toHaveClass('items-center'); // Ensures vertical centering

    // Check button is properly aligned
    const button = container.querySelector('button');
    expect(button).toBeInTheDocument();
  });

  it('should display current image state label', () => {
    render(<AnimationControls />);

    expect(screen.getByText(/Showing Image 1/i)).toBeInTheDocument();
  });
});

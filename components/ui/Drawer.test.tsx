import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Drawer } from './Drawer';

describe('Drawer', () => {
  it('should render backdrop with blur when open', () => {
    const { container } = render(
      <Drawer isOpen={true} onClose={vi.fn()} title="Test Drawer">
        <div>Content</div>
      </Drawer>
    );

    // Backdrop should be visible
    const backdrop = container.querySelector('.fixed.inset-0.z-40');
    expect(backdrop).toBeInTheDocument();

    // Content should be visible
    expect(screen.getByText('Content')).toBeInTheDocument();
  });

  it('should hide drawer and backdrop when closed', () => {
    const { container } = render(
      <Drawer isOpen={false} onClose={vi.fn()} title="Test Drawer">
        <div>Content</div>
      </Drawer>
    );

    // Drawer should be in DOM but hidden with CSS
    const backdrop = container.querySelector('.fixed.inset-0');
    expect(backdrop).toBeInTheDocument();
    expect(backdrop).toHaveClass('opacity-0', 'pointer-events-none');

    // Content should be in DOM but hidden
    expect(screen.getByText('Content')).toBeInTheDocument();

    // Drawer panel should be translated off-screen
    const drawerPanel = container.querySelector('.translate-x-full');
    expect(drawerPanel).toBeInTheDocument();
  });

  it('should have proper transition classes when open', () => {
    const { container } = render(
      <Drawer isOpen={true} onClose={vi.fn()} title="Test Drawer">
        <div>Content</div>
      </Drawer>
    );

    // Check for slide transition
    const drawerPanel = container.querySelector('.transition-transform');
    expect(drawerPanel).toBeInTheDocument();
    expect(drawerPanel).toHaveClass('translate-x-0');
  });
});

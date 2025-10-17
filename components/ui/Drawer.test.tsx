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

  it('should hide when closed with pointer-events-none', () => {
    const { container } = render(
      <Drawer isOpen={false} onClose={vi.fn()} title="Test Drawer">
        <div>Content</div>
      </Drawer>
    );

    // Drawer should be in DOM but hidden
    const drawer = container.querySelector('.fixed');
    expect(drawer).toBeInTheDocument();
    expect(drawer).toHaveClass('pointer-events-none', 'opacity-0');
  });

  it('should have proper DaisyUI classes when open', () => {
    const { container } = render(
      <Drawer isOpen={true} onClose={vi.fn()} title="Test Drawer">
        <div>Content</div>
      </Drawer>
    );

    // Check for DaisyUI base classes
    const drawerContent = container.querySelector('.bg-base-200');
    expect(drawerContent).toBeInTheDocument();
    expect(drawerContent).toHaveClass('border-l', 'border-base-300');
  });
});

import { describe, it, expect, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useEmbedCode } from './useEmbedCode';
import { useAppStore } from '../../store';

describe('useEmbedCode', () => {
  beforeEach(() => {
    // Reset store before each test
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
        imagePrefix: '/images/slider-',
        className: '',
        isCycling: false,
      },
    });
  });

  it('should generate embed code when generateCode is called', () => {
    const { result } = renderHook(() => useEmbedCode());

    expect(result.current.generatedEmbedTag).toBeNull();

    act(() => {
      result.current.generateCode({
        duration: '30s',
        milestones: [{ value: '50' }],
        timeMilestoneInputs: [{ value: '' }],
        milestoneMode: 'percentage',
        imagePrefix: '/img/test-',
        className: 'custom-class',
        isCycling: true,
      });
    });

    expect(result.current.generatedEmbedTag).toBeTruthy();
    expect(result.current.generatedEmbedTag).toContain('data-duration="30s"');
    expect(result.current.generatedEmbedTag).toContain('data-class="custom-class"');
    expect(result.current.generatedEmbedTag).toContain('data-cycle="true"');
  });

  it('should maintain state across multiple hook instances', () => {
    const { result: result1 } = renderHook(() => useEmbedCode());
    const { result: result2 } = renderHook(() => useEmbedCode());

    act(() => {
      result1.current.generateCode({
        duration: '30s',
        milestones: [{ value: '50' }],
        timeMilestoneInputs: [{ value: '' }],
        milestoneMode: 'percentage',
        imagePrefix: '/img/test-',
        className: '',
        isCycling: false,
      });
    });

    // Second instance should see the same generated code
    expect(result2.current.generatedEmbedTag).toBeTruthy();
    expect(result2.current.generatedEmbedTag).toBe(result1.current.generatedEmbedTag);
  });
});

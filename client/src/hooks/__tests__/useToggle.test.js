import { renderHook, act } from '@testing-library/react';
import { useToggle } from '../useToggle';

describe('useToggle', () => {
  it('should initialize with default value (false)', () => {
    const { result } = renderHook(() => useToggle());
    
    const [value] = result.current;
    expect(value).toBe(false);
  });

  it('should initialize with custom value', () => {
    const { result } = renderHook(() => useToggle(true));
    
    const [value] = result.current;
    expect(value).toBe(true);
  });

  it('should toggle value', () => {
    const { result } = renderHook(() => useToggle(false));
    
    let [value, toggle] = result.current;
    expect(value).toBe(false);
    
    act(() => {
      toggle();
    });
    
    [value] = result.current;
    expect(value).toBe(true);
    
    act(() => {
      toggle();
    });
    
    [value] = result.current;
    expect(value).toBe(false);
  });

  it('should set value to true using setOn', () => {
    const { result } = renderHook(() => useToggle(false));
    
    const [, , setOn] = result.current;
    
    act(() => {
      setOn();
    });
    
    const [value] = result.current;
    expect(value).toBe(true);
  });

  it('should set value to false using setOff', () => {
    const { result } = renderHook(() => useToggle(true));
    
    const [, , , setOff] = result.current;
    
    act(() => {
      setOff();
    });
    
    const [value] = result.current;
    expect(value).toBe(false);
  });

  it('should work with multiple toggles independently', () => {
    const { result: result1 } = renderHook(() => useToggle(false));
    const { result: result2 } = renderHook(() => useToggle(true));
    
    act(() => {
      result1.current[1](); // toggle first
    });
    
    expect(result1.current[0]).toBe(true);
    expect(result2.current[0]).toBe(true);
    
    act(() => {
      result2.current[3](); // setOff second
    });
    
    expect(result1.current[0]).toBe(true);
    expect(result2.current[0]).toBe(false);
  });
});
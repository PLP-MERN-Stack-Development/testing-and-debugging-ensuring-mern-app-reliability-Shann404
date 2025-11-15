// client/src/tests/hooks/useForm.test.js
import { renderHook, act } from '@testing-library/react';
import useForm from '../../hooks/useForm';

describe('useForm Hook', () => {
  const initialValues = {
    name: '',
    email: '',
    password: ''
  };

  const validate = (values) => {
    const errors = {};
    if (!values.name) errors.name = 'Name is required';
    if (!values.email) errors.email = 'Email is required';
    if (!values.password) errors.password = 'Password is required';
    return errors;
  };

  test('should initialize with initial values', () => {
    const { result } = renderHook(() => useForm(initialValues, validate));
    
    expect(result.current.values).toEqual(initialValues);
    expect(result.current.errors).toEqual({});
    expect(result.current.isSubmitting).toBe(false);
  });

  test('should update values on change', () => {
    const { result } = renderHook(() => useForm(initialValues, validate));

    act(() => {
      result.current.handleChange({
        target: { name: 'name', value: 'John Doe' }
      });
    });

    expect(result.current.values.name).toBe('John Doe');
  });

  test('should validate on change', () => {
    const { result } = renderHook(() => useForm(initialValues, validate));

    act(() => {
      result.current.handleChange({
        target: { name: 'name', value: '' }
      });
    });

    expect(result.current.errors.name).toBe('Name is required');
  });

  test('should handle form submission', async () => {
    const onSubmit = jest.fn();
    const { result } = renderHook(() => 
      useForm(initialValues, validate, onSubmit)
    );

    // Fill form
    act(() => {
      result.current.handleChange({
        target: { name: 'name', value: 'John Doe' }
      });
      result.current.handleChange({
        target: { name: 'email', value: 'john@example.com' }
      });
      result.current.handleChange({
        target: { name: 'password', value: 'password123' }
      });
    });

    await act(async () => {
      await result.current.handleSubmit({
        preventDefault: jest.fn()
      });
    });

    expect(onSubmit).toHaveBeenCalledWith({
      name: 'John Doe',
      email: 'john@example.com',
      password: 'password123'
    });
  });

  test('should not submit invalid form', async () => {
    const onSubmit = jest.fn();
    const { result } = renderHook(() => 
      useForm(initialValues, validate, onSubmit)
    );

    await act(async () => {
      await result.current.handleSubmit({
        preventDefault: jest.fn()
      });
    });

    expect(onSubmit).not.toHaveBeenCalled();
    expect(result.current.errors.name).toBe('Name is required');
  });
});
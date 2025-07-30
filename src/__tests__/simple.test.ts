/**
 * Simple test to verify Jest is working correctly
 */

describe('Simple Test Suite', () => {
  beforeEach(() => {
    jest.useFakeTimers()
  })

  afterEach(() => {
    jest.useRealTimers()
  })

  it('should pass a basic test', () => {
    // Arrange
    const expected = 2;
    
    // Act
    const result = 1 + 1;
    
    // Assert
    expect(result).toBe(expected);
  });

  it('should handle string operations', () => {
    // Arrange
    const firstName = 'John';
    const lastName = 'Doe';
    
    // Act
    const fullName = `${firstName} ${lastName}`;
    
    // Assert
    expect(fullName).toBe('John Doe');
  });

  it('should handle array operations', () => {
    // Arrange
    const numbers = [1, 2, 3, 4, 5];
    
    // Act
    const sum = numbers.reduce((acc, num) => acc + num, 0);
    const doubled = numbers.map(num => num * 2);
    
    // Assert
    expect(sum).toBe(15);
    expect(doubled).toEqual([2, 4, 6, 8, 10]);
  });

  it('should handle async operations', async () => {
    // Arrange
    const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));
    
    // Act
    const startTime = Date.now();
    const delayPromise = delay(10);
    jest.advanceTimersByTime(10);
    await delayPromise;
    const endTime = Date.now();
    
    // Assert
    expect(endTime - startTime).toBeGreaterThanOrEqual(0);
  });
}); 
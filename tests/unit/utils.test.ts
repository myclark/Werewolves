import { describe, it, expect } from 'vitest'
import { cn } from '@/lib/utils/cn'

describe('Utility Functions', () => {
  describe('cn (className utility)', () => {
    it('should merge class names', () => {
      const result = cn('class1', 'class2')
      expect(result).toContain('class1')
      expect(result).toContain('class2')
    })

    it('should handle conditional classes', () => {
      const result = cn('base', true && 'conditional', false && 'ignored')
      expect(result).toContain('base')
      expect(result).toContain('conditional')
      expect(result).not.toContain('ignored')
    })

    it('should merge tailwind classes correctly', () => {
      const result = cn('p-4', 'p-6')
      // tailwind-merge should keep only the last padding
      expect(result).toBe('p-6')
    })

    it('should handle empty inputs', () => {
      const result = cn()
      expect(result).toBe('')
    })

    it('should handle undefined and null', () => {
      const result = cn('base', undefined, null, 'end')
      expect(result).toContain('base')
      expect(result).toContain('end')
    })

    it('should handle array of classes', () => {
      const result = cn(['class1', 'class2'])
      expect(result).toContain('class1')
      expect(result).toContain('class2')
    })

    it('should handle object notation', () => {
      const result = cn({
        'class1': true,
        'class2': false,
        'class3': true,
      })
      expect(result).toContain('class1')
      expect(result).toContain('class3')
      expect(result).not.toContain('class2')
    })
  })

  describe('Array utilities', () => {
    it('should check if array contains element', () => {
      const arr = ['a', 'b', 'c']
      expect(arr.includes('b')).toBe(true)
      expect(arr.includes('d')).toBe(false)
    })

    it('should filter array', () => {
      const numbers = [1, 2, 3, 4, 5]
      const evens = numbers.filter((n) => n % 2 === 0)
      expect(evens).toEqual([2, 4])
    })

    it('should map array', () => {
      const numbers = [1, 2, 3]
      const doubled = numbers.map((n) => n * 2)
      expect(doubled).toEqual([2, 4, 6])
    })

    it('should find element in array', () => {
      const items = [{ id: 1 }, { id: 2 }, { id: 3 }]
      const found = items.find((item) => item.id === 2)
      expect(found).toEqual({ id: 2 })
    })
  })

  describe('String utilities', () => {
    it('should capitalize string', () => {
      const capitalize = (str: string) =>
        str.charAt(0).toUpperCase() + str.slice(1)
      expect(capitalize('hello')).toBe('Hello')
    })

    it('should check string contains substring', () => {
      const str = 'Hello World'
      expect(str.includes('World')).toBe(true)
      expect(str.includes('world')).toBe(false)
    })

    it('should lowercase string', () => {
      expect('HELLO'.toLowerCase()).toBe('hello')
    })
  })

  describe('Math utilities', () => {
    it('should find maximum value', () => {
      expect(Math.max(1, 5, 3)).toBe(5)
    })

    it('should find minimum value', () => {
      expect(Math.min(1, 5, 3)).toBe(1)
    })

    it('should round up', () => {
      expect(Math.ceil(3.2)).toBe(4)
    })

    it('should round down', () => {
      expect(Math.floor(3.8)).toBe(3)
    })

    it('should generate random number in range', () => {
      const random = Math.floor(Math.random() * 10)
      expect(random).toBeGreaterThanOrEqual(0)
      expect(random).toBeLessThan(10)
    })
  })
})


import { describe, it, expect } from 'vitest';

export function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^\w\s-]/g, '') 
    .replace(/\s+/g, '-') 
    .replace(/--+/g, '-') 
    .trim();
}

export function countWords(content: any): number {
  if (typeof content === 'string') {
    return content.trim().split(/\s+/).filter(word => word.length > 0).length;
  }
  if (typeof content === 'object') {
    
    const textContent = JSON.stringify(content).replace(/[{}[\]",:]/g, ' ');
    return textContent.trim().split(/\s+/).filter(word => word.length > 0).length;
  }
  return 0;
}

describe('Blog Helpers', () => {
  describe('generateSlug', () => {
    it('should convert title to lowercase slug', () => {
      expect(generateSlug('This Is A Test')).toBe('this-is-a-test');
    });

    it('should remove special characters', () => {
      expect(generateSlug('Hello! World? & More...')).toBe('hello-world-more');
    });

    it('should replace spaces with hyphens', () => {
      expect(generateSlug('Multiple   Spaces    Here')).toBe('multiple-spaces-here');
    });

    it('should handle empty string', () => {
      expect(generateSlug('')).toBe('');
    });

    it('should handle string with only special characters', () => {
      expect(generateSlug('!@#$%^&*()')).toBe('');
    });

    it('should replace multiple consecutive hyphens', () => {
      expect(generateSlug('test---multiple---hyphens')).toBe('test-multiple-hyphens');
    });
  });

  describe('countWords', () => {
    it('should count words in a string', () => {
      expect(countWords('Hello world test')).toBe(3);
    });

    it('should handle empty string', () => {
      expect(countWords('')).toBe(0);
    });

    it('should handle string with extra spaces', () => {
      expect(countWords('  Hello   world   test  ')).toBe(3);
    });

    it('should count words in JSON object', () => {
      const jsonContent = { title: 'Test', content: 'Hello world' };
      expect(countWords(jsonContent)).toBe(4); 
    });

    it('should handle null/undefined', () => {
      expect(countWords(null)).toBe(0);
      expect(countWords(undefined)).toBe(0);
    });

    it('should handle numbers', () => {
      expect(countWords(123)).toBe(0);
    });
  });
});

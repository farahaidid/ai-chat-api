export const VectorType = new (class {
  to(value: number[]): string {
    return `[${value.join(',')}]`;
  }

  from(value: string): number[] {
    if (!value) return null;
    return JSON.parse(value.replace('[', '[').replace(']', ']'));
  }

  asType(): string {
    return 'vector';
  }
})();
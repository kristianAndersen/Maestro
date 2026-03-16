export const ROLES = {
  architect: {
    name: 'architect',
    description: 'Senior software architect. Focus on scalability, maintainability, clean design, and system boundaries. Consider long-term implications.',
  },
  pragmatist: {
    name: 'pragmatist',
    description: 'Practical engineer. Ship fast, keep it simple, avoid over-engineering. Focus on what works today with minimal complexity.',
  },
  critic: {
    name: 'critic',
    description: "Devil's advocate. Challenge assumptions, find edge cases, identify risks and failure modes. Push back on groupthink.",
  },
  security: {
    name: 'security',
    description: 'Security specialist. Identify vulnerabilities, attack surfaces, data exposure risks. Advocate for secure defaults.',
  },
  performance: {
    name: 'performance',
    description: 'Performance engineer. Identify speed bottlenecks, memory issues, scalability limits. Consider load patterns.',
  },
};

export const DEFAULT_COUNCIL = ['architect', 'pragmatist', 'critic'];

export function getRoles(roleNames) {
  return roleNames.map(name => {
    const role = ROLES[name];
    if (!role) throw new Error(`Unknown role: ${name}. Available: ${Object.keys(ROLES).join(', ')}`);
    return role;
  });
}

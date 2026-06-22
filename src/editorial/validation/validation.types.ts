export type ValidationLevel = 'info' | 'warning' | 'error' | 'blocking';

export type ValidationIssue = {
  level: ValidationLevel;
  code: string;
  message: string;
  sceneId?: string;
};

export type ValidationMode = 'preview' | 'strict';

export type ValidationResult = {
  ok: boolean;
  issues: ValidationIssue[];
};

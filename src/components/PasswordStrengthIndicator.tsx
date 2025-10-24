/**
 * Password Strength Indicator Component
 * Shows visual feedback for password strength
 */

'use client'

import { useMemo } from 'react'
import { validatePassword, getStrengthColor, getStrengthLabel } from '@/lib/password-validator'

interface PasswordStrengthIndicatorProps {
  password: string;
  showRequirements?: boolean;
}

export default function PasswordStrengthIndicator({ 
  password, 
  showRequirements = true 
}: PasswordStrengthIndicatorProps) {
  const validation = useMemo(() => {
    if (!password) return null;
    return validatePassword(password);
  }, [password]);

  if (!password || !validation) return null;

  const strengthColor = getStrengthColor(validation.strength);
  const strengthLabel = getStrengthLabel(validation.strength);
  const progressWidth = `${validation.score}%`;

  return (
    <div className="password-strength-indicator mt-2">
      {/* Progress Bar */}
      <div className="progress" style={{ height: '6px' }}>
        <div
          className={`progress-bar bg-${strengthColor}`}
          role="progressbar"
          style={{ width: progressWidth }}
          aria-valuenow={validation.score}
          aria-valuemin={0}
          aria-valuemax={100}
        />
      </div>

      {/* Strength Label */}
      <div className="mt-1">
        <small className={`text-${strengthColor}`}>
          <strong>Password Strength: {strengthLabel}</strong>
        </small>
      </div>

      {/* Requirements List */}
      {showRequirements && (
        <div className="mt-2">
          <small className="text-muted">Password Requirements:</small>
          <ul className="list-unstyled mb-0" style={{ fontSize: '0.85rem' }}>
            <RequirementItem 
              met={password.length >= 8} 
              text="At least 8 characters"
            />
            <RequirementItem 
              met={/[A-Z]/.test(password)} 
              text="One uppercase letter"
            />
            <RequirementItem 
              met={/[a-z]/.test(password)} 
              text="One lowercase letter"
            />
            <RequirementItem 
              met={/[0-9]/.test(password)} 
              text="One number"
            />
            <RequirementItem 
              met={/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)} 
              text="One special character"
            />
          </ul>
        </div>
      )}

      {/* Errors */}
      {validation.errors.length > 0 && (
        <div className="mt-2">
          {validation.errors.map((error, index) => (
            <div key={index} className="text-danger" style={{ fontSize: '0.85rem' }}>
              <small>• {error}</small>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

interface RequirementItemProps {
  met: boolean;
  text: string;
}

function RequirementItem({ met, text }: RequirementItemProps) {
  return (
    <li className={met ? 'text-success' : 'text-muted'}>
      <span className="me-1">{met ? '✓' : '○'}</span>
      {text}
    </li>
  );
}


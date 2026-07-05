'use client';

import { useId } from 'react';
import { USER_ROLES, type UserRole } from '@/lib/users-api';
import { ROLE_META } from './user-badges';

interface RoleSelectProps {
  label: string;
  value: UserRole;
  onChange: (v: UserRole) => void;
  helper?: string;
  disabled?: boolean;
}

export function RoleSelect({ label, value, onChange, helper, disabled }: RoleSelectProps) {
  const id = useId();
  return (
    <div className="space-y-1.5">
      <label htmlFor={id} className="block text-xs font-medium text-ink-200">
        {label}
      </label>
      <select
        id={id}
        value={value}
        onChange={(e) => onChange(e.target.value as UserRole)}
        disabled={disabled}
        className="ring-focus w-full rounded-md border border-white/10 bg-white/[0.03] px-3 py-2 text-sm text-ink-100 focus:outline-none focus:border-white/30 disabled:opacity-60 [&>option]:bg-ink-800"
      >
        {USER_ROLES.map((r) => (
          <option key={r} value={r}>
            {ROLE_META[r].label}
          </option>
        ))}
      </select>
      {helper && <p className="text-[11px] text-ink-500">{helper}</p>}
    </div>
  );
}

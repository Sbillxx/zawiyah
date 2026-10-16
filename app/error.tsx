'use client';

import React from 'react';
import DatabaseErrorView from './components/DatabaseErrorView';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return <DatabaseErrorView error={error} reset={reset} returnUrl="/" />;
}

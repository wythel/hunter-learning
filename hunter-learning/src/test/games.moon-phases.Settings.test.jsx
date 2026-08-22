import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { MantineProvider } from '@mantine/core';
import MoonPhasesSettings from '../games/moon-phases/Settings';

function renderPage() {
  return render(
    <MantineProvider>
      <MemoryRouter>
        <MoonPhasesSettings />
      </MemoryRouter>
    </MantineProvider>
  );
}

describe('MoonPhasesSettings', () => {
  it('shows the title and difficulty options', () => {
    const { getByText } = renderPage();
    expect(getByText('月相星球')).toBeTruthy();
    expect(getByText('簡單')).toBeTruthy();
    expect(getByText('困難')).toBeTruthy();
  });
});

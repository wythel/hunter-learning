import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { MantineProvider } from '@mantine/core';
import SolarSystemSettings from '../games/solar-system/Settings';

function renderPage() {
  return render(
    <MantineProvider>
      <MemoryRouter>
        <SolarSystemSettings />
      </MemoryRouter>
    </MantineProvider>
  );
}

describe('SolarSystemSettings', () => {
  it('shows the title and difficulty options', () => {
    const { getByText } = renderPage();
    expect(getByText('太陽系')).toBeTruthy();
    expect(getByText('簡單')).toBeTruthy();
    expect(getByText('困難')).toBeTruthy();
  });
});

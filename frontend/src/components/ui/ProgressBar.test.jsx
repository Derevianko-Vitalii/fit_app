import { render, screen } from '@testing-library/react';
import ProgressBar from './ProgressBar';

describe('ProgressBar', () => {
  it('виставляє коректні ARIA-атрибути', () => {
    render(<ProgressBar value={42} label="Прогрес цілі" />);

    const bar = screen.getByRole('progressbar', { name: 'Прогрес цілі' });

    expect(bar).toHaveAttribute('aria-valuenow', '42');
    expect(bar).toHaveAttribute('aria-valuemin', '0');
    expect(bar).toHaveAttribute('aria-valuemax', '100');
  });

  it('обрізає значення до діапазону 0..100', () => {
    const { rerender } = render(<ProgressBar value={150} />);
    expect(screen.getByRole('progressbar')).toHaveAttribute('aria-valuenow', '100');

    rerender(<ProgressBar value={-20} />);
    expect(screen.getByRole('progressbar')).toHaveAttribute('aria-valuenow', '0');
  });

  it('показує відсоток, коли увімкнено showLabel', () => {
    render(<ProgressBar value={75} showLabel />);

    expect(screen.getByText('75%')).toBeInTheDocument();
  });

  it('витримує некоректне значення', () => {
    render(<ProgressBar value={undefined} />);

    expect(screen.getByRole('progressbar')).toHaveAttribute('aria-valuenow', '0');
  });
});

import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Button from './Button';

describe('Button', () => {
  it('рендерить текст і має тип button за замовчуванням', () => {
    render(<Button>Зберегти</Button>);

    const button = screen.getByRole('button', { name: 'Зберегти' });

    expect(button).toBeInTheDocument();
    expect(button).toHaveAttribute('type', 'button');
  });

  it('викликає onClick при натисканні', async () => {
    const handleClick = jest.fn();
    const user = userEvent.setup();

    render(<Button onClick={handleClick}>Клік</Button>);

    await user.click(screen.getByRole('button'));

    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('блокується під час завантаження і не реагує на клік', async () => {
    const handleClick = jest.fn();
    const user = userEvent.setup();

    render(
      <Button isLoading onClick={handleClick}>
        Надіслати
      </Button>
    );

    const button = screen.getByRole('button');

    expect(button).toBeDisabled();

    await user.click(button);

    expect(handleClick).not.toHaveBeenCalled();
  });

  it('не реагує на клік у стані disabled', async () => {
    const handleClick = jest.fn();
    const user = userEvent.setup();

    render(
      <Button disabled onClick={handleClick}>
        Вимкнено
      </Button>
    );

    await user.click(screen.getByRole('button'));

    expect(handleClick).not.toHaveBeenCalled();
  });

  it('передає нативні атрибути далі', () => {
    render(
      <Button type="submit" aria-label="Підтвердити">
        OK
      </Button>
    );

    expect(screen.getByRole('button', { name: 'Підтвердити' })).toHaveAttribute('type', 'submit');
  });
});

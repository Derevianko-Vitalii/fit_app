/**
 * Типи цілей визначають, які блоки показує сторінка Progress
 * і в яких одиницях рахується прогрес.
 */
export const GOAL_TYPES = {
  distance: 'distance',
  weight: 'weight',
  duration: 'duration',
  count: 'count',
  streak: 'streak',
};

export const GOAL_TYPE_META = {
  [GOAL_TYPES.distance]: {
    label: 'Дистанція',
    unit: 'км',
    icon: '🏃',
    description: 'Пробігти або пройти задану відстань',
  },
  [GOAL_TYPES.weight]: {
    label: 'Вага',
    unit: 'кг',
    icon: '🏋️',
    description: 'Досягти цільової ваги або підняти вагу',
  },
  [GOAL_TYPES.duration]: {
    label: 'Тривалість',
    unit: 'хв',
    icon: '⏱️',
    description: 'Сумарний час тренувань',
  },
  [GOAL_TYPES.count]: {
    label: 'Повторення',
    unit: 'раз',
    icon: '💪',
    description: 'Кількість підходів, повторень або тренувань',
  },
  [GOAL_TYPES.streak]: {
    label: 'Серія днів',
    unit: 'дн',
    icon: '🔥',
    description: 'Тренуватись без пропусків задану кількість днів',
  },
};

export const GOAL_TYPE_LIST = Object.values(GOAL_TYPES);

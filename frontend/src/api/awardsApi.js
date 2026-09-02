import httpClient from './httpClient';
import { ENDPOINTS } from '@/constants';

export const fetchAwards = () => httpClient.get(ENDPOINTS.awards).then((res) => res.data);

export const fetchAwardById = (id) =>
  httpClient.get(ENDPOINTS.awardById(id)).then((res) => res.data);

/** Створення нагороди доступне лише адміністратору. */
export const createAward = (payload) =>
  httpClient.post(ENDPOINTS.awards, payload).then((res) => res.data);

export const updateAward = (id, payload) =>
  httpClient.put(ENDPOINTS.awardById(id), payload).then((res) => res.data);

export const deleteAward = (id) =>
  httpClient.delete(ENDPOINTS.awardById(id)).then((res) => res.data);

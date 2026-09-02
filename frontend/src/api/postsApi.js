import httpClient from './httpClient';
import { ENDPOINTS } from '@/constants';

/**
 * Повертає сторінку публікацій.
 * @param {object} params perPage, startPage, sort, user, award...
 * @returns {Promise<{ posts: object[], postsQuantity: number }>}
 */
export const fetchPosts = (params = {}) =>
  httpClient.get(ENDPOINTS.posts, { params }).then((res) => res.data);

export const fetchPostById = (id) => httpClient.get(ENDPOINTS.postById(id)).then((res) => res.data);

export const createPost = (payload) =>
  httpClient.post(ENDPOINTS.posts, payload).then((res) => res.data);

export const updatePost = (id, payload) =>
  httpClient.put(ENDPOINTS.postById(id), payload).then((res) => res.data);

/** Окремий ендпоінт лише для лічильника лайків. */
export const updatePostLikes = (id, likes) =>
  httpClient.patch(ENDPOINTS.postById(id), { likes }).then((res) => res.data);

export const deletePost = (id) => httpClient.delete(ENDPOINTS.postById(id)).then((res) => res.data);

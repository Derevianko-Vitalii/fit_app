import httpClient from './httpClient';
import { ENDPOINTS } from '@/constants';

export const fetchComments = () => httpClient.get(ENDPOINTS.comments).then((res) => res.data);

export const fetchCommentsByPost = (postId) =>
  httpClient.get(ENDPOINTS.commentsByPost(postId)).then((res) => res.data);

export const fetchCommentsByUser = (userId) =>
  httpClient.get(ENDPOINTS.commentsByUser(userId)).then((res) => res.data);

export const createComment = ({ post, content }) =>
  httpClient.post(ENDPOINTS.comments, { post, content }).then((res) => res.data);

export const updateComment = (id, payload) =>
  httpClient.put(ENDPOINTS.commentById(id), payload).then((res) => res.data);

export const deleteComment = (id) =>
  httpClient.delete(ENDPOINTS.commentById(id)).then((res) => res.data);

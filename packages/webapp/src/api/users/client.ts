import axios from 'axios'; // Assuming axios is configured globally or you have an instance
// import { User, CreateUserDto, UpdateUserDto, DeleteUserResponse } from '@/types/user'; // Assuming '@/types' alias is set up
import { User, CreateUserDto, UpdateUserDto, DeleteUserResponse } from '../../types/user'; // Use relative path

const API_BASE_URL = '/api/users'; // Adjust if your API prefix is different

// GET /users
export const getUsers = async (): Promise<User[]> => {
  const response = await axios.get<User[]>(`${API_BASE_URL}`);
  return response.data;
};

// GET /users/:id
export const getUserById = async (id: string): Promise<User> => {
  if (!id) throw new Error('User ID is required');
  const response = await axios.get<User>(`${API_BASE_URL}/${id}`);
  return response.data;
};

// POST /users
export const createUser = async (userData: CreateUserDto): Promise<User> => {
  const response = await axios.post<User>(`${API_BASE_URL}`, userData);
  return response.data;
};

// PATCH /users/:id
export const updateUser = async ({ id, ...updateData }: { id: string } & UpdateUserDto): Promise<User> => {
  if (!id) throw new Error('User ID is required');
  const response = await axios.patch<User>(`${API_BASE_URL}/${id}`, updateData);
  return response.data;
};

// DELETE /users/:id
export const deleteUser = async (id: string): Promise<DeleteUserResponse> => {
  if (!id) throw new Error('User ID is required');
  const response = await axios.delete<DeleteUserResponse>(`${API_BASE_URL}/${id}`);
  return response.data;
}; 
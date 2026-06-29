import { apiClient } from '@/lib/apiClient'
import type { Agent } from '../types/agents.types'
import type { AgentFormData } from '../schemas/agents.schema'

export interface CreateAgentResponse {
  agent: Agent
  // Dev-only: server returns the generated password while email delivery is stubbed.
  password: string
}

export async function getAgents(): Promise<Agent[]> {
  const response = await apiClient.get<Agent[]>('/agents')
  return response.data
}

export async function getAgent(id: number): Promise<Agent> {
  const response = await apiClient.get<Agent>(`/agents/${id}`)
  return response.data
}

export async function createAgent(data: AgentFormData): Promise<CreateAgentResponse> {
  const response = await apiClient.post<CreateAgentResponse>('/agents', data)
  return response.data
}

export async function updateAgent(id: number, data: AgentFormData): Promise<Agent> {
  const response = await apiClient.patch<Agent>(`/agents/${id}`, data)
  return response.data
}

export async function deleteAgent(id: number): Promise<void> {
  await apiClient.delete(`/agents/${id}`)
}

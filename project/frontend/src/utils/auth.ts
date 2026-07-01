import { ref } from 'vue';

export const token = ref<string | null>(localStorage.getItem('inmovel_token'));
export const user = ref<any>(JSON.parse(localStorage.getItem('inmovel_user') || '{}'));

export function setSession(newToken: string, newUser: any) {
  localStorage.setItem('inmovel_token', newToken);
  localStorage.setItem('inmovel_user', JSON.stringify(newUser));
  localStorage.setItem('inmovel_session_expires', (Date.now() + 3600000).toString());
  token.value = newToken;
  user.value = newUser;
}

export function clearSession() {
  localStorage.removeItem('inmovel_token');
  localStorage.removeItem('inmovel_user');
  localStorage.removeItem('inmovel_session_expires');
  token.value = null;
  user.value = {};
}

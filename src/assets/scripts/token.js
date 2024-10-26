import Cookies from 'js-cookie';
import config from '@/utils/config';
const {
  token_name,
  token_time
} = config;

//设置当前token
export function setToken(token, key) {
  if (key) {
    sessionStorage.setItem(key, token);
    Cookies.set(key, token);
  } else {
    let inFifteenMinutes = new Date(new Date().getTime() + token_time);
    sessionStorage.setItem(token_name, token);
    Cookies.set(token_name, token, {
      expires: inFifteenMinutes
    });
  }
}

//获取当前token
export const getToken = function (key) {
  const token = Cookies.get(key || token_name) ? Cookies.get(key || token_name) : sessionStorage.getItem(key || token_name);
  if (token) {
    return token;
  } else {
    return false;
  }
};

//清除当前token
export const removeToken = function (key) {
  if (typeof key === 'string') {
    sessionStorage.removeItem(key || token_name);
    Cookies.remove(key || token_name);
  }
  if (Array.isArray(key)) {
    key.forEach(item => {
      removeToken(item);
    })
  }
};

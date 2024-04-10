import { createStore } from 'vuex';
interface User {
  username: string;
  games: number;
  winRate: number;
}

interface State {
  user: User;
}

export default createStore({
  state: {
    user: {
      username: '',
      games: 0,
      winRate: 0,
    },
  } as State, // 指定state的类型为State
  mutations: {
    setUser(state: State, user: User) {
      state.user = user;
    },
  },
  actions: {
    updateUserInfo({ commit, state }: { commit: Function, state: State }, userInfo: User) {
      commit('setUser', userInfo);
    },
  },
});

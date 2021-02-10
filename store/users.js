const entityUrl = 'users'

export const state = () => ({
  items: [],
  loading: false,
  error: null,
})

export const getters = {}

export const actions = {
  asyncGetUsers({ commit }) {
    commit('toggleLoading')
    this.$axios
      .get(`/${entityUrl}`)
      .then(({ data }) => commit('setData', data))
      .catch((e) => commit('setError', e.message))
      .finally(() => commit('toggleLoading'))
  },
}

export const mutations = {
  toggleLoading(state) {
    state.loading = !state.loading
  },
  setData(state, payload = []) {
    state.items = payload
  },
  setError(state, error) {
    state.error = error
  },
}

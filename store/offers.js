const offersUrl = 'https://dreamcar-api.herokuapp.com/offers/'

export const state = () => ({
  items: [],
  error: '',
  loading: true,
})

export const actions = {
  async getOffers({ commit }) {
    commit('loadingStart')
    const result = await this.$axios.$get(`${offersUrl}`)
    commit('setOffers', result)
    commit('loadingStop')
  },
  async deleteOffer({ commit }, id) {
    const result = await this.$axios.$delete(`${offersUrl}` + id)
    commit('patchOffer', result)
  },
  async createOffer({ commit }, offer) {
    const result = await this.$axios.$post(`${offersUrl}`, offer)
    commit('newOffer', result)
  },
  async updateOffer({ commit }, offer) {
    if (offer.status === 'Открыто') offer.status = 'OPEN'
    const result = await this.$axios.$patch(`${offersUrl}` + offer.id, offer)
    commit('patchOffer', result)
  },
  clearErrorMessage({ commit }) {
    commit('clearError')
  },
  getError({ commit }, error) {
    commit('setError', error.response.data.message)
  },
  getGlobalError({ commit }, error) {
    commit('loadingStop')
    commit('setGlobalError', error)
  },
}

export const mutations = {
  setOffers(state, payload) {
    state.items = payload
  },
  newOffer(state, payload) {
    state.items.push(payload)
  },
  patchOffer(state, payload) {
    state.items = state.items.filter((offer) => offer.id !== payload.id)
    state.items.push(payload)
  },
  setError(state, payload) {
    state.error = payload
  },
  setGlobalError(state, payload) {
    state.error = payload
  },
  loadingStop(state) {
    state.loading = false
  },
  loadingStart(state) {
    state.loading = true
  },
  clearError(state) {
    state.error = ''
  },
}

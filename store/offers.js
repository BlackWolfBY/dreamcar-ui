import axios from 'axios'

export const state = () => ({
  items: [],
  error: '',
  loading: true,
})

export const actions = {
  getOffers({ commit }) {
    axios
      .get('http://localhost:8080/offers/')
      .then((response) => {
        commit('setOffers', response.data)
      })
      .catch((e) => commit('setError', e.response.data.message))
      .finally(() => commit('loading'))
  },
  deleteOffer({ commit }, id) {
    axios
      .delete('http://localhost:8080/offers/' + id)
      .then((response) => {
        commit('patchOffer', response.data)
      })
      .catch((e) => commit('setError', e.response.data.message))
  },
  createOffer({ commit }, offer) {
    axios
      .post('http://localhost:8080/offers/', offer)
      .then((response) => {
        commit('newOffer', response.data)
      })
      .catch((e) => commit('setError', e.response.data.message))
  },
  updateOffer({ commit }, offer) {
    axios
      .patch('http://localhost:8080/offers/' + offer.id, offer)
      .then((response) => {
        commit('patchOffer', response.data)
      })
      .catch((e) => commit('setError', e.response.data.message))
  },
  clearError({ commit }) {
    commit('clearErr')
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
  loading(state) {
    state.loading = false
  },
}

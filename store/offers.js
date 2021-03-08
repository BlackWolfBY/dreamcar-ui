import axios from 'axios'

const offersUrl = 'https://dreamcar-api.herokuapp.com/offers/'

export const state = () => ({
  items: [],
  error: '',
  loading: true,
})

export const actions = {
  getOffers({ commit }) {
    axios
      .get(`${offersUrl}`)
      .then((response) => {
        commit('setOffers', response.data)
      })
      .catch((e) => commit('setError', e.response.data.message))
      .finally(() => commit('loading'))
  },
  deleteOffer({ commit }, id) {
    axios
      .delete(`${offersUrl}` + id)
      .then((response) => {
        commit('patchOffer', response.data)
      })
      .catch((e) => commit('setError', e.response.data.message))
  },
  createOffer({ commit }, offer) {
    axios
      .post(`${offersUrl}`, offer)
      .then((response) => {
        commit('newOffer', response.data)
      })
      .catch((e) => commit('setError', e.response.data.message))
  },
  updateOffer({ commit }, offer) {
    if (offer.status === 'Открыто') offer.status = 'OPEN'
    axios
      .patch(`${offersUrl}` + offer.id, offer)
      .then((response) => {
        commit('patchOffer', response.data)
      })
      .catch((e) => commit('setError', e.response.data.message))
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

import axios from 'axios'

export const state = () => ({
  offers: [],
  error: null,
})

export const actions = {
  getOffers({ commit }) {
    this.loading = true
    axios.get('http://localhost:8080/offers/').then((response) => {
      commit('setOffers', response.data)
    })
  },
  deleteOffer({ commit }, id) {
    axios.delete('http://localhost:8080/offers/' + id).then((response) => {
      commit('patchOffer', response.data)
    })
  },
  createOffer({ commit }, offer) {
    axios.post('http://localhost:8080/offers/', offer).then((response) => {
      commit('newOffer', response.data)
    })
  },
  updateOffer({ commit }, offer) {
    axios
      .patch('http://localhost:8080/offers/' + offer.id, offer)
      .then((response) => {
        commit('patchOffer', response.data)
      })
  },
}

export const mutations = {
  setOffers(state, payload) {
    state.offers = payload
  },
  newOffer(state, payload) {
    state.offers.push(payload)
  },
  patchOffer(state, payload) {
    state.offers = state.offers.filter((offer) => offer.id !== payload.id)
    state.offers.push(payload)
  },
  setError(state, error) {
    state.error = error
  },
}

<template>
  <div>
    <v-data-table
      :headers="headers"
      :items="data"
      :items-per-page="5"
      :loading="loading"
      class="elevation-1"
    ></v-data-table>
  </div>
</template>

<script>
import { mapActions } from 'vuex'

export default {
  data() {
    return {
      headers: [
        { text: 'Name', value: 'name' },
        { text: 'Company', value: 'company.name' },
        { text: 'Email', value: 'email' },
        { text: 'Phone', value: 'phone' },
      ],
    }
  },
  computed: {
    data() {
      return this.$store.state.users.items
    },
    loading() {
      return this.$store.state.users.loading
    },
  },
  mounted() {
    this.loadUsers()
  },
  methods: mapActions({ loadUsers: 'users/asyncGetUsers' }),
}
</script>

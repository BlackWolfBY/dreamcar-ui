<template>
  <v-data-table
    :headers="headers"
    :items="offers"
    sort-by="id"
    class="elevation-1"
    :loading="loading"
    loading-text="Loading... Please wait"
    @click:row="itemClick"
  >
    <template #top>
      <v-toolbar flat>
        <v-toolbar-title>Offers</v-toolbar-title>
        <v-divider class="mx-4" inset vertical></v-divider>
        <v-spacer></v-spacer>
        <v-dialog v-model="dialog" max-width="1000px">
          <template #activator="{ on, attrs }">
            <v-btn color="primary" dark class="mb-2" v-bind="attrs" v-on="on">
              New Offer
            </v-btn>
          </template>
          <v-card>
            <v-card-title>
              <span class="headline">{{ formTitle }}</span>
            </v-card-title>

            <v-card-text>
              <v-container>
                <v-row>
                  <v-col cols="12" sm="6" md="4">
                    <v-text-field
                      v-model="editedItem.id"
                      label="Offer ID"
                      readonly
                    ></v-text-field>
                  </v-col>
                  <v-col cols="12" sm="6" md="4">
                    <v-text-field
                      v-model="editedItem.status"
                      label="Status"
                      readonly
                    ></v-text-field>
                  </v-col>
                  <v-col cols="12" sm="6" md="4">
                    <v-text-field
                      v-model="editedItem.requestId"
                      label="Request ID"
                      :readonly="disabled"
                    ></v-text-field>
                  </v-col>
                  <v-col cols="12" sm="6" md="4">
                    <v-text-field
                      v-model="editedItem.price"
                      type="number"
                      label="Price"
                      :readonly="disabled"
                    ></v-text-field>
                  </v-col>
                  <v-col cols="12" sm="6" md="4">
                    <v-text-field
                      v-model="editedItem.description"
                      label="Description"
                      :readonly="disabled"
                    ></v-text-field>
                  </v-col>
                  <v-col cols="12" sm="6" md="4">
                    <v-text-field
                      v-model="editedItem.createdAt"
                      label="Created at"
                      readonly
                    ></v-text-field>
                  </v-col>
                  <v-col cols="12" sm="6" md="4">
                    <v-text-field
                      v-model="editedItem.createdBy"
                      label="Created by"
                      :readonly="disabled"
                    ></v-text-field>
                  </v-col>
                  <v-col cols="12" sm="6" md="4">
                    <v-text-field
                      v-model="editedItem.updatedAt"
                      label="Updated At"
                      readonly
                    >
                    </v-text-field>
                  </v-col>
                  <v-col cols="12" sm="6" md="4">
                    <v-text-field
                      v-model="editedItem.updatedBy"
                      label="Updated By"
                      :readonly="disabled"
                    ></v-text-field>
                  </v-col>
                </v-row>
              </v-container>
            </v-card-text>

            <v-card-actions>
              <v-spacer></v-spacer>
              <v-btn color="blue darken-1" text @click="close"> Cancel </v-btn>
              <v-btn
                v-show="displaySave"
                color="blue darken-1"
                text
                @click="save"
              >
                Save
              </v-btn>
            </v-card-actions>
          </v-card>
        </v-dialog>

        <v-dialog v-model="dialogDelete" max-width="500px">
          <v-card>
            <v-card-title class="headline"
              >Are you sure you want to close this offer?</v-card-title
            >
            <v-card-actions>
              <v-spacer></v-spacer>
              <v-btn color="blue darken-1" text @click="closeDelete"
                >Cancel</v-btn
              >
              <v-btn color="blue darken-1" text @click="deleteItemConfirm"
                >OK</v-btn
              >
              <v-spacer></v-spacer>
            </v-card-actions>
          </v-card>
        </v-dialog>

        <v-dialog v-model="offerClosed" max-width="500px">
          <v-card>
            <v-card-title class="headline, justify-center">
              {{ closedTitle }}
            </v-card-title>
            <v-card-actions>
              <v-spacer></v-spacer>
              <v-btn color="blue darken-1" text @click="notEditable"
                >Cancel</v-btn
              >
              <v-spacer></v-spacer>
            </v-card-actions>
          </v-card>
        </v-dialog>
      </v-toolbar>
    </template>
    <template #[`item.createdAt`]="{ item }">
      <span>{{ new Date(item.createdAt).toLocaleString() }}</span>
    </template>
    <template #[`item.updatedAt`]="{ item }">
      <span>{{ new Date(item.updatedAt).toLocaleString() }}</span>
    </template>
    <template #[`item.actions`]="{ item }">
      <v-icon small class="mr-2" @click.stop="editItem(item)">
        mdi-pencil
      </v-icon>
      <v-icon small @click.stop="deleteItem(item)"> mdi-delete </v-icon>
    </template>
    <template #no-data>
      <v-btn color="primary" @click="initialize"> Reset </v-btn>
    </template>
  </v-data-table>
</template>

<script>
import { mapActions } from 'vuex'
export default {
  data: () => ({
    dialog: false,
    dialogDelete: false,
    offerClosed: false,
    loading: true,
    disabled: false,
    closedTitle: '',
    display: false,
    displaySave: true,
    headers: [
      {
        text: 'Offer ID',
        align: 'start',
        value: 'id',
      },
      { text: 'Status', value: 'status' },
      { text: 'Request ID', value: 'requestId' },
      { text: 'Price', value: 'price' },
      { text: 'Description', value: 'description' },
      { text: 'Created At', value: 'createdAt' },
      { text: 'Created By', value: 'createdBy' },
      { text: 'Updated At', value: 'updatedAt' },
      { text: 'Updated By', value: 'updatedBy' },
      { text: 'Actions', value: 'actions', sortable: false },
    ],
    editedIndex: -1,
    editedItem: {
      id: '',
      status: '',
      requestId: '',
      price: 0,
      description: '',
      createdAt: '',
      createdBy: '',
      updatedAt: '',
      updatedBy: '',
    },
    defaultItem: {
      id: '',
      status: '',
      requestId: '',
      price: 0,
      description: '',
      createdAt: '',
      createdBy: '',
      updatedAt: '',
      updatedBy: '',
    },
  }),

  computed: {
    formTitle() {
      if (this.display === true) return 'Display Offer'
      else return this.editedIndex === -1 ? 'New Offer' : 'Edit Offer'
    },
    offers() {
      return this.$store.state.offers.offers
    },
  },

  watch: {
    dialog(val) {
      val || this.close()
    },
    dialogDelete(val) {
      val || this.closeDelete()
    },
    offerClosed(val) {
      val || this.notEditable()
    },
  },

  mounted() {
    this.loading = true
    this.getOffers().then(() => {
      this.loading = false
    })
  },

  methods: {
    ...mapActions({
      getOffers: 'offers/getOffers',
      deleteOffer: 'offers/deleteOffer',
      createOffer: 'offers/createOffer',
      updateOffer: 'offers/updateOffer',
    }),
    initialize() {
      this.offers = this.$store.state.offers.offers
    },
    itemClick(item) {
      this.editedIndex = this.offers.indexOf(item)
      this.editedItem = Object.assign({}, item)
      this.editedItem.createdAt = new Date(
        this.editedItem.createdAt
      ).toLocaleString()
      this.editedItem.updatedAt = new Date(
        this.editedItem.updatedAt
      ).toLocaleString()
      this.display = true
      this.disabled = true
      this.dialog = true
      this.displaySave = false
    },
    editItem(item) {
      this.editedIndex = this.offers.indexOf(item)
      this.editedItem = Object.assign({}, item)
      if (this.editedItem.status === 'CLOSE') {
        this.closedTitle = 'This offer is closed and can not be edited.'
        this.offerClosed = true
        return
      }
      this.editedItem.createdAt = new Date(
        this.editedItem.createdAt
      ).toLocaleString()
      this.editedItem.updatedAt = new Date(
        this.editedItem.updatedAt
      ).toLocaleString()
      this.dialog = true
    },
    deleteItem(item) {
      this.editedIndex = this.offers.indexOf(item)
      this.editedItem = Object.assign({}, item)
      if (this.editedItem.status === 'CLOSE') {
        this.closedTitle = 'This offer has already been closed.'
        this.offerClosed = true
        return
      }
      this.dialogDelete = true
    },
    deleteItemConfirm() {
      this.deleteOffer(this.editedItem.id)
      this.closeDelete()
    },
    close() {
      this.dialog = false
      this.$nextTick(() => {
        this.editedItem = Object.assign({}, this.defaultItem)
        this.editedIndex = -1
        this.display = false
        this.disabled = false
        this.displaySave = true
      })
    },
    closeDelete() {
      this.dialogDelete = false
      this.$nextTick(() => {
        this.editedItem = Object.assign({}, this.defaultItem)
        this.editedIndex = -1
      })
    },
    notEditable() {
      this.offerClosed = false
      this.$nextTick(() => {
        this.editedItem = Object.assign({}, this.defaultItem)
        this.editedIndex = -1
      })
    },
    save() {
      if (this.editedIndex > -1) {
        this.updateOffer(this.editedItem)
      } else {
        this.createOffer(this.editedItem)
      }
      this.close()
    },
  },
}
</script>

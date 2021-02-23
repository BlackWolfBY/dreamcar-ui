<template>
  <v-data-table
    :headers="headers"
    :items="offers"
    :loading="loading"
    loading-text="Loading... Please wait"
    sort-by="id"
    class="elevation-1"
    @click:row="itemClick"
  >
    <template #top>
      <v-toolbar flat>
        <v-toolbar-title>Offers </v-toolbar-title>
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
                      @blur="$v.editedItem.requestId.$touch()"
                    ></v-text-field>
                    <div
                      v-if="!$v.editedItem.requestId.required"
                      class="errorUI"
                    >
                      Field is required
                    </div>
                  </v-col>
                  <v-col cols="12" sm="6" md="4">
                    <v-text-field
                      v-model="editedItem.price"
                      type="number"
                      min="0"
                      label="Price"
                      :readonly="disabled"
                      @blur="$v.editedItem.price.$touch()"
                    ></v-text-field>
                    <div v-if="!$v.editedItem.price.error" class="errorUI">
                      <template v-if="!$v.editedItem.price.required">
                        Field is required
                      </template>
                      <template v-if="!$v.editedItem.price.numeric">
                        Only numbers can be entered
                      </template>
                    </div>
                  </v-col>
                  <v-col cols="12" sm="6" md="4">
                    <v-text-field
                      v-model="editedItem.description"
                      label="Description"
                      :readonly="disabled"
                      @blur="$v.editedItem.description.$touch()"
                    ></v-text-field>
                    <div
                      v-if="!$v.editedItem.description.maxLength"
                      class="errorUI"
                    >
                      Max number of characters is
                      {{ $v.editedItem.description.$params.maxLength.max }}
                    </div>
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
                type="submit"
                color="blue darken-1"
                text
                :disabled="$v.$invalid"
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

        <v-dialog :value="error" max-width="500px">
          <v-alert
            type="error"
            style="margin-bottom: 0px"
            class="text-center"
            elevation="8"
            prominent
          >
            Server error: {{ error }}
          </v-alert>
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
import { mapActions, mapState } from 'vuex'
import { required, numeric, maxLength } from 'vuelidate/lib/validators'
import { validationMixin } from 'vuelidate'

export default {
  mixins: [validationMixin],
  data: () => ({
    dialog: false,
    dialogDelete: false,
    offerClosed: false,
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
      price: '',
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
      price: '',
      description: '',
      createdAt: '',
      createdBy: '',
      updatedAt: '',
      updatedBy: '',
    },
  }),

  validations: {
    editedItem: {
      price: {
        required,
        numeric,
      },
      requestId: {
        required,
      },
      description: {
        maxLength: maxLength(200),
      },
    },
  },

  computed: {
    formTitle() {
      if (this.display === true) return 'Display Offer'
      else return this.editedIndex === -1 ? 'New Offer' : 'Edit Offer'
    },
    ...mapState({
      offers: (state) => state.offers.items,
      error: (state) => state.offers.error,
      loading: (state) => state.offers.loading,
    }),
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
    this.getOffers()
  },

  methods: {
    ...mapActions({
      getOffers: 'offers/getOffers',
      deleteOffer: 'offers/deleteOffer',
      createOffer: 'offers/createOffer',
      updateOffer: 'offers/updateOffer',
    }),
    initialize() {
      this.getOffers()
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

<style scoped>
.errorUI {
  font-size: 8pt;
  color: red;
  background: transparent !important;
}
</style>

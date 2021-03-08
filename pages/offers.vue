<template>
  <v-data-table
    :headers="headers"
    :items="offers"
    :loading="loading"
    :loading-text="messages.loading"
    sort-by="id"
    class="elevation-1"
    :footer-props="{
      itemsPerPageAllText: dialogLabels.itemsAllText,
      itemsPerPageText: dialogLabels.itemsPerPage,
    }"
    @click:row="itemClick"
  >
    <template #top>
      <v-toolbar flat>
        <v-toolbar-title>{{ dialogLabels.offers }}</v-toolbar-title>
        <v-divider class="mx-4" inset vertical></v-divider>
        <v-spacer></v-spacer>
        <v-dialog v-model="dialog" max-width="1000px">
          <template #activator="{ on, attrs }">
            <v-btn color="primary" dark class="mb-2" v-bind="attrs" v-on="on">
              {{ dialogLabels.newOffer }}
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
                      :label="dialogLabels.offerId"
                      readonly
                    ></v-text-field>
                  </v-col>
                  <v-col cols="12" sm="6" md="4">
                    <v-text-field
                      v-model="editedItem.status"
                      :label="dialogLabels.status"
                      readonly
                    ></v-text-field>
                  </v-col>
                  <v-col cols="12" sm="6" md="4">
                    <v-text-field
                      v-model="editedItem.requestId"
                      :label="dialogLabels.requestId"
                      :readonly="disabled"
                      @blur="$v.editedItem.requestId.$touch()"
                    ></v-text-field>
                    <div
                      v-if="!$v.editedItem.requestId.required"
                      class="errorUI"
                    >
                      {{ messages.requiredField }}
                    </div>
                  </v-col>
                  <v-col cols="12" sm="6" md="4">
                    <v-text-field
                      v-model="editedItem.price"
                      type="number"
                      min="0"
                      :label="dialogLabels.price"
                      :readonly="disabled"
                      @blur="$v.editedItem.price.$touch()"
                    ></v-text-field>
                    <div v-if="!$v.editedItem.price.error" class="errorUI">
                      <template v-if="!$v.editedItem.price.required">
                        {{ messages.requiredField }}
                      </template>
                      <template v-if="!$v.editedItem.price.numeric">
                        {{ messages.onlyNumbers }}
                      </template>
                    </div>
                  </v-col>
                  <v-col cols="12" sm="6" md="4">
                    <v-text-field
                      v-model="editedItem.description"
                      :label="dialogLabels.description"
                      :readonly="disabled"
                      @blur="$v.editedItem.description.$touch()"
                    ></v-text-field>
                    <div
                      v-if="!$v.editedItem.description.maxLength"
                      class="errorUI"
                    >
                      {{
                        messages.maxNumber +
                        $v.editedItem.description.$params.maxLength.max
                      }}
                    </div>
                  </v-col>
                  <v-col cols="12" sm="6" md="4">
                    <v-text-field
                      v-model="editedItem.createdAt"
                      :label="dialogLabels.createdAt"
                      readonly
                    ></v-text-field>
                  </v-col>
                  <v-col cols="12" sm="6" md="4">
                    <v-text-field
                      v-model="editedItem.createdBy"
                      :label="dialogLabels.createdBy"
                      :readonly="disabled"
                    ></v-text-field>
                  </v-col>
                  <v-col cols="12" sm="6" md="4">
                    <v-text-field
                      v-model="editedItem.updatedAt"
                      :label="dialogLabels.updatedAt"
                      readonly
                    >
                    </v-text-field>
                  </v-col>
                  <v-col cols="12" sm="6" md="4">
                    <v-text-field
                      v-model="editedItem.updatedBy"
                      :label="dialogLabels.updatedBy"
                      :readonly="disabled"
                    ></v-text-field>
                  </v-col>
                </v-row>
              </v-container>
            </v-card-text>

            <v-card-actions>
              <v-spacer></v-spacer>
              <v-btn color="blue darken-1" text @click="close">
                {{ dialogLabels.cancel }}
              </v-btn>
              <v-btn
                v-show="displaySave"
                type="submit"
                color="blue darken-1"
                text
                :disabled="$v.$invalid"
                @click="save"
              >
                {{ dialogLabels.save }}
              </v-btn>
            </v-card-actions>
          </v-card>
        </v-dialog>

        <v-dialog v-model="dialogDelete" max-width="600px">
          <v-card>
            <v-card-title class="headline, justify-center">{{
              messages.sureToClose
            }}</v-card-title>
            <v-card-actions>
              <v-spacer></v-spacer>
              <v-btn color="blue darken-1" text @click="closeDelete">{{
                dialogLabels.cancel
              }}</v-btn>
              <v-btn color="blue darken-1" text @click="deleteItemConfirm">{{
                dialogLabels.yes
              }}</v-btn>
              <v-spacer></v-spacer>
            </v-card-actions>
          </v-card>
        </v-dialog>

        <v-dialog v-model="offerClosed" max-width="600px">
          <v-card>
            <v-card-title class="headline, justify-center">
              {{ closedTitle }}
            </v-card-title>
            <v-card-actions>
              <v-spacer></v-spacer>
              <v-btn color="blue darken-1" text @click="notEditable">{{
                dialogLabels.cancel
              }}</v-btn>
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
            {{ messages.serverError + error }}
          </v-alert>
        </v-dialog>
      </v-toolbar>
    </template>
    <template #[`item.createdAt`]="{ item }">
      <span>{{ dateTransformer(item.createdAt) }}</span>
    </template>
    <template #[`item.updatedAt`]="{ item }">
      <span>{{ dateTransformer(item.updatedAt) }}</span>
    </template>
    <template #[`item.status`]="{ item }">
      <span>{{ offerStatus(item.status) }}</span>
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
    headers() {
      return [
        {
          text: this.$t('common.fieldLabels.offerId'),
          align: 'start',
          value: 'id',
        },
        { text: this.$t('common.fieldLabels.status'), value: 'status' },
        { text: this.$t('common.fieldLabels.requestId'), value: 'requestId' },
        { text: this.$t('common.fieldLabels.price'), value: 'price' },
        {
          text: this.$t('common.fieldLabels.description'),
          value: 'description',
        },
        { text: this.$t('common.fieldLabels.createdAt'), value: 'createdAt' },
        { text: this.$t('common.fieldLabels.createdBy'), value: 'createdBy' },
        { text: this.$t('common.fieldLabels.updatedAt'), value: 'updatedAt' },
        { text: this.$t('common.fieldLabels.updatedBy'), value: 'updatedBy' },
        {
          text: this.$t('common.fieldLabels.actions'),
          value: 'actions',
          sortable: false,
        },
      ]
    },
    dialogLabels() {
      return {
        offerId: this.$t('common.fieldLabels.offerId'),
        status: this.$t('common.fieldLabels.status'),
        requestId: this.$t('common.fieldLabels.requestId'),
        price: this.$t('common.fieldLabels.price'),
        description: this.$t('common.fieldLabels.description'),
        createdAt: this.$t('common.fieldLabels.createdAt'),
        createdBy: this.$t('common.fieldLabels.createdBy'),
        updatedAt: this.$t('common.fieldLabels.updatedAt'),
        updatedBy: this.$t('common.fieldLabels.updatedBy'),
        itemsPerPage: this.$t('common.fieldLabels.itemsPerPage'),
        itemsAllText: this.$t('common.fieldLabels.itemsAllText'),
        displayOffer: this.$t('offers.offerDialog.displayOffer'),
        offers: this.$t('offers.offerDialog.offers'),
        newOffer: this.$t('offers.offerDialog.newOffer'),
        editOffer: this.$t('offers.offerDialog.editOffer'),
        cancel: this.$t('common.buttons.cancel'),
        save: this.$t('common.buttons.save'),
        yes: this.$t('common.buttons.yes'),
      }
    },
    messages() {
      return {
        uneditableOffer: this.$t('offers.offerMessages.uneditableOffer'),
        closedOffer: this.$t('offers.offerMessages.closedOffer'),
        sureToClose: this.$t('offers.offerMessages.sureToClose'),
        requiredField: this.$t('common.messages.requiredField'),
        onlyNumbers: this.$t('common.messages.onlyNumbers'),
        maxNumber: this.$t('common.messages.maxNumber'),
        loading: this.$t('common.messages.loading'),
        serverError: this.$t('common.messages.serverError'),
      }
    },
    offerStatus() {
      return (status) => {
        if (status === 'OPEN') return this.$t('common.fieldLabels.openStatus')
        if (status === 'CLOSE') return this.$t('common.fieldLabels.closeStatus')
      }
    },
    dateTransformer() {
      return (date) => {
        return new Date(date).toLocaleString()
      }
    },
    formTitle() {
      if (this.display === true) return this.dialogLabels.displayOffer
      else
        return this.editedIndex === -1
          ? this.dialogLabels.newOffer
          : this.dialogLabels.editOffer
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
      this.editedItem.createdAt = this.dateTransformer(
        this.editedItem.createdAt
      )
      this.editedItem.updatedAt = this.dateTransformer(
        this.editedItem.updatedAt
      )
      this.editedItem.status = this.offerStatus(this.editedItem.status)
      this.display = true
      this.disabled = true
      this.dialog = true
      this.displaySave = false
    },
    editItem(item) {
      this.editedIndex = this.offers.indexOf(item)
      this.editedItem = Object.assign({}, item)
      if (this.editedItem.status === 'CLOSE') {
        this.closedTitle = this.messages.uneditableOffer
        this.offerClosed = true
        return
      }
      this.editedItem.createdAt = this.dateTransformer(
        this.editedItem.createdAt
      )
      this.editedItem.updatedAt = this.dateTransformer(
        this.editedItem.updatedAt
      )
      this.editedItem.status = this.offerStatus(this.editedItem.status)
      this.dialog = true
    },
    deleteItem(item) {
      this.editedIndex = this.offers.indexOf(item)
      this.editedItem = Object.assign({}, item)
      if (this.editedItem.status === 'CLOSE') {
        this.closedTitle = this.messages.closedOffer
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

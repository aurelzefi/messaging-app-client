<template>
  <div class="antialiased flex flex-col items-center">
    <confirm v-if="modal.show" :data="modal" :hide="() => modal.show = false"></confirm>

    <router-link class="fixed top-0 left-0 ml-2 mt-2 p-2 rounded-md hover:bg-gray-200" to="/home">
      <svg class="chevron-left w-8 h-8 text-gray-700" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clip-rule="evenodd"></path></svg>
    </router-link>

    <div class="mt-16 border rounded-md border-gray-200"  style="width: 36rem;">
      <div class="p-3 bg-gray-200">
        Picture
      </div>

      <div class="p-3 text-sm">
        <div class="p-4 bg-green-500 text-white rounded" v-if="pictureForm.success">
          The profile picture has been updated.
        </div>

        <div class="p-4 bg-red-500 text-white rounded" v-if="pictureForm.errors.picture">
          {{ pictureForm.errors.picture }}
        </div>

        <div class="flex flex-col items-center mt-4">
            <img class="w-40 h-40 rounded-full" :src="picture($bus.user)">

            <input class="hidden" type="file" ref="picture" @change="updatePicture">
            <button class="px-4 py-2 mt-4 bg-gray-800 hover:bg-gray-700 rounded text-white focus:outline-none" type="button" @click="openFileBrowser">Update</button>
        </div>
      </div>
    </div>

    <div class="mt-8 border rounded-md border-gray-200" style="width: 36rem;">
      <div class="p-3 bg-gray-200">
        Information
      </div>

      <div class="p-3 text-sm">
        <div class="p-4 bg-green-500 text-white rounded" v-if="informationForm.success">
          The account information has been updated.
        </div>

        <form @submit.prevent="updateInformation">
          <div class="mt-4">
            <div class="w-full flex items-center">
              <div class="w-1/3">
                <label class="block pr-4 text-gray-700 text-right" for="name">Name</label>
              </div>

              <div class="w-2/3">
                <input class="w-full mt-1 px-3 py-2 border border-gray-300 rounded outline-none focus:border-gray-400" :class="{ 'border-red-700': this.informationForm.errors.name }"  id="name" type="text" v-model="informationForm.name"> 
              </div>
            </div>

            <div class="w-full flex">
              <div class="w-1/3"></div>
              <div class="w-2/3"> 
                <span class="text-xs text-red-700">{{ this.informationForm.errors.name }}</span>
              </div>
            </div>
          </div>

          <div class=" mt-4">
            <div class="w-full flex items-center">
              <div class="w-1/3">
                <label class="block pr-4 text-gray-700 text-right self-auto" for="email">Email</label>
              </div>

              <div class="w-2/3">
                <input class="w-full mt-1 px-3 py-2 border border-gray-300 rounded outline-none focus:border-gray-400" :class="{ 'border-red-700': this.informationForm.errors.email }"  id="email" type="text" v-model="informationForm.email"> 
              </div>
            </div>

            <div class="w-full flex">
              <div class="w-1/3"></div>
              <div class="w-2/3"> 
                <span class="text-xs text-red-700">{{ this.informationForm.errors.email }}</span>
              </div>
            </div>
          </div>

          <div class="w-full flex mt-4">
            <div class="w-1/3"></div>
            <div class="w-2/3">
              <button class="py-2 px-4 bg-gray-800 hover:bg-gray-700 rounded text-white focus:outline-none" type="submit">Update</button>
            </div>
          </div>
        </form>
      </div>
    </div>

    <div class="mt-8 border rounded-md border-gray-200" style="width: 36rem;">
      <div class="p-3 bg-gray-200">
        Password
      </div>

      <div class="p-3 text-sm">
        <div class="p-4 bg-green-500 text-white rounded" v-if="passwordForm.success">
          The password has been updated.
        </div>

        <form @submit.prevent="updatePassword">
          <div class="mt-4">
            <div class="w-full flex items-center">
              <div class="w-1/3">
                <label class="block pr-4 text-gray-700 text-right" for="password">Password</label>
              </div>

              <div class="w-2/3">
                <input class="w-full mt-1 px-3 py-2 border border-gray-300 rounded outline-none focus:border-gray-400" :class="{ 'border-red-700': this.passwordForm.errors.password }"  id="password" type="password" v-model="passwordForm.password"> 
              </div>
            </div>

            <div class="w-full flex">
              <div class="w-1/3"></div>
              <div class="w-2/3"> 
                <span class="text-xs text-red-700">{{ this.passwordForm.errors.password }}</span>
              </div>
            </div>
          </div>

          <div class="mt-4">
            <div class="w-full flex items-center">
              <div class="w-1/3">
                <label class="block pr-4 text-gray-700 text-right" for="new-password">New Password</label>
              </div>

              <div class="w-2/3">
                <input class="w-full mt-1 px-3 py-2 border border-gray-300 rounded outline-none focus:border-gray-400" :class="{ 'border-red-700': this.passwordForm.errors.new_password }"  id="new-password" type="password" v-model="passwordForm.new_password"> 
              </div>
            </div>

            <div class="w-full flex">
              <div class="w-1/3"></div>
              <div class="w-2/3"> 
                <span class="text-xs text-red-700">{{ this.passwordForm.errors.new_password }}</span>
              </div>
            </div>
          </div>

          <div class="mt-4">
            <div class="w-full flex items-center">
              <div class="w-1/3">
                <label class="block pr-4 text-gray-700 text-right" for="new-password-confirmation">Confirm New Password</label>
              </div>

              <div class="w-2/3">
                <input class="w-full mt-1 px-3 py-2 border border-gray-300 rounded outline-none focus:border-gray-400" :class="{ 'border-red-700': this.passwordForm.errors.new_password_confirmation }"  id="new-password-confirmation" type="password" v-model="passwordForm.new_password_confirmation"> 
              </div>
            </div>

            <div class="w-full flex">
              <div class="w-1/3"></div>
              <div class="w-2/3"> 
                <span class="text-xs text-red-700">{{ this.passwordForm.errors.new_password_confirmation }}</span>
              </div>
            </div>
          </div>

          <div class="w-full flex mt-4">
            <div class="w-1/3"></div>
            <div class="w-2/3">
              <button class="py-2 px-4 bg-gray-800 hover:bg-gray-700 rounded text-white focus:outline-none" type="submit">Update</button>
            </div>
          </div>
        </form>
      </div>
    </div>

    <div class="my-8 border rounded-md border-gray-200" style="width: 36rem;">
      <div class="p-3 bg-gray-200">
        Delete Account
      </div>

      <div class="p-3 text-sm">
        <div class="p-4 bg-orange-200 text-orange-800 rounded-md">
          This action will delete all your data and is not reversible.
        </div>

        <button class="px-4 py-2 mt-4 bg-red-600 hover:bg-red-500 rounded text-white focus:outline-none" type="button" @click="openDeleteAccountModal">
          Delete Account
        </button>
      </div>
    </div>
  </div>
</template>

<script>
import Confirm from '../components/Confirm.vue'

export default {
  components: { Confirm },

  /**
   * The component's data.
   */
  data() {
    return {
      pictureForm: {
        errors: {},
        success: false
      },

      informationForm: {
        name: this.$bus.user.name,
        email: this.$bus.user.email,
        errors: {},
        success: false
      },

      passwordForm: {
        password: '',
        new_password: '',
        new_password_confirmation: '',
        errors: {},
        success: false
      },

      modal: {
        show: false,
        title: '',
        body: '',
        method: null
      }
    }
  },

  methods: {
    /**
     * Update the picture.
     */
    updatePicture() {
      this.pictureForm.errors = {}
      this.pictureForm.success = false
      
      const formData = new FormData()
      
      formData.append('picture', this.$refs.picture.files[0])
      
      this.$http.post('/api/user/picture', formData)
        .then((response) => {
          this.$bus.user = response.data
          this.pictureForm.success = true
        })
        .catch((error) => {
          this.pictureForm.errors = this.formatErrors(error.response.data.errors)
        });
    },
    
    /**
     * Update the information.
     */
    updateInformation() {
      this.informationForm.errors = {}
      this.informationForm.success = false
      
      this.$http.put('/api/user', this.informationForm)
        .then((response) => {
          this.$bus.user = response.data
          this.informationForm.success = true
        })
        .catch((error) => {
          this.informationForm.errors = this.formatErrors(error.response.data.errors)
        });
    },

    /**
     * Update the password.
     */
    updatePassword() {
      this.passwordForm.errors = {}
      this.passwordForm.success = false
      
      this.$http.put('/api/user/password', this.passwordForm)
        .then((response) => {
          this.$bus.user = response.data
          this.passwordForm.success = true

          this.passwordForm.password = ''
          this.passwordForm.new_password = ''
          this.passwordForm.new_password_confirmation = ''
        })
        .catch((error) => {
          this.passwordForm.errors = this.formatErrors(error.response.data.errors)
        });
    },

    /**
     * Delete the account.
     */
    deleteAccount() {
      this.$http.delete('/api/user')
        .then(() => {
          this.handleAfterLogout()
        })
    },

    /**
     * Open the modal to delete the account.
     */
    openDeleteAccountModal() {
      this.modal.show = true
      this.modal.title = 'Delete Account'
      this.modal.body = 'Are you sure you want to delete your account?'
      this.modal.method = this.deleteAccount
    },

    /**
     * Open the file browser.
     */
    openFileBrowser() {
      this.$refs.picture.click()
    },
  } 
}
</script>

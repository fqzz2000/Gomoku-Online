<template>
    <div class="container">
      <div class="row">
        <div class="col-md-6">
          <h2>Profile</h2>
          <ProfileBlock :user="user" :enableEdit="false" />
        </div>
        <div class="col-md-6">
          <h2>Update Info</h2>
          <b-form @submit.prevent="updateProfile">
            <b-form-group label="Update Name:" label-for="input-name">
              <b-form-input id="input-name" v-model="form.name" required placeholder="Please input your name"></b-form-input>
            </b-form-group>
            <b-form-group label = "Input Old Password: " label-for="input-old-password">
              <b-form-input id="input-old-password" type="password" v-model="form.password" required placeholder="Please input your password"></b-form-input>
            </b-form-group>
            <b-form-group label="Input New Password:" label-for="input-password">
              <b-form-input id="input-password" type="password" v-model="form.newPassword" required placeholder="Please input your password"></b-form-input>
            </b-form-group>
            <b-form-group label="Verify New Password:" label-for="input-confirm-password">
                <b-form-input id="input-confirm-password" 
                type="password" 
                v-model="form.confirmedPassword"
                :class="{'is-invalid': !passwordMatch}"
                required 
                placeholder="Please input your password"></b-form-input>
            </b-form-group>
            <div v-if="!passwordMatch" class="invalid-feedback" style="display: block;">
                Password inconsistent
            </div>
            <b-form-group label="Update Email:" label-for="input-email">
              <b-form-input id="input-email" type="email" v-model="form.email" required placeholder="Please input your email"></b-form-input>
            </b-form-group>
            <b-button type="submit" variant="primary">Submit</b-button>
          </b-form>
        </div>
      </div>
    </div>
</template>

<script setup lang="ts">
    import { computed, ref } from 'vue';
    import ProfileBlock from './ProfileBlock.vue';
    const user = ref({
        avatar: '/public/uploads/avatar.png',

      name: '张三',
      games: 10,
        winRate: 70,
    });
    const form = ref({
      name: '',
      password: '',
      email: '',
      newPassword: '',
      confirmedPassword: ''
    });

    const passwordMatch = computed(() => form.value.newPassword === form.value.confirmedPassword);
    function updateProfile() {
      user.value.name = form.value.name;
    }
</script>

<style>
  .is-invalid {
    border-color: red;
  }
  .invalid-feedback {
  color: red;
  font-size: 0.875em;
}
</style>
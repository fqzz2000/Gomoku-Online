<!-- <template>
<b-card no-body class="mb-1" header="The User">
    <b-card-body class="text-center">
      <b-avatar variant="info" size="4rem" class="mb-2" :src="props.user.avatar"></b-avatar>
      <p>Name: {{ props.user.name }}</p>
      <p>Games: {{ props.user.games }}</p>
      <p>Win Rate: {{ props.user.winRate.toFixed(2) }}%</p>
    </b-card-body>
  </b-card>
</template> -->

<template>
    <b-card class="mb-3 shadow-sm" header="User Profile" header-bg-variant="primary" header-text-variant="white" align="center">
      <b-avatar :src="user.avatar" size="6rem" class="mb-3" @click="triggerFileInput"></b-avatar>
      <!-- Hidden file input for selecting files -->
      <b-form-file v-if = "enableUpload"
        type="file"
        ref="fileInput"
        @change="handleFileChange"
      />
      <b-card-text>
        <h5>{{ user.name }}</h5>
        <p>Games Played: {{ user.games }}</p>
        <p>Win Rate: {{ user.winRate.toFixed(2) }}%</p>
        <p v-if="user.email">Email: {{ user.email }}</p>
      </b-card-text>
      <b-button v-if="enableEdit" variant="primary" @click="toEdit">Edit Profile</b-button>

    </b-card>
  </template>
<script setup lang="ts">
    import { ref, defineProps } from 'vue';
    import { useRouter } from 'vue-router';
    const router = useRouter();
    const emit = defineEmits(['avatar-updated']);
    const props = defineProps<{
        user: {
            avatar: string;
            name: string;
            games: number;
            winRate: number;
            email?: string;
        };
        enableEdit: boolean;
        enableUpload: boolean;
    }>();


    // Reference to the file input element
const fileInput = ref(null);

// Function to simulate clicking the file input
function triggerFileInput() {
  console.log("triggerFileInput");
  if (props.enableUpload) {
    fileInput.value.click();
  }
}

// Function to handle file selection and upload
async function handleFileChange(event) {
  const file = event.target.files[0];
  if (file) {
    const formData = new FormData();
    formData.append('avatar', file);

    try {
      // TODO: Replace the URL with your actual upload API endpoint
      let response = await fetch('/api/upload-avatar', {
        method: 'POST',
        body: formData,
      })
      let res = await response.json()
      let data = res.data;
      // Assuming the server responds with the URL of the uploaded image
      console.log(res.filename);
      // emit a custom event to notify the parent component
      emit('avatar-updated', "/public/uploads/"+res.filename);
    } catch (error) {
      console.error('Error uploading file:', error);
    }
  
}
}
// push to edit profile page with user as props
async function toEdit() {
  console.log("toEdit");
  await router.push({name : "Profile"});
}

</script>
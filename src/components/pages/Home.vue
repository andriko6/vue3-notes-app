<template>
  <BaseComponent :activePage="'home'">
    <template v-slot:page-label>
			<span class="logo">
				<b>Notes</b>
			</span>
    </template>
    <template v-slot:filter></template>
    <template v-slot:action-button></template>
    <template v-slot:notes-unavailable>
			<span>
				<Notes />
				<h2 class="clickable" @click="newNote">Anything to add?</h2>
			</span>
    </template>
  </BaseComponent>
</template>

<script>
import BaseComponent from "../Base.vue";
import Notes from '../icons/Notes.vue';

export default {
  components: {
    BaseComponent, Notes
  },
  methods: {
    newNote() {
      this.$store.commit("noteDialogIsVisible", true);
    }
  }
}
</script>

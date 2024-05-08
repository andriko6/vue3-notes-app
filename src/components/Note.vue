<template>
  <div v-if="noteNotEmpty" @click="editNote" :class="['note', theme, font]">
    <div class="preset">{{ preset }}</div>

    <h3 v-if="title" class="title">{{ title }}</h3>
    <p class="text">{{ text }}</p>
    <div class="date">
      <span class="date-title">Created: </span>
      <span>{{ convertDate(createDate) }}</span>
    </div>
    <div class="date">
      <span class="date-title">Updated: </span>
      <span>{{ convertDate(updateDate) }}</span>
    </div>
  </div>
</template>

<script>
export default {
  name: "Note",
  props: {
    id: {
      type: String,
      required: true,
    },
    title: {
      type: String,
      required: true,
    },
    text: {
      type: String,
      required: true,
    },
    createDate: {
      type: String,
      required: true,
    },
    updateDate: {
      type: String,
      required: true,
    },
    theme: {
      type: String,
      required: true
    },
    preset: {
      type: String,
      required: true
    },
    font: {
      type: String,
      required: true
    },
    favourite: {
      type: Boolean,
      required: true
    }
  },
  methods: {
    editNote() {
      this.$store.commit({
        type: "editNote",
        id: this.id,
        title: this.title,
        text: this.text,
        theme: this.theme,
        font: this.font,
        favourite: this.favourite,
        preset: this.preset,
      })

      this.$store.commit("noteIsNew", false);
      this.$store.commit("noteDialogIsVisible", true);
    },

    convertDate(date) {
      return new Date(date).toLocaleDateString('en-US', { year: 'numeric', month: 'long',
        day: 'numeric', hour: 'numeric', minute: 'numeric', second: 'numeric' });
    }
  },
  computed: {
    noteNotEmpty() {
      return this.title !== "" || this.text !== "";
    },
  }
};
</script>

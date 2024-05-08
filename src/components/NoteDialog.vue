<template>
  <form :class="['note-dialog', noteDialogClasses]">
    <div class="note-content">
      <div class="action-buttons">
        <button @click.prevent="closeNoteDialog"><ArrowLeft/></button>

        <div class="sorting-buttons">
          <span class="preset-selector">
            <label for="preset">Select Category:</label>
            <select id="preset" class="selector" v-model="selectedPreset" @change="updatePreset">
              <option value="important">Important</option>
              <option value="vip">VIP</option>
              <option value="urgent">Urgent</option>
            </select>
          </span>
          <button @click.prevent="toggleFavourite" :disabled="trashIsOpen" class="favourite-button">
            <HeartFilled v-if="$store.state.noteIsFavourite" />
            <HeartOutlined v-else />
          </button>
        </div>
      </div>

      <div class="user-inputs">
        <!-- Note title -->
        <input v-model="currentTitle"
               type="text"
               placeholder="Title"
               :disabled="trashIsOpen"
               @focus="closeOtherActions"
               @keydown="enterTextarea"
               spellcheck="false"
               class="note-title"
        />

        <!-- Note text content -->
        <textarea v-model="currentNote"
                  ref="textarea"
                  placeholder="Your note"
                  :disabled="trashIsOpen"
                  @focus="closeOtherActions"
                  spellcheck="false"
                  class="note-text">
				</textarea>
      </div>
    </div>

    <div class="note-options">
			<span v-if="!trashIsOpen" @click="toggleFontDropdown" class="font-select-button">
				Font family	<ChevronDown :style="rotateArrow" />
			</span>

      <button v-if="!trashIsOpen" @click.prevent="togglePalette" title="Background colour">
        <Palette />
      </button>

      <button v-if="!trashIsOpen" @click.prevent="trashNote" :disabled="$store.state.isNoteEmpty" title="Delete">
        <Delete />
      </button>

      <button v-if="trashIsOpen" @click.prevent="deleteNote" title="Delete forever">
        <Delete />
      </button>

      <button v-if="trashIsOpen" @click.prevent="restoreNote" title="Restore">
        <Restore />
      </button>

      <ul v-if="fontDropdownVisible" class="font-selection-dropdown">
        <li v-for="fontStyle in fontStyles" :key="fontStyle.className"
            :class="fontClasses(fontStyle.className)"
            @click="fontChange(fontStyle.className)">
          {{ fontStyle.name }}
        </li>
      </ul>

      <div v-if="paletteVisible" class="palette-container">
        <div class="palette comical-shadow-idle">
          <div class="solid-colours">
            <b>Solid</b>
            <div class="theme-buttons">
              <button v-for="solid in colorsSolid" :key="solid"
                      :class="activeTheme(solid)"
                      @click.prevent="themeChange(solid, false)">
              </button>
            </div>
          </div>

          <div class="gradient-colours">
            <b>Gradient</b>
            <div class="theme-buttons">
              <button v-for="gradient in colorsGradient" :key="gradient"
                      :class="activeTheme(gradient)"
                      @click.prevent="themeChange(gradient, true)">
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </form>
</template>

<script>
import { fontStyles, colorsSolid, colorsGradient } from "../store/themeProps";
import ChevronDown from './icons/ChevronDown.vue';
import ArrowLeft from './icons/ArrowLeft.vue';
import Delete from './icons/Delete.vue';
import HeartFilled from './icons/HeartFilled.vue';
import HeartOutlined from './icons/HeartOutlined.vue';
import Palette from './icons/Palette.vue';
import Restore from './icons/Restore.vue';

export default {
  components: { ArrowLeft, HeartOutlined, HeartFilled, Delete, ChevronDown, Palette, Restore },
  name: "NoteDialog",
  props: {
    activePage: {
      type: String,
      required: true
    },

    fontDropdownVisible: {
      type: Boolean,
      required: true
    },

    paletteVisible: {
      type: Boolean,
      required: true
    }
  },

  emits: [
    "toggle-font-dropdown",
    "hide-font-dropdown",
    "toggle-palette",
    "hide-palette",
    "delete-note",
    "is-theme-gradient"
  ],

  data() {
    return {
      selectedPreset: "",
    }
  },

  methods: {
    toggleFontDropdown() {
      if (this.paletteVisible) {
        this.hidePalette();
      }
      this.$emit("toggle-font-dropdown");
    },
    togglePalette() {
      if (this.fontDropdownVisible) {
        this.hideFontDropdown();
      }
      this.$emit("toggle-palette");
    },
    hideFontDropdown() {
      this.$emit("hide-font-dropdown");
    },
    hidePalette() {
      this.$emit("hide-palette");
    },
    closeOtherActions() {
      if (this.fontDropdownVisible) {
        this.hideFontDropdown();
      }

      if (this.paletteVisible) {
        this.hidePalette();
      }
    },
    closeNoteDialog() {
      this.closeOtherActions();
      this.$store.dispatch("exitNote", this.activePage);
    },
    toggleFavourite() {
      this.closeOtherActions();
      this.$store.commit("toggleFavourite");
    },
    enterTextarea(e) {
      if (e.key === "Enter" || e.key === "NumpadEnter") {
        e.preventDefault();
        this.$refs.textarea.focus();
      }
    },
    activeTheme(theme) {
      let activeThemeName = theme;
      if (activeThemeName === "dark") {
        activeThemeName = "default-theme-button";
      }
      return this.$store.state.noteTheme === theme ? `${activeThemeName} active-theme` : activeThemeName;
    },
    themeChange(theme, isGradient) {
      this.$emit("is-theme-gradient", isGradient);
      this.$store.commit("setNoteTheme", theme);
    },
    fontChange(font) {
      this.$store.commit("setNoteFont", font);
    },
    fontClasses(fontClass) {
      return fontClass === this.$store.state.noteFont ? `${fontClass} chosen-font` :fontClass;
    },
    trashNote() {
      this.closeOtherActions();
      this.$store.dispatch("moveToTrash");
    },
    deleteNote() {
      this.$emit("delete-note", "one");
    },
    restoreNote() {
      this.$store.dispatch("restoreFromTrash");
    },
    updatePreset(v) {
      this.$store.commit("setNotePreset", this.selectedPreset);
    }
  },
  computed: {
    noteDialogClasses() {
      const state = this.$store.state;
      const classes = [state.noteTheme, state.noteFont, state.isNoteDialogVisible ? "note-dialog-visible" : ""];
      return classes;
    },
    rotateArrow() {
      return this.fontDropdownVisible ? "transform: rotate(180deg)" : "transform: rotate(0)";
    },
    trashIsOpen() {
      return this.activePage === "trash";
    },
    currentTitle: {
      get() {
        return this.$store.state.noteTitle;
      },
      set(title) {
        this.$store.commit("setNoteTitle", title);
      }
    },
    currentNote: {
      get() {
        return this.$store.state.noteText;
      },
      set(text) {
        this.$store.commit("setNoteText", text);
      }
    }
  },
  mounted() {
    this.fontStyles = fontStyles;
    this.colorsSolid = colorsSolid;
    this.colorsGradient = colorsGradient;

    this.$watch(() => [this.noteDialogClasses[3]], () => {
      this.selectedPreset = this.$store.state.notePreset;
    })
  }
}
</script>

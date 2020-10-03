window.Vue = require("vue");
const { allLanguages, topLanguages: toplangs } = require("./languages");

new Vue({
  el: "#app",

  data() {
    return {
      topLanguages: [...toplangs],
      languages: allLanguages,
      results: [],
      emojis: [],
      page: 1,
      isFilterToggled: false,
      isFetching: false,
      showViewMore: false,
      noReplyOnly: false,
      selectedLanguage: "any",
      selectedSort: "newest",
    };
  },

  methods: {
    loadIssues() {
      console.log(this.selectedLanguage, "noreply-", this.noReplyOnly);
      this.isFetching = true;
      fetch("https://api.github.com/emojis")
        .then((response) => response.json())
        .then((emojisResponse) => (this.emojis = emojisResponse))
        .then(() =>
          fetch(
            `https://api.github.com/search/issues?page=${
              this.page
            }&q=language:${
              this.filterLanguage
            }+label:hacktoberfest+type:issue+state:open+${this.noReplyOnly &&
              "comments:0"}`
          )
        )
        .then((response) => response.json())
        .then((issuesResponse) => {
          let newResults = issuesResponse.items.map(
            ({ repository_url, updated_at, labels, ...rest }) => ({
              ...rest,
              labels: labels.map((label) => ({
                ...label,
                parsedName: this.insertEmojis(label.name),
              })),
              repoTitle: repository_url
                .split("/")
                .slice(-2)
                .join("/"),
              repository_url: repository_url,
              formattedDate: `${new Date(
                updated_at
              ).toLocaleDateString()}, ${new Date(
                updated_at
              ).toLocaleTimeString()}`,
            })
          );
          if (this.selectedLanguage !== "any") {
            this.results = [...newResults];
          } else if (this.noReplyOnly === true) {
            this.results = [...newResults];
          } else {
            this.results = [...this.results, ...newResults];
          }
          this.page = this.page + 1;
          this.showViewMore = true;
          this.isFetching = false;

          if (issuesResponse.items.length === 0) {
            // case when all the issues are already loaded
            this.showViewMore = false;
          }
        })
        .catch((error) => {
          this.showViewMore = false;
          this.isFetching = false;
        });
    },
    invertColor(hex, bw = 1) {
      if (hex.indexOf("#") === 0) {
        hex = hex.slice(1);
      }
      // convert 3-digit hex to 6-digits.
      if (hex.length === 3) {
        hex = hex[0] + hex[0] + hex[1] + hex[1] + hex[2] + hex[2];
      }
      if (hex.length !== 6) {
        throw new Error("Invalid HEX color.");
      }
      var r = parseInt(hex.slice(0, 2), 16),
        g = parseInt(hex.slice(2, 4), 16),
        b = parseInt(hex.slice(4, 6), 16);
      if (bw) {
        // http://stackoverflow.com/a/3943023/112731
        return r * 0.299 + g * 0.587 + b * 0.114 > 186 ? "#000000" : "#FFFFFF";
      }
      // invert color components
      r = (255 - r).toString(16);
      g = (255 - g).toString(16);
      b = (255 - b).toString(16);
      // pad each with zeros and return
      return "#" + padZero(r) + padZero(g) + padZero(b);
    },
    insertEmojis(label) {
      for (let [emoji, url] of Object.entries(this.emojis)) {
        label = label.replace(`:${emoji}:`, `<img src="${url}" class="h-4" />`);
      }

      return label;
    },

    applyFilter() {
      this.results = [];
      this.showViewMore = false;
      this.isFetching = false;
      this.page = 1;
      this.loadIssues();
    },

    searchLanguages(event) {
      let searched = event.target.value;

      if (searched.length === 0) {
        this.resetTopLanguages();
      } else {
        this.topLanguages = this.languages.filter(
          (lang) => lang.toLowerCase().indexOf(searched.toLowerCase()) > -1
        );
      }
    },

    closeLanguageSearch(event) {
      this.resetTopLanguages();
      this.isFilterToggled = false;
    },

    toggleFilter() {
      this.isFilterToggled = !this.isFilterToggled;
    },

    toggleNoReplyFilter(value) {
      console.log(value);
      this.noReplyOnly = value;
      this.applyFilter();
    },

    resetTopLanguages() {
      this.topLanguages = toplangs;
    },

    // If not clicking the toggleFilter or the languageFilter
    // within that, then close the filter
    onClickOutside(event) {
      if (
        event.target.id !== "toggleFilter" &&
        event.target.id !== "languageSearch"
      ) {
        this.closeLanguageSearch();
      }
    },
  },

  computed: {
    filterLanguage() {
      console.log(this.selectedLanguage);
      return this.selectedLanguage
        .split("+")
        .join("%2B")
        .split("#")
        .join("%23")
        .toLowerCase();
    },
  },

  mounted() {
    this.loadIssues();
    document.addEventListener("click", this.onClickOutside);
  },

  destroyed() {
    document.removeEventListener("click", this.onClickOutside);
  },
});

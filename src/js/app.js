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

      selectedLanguage: "any",
      selectedSort: "newest",
    };
  },

  methods: {
    loadIssues() {
      this.isFetching = true;

      fetch("https://api.github.com/emojis")
        .then((response) => response.json())
        .then((emojisResponse) => (this.emojis = emojisResponse))
        .then(() =>
          fetch(
            `https://api.github.com/search/issues?page=${
              this.page
            }&q=language:${
              this.selectedLanguage
            }+label:hacktoberfest+type:issue+state:open+${this.selectedSort ===
              "noReplies" && "comments:0"}+created:2020`
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

          this.results = [...this.results, ...newResults];

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

  watch: {
    selectedLanguage() {
      this.applyFilter();
    },
    selectedSort() {
      this.applyFilter();
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
